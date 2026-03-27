import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, ShoppingCart, Users, Cpu, TrendingUp, TrendingDown,
  Wallet, Eye, Monitor, Smartphone, ChevronDown, Activity,
  Coins, BarChart3, UserCheck, Zap,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";

// ── Neon colors ──
const NEON = {
  cyan: "hsl(195, 100%, 50%)",
  teal: "hsl(175, 80%, 45%)",
  emerald: "hsl(160, 70%, 45%)",
  rose: "hsl(350, 80%, 60%)",
  amber: "hsl(40, 90%, 55%)",
  violet: "hsl(265, 80%, 60%)",
  blue: "hsl(220, 70%, 55%)",
};

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: "1px solid hsl(220, 15%, 18%)",
  background: "hsl(220, 15%, 10%)",
  color: "#e5e5e5",
};

// ── Section wrapper ──
const DashSection = ({ title, icon: Icon, defaultOpen = true, children }: {
  title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="admin-section-header flex items-center gap-3 py-3 px-1 group">
          <Icon className="w-5 h-5 admin-neon-text" />
          <span className="text-base font-semibold tracking-wide">{title}</span>
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`} style={{ color: "hsl(195, 100%, 50%)" }} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-6">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// ── KPI Card ──
const KPICard = ({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: any; color: string;
}) => (
  <div className="admin-kpi-card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="admin-label">{label}</span>
      <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-bold tracking-tight admin-value">{value}</p>
  </div>
);

const AdminUnifiedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({
    todayRevenue: 0, totalRevenue: 0, todayOrders: 0, totalOrders: 0,
    todayNewUsers: 0, totalUsers: 0, todayAICalls: 0, todayProfit: 0,
  });
  const [analyticsRange, setAnalyticsRange] = useState<"7" | "30" | "180">("7");
  const [salesRange, setSalesRange] = useState<"30" | "180">("30");
  const [visitStats, setVisitStats] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [paidStats, setPaidStats] = useState({ paid: 0, free: 0 });
  const [topConsumers, setTopConsumers] = useState<any[]>([]);
  const [aiData, setAiData] = useState<any[]>([]);
  const [aiTotals, setAiTotals] = useState({ calls: 0, tokens: 0, cost: 0 });

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [rechargeRes, profilesRes, aiLogsRes, pointsRes] = await Promise.all([
        supabase.from("recharge_records").select("amount, created_at, status, user_id"),
        supabase.from("profiles").select("id, email, phone, created_at"),
        supabase.from("ai_logs").select("user_id, points_cost, prompt_tokens, completion_tokens, created_at"),
        supabase.from("user_points").select("user_id, remaining_points"),
      ]);

      const recharges = (rechargeRes.data || []).filter(r => r.status === "success");
      const profiles = profilesRes.data || [];
      const aiLogs = aiLogsRes.data || [];
      const points = pointsRes.data || [];

      // KPI
      const totalRevenue = recharges.reduce((s, r) => s + r.amount, 0);
      const todayRecharges = recharges.filter(r => r.created_at?.startsWith(today));
      const todayRevenue = todayRecharges.reduce((s, r) => s + r.amount, 0);
      const todayNewUsers = profiles.filter(p => p.created_at?.startsWith(today)).length;
      const todayAI = aiLogs.filter(l => l.created_at?.startsWith(today));
      const todayAICost = todayAI.reduce((s, l) => s + l.points_cost, 0) * 0.01;

      setKpi({
        todayRevenue, totalRevenue,
        todayOrders: todayRecharges.length, totalOrders: recharges.length,
        todayNewUsers, totalUsers: profiles.length,
        todayAICalls: todayAI.length,
        todayProfit: todayRevenue - todayAICost,
      });

      // User growth (30 days)
      const growthMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        growthMap.set(d.toISOString().split("T")[0], 0);
      }
      profiles.forEach(p => {
        const day = p.created_at?.split("T")[0] || "";
        if (growthMap.has(day)) growthMap.set(day, (growthMap.get(day) || 0) + 1);
      });
      setGrowthData(Array.from(growthMap.entries()).map(([d, c]) => ({ date: d.slice(5), count: c })));

      // Paid vs free
      const paidUsers = new Set(recharges.map(r => r.user_id));
      setPaidStats({ paid: paidUsers.size, free: profiles.length - paidUsers.size });

      // Top consumers
      const consumeMap = new Map<string, number>();
      aiLogs.forEach(l => consumeMap.set(l.user_id, (consumeMap.get(l.user_id) || 0) + l.points_cost));
      const profileMap = new Map(profiles.map(p => [p.id, p.email || p.phone || "—"]));
      setTopConsumers(
        Array.from(consumeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
          .map(([uid, total]) => ({ email: profileMap.get(uid) || "—", total }))
      );

      // AI cost data (30d)
      const aiDateMap = new Map<string, { calls: number; tokens: number; cost: number; revenue: number }>();
      for (let i = 0; i < 30; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        aiDateMap.set(d.toISOString().split("T")[0], { calls: 0, tokens: 0, cost: 0, revenue: 0 });
      }
      let tc = 0, tt = 0, tco = 0;
      aiLogs.forEach(l => {
        const day = l.created_at?.split("T")[0] || "";
        const tk = l.prompt_tokens + l.completion_tokens;
        const c = l.points_cost * 0.01;
        tc++; tt += tk; tco += c;
        if (aiDateMap.has(day)) { const e = aiDateMap.get(day)!; e.calls++; e.tokens += tk; e.cost += c; }
      });
      recharges.forEach(r => {
        const day = r.created_at?.split("T")[0] || "";
        if (aiDateMap.has(day)) aiDateMap.get(day)!.revenue += r.amount;
      });
      setAiTotals({ calls: tc, tokens: tt, cost: Math.round(tco * 100) / 100 });
      setAiData(
        Array.from(aiDateMap.entries()).map(([d, v]) => ({
          date: d.slice(5), calls: v.calls, tokens: v.tokens,
          cost: Math.round(v.cost * 100) / 100,
          revenue: v.revenue,
          profit: Math.round((v.revenue - v.cost) * 100) / 100,
        })).sort((a, b) => a.date.localeCompare(b.date))
      );

      setLoading(false);
    };
    fetchAll();
  }, []);

  // Analytics data (depends on range)
  useEffect(() => {
    const fetchVisits = async () => {
      const days = parseInt(analyticsRange);
      const start = new Date(); start.setDate(start.getDate() - days);
      const startStr = start.toISOString().split("T")[0];
      const { data: views } = await (supabase.from("page_views" as any) as any)
        .select("*").gte("visit_date", startStr).order("created_at", { ascending: false });
      if (!views) return;
      const dateMap = new Map<string, { visitors: Set<string>; total: number; desktop: number; mobile: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        dateMap.set(d.toISOString().split("T")[0], { visitors: new Set(), total: 0, desktop: 0, mobile: 0 });
      }
      (views as any[]).forEach(v => {
        const day = v.visit_date;
        if (!dateMap.has(day)) dateMap.set(day, { visitors: new Set(), total: 0, desktop: 0, mobile: 0 });
        const e = dateMap.get(day)!;
        e.visitors.add(v.visitor_id); e.total++;
        if (v.device_type === "mobile") e.mobile++; else e.desktop++;
      });
      setVisitStats(
        Array.from(dateMap.entries()).map(([d, v]) => ({
          date: d.slice(5), total: v.total, unique: v.visitors.size, desktop: v.desktop, mobile: v.mobile,
        })).sort((a, b) => a.date.localeCompare(b.date))
      );
    };
    fetchVisits();
  }, [analyticsRange]);

  // Sales data (depends on range)
  useEffect(() => {
    const fetchSales = async () => {
      const days = parseInt(salesRange);
      const start = new Date(); start.setDate(start.getDate() - days);
      const startStr = start.toISOString().split("T")[0];
      const [rRes, aRes] = await Promise.all([
        supabase.from("recharge_records").select("amount, created_at, status").gte("created_at", startStr),
        supabase.from("ai_logs").select("points_cost, created_at").gte("created_at", startStr),
      ]);
      const dateMap = new Map<string, { revenue: number; orders: number; aiCost: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        dateMap.set(d.toISOString().split("T")[0], { revenue: 0, orders: 0, aiCost: 0 });
      }
      (rRes.data || []).filter(r => r.status === "success").forEach(r => {
        const day = r.created_at?.split("T")[0] || "";
        if (dateMap.has(day)) { const e = dateMap.get(day)!; e.revenue += r.amount; e.orders++; }
      });
      (aRes.data || []).forEach(l => {
        const day = l.created_at?.split("T")[0] || "";
        if (dateMap.has(day)) dateMap.get(day)!.aiCost += l.points_cost * 0.01;
      });
      setSalesData(
        Array.from(dateMap.entries()).map(([d, v]) => ({
          date: d.slice(5),
          revenue: Math.round(v.revenue * 100) / 100,
          orders: v.orders,
          aiCost: Math.round(v.aiCost * 100) / 100,
          profit: Math.round((v.revenue - v.aiCost) * 100) / 100,
        })).sort((a, b) => a.date.localeCompare(b.date))
      );
    };
    fetchSales();
  }, [salesRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: "hsl(195, 100%, 50%)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const totalDesktop = visitStats.reduce((s, v) => s + v.desktop, 0);
  const totalMobile = visitStats.reduce((s, v) => s + v.mobile, 0);
  const pieDevice = [{ name: "电脑端", value: totalDesktop }, { name: "手机端", value: totalMobile }];
  const piePaid = [{ name: "付费用户", value: paidStats.paid }, { name: "免费用户", value: paidStats.free }];

  return (
    <div className="space-y-2">
      {/* ─── KPI Cards ─── */}
      <DashSection title="核心数据概览" icon={Activity} defaultOpen={true}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="今日营收" value={`¥${kpi.todayRevenue.toFixed(2)}`} icon={DollarSign} color={NEON.emerald} />
          <KPICard label="总营收" value={`¥${kpi.totalRevenue.toFixed(2)}`} icon={Wallet} color={NEON.amber} />
          <KPICard label="今日订单" value={kpi.todayOrders.toString()} icon={ShoppingCart} color={NEON.cyan} />
          <KPICard label="总订单数" value={kpi.totalOrders.toString()} icon={TrendingUp} color={NEON.blue} />
          <KPICard label="今日新用户" value={kpi.todayNewUsers.toString()} icon={Users} color={NEON.violet} />
          <KPICard label="总用户数" value={kpi.totalUsers.toString()} icon={Users} color={NEON.teal} />
          <KPICard label="今日AI调用" value={kpi.todayAICalls.toString()} icon={Cpu} color={NEON.cyan} />
          <KPICard label="今日净利润" value={`¥${kpi.todayProfit.toFixed(2)}`} icon={kpi.todayProfit >= 0 ? TrendingUp : TrendingDown} color={kpi.todayProfit >= 0 ? NEON.emerald : NEON.rose} />
        </div>
      </DashSection>

      <div className="border-t" style={{ borderColor: "hsl(220, 15%, 18%)" }} />

      {/* ─── Visit Analytics ─── */}
      <DashSection title="网站访问统计" icon={Eye} defaultOpen={false}>
        <div className="flex gap-2 mb-4">
          {(["7", "30", "180"] as const).map(r => (
            <button key={r} onClick={() => setAnalyticsRange(r as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${analyticsRange === r ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              style={analyticsRange === r ? { background: "hsl(195, 100%, 50%)", boxShadow: "0 0 12px hsl(195, 100%, 50%, 0.3)" } : { background: "hsl(220, 15%, 15%)" }}>
              近{r}天
            </button>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <div className="admin-kpi-card p-4">
            <span className="admin-label">总访问量</span>
            <p className="text-xl font-bold mt-1 admin-value">{visitStats.reduce((s, v) => s + v.total, 0).toLocaleString()}</p>
          </div>
          <div className="admin-kpi-card p-4">
            <span className="admin-label">独立访客</span>
            <p className="text-xl font-bold mt-1 admin-value">{visitStats.reduce((s, v) => s + v.unique, 0).toLocaleString()}</p>
          </div>
          <div className="admin-kpi-card p-4 flex items-center gap-4">
            <div className="flex-1">
              <span className="admin-label">设备占比</span>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1"><Monitor className="w-3 h-3" style={{ color: NEON.cyan }} />{totalDesktop}</span>
                <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" style={{ color: NEON.violet }} />{totalMobile}</span>
              </div>
            </div>
            <ResponsiveContainer width={60} height={60}>
              <PieChart>
                <Pie data={pieDevice} dataKey="value" cx="50%" cy="50%" outerRadius={28} strokeWidth={0}>
                  <Cell fill={NEON.cyan} /><Cell fill={NEON.violet} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="admin-glass p-4">
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(195, 100%, 50%)" }}>访问趋势</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={visitStats}>
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NEON.cyan} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={NEON.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="total" name="总访问" stroke={NEON.cyan} fill="url(#visitGrad)" strokeWidth={2} />
                <Line type="monotone" dataKey="unique" name="独立访客" stroke={NEON.amber} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-glass p-4">
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(195, 100%, 50%)" }}>设备分布</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={visitStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="desktop" name="电脑端" fill={NEON.cyan} radius={[3, 3, 0, 0]} />
                <Bar dataKey="mobile" name="手机端" fill={NEON.violet} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashSection>

      <div className="border-t" style={{ borderColor: "hsl(220, 15%, 18%)" }} />

      {/* ─── Sales Report ─── */}
      <DashSection title="销售与盈利报表" icon={BarChart3} defaultOpen={false}>
        <div className="flex gap-2 mb-4">
          {(["30", "180"] as const).map(r => (
            <button key={r} onClick={() => setSalesRange(r as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${salesRange === r ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              style={salesRange === r ? { background: "hsl(195, 100%, 50%)", boxShadow: "0 0 12px hsl(195, 100%, 50%, 0.3)" } : { background: "hsl(220, 15%, 15%)" }}>
              {r === "30" ? "近30天" : "近6个月"}
            </button>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="admin-glass p-4">
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(195, 100%, 50%)" }}>营收 / 成本 / 利润</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" interval={salesRange === "180" ? 6 : 1} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#aaa", fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name="营收(¥)" stroke={NEON.emerald} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="aiCost" name="AI成本(¥)" stroke={NEON.rose} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" name="利润(¥)" stroke={NEON.cyan} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-glass p-4">
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(195, 100%, 50%)" }}>每日订单趋势</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" interval={salesRange === "180" ? 6 : 1} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="orders" name="订单数" fill={NEON.cyan} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashSection>

      <div className="border-t" style={{ borderColor: "hsl(220, 15%, 18%)" }} />

      {/* ─── User Analytics ─── */}
      <DashSection title="用户运营分析" icon={UserCheck} defaultOpen={false}>
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <div className="admin-glass p-4">
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(195, 100%, 50%)" }}>近30天新用户增长</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NEON.teal} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={NEON.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="count" name="新增用户" stroke={NEON.teal} fill="url(#growthGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-glass p-4 flex items-center justify-around">
            <div className="text-center">
              <p className="text-xs mb-2" style={{ color: "hsl(220, 10%, 55%)" }}>付费/免费占比</p>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={piePaid} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={40} strokeWidth={0}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    <Cell fill={NEON.emerald} /><Cell fill={NEON.blue} />
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: NEON.emerald }} />
                <span style={{ color: "hsl(220, 10%, 70%)" }}>付费: {paidStats.paid}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: NEON.blue }} />
                <span style={{ color: "hsl(220, 10%, 70%)" }}>免费: {paidStats.free}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="admin-glass p-4">
          <p className="text-xs font-medium mb-3" style={{ color: "hsl(195, 100%, 50%)" }}>积分消耗 TOP 8</p>
          <div className="space-y-2">
            {topConsumers.map((u, i) => {
              const maxVal = topConsumers[0]?.total || 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs w-5 text-right font-mono" style={{ color: "hsl(220, 10%, 50%)" }}>#{i + 1}</span>
                  <span className="text-xs truncate w-36" style={{ color: "hsl(220, 10%, 70%)" }}>{u.email}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(220, 15%, 18%)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(u.total / maxVal) * 100}%`, background: `linear-gradient(90deg, ${NEON.cyan}, ${NEON.violet})` }} />
                  </div>
                  <span className="text-xs font-semibold w-16 text-right" style={{ color: NEON.cyan }}>{u.total.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </DashSection>

      <div className="border-t" style={{ borderColor: "hsl(220, 15%, 18%)" }} />

      {/* ─── AI Cost ─── */}
      <DashSection title="AI 成本与利润核算" icon={Cpu} defaultOpen={false}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="admin-kpi-card p-4">
            <span className="admin-label">30天调用</span>
            <p className="text-xl font-bold mt-1" style={{ color: NEON.cyan }}>{aiTotals.calls.toLocaleString()}</p>
          </div>
          <div className="admin-kpi-card p-4">
            <span className="admin-label">Token消耗</span>
            <p className="text-xl font-bold mt-1" style={{ color: NEON.amber }}>{aiTotals.tokens.toLocaleString()}</p>
          </div>
          <div className="admin-kpi-card p-4">
            <span className="admin-label">AI总成本</span>
            <p className="text-xl font-bold mt-1" style={{ color: NEON.rose }}>¥{aiTotals.cost.toFixed(2)}</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="admin-glass p-4">
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(195, 100%, 50%)" }}>每日调用量</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={aiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="calls" name="调用次数" fill={NEON.cyan} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-glass p-4">
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(195, 100%, 50%)" }}>利润 = 营收 - AI成本</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={aiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#aaa", fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name="营收" stroke={NEON.emerald} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cost" name="AI成本" stroke={NEON.rose} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" name="利润" stroke={NEON.cyan} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashSection>
    </div>
  );
};

export default AdminUnifiedDashboard;
