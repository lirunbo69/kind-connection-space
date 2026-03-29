import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Bot, FileText, ShoppingCart, Activity,
  Shield, Eye, Coins, Edit2, Trash2, Plus, Download, Search,
  TrendingUp, TrendingDown, DollarSign, Wallet, Cpu, Monitor,
  Smartphone, ChevronDown, BarChart3, UserCheck, Zap, LogOut,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Constants ──
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
  border: "1px solid hsl(220, 15%, 22%)",
  background: "hsl(220, 15%, 10%)",
  color: "#e5e5e5",
  fontSize: 12,
};

const INPUT_STYLE = { background: "hsl(220, 15%, 15%)", border: "1px solid hsl(220, 15%, 22%)", color: "#fff" };
const LABEL_STYLE = { color: "hsl(220, 10%, 65%)" };
const BORDER_COLOR = "hsl(220, 15%, 18%)";
const TEXT_DIM = "hsl(220, 10%, 50%)";
const TEXT_MID = "hsl(220, 10%, 70%)";
const TEXT_BRIGHT = "hsl(220, 10%, 80%)";

type NavItem = {
  id: string;
  label: string;
  icon: any;
};

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "数据总览", icon: LayoutDashboard },
  { id: "orders", label: "订单管理", icon: ShoppingCart },
  { id: "users", label: "用户管理", icon: Users },
  { id: "models", label: "AI模型", icon: Bot },
  { id: "templates", label: "Prompt模板", icon: FileText },
  { id: "logs", label: "调用日志", icon: Activity },
  { id: "records", label: "生成记录", icon: Eye },
  { id: "system", label: "系统监控", icon: Shield },
];

const OPENROUTER_MODELS = [
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { value: "google/gemini-3-pro-image-preview", label: "Nano Banana Pro (生图)" },
  { value: "google/gemini-3.1-flash-image-preview", label: "Nano Banana 2 (生图)" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "openai/gpt-4.1", label: "GPT-4.1" },
  { value: "openai/gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "openai/gpt-4.1-nano", label: "GPT-4.1 Nano" },
  { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { value: "deepseek/deepseek-chat-v3-0324", label: "DeepSeek V3" },
  { value: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick" },
  { value: "black-forest-labs/flux-schnell", label: "Flux Schnell (图片)" },
  { value: "black-forest-labs/flux-1.1-pro", label: "Flux 1.1 Pro (图片)" },
];

// ── Admin Page ──
const AdminPage = () => {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (adminLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "hsl(220, 15%, 6%)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: NEON.cyan, borderTopColor: "transparent" }} />
          <span className="text-sm" style={{ color: TEXT_DIM }}>验证权限中...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "hsl(220, 15%, 6%)" }}>
        <div className="text-center space-y-3 p-8 rounded-2xl" style={{ background: "hsl(220, 15%, 10%)", border: `1px solid ${BORDER_COLOR}` }}>
          <Shield className="w-12 h-12 mx-auto" style={{ color: NEON.rose }} />
          <h2 className="text-lg font-bold" style={{ color: "#fff" }}>无权限访问</h2>
          <p className="text-sm" style={{ color: TEXT_DIM }}>此页面仅限管理员访问</p>
        </div>
      </div>
    );
  }

  const currentNav = NAV_ITEMS.find(n => n.id === activeNav)!;

  return (
    <div className="fixed inset-0 flex" style={{ background: "hsl(220, 15%, 6%)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="h-full flex flex-col transition-all duration-300 shrink-0"
        style={{
          width: sidebarCollapsed ? 64 : 220,
          background: "hsl(220, 18%, 8%)",
          borderRight: `1px solid hsl(220, 15%, 14%)`,
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 gap-3 shrink-0" style={{ borderBottom: `1px solid hsl(220, 15%, 14%)` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.violet})` }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white truncate">MTERP</h1>
              <p className="text-[10px] truncate" style={{ color: TEXT_DIM }}>站长工作台</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    background: isActive ? "hsl(195, 100%, 50%, 0.12)" : "transparent",
                    color: isActive ? NEON.cyan : "hsl(220, 10%, 55%)",
                    borderLeft: isActive ? `3px solid ${NEON.cyan}` : "3px solid transparent",
                  }}
                  title={item.label}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="px-2 py-3 space-y-1 shrink-0" style={{ borderTop: `1px solid hsl(220, 15%, 14%)` }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all hover:bg-white/5"
            style={{ color: TEXT_DIM }}
          >
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${sidebarCollapsed ? "rotate-[-90deg]" : "rotate-90"}`} />
            {!sidebarCollapsed && <span>收起侧栏</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0"
          style={{ background: "hsl(220, 15%, 8%)", borderBottom: `1px solid hsl(220, 15%, 14%)` }}>
          <div className="flex items-center gap-3">
            <currentNav.icon className="w-5 h-5" style={{ color: NEON.cyan }} />
            <h2 className="text-base font-semibold text-white">{currentNav.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-xs" style={{ background: "hsl(160, 70%, 45%, 0.15)", color: "hsl(160, 70%, 55%)" }}>
              管理员
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6" style={{ background: "hsl(220, 15%, 6%)" }}>
          <div className="max-w-[1400px] mx-auto admin-dark">
            {activeNav === "overview" && <OverviewPanel />}
            {activeNav === "orders" && <OrderPanel />}
            {activeNav === "users" && <UserPanel />}
            {activeNav === "models" && <ModelPanel />}
            {activeNav === "templates" && <TemplatePanel />}
            {activeNav === "logs" && <LogsPanel />}
            {activeNav === "records" && <RecordsPanel />}
            {activeNav === "system" && <SystemPanel />}
          </div>
        </div>
      </main>
    </div>
  );
};

// ── KPI Card ──
const KPICard = ({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) => (
  <div className="admin-kpi-card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs uppercase tracking-wider" style={{ color: TEXT_DIM }}>{label}</span>
      <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
  </div>
);

// ── Section Wrapper ──
const Section = ({ title, icon: Icon, defaultOpen = true, children }: {
  title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-3 py-3 px-1 group cursor-pointer select-none">
          <Icon className="w-5 h-5" style={{ color: NEON.cyan }} />
          <span className="text-base font-semibold text-white tracking-wide">{title}</span>
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`} style={{ color: NEON.cyan }} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent><div className="pb-6">{children}</div></CollapsibleContent>
    </Collapsible>
  );
};

// ═══════════════════════════════════════
// OVERVIEW PANEL
// ═══════════════════════════════════════
const OverviewPanel = () => {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({ todayRevenue: 0, totalRevenue: 0, todayOrders: 0, totalOrders: 0, todayNewUsers: 0, totalUsers: 0, todayAICalls: 0, todayProfit: 0 });
  const [analyticsRange, setAnalyticsRange] = useState<"7" | "30" | "180">("7");
  const [salesRange, setSalesRange] = useState<"30" | "180">("30");
  const [visitStats, setVisitStats] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [paidStats, setPaidStats] = useState({ paid: 0, free: 0 });
  const [topConsumers, setTopConsumers] = useState<any[]>([]);
  const [aiData, setAiData] = useState<any[]>([]);
  const [aiTotals, setAiTotals] = useState({ calls: 0, tokens: 0, cost: 0 });

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
      const totalRevenue = recharges.reduce((s, r) => s + r.amount, 0);
      const todayRecharges = recharges.filter(r => r.created_at?.startsWith(today));
      const todayRevenue = todayRecharges.reduce((s, r) => s + r.amount, 0);
      const todayNewUsers = profiles.filter(p => p.created_at?.startsWith(today)).length;
      const todayAI = aiLogs.filter(l => l.created_at?.startsWith(today));
      const todayAICost = todayAI.reduce((s, l) => s + l.points_cost, 0) * 0.01;
      setKpi({ todayRevenue, totalRevenue, todayOrders: todayRecharges.length, totalOrders: recharges.length, todayNewUsers, totalUsers: profiles.length, todayAICalls: todayAI.length, todayProfit: todayRevenue - todayAICost });

      // Growth
      const growthMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); growthMap.set(d.toISOString().split("T")[0], 0); }
      profiles.forEach(p => { const day = p.created_at?.split("T")[0] || ""; if (growthMap.has(day)) growthMap.set(day, (growthMap.get(day) || 0) + 1); });
      setGrowthData(Array.from(growthMap.entries()).map(([d, c]) => ({ date: d.slice(5), count: c })));

      // Paid vs free
      const paidUsers = new Set(recharges.map(r => r.user_id));
      setPaidStats({ paid: paidUsers.size, free: profiles.length - paidUsers.size });

      // Top consumers
      const consumeMap = new Map<string, number>();
      aiLogs.forEach(l => consumeMap.set(l.user_id, (consumeMap.get(l.user_id) || 0) + l.points_cost));
      const profileMap = new Map(profiles.map(p => [p.id, p.email || p.phone || "—"]));
      setTopConsumers(Array.from(consumeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([uid, total]) => ({ email: profileMap.get(uid) || "—", total })));

      // AI cost
      const aiDateMap = new Map<string, { calls: number; tokens: number; cost: number; revenue: number }>();
      for (let i = 0; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() - i); aiDateMap.set(d.toISOString().split("T")[0], { calls: 0, tokens: 0, cost: 0, revenue: 0 }); }
      let tc = 0, tt = 0, tco = 0;
      aiLogs.forEach(l => { const day = l.created_at?.split("T")[0] || ""; const tk = l.prompt_tokens + l.completion_tokens; const c = l.points_cost * 0.01; tc++; tt += tk; tco += c; if (aiDateMap.has(day)) { const e = aiDateMap.get(day)!; e.calls++; e.tokens += tk; e.cost += c; } });
      recharges.forEach(r => { const day = r.created_at?.split("T")[0] || ""; if (aiDateMap.has(day)) aiDateMap.get(day)!.revenue += r.amount; });
      setAiTotals({ calls: tc, tokens: tt, cost: Math.round(tco * 100) / 100 });
      setAiData(Array.from(aiDateMap.entries()).map(([d, v]) => ({ date: d.slice(5), calls: v.calls, tokens: v.tokens, cost: Math.round(v.cost * 100) / 100, revenue: v.revenue, profit: Math.round((v.revenue - v.cost) * 100) / 100 })).sort((a, b) => a.date.localeCompare(b.date)));
      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchVisits = async () => {
      const days = parseInt(analyticsRange);
      const start = new Date(); start.setDate(start.getDate() - days);
      const { data: views } = await (supabase.from("page_views" as any) as any).select("*").gte("visit_date", start.toISOString().split("T")[0]).order("created_at", { ascending: false });
      if (!views) return;
      const dateMap = new Map<string, { visitors: Set<string>; total: number; desktop: number; mobile: number }>();
      for (let i = 0; i < days; i++) { const d = new Date(); d.setDate(d.getDate() - i); dateMap.set(d.toISOString().split("T")[0], { visitors: new Set(), total: 0, desktop: 0, mobile: 0 }); }
      (views as any[]).forEach(v => { const day = v.visit_date; if (!dateMap.has(day)) dateMap.set(day, { visitors: new Set(), total: 0, desktop: 0, mobile: 0 }); const e = dateMap.get(day)!; e.visitors.add(v.visitor_id); e.total++; if (v.device_type === "mobile") e.mobile++; else e.desktop++; });
      setVisitStats(Array.from(dateMap.entries()).map(([d, v]) => ({ date: d.slice(5), total: v.total, unique: v.visitors.size, desktop: v.desktop, mobile: v.mobile })).sort((a, b) => a.date.localeCompare(b.date)));
    };
    fetchVisits();
  }, [analyticsRange]);

  useEffect(() => {
    const fetchSales = async () => {
      const days = parseInt(salesRange);
      const start = new Date(); start.setDate(start.getDate() - days);
      const [rRes, aRes] = await Promise.all([
        supabase.from("recharge_records").select("amount, created_at, status").gte("created_at", start.toISOString().split("T")[0]),
        supabase.from("ai_logs").select("points_cost, created_at").gte("created_at", start.toISOString().split("T")[0]),
      ]);
      const dateMap = new Map<string, { revenue: number; orders: number; aiCost: number }>();
      for (let i = 0; i < days; i++) { const d = new Date(); d.setDate(d.getDate() - i); dateMap.set(d.toISOString().split("T")[0], { revenue: 0, orders: 0, aiCost: 0 }); }
      (rRes.data || []).filter(r => r.status === "success").forEach(r => { const day = r.created_at?.split("T")[0] || ""; if (dateMap.has(day)) { const e = dateMap.get(day)!; e.revenue += r.amount; e.orders++; } });
      (aRes.data || []).forEach(l => { const day = l.created_at?.split("T")[0] || ""; if (dateMap.has(day)) dateMap.get(day)!.aiCost += l.points_cost * 0.01; });
      setSalesData(Array.from(dateMap.entries()).map(([d, v]) => ({ date: d.slice(5), revenue: Math.round(v.revenue * 100) / 100, orders: v.orders, aiCost: Math.round(v.aiCost * 100) / 100, profit: Math.round((v.revenue - v.aiCost) * 100) / 100 })).sort((a, b) => a.date.localeCompare(b.date)));
    };
    fetchSales();
  }, [salesRange]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: NEON.cyan, borderTopColor: "transparent" }} /></div>;

  const totalDesktop = visitStats.reduce((s, v) => s + v.desktop, 0);
  const totalMobile = visitStats.reduce((s, v) => s + v.mobile, 0);
  const pieDevice = [{ name: "电脑端", value: totalDesktop }, { name: "手机端", value: totalMobile }];
  const piePaid = [{ name: "付费用户", value: paidStats.paid }, { name: "免费用户", value: paidStats.free }];

  return (
    <div className="space-y-2">
      <Section title="核心数据概览" icon={Activity}>
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
      </Section>

      <div className="border-t" style={{ borderColor: BORDER_COLOR }} />

      <Section title="网站访问统计" icon={Eye} defaultOpen={false}>
        <div className="flex gap-2 mb-4">
          {(["7", "30", "180"] as const).map(r => (
            <button key={r} onClick={() => setAnalyticsRange(r)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={analyticsRange === r ? { background: NEON.cyan, color: "#000", boxShadow: `0 0 12px hsl(195, 100%, 50%, 0.3)` } : { background: "hsl(220, 15%, 15%)", color: "hsl(220, 10%, 55%)" }}>
              近{r}天
            </button>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <div className="admin-kpi-card p-4"><span className="text-xs" style={{ color: TEXT_DIM }}>总访问量</span><p className="text-xl font-bold mt-1 text-white">{visitStats.reduce((s, v) => s + v.total, 0).toLocaleString()}</p></div>
          <div className="admin-kpi-card p-4"><span className="text-xs" style={{ color: TEXT_DIM }}>独立访客</span><p className="text-xl font-bold mt-1 text-white">{visitStats.reduce((s, v) => s + v.unique, 0).toLocaleString()}</p></div>
          <div className="admin-kpi-card p-4 flex items-center gap-4">
            <div className="flex-1"><span className="text-xs" style={{ color: TEXT_DIM }}>设备占比</span>
              <div className="flex gap-3 mt-2 text-xs"><span className="flex items-center gap-1"><Monitor className="w-3 h-3" style={{ color: NEON.cyan }} />{totalDesktop}</span><span className="flex items-center gap-1"><Smartphone className="w-3 h-3" style={{ color: NEON.violet }} />{totalMobile}</span></div>
            </div>
            <ResponsiveContainer width={60} height={60}><PieChart><Pie data={pieDevice} dataKey="value" cx="50%" cy="50%" outerRadius={28} strokeWidth={0}><Cell fill={NEON.cyan} /><Cell fill={NEON.violet} /></Pie></PieChart></ResponsiveContainer>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="admin-glass p-4"><p className="text-xs font-medium mb-3" style={{ color: NEON.cyan }}>访问趋势</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={visitStats}><defs><linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={NEON.cyan} stopOpacity={0.3} /><stop offset="100%" stopColor={NEON.cyan} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><Tooltip contentStyle={TOOLTIP_STYLE} /><Area type="monotone" dataKey="total" name="总访问" stroke={NEON.cyan} fill="url(#visitGrad)" strokeWidth={2} /></AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-glass p-4"><p className="text-xs font-medium mb-3" style={{ color: NEON.cyan }}>设备分布</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={visitStats}><CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><Tooltip contentStyle={TOOLTIP_STYLE} /><Bar dataKey="desktop" name="电脑端" fill={NEON.cyan} radius={[3, 3, 0, 0]} /><Bar dataKey="mobile" name="手机端" fill={NEON.violet} radius={[3, 3, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      <div className="border-t" style={{ borderColor: BORDER_COLOR }} />

      <Section title="销售与盈利报表" icon={BarChart3} defaultOpen={false}>
        <div className="flex gap-2 mb-4">
          {(["30", "180"] as const).map(r => (
            <button key={r} onClick={() => setSalesRange(r)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={salesRange === r ? { background: NEON.cyan, color: "#000", boxShadow: `0 0 12px hsl(195, 100%, 50%, 0.3)` } : { background: "hsl(220, 15%, 15%)", color: "hsl(220, 10%, 55%)" }}>
              {r === "30" ? "近30天" : "近6个月"}
            </button>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="admin-glass p-4"><p className="text-xs font-medium mb-3" style={{ color: NEON.cyan }}>营收 / 成本 / 利润</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData}><CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" interval={salesRange === "180" ? 6 : 1} /><YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><Tooltip contentStyle={TOOLTIP_STYLE} /><Legend wrapperStyle={{ color: "#aaa", fontSize: 11 }} /><Line type="monotone" dataKey="revenue" name="营收(¥)" stroke={NEON.emerald} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="aiCost" name="AI成本(¥)" stroke={NEON.rose} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="profit" name="利润(¥)" stroke={NEON.cyan} strokeWidth={2} dot={false} /></LineChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-glass p-4"><p className="text-xs font-medium mb-3" style={{ color: NEON.cyan }}>每日订单趋势</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData}><CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" interval={salesRange === "180" ? 6 : 1} /><YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" allowDecimals={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Bar dataKey="orders" name="订单数" fill={NEON.cyan} radius={[3, 3, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      <div className="border-t" style={{ borderColor: BORDER_COLOR }} />

      <Section title="用户运营分析" icon={UserCheck} defaultOpen={false}>
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <div className="admin-glass p-4"><p className="text-xs font-medium mb-3" style={{ color: NEON.cyan }}>近30天新用户增长</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}><defs><linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={NEON.teal} stopOpacity={0.3} /><stop offset="100%" stopColor={NEON.teal} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" allowDecimals={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Area type="monotone" dataKey="count" name="新增用户" stroke={NEON.teal} fill="url(#growthGrad)" strokeWidth={2} /></AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-glass p-4 flex items-center justify-around">
            <div className="text-center"><p className="text-xs mb-2" style={{ color: TEXT_DIM }}>付费/免费占比</p>
              <ResponsiveContainer width={160} height={160}>
                <PieChart><Pie data={piePaid} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={40} strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}><Cell fill={NEON.emerald} /><Cell fill={NEON.blue} /></Pie><Tooltip contentStyle={TOOLTIP_STYLE} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{ background: NEON.emerald }} /><span style={{ color: TEXT_MID }}>付费: {paidStats.paid}</span></div>
              <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{ background: NEON.blue }} /><span style={{ color: TEXT_MID }}>免费: {paidStats.free}</span></div>
            </div>
          </div>
        </div>
        <div className="admin-glass p-4"><p className="text-xs font-medium mb-3" style={{ color: NEON.cyan }}>积分消耗 TOP 8</p>
          <div className="space-y-2">{topConsumers.map((u, i) => { const maxVal = topConsumers[0]?.total || 1; return (
            <div key={i} className="flex items-center gap-3"><span className="text-xs w-5 text-right font-mono" style={{ color: TEXT_DIM }}>#{i + 1}</span><span className="text-xs truncate w-36" style={{ color: TEXT_MID }}>{u.email}</span><div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(220, 15%, 18%)" }}><div className="h-full rounded-full" style={{ width: `${(u.total / maxVal) * 100}%`, background: `linear-gradient(90deg, ${NEON.cyan}, ${NEON.violet})` }} /></div><span className="text-xs font-semibold w-16 text-right" style={{ color: NEON.cyan }}>{u.total.toLocaleString()}</span></div>
          ); })}</div>
        </div>
      </Section>

      <div className="border-t" style={{ borderColor: BORDER_COLOR }} />

      <Section title="AI 成本与利润核算" icon={Cpu} defaultOpen={false}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="admin-kpi-card p-4"><span className="text-xs" style={{ color: TEXT_DIM }}>30天调用</span><p className="text-xl font-bold mt-1" style={{ color: NEON.cyan }}>{aiTotals.calls.toLocaleString()}</p></div>
          <div className="admin-kpi-card p-4"><span className="text-xs" style={{ color: TEXT_DIM }}>Token消耗</span><p className="text-xl font-bold mt-1" style={{ color: NEON.amber }}>{aiTotals.tokens.toLocaleString()}</p></div>
          <div className="admin-kpi-card p-4"><span className="text-xs" style={{ color: TEXT_DIM }}>AI总成本</span><p className="text-xl font-bold mt-1" style={{ color: NEON.rose }}>¥{aiTotals.cost.toFixed(2)}</p></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="admin-glass p-4"><p className="text-xs font-medium mb-3" style={{ color: NEON.cyan }}>每日调用量</p>
            <ResponsiveContainer width="100%" height={240}><BarChart data={aiData}><CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><Tooltip contentStyle={TOOLTIP_STYLE} /><Bar dataKey="calls" name="调用次数" fill={NEON.cyan} radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
          <div className="admin-glass p-4"><p className="text-xs font-medium mb-3" style={{ color: NEON.cyan }}>利润 = 营收 - AI成本</p>
            <ResponsiveContainer width="100%" height={240}><LineChart data={aiData}><CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 40%)" /><Tooltip contentStyle={TOOLTIP_STYLE} /><Legend wrapperStyle={{ color: "#aaa", fontSize: 11 }} /><Line type="monotone" dataKey="revenue" name="营收" stroke={NEON.emerald} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="cost" name="AI成本" stroke={NEON.rose} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="profit" name="利润" stroke={NEON.cyan} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </Section>
    </div>
  );
};

// ═══════════════════════════════════════
// ORDER PANEL
// ═══════════════════════════════════════
const OrderPanel = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("recharge_records").select("*").order("created_at", { ascending: false }).limit(1000);
      if (!data) { setLoading(false); return; }
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email, phone").in("id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p.email || p.phone || "—"]) || []);
      const enriched = data.map(r => ({ ...r, user_email: profileMap.get(r.user_id) || "—" }));
      setOrders(enriched); setFiltered(enriched); setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    let result = orders;
    if (search) { const q = search.toLowerCase(); result = result.filter(r => r.user_email?.toLowerCase().includes(q) || String(r.amount).includes(q)); }
    if (dateFrom) result = result.filter(r => r.created_at >= dateFrom);
    if (dateTo) result = result.filter(r => r.created_at <= dateTo + "T23:59:59");
    setFiltered(result);
  }, [search, dateFrom, dateTo, orders]);

  const exportCSV = () => {
    const header = "用户,金额,积分,状态,时间\n";
    const rows = filtered.map(r => `${r.user_email},${r.amount},${r.points},${r.status},${new Date(r.created_at).toLocaleString("zh-CN")}`).join("\n");
    const blob = new Blob(["\ufeff" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-8" style={{ color: TEXT_DIM }}>加载中...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]"><label className="text-xs mb-1 block" style={{ color: TEXT_DIM }}>搜索用户/金额</label><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220, 10%, 40%)" }} /><Input className="pl-9" placeholder="搜索..." value={search} onChange={e => setSearch(e.target.value)} style={INPUT_STYLE} /></div></div>
        <div><label className="text-xs mb-1 block" style={{ color: TEXT_DIM }}>起始日期</label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={INPUT_STYLE} /></div>
        <div><label className="text-xs mb-1 block" style={{ color: TEXT_DIM }}>截止日期</label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={INPUT_STYLE} /></div>
        <Button className="gap-2 border-0" onClick={exportCSV} style={{ background: NEON.cyan, color: "#000" }}><Download className="w-4 h-4" />导出 CSV</Button>
      </div>
      <div className="admin-glass overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: BORDER_COLOR }}><h3 className="text-sm font-semibold" style={{ color: NEON.cyan }}>订单列表（共 {filtered.length} 条）</h3></div>
        <div className="p-4"><div className="max-h-[500px] overflow-auto">
          <Table><TableHeader><TableRow className="border-b" style={{ borderColor: BORDER_COLOR }}><TableHead style={{ color: TEXT_DIM }}>用户</TableHead><TableHead style={{ color: TEXT_DIM }}>金额</TableHead><TableHead style={{ color: TEXT_DIM }}>积分</TableHead><TableHead style={{ color: TEXT_DIM }}>状态</TableHead><TableHead style={{ color: TEXT_DIM }}>时间</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.slice(0, 200).map(r => (
              <TableRow key={r.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                <TableCell className="text-xs" style={{ color: TEXT_MID }}>{r.user_email}</TableCell>
                <TableCell className="font-medium" style={{ color: NEON.amber }}>¥{r.amount}</TableCell>
                <TableCell style={{ color: "hsl(160, 70%, 55%)" }}>+{r.points.toLocaleString()}</TableCell>
                <TableCell><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: r.status === "success" ? "hsl(160, 70%, 45%, 0.15)" : "hsl(220, 15%, 20%)", color: r.status === "success" ? "hsl(160, 70%, 55%)" : "hsl(220, 10%, 45%)" }}>{r.status === "success" ? "成功" : r.status}</span></TableCell>
                <TableCell className="text-xs" style={{ color: TEXT_DIM }}>{new Date(r.created_at).toLocaleString("zh-CN")}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div></div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// USER PANEL
// ═══════════════════════════════════════
const UserPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, email, phone, created_at, last_sign_in_at").order("created_at", { ascending: false });
    if (!profiles) { setLoading(false); return; }
    const { data: points } = await supabase.from("user_points").select("user_id, remaining_points");
    const pointsMap = new Map(points?.map(p => [p.user_id, p.remaining_points]) || []);
    setUsers(profiles.map(p => ({ ...p, remaining_points: pointsMap.get(p.id) ?? 0 }))); setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdjustPoints = async () => {
    if (!adjustUserId || !adjustAmount) return;
    setAdjusting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-points", { body: { user_id: adjustUserId, amount: parseInt(adjustAmount), reason: adjustReason } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      toast.success(`积分修改成功，当前积分: ${data.remaining_points}`);
      setAdjustUserId(null); setAdjustAmount(""); setAdjustReason(""); fetchUsers();
    } catch (e: any) { toast.error(e.message || "操作失败"); }
    setAdjusting(false);
  };

  if (loading) return <div className="text-center py-8" style={{ color: TEXT_DIM }}>加载中...</div>;

  return (
    <div className="admin-glass overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: BORDER_COLOR }}><h3 className="text-sm font-semibold" style={{ color: NEON.cyan }}>用户列表（{users.length}）</h3></div>
      <div className="p-4"><div className="overflow-auto max-h-[600px]">
        <Table><TableHeader><TableRow className="border-b" style={{ borderColor: BORDER_COLOR }}>
          <TableHead style={{ color: TEXT_DIM }}>邮箱/手机号</TableHead><TableHead style={{ color: TEXT_DIM }}>注册时间</TableHead><TableHead style={{ color: TEXT_DIM }}>最后登录</TableHead><TableHead style={{ color: TEXT_DIM }}>剩余积分</TableHead><TableHead style={{ color: TEXT_DIM }}>操作</TableHead>
        </TableRow></TableHeader>
          <TableBody>{users.map(u => (
            <TableRow key={u.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
              <TableCell style={{ color: TEXT_MID }}>{u.email || u.phone || "—"}</TableCell>
              <TableCell className="text-xs" style={{ color: TEXT_DIM }}>{new Date(u.created_at).toLocaleString("zh-CN")}</TableCell>
              <TableCell className="text-xs" style={{ color: TEXT_DIM }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("zh-CN") : "—"}</TableCell>
              <TableCell className="font-semibold" style={{ color: NEON.cyan }}>{u.remaining_points}</TableCell>
              <TableCell>
                <Dialog open={adjustUserId === u.id} onOpenChange={open => { if (!open) setAdjustUserId(null); }}>
                  <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1 border-0 text-xs" style={{ background: "hsl(220, 15%, 18%)", color: NEON.cyan }} onClick={() => setAdjustUserId(u.id)}><Coins className="w-3 h-3" />修改积分</Button></DialogTrigger>
                  <DialogContent style={{ background: "hsl(220, 15%, 12%)", border: "1px solid hsl(220, 15%, 22%)", color: "hsl(0, 0%, 90%)" }}>
                    <DialogHeader><DialogTitle style={{ color: NEON.cyan }}>修改积分 - {u.email || u.phone}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm" style={{ color: TEXT_DIM }}>当前积分: <span className="font-bold" style={{ color: NEON.cyan }}>{u.remaining_points}</span></p>
                      <div className="space-y-2"><Label style={LABEL_STYLE}>调整数量（正数增加，负数减少）</Label><Input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="如: 100 或 -50" style={INPUT_STYLE} /></div>
                      <div className="space-y-2"><Label style={LABEL_STYLE}>原因（选填）</Label><Input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="如: 充值、补偿" style={INPUT_STYLE} /></div>
                      <Button onClick={handleAdjustPoints} disabled={adjusting || !adjustAmount} className="w-full border-0" style={{ background: NEON.cyan, color: "#000" }}>{adjusting ? "处理中..." : "确认修改"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div></div>
    </div>
  );
};

// ═══════════════════════════════════════
// MODEL PANEL
// ═══════════════════════════════════════
const ModelPanel = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ model_name: "", display_name: "", api_key: "", input_points_per_1k_tokens: "1", image_points_per_image: "1", output_points_per_1k_tokens: "6", is_active: true });

  const fetchConfigs = async () => { const { data } = await supabase.from("ai_config").select("*").order("created_at"); if (data) setConfigs(data); setLoading(false); };
  useEffect(() => { fetchConfigs(); }, []);

  const resetForm = () => { setForm({ model_name: "", display_name: "", api_key: "", input_points_per_1k_tokens: "1", image_points_per_image: "1", output_points_per_1k_tokens: "6", is_active: true }); setEditing(null); };
  const startEdit = (c: any) => { setEditing(c); setForm({ model_name: c.model_name, display_name: c.display_name, api_key: c.api_key || "", input_points_per_1k_tokens: String(c.input_points_per_1k_tokens), image_points_per_image: String(c.image_points_per_image), output_points_per_1k_tokens: String(c.output_points_per_1k_tokens), is_active: c.is_active }); };

  const handleSave = async () => {
    const payload = { model_name: form.model_name, display_name: form.display_name, api_key: form.api_key || null, input_points_per_1k_tokens: parseInt(form.input_points_per_1k_tokens) || 1, image_points_per_image: parseInt(form.image_points_per_image) || 1, output_points_per_1k_tokens: parseInt(form.output_points_per_1k_tokens) || 6, is_active: form.is_active };
    if (editing) { const { error } = await supabase.from("ai_config").update(payload).eq("id", editing.id); if (error) { toast.error(error.message); return; } toast.success("模型配置已更新"); }
    else { const { error } = await supabase.from("ai_config").insert(payload); if (error) { toast.error(error.message); return; } toast.success("模型已添加"); }
    resetForm(); fetchConfigs();
  };

  const handleDelete = async (id: string) => { if (!confirm("确定删除该模型？")) return; await supabase.from("ai_config").delete().eq("id", id); toast.success("已删除"); fetchConfigs(); };

  return (
    <div className="space-y-4">
      <div className="admin-glass p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NEON.cyan }}>{editing ? "编辑模型" : "添加模型"}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label style={LABEL_STYLE}>模型名称 (API)</Label><Input value={form.model_name} onChange={e => setForm({ ...form, model_name: e.target.value })} placeholder="google/gemini-2.5-flash" style={INPUT_STYLE} /></div>
          <div className="space-y-2"><Label style={LABEL_STYLE}>显示名称</Label><Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Gemini 2.5 Flash" style={INPUT_STYLE} /></div>
          <div className="space-y-2"><Label style={LABEL_STYLE}>输入价格 (积分/1000 tokens)</Label><Input type="number" value={form.input_points_per_1k_tokens} onChange={e => setForm({ ...form, input_points_per_1k_tokens: e.target.value })} style={INPUT_STYLE} /></div>
          <div className="space-y-2"><Label style={LABEL_STYLE}>图片价格 (积分/张)</Label><Input type="number" value={form.image_points_per_image} onChange={e => setForm({ ...form, image_points_per_image: e.target.value })} style={INPUT_STYLE} /></div>
          <div className="space-y-2"><Label style={LABEL_STYLE}>输出价格 (积分/1000 tokens)</Label><Input type="number" value={form.output_points_per_1k_tokens} onChange={e => setForm({ ...form, output_points_per_1k_tokens: e.target.value })} style={INPUT_STYLE} /></div>
          <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} /><Label style={LABEL_STYLE}>启用</Label></div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} disabled={!form.model_name || !form.display_name} className="border-0" style={{ background: NEON.cyan, color: "#000" }}>{editing ? "保存修改" : "添加模型"}</Button>
          {editing && <Button variant="outline" onClick={resetForm} style={{ background: "hsl(220, 15%, 18%)", color: TEXT_MID, border: "1px solid hsl(220, 15%, 22%)" }}>取消</Button>}
        </div>
      </div>
      <div className="admin-glass overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: BORDER_COLOR }}><h3 className="text-sm font-semibold" style={{ color: NEON.cyan }}>模型列表</h3></div>
        <div className="p-4"><Table><TableHeader><TableRow className="border-b" style={{ borderColor: BORDER_COLOR }}>
          <TableHead style={{ color: TEXT_DIM }}>显示名称</TableHead><TableHead style={{ color: TEXT_DIM }}>模型</TableHead><TableHead style={{ color: TEXT_DIM }}>输入/1K</TableHead><TableHead style={{ color: TEXT_DIM }}>图片/张</TableHead><TableHead style={{ color: TEXT_DIM }}>输出/1K</TableHead><TableHead style={{ color: TEXT_DIM }}>状态</TableHead><TableHead style={{ color: TEXT_DIM }}>操作</TableHead>
        </TableRow></TableHeader>
          <TableBody>{configs.map(c => (
            <TableRow key={c.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
              <TableCell className="font-medium" style={{ color: TEXT_BRIGHT }}>{c.display_name}</TableCell>
              <TableCell className="text-xs" style={{ color: TEXT_DIM }}>{c.model_name}</TableCell>
              <TableCell style={{ color: TEXT_MID }}>{c.input_points_per_1k_tokens}</TableCell>
              <TableCell style={{ color: TEXT_MID }}>{c.image_points_per_image}</TableCell>
              <TableCell style={{ color: TEXT_MID }}>{c.output_points_per_1k_tokens}</TableCell>
              <TableCell><span className="px-2 py-1 rounded-full text-xs" style={{ background: c.is_active ? "hsl(160, 70%, 45%, 0.15)" : "hsl(220, 15%, 20%)", color: c.is_active ? "hsl(160, 70%, 55%)" : "hsl(220, 10%, 45%)" }}>{c.is_active ? "启用" : "停用"}</span></TableCell>
              <TableCell className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => startEdit(c)} style={{ color: NEON.cyan }}><Edit2 className="w-3 h-3" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} style={{ color: NEON.rose }}><Trash2 className="w-3 h-3" /></Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table></div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// TEMPLATE PANEL
// ═══════════════════════════════════════
const TemplatePanel = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [form, setForm] = useState({ template_name: "", template_content: "", model: "google/gemini-2.5-flash" });
  const [testVars, setTestVars] = useState<Record<string, string>>({});

  const fetchTemplates = async () => { const { data } = await supabase.from("prompt_templates").select("*").order("created_at"); if (data) setTemplates(data); setLoading(false); };
  useEffect(() => { fetchTemplates(); }, []);

  const resetForm = () => { setForm({ template_name: "", template_content: "", model: "google/gemini-2.5-flash" }); setEditingId(null); setShowForm(false); };
  const startEdit = (t: any) => { setEditingId(t.id); setForm({ template_name: t.template_name, template_content: t.template_content, model: t.model }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.template_name || !form.template_content) { toast.error("模板名称和内容不能为空"); return; }
    const payload = { template_name: form.template_name, template_content: form.template_content, model: form.model };
    if (editingId) { const { error } = await supabase.from("prompt_templates").update(payload).eq("id", editingId); if (error) { toast.error(error.message); return; } toast.success("模板已更新"); }
    else { const { error } = await supabase.from("prompt_templates").insert(payload); if (error) { toast.error(error.message); return; } toast.success("模板已添加"); }
    resetForm(); fetchTemplates();
  };

  const handleDelete = async (id: string) => { if (!confirm("确定删除？")) return; await supabase.from("prompt_templates").delete().eq("id", id); toast.success("已删除"); fetchTemplates(); };

  const extractVars = (c: string) => [...new Set((c.match(/\{\{(\w+)\}\}/g) || []).map(m => m.replace(/\{\{|\}\}/g, "")))];
  const handlePreview = (t: any) => { const vars = extractVars(t.template_content); const init: Record<string, string> = {}; vars.forEach(v => { init[v] = testVars[v] || ""; }); setTestVars(init); setPreviewContent(t.template_content); setPreviewOpen(true); };
  const renderPreview = () => { let r = previewContent; Object.entries(testVars).forEach(([k, v]) => { r = r.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v || `[${k}]`); }); return r; };

  return (
    <div className="space-y-4">
      {showForm && (
        <div className="admin-glass p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: NEON.cyan }}>{editingId ? "编辑模板" : "新增模板"}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label style={LABEL_STYLE}>模板名称</Label><Input value={form.template_name} onChange={e => setForm({ ...form, template_name: e.target.value })} placeholder="如：卖点分析" style={INPUT_STYLE} /></div>
              <div className="space-y-2"><Label style={LABEL_STYLE}>AI 模型</Label>
                <Select value={form.model} onValueChange={v => setForm({ ...form, model: v })}><SelectTrigger style={INPUT_STYLE} className="w-full"><SelectValue placeholder="选择模型" /></SelectTrigger><SelectContent style={{ background: "hsl(220, 15%, 15%)", border: "1px solid hsl(220, 15%, 22%)" }}>{OPENROUTER_MODELS.map(m => (<SelectItem key={m.value} value={m.value} style={{ color: "#fff" }} className="focus:bg-[hsl(220,15%,22%)] focus:text-white"><span className="font-medium">{m.label}</span><span className="ml-2 text-xs opacity-50">{m.value}</span></SelectItem>))}</SelectContent></Select>
              </div>
            </div>
            <div className="space-y-2"><Label style={LABEL_STYLE}>Prompt 模板内容 <span className="text-xs" style={{ color: TEXT_DIM }}>支持 {"{{变量}}"} 占位符</span></Label><Textarea value={form.template_content} onChange={e => setForm({ ...form, template_content: e.target.value })} placeholder="输入 Prompt..." className="min-h-[200px] font-mono text-sm" style={INPUT_STYLE} /></div>
            <div className="flex gap-2"><Button onClick={handleSave} disabled={!form.template_name || !form.template_content} className="border-0" style={{ background: NEON.cyan, color: "#000" }}>{editingId ? "保存修改" : "添加模板"}</Button><Button variant="outline" onClick={resetForm} style={{ background: "hsl(220, 15%, 18%)", color: TEXT_MID, border: "1px solid hsl(220, 15%, 22%)" }}>取消</Button></div>
          </div>
        </div>
      )}
      <div className="admin-glass overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: BORDER_COLOR }}>
          <h3 className="text-sm font-semibold" style={{ color: NEON.cyan }}>Prompt 模板列表</h3>
          {!showForm && <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1 border-0" style={{ background: NEON.cyan, color: "#000" }}><Plus className="w-3.5 h-3.5" />新增模板</Button>}
        </div>
        <div className="p-4">{loading ? <div className="text-center py-8" style={{ color: TEXT_DIM }}>加载中...</div> : templates.length === 0 ? <div className="text-center py-8" style={{ color: TEXT_DIM }}>暂无模板</div> : (
          <div className="overflow-auto max-h-[500px]"><Table><TableHeader><TableRow className="border-b" style={{ borderColor: BORDER_COLOR }}><TableHead style={{ color: TEXT_DIM }}>模板名称</TableHead><TableHead style={{ color: TEXT_DIM }}>AI 模型</TableHead><TableHead style={{ color: TEXT_DIM }}>内容预览</TableHead><TableHead style={{ color: TEXT_DIM }}>操作</TableHead></TableRow></TableHeader>
            <TableBody>{templates.map(t => (
              <TableRow key={t.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                <TableCell className="font-medium" style={{ color: TEXT_BRIGHT }}>{t.template_name}</TableCell>
                <TableCell className="text-xs" style={{ color: TEXT_DIM }}>{t.model}</TableCell>
                <TableCell className="text-xs max-w-[300px] truncate" style={{ color: "hsl(220, 10%, 60%)" }}>{t.template_content.slice(0, 80)}...</TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => handlePreview(t)} className="h-7 w-7 p-0" style={{ color: "hsl(160, 70%, 45%)" }}><Eye className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => startEdit(t)} className="h-7 w-7 p-0" style={{ color: NEON.cyan }}><Edit2 className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="h-7 w-7 p-0" style={{ color: NEON.rose }}><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></div>
        )}</div>
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl" style={{ background: "hsl(220, 15%, 12%)", border: "1px solid hsl(220, 15%, 22%)", color: "hsl(0, 0%, 90%)" }}>
          <DialogHeader><DialogTitle style={{ color: NEON.cyan }}>模板预览</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">{Object.keys(testVars).map(key => (<div key={key} className="space-y-1"><Label className="text-xs" style={LABEL_STYLE}>{key}</Label><Input value={testVars[key]} onChange={e => setTestVars(prev => ({ ...prev, [key]: e.target.value }))} placeholder={`输入 ${key}`} className="h-8 text-sm" style={INPUT_STYLE} /></div>))}</div>
            <div><Label className="text-xs mb-2 block" style={LABEL_STYLE}>渲染结果</Label><div className="rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[300px] overflow-auto" style={{ background: "hsl(220, 15%, 8%)", border: `1px solid ${BORDER_COLOR}`, color: TEXT_MID }}>{renderPreview()}</div></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ═══════════════════════════════════════
// LOGS PANEL
// ═══════════════════════════════════════
const LogsPanel = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data: logsData } = await supabase.from("ai_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (!logsData) { setLoading(false); return; }
      const userIds = [...new Set(logsData.map(l => l.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email, phone").in("id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p.email || p.phone || "—"]) || []);
      setLogs(logsData.map(l => ({ ...l, user_email: profileMap.get(l.user_id) || "—" }))); setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="text-center py-8" style={{ color: TEXT_DIM }}>加载中...</div>;

  return (
    <div className="admin-glass overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: BORDER_COLOR }}><h3 className="text-sm font-semibold" style={{ color: NEON.cyan }}>AI 调用日志（最近200条）</h3></div>
      <div className="p-4"><div className="overflow-auto max-h-[600px]">
        <Table><TableHeader><TableRow className="border-b" style={{ borderColor: BORDER_COLOR }}><TableHead style={{ color: TEXT_DIM }}>用户</TableHead><TableHead style={{ color: TEXT_DIM }}>模型</TableHead><TableHead style={{ color: TEXT_DIM }}>图片数</TableHead><TableHead style={{ color: TEXT_DIM }}>输入tokens</TableHead><TableHead style={{ color: TEXT_DIM }}>输出tokens</TableHead><TableHead style={{ color: TEXT_DIM }}>消耗积分</TableHead><TableHead style={{ color: TEXT_DIM }}>时间</TableHead></TableRow></TableHeader>
          <TableBody>{logs.map(l => (
            <TableRow key={l.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
              <TableCell className="text-xs" style={{ color: TEXT_MID }}>{l.user_email}</TableCell>
              <TableCell style={{ color: TEXT_MID }}>{l.model_name}</TableCell>
              <TableCell style={{ color: TEXT_MID }}>{l.image_count}</TableCell>
              <TableCell style={{ color: TEXT_MID }}>{l.prompt_tokens}</TableCell>
              <TableCell style={{ color: TEXT_MID }}>{l.completion_tokens}</TableCell>
              <TableCell className="font-semibold" style={{ color: NEON.cyan }}>{l.points_cost}</TableCell>
              <TableCell className="text-xs" style={{ color: TEXT_DIM }}>{new Date(l.created_at).toLocaleString("zh-CN")}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div></div>
    </div>
  );
};

// ═══════════════════════════════════════
// RECORDS PANEL
// ═══════════════════════════════════════
const RecordsPanel = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("generation_records").select("*").order("created_at", { ascending: false }).limit(100);
      if (!data) { setLoading(false); return; }
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", userIds);
      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);
      setRecords(data.map(r => ({ ...r, user_email: emailMap.get(r.user_id) || r.user_id.substring(0, 8) }))); setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-8" style={{ color: TEXT_DIM }}>加载中...</div>;

  return (
    <div className="space-y-4">
      <div className="admin-glass overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: BORDER_COLOR }}><h3 className="text-sm font-semibold" style={{ color: NEON.cyan }}>用户生成记录 ({records.length})</h3></div>
        <div className="p-4"><div className="overflow-auto max-h-[600px]">
          <Table><TableHeader><TableRow className="border-b" style={{ borderColor: BORDER_COLOR }}><TableHead style={{ color: TEXT_DIM }}>用户</TableHead><TableHead style={{ color: TEXT_DIM }}>产品名称</TableHead><TableHead style={{ color: TEXT_DIM }}>市场</TableHead><TableHead style={{ color: TEXT_DIM }}>生成标题</TableHead><TableHead style={{ color: TEXT_DIM }}>时间</TableHead><TableHead style={{ color: TEXT_DIM }}>操作</TableHead></TableRow></TableHeader>
            <TableBody>{records.map(r => (
              <TableRow key={r.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                <TableCell className="text-xs" style={{ color: TEXT_MID }}>{r.user_email}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate" style={{ color: TEXT_MID }}>{r.product_name}</TableCell>
                <TableCell className="text-xs" style={{ color: TEXT_MID }}>{r.market || "—"}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate" style={{ color: TEXT_MID }}>{r.title || "—"}</TableCell>
                <TableCell className="text-xs" style={{ color: TEXT_DIM }}>{new Date(r.created_at).toLocaleString("zh-CN")}</TableCell>
                <TableCell><Button variant="outline" size="sm" className="gap-1 border-0 text-xs" style={{ background: "hsl(220, 15%, 18%)", color: NEON.cyan }} onClick={() => setDetail(r)}><Eye className="w-3 h-3" />详情</Button></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div></div>
      </div>
      <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: "hsl(220, 15%, 12%)", border: "1px solid hsl(220, 15%, 22%)", color: "hsl(0, 0%, 90%)" }}>
          <DialogHeader><DialogTitle style={{ color: NEON.cyan }}>生成详情 - {detail?.product_name}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div><span className="text-xs font-semibold" style={{ color: TEXT_DIM }}>用户</span><p style={{ color: TEXT_MID }}>{detail.user_email}</p></div>
              <div><span className="text-xs font-semibold" style={{ color: TEXT_DIM }}>产品描述</span><p style={{ color: TEXT_MID }}>{detail.product_description}</p></div>
              {detail.title && <div><span className="text-xs font-semibold" style={{ color: TEXT_DIM }}>生成标题</span><p className="font-medium" style={{ color: NEON.cyan }}>{detail.title}</p></div>}
              {detail.selling_points && <div><span className="text-xs font-semibold" style={{ color: TEXT_DIM }}>卖点</span><ul className="list-disc pl-4 space-y-1" style={{ color: TEXT_MID }}>{(detail.selling_points as string[]).map((p: string, i: number) => <li key={i}>{p}</li>)}</ul></div>}
              {detail.description && <div><span className="text-xs font-semibold" style={{ color: TEXT_DIM }}>描述</span><p className="whitespace-pre-wrap" style={{ color: TEXT_MID }}>{detail.description}</p></div>}
              {detail.main_image && <div><span className="text-xs font-semibold" style={{ color: TEXT_DIM }}>主图</span><img src={detail.main_image} alt="主图" className="w-full max-w-xs rounded-lg mt-1" /></div>}
              {detail.carousel_images && (detail.carousel_images as string[]).length > 0 && <div><span className="text-xs font-semibold" style={{ color: TEXT_DIM }}>轮播图</span><div className="grid grid-cols-3 gap-2 mt-1">{(detail.carousel_images as string[]).map((img: string, i: number) => <img key={i} src={img} alt={`轮播图 ${i + 1}`} className="w-full rounded-lg aspect-square object-cover" />)}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ═══════════════════════════════════════
// SYSTEM PANEL
// ═══════════════════════════════════════
const SystemPanel = () => {
  const [status, setStatus] = useState({ api: "ok" as "ok" | "error", db: "ok" as "ok" | "error", rechargeAnomaly: 0, highUsageUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      let apiOk: "ok" | "error" = "ok";
      let dbOk: "ok" | "error" = "ok";
      const { error: dbErr } = await supabase.from("profiles").select("id").limit(1);
      if (dbErr) dbOk = "error";
      try { const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-listing`, { method: "OPTIONS" }); if (!resp.ok && resp.status !== 204 && resp.status !== 404) apiOk = "error"; } catch { apiOk = "error"; }
      const today = new Date().toISOString().split("T")[0];
      const { data: recharges } = await supabase.from("recharge_records").select("user_id").gte("created_at", today);
      const countMap = new Map<string, number>();
      (recharges || []).forEach(r => countMap.set(r.user_id, (countMap.get(r.user_id) || 0) + 1));
      const rechargeAnomaly = Array.from(countMap.values()).filter(c => c > 5).length;
      const { data: aiLogs } = await supabase.from("ai_logs").select("user_id").gte("created_at", today);
      const aiMap = new Map<string, number>();
      (aiLogs || []).forEach(l => aiMap.set(l.user_id, (aiMap.get(l.user_id) || 0) + 1));
      const highUsageUsers = Array.from(aiMap.values()).filter(c => c > 500).length;
      setStatus({ api: apiOk, db: dbOk, rechargeAnomaly, highUsageUsers }); setLoading(false);
    };
    check();
  }, []);

  if (loading) return <div className="text-center py-8" style={{ color: TEXT_DIM }}>系统检测中...</div>;

  const StatusIcon = ({ ok }: { ok: boolean }) => ok
    ? <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(160, 70%, 45%, 0.2)" }}><div className="w-2 h-2 rounded-full" style={{ background: "hsl(160, 70%, 55%)" }} /></div>
    : <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(350, 80%, 60%, 0.2)" }}><div className="w-2 h-2 rounded-full" style={{ background: "hsl(350, 80%, 65%)" }} /></div>;

  const cards = [
    { icon: <StatusIcon ok={status.db === "ok"} />, label: "数据库", ok: status.db === "ok", text: status.db === "ok" ? "正常" : "异常" },
    { icon: <StatusIcon ok={status.api === "ok"} />, label: "API服务", ok: status.api === "ok", text: status.api === "ok" ? "正常" : "异常" },
    { icon: <StatusIcon ok={status.rechargeAnomaly === 0} />, label: "充值异常", ok: status.rechargeAnomaly === 0, text: status.rechargeAnomaly > 0 ? `${status.rechargeAnomaly} 个用户` : "无异常" },
    { icon: <StatusIcon ok={status.highUsageUsers === 0} />, label: "高频调用", ok: status.highUsageUsers === 0, text: status.highUsageUsers > 0 ? `${status.highUsageUsers} 个用户` : "正常" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="admin-kpi-card p-4 flex items-center gap-3">
            {c.icon}
            <div>
              <p className="text-sm font-medium text-white">{c.label}</p>
              <span className="px-2 py-0.5 rounded-full text-xs inline-block mt-1" style={{ background: c.ok ? "hsl(160, 70%, 45%, 0.15)" : "hsl(350, 80%, 60%, 0.15)", color: c.ok ? "hsl(160, 70%, 55%)" : "hsl(350, 80%, 65%)" }}>{c.text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-glass p-5">
        <div className="flex items-center gap-2 mb-3"><Activity className="w-4 h-4" style={{ color: NEON.cyan }} /><h3 className="text-sm font-semibold" style={{ color: NEON.cyan }}>系统状态说明</h3></div>
        <div className="space-y-2 text-sm" style={{ color: TEXT_DIM }}>
          <p>• <strong style={{ color: TEXT_MID }}>充值异常</strong>：单用户当日充值超过 5 次触发提醒</p>
          <p>• <strong style={{ color: TEXT_MID }}>高频调用</strong>：单用户当日 AI 调用超过 500 次触发提醒</p>
          <p>• 系统每次进入面板时自动检测，数据实时更新</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
