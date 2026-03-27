import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, ArrowLeft, BarChart3, TrendingUp, Globe, Zap, Layers, PenLine } from "lucide-react";

type AuthView = "main" | "forgot-password";

// ── Static sub-components (defined OUTSIDE AuthPage to avoid remounts) ──

const features = [
  { icon: PenLine, title: "智能Listing生成", desc: "AI一键生成高质量产品描述" },
  { icon: Layers, title: "批量处理", desc: "高效批量生成，节省时间" },
  { icon: BarChart3, title: "数据分析", desc: "竞品分析与关键词优化" },
  { icon: Globe, title: "多平台适配", desc: "支持主流跨境电商平台" },
];

const DashboardMockup = () => (
  <div className="relative w-full max-w-lg animate-[fadeSlideUp_1s_ease-out_0.3s_both]">
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-amber-100/50">
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "今日Listing", value: "128", trend: "+12%", color: "text-emerald-500" },
          { label: "转化率", value: "4.8%", trend: "+0.5%", color: "text-emerald-500" },
          { label: "总生成数", value: "3,562", trend: "+8%", color: "text-emerald-500" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-amber-50/80 to-white rounded-xl p-3 border border-amber-100/30"
            style={{ animation: `fadeSlideUp 0.6s ease-out ${0.5 + i * 0.15}s both` }}
          >
            <div className="text-[10px] text-gray-400 mb-1">{stat.label}</div>
            <div className="text-lg font-bold text-gray-800">{stat.value}</div>
            <div className={`text-[10px] ${stat.color} font-medium`}>{stat.trend}</div>
          </div>
        ))}
      </div>

      <div
        className="bg-gradient-to-br from-amber-50/50 to-white rounded-xl p-4 border border-amber-100/30 mb-4"
        style={{ animation: "fadeSlideUp 0.6s ease-out 0.95s both" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-600">生成趋势</span>
          <span className="text-[10px] text-gray-400">近7天</span>
        </div>
        <svg viewBox="0 0 300 80" className="w-full h-16">
          {[0, 20, 40, 60].map((y) => (
            <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#f5f5f5" strokeWidth="0.5" />
          ))}
          <path
            d="M0,60 C30,55 60,35 90,40 C120,45 150,20 180,25 C210,30 240,10 270,15 L270,80 L0,80 Z"
            fill="url(#chartGradient)"
            className="animate-[chartDraw_2s_ease-out_1.2s_both]"
          />
          <path
            d="M0,60 C30,55 60,35 90,40 C120,45 150,20 180,25 C210,30 240,10 270,15"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset="400"
            style={{ animation: "lineReveal 2s ease-out 1.2s forwards" }}
          />
          {[[0, 60], [90, 40], [180, 25], [270, 15]].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="3"
              fill="#f59e0b"
              className="animate-[dotPop_0.3s_ease-out_both]"
              style={{ animationDelay: `${1.8 + i * 0.15}s` }}
            />
          ))}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["AI优化", "多平台适配", "批量生成", "SEO分析"].map((tag, i) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full bg-amber-100/60 text-amber-700 text-[10px] font-medium border border-amber-200/40"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${1.5 + i * 0.1}s both` }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>

    <div
      className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-amber-100/50 flex items-center gap-2"
      style={{ animation: "floatBounce 3s ease-in-out infinite, fadeSlideUp 0.6s ease-out 1.8s both" }}
    >
      <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
        <TrendingUp className="w-3.5 h-3.5 text-white" />
      </div>
      <div>
        <div className="text-[10px] font-medium text-gray-700">转化提升</div>
        <div className="text-xs font-bold text-amber-600">+32%</div>
      </div>
    </div>

    <div
      className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg px-3 py-2 border border-amber-100/50 flex items-center gap-2"
      style={{ animation: "floatBounce 4s ease-in-out 1s infinite, fadeSlideUp 0.6s ease-out 2s both" }}
    >
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
        <Zap className="w-3 h-3 text-white" />
      </div>
      <span className="text-[10px] font-medium text-gray-600">AI智能生成中...</span>
    </div>
  </div>
);

const HeroPanel = () => (
  <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-12">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-200/20 -top-32 -left-32 animate-[pulseScale_8s_ease-in-out_infinite]" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-yellow-200/15 -bottom-20 -right-20 animate-[pulseScale_10s_ease-in-out_2s_infinite]" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-orange-200/10 top-1/4 right-1/4 animate-[pulseScale_6s_ease-in-out_1s_infinite]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, #92400e 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
    </div>

    <div className="relative z-10 max-w-xl flex flex-col items-center text-center">
      <div className="mb-8 animate-[fadeSlideUp_0.8s_ease-out]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.png" alt="Mt" className="w-12 h-12 rounded-xl shadow-md" />
          <h1 className="text-3xl font-bold text-gray-800">
            Mt <span className="text-amber-500">ListingAI</span>
          </h1>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed max-w-md">
          AI驱动的跨境电商Listing生成工具，智能优化产品描述，助力全球业务增长
        </p>
      </div>

      <DashboardMockup />

      <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-md">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-amber-100/40 hover:bg-white/80 transition-colors"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${2.2 + i * 0.12}s both` }}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <f.icon className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700">{f.title}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FormLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex">
    <HeroPanel />
    <div className="flex-1 flex items-center justify-center p-6 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 lg:hidden" />
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 lg:hidden mb-4">
          <img src="/logo.png" alt="Mt Logo" className="w-14 h-14 rounded-2xl shadow-md" />
          <h1 className="text-xl font-bold text-gray-800">Mt ListingAI</h1>
        </div>
        {children}
      </div>
    </div>
  </div>
);

// ── Main AuthPage component ──

const AuthPage = ({ onAuth, defaultTab = "login", onBack }: { onAuth: () => void; defaultTab?: string; onBack?: () => void }) => {
  const [view, setView] = useState<AuthView>("main");
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast({ title: "登录失败", description: error.message, variant: "destructive" });
    else onAuth();
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ phone, password });
    setLoading(false);
    if (error) toast({ title: "登录失败", description: error.message, variant: "destructive" });
    else onAuth();
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "注册失败", description: error.message, variant: "destructive" });
    } else if (data.session) {
      toast({ title: "注册成功", description: "欢迎使用！" });
      onAuth();
    } else {
      toast({ title: "注册成功", description: "请使用邮箱和密码登录。" });
      setPassword("");
      setActiveTab("login");
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ phone, password });
    setLoading(false);
    if (error) {
      toast({ title: "注册失败", description: error.message, variant: "destructive" });
    } else if (data.session) {
      toast({ title: "注册成功", description: "欢迎使用！" });
      onAuth();
    } else {
      toast({ title: "注册成功", description: "请使用手机号和密码登录。" });
      setPassword("");
      setActiveTab("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (error) toast({ title: "发送失败", description: error.message, variant: "destructive" });
    else toast({ title: "重置邮件已发送", description: "请检查邮箱中的重置链接。" });
  };

  if (view === "forgot-password") {
    return (
      <FormLayout>
        <div className="space-y-2 text-center animate-[fadeSlideUp_0.4s_ease-out]">
          <h2 className="text-xl font-bold text-foreground">忘记密码</h2>
          <p className="text-sm text-muted-foreground">输入注册邮箱，我们将发送重置链接</p>
        </div>
        <Card className="border-border/40 shadow-lg animate-[fadeSlideUp_0.5s_ease-out_0.1s_both]">
          <CardContent className="pt-6">
            <button onClick={() => setView("main")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> 返回登录
            </button>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>邮箱地址</Label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
                {loading ? "发送中..." : "发送重置链接"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </FormLayout>
    );
  }

  return (
    <FormLayout>
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors animate-[fadeSlideUp_0.3s_ease-out]">
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </button>
      )}
      <div className="space-y-1 text-center animate-[fadeSlideUp_0.4s_ease-out]">
        <h2 className="text-xl font-bold text-foreground">欢迎回来</h2>
        <p className="text-sm text-muted-foreground">登录您的账户开始使用</p>
      </div>

      <Card className="border-border/40 shadow-lg animate-[fadeSlideUp_0.5s_ease-out_0.1s_both]">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Tabs defaultValue="phone-pwd">
                <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
                  <TabsTrigger value="phone-pwd" className="text-xs gap-1">
                    <Phone className="w-3 h-3" />手机号登录
                  </TabsTrigger>
                  <TabsTrigger value="email-pwd" className="text-xs gap-1">
                    <Mail className="w-3 h-3" />邮箱登录
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="phone-pwd">
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label>手机号</Label>
                      <Input type="tel" placeholder="+86 13800138000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>密码</Label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
                      {loading ? "登录中..." : "登录"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="email-pwd">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label>邮箱</Label>
                      <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>密码</Label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
                      {loading ? "登录中..." : "登录"}
                    </Button>
                    <button type="button" onClick={() => setView("forgot-password")} className="w-full text-sm text-amber-600 hover:underline text-center">
                      忘记密码？
                    </button>
                  </form>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="signup">
              <Tabs defaultValue="phone-signup">
                <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
                  <TabsTrigger value="phone-signup" className="text-xs gap-1">
                    <Phone className="w-3 h-3" />手机号注册
                  </TabsTrigger>
                  <TabsTrigger value="email-signup" className="text-xs gap-1">
                    <Mail className="w-3 h-3" />邮箱注册
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="phone-signup">
                  <form onSubmit={handlePhoneSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label>手机号</Label>
                      <Input type="tel" placeholder="+86 13800138000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>密码</Label>
                      <Input type="password" placeholder="至少6位密码" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </div>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
                      {loading ? "注册中..." : "注册"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="email-signup">
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label>邮箱</Label>
                      <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>密码</Label>
                      <Input type="password" placeholder="至少6位密码" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </div>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
                      {loading ? "注册中..." : "注册"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="text-[11px] text-center text-muted-foreground">
        登录即表示您同意我们的服务条款和隐私政策
      </p>
    </FormLayout>
  );
};

export default AuthPage;
