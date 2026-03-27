import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Supabase will auto-set the session from the recovery link hash
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "密码不一致", description: "请确认两次输入的密码相同。", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "密码太短", description: "密码至少需要6位。", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({ title: "重置失败", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "密码已重置", description: "您现在可以使用新密码登录。" });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-8 text-center">
          <img src="/logo.png" alt="Mt Logo" className="w-16 h-16 rounded-2xl mx-auto" />
          <h1 className="text-xl font-bold text-foreground">密码已重置 ✓</h1>
          <p className="text-sm text-muted-foreground">您现在可以关闭此页面，使用新密码登录。</p>
          <Button onClick={() => window.location.href = "/"} className="w-full">
            返回登录
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Mt Logo" className="w-16 h-16 rounded-2xl" />
          <h1 className="text-xl font-bold text-foreground">设置新密码</h1>
          <p className="text-sm text-muted-foreground">请输入您的新密码</p>
        </div>
        <Card className="border-border shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label>新密码</Label>
                <Input
                  type="password"
                  placeholder="至少6位密码"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>确认新密码</Label>
                <Input
                  type="password"
                  placeholder="再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "重置中..." : "确认重置密码"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
