import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["hsl(142, 71%, 45%)", "hsl(220, 70%, 55%)"];

const UserAnalyticsPanel = () => {
  const [growthData, setGrowthData] = useState<{ date: string; count: number }[]>([]);
  const [paidStats, setPaidStats] = useState({ paid: 0, free: 0 });
  const [topConsumers, setTopConsumers] = useState<{ email: string; total: number }[]>([]);
  const [topBalances, setTopBalances] = useState<{ email: string; points: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [profilesRes, pointsRes, logsRes, rechargeRes] = await Promise.all([
        supabase.from("profiles").select("id, email, phone, created_at").order("created_at", { ascending: false }),
        supabase.from("user_points").select("user_id, remaining_points"),
        supabase.from("ai_logs").select("user_id, points_cost"),
        supabase.from("recharge_records").select("user_id, status"),
      ]);

      const profiles = profilesRes.data || [];
      const points = pointsRes.data || [];
      const logs = logsRes.data || [];
      const recharges = rechargeRes.data || [];

      // Growth curve (last 30 days)
      const dateMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dateMap.set(d.toISOString().split("T")[0], 0);
      }
      profiles.forEach(p => {
        const day = p.created_at?.split("T")[0] || "";
        if (dateMap.has(day)) dateMap.set(day, (dateMap.get(day) || 0) + 1);
      });
      setGrowthData(Array.from(dateMap.entries()).map(([date, count]) => ({ date: date.slice(5), count })));

      // Paid vs free
      const paidUsers = new Set(recharges.filter(r => r.status === "success").map(r => r.user_id));
      setPaidStats({ paid: paidUsers.size, free: profiles.length - paidUsers.size });

      // Top consumers
      const consumeMap = new Map<string, number>();
      logs.forEach(l => consumeMap.set(l.user_id, (consumeMap.get(l.user_id) || 0) + l.points_cost));
      const profileMap = new Map(profiles.map(p => [p.id, p.email || p.phone || "—"]));
      const sorted = Array.from(consumeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
      setTopConsumers(sorted.map(([uid, total]) => ({ email: profileMap.get(uid) || "—", total })));

      // Top balances
      const balSorted = [...points].sort((a, b) => b.remaining_points - a.remaining_points).slice(0, 10);
      setTopBalances(balSorted.map(p => ({ email: profileMap.get(p.user_id) || "—", points: p.remaining_points })));

      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">加载中...</div>;

  const pieData = [
    { name: "付费用户", value: paidStats.paid },
    { name: "免费用户", value: paidStats.free },
  ];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">近30天新用户增长</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="count" name="新增用户" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">付费 / 免费用户占比</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">积分消耗 TOP 10</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>用户</TableHead><TableHead className="text-right">消耗积分</TableHead></TableRow></TableHeader>
              <TableBody>
                {topConsumers.map((u, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell className="text-right font-semibold">{u.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">余额 TOP 10</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>用户</TableHead><TableHead className="text-right">剩余积分</TableHead></TableRow></TableHeader>
              <TableBody>
                {topBalances.map((u, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell className="text-right font-semibold">{u.points.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAnalyticsPanel;
