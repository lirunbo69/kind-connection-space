import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, ArrowLeft } from "lucide-react";

type AuthView = "main" | "forgot-password";

const AuthPage = ({ onAuth }: { onAuth: () => void }) => {
  const [view, setView] = useState<AuthView>("main");
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
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setLoading(false);
    if (error) toast({ title: "注册失败", description: error.message, variant: "destructive" });
    else toast({ title: "注册成功", description: "请检查邮箱完成验证后登录。" });
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ phone, password });
    setLoading(false);
    if (error) toast({ title: "注册失败", description: error.message, variant: "destructive" });
    else toast({ title: "注册成功", description: "手机号注册成功，请登录。" });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (error) toast({ title: "发送失败", description: error.message, variant: "destructive" });
    else toast({ title: "重置邮件已发送", description: "请检查邮箱中的重置链接。" });
  };

  const Background3D = () => (
    <div className="fixed inset-0 overflow-hidden" style={{ perspective: "1200px" }}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-50" />

      {/* 3D floating shapes */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-30 animate-pulse"
        style={{
          background: "radial-gradient(circle, hsl(45, 100%, 60%) 0%, transparent 70%)",
          top: "-10%",
          right: "-10%",
          transform: "rotateX(45deg) rotateZ(-15deg)",
          transformStyle: "preserve-3d",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-[40px] opacity-20"
        style={{
          background: "linear-gradient(135deg, hsl(45, 95%, 55%), hsl(40, 90%, 65%))",
          bottom: "-5%",
          left: "-8%",
          transform: "rotateX(-30deg) rotateY(25deg) rotateZ(10deg)",
          transformStyle: "preserve-3d",
          animation: "float1 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-[30px] opacity-15"
        style={{
          background: "linear-gradient(225deg, hsl(48, 100%, 70%), hsl(35, 90%, 55%))",
          top: "20%",
          left: "5%",
          transform: "rotateX(20deg) rotateY(-35deg) rotateZ(5deg)",
          transformStyle: "preserve-3d",
          animation: "float2 10s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[200px] h-[200px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, hsl(42, 100%, 65%) 0%, transparent 70%)",
          bottom: "15%",
          right: "10%",
          transform: "rotateX(50deg) rotateZ(20deg)",
          transformStyle: "preserve-3d",
          animation: "float3 6s ease-in-out infinite",
        }}
      />
      {/* Geometric accent lines */}
      <div
        className="absolute w-[800px] h-[2px] opacity-10"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(45, 100%, 50%), transparent)",
          top: "35%",
          left: "-5%",
          transform: "rotateZ(-8deg) rotateX(60deg)",
          transformStyle: "preserve-3d",
        }}
      />
      <div
        className="absolute w-[600px] h-[2px] opacity-10"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(40, 95%, 55%), transparent)",
          bottom: "30%",
          right: "-5%",
          transform: "rotateZ(12deg) rotateX(50deg)",
          transformStyle: "preserve-3d",
        }}
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-white/10" />

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: rotateX(-30deg) rotateY(25deg) rotateZ(10deg) translateY(0); }
          50% { transform: rotateX(-25deg) rotateY(30deg) rotateZ(12deg) translateY(-30px); }
        }
        @keyframes float2 {
          0%, 100% { transform: rotateX(20deg) rotateY(-35deg) rotateZ(5deg) translateY(0); }
          50% { transform: rotateX(25deg) rotateY(-30deg) rotateZ(3deg) translateY(-20px); }
        }
        @keyframes float3 {
          0%, 100% { transform: rotateX(50deg) rotateZ(20deg) translateY(0); }
          50% { transform: rotateX(45deg) rotateZ(25deg) translateY(-25px); }
        }
      `}</style>
    </div>
  );

  if (view === "forgot-password") {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Background3D />
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="flex flex-col items-center gap-3">
            <img src="/logo.png" alt="Mt Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
            <h1 className="text-xl font-bold text-foreground">忘记密码</h1>
            <p className="text-sm text-muted-foreground text-center">输入注册邮箱，我们将发送重置链接</p>
          </div>
          <Card className="border-border/50 shadow-xl bg-white/80 backdrop-blur-xl">
            <CardContent className="pt-6">
              <button onClick={() => setView("main")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> 返回登录
              </button>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>邮箱地址</Label>
                  <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/70" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "发送中..." : "发送重置链接"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <Background3D />
      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Mt Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">欢迎使用 Mt</h1>
          <p className="text-sm text-muted-foreground">AI驱动的跨境电商Listing生成工具</p>
        </div>

        <Card className="border-border/50 shadow-xl bg-white/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
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
                        <Input type="tel" placeholder="+86 13800138000" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-white/70" />
                      </div>
                      <div className="space-y-2">
                        <Label>密码</Label>
                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/70" />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "登录中..." : "登录"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="email-pwd">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label>邮箱</Label>
                        <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/70" />
                      </div>
                      <div className="space-y-2">
                        <Label>密码</Label>
                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/70" />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "登录中..." : "登录"}
                      </Button>
                      <button type="button" onClick={() => setView("forgot-password")} className="w-full text-sm text-primary hover:underline text-center">
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
                        <Input type="tel" placeholder="+86 13800138000" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-white/70" />
                      </div>
                      <div className="space-y-2">
                        <Label>密码</Label>
                        <Input type="password" placeholder="至少6位密码" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-white/70" />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "注册中..." : "注册"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="email-signup">
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label>邮箱</Label>
                        <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/70" />
                      </div>
                      <div className="space-y-2">
                        <Label>密码</Label>
                        <Input type="password" placeholder="至少6位密码" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-white/70" />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "注册中..." : "注册"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground/80">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
