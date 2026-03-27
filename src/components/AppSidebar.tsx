import { PenLine, Layers, BarChart3, Key, Sparkles, Coins, User } from "lucide-react";
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
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/logo.png" alt="秒通" className="w-9 h-9 rounded-xl" width={36} height={36} />
        <div>
          <div className="font-semibold text-sm text-sidebar-accent-foreground">秒通</div>
          <div className="text-xs text-muted-foreground">ListingAI</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
        <div className="flex items-center gap-2 px-3 py-3 mt-2 border-t border-sidebar-border">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">用户昵称Pro会员积分: 320💎</span>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
