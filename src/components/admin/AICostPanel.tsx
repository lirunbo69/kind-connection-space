import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Cpu, Coins, TrendingUp } from "lucide-react";

type DayCost = {
  date: string;
  calls: number;
  tokens: number;
  cost: number;
  revenue: number;
  profit: number;
};

const AICostPanel = () => {
  const [data, setData] = useState<DayCost[]>([]);
  const [totals, setTotals] = useState({ calls: 0, tokens: 0, cost: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const startStr = start.toISOString().split("T")[0];

      const [aiRes, rechargeRes] = await Promise.all([
        supabase.from("ai_logs").select("prompt_tokens, completion_tokens, points_cost, created_at").gte("created_at", startStr),
        supabase.from("recharge_records").select("amount, created_at, status").gte("created_at", startStr),
      ]);

      const dateMap = new Map<string, { calls: number; tokens: number; cost: number; revenue: number }>();
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dateMap.set(d.toISOString().split("T")[0], { calls: 0, tokens: 0, cost: 0, revenue: 0 });
      }

      let totalCalls = 0, totalTokens = 0, totalCost = 0;

      (aiRes.data || []).forEach(l => {
        const day = l.created_at?.split("T")[0] || "";
        const tk = l.prompt_tokens + l.completion_tokens;
        const c = l.points_cost * 0.01;
        totalCalls++; totalTokens += tk; totalCost += c;
        if (dateMap.has(day)) {
          const e = dateMap.get(day)!;
          e.calls++; e.tokens += tk; e.cost += c;
        }
      });

      (rechargeRes.data || []).filter(r => r.status === "success").forEach(r => {
        const day = r.created_at?.split("T")[0] || "";
        if (dateMap.has(day)) dateMap.get(day)!.revenue += r.amount;
      });

      setTotals({ calls: totalCalls, tokens: totalTokens, cost: Math.round(totalCost * 100) / 100 });
      setData(
        Array.from(dateMap.entries())
          .map(([date, d]) => ({
            date: date.slice(5),
            calls: d.calls,
            tokens: d.tokens,
            cost: Math.round(d.cost * 100) / 100,
            revenue: d.revenue,
            profit: Math.round((d.revenue - d.cost) * 100) / 100,
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">加载中...</div>;

  const summaryCards = [
    { label: "30天AI调用", value: totals.calls.toLocaleString(), icon: Cpu, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Token消耗", value: totals.tokens.toLocaleString(), icon: Coins, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "AI总成本", value: `¥${totals.cost.toFixed(2)}`, icon: TrendingUp, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map(c => (
          <Card key={c.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${c.bg}`}><c.icon className={`w-4 h-4 ${c.color}`} /></div>
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
              <p className="text-xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">每日AI调用 & Token消耗</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend />
              <Bar dataKey="calls" name="调用次数" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">利润 = 营收 - AI成本</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="营收(¥)" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cost" name="AI成本(¥)" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" name="利润(¥)" stroke="hsl(40, 90%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICostPanel;
