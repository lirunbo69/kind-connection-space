import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Monitor, Smartphone, TrendingUp, Users } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type DayStat = {
  date: string;
  total: number;
  unique: number;
  desktop: number;
  mobile: number;
};

type RecentView = {
  id: string;
  page_path: string;
  device_type: string;
  ip_address: string | null;
  created_at: string;
};

const COLORS = ["hsl(40, 90%, 50%)", "hsl(220, 70%, 55%)"];

const AnalyticsPanel = () => {
  const [stats, setStats] = useState<DayStat[]>([]);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"7" | "30">("7");

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    const days = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split("T")[0];

    // Fetch raw page views for the range
    const { data: views } = await supabase
      .from("page_views")
      .select("*")
      .gte("visit_date", startStr)
      .order("created_at", { ascending: false });

    if (views) {
      // Group by date
      const dateMap = new Map<string, { visitors: Set<string>; total: number; desktop: number; mobile: number }>();

      // Initialize all dates in range
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        dateMap.set(key, { visitors: new Set(), total: 0, desktop: 0, mobile: 0 });
      }

      views.forEach((v: any) => {
        const day = v.visit_date;
        if (!dateMap.has(day)) {
          dateMap.set(day, { visitors: new Set(), total: 0, desktop: 0, mobile: 0 });
        }
        const entry = dateMap.get(day)!;
        entry.visitors.add(v.visitor_id);
        entry.total++;
        if (v.device_type === "mobile") entry.mobile++;
        else entry.desktop++;
      });

      const dayStats: DayStat[] = Array.from(dateMap.entries())
        .map(([date, d]) => ({
          date: date.slice(5), // MM-DD
          total: d.total,
          unique: d.visitors.size,
          desktop: d.desktop,
          mobile: d.mobile,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats(dayStats);
      setRecentViews(views.slice(0, 50) as RecentView[]);
    }
    setLoading(false);
  };

  // Summary calculations
  const today = new Date().toISOString().split("T")[0].slice(5);
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0].slice(5);
  })();

  const todayStats = stats.find((s) => s.date === today);
  const yesterdayStats = stats.find((s) => s.date === yesterday);
  const totalVisits = stats.reduce((sum, s) => sum + s.total, 0);
  const totalDesktop = stats.reduce((sum, s) => sum + s.desktop, 0);
  const totalMobile = stats.reduce((sum, s) => sum + s.mobile, 0);

  const pieData = [
    { name: "电脑端", value: totalDesktop },
    { name: "手机端", value: totalMobile },
  ];

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Eye className="w-5 h-5" />}
          label="今日访问"
          value={todayStats?.total ?? 0}
          sub={`独立访客: ${todayStats?.unique ?? 0}`}
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="昨日访问"
          value={yesterdayStats?.total ?? 0}
          sub={`独立访客: ${yesterdayStats?.unique ?? 0}`}
        />
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label={`累计访问 (${range}天)`}
          value={totalVisits}
          sub={`电脑: ${totalDesktop} / 手机: ${totalMobile}`}
        />
        <Card className="border-border">
          <CardContent className="pt-4 pb-4 flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-2">设备占比</p>
            <ResponsiveContainer width={120} height={80}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={35} strokeWidth={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-3 text-xs mt-1">
              <span className="flex items-center gap-1">
                <Monitor className="w-3 h-3" style={{ color: COLORS[0] }} />{totalDesktop}
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" style={{ color: COLORS[1] }} />{totalMobile}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Range selector */}
      <Tabs value={range} onValueChange={(v) => setRange(v as "7" | "30")}>
        <TabsList>
          <TabsTrigger value="7">近 7 天</TabsTrigger>
          <TabsTrigger value="30">近 30 天</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">访问趋势（折线图）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend />
                <Line type="monotone" dataKey="total" name="总访问" stroke="hsl(40, 90%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="unique" name="独立访客" stroke="hsl(220, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">设备分布（柱状图）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend />
                <Bar dataKey="desktop" name="电脑端" fill="hsl(40, 90%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mobile" name="手机端" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent visits table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">最近访问记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>访问页面</TableHead>
                <TableHead>设备</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentViews.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.page_path}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${v.device_type === "mobile" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {v.device_type === "mobile" ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                      {v.device_type === "mobile" ? "手机" : "电脑"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString("zh-CN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub: string }) => (
  <Card className="border-border">
    <CardContent className="pt-4 pb-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </CardContent>
  </Card>
);

export default AnalyticsPanel;
