import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertTriangle, XCircle, Activity, Shield, Zap } from "lucide-react";

type SystemStatus = {
  api: "ok" | "error";
  db: "ok" | "error";
  rechargeAnomaly: number;
  highUsageUsers: number;
};

const SystemMonitorPanel = () => {
  const [status, setStatus] = useState<SystemStatus>({ api: "ok", db: "ok", rechargeAnomaly: 0, highUsageUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      let apiOk: "ok" | "error" = "ok";
      let dbOk: "ok" | "error" = "ok";

      const { error: dbErr } = await supabase.from("profiles").select("id").limit(1);
      if (dbErr) dbOk = "error";

      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-listing`,
          { method: "OPTIONS" }
        );
        if (!resp.ok && resp.status !== 204 && resp.status !== 404) apiOk = "error";
      } catch { apiOk = "error"; }

      const today = new Date().toISOString().split("T")[0];
      const { data: recharges } = await supabase.from("recharge_records").select("user_id").gte("created_at", today);
      const countMap = new Map<string, number>();
      (recharges || []).forEach(r => countMap.set(r.user_id, (countMap.get(r.user_id) || 0) + 1));
      const rechargeAnomaly = Array.from(countMap.values()).filter(c => c > 5).length;

      const { data: aiLogs } = await supabase.from("ai_logs").select("user_id").gte("created_at", today);
      const aiMap = new Map<string, number>();
      (aiLogs || []).forEach(l => aiMap.set(l.user_id, (aiMap.get(l.user_id) || 0) + 1));
      const highUsageUsers = Array.from(aiMap.values()).filter(c => c > 500).length;

      setStatus({ api: apiOk, db: dbOk, rechargeAnomaly, highUsageUsers });
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return <div className="text-center py-8" style={{ color: "hsl(220, 10%, 50%)" }}>系统检测中...</div>;

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? <CheckCircle className="w-5 h-5" style={{ color: "hsl(160, 70%, 55%)" }} /> : <XCircle className="w-5 h-5" style={{ color: "hsl(350, 80%, 60%)" }} />;

  const statusCards = [
    { icon: <StatusIcon ok={status.db === "ok"} />, label: "数据库", ok: status.db === "ok", text: status.db === "ok" ? "正常" : "异常" },
    { icon: <StatusIcon ok={status.api === "ok"} />, label: "API服务", ok: status.api === "ok", text: status.api === "ok" ? "正常" : "异常" },
    { icon: status.rechargeAnomaly > 0 ? <AlertTriangle className="w-5 h-5" style={{ color: "hsl(40, 90%, 55%)" }} /> : <Shield className="w-5 h-5" style={{ color: "hsl(160, 70%, 55%)" }} />, label: "充值异常", ok: status.rechargeAnomaly === 0, text: status.rechargeAnomaly > 0 ? `${status.rechargeAnomaly} 个用户` : "无异常" },
    { icon: status.highUsageUsers > 0 ? <AlertTriangle className="w-5 h-5" style={{ color: "hsl(40, 90%, 55%)" }} /> : <Zap className="w-5 h-5" style={{ color: "hsl(160, 70%, 55%)" }} />, label: "高频调用", ok: status.highUsageUsers === 0, text: status.highUsageUsers > 0 ? `${status.highUsageUsers} 个用户` : "正常" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((c, i) => (
          <div key={i} className="admin-kpi-card p-4 flex items-center gap-3">
            {c.icon}
            <div>
              <p className="text-sm font-medium" style={{ color: "hsl(220, 10%, 80%)" }}>{c.label}</p>
              <span className="px-2 py-0.5 rounded-full text-xs inline-block mt-1" style={{
                background: c.ok ? "hsl(160, 70%, 45%, 0.15)" : "hsl(350, 80%, 60%, 0.15)",
                color: c.ok ? "hsl(160, 70%, 55%)" : "hsl(350, 80%, 65%)",
              }}>
                {c.text}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-glass p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4" style={{ color: "hsl(195, 100%, 50%)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>系统状态说明</h3>
        </div>
        <div className="space-y-2 text-sm" style={{ color: "hsl(220, 10%, 55%)" }}>
          <p>• <strong style={{ color: "hsl(220, 10%, 75%)" }}>充值异常</strong>：单用户当日充值超过 5 次会触发提醒</p>
          <p>• <strong style={{ color: "hsl(220, 10%, 75%)" }}>高频调用</strong>：单用户当日 AI 调用超过 500 次会触发提醒</p>
          <p>• 系统每次进入面板时自动检测，数据实时更新</p>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitorPanel;
