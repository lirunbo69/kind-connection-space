import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import {
  LayoutDashboard, Users, Bot, FileText, ShoppingCart, Activity,
  Shield, Eye, Coins, Edit2, Trash2, Plus, Download, Search,
  TrendingUp, TrendingDown, DollarSign, Wallet, Cpu, Monitor,
  Smartphone, ChevronDown, BarChart3, UserCheck, Zap, LogOut,
  Lock, Mail, KeyRound,
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

// ── Design Tokens ──
const C = {
  bg: "hsl(225, 20%, 5%)",
  surface: "hsl(225, 18%, 8%)",
  card: "hsl(225, 16%, 10%)",
  border: "hsl(225, 14%, 16%)",
  borderLight: "hsl(225, 12%, 20%)",
  text: "hsl(225, 10%, 85%)",
  textMid: "hsl(225, 10%, 65%)",
  textDim: "hsl(225, 10%, 45%)",
  cyan: "hsl(195, 100%, 50%)",
  teal: "hsl(175, 80%, 45%)",
  emerald: "hsl(160, 70%, 45%)",
  rose: "hsl(350, 80%, 60%)",
  amber: "hsl(40, 90%, 55%)",
  violet: "hsl(265, 80%, 60%)",
  blue: "hsl(220, 70%, 55%)",
};

const TT_STYLE = { borderRadius: 10, border: `1px solid ${C.borderLight}`, background: C.card, color: "#e5e5e5", fontSize: 12 };
const IN_STYLE = { background: "hsl(225, 16%, 13%)", border: `1px solid ${C.borderLight}`, color: "#fff" };
const LB_STYLE = { color: C.textMid };

type NavItem = { id: string; label: string; icon: any };
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

// ══════════════════════════════════════════════
// ADMIN LOGIN - Independent authentication
// ══════════════════════════════════════════════
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
      if (!data.user) throw new Error("登录失败");
      // Check admin role
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin");
      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        throw new Error("无管理员权限，禁止访问");
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || "登录失败");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: `radial-gradient(ellipse at 30% 20%, hsl(225, 30%, 12%) 0%, ${C.bg} 70%)` }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full opacity-5 animate-pulse" style={{ background: C.cyan, top: "10%", right: "20%", filter: "blur(120px)" }} />
        <div className="absolute w-64 h-64 rounded-full opacity-5 animate-pulse" style={{ background: C.violet, bottom: "20%", left: "15%", filter: "blur(100px)", animationDelay: "1s" }} />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, boxShadow: `0 0 30px ${C.cyan}30` }}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">MTERP</h1>
            <p className="text-xs" style={{ color: C.textDim }}>站长工作台 · 管理员专用</p>
          </div>
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} className="rounded-2xl p-8 space-y-6" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5)` }}>
          <div className="text-center mb-2">
            <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: C.cyan }} />
            <h2 className="text-lg font-semibold text-white">管理员登录</h2>
            <p className="text-xs mt-1" style={{ color: C.textDim }}>请使用管理员账号登录工作台</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "hsl(350, 80%, 60%, 0.12)", color: C.rose, border: `1px solid hsl(350, 80%, 60%, 0.2)` }}>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium" style={LB_STYLE}>管理员邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textDim }} />
              <Input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="输入管理员邮箱" required
                className="pl-10 h-11 rounded-xl"
                style={IN_STYLE}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium" style={LB_STYLE}>密码</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textDim }} />
              <Input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="输入密码" required
                className="pl-10 h-11 rounded-xl"
                style={IN_STYLE}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl text-sm font-semibold border-0 transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${C.cyan}, hsl(210, 90%, 50%))`, color: "#000", boxShadow: loading ? "none" : `0 0 20px ${C.cyan}30` }}>
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                验证中...
              </span>
            ) : "进入工作台"}
          </Button>

          <p className="text-center text-[11px]" style={{ color: C.textDim }}>
            仅限授权管理员使用 · 所有操作将被记录
          </p>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════
const AdminPage = () => {
  const [authState, setAuthState] = useState<"loading" | "login" | "authorized">("loading");
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setAuthState("login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin");
    if (roles && roles.length > 0) {
      setAdminEmail(session.user.email || "");
      setAuthState("authorized");
    } else {
      setAuthState("login");
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  // Loading
  if (authState === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: C.bg }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: C.cyan, borderTopColor: "transparent" }} />
          <span className="text-sm" style={{ color: C.textDim }}>验证权限中...</span>
        </div>
      </div>
    );
  }

  // Login
  if (authState === "login") {
    return (
      <>
        <Sonner />
        <AdminLogin onLogin={checkAuth} />
      </>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthState("login");
    toast.success("已退出管理后台");
  };

  const currentNav = NAV_ITEMS.find(n => n.id === activeNav)!;

  return (
    <>
      <Sonner />
      <div className="fixed inset-0 flex" style={{ background: C.bg }}>
        {/* ── Sidebar ── */}
        <aside className="h-full flex flex-col shrink-0 transition-all duration-300"
          style={{ width: sidebarCollapsed ? 64 : 230, background: C.surface, borderRight: `1px solid ${C.border}` }}>
          {/* Logo */}
          <div className="h-16 flex items-center px-4 gap-3 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, boxShadow: `0 0 15px ${C.cyan}20` }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-white tracking-wide">MTERP</h1>
                <p className="text-[10px]" style={{ color: C.textDim }}>站长工作台</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-2 space-y-1">
              {NAV_ITEMS.map(item => {
                const active = activeNav === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveNav(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group"
                    style={{
                      background: active ? `${C.cyan}15` : "transparent",
                      color: active ? C.cyan : C.textDim,
                    }}
                    title={item.label}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                      style={{ background: active ? `${C.cyan}20` : "transparent" }}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    {!sidebarCollapsed && <span className="truncate font-medium">{item.label}</span>}
                    {active && !sidebarCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="px-3 py-3 space-y-2 shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
            {!sidebarCollapsed && (
              <div className="px-2 py-2 rounded-lg text-xs" style={{ background: `${C.cyan}08`, color: C.textDim }}>
                <span className="block truncate">{adminEmail}</span>
              </div>
            )}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all hover:bg-red-500/10"
              style={{ color: C.rose }}>
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>退出登录</span>}
            </button>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all hover:bg-white/5"
              style={{ color: C.textDim }}>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${sidebarCollapsed ? "-rotate-90" : "rotate-90"}`} />
              {!sidebarCollapsed && <span>收起侧栏</span>}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 flex items-center justify-between px-6 shrink-0"
            style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3">
              <currentNav.icon className="w-5 h-5" style={{ color: C.cyan }} />
              <h2 className="text-sm font-semibold text-white">{currentNav.label}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: `${C.emerald}15`, color: C.emerald }}>
                ● 在线
              </div>
              <div className="px-3 py-1 rounded-full text-xs"
                style={{ background: `${C.cyan}10`, color: C.cyan }}>
                管理员
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6" style={{ background: C.bg }}>
            <div className="max-w-[1400px] mx-auto">
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
    </>
  );
};

// ── Shared Components ──
const KPICard = ({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: any; color: string; sub?: string }) => (
  <div className="p-5 rounded-xl transition-all duration-300 hover:translate-y-[-2px] group"
    style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: `0 4px 20px rgba(0,0,0,0.2)` }}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: C.textDim }}>{label}</span>
      <div className="p-2 rounded-lg transition-all group-hover:scale-110" style={{ background: `${color}12` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
    {sub && <p className="text-[11px] mt-1" style={{ color: C.textDim }}>{sub}</p>}
  </div>
);

const Section = ({ title, icon: Icon, defaultOpen = true, children }: {
  title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-3 py-3 px-1 cursor-pointer select-none group">
          <Icon className="w-5 h-5 transition-colors" style={{ color: C.cyan }} />
          <span className="text-sm font-semibold text-white tracking-wide">{title}</span>
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-300 ${open ? "rotate-180" : ""}`} style={{ color: C.cyan }} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent><div className="pb-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">{children}</div></CollapsibleContent>
    </Collapsible>
  );
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl ${className}`} style={{ background: C.card, border: `1px solid ${C.border}` }}>
    {children}
  </div>
);

// ═══════════════════════════════════════
// OVERVIEW
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
      const [rechargeRes, profilesRes, aiLogsRes] = await Promise.all([
        supabase.from("recharge_records").select("amount, created_at, status, user_id"),
        supabase.from("profiles").select("id, email, phone, created_at"),
        supabase.from("ai_logs").select("user_id, points_cost, prompt_tokens, completion_tokens, created_at"),
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
      aiLogs.forEach(l => { const day = l.created_at?.split("T")[0] || ""; const tk = l.prompt_tokens + l.completion_tokens; const c2 = l.points_cost * 0.01; tc++; tt += tk; tco += c2; if (aiDateMap.has(day)) { const e = aiDateMap.get(day)!; e.calls++; e.tokens += tk; e.cost += c2; } });
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: C.cyan, borderTopColor: "transparent" }} /></div>;

  const totalDesktop = visitStats.reduce((s, v) => s + v.desktop, 0);
  const totalMobile = visitStats.reduce((s, v) => s + v.mobile, 0);
  const pieDevice = [{ name: "电脑端", value: totalDesktop }, { name: "手机端", value: totalMobile }];
  const piePaid = [{ name: "付费用户", value: paidStats.paid }, { name: "免费用户", value: paidStats.free }];

  const RangeBtn = ({ val, cur, set, label }: { val: string; cur: string; set: (v: any) => void; label: string }) => (
    <button onClick={() => set(val)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={cur === val ? { background: C.cyan, color: "#000", boxShadow: `0 0 12px ${C.cyan}30` } : { background: "hsl(225, 16%, 13%)", color: C.textDim }}>
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <Section title="核心数据概览" icon={Activity}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="今日营收" value={`¥${kpi.todayRevenue.toFixed(2)}`} icon={DollarSign} color={C.emerald} />
          <KPICard label="总营收" value={`¥${kpi.totalRevenue.toFixed(2)}`} icon={Wallet} color={C.amber} />
          <KPICard label="今日订单" value={kpi.todayOrders.toString()} icon={ShoppingCart} color={C.cyan} />
          <KPICard label="总订单数" value={kpi.totalOrders.toString()} icon={TrendingUp} color={C.blue} />
          <KPICard label="今日新用户" value={kpi.todayNewUsers.toString()} icon={Users} color={C.violet} />
          <KPICard label="总用户数" value={kpi.totalUsers.toString()} icon={Users} color={C.teal} />
          <KPICard label="今日AI调用" value={kpi.todayAICalls.toString()} icon={Cpu} color={C.cyan} />
          <KPICard label="今日净利润" value={`¥${kpi.todayProfit.toFixed(2)}`} icon={kpi.todayProfit >= 0 ? TrendingUp : TrendingDown} color={kpi.todayProfit >= 0 ? C.emerald : C.rose} />
        </div>
      </Section>

      <div className="border-t" style={{ borderColor: C.border }} />

      <Section title="网站访问统计" icon={Eye} defaultOpen={false}>
        <div className="flex gap-2 mb-4">
          {(["7", "30", "180"] as const).map(r => <RangeBtn key={r} val={r} cur={analyticsRange} set={setAnalyticsRange} label={`近${r}天`} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <GlassCard className="p-4"><span className="text-xs" style={{ color: C.textDim }}>总访问量</span><p className="text-xl font-bold mt-1 text-white">{visitStats.reduce((s, v) => s + v.total, 0).toLocaleString()}</p></GlassCard>
          <GlassCard className="p-4"><span className="text-xs" style={{ color: C.textDim }}>独立访客</span><p className="text-xl font-bold mt-1 text-white">{visitStats.reduce((s, v) => s + v.unique, 0).toLocaleString()}</p></GlassCard>
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="flex-1"><span className="text-xs" style={{ color: C.textDim }}>设备占比</span>
              <div className="flex gap-3 mt-2 text-xs"><span className="flex items-center gap-1"><Monitor className="w-3 h-3" style={{ color: C.cyan }} />{totalDesktop}</span><span className="flex items-center gap-1"><Smartphone className="w-3 h-3" style={{ color: C.violet }} />{totalMobile}</span></div>
            </div>
            <ResponsiveContainer width={60} height={60}><PieChart><Pie data={pieDevice} dataKey="value" cx="50%" cy="50%" outerRadius={28} strokeWidth={0}><Cell fill={C.cyan} /><Cell fill={C.violet} /></Pie></PieChart></ResponsiveContainer>
          </GlassCard>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <GlassCard className="p-4"><p className="text-xs font-medium mb-3" style={{ color: C.cyan }}>访问趋势</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={visitStats}><defs><linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.cyan} stopOpacity={0.3} /><stop offset="100%" stopColor={C.cyan} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textDim} /><YAxis tick={{ fontSize: 10 }} stroke={C.textDim} /><Tooltip contentStyle={TT_STYLE} /><Area type="monotone" dataKey="total" name="总访问" stroke={C.cyan} fill="url(#visitGrad)" strokeWidth={2} /></AreaChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard className="p-4"><p className="text-xs font-medium mb-3" style={{ color: C.cyan }}>设备分布</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={visitStats}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textDim} /><YAxis tick={{ fontSize: 10 }} stroke={C.textDim} /><Tooltip contentStyle={TT_STYLE} /><Bar dataKey="desktop" name="电脑端" fill={C.cyan} radius={[3, 3, 0, 0]} /><Bar dataKey="mobile" name="手机端" fill={C.violet} radius={[3, 3, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </Section>

      <div className="border-t" style={{ borderColor: C.border }} />

      <Section title="销售与盈利报表" icon={BarChart3} defaultOpen={false}>
        <div className="flex gap-2 mb-4">
          {(["30", "180"] as const).map(r => <RangeBtn key={r} val={r} cur={salesRange} set={setSalesRange} label={r === "30" ? "近30天" : "近6个月"} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <GlassCard className="p-4"><p className="text-xs font-medium mb-3" style={{ color: C.cyan }}>营收 / 成本 / 利润</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textDim} interval={salesRange === "180" ? 6 : 1} /><YAxis tick={{ fontSize: 10 }} stroke={C.textDim} /><Tooltip contentStyle={TT_STYLE} /><Legend wrapperStyle={{ color: "#aaa", fontSize: 11 }} /><Line type="monotone" dataKey="revenue" name="营收(¥)" stroke={C.emerald} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="aiCost" name="AI成本(¥)" stroke={C.rose} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="profit" name="利润(¥)" stroke={C.cyan} strokeWidth={2} dot={false} /></LineChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard className="p-4"><p className="text-xs font-medium mb-3" style={{ color: C.cyan }}>每日订单趋势</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textDim} interval={salesRange === "180" ? 6 : 1} /><YAxis tick={{ fontSize: 10 }} stroke={C.textDim} allowDecimals={false} /><Tooltip contentStyle={TT_STYLE} /><Bar dataKey="orders" name="订单数" fill={C.cyan} radius={[3, 3, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </Section>

      <div className="border-t" style={{ borderColor: C.border }} />

      <Section title="用户运营分析" icon={UserCheck} defaultOpen={false}>
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <GlassCard className="p-4"><p className="text-xs font-medium mb-3" style={{ color: C.cyan }}>近30天新用户增长</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}><defs><linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.teal} stopOpacity={0.3} /><stop offset="100%" stopColor={C.teal} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textDim} /><YAxis tick={{ fontSize: 10 }} stroke={C.textDim} allowDecimals={false} /><Tooltip contentStyle={TT_STYLE} /><Area type="monotone" dataKey="count" name="新增用户" stroke={C.teal} fill="url(#growthGrad)" strokeWidth={2} /></AreaChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard className="p-4 flex items-center justify-around">
            <div className="text-center"><p className="text-xs mb-2" style={{ color: C.textDim }}>付费/免费占比</p>
              <ResponsiveContainer width={160} height={160}>
                <PieChart><Pie data={piePaid} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={40} strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}><Cell fill={C.emerald} /><Cell fill={C.blue} /></Pie><Tooltip contentStyle={TT_STYLE} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{ background: C.emerald }} /><span style={{ color: C.textMid }}>付费: {paidStats.paid}</span></div>
              <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{ background: C.blue }} /><span style={{ color: C.textMid }}>免费: {paidStats.free}</span></div>
            </div>
          </GlassCard>
        </div>
        <GlassCard className="p-4"><p className="text-xs font-medium mb-3" style={{ color: C.cyan }}>积分消耗 TOP 8</p>
          <div className="space-y-2">{topConsumers.map((u, i) => { const maxVal = topConsumers[0]?.total || 1; return (
            <div key={i} className="flex items-center gap-3"><span className="text-xs w-5 text-right font-mono" style={{ color: C.textDim }}>#{i + 1}</span><span className="text-xs truncate w-36" style={{ color: C.textMid }}>{u.email}</span><div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.border }}><div className="h-full rounded-full transition-all" style={{ width: `${(u.total / maxVal) * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.violet})` }} /></div><span className="text-xs font-semibold w-16 text-right" style={{ color: C.cyan }}>{u.total.toLocaleString()}</span></div>
          ); })}</div>
        </GlassCard>
      </Section>

      <div className="border-t" style={{ borderColor: C.border }} />

      <Section title="AI 成本与利润核算" icon={Cpu} defaultOpen={false}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <GlassCard className="p-4"><span className="text-xs" style={{ color: C.textDim }}>30天调用</span><p className="text-xl font-bold mt-1" style={{ color: C.cyan }}>{aiTotals.calls.toLocaleString()}</p></GlassCard>
          <GlassCard className="p-4"><span className="text-xs" style={{ color: C.textDim }}>Token消耗</span><p className="text-xl font-bold mt-1" style={{ color: C.amber }}>{aiTotals.tokens.toLocaleString()}</p></GlassCard>
          <GlassCard className="p-4"><span className="text-xs" style={{ color: C.textDim }}>AI总成本</span><p className="text-xl font-bold mt-1" style={{ color: C.rose }}>¥{aiTotals.cost.toFixed(2)}</p></GlassCard>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <GlassCard className="p-4"><p className="text-xs font-medium mb-3" style={{ color: C.cyan }}>每日调用量</p>
            <ResponsiveContainer width="100%" height={240}><BarChart data={aiData}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textDim} /><YAxis tick={{ fontSize: 10 }} stroke={C.textDim} /><Tooltip contentStyle={TT_STYLE} /><Bar dataKey="calls" name="调用次数" fill={C.cyan} radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
          </GlassCard>
          <GlassCard className="p-4"><p className="text-xs font-medium mb-3" style={{ color: C.cyan }}>利润 = 营收 - AI成本</p>
            <ResponsiveContainer width="100%" height={240}><LineChart data={aiData}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textDim} /><YAxis tick={{ fontSize: 10 }} stroke={C.textDim} /><Tooltip contentStyle={TT_STYLE} /><Legend wrapperStyle={{ color: "#aaa", fontSize: 11 }} /><Line type="monotone" dataKey="revenue" name="营收" stroke={C.emerald} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="cost" name="AI成本" stroke={C.rose} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="profit" name="利润" stroke={C.cyan} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
          </GlassCard>
        </div>
      </Section>
    </div>
  );
};

// ═══════════════════════════════════════
// ORDER PANEL
// ═══════════════════════════════════════
const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "待支付", color: "hsl(40, 90%, 55%)" },
  success: { label: "已完成", color: "hsl(160, 70%, 45%)" },
  closed: { label: "已关闭", color: "hsl(225, 10%, 45%)" },
  failed: { label: "支付失败", color: "hsl(350, 80%, 60%)" },
};

const OrderPanel = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    const { data } = await supabase.from("recharge_records").select("*").order("created_at", { ascending: false }).limit(1000);
    if (!data) { setLoading(false); return; }
    const userIds = [...new Set(data.map(r => r.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, email, phone").in("id", userIds);
    const pm = new Map(profiles?.map(p => [p.id, p.email || p.phone || "—"]) || []);
    const enriched = data.map(r => ({ ...r, user_email: pm.get(r.user_id) || "—" }));
    setOrders(enriched); setFiltered(enriched); setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    let result = orders;
    if (search) { const q = search.toLowerCase(); result = result.filter(r => r.user_email?.toLowerCase().includes(q) || String(r.amount).includes(q) || (r.out_trade_no || "").toLowerCase().includes(q) || (r.trade_no || "").toLowerCase().includes(q)); }
    if (dateFrom) result = result.filter(r => r.created_at >= dateFrom);
    if (dateTo) result = result.filter(r => r.created_at <= dateTo + "T23:59:59");
    if (statusFilter !== "all") result = result.filter(r => r.status === statusFilter);
    setFiltered(result);
  }, [search, dateFrom, dateTo, statusFilter, orders]);

  const handleCloseOrder = async (orderId: string) => {
    if (!confirm("确定手动关闭此订单？")) return;
    const { error } = await supabase.functions.invoke("admin-points", {
      body: { action: "close_order", order_id: orderId },
    });
    // Fallback: direct update via admin RLS
    await supabase.from("recharge_records").update({ status: "closed" }).eq("id", orderId);
    toast.success("订单已关闭");
    fetchOrders();
  };

  const exportCSV = () => {
    const header = "订单号,用户,金额,积分,状态,支付宝交易号,创建时间,支付时间\n";
    const rows = filtered.map(r => `${r.out_trade_no || ""},${r.user_email},${r.amount},${r.points},${r.status},${r.trade_no || ""},${new Date(r.created_at).toLocaleString("zh-CN")},${r.paid_at ? new Date(r.paid_at).toLocaleString("zh-CN") : ""}`).join("\n");
    const blob = new Blob(["\ufeff" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-8" style={{ color: C.textDim }}>加载中...</div>;

  const stats = {
    total: orders.length,
    success: orders.filter(o => o.status === "success").length,
    pending: orders.filter(o => o.status === "pending").length,
    totalRevenue: orders.filter(o => o.status === "success").reduce((s, o) => s + Number(o.amount), 0),
  };

  return (
    <div className="space-y-4">
      {/* Order stats */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="总订单" value={stats.total.toString()} icon={ShoppingCart} color={C.cyan} />
        <KPICard label="已完成" value={stats.success.toString()} icon={TrendingUp} color={C.emerald} />
        <KPICard label="待支付" value={stats.pending.toString()} icon={Activity} color={C.amber} />
        <KPICard label="总收入" value={`¥${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} color={C.emerald} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]"><label className="text-xs mb-1 block" style={{ color: C.textDim }}>搜索订单号/用户/金额</label><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textDim }} /><Input className="pl-9" placeholder="搜索..." value={search} onChange={e => setSearch(e.target.value)} style={IN_STYLE} /></div></div>
        <div><label className="text-xs mb-1 block" style={{ color: C.textDim }}>状态筛选</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[120px]" style={IN_STYLE}><SelectValue /></SelectTrigger><SelectContent style={{ background: "hsl(225, 16%, 13%)", border: `1px solid ${C.borderLight}` }}><SelectItem value="all" style={{ color: "#fff" }}>全部</SelectItem><SelectItem value="pending" style={{ color: "#fff" }}>待支付</SelectItem><SelectItem value="success" style={{ color: "#fff" }}>已完成</SelectItem><SelectItem value="closed" style={{ color: "#fff" }}>已关闭</SelectItem><SelectItem value="failed" style={{ color: "#fff" }}>失败</SelectItem></SelectContent></Select>
        </div>
        <div><label className="text-xs mb-1 block" style={{ color: C.textDim }}>起始日期</label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={IN_STYLE} /></div>
        <div><label className="text-xs mb-1 block" style={{ color: C.textDim }}>截止日期</label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={IN_STYLE} /></div>
        <Button className="gap-2 border-0" onClick={exportCSV} style={{ background: C.cyan, color: "#000" }}><Download className="w-4 h-4" />导出 CSV</Button>
      </div>

      <GlassCard>
        <div className="p-4 border-b" style={{ borderColor: C.border }}><h3 className="text-sm font-semibold" style={{ color: C.cyan }}>支付宝订单列表（共 {filtered.length} 条）</h3></div>
        <div className="p-4"><div className="max-h-[500px] overflow-auto">
          <Table><TableHeader><TableRow className="border-b" style={{ borderColor: C.border }}>
            <TableHead style={{ color: C.textDim }}>订单号</TableHead>
            <TableHead style={{ color: C.textDim }}>用户</TableHead>
            <TableHead style={{ color: C.textDim }}>金额</TableHead>
            <TableHead style={{ color: C.textDim }}>积分</TableHead>
            <TableHead style={{ color: C.textDim }}>状态</TableHead>
            <TableHead style={{ color: C.textDim }}>支付宝交易号</TableHead>
            <TableHead style={{ color: C.textDim }}>创建时间</TableHead>
            <TableHead style={{ color: C.textDim }}>支付时间</TableHead>
            <TableHead style={{ color: C.textDim }}>操作</TableHead>
          </TableRow></TableHeader>
            <TableBody>{filtered.slice(0, 200).map(r => {
              const st = ORDER_STATUS[r.status] || { label: r.status, color: C.textDim };
              return (
                <TableRow key={r.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "hsl(225, 14%, 13%)" }}>
                  <TableCell className="text-xs font-mono" style={{ color: C.textMid }}>{r.out_trade_no || "—"}</TableCell>
                  <TableCell className="text-xs" style={{ color: C.textMid }}>{r.user_email}</TableCell>
                  <TableCell className="font-medium" style={{ color: C.amber }}>¥{r.amount}</TableCell>
                  <TableCell style={{ color: C.emerald }}>+{r.points.toLocaleString()}</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${st.color}15`, color: st.color }}>{st.label}</span></TableCell>
                  <TableCell className="text-xs font-mono" style={{ color: C.textDim }}>{r.trade_no || "—"}</TableCell>
                  <TableCell className="text-xs" style={{ color: C.textDim }}>{new Date(r.created_at).toLocaleString("zh-CN")}</TableCell>
                  <TableCell className="text-xs" style={{ color: C.textDim }}>{r.paid_at ? new Date(r.paid_at).toLocaleString("zh-CN") : "—"}</TableCell>
                  <TableCell>
                    {r.status === "pending" && (
                      <Button variant="ghost" size="sm" onClick={() => handleCloseOrder(r.id)} className="text-xs h-7" style={{ color: C.rose }}>关闭</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
        </div></div>
      </GlassCard>
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
    const [profilesRes, pointsRes] = await Promise.all([
      supabase.from("profiles").select("id, email, phone, created_at, last_sign_in_at").order("created_at", { ascending: false }),
      supabase.from("user_points").select("user_id, remaining_points"),
    ]);
    const pointsMap = new Map(pointsRes.data?.map(p => [p.user_id, p.remaining_points]) || []);
    setUsers((profilesRes.data || []).map(p => ({ ...p, remaining_points: pointsMap.get(p.id) ?? 0 })));
    setLoading(false);
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

  if (loading) return <div className="text-center py-8" style={{ color: C.textDim }}>加载中...</div>;

  return (
    <GlassCard>
      <div className="p-4 border-b" style={{ borderColor: C.border }}><h3 className="text-sm font-semibold" style={{ color: C.cyan }}>用户列表（{users.length}）</h3></div>
      <div className="p-4"><div className="overflow-auto max-h-[600px]">
        <Table><TableHeader><TableRow className="border-b" style={{ borderColor: C.border }}>
          <TableHead style={{ color: C.textDim }}>邮箱/手机号</TableHead><TableHead style={{ color: C.textDim }}>注册时间</TableHead><TableHead style={{ color: C.textDim }}>最后登录</TableHead><TableHead style={{ color: C.textDim }}>剩余积分</TableHead><TableHead style={{ color: C.textDim }}>操作</TableHead>
        </TableRow></TableHeader>
          <TableBody>{users.map(u => (
            <TableRow key={u.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "hsl(225, 14%, 13%)" }}>
              <TableCell style={{ color: C.textMid }}>{u.email || u.phone || "—"}</TableCell>
              <TableCell className="text-xs" style={{ color: C.textDim }}>{new Date(u.created_at).toLocaleString("zh-CN")}</TableCell>
              <TableCell className="text-xs" style={{ color: C.textDim }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("zh-CN") : "—"}</TableCell>
              <TableCell className="font-semibold" style={{ color: C.cyan }}>{u.remaining_points}</TableCell>
              <TableCell>
                <Dialog open={adjustUserId === u.id} onOpenChange={open => { if (!open) setAdjustUserId(null); }}>
                  <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1 border-0 text-xs" style={{ background: "hsl(225, 16%, 16%)", color: C.cyan }} onClick={() => setAdjustUserId(u.id)}><Coins className="w-3 h-3" />修改积分</Button></DialogTrigger>
                  <DialogContent style={{ background: C.card, border: `1px solid ${C.borderLight}`, color: C.text }}>
                    <DialogHeader><DialogTitle style={{ color: C.cyan }}>修改积分 - {u.email || u.phone}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm" style={{ color: C.textDim }}>当前积分: <span className="font-bold" style={{ color: C.cyan }}>{u.remaining_points}</span></p>
                      <div className="space-y-2"><Label style={LB_STYLE}>调整数量（正数增加，负数减少）</Label><Input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="如: 100 或 -50" style={IN_STYLE} /></div>
                      <div className="space-y-2"><Label style={LB_STYLE}>原因（选填）</Label><Input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="如: 充值、补偿" style={IN_STYLE} /></div>
                      <Button onClick={handleAdjustPoints} disabled={adjusting || !adjustAmount} className="w-full border-0" style={{ background: C.cyan, color: "#000" }}>{adjusting ? "处理中..." : "确认修改"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div></div>
    </GlassCard>
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
  const startEdit = (c2: any) => { setEditing(c2); setForm({ model_name: c2.model_name, display_name: c2.display_name, api_key: c2.api_key || "", input_points_per_1k_tokens: String(c2.input_points_per_1k_tokens), image_points_per_image: String(c2.image_points_per_image), output_points_per_1k_tokens: String(c2.output_points_per_1k_tokens), is_active: c2.is_active }); };

  const handleSave = async () => {
    const payload = { model_name: form.model_name, display_name: form.display_name, api_key: form.api_key || null, input_points_per_1k_tokens: parseInt(form.input_points_per_1k_tokens) || 1, image_points_per_image: parseInt(form.image_points_per_image) || 1, output_points_per_1k_tokens: parseInt(form.output_points_per_1k_tokens) || 6, is_active: form.is_active };
    if (editing) { const { error } = await supabase.from("ai_config").update(payload).eq("id", editing.id); if (error) { toast.error(error.message); return; } toast.success("模型配置已更新"); }
    else { const { error } = await supabase.from("ai_config").insert(payload); if (error) { toast.error(error.message); return; } toast.success("模型已添加"); }
    resetForm(); fetchConfigs();
  };

  const handleDelete = async (id: string) => { if (!confirm("确定删除该模型？")) return; await supabase.from("ai_config").delete().eq("id", id); toast.success("已删除"); fetchConfigs(); };

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: C.cyan }}>{editing ? "编辑模型" : "添加模型"}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label style={LB_STYLE}>模型名称 (API)</Label><Input value={form.model_name} onChange={e => setForm({ ...form, model_name: e.target.value })} placeholder="google/gemini-2.5-flash" style={IN_STYLE} /></div>
          <div className="space-y-2"><Label style={LB_STYLE}>显示名称</Label><Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Gemini 2.5 Flash" style={IN_STYLE} /></div>
          <div className="space-y-2"><Label style={LB_STYLE}>输入价格 (积分/1000 tokens)</Label><Input type="number" value={form.input_points_per_1k_tokens} onChange={e => setForm({ ...form, input_points_per_1k_tokens: e.target.value })} style={IN_STYLE} /></div>
          <div className="space-y-2"><Label style={LB_STYLE}>图片价格 (积分/张)</Label><Input type="number" value={form.image_points_per_image} onChange={e => setForm({ ...form, image_points_per_image: e.target.value })} style={IN_STYLE} /></div>
          <div className="space-y-2"><Label style={LB_STYLE}>输出价格 (积分/1000 tokens)</Label><Input type="number" value={form.output_points_per_1k_tokens} onChange={e => setForm({ ...form, output_points_per_1k_tokens: e.target.value })} style={IN_STYLE} /></div>
          <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} /><Label style={LB_STYLE}>启用</Label></div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} disabled={!form.model_name || !form.display_name} className="border-0" style={{ background: C.cyan, color: "#000" }}>{editing ? "保存修改" : "添加模型"}</Button>
          {editing && <Button variant="outline" onClick={resetForm} style={{ background: "hsl(225, 16%, 16%)", color: C.textMid, border: `1px solid ${C.borderLight}` }}>取消</Button>}
        </div>
      </GlassCard>
      <GlassCard>
        <div className="p-4 border-b" style={{ borderColor: C.border }}><h3 className="text-sm font-semibold" style={{ color: C.cyan }}>模型列表</h3></div>
        <div className="p-4"><Table><TableHeader><TableRow className="border-b" style={{ borderColor: C.border }}>
          <TableHead style={{ color: C.textDim }}>显示名称</TableHead><TableHead style={{ color: C.textDim }}>模型</TableHead><TableHead style={{ color: C.textDim }}>输入/1K</TableHead><TableHead style={{ color: C.textDim }}>图片/张</TableHead><TableHead style={{ color: C.textDim }}>输出/1K</TableHead><TableHead style={{ color: C.textDim }}>状态</TableHead><TableHead style={{ color: C.textDim }}>操作</TableHead>
        </TableRow></TableHeader>
          <TableBody>{configs.map(c2 => (
            <TableRow key={c2.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "hsl(225, 14%, 13%)" }}>
              <TableCell className="font-medium" style={{ color: C.text }}>{c2.display_name}</TableCell>
              <TableCell className="text-xs" style={{ color: C.textDim }}>{c2.model_name}</TableCell>
              <TableCell style={{ color: C.textMid }}>{c2.input_points_per_1k_tokens}</TableCell>
              <TableCell style={{ color: C.textMid }}>{c2.image_points_per_image}</TableCell>
              <TableCell style={{ color: C.textMid }}>{c2.output_points_per_1k_tokens}</TableCell>
              <TableCell><span className="px-2 py-1 rounded-full text-xs" style={{ background: c2.is_active ? `${C.emerald}15` : "hsl(225, 15%, 18%)", color: c2.is_active ? C.emerald : C.textDim }}>{c2.is_active ? "启用" : "停用"}</span></TableCell>
              <TableCell className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => startEdit(c2)} style={{ color: C.cyan }}><Edit2 className="w-3 h-3" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(c2.id)} style={{ color: C.rose }}><Trash2 className="w-3 h-3" /></Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table></div>
      </GlassCard>
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

  const extractVars = (c2: string) => [...new Set((c2.match(/\{\{(\w+)\}\}/g) || []).map(m => m.replace(/\{\{|\}\}/g, "")))];
  const handlePreview = (t: any) => { const vars = extractVars(t.template_content); const init: Record<string, string> = {}; vars.forEach(v => { init[v] = testVars[v] || ""; }); setTestVars(init); setPreviewContent(t.template_content); setPreviewOpen(true); };
  const renderPreview = () => { let r = previewContent; Object.entries(testVars).forEach(([k, v]) => { r = r.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v || `[${k}]`); }); return r; };

  return (
    <div className="space-y-4">
      {showForm && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.cyan }}>{editingId ? "编辑模板" : "新增模板"}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label style={LB_STYLE}>模板名称</Label><Input value={form.template_name} onChange={e => setForm({ ...form, template_name: e.target.value })} placeholder="如：卖点分析" style={IN_STYLE} /></div>
              <div className="space-y-2"><Label style={LB_STYLE}>AI 模型</Label>
                <Select value={form.model} onValueChange={v => setForm({ ...form, model: v })}><SelectTrigger style={IN_STYLE} className="w-full"><SelectValue placeholder="选择模型" /></SelectTrigger><SelectContent style={{ background: "hsl(225, 16%, 13%)", border: `1px solid ${C.borderLight}` }}>{OPENROUTER_MODELS.map(m => (<SelectItem key={m.value} value={m.value} style={{ color: "#fff" }} className="focus:bg-[hsl(225,15%,20%)] focus:text-white"><span className="font-medium">{m.label}</span><span className="ml-2 text-xs opacity-50">{m.value}</span></SelectItem>))}</SelectContent></Select>
              </div>
            </div>
            <div className="space-y-2"><Label style={LB_STYLE}>Prompt 模板内容 <span className="text-xs" style={{ color: C.textDim }}>支持 {"{{变量}}"} 占位符</span></Label><Textarea value={form.template_content} onChange={e => setForm({ ...form, template_content: e.target.value })} placeholder="输入 Prompt..." className="min-h-[200px] font-mono text-sm" style={IN_STYLE} /></div>
            <div className="flex gap-2"><Button onClick={handleSave} disabled={!form.template_name || !form.template_content} className="border-0" style={{ background: C.cyan, color: "#000" }}>{editingId ? "保存修改" : "添加模板"}</Button><Button variant="outline" onClick={resetForm} style={{ background: "hsl(225, 16%, 16%)", color: C.textMid, border: `1px solid ${C.borderLight}` }}>取消</Button></div>
          </div>
        </GlassCard>
      )}
      <GlassCard>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <h3 className="text-sm font-semibold" style={{ color: C.cyan }}>Prompt 模板列表</h3>
          {!showForm && <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1 border-0" style={{ background: C.cyan, color: "#000" }}><Plus className="w-3.5 h-3.5" />新增模板</Button>}
        </div>
        <div className="p-4">{loading ? <div className="text-center py-8" style={{ color: C.textDim }}>加载中...</div> : templates.length === 0 ? <div className="text-center py-8" style={{ color: C.textDim }}>暂无模板</div> : (
          <div className="overflow-auto max-h-[500px]"><Table><TableHeader><TableRow className="border-b" style={{ borderColor: C.border }}><TableHead style={{ color: C.textDim }}>模板名称</TableHead><TableHead style={{ color: C.textDim }}>AI 模型</TableHead><TableHead style={{ color: C.textDim }}>内容预览</TableHead><TableHead style={{ color: C.textDim }}>操作</TableHead></TableRow></TableHeader>
            <TableBody>{templates.map(t => (
              <TableRow key={t.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "hsl(225, 14%, 13%)" }}>
                <TableCell className="font-medium" style={{ color: C.text }}>{t.template_name}</TableCell>
                <TableCell className="text-xs" style={{ color: C.textDim }}>{t.model}</TableCell>
                <TableCell className="text-xs max-w-[300px] truncate" style={{ color: C.textMid }}>{t.template_content.slice(0, 80)}...</TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => handlePreview(t)} className="h-7 w-7 p-0" style={{ color: C.emerald }}><Eye className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => startEdit(t)} className="h-7 w-7 p-0" style={{ color: C.cyan }}><Edit2 className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="h-7 w-7 p-0" style={{ color: C.rose }}><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></div>
        )}</div>
      </GlassCard>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl" style={{ background: C.card, border: `1px solid ${C.borderLight}`, color: C.text }}>
          <DialogHeader><DialogTitle style={{ color: C.cyan }}>模板预览</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">{Object.keys(testVars).map(key => (<div key={key} className="space-y-1"><Label className="text-xs" style={LB_STYLE}>{key}</Label><Input value={testVars[key]} onChange={e => setTestVars(prev => ({ ...prev, [key]: e.target.value }))} placeholder={`输入 ${key}`} className="h-8 text-sm" style={IN_STYLE} /></div>))}</div>
            <div><Label className="text-xs mb-2 block" style={LB_STYLE}>渲染结果</Label><div className="rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[300px] overflow-auto" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textMid }}>{renderPreview()}</div></div>
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
    const load = async () => {
      const { data: logsData } = await supabase.from("ai_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (!logsData) { setLoading(false); return; }
      const userIds = [...new Set(logsData.map(l => l.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email, phone").in("id", userIds);
      const pm = new Map(profiles?.map(p => [p.id, p.email || p.phone || "—"]) || []);
      setLogs(logsData.map(l => ({ ...l, user_email: pm.get(l.user_id) || "—" }))); setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-8" style={{ color: C.textDim }}>加载中...</div>;

  return (
    <GlassCard>
      <div className="p-4 border-b" style={{ borderColor: C.border }}><h3 className="text-sm font-semibold" style={{ color: C.cyan }}>AI 调用日志（最近200条）</h3></div>
      <div className="p-4"><div className="overflow-auto max-h-[600px]">
        <Table><TableHeader><TableRow className="border-b" style={{ borderColor: C.border }}><TableHead style={{ color: C.textDim }}>用户</TableHead><TableHead style={{ color: C.textDim }}>模型</TableHead><TableHead style={{ color: C.textDim }}>图片数</TableHead><TableHead style={{ color: C.textDim }}>输入tokens</TableHead><TableHead style={{ color: C.textDim }}>输出tokens</TableHead><TableHead style={{ color: C.textDim }}>消耗积分</TableHead><TableHead style={{ color: C.textDim }}>时间</TableHead></TableRow></TableHeader>
          <TableBody>{logs.map(l => (
            <TableRow key={l.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "hsl(225, 14%, 13%)" }}>
              <TableCell className="text-xs" style={{ color: C.textMid }}>{l.user_email}</TableCell>
              <TableCell style={{ color: C.textMid }}>{l.model_name}</TableCell>
              <TableCell style={{ color: C.textMid }}>{l.image_count}</TableCell>
              <TableCell style={{ color: C.textMid }}>{l.prompt_tokens}</TableCell>
              <TableCell style={{ color: C.textMid }}>{l.completion_tokens}</TableCell>
              <TableCell className="font-semibold" style={{ color: C.cyan }}>{l.points_cost}</TableCell>
              <TableCell className="text-xs" style={{ color: C.textDim }}>{new Date(l.created_at).toLocaleString("zh-CN")}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div></div>
    </GlassCard>
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
    const load = async () => {
      const { data } = await supabase.from("generation_records").select("*").order("created_at", { ascending: false }).limit(100);
      if (!data) { setLoading(false); return; }
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", userIds);
      const em = new Map(profiles?.map(p => [p.id, p.email]) || []);
      setRecords(data.map(r => ({ ...r, user_email: em.get(r.user_id) || r.user_id.substring(0, 8) }))); setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-8" style={{ color: C.textDim }}>加载中...</div>;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="p-4 border-b" style={{ borderColor: C.border }}><h3 className="text-sm font-semibold" style={{ color: C.cyan }}>用户生成记录 ({records.length})</h3></div>
        <div className="p-4"><div className="overflow-auto max-h-[600px]">
          <Table><TableHeader><TableRow className="border-b" style={{ borderColor: C.border }}><TableHead style={{ color: C.textDim }}>用户</TableHead><TableHead style={{ color: C.textDim }}>产品名称</TableHead><TableHead style={{ color: C.textDim }}>市场</TableHead><TableHead style={{ color: C.textDim }}>生成标题</TableHead><TableHead style={{ color: C.textDim }}>时间</TableHead><TableHead style={{ color: C.textDim }}>操作</TableHead></TableRow></TableHeader>
            <TableBody>{records.map(r => (
              <TableRow key={r.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "hsl(225, 14%, 13%)" }}>
                <TableCell className="text-xs" style={{ color: C.textMid }}>{r.user_email}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate" style={{ color: C.textMid }}>{r.product_name}</TableCell>
                <TableCell className="text-xs" style={{ color: C.textMid }}>{r.market || "—"}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate" style={{ color: C.textMid }}>{r.title || "—"}</TableCell>
                <TableCell className="text-xs" style={{ color: C.textDim }}>{new Date(r.created_at).toLocaleString("zh-CN")}</TableCell>
                <TableCell><Button variant="outline" size="sm" className="gap-1 border-0 text-xs" style={{ background: "hsl(225, 16%, 16%)", color: C.cyan }} onClick={() => setDetail(r)}><Eye className="w-3 h-3" />详情</Button></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div></div>
      </GlassCard>
      <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: C.card, border: `1px solid ${C.borderLight}`, color: C.text }}>
          <DialogHeader><DialogTitle style={{ color: C.cyan }}>生成详情 - {detail?.product_name}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div><span className="text-xs font-semibold" style={{ color: C.textDim }}>用户</span><p style={{ color: C.textMid }}>{detail.user_email}</p></div>
              <div><span className="text-xs font-semibold" style={{ color: C.textDim }}>产品描述</span><p style={{ color: C.textMid }}>{detail.product_description}</p></div>
              {detail.title && <div><span className="text-xs font-semibold" style={{ color: C.textDim }}>生成标题</span><p className="font-medium" style={{ color: C.cyan }}>{detail.title}</p></div>}
              {detail.selling_points && <div><span className="text-xs font-semibold" style={{ color: C.textDim }}>卖点</span><ul className="list-disc pl-4 space-y-1" style={{ color: C.textMid }}>{(detail.selling_points as string[]).map((p: string, i: number) => <li key={i}>{p}</li>)}</ul></div>}
              {detail.description && <div><span className="text-xs font-semibold" style={{ color: C.textDim }}>描述</span><p className="whitespace-pre-wrap" style={{ color: C.textMid }}>{detail.description}</p></div>}
              {detail.main_image && <div><span className="text-xs font-semibold" style={{ color: C.textDim }}>主图</span><img src={detail.main_image} alt="主图" className="w-full max-w-xs rounded-lg mt-1" /></div>}
              {detail.carousel_images && (detail.carousel_images as string[]).length > 0 && <div><span className="text-xs font-semibold" style={{ color: C.textDim }}>轮播图</span><div className="grid grid-cols-3 gap-2 mt-1">{(detail.carousel_images as string[]).map((img: string, i: number) => <img key={i} src={img} alt={`轮播图 ${i + 1}`} className="w-full rounded-lg aspect-square object-cover" />)}</div></div>}
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
      const [rechargeRes, aiLogRes] = await Promise.all([
        supabase.from("recharge_records").select("user_id").gte("created_at", today),
        supabase.from("ai_logs").select("user_id").gte("created_at", today),
      ]);
      const countMap = new Map<string, number>();
      (rechargeRes.data || []).forEach(r => countMap.set(r.user_id, (countMap.get(r.user_id) || 0) + 1));
      const rechargeAnomaly = Array.from(countMap.values()).filter(c2 => c2 > 5).length;
      const aiMap = new Map<string, number>();
      (aiLogRes.data || []).forEach(l => aiMap.set(l.user_id, (aiMap.get(l.user_id) || 0) + 1));
      const highUsageUsers = Array.from(aiMap.values()).filter(c2 => c2 > 500).length;
      setStatus({ api: apiOk, db: dbOk, rechargeAnomaly, highUsageUsers }); setLoading(false);
    };
    check();
  }, []);

  if (loading) return <div className="text-center py-8" style={{ color: C.textDim }}>系统检测中...</div>;

  const StatusIcon = ({ ok }: { ok: boolean }) => ok
    ? <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${C.emerald}20` }}><div className="w-2 h-2 rounded-full" style={{ background: C.emerald }} /></div>
    : <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${C.rose}20` }}><div className="w-2 h-2 rounded-full" style={{ background: C.rose }} /></div>;

  const cards = [
    { icon: <StatusIcon ok={status.db === "ok"} />, label: "数据库", ok: status.db === "ok", text: status.db === "ok" ? "正常" : "异常" },
    { icon: <StatusIcon ok={status.api === "ok"} />, label: "API服务", ok: status.api === "ok", text: status.api === "ok" ? "正常" : "异常" },
    { icon: <StatusIcon ok={status.rechargeAnomaly === 0} />, label: "充值异常", ok: status.rechargeAnomaly === 0, text: status.rechargeAnomaly > 0 ? `${status.rechargeAnomaly} 个用户` : "无异常" },
    { icon: <StatusIcon ok={status.highUsageUsers === 0} />, label: "高频调用", ok: status.highUsageUsers === 0, text: status.highUsageUsers > 0 ? `${status.highUsageUsers} 个用户` : "正常" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c2, i) => (
          <div key={i} className="p-4 rounded-xl flex items-center gap-3 transition-all hover:translate-y-[-1px]" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            {c2.icon}
            <div>
              <p className="text-sm font-medium text-white">{c2.label}</p>
              <span className="px-2 py-0.5 rounded-full text-xs inline-block mt-1" style={{ background: c2.ok ? `${C.emerald}15` : `${C.rose}15`, color: c2.ok ? C.emerald : C.rose }}>{c2.text}</span>
            </div>
          </div>
        ))}
      </div>
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3"><Activity className="w-4 h-4" style={{ color: C.cyan }} /><h3 className="text-sm font-semibold" style={{ color: C.cyan }}>系统状态说明</h3></div>
        <div className="space-y-2 text-sm" style={{ color: C.textDim }}>
          <p>• <strong style={{ color: C.textMid }}>充值异常</strong>：单用户当日充值超过 5 次触发提醒</p>
          <p>• <strong style={{ color: C.textMid }}>高频调用</strong>：单用户当日 AI 调用超过 500 次触发提醒</p>
          <p>• 系统每次进入面板时自动检测，数据实时更新</p>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminPage;
