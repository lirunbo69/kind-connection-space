import { User, Edit2, Gift, CreditCard, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">一款专注于美客多的listing生成器</p>
        <h1 className="text-2xl font-bold">个人中心</h1>
        <p className="text-sm text-muted-foreground mt-1">管理您的账户信息、会员状态与积分</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">—</h2>
              <p className="text-sm text-muted-foreground">未登录</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl border-primary text-primary hover:bg-primary/5">
            <Edit2 className="w-4 h-4" />
            编辑资料
          </Button>
        </div>
      </div>

      {/* Credits Section */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm space-y-1">
        <p className="text-sm text-muted-foreground">当前积分余额</p>
        <p className="text-2xl font-bold">— 积分</p>
        <button
          onClick={() => navigate("/topup")}
          className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1 mt-1"
        >
          前往充值中心 <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Membership */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">会员等级</span>
        </div>
        <p className="text-lg font-semibold">—</p>
        <p className="text-sm text-muted-foreground">到期时间：—</p>
      </div>

      {/* Subscription */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">订阅周期</span>
        </div>
        <p className="text-base font-medium">—</p>
        <p className="text-sm text-muted-foreground">自动续费中</p>
      </div>

      {/* New User Bonus */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">新用户专属福利</h3>
            <p className="text-sm text-muted-foreground">注册即可领取100积分，体验完整AI Listing生成流程</p>
          </div>
        </div>
        <Button className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
          🔗 一键领取
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
