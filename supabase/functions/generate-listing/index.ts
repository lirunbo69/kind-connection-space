import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Unified OpenRouter call — supports both text-only and multimodal (text + base64/URL images).
 * All steps go through the user's own OpenRouter API key.
 */
async function callOpenRouter(
  apiKey: string,
  model: string,
  textPrompt: string,
  images?: string[],
  extraBody?: Record<string, unknown>,
) {
  const validImages = (images || []).filter((img) => typeof img === "string" && img.length > 0);

  let messages: any[];
  if (validImages.length > 0) {
    // Multimodal: text + images (base64 data URLs or remote URLs both accepted)
    const content: any[] = [{ type: "text", text: textPrompt }];
    for (const img of validImages) {
      content.push({ type: "image_url", image_url: { url: img } });
    }
    messages = [{ role: "user", content }];
  } else {
    messages = [{ role: "user", content: textPrompt }];
  }

  const body: any = { model, messages, ...extraBody };

  console.log(`[OpenRouter] model=${model}, images=${validImages.length}, promptLen=${textPrompt.length}`);

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`OpenRouter error (${res.status}):`, text);
    if (res.status === 429) throw new Error("OpenRouter 速率限制，请稍后重试");
    if (res.status === 402) throw new Error("OpenRouter 余额不足，请充值");
    throw new Error(`AI 服务错误 (${res.status}): ${text.substring(0, 200)}`);
  }

  return await res.json();
}

/** Extract text content from OpenRouter response */
function extractText(data: any): string {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("\n");
  }
  return "";
}

/** Extract image from OpenRouter response (inline base64, markdown URL, or multipart) */
function extractImage(data: any): string {
  const msg = data.choices?.[0]?.message;
  if (!msg) return "";

  // 1. Check for inline_data / images array (some models return structured image data)
  if (Array.isArray(msg.images)) {
    for (const img of msg.images) {
      if (img.image_url?.url) return img.image_url.url;
    }
  }

  const content = msg.content;

  // 2. If content is an array (multipart response)
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.type === "image_url" && part.image_url?.url) return part.image_url.url;
      if (part.type === "inline_data" && part.data) {
        const mime = part.mime_type || "image/png";
        return `data:${mime};base64,${part.data}`;
      }
    }
    // Fallback: check text parts for image references
    for (const part of content) {
      if (part.type === "text") {
        const img = extractImageFromText(part.text);
        if (img) return img;
      }
    }
  }

  // 3. If content is a string, try to find image data in it
  if (typeof content === "string") {
    return extractImageFromText(content);
  }

  return "";
}

function extractImageFromText(text: string): string {
  if (!text) return "";
  // Base64 data URI
  const b64Match = text.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
  if (b64Match) return b64Match[0];
  // Markdown image
  const mdMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (mdMatch) return mdMatch[1];
  // Plain URL
  const urlMatch = text.match(/(https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif))/i);
  if (urlMatch) return urlMatch[1];
  return "";
}

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
    const {
      productName, productDescription, keywords, market, language,
      titleLimit, imageCount, templates,
      whiteBgImages, referenceImages, hotSearchImages,
    } = body;

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

    const tplMap: Record<string, { content: string; model: string }> = {};
    if (templates && Array.isArray(templates)) {
      for (const t of templates) {
        tplMap[t.template_name] = { content: t.template_content, model: t.model };
      }
    }

    const hasWhiteBg = Array.isArray(whiteBgImages) && whiteBgImages.length > 0;
    const hasRef = Array.isArray(referenceImages) && referenceImages.length > 0;
    const hasHotSearch = Array.isArray(hotSearchImages) && hotSearchImages.length > 0;

    // All user images (base64 data URLs) are passed directly to OpenRouter
    const allUserImages: string[] = [
      ...(whiteBgImages || []),
      ...(referenceImages || []),
      ...(hotSearchImages || []),
    ].filter((img: string) => typeof img === "string" && img.length > 0);

    const baseVars: Record<string, string> = {
      product_name: productName,
      product_description: productDescription,
      keywords: keywords || "无",
      market: marketName,
      language: langName,
      title_limit: charLimit,
      image_count: String(imgCount),
      has_white_bg_images: hasWhiteBg ? "是" : "否",
      white_bg_image_count: String(whiteBgImages?.length || 0),
      has_reference_images: hasRef ? "是" : "否",
      reference_image_count: String(referenceImages?.length || 0),
      has_hot_search_images: hasHotSearch ? "是" : "否",
      hot_search_image_count: String(hotSearchImages?.length || 0),
    };

    const getTemplate = (name: string, fallbackContent: string, fallbackModel: string) => {
      const tpl = tplMap[name];
      return tpl ? { content: tpl.content, model: tpl.model } : { content: fallbackContent, model: fallbackModel };
    };

    const DEFAULT_TEXT_MODEL = "google/gemini-2.5-flash";
    const DEFAULT_IMAGE_MODEL = "google/gemini-2.5-flash";

    // ===== Step 1: 卖点分析 =====
    console.log("[Step 1] 卖点分析");
    const step1 = getTemplate("卖点分析",
      `你是美客多（Mercado Libre）资深运营专家。请根据以下产品信息，提取5个核心卖点。每个卖点一行，不带编号，简洁有力。只输出卖点内容，不要其他文字。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n输出语言: {{language}}`,
      DEFAULT_TEXT_MODEL);
    const step1Prompt = renderTemplate(step1.content, baseVars);
    const step1Data = await callOpenRouter(apiKey, step1.model, step1Prompt, allUserImages);
    const sellingPointsRaw = extractText(step1Data);
    const sellingPoints = sellingPointsRaw
      .split("\n")
      .map((s: string) => s.replace(/^\d+[\.\)、]\s*/, "").trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 5);

    const varsWithSP = { ...baseVars, selling_points: sellingPoints.join("\n") };

    // ===== Step 2: 标题生成 =====
    console.log("[Step 2] 标题生成");
    const step2 = getTemplate("标题生成",
      `你是美客多SEO标题专家。根据产品信息和卖点，生成一个SEO优化的商品标题，最多{{title_limit}}个字符。只输出标题本身，不要引号或其他文字。使用{{language}}。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n\n核心卖点:\n{{selling_points}}`,
      DEFAULT_TEXT_MODEL);
    const step2Data = await callOpenRouter(apiKey, step2.model, renderTemplate(step2.content, varsWithSP), hotSearchImages);
    const title = extractText(step2Data).trim();

    const varsWithTitle = { ...varsWithSP, title };

    // ===== Step 3: 描述生成 =====
    console.log("[Step 3] 描述生成");
    const step3 = getTemplate("描述生成",
      `你是美客多商品描述文案专家。根据产品信息和卖点，撰写300-500字的详细商品描述。要求有吸引力、包含规格参数、解答买家常见疑虑。使用{{language}}，段落清晰。只输出描述正文。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n\n核心卖点:\n{{selling_points}}\n标题: {{title}}`,
      DEFAULT_TEXT_MODEL);
    const step3Data = await callOpenRouter(apiKey, step3.model, renderTemplate(step3.content, varsWithTitle));
    const description = extractText(step3Data).trim();

    // ===== Step 4: 主图生成 (via OpenRouter) =====
    console.log("[Step 4] 主图生成");
    const step4 = getTemplate("主图生成",
      `Generate a professional e-commerce product photo of {{product_name}}. {{product_description}}. White background, studio lighting, high quality, 4k resolution. Output the image directly.`,
      DEFAULT_IMAGE_MODEL);
    let mainImage = "";
    try {
      const imagePrompt = renderTemplate(step4.content, baseVars);
      const step4Data = await callOpenRouter(apiKey, step4.model, imagePrompt, whiteBgImages);
      mainImage = extractImage(step4Data);
      if (!mainImage) {
        console.warn("[Step 4] No image extracted from response. Response preview:", JSON.stringify(step4Data).substring(0, 500));
      }
    } catch (e) {
      console.error("[Step 4] Main image generation failed:", e);
    }

    // ===== Step 5: 轮播图规划 =====
    console.log("[Step 5] 轮播图规划");
    const step5 = getTemplate("轮播图规划",
      `你是电商视觉策划专家。请为该商品规划{{image_count}}张轮播图的内容方案。每张图一行描述拍摄角度/展示重点。不带编号，只输出规划内容。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n\n核心卖点:\n{{selling_points}}`,
      DEFAULT_TEXT_MODEL);
    const step5Data = await callOpenRouter(apiKey, step5.model, renderTemplate(step5.content, varsWithSP), referenceImages);
    const carouselPlanRaw = extractText(step5Data);
    const carouselPlan = carouselPlanRaw
      .split("\n")
      .map((s: string) => s.replace(/^\d+[\.\)、]\s*/, "").trim())
      .filter((s: string) => s.length > 0)
      .slice(0, imgCount);

    // ===== Step 6: 轮播图生成 (via OpenRouter) =====
    console.log("[Step 6] 轮播图生成");
    const step6 = getTemplate("轮播图生成",
      `Generate a professional e-commerce product photo: {{carousel_plan_item}}. Product: {{product_name}}. Clean background, studio lighting, high quality. Output the image directly.`,
      DEFAULT_IMAGE_MODEL);
    const carouselImages: string[] = [];
    for (const plan of carouselPlan) {
      try {
        const imgPrompt = renderTemplate(step6.content, { ...baseVars, carousel_plan_item: plan });
        const step6Data = await callOpenRouter(apiKey, step6.model, imgPrompt, referenceImages);
        const img = extractImage(step6Data);
        if (img) {
          carouselImages.push(img);
        } else {
          console.warn("[Step 6] No image extracted for plan:", plan.substring(0, 50));
        }
      } catch (e) {
        console.error("[Step 6] Carousel image generation failed:", e);
      }
    }

    console.log(`[Done] sellingPoints=${sellingPoints.length}, title=${title.length}, desc=${description.length}, mainImage=${mainImage ? 'yes' : 'no'}, carousel=${carouselImages.length}`);

    return new Response(
      JSON.stringify({ sellingPoints, title, description, mainImage, carouselPlan, carouselImages }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-listing error:", e);
    const message = e instanceof Error ? e.message : "未知错误";
    const status = message.includes("速率限制") ? 429 : message.includes("余额不足") ? 402 : 500;
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
