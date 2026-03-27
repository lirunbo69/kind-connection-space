import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Recharge packages defined server-side for security
const PACKAGES: Record<string, { amount: number; points: number }> = {
  basic: { amount: 10, points: 1000 },
  standard: { amount: 50, points: 5200 },
  premium: { amount: 100, points: 11000 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "未登录" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "认证失败" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const packageId = body.package_id;

    if (!packageId || !PACKAGES[packageId]) {
      return new Response(JSON.stringify({ error: "无效的充值套餐" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pkg = PACKAGES[packageId];
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Insert recharge record
    const { error: recordError } = await adminClient
      .from("recharge_records")
      .insert({
        user_id: user.id,
        amount: pkg.amount,
        points: pkg.points,
        status: "success",
      });

    if (recordError) {
      console.error("Insert recharge record error:", recordError);
      return new Response(JSON.stringify({ error: "写入充值记录失败" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Update user points
    const { data: existing } = await adminClient
      .from("user_points")
      .select("remaining_points")
      .eq("user_id", user.id)
      .single();

    const currentPoints = existing?.remaining_points ?? 0;
    const newPoints = currentPoints + pkg.points;

    if (existing) {
      await adminClient
        .from("user_points")
        .update({ remaining_points: newPoints, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    } else {
      await adminClient
        .from("user_points")
        .insert({ user_id: user.id, remaining_points: newPoints });
    }

    return new Response(
      JSON.stringify({
        success: true,
        points_added: pkg.points,
        remaining_points: newPoints,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Recharge error:", e);
    return new Response(JSON.stringify({ error: "服务器内部错误" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
