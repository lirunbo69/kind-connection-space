import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`OpenRouter error (${res.status}):`, text);
    throw new Error(`AI 服务错误 (${res.status})`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateImage(apiKey: string, model: string, prompt: string): Promise<string> {
  // OpenRouter uses /v1/chat/completions with modalities for image generation
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "black-forest-labs/flux-schnell",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Image generation error (${res.status}):`, text);
    throw new Error("图片生成失败");
  }

  const data = await res.json();
  console.log("Image response structure:", JSON.stringify(data).substring(0, 500));
  
  // Extract image from response - OpenRouter returns images in content array
  const content = data.choices?.[0]?.message?.content;
  
  // If content is a string with markdown image, extract URL
  if (typeof content === "string") {
    const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (mdMatch) return mdMatch[1];
    // If it's a plain URL
    if (content.startsWith("http")) return content.trim();
  }
  
  // If content is an array (multimodal response)
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.type === "image_url" && part.image_url?.url) {
        return part.image_url.url;
      }
      if (part.type === "image" && part.url) {
        return part.url;
      }
    }
  }

  // Check for image in the response data directly
  if (data.data?.[0]?.url) return data.data[0].url;
  if (data.data?.[0]?.b64_json) return `data:image/png;base64,${data.data[0].b64_json}`;

  console.error("Could not extract image from response:", JSON.stringify(data).substring(0, 1000));
  return "";
}

// Replace {{var}} placeholders in template
function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

    const body = await req.json();
    const { productName, productDescription, keywords, market, language, titleLimit, imageCount, templates } = body;

    if (!productName || !productDescription) {
      return new Response(
        JSON.stringify({ error: "产品名称和描述为必填项" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const marketName = { MX: "墨西哥", BR: "巴西", CL: "智利", CO: "哥伦比亚", AR: "阿根廷", UY: "乌拉圭" }[market as string] || market || "墨西哥";
    const langName = language || "西班牙语";
    const charLimit = titleLimit || "60";
    const imgCount = Math.min(Math.max(parseInt(imageCount) || 3, 1), 6);

    // Build a map of templates by name
    const tplMap: Record<string, { content: string; model: string }> = {};
    if (templates && Array.isArray(templates)) {
      for (const t of templates) {
        tplMap[t.template_name] = { content: t.template_content, model: t.model };
      }
    }

    // Common variables for template rendering
    const baseVars: Record<string, string> = {
      product_name: productName,
      product_description: productDescription,
      keywords: keywords || "无",
      market: marketName,
      language: langName,
      title_limit: charLimit,
      image_count: String(imgCount),
    };

    // Helper: get template or fallback
    const getTemplate = (name: string, fallbackContent: string, fallbackModel: string) => {
      const tpl = tplMap[name];
      return tpl ? { content: tpl.content, model: tpl.model } : { content: fallbackContent, model: fallbackModel };
    };

    const DEFAULT_TEXT_MODEL = "google/gemini-2.5-flash";
    const DEFAULT_IMAGE_MODEL = "black-forest-labs/flux-schnell";

    // ===== Step 1: 卖点分析 =====
    const step1 = getTemplate("卖点分析",
      `你是美客多（Mercado Libre）资深运营专家。请根据以下产品信息，提取5个核心卖点。每个卖点一行，不带编号，简洁有力。只输出卖点内容，不要其他文字。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n输出语言: {{language}}`,
      DEFAULT_TEXT_MODEL);
    const step1Prompt = renderTemplate(step1.content, baseVars);

    const sellingPointsRaw = await callOpenRouter(apiKey, step1.model, [
      { role: "user", content: step1Prompt },
    ]);
    const sellingPoints = sellingPointsRaw
      .split("\n")
      .map((s: string) => s.replace(/^\d+[\.\)、]\s*/, "").trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 5);

    const varsWithSP = { ...baseVars, selling_points: sellingPoints.join("\n") };

    // ===== Step 2: 标题生成 =====
    const step2 = getTemplate("标题生成",
      `你是美客多SEO标题专家。根据产品信息和卖点，生成一个SEO优化的商品标题，最多{{title_limit}}个字符。只输出标题本身，不要引号或其他文字。使用{{language}}。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n\n核心卖点:\n{{selling_points}}`,
      DEFAULT_TEXT_MODEL);
    const title = (await callOpenRouter(apiKey, step2.model, [
      { role: "user", content: renderTemplate(step2.content, varsWithSP) },
    ])).trim();

    const varsWithTitle = { ...varsWithSP, title };

    // ===== Step 3: 描述生成 =====
    const step3 = getTemplate("描述生成",
      `你是美客多商品描述文案专家。根据产品信息和卖点，撰写300-500字的详细商品描述。要求有吸引力、包含规格参数、解答买家常见疑虑。使用{{language}}，段落清晰。只输出描述正文。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n\n核心卖点:\n{{selling_points}}\n标题: {{title}}`,
      DEFAULT_TEXT_MODEL);
    const description = (await callOpenRouter(apiKey, step3.model, [
      { role: "user", content: renderTemplate(step3.content, varsWithTitle) },
    ])).trim();

    // ===== Step 4: 主图生成 =====
    const step4 = getTemplate("主图生成",
      `Professional e-commerce product photo of {{product_name}}, {{product_description}}, white background, studio lighting, high quality, 4k`,
      DEFAULT_IMAGE_MODEL);
    let mainImage = "";
    try {
      const imagePrompt = renderTemplate(step4.content, baseVars);
      mainImage = await generateImage(apiKey, step4.model, imagePrompt);
    } catch (e) {
      console.error("Main image generation failed:", e);
    }

    // ===== Step 5: 轮播图规划 =====
    const step5 = getTemplate("轮播图规划",
      `你是电商视觉策划专家。请为该商品规划{{image_count}}张轮播图的内容方案。每张图一行描述拍摄角度/展示重点。不带编号，只输出规划内容。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n\n核心卖点:\n{{selling_points}}`,
      DEFAULT_TEXT_MODEL);
    const carouselPlanRaw = await callOpenRouter(apiKey, step5.model, [
      { role: "user", content: renderTemplate(step5.content, varsWithSP) },
    ]);
    const carouselPlan = carouselPlanRaw
      .split("\n")
      .map((s: string) => s.replace(/^\d+[\.\)、]\s*/, "").trim())
      .filter((s: string) => s.length > 0)
      .slice(0, imgCount);

    // ===== Step 6: 轮播图生成 =====
    const step6 = getTemplate("轮播图生成",
      `Professional e-commerce product photo: {{carousel_plan_item}}. Product: {{product_name}}. Clean background, studio lighting, high quality`,
      DEFAULT_IMAGE_MODEL);
    const carouselImages: string[] = [];
    for (const plan of carouselPlan) {
      try {
        const imgPrompt = renderTemplate(step6.content, { ...baseVars, carousel_plan_item: plan });
        const img = await generateImage(apiKey, step6.model, imgPrompt);
        if (img) carouselImages.push(img);
      } catch (e) {
        console.error("Carousel image generation failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        sellingPoints,
        title,
        description,
        mainImage,
        carouselPlan,
        carouselImages,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-listing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "未知错误" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
