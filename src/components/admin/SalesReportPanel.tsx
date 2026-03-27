import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type DayReport = {
  date: string;
  revenue: number;
  orders: number;
  aiCost: number;
  profit: number;
};

const SalesReportPanel = () => {
  const [data, setData] = useState<DayReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"30" | "180">("30");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const days = parseInt(range);
      const start = new Date();
      start.setDate(start.getDate() - days);
      const startStr = start.toISOString().split("T")[0];

      const [rechargeRes, aiRes] = await Promise.all([
        supabase.from("recharge_records").select("amount, created_at, status").gte("created_at", startStr),
        supabase.from("ai_logs").select("points_cost, created_at").gte("created_at", startStr),
      ]);

      const dateMap = new Map<string, { revenue: number; orders: number; aiCost: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dateMap.set(d.toISOString().split("T")[0], { revenue: 0, orders: 0, aiCost: 0 });
      }

      (rechargeRes.data || []).filter(r => r.status === "success").forEach(r => {
        const day = r.created_at?.split("T")[0] || "";
        if (dateMap.has(day)) {
          const e = dateMap.get(day)!;
          e.revenue += r.amount;
          e.orders++;
        }
      });

      (aiRes.data || []).forEach(l => {
        const day = l.created_at?.split("T")[0] || "";
        if (dateMap.has(day)) {
          dateMap.get(day)!.aiCost += l.points_cost * 0.01;
        }
      });

      const reports: DayReport[] = Array.from(dateMap.entries())
        .map(([date, d]) => ({
          date: date.slice(5),
          revenue: Math.round(d.revenue * 100) / 100,
          orders: d.orders,
          aiCost: Math.round(d.aiCost * 100) / 100,
          profit: Math.round((d.revenue - d.aiCost) * 100) / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setData(reports);
      setLoading(false);
    };
    fetch();
  }, [range]);

  if (loading) return <div className="text-center py-8 text-muted-foreground">加载中...</div>;

  return (
    <div className="space-y-4">
      <Tabs value={range} onValueChange={(v) => setRange(v as "30" | "180")}>
        <TabsList>
          <TabsTrigger value="30">近 30 天</TabsTrigger>
          <TabsTrigger value="180">近 6 个月</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">营收 / 成本 / 利润趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={range === "180" ? 6 : 1} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="营收(¥)" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="aiCost" name="AI成本(¥)" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" name="利润(¥)" stroke="hsl(40, 90%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">每日订单趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={range === "180" ? 6 : 1} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Line type="monotone" dataKey="orders" name="订单数" stroke="hsl(220, 70%, 55%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReportPanel;
