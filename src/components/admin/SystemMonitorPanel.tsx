import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

      // Check DB connectivity
      const { error: dbErr } = await supabase.from("profiles").select("id").limit(1);
      if (dbErr) dbOk = "error";

      // Check edge function
      try {
        const { error } = await supabase.functions.invoke("generate-listing", {
          body: { ping: true },
        });
        // Even an error response means the function is reachable
      } catch {
        apiOk = "error";
      }

      // Anomaly: users with >5 recharges today
      const today = new Date().toISOString().split("T")[0];
      const { data: recharges } = await supabase
        .from("recharge_records")
        .select("user_id")
        .gte("created_at", today);

      const countMap = new Map<string, number>();
      (recharges || []).forEach(r => countMap.set(r.user_id, (countMap.get(r.user_id) || 0) + 1));
      const rechargeAnomaly = Array.from(countMap.values()).filter(c => c > 5).length;

      // High usage: users with >500 AI calls today
      const { data: aiLogs } = await supabase
        .from("ai_logs")
        .select("user_id")
        .gte("created_at", today);

      const aiMap = new Map<string, number>();
      (aiLogs || []).forEach(l => aiMap.set(l.user_id, (aiMap.get(l.user_id) || 0) + 1));
      const highUsageUsers = Array.from(aiMap.values()).filter(c => c > 500).length;

      setStatus({ api: apiOk, db: dbOk, rechargeAnomaly, highUsageUsers });
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">系统检测中...</div>;

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <StatusIcon ok={status.db === "ok"} />
            <div>
              <p className="text-sm font-medium">数据库</p>
              <Badge variant={status.db === "ok" ? "secondary" : "destructive"}>
                {status.db === "ok" ? "正常" : "异常"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <StatusIcon ok={status.api === "ok"} />
            <div>
              <p className="text-sm font-medium">API服务</p>
              <Badge variant={status.api === "ok" ? "secondary" : "destructive"}>
                {status.api === "ok" ? "正常" : "异常"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            {status.rechargeAnomaly > 0 ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <Shield className="w-5 h-5 text-emerald-500" />}
            <div>
              <p className="text-sm font-medium">充值异常</p>
              <Badge variant={status.rechargeAnomaly > 0 ? "destructive" : "secondary"}>
                {status.rechargeAnomaly > 0 ? `${status.rechargeAnomaly} 个用户` : "无异常"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            {status.highUsageUsers > 0 ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <Zap className="w-5 h-5 text-emerald-500" />}
            <div>
              <p className="text-sm font-medium">高频调用</p>
              <Badge variant={status.highUsageUsers > 0 ? "destructive" : "secondary"}>
                {status.highUsageUsers > 0 ? `${status.highUsageUsers} 个用户` : "正常"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4" />系统状态说明</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>充值异常</strong>：单用户当日充值超过 5 次会触发提醒</p>
          <p>• <strong>高频调用</strong>：单用户当日 AI 调用超过 500 次会触发提醒</p>
          <p>• 系统每次进入面板时自动检测，数据实时更新</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitorPanel;
