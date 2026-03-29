import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Alipay async notification handler
// This endpoint does NOT require JWT - it's called by Alipay servers

const PACKAGES: Record<string, { amount: number; points: number }> = {
  basic:    { amount: 10,  points: 1000 },
  standard: { amount: 50,  points: 5200 },
  premium:  { amount: 100, points: 11000 },
};

async function rsaVerify(content: string, signature: string, publicKeyPem: string): Promise<boolean> {
  try {
    const pemBody = publicKeyPem
      .replace(/-----BEGIN (?:RSA )?PUBLIC KEY-----/g, "")
      .replace(/-----END (?:RSA )?PUBLIC KEY-----/g, "")
      .replace(/\s/g, "");
    const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      "spki",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const encoder = new TextEncoder();

    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      sigBytes,
      encoder.encode(content)
    );
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

Deno.serve(async (req) => {
  // Only accept POST from Alipay
  if (req.method !== "POST") {
    return new Response("success", { status: 200 });
  }

  try {
    const formData = await req.text();
    const params = new URLSearchParams(formData);
    const paramsObj: Record<string, string> = {};
    for (const [key, value] of params) {
      paramsObj[key] = value;
    }

    console.log("Alipay notify received, trade_no:", paramsObj.trade_no, "out_trade_no:", paramsObj.out_trade_no);

    // Verify signature
    const sign = paramsObj.sign;
    const signType = paramsObj.sign_type;
    delete paramsObj.sign;
    delete paramsObj.sign_type;

    const sortedStr = Object.keys(paramsObj)
      .sort()
      .filter(k => paramsObj[k] !== "" && paramsObj[k] !== undefined)
      .map(k => `${k}=${paramsObj[k]}`)
      .join("&");

    const alipayPublicKey = Deno.env.get("ALIPAY_PUBLIC_KEY")!;
    const isValid = await rsaVerify(sortedStr, sign, alipayPublicKey);

    if (!isValid) {
      console.error("Alipay signature verification failed");
      return new Response("fail", { status: 200 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const adminClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const outTradeNo = paramsObj.out_trade_no;
    const tradeNo = paramsObj.trade_no;
    const tradeStatus = paramsObj.trade_status;
    const totalAmount = parseFloat(paramsObj.total_amount || "0");

    // Fetch order
    const { data: order, error: orderErr } = await adminClient
      .from("recharge_records")
      .select("*")
      .eq("out_trade_no", outTradeNo)
      .single();

    if (orderErr || !order) {
      console.error("Order not found:", outTradeNo);
      return new Response("fail", { status: 200 });
    }

    // Prevent duplicate processing
    if (order.status === "success") {
      console.log("Order already processed:", outTradeNo);
      return new Response("success", { status: 200 });
    }

    // Only process successful payments
    if (tradeStatus !== "TRADE_SUCCESS" && tradeStatus !== "TRADE_FINISHED") {
      console.log("Trade not successful:", tradeStatus);
      // Update status if closed/failed
      if (tradeStatus === "TRADE_CLOSED") {
        await adminClient
          .from("recharge_records")
          .update({ status: "closed", trade_no: tradeNo })
          .eq("id", order.id);
      }
      return new Response("success", { status: 200 });
    }

    // Verify amount matches
    if (Math.abs(totalAmount - Number(order.amount)) > 0.01) {
      console.error("Amount mismatch!", { expected: order.amount, received: totalAmount, outTradeNo });
      await adminClient
        .from("recharge_records")
        .update({ status: "failed", trade_no: tradeNo })
        .eq("id", order.id);
      return new Response("fail", { status: 200 });
    }

    // Update order to success
    const { error: updateErr } = await adminClient
      .from("recharge_records")
      .update({
        status: "success",
        trade_no: tradeNo,
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "pending"); // Optimistic lock

    if (updateErr) {
      console.error("Update order error:", updateErr);
      return new Response("fail", { status: 200 });
    }

    // Credit points to user
    const { data: existing } = await adminClient
      .from("user_points")
      .select("remaining_points")
      .eq("user_id", order.user_id)
      .single();

    const currentPoints = existing?.remaining_points ?? 0;
    const newPoints = currentPoints + order.points;

    if (existing) {
      await adminClient
        .from("user_points")
        .update({ remaining_points: newPoints, updated_at: new Date().toISOString() })
        .eq("user_id", order.user_id);
    } else {
      await adminClient
        .from("user_points")
        .insert({ user_id: order.user_id, remaining_points: newPoints });
    }

    console.log("Payment processed successfully:", { outTradeNo, tradeNo, points: order.points, newBalance: newPoints });

    return new Response("success", { status: 200 });
  } catch (e) {
    console.error("Alipay notify error:", e);
    return new Response("fail", { status: 200 });
  }
});
