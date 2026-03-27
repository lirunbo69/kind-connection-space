import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    // --- Auth ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "未登录" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "认证失败" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // --- Parse request ---
    const { messages, model_id, images } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "消息不能为空" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Check points ---
    const { data: pointsData, error: pointsError } = await adminClient
      .from("user_points")
      .select("remaining_points")
      .eq("user_id", user.id)
      .single();

    if (pointsError || !pointsData) {
      return new Response(JSON.stringify({ error: "无法获取积分信息" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pointsData.remaining_points <= 0) {
      return new Response(JSON.stringify({ error: "积分不足，请充值后再使用" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Get model config ---
    let modelConfig: any;
    if (model_id) {
      const { data } = await adminClient
        .from("ai_config")
        .select("*")
        .eq("id", model_id)
        .eq("is_active", true)
        .single();
      modelConfig = data;
    }
    if (!modelConfig) {
      const { data } = await adminClient
        .from("ai_config")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .single();
      modelConfig = data;
    }

    if (!modelConfig) {
      return new Response(JSON.stringify({ error: "没有可用的AI模型" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageCount = images?.length || 0;

    // --- Estimate cost & pre-check ---
    const inputText = messages.map((m: any) => m.content || "").join(" ");
    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    const imageCost = imageCount * modelConfig.image_points_per_image;
    const inputCost = Math.ceil((estimatedInputTokens / 1000) * modelConfig.input_points_per_1k_tokens);
    const minCost = inputCost + imageCost + modelConfig.output_points_per_1k_tokens;

    if (pointsData.remaining_points < minCost) {
      return new Response(JSON.stringify({ error: `积分不足，预计需要至少 ${minCost} 积分` }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Build Gemini API messages ---
    // Map model_name from ai_config to actual Gemini model ID
    // ai_config stores names like "google/gemini-2.5-flash" → Gemini API uses "gemini-2.5-flash"
    const geminiModel = modelConfig.model_name.replace("google/", "");

    const contents: any[] = [];

    // System instruction is separate in Gemini API
    const systemInstruction = "你是一个智能AI助手，可以进行图文对话。请用中文回复用户的问题。";

    for (const msg of messages) {
      const parts: any[] = [];

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      // Handle images for user messages
      if (msg.role === "user" && msg.images && msg.images.length > 0) {
        for (const img of msg.images) {
          // img is a base64 data URI like "data:image/jpeg;base64,..."
          const match = img.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inline_data: {
                mime_type: match[1],
                data: match[2],
              },
            });
          }
        }
      }

      if (parts.length > 0) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts,
        });
      }
    }

    // --- Call Google Gemini API directly ---
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API Key 未配置" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiBody: any = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        maxOutputTokens: 8192,
      },
    };

    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "请求频率过高，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("Gemini API error:", status, errText);
      return new Response(JSON.stringify({ error: "AI服务暂时不可用，请稍后再试" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();

    // Extract reply from Gemini response
    const reply = aiData.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text || "")
      .join("") || "";

    // Extract token usage from Gemini response
    const usageMetadata = aiData.usageMetadata || {};
    const promptTokens = usageMetadata.promptTokenCount || estimatedInputTokens;
    const completionTokens = usageMetadata.candidatesTokenCount || Math.ceil(reply.length / 4);

    // --- Calculate actual cost ---
    const actualInputCost = Math.ceil((promptTokens / 1000) * modelConfig.input_points_per_1k_tokens);
    const actualOutputCost = Math.ceil((completionTokens / 1000) * modelConfig.output_points_per_1k_tokens);
    const totalCost = actualInputCost + imageCost + actualOutputCost;

    // --- Deduct points ---
    const newPoints = Math.max(0, pointsData.remaining_points - totalCost);
    const { error: updateError } = await adminClient
      .from("user_points")
      .update({ remaining_points: newPoints, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to deduct points:", updateError);
      // Still return the reply but warn about points
    }

    // --- Log usage ---
    await adminClient.from("ai_logs").insert({
      user_id: user.id,
      model_name: modelConfig.display_name || modelConfig.model_name,
      image_count: imageCount,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      points_cost: totalCost,
    });

    return new Response(JSON.stringify({
      reply,
      points_cost: totalCost,
      remaining_points: newPoints,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        image_count: imageCount,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "未知错误" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
