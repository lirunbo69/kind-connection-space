import { PenLine, Layers, BarChart3, Key, Sparkles, Coins, User, Zap, ChevronsLeft, ChevronsRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useSidebarCollapsed } from "@/components/SidebarContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: PenLine, label: "Listing生成工作台", path: "/" },
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

  const NavItem = ({ icon: Icon, label, path, end }: { icon: any; label: string; path: string; end?: boolean }) => {
    const link = (
      <NavLink
        to={path}
        end={end}
        className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-2" : "px-3"} py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150`}
        activeClassName="bg-primary/15 text-primary font-medium shadow-sm"
      >
        <Icon className="w-4 h-4 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
        </Tooltip>
      );
    }
    return link;
  };

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${collapsed ? "w-16" : "w-52"} bg-sidebar flex flex-col border-r border-sidebar-border z-20 transition-all duration-200`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-5"} py-5`}>
        <img src="/logo.png" alt="秒通" className="w-9 h-9 rounded-xl shadow-lg shadow-primary/30 shrink-0" width={36} height={36} />
        {!collapsed && (
          <div>
            <div className="font-bold text-base text-sidebar-accent-foreground tracking-wide">秒通</div>
            <div className="text-[11px] text-sidebar-foreground/60 font-medium">ListingAI</div>
          </div>
        )}
      </div>

      <div className="mx-4 mb-2 border-t border-sidebar-border" />

      {!collapsed && (
        <div className="px-5 mb-1">
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold">工作台</span>
        </div>
      )}

      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavItem key={item.label} {...item} end={item.path === "/"} />
        ))}
      </nav>

      <div className="px-2 pb-3 space-y-0.5">
        <div className="mx-1 mb-2 border-t border-sidebar-border" />
        {!collapsed && (
          <div className="px-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold">账户</span>
          </div>
        )}
        {bottomItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}

        {/* User info */}
        <div className={`flex items-center ${collapsed ? "justify-center px-1" : "gap-2.5 px-3"} py-3 mt-2 rounded-lg bg-sidebar-accent/50`}>
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-sidebar-accent-foreground truncate">Pro 会员</div>
              <div className="text-[11px] text-sidebar-foreground/60">积分: 320 💎</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 mt-1 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
