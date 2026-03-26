import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { productName, productDescription, keywords, market, language, titleLimit } = await req.json();

    if (!productName || !productDescription) {
      return new Response(
        JSON.stringify({ error: "产品名称和描述为必填项" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert Mercado Libre (美客多) listing copywriter specializing in creating high-converting product listings for the Latin American market. You are fluent in Spanish, Portuguese, and understand the local consumer behavior.

Your task is to generate a complete product listing based on the provided product information. Output must be in the target language specified.

IMPORTANT: Return your response as valid JSON with exactly these fields:
- "title": The SEO-optimized product title (${titleLimit ? `max ${titleLimit} characters` : "max 60 characters"})
- "sellingPoints": An array of 5 core selling points (each a short sentence)
- "description": A detailed product description (300-500 words), formatted with line breaks for readability

Rules:
1. The title must include high-traffic keywords relevant to the target market
2. Selling points should highlight unique value propositions
3. Description should be persuasive, include specifications, and address common buyer concerns
4. Use natural, localized language for the target market (avoid direct translations from Chinese)
5. Follow Mercado Libre's listing best practices for the specific market`;

    const userPrompt = `产品信息:
- 产品名称: ${productName}
- 产品描述: ${productDescription}
- 关键词: ${keywords || "无"}
- 目标市场: ${market || "墨西哥"}
- 输出语言: ${language || "西班牙语"}

请生成完整的Mercado Libre产品listing。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_listing",
              description: "Generate a Mercado Libre product listing",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "SEO-optimized product title" },
                  sellingPoints: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of 5 core selling points",
                  },
                  description: { type: "string", description: "Detailed product description" },
                },
                required: ["title", "sellingPoints", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_listing" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求频率过高，请稍后再试" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI额度不足，请前往设置充值" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI服务暂时不可用" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("Unexpected AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI返回格式异常，请重试" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const listing = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(listing), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-listing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "未知错误" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
