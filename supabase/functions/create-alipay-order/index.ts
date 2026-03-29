import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PACKAGES: Record<string, { amount: number; points: number; name: string }> = {
  basic:    { amount: 10,  points: 1000,  name: "基础套餐" },
  standard: { amount: 50,  points: 5200,  name: "标准套餐" },
  premium:  { amount: 100, points: 11000, name: "尊享套餐" },
};

function generateOutTradeNo(): string {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `MTERP${ts}${rand}`;
}

function sortAndStringify(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .filter(k => params[k] !== "" && params[k] !== undefined && params[k] !== null)
    .map(k => `${k}=${params[k]}`)
    .join("&");
}

async function rsaSign(content: string, privateKeyPem: string): Promise<string> {
  const pemBody = privateKeyPem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, "")
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(content)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

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

    const body = await req.json();
    const packageId = body.package_id;
    const returnUrl = body.return_url || "https://mterp.cn/topup";

    if (!packageId || !PACKAGES[packageId]) {
      return new Response(JSON.stringify({ error: "无效的充值套餐" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: max 10 pending orders per user per hour
    const adminClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count } = await adminClient
      .from("recharge_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gte("created_at", oneHourAgo);
    
    if ((count ?? 0) >= 10) {
      return new Response(JSON.stringify({ error: "操作过于频繁，请稍后再试" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pkg = PACKAGES[packageId];
    const outTradeNo = generateOutTradeNo();
    const now = new Date();
    const expireAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 min timeout

    // Insert pending order
    const { error: insertError } = await adminClient
      .from("recharge_records")
      .insert({
        user_id: user.id,
        amount: pkg.amount,
        points: pkg.points,
        status: "pending",
        out_trade_no: outTradeNo,
        package_id: packageId,
      });

    if (insertError) {
      console.error("Insert order error:", insertError);
      return new Response(JSON.stringify({ error: "创建订单失败" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build Alipay WAP pay params
    const appId = Deno.env.get("ALIPAY_APP_ID")!;
    const privateKey = Deno.env.get("ALIPAY_PRIVATE_KEY")!;
    const gatewayUrl = Deno.env.get("ALIPAY_GATEWAY_URL") || "https://openapi.alipay.com/gateway.do";
    const notifyUrl = `${supabaseUrl}/functions/v1/alipay-notify`;

    const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
    const timeoutExpress = "15m";

    const bizContent = JSON.stringify({
      out_trade_no: outTradeNo,
      total_amount: pkg.amount.toFixed(2),
      subject: `秒通ListingAI - ${pkg.name}`,
      product_code: "QUICK_WAP_WAY",
      timeout_express: timeoutExpress,
    });

    const params: Record<string, string> = {
      app_id: appId,
      method: "alipay.trade.wap.pay",
      charset: "utf-8",
      sign_type: "RSA2",
      timestamp,
      version: "1.0",
      notify_url: notifyUrl,
      return_url: returnUrl,
      biz_content: bizContent,
    };

    const signStr = sortAndStringify(params);
    const sign = await rsaSign(signStr, privateKey);
    params.sign = sign;

    // Build full redirect URL
    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    const payUrl = `${gatewayUrl}?${queryString}`;

    return new Response(
      JSON.stringify({
        success: true,
        out_trade_no: outTradeNo,
        pay_url: payUrl,
        expire_at: expireAt.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Create order error:", e);
    return new Response(JSON.stringify({ error: "服务器内部错误" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
