import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "未登录" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "认证失败" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const outTradeNo = searchParams.get("out_trade_no");

    if (!outTradeNo) {
      return new Response(JSON.stringify({ error: "缺少订单号" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: order, error: orderErr } = await adminClient
      .from("recharge_records")
      .select("status, points, amount, out_trade_no, created_at")
      .eq("out_trade_no", outTradeNo)
      .eq("user_id", user.id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "订单不存在" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auto-close expired pending orders (15 min)
    if (order.status === "pending") {
      const createdAt = new Date(order.created_at).getTime();
      if (Date.now() - createdAt > 15 * 60 * 1000) {
        await adminClient
          .from("recharge_records")
          .update({ status: "closed" })
          .eq("out_trade_no", outTradeNo)
          .eq("status", "pending");
        order.status = "closed";
      }
    }

    // Get latest points
    const { data: points } = await adminClient
      .from("user_points")
      .select("remaining_points")
      .eq("user_id", user.id)
      .single();

    return new Response(
      JSON.stringify({
        status: order.status,
        points: order.points,
        amount: order.amount,
        remaining_points: points?.remaining_points ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Check order error:", e);
    return new Response(JSON.stringify({ error: "服务器错误" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
