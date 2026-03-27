import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, KeyRound, ArrowLeft } from "lucide-react";

type AuthView = "main" | "email-otp-verify" | "phone-otp-verify" | "forgot-password" | "reset-verify";

const AuthPage = ({ onAuth }: { onAuth: () => void }) => {
  const [view, setView] = useState<AuthView>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpTarget, setOtpTarget] = useState<"email" | "phone">("email");
  const { toast } = useToast();

  const resetFields = () => {
    setOtp("");
    setNewPassword("");
  };

  // 邮箱+密码登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "登录失败", description: error.message, variant: "destructive" });
    } else {
      onAuth();
    }
  };

  // 邮箱+密码注册
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: "注册失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "注册成功", description: "请检查邮箱完成验证后登录。" });
    }
  };

  // 手机号+密码注册
  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ phone, password });
    setLoading(false);
    if (error) {
      toast({ title: "注册失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "验证码已发送", description: "请查看手机短信输入验证码。" });
      setOtpTarget("phone");
      setView("phone-otp-verify");
    }
  };

  // 邮箱验证码登录 - 发送OTP
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      toast({ title: "发送失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "验证码已发送", description: "请检查邮箱获取验证码。" });
      setOtpTarget("email");
      setView("email-otp-verify");
    }
  };

  // 手机验证码登录 - 发送OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) {
      toast({ title: "发送失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "验证码已发送", description: "请查看手机短信获取验证码。" });
      setOtpTarget("phone");
      setView("phone-otp-verify");
    }
  };

  // 验证OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const verifyPayload = otpTarget === "email"
      ? { email, token: otp, type: "email" as const }
      : { phone, token: otp, type: "sms" as const };
    const { error } = await supabase.auth.verifyOtp(verifyPayload);
    setLoading(false);
    if (error) {
      toast({ title: "验证失败", description: error.message, variant: "destructive" });
    } else {
      onAuth();
    }
  };

  // 忘记密码 - 发送重置验证码
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "发送失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "重置邮件已发送", description: "请检查邮箱中的重置链接。" });
    }
  };

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={() => { resetFields(); onClick(); }}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" /> 返回登录
    </button>
  );

  // OTP验证视图 (邮箱/手机)
  if (view === "email-otp-verify" || view === "phone-otp-verify") {
    const isEmail = view === "email-otp-verify";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-3">
            <img src="/logo.png" alt="Mt Logo" className="w-16 h-16 rounded-2xl" />
            <h1 className="text-xl font-bold text-foreground">输入验证码</h1>
            <p className="text-sm text-muted-foreground text-center">
              验证码已发送至 {isEmail ? email : phone}
            </p>
          </div>
          <Card className="border-border shadow-lg">
            <CardContent className="pt-6">
              <BackButton onClick={() => setView("main")} />
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label>验证码</Label>
                  <Input
                    type="text"
                    placeholder="请输入6位验证码"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="text-center text-lg tracking-[0.5em]"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "验证中..." : "确认登录"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 忘记密码视图
  if (view === "forgot-password") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-3">
            <img src="/logo.png" alt="Mt Logo" className="w-16 h-16 rounded-2xl" />
            <h1 className="text-xl font-bold text-foreground">忘记密码</h1>
            <p className="text-sm text-muted-foreground text-center">
              输入注册邮箱，我们将发送重置链接
            </p>
          </div>
          <Card className="border-border shadow-lg">
            <CardContent className="pt-6">
              <BackButton onClick={() => setView("main")} />
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>邮箱地址</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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

  // 主登录/注册视图
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Mt Logo" className="w-16 h-16 rounded-2xl" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">欢迎使用 Mt</h1>
          <p className="text-sm text-muted-foreground">AI驱动的跨境电商Listing生成工具</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="signup">注册</TabsTrigger>
              </TabsList>

              {/* ========== 登录 ========== */}
              <TabsContent value="login">
                <Tabs defaultValue="email-pwd">
                  <TabsList className="grid w-full grid-cols-3 mb-4 h-9">
                    <TabsTrigger value="email-pwd" className="text-xs gap-1">
                      <KeyRound className="w-3 h-3" />密码
                    </TabsTrigger>
                    <TabsTrigger value="email-otp" className="text-xs gap-1">
                      <Mail className="w-3 h-3" />邮箱验证码
                    </TabsTrigger>
                    <TabsTrigger value="phone-otp" className="text-xs gap-1">
                      <Phone className="w-3 h-3" />手机验证码
                    </TabsTrigger>
                  </TabsList>

                  {/* 邮箱+密码登录 */}
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
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "登录中..." : "登录"}
                      </Button>
                      <button type="button" onClick={() => setView("forgot-password")} className="w-full text-sm text-primary hover:underline text-center">
                        忘记密码？
                      </button>
                    </form>
                  </TabsContent>

                  {/* 邮箱验证码登录 */}
                  <TabsContent value="email-otp">
                    <form onSubmit={handleSendEmailOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label>邮箱</Label>
                        <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "发送中..." : "发送验证码"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* 手机验证码登录 */}
                  <TabsContent value="phone-otp">
                    <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label>手机号</Label>
                        <Input type="tel" placeholder="+86 13800138000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "发送中..." : "发送验证码"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* ========== 注册 ========== */}
              <TabsContent value="signup">
                <Tabs defaultValue="email-signup">
                  <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
                    <TabsTrigger value="email-signup" className="text-xs gap-1">
                      <Mail className="w-3 h-3" />邮箱注册
                    </TabsTrigger>
                    <TabsTrigger value="phone-signup" className="text-xs gap-1">
                      <Phone className="w-3 h-3" />手机号注册
                    </TabsTrigger>
                  </TabsList>

                  {/* 邮箱注册 */}
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
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "注册中..." : "注册"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* 手机号注册 */}
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
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "注册中..." : "注册并发送验证码"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
