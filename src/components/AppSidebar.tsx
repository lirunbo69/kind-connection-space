import { PenLine, Layers, BarChart3, Key, Sparkles, Coins, User, Zap, ChevronsLeft, ChevronsRight, LogOut, MessageSquare, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavLink } from "@/components/NavLink";
import { useSidebarCollapsed } from "@/components/SidebarContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useUserPoints } from "@/hooks/useUserPoints";

const navItems = [
  { icon: PenLine, label: "Listing生成工作台", path: "/" },
  { icon: MessageSquare, label: "AI图文对话", path: "/chat" },
  { icon: Layers, label: "批量生成", path: "/batch" },
  { icon: BarChart3, label: "竞品分析", path: "/analysis" },
  { icon: Key, label: "关键词工具", path: "/keywords" },
  { icon: Sparkles, label: "自由创作", path: "/create" },
];

const bottomItems = [
  { icon: Coins, label: "充值中心", path: "/topup" },
  { icon: User, label: "个人中心", path: "/profile" },
];

const AppSidebar = () => {
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  const { isAdmin } = useIsAdmin();
  const { points } = useUserPoints();

  const NavItem = ({ icon: Icon, label, path, end }: { icon: any; label: string; path: string; end?: boolean }) => {
    const link = (
      <NavLink
        to={path}
        end={end}
        className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-2" : "px-3"} py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-white/60 hover:shadow-sm transition-all duration-200`}
        activeClassName="bg-white/70 text-primary font-medium shadow-sm backdrop-blur-sm"
      >
        <Icon className="w-4 h-4 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs glass-strong rounded-lg">{label}</TooltipContent>
        </Tooltip>
      );
    }
    return link;
  };

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${collapsed ? "w-16" : "w-52"} glass-sidebar flex flex-col z-20 transition-all duration-300`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-5"} py-5`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
          <span className="text-primary-foreground font-bold text-sm">Mt</span>
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-base text-foreground tracking-wide">秒通</div>
            <div className="text-[11px] text-muted-foreground font-medium">ListingAI</div>
          </div>
        )}
      </div>

      <div className="mx-4 mb-2 border-t border-border/40" />

      {!collapsed && (
        <div className="px-5 mb-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">工作台</span>
        </div>
      )}

      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavItem key={item.label} {...item} end={item.path === "/"} />
        ))}
        {isAdmin && (
          <NavItem icon={Shield} label="管理后台" path="/admin" />
        )}
      </nav>

      <div className="px-2 pb-3 space-y-0.5">
        <div className="mx-1 mb-2 border-t border-border/40" />
        {!collapsed && (
          <div className="px-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">账户</span>
          </div>
        )}
        {bottomItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}

        {/* User info */}
        <div className={`flex items-center ${collapsed ? "justify-center px-1" : "gap-2.5 px-3"} py-3 mt-2 rounded-xl glass`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{isAdmin ? "管理员" : "用户"}</div>
              <div className="text-[11px] text-muted-foreground">积分: {points ?? "—"} 💎</div>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("已退出登录");
          }}
          className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-3"} py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all duration-200`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>退出登录</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 mt-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/50 transition-all duration-200"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
