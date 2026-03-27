import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign, ShoppingCart, Users, Cpu, TrendingUp, TrendingDown, Activity, Wallet,
} from "lucide-react";

type KPI = {
  todayRevenue: number;
  totalRevenue: number;
  todayOrders: number;
  totalOrders: number;
  todayNewUsers: number;
  totalUsers: number;
  todayAICalls: number;
  todayProfit: number;
};

const DashboardOverview = () => {
  const [kpi, setKpi] = useState<KPI>({
    todayRevenue: 0, totalRevenue: 0, todayOrders: 0, totalOrders: 0,
    todayNewUsers: 0, totalUsers: 0, todayAICalls: 0, todayProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [rechargeRes, profilesRes, aiLogsRes] = await Promise.all([
        supabase.from("recharge_records").select("amount, created_at, status"),
        supabase.from("profiles").select("id, created_at"),
        supabase.from("ai_logs").select("points_cost, created_at"),
      ]);

      const recharges = (rechargeRes.data || []).filter((r) => r.status === "success");
      const totalRevenue = recharges.reduce((s, r) => s + r.amount, 0);
      const todayRecharges = recharges.filter((r) => r.created_at?.startsWith(today));
      const todayRevenue = todayRecharges.reduce((s, r) => s + r.amount, 0);

      const profiles = profilesRes.data || [];
      const todayNewUsers = profiles.filter((p) => p.created_at?.startsWith(today)).length;

      const aiLogs = aiLogsRes.data || [];
      const todayAI = aiLogs.filter((l) => l.created_at?.startsWith(today));
      const todayAICost = todayAI.reduce((s, l) => s + l.points_cost, 0) * 0.01;

      setKpi({
        todayRevenue,
        totalRevenue,
        todayOrders: todayRecharges.length,
        totalOrders: recharges.length,
        todayNewUsers,
        totalUsers: profiles.length,
        todayAICalls: todayAI.length,
        todayProfit: todayRevenue - todayAICost,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载数据中...</div>;

  const cards = [
    { label: "今日营收", value: `¥${kpi.todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "总营收", value: `¥${kpi.totalRevenue.toFixed(2)}`, icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "今日订单", value: kpi.todayOrders.toString(), icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "总订单数", value: kpi.totalOrders.toString(), icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "今日新用户", value: kpi.todayNewUsers.toString(), icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "总用户数", value: kpi.totalUsers.toString(), icon: Users, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "今日AI调用", value: kpi.todayAICalls.toString(), icon: Cpu, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "今日净利润", value: `¥${kpi.todayProfit.toFixed(2)}`, icon: kpi.todayProfit >= 0 ? TrendingUp : TrendingDown, color: kpi.todayProfit >= 0 ? "text-emerald-500" : "text-destructive", bg: kpi.todayProfit >= 0 ? "bg-emerald-500/10" : "bg-destructive/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.bg}`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardOverview;
