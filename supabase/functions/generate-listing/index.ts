import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode as decodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESTIMATED_TEXT_COST = 10;
const ESTIMATED_IMAGE_COST = 20;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Upload base64 image to Supabase Storage and return public URL
async function uploadImageToStorage(
  adminClient: any,
  userId: string,
  base64DataUrl: string,
  fileName: string,
): Promise<string> {
  try {
    // Extract mime type and base64 data
    const match = base64DataUrl.match(/^data:(image\/\w+);base64,(.+)$/s);
    if (!match) {
      console.error("[uploadImage] Invalid base64 data URL format");
      return base64DataUrl; // fallback to base64
    }
    const mimeType = match[1];
    const base64Data = match[2];
    const ext = mimeType.split("/")[1] || "png";
    const filePath = `${userId}/${fileName}.${ext}`;

    // Decode base64 to Uint8Array
    const imageBytes = decodeBase64(base64Data);

    // Upload to storage
    const { data, error } = await adminClient.storage
      .from("listing-images")
      .upload(filePath, imageBytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error("[uploadImage] Upload error:", error.message);
      return base64DataUrl; // fallback
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    console.log(`[uploadImage] Uploaded ${filePath}, URL: ${urlData.publicUrl?.substring(0, 80)}...`);
    return urlData.publicUrl;
  } catch (e) {
    console.error("[uploadImage] Exception:", e);
    return base64DataUrl; // fallback
  }
}

// Models that support image output
const IMAGE_OUTPUT_MODELS = [
  "google/gemini-3-pro-image-preview",
  "google/gemini-3.1-flash-image-preview",
];

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
    const content: any[] = [{ type: "text", text: textPrompt }];
    for (const img of validImages) {
      content.push({ type: "image_url", image_url: { url: img } });
    }
    messages = [{ role: "user", content }];
  } else {
    messages = [{ role: "user", content: textPrompt }];
  }

  const isImageModel = IMAGE_OUTPUT_MODELS.some((m) => model.includes(m));
  const body: any = { model, messages, ...extraBody };
  // CRITICAL: Add modalities for image generation models
  if (isImageModel) {
    body.modalities = ["image", "text"];
  }

  console.log(`[OpenRouter] model=${model}, images=${validImages.length}, promptLen=${textPrompt.length}, isImageModel=${isImageModel}`);

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

  const responseData = await res.json();
  // Log response structure for debugging image extraction
  if (isImageModel) {
    const msg = responseData.choices?.[0]?.message;
    console.log(`[OpenRouter ImageResponse] hasImages=${!!msg?.images}, imagesCount=${msg?.images?.length || 0}, contentType=${typeof msg?.content}, contentIsArray=${Array.isArray(msg?.content)}`);
    if (Array.isArray(msg?.content)) {
      const types = msg.content.map((p: any) => p.type);
      console.log(`[OpenRouter ImageResponse] contentParts types=${JSON.stringify(types)}`);
    }
  }
  return responseData;
}

function extractText(data: any): string {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n");
  }
  return "";
}

function extractImage(data: any): string {
  const msg = data.choices?.[0]?.message;
  if (!msg) return "";

  // Debug: log the actual structure of images array
  if (Array.isArray(msg.images) && msg.images.length > 0) {
    console.log(`[extractImage] images[0] keys: ${JSON.stringify(Object.keys(msg.images[0]))}`);
    console.log(`[extractImage] images[0] sample: ${JSON.stringify(msg.images[0]).substring(0, 200)}`);
  }

  // Try msg.images array - handle ALL known formats
  if (Array.isArray(msg.images)) {
    for (const img of msg.images) {
      // Format: { image_url: { url: "data:..." } }
      if (img.image_url?.url) return img.image_url.url;
      // Format: { url: "data:..." }
      if (img.url) return img.url;
      // Format: { b64_json: "..." } (OpenAI style)
      if (img.b64_json) return `data:image/png;base64,${img.b64_json}`;
      // Format: raw base64 string
      if (typeof img === "string") {
        if (img.startsWith("data:")) return img;
        if (img.length > 100) return `data:image/png;base64,${img}`;
      }
      // Format: { data: "base64..." }
      if (img.data) {
        const mime = img.mime_type || img.mimeType || "image/png";
        return `data:${mime};base64,${img.data}`;
      }
    }
  }

  // Try content parts
  const content = msg.content;
  if (Array.isArray(content)) {
    console.log(`[extractImage] content parts: ${JSON.stringify(content.map((p: any) => ({ type: p.type, hasUrl: !!p.image_url?.url, hasData: !!p.data })))}`);
    for (const part of content) {
      if (part.type === "image_url" && part.image_url?.url) return part.image_url.url;
      if (part.type === "inline_data" && part.data) {
        const mime = part.mime_type || "image/png";
        return `data:${mime};base64,${part.data}`;
      }
      // Gemini native format
      if (part.type === "image" && part.source?.data) {
        const mime = part.source.media_type || "image/png";
        return `data:${mime};base64,${part.source.data}`;
      }
    }
    for (const part of content) {
      if (part.type === "text") {
        const img = extractImageFromText(part.text);
        if (img) return img;
      }
    }
  }
  if (typeof content === "string") {
    return extractImageFromText(content);
  }
  return "";
}

function extractImageFromText(text: string): string {
  if (!text) return "";
  const b64Match = text.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
  if (b64Match) return b64Match[0];
  const mdMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (mdMatch) return mdMatch[1];
  const urlMatch = text.match(/(https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif))/i);
  if (urlMatch) return urlMatch[1];
  return "";
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  // Remove any unreplaced template variables to avoid malformed prompts
  result = result.replace(/\{\{[a-zA-Z_]+\}\}/g, "");
  return result.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

    // Authenticate user and check points
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "请先登录" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check remaining points
    const { data: pointsData } = await adminClient
      .from("user_points")
      .select("remaining_points")
      .eq("user_id", user.id)
      .single();

    const body = await req.json();
    const {
      productName, productDescription, keywords, market, language,
      titleLimit, imageCount, aspectRatio, templates,
      whiteBgImages, referenceImages, hotSearchImages,
    } = body;

    const ratio = aspectRatio === "3:4" ? "3:4" : "1:1";
    const imageSize = ratio === "3:4" ? "1080x1440" : "1024x1024";
    const imageSizeDesc = ratio === "3:4" ? "3:4 portrait (1080x1440px)" : "1:1 square (1024x1024px)";

    const imgCount_pre = Math.min(Math.max(parseInt(imageCount) || 3, 1), 6);
    const estimatedCost = ESTIMATED_TEXT_COST + ESTIMATED_IMAGE_COST * (1 + imgCount_pre);
    const currentPoints = pointsData?.remaining_points ?? 0;

    if (currentPoints < estimatedCost) {
      return new Response(JSON.stringify({
        error: `积分不足，预计消耗 ${estimatedCost} 积分，当前余额 ${currentPoints} 积分，请先充值`,
        code: "INSUFFICIENT_POINTS",
        required: estimatedCost,
        current: currentPoints,
      }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!productName || !productDescription) {
      return new Response(
        JSON.stringify({ error: "产品名称和描述为必填项" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const marketName = { MX: "墨西哥", BR: "巴西", CL: "智利", CO: "哥伦比亚", AR: "阿根廷", UY: "乌拉圭" }[market as string] || market || "墨西哥";
    const langCodeToName: Record<string, string> = {
      "es-MX": "西班牙语（墨西哥）/ Español de México",
      "pt-BR": "葡萄牙语（巴西）/ Português do Brasil",
      "es-CL": "西班牙语（智利）/ Español de Chile",
      "es-CO": "西班牙语（哥伦比亚）/ Español de Colombia",
      "es-AR": "西班牙语（阿根廷）/ Español de Argentina",
      "es-UY": "西班牙语（乌拉圭）/ Español de Uruguay",
    };
    const langName = langCodeToName[language as string] || language || "西班牙语（墨西哥）/ Español de México";
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
      aspect_ratio: ratio,
      image_size: imageSize,
      image_size_desc: imageSizeDesc,
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
    const DEFAULT_IMAGE_MODEL = "google/gemini-3-pro-image-preview";

    // Use streaming response to send results step by step
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // ===== Step 1: 卖点分析 =====
          send("step", { step: 0, status: "running" });
          console.log("[Step 1] 卖点分析");
          const step1 = getTemplate("卖点分析",
            `你是美客多（Mercado Libre）资深运营专家。请根据以下产品信息，提取5个核心卖点。每个卖点一行，不带编号，简洁有力。只输出卖点内容，不要其他文字。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n输出语言: {{language}}`,
            DEFAULT_TEXT_MODEL);
          const step1Data = await callOpenRouter(apiKey, step1.model, renderTemplate(step1.content, baseVars), allUserImages);
          const sellingPointsRaw = extractText(step1Data);
          const sellingPoints = sellingPointsRaw
            .split("\n")
            .map((s: string) => s.replace(/^\d+[\.\)、]\s*/, "").trim())
            .filter((s: string) => s.length > 0)
            .slice(0, 5);
          send("result", { step: 0, data: { sellingPoints } });
          send("step", { step: 0, status: "done" });

          const varsWithSP = { ...baseVars, selling_points: sellingPoints.join("\n") };

          // ===== Step 2: 标题生成 =====
          send("step", { step: 1, status: "running" });
          console.log("[Step 2] 标题生成");
          const step2 = getTemplate("标题生成",
            `你是美客多SEO标题专家。根据产品信息和卖点，生成一个SEO优化的商品标题，最多{{title_limit}}个字符。只输出标题本身，不要引号或其他文字。使用{{language}}。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n\n核心卖点:\n{{selling_points}}`,
            DEFAULT_TEXT_MODEL);
          const step2Data = await callOpenRouter(apiKey, step2.model, renderTemplate(step2.content, varsWithSP), hotSearchImages);
          const title = extractText(step2Data).trim();
          send("result", { step: 1, data: { title } });
          send("step", { step: 1, status: "done" });

          const varsWithTitle = { ...varsWithSP, title };

          // ===== Step 3: 描述生成 =====
          send("step", { step: 2, status: "running" });
          console.log("[Step 3] 描述生成");
          const step3 = getTemplate("描述生成",
            `你是美客多商品描述文案专家。根据产品信息和卖点，撰写300-500字的详细商品描述。要求有吸引力、包含规格参数、解答买家常见疑虑。使用{{language}}，段落清晰。只输出描述正文。\n\n产品名称: {{product_name}}\n产品描述: {{product_description}}\n关键词: {{keywords}}\n目标市场: {{market}}\n\n核心卖点:\n{{selling_points}}\n标题: {{title}}`,
            DEFAULT_TEXT_MODEL);
          const step3Data = await callOpenRouter(apiKey, step3.model, renderTemplate(step3.content, varsWithTitle));
          const description = extractText(step3Data).trim();
          send("result", { step: 2, data: { description } });
          send("step", { step: 2, status: "done" });

          // ===== Step 4: 主图生成 =====
          send("step", { step: 3, status: "running" });
          console.log("[Step 4] 主图生成");
          const step4 = getTemplate("主图生成",
            `Generate a professional e-commerce product photo of {{product_name}}. {{product_description}}. Pure white background, studio lighting, product centered, high quality, 4k resolution. Image aspect ratio: {{image_size_desc}}. Output the image directly.`,
            DEFAULT_IMAGE_MODEL);
          let mainImage = "";
          const step4Vars = { ...baseVars, carousel_plan_item: `Main hero product photo of ${productName}` };
          const genId = crypto.randomUUID().substring(0, 8);
          try {
            const step4Prompt = renderTemplate(step4.content, step4Vars);
            console.log(`[Step 4] Rendered prompt (${step4Prompt.length} chars): ${step4Prompt.substring(0, 150)}...`);
            const step4Data = await callOpenRouter(apiKey, step4.model, step4Prompt, whiteBgImages);
            const rawImage = extractImage(step4Data);
            if (rawImage && rawImage.startsWith("data:")) {
              mainImage = await uploadImageToStorage(adminClient, user.id, rawImage, `main-${genId}`);
              console.log(`[Step 4] Image uploaded, URL length: ${mainImage.length}`);
            } else if (rawImage) {
              mainImage = rawImage; // already a URL
            } else {
              console.warn("[Step 4] No image extracted from response.");
            }
          } catch (e) {
            console.error("[Step 4] Main image generation failed:", e);
          }
          send("result", { step: 3, data: { mainImage } });
          send("step", { step: 3, status: "done" });

          // ===== Step 5: 轮播图规划 =====
          send("step", { step: 4, status: "running" });
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
          send("result", { step: 4, data: { carouselPlan } });
          send("step", { step: 4, status: "done" });

          // ===== Step 6: 轮播图生成 =====
          send("step", { step: 5, status: "running" });
          console.log("[Step 6] 轮播图生成");
          const step6 = getTemplate("轮播图生成",
            `Generate a professional e-commerce product photo: {{carousel_plan_item}}. Product: {{product_name}}. Clean white background, studio lighting, product centered, high quality. Image aspect ratio: {{image_size_desc}}. Output the image directly.`,
            DEFAULT_IMAGE_MODEL);
          const carouselImages: string[] = [];
          for (let ci = 0; ci < carouselPlan.length; ci++) {
            const plan = carouselPlan[ci];
            try {
              const imgPrompt = renderTemplate(step6.content, { ...baseVars, carousel_plan_item: plan });
              const step6Data = await callOpenRouter(apiKey, step6.model, imgPrompt, referenceImages);
              const rawImg = extractImage(step6Data);
              if (rawImg && rawImg.startsWith("data:")) {
                const imgUrl = await uploadImageToStorage(adminClient, user.id, rawImg, `carousel-${genId}-${ci}`);
                carouselImages.push(imgUrl);
              } else if (rawImg) {
                carouselImages.push(rawImg);
              }
            } catch (e) {
              console.error("[Step 6] Carousel image generation failed:", e);
            }
          }
          send("result", { step: 5, data: { carouselImages } });
          send("step", { step: 5, status: "done" });

          // Deduct points after successful generation
          const actualImageCount = (mainImage ? 1 : 0) + carouselImages.length;
          const totalCost = ESTIMATED_TEXT_COST + ESTIMATED_IMAGE_COST * actualImageCount;
          const newPoints = Math.max(0, currentPoints - totalCost);
          await adminClient
            .from("user_points")
            .update({ remaining_points: newPoints, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);

          // Log AI usage
          await adminClient.from("ai_logs").insert({
            user_id: user.id,
            model_name: "openrouter-pipeline",
            prompt_tokens: 0,
            completion_tokens: 0,
            image_count: actualImageCount,
            points_cost: totalCost,
          });

          // Images are now URLs (not base64), safe to include in done event
          send("done", { sellingPoints, title, description, mainImage, carouselPlan, carouselImages, pointsUsed: totalCost, remainingPoints: newPoints });
          console.log(`[Done] sellingPoints=${sellingPoints.length}, title=${title.length}, desc=${description.length}, mainImage=${mainImage ? 'yes' : 'no'}, carousel=${carouselImages.length}, cost=${totalCost}`);
        } catch (e) {
          console.error("generate-listing stream error:", e);
          const message = e instanceof Error ? e.message : "未知错误";
          send("error", { error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    console.error("generate-listing error:", e);
    const message = e instanceof Error ? e.message : "未知错误";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
