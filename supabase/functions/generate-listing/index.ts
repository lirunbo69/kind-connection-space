import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const TEXT_MODEL = "google/gemini-2.5-flash-preview-05-20";
const IMAGE_MODEL = "black-forest-labs/flux-schnell";

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

async function generateImage(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Image generation error (${res.status}):`, text);
    throw new Error("图片生成失败");
  }

  const data = await res.json();
  return data.data?.[0]?.url || data.data?.[0]?.b64_json || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

    const body = await req.json();
    const { productName, productDescription, keywords, market, language, titleLimit, imageCount } = body;

    if (!productName || !productDescription) {
      return new Response(
        JSON.stringify({ error: "产品名称和描述为必填项" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const marketName = { MX: "墨西哥", BR: "巴西", CL: "智利", CO: "哥伦比亚", AR: "阿根廷", UY: "乌拉圭" }[market] || market || "墨西哥";
    const langName = language || "西班牙语";
    const charLimit = titleLimit || "60";
    const imgCount = Math.min(Math.max(parseInt(imageCount) || 3, 1), 6);

    const productContext = `产品名称: ${productName}\n产品描述: ${productDescription}\n关键词: ${keywords || "无"}\n目标市场: ${marketName}\n输出语言: ${langName}`;

    // ===== Step 1: 卖点分析 =====
    const sellingPointsRaw = await callOpenRouter(apiKey, TEXT_MODEL, [
      {
        role: "system",
        content: "你是美客多（Mercado Libre）资深运营专家。请根据产品信息，提取5个核心卖点。每个卖点一行，不带编号，简洁有力。只输出卖点内容，不要其他文字。",
      },
      { role: "user", content: productContext },
    ]);
    const sellingPoints = sellingPointsRaw
      .split("\n")
      .map((s: string) => s.replace(/^\d+[\.\)、]\s*/, "").trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 5);

    // ===== Step 2: 标题生成 =====
    const title = (
      await callOpenRouter(apiKey, TEXT_MODEL, [
        {
          role: "system",
          content: `你是美客多SEO标题专家。根据产品信息和卖点，生成一个SEO优化的商品标题，最多${charLimit}个字符。只输出标题本身，不要引号或其他文字。使用${langName}。`,
        },
        {
          role: "user",
          content: `${productContext}\n\n核心卖点:\n${sellingPoints.join("\n")}`,
        },
      ])
    ).trim();

    // ===== Step 3: 描述生成 =====
    const description = (
      await callOpenRouter(apiKey, TEXT_MODEL, [
        {
          role: "system",
          content: `你是美客多商品描述文案专家。根据产品信息和卖点，撰写300-500字的详细商品描述。要求有吸引力、包含规格参数、解答买家常见疑虑。使用${langName}，段落清晰。只输出描述正文。`,
        },
        {
          role: "user",
          content: `${productContext}\n\n核心卖点:\n${sellingPoints.join("\n")}\n标题: ${title}`,
        },
      ])
    ).trim();

    // ===== Step 4: 主图生成 =====
    let mainImage = "";
    try {
      mainImage = await generateImage(
        apiKey,
        `Professional e-commerce product photo of ${productName}, ${productDescription}, white background, studio lighting, high quality, 4k`,
      );
    } catch (e) {
      console.error("Main image generation failed:", e);
    }

    // ===== Step 5: 轮播图规划 =====
    const carouselPlanRaw = await callOpenRouter(apiKey, TEXT_MODEL, [
      {
        role: "system",
        content: `你是电商视觉策划专家。请为该商品规划${imgCount}张轮播图的内容方案。每张图一行描述拍摄角度/展示重点。不带编号，只输出规划内容。`,
      },
      {
        role: "user",
        content: `${productContext}\n\n核心卖点:\n${sellingPoints.join("\n")}`,
      },
    ]);
    const carouselPlan = carouselPlanRaw
      .split("\n")
      .map((s: string) => s.replace(/^\d+[\.\)、]\s*/, "").trim())
      .filter((s: string) => s.length > 0)
      .slice(0, imgCount);

    // ===== Step 6: 轮播图生成 =====
    const carouselImages: string[] = [];
    for (const plan of carouselPlan) {
      try {
        const img = await generateImage(
          apiKey,
          `Professional e-commerce product photo: ${plan}. Product: ${productName}. Clean background, studio lighting, high quality`,
        );
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
