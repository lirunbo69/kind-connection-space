import { User, Edit2, Gift, CreditCard, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { points, loading: pointsLoading } = useUserPoints();
  const [profile, setProfile] = useState<{ email?: string; phone?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({ email: user.email, phone: user.phone });
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">一款专注于美客多的listing生成器</p>
        <h1 className="text-2xl font-bold">个人中心</h1>
        <p className="text-sm text-muted-foreground mt-1">管理您的账户信息与积分</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{profile?.email || profile?.phone || "—"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email ? "邮箱用户" : profile?.phone ? "手机用户" : "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm space-y-1">
        <p className="text-sm text-muted-foreground">当前积分余额</p>
        <p className="text-2xl font-bold">{pointsLoading ? "—" : points} 积分</p>
        <p className="text-xs text-muted-foreground mt-1">1 积分 = 0.01 元</p>
      </div>

      {/* New User Bonus */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">新用户专属福利</h3>
            <p className="text-sm text-muted-foreground">注册即自动赠送200积分，体验完整AI功能</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
