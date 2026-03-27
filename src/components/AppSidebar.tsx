import { PenLine, Layers, BarChart3, Key, Sparkles, Coins, User, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";

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
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-52 bg-sidebar flex flex-col border-r border-sidebar-border z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="/logo.png" alt="秒通" className="w-9 h-9 rounded-xl shadow-lg shadow-primary/30" width={36} height={36} />
        <div>
          <div className="font-bold text-base text-sidebar-accent-foreground tracking-wide">秒通</div>
          <div className="text-[11px] text-sidebar-foreground/60 font-medium">ListingAI</div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 border-t border-sidebar-border" />

      {/* Section Label */}
      <div className="px-5 mb-1">
        <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold">工作台</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
            activeClassName="bg-primary/15 text-primary font-medium shadow-sm"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-0.5">
        <div className="mx-1 mb-2 border-t border-sidebar-border" />
        <div className="px-2 mb-1">
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold">账户</span>
        </div>
        {bottomItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
            activeClassName="bg-primary/15 text-primary font-medium shadow-sm"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}

        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-3 mt-2 rounded-lg bg-sidebar-accent/50">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-sidebar-accent-foreground truncate">Pro 会员</div>
            <div className="text-[11px] text-sidebar-foreground/60">积分: 320 💎</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
