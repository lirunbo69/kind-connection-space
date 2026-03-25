import { PenLine, Layers, BarChart3, Key, Sparkles, Coins, User } from "lucide-react";

const navItems = [
  { icon: PenLine, label: "Listing生成工作台", active: true },
  { icon: Layers, label: "批量生成" },
  { icon: BarChart3, label: "竞品分析" },
  { icon: Key, label: "关键词工具" },
  { icon: Sparkles, label: "自由创作" },
];

const bottomItems = [
  { icon: Coins, label: "充值中心" },
  { icon: User, label: "个人中心" },
];

const AppSidebar = () => {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-52 bg-sidebar flex flex-col border-r border-sidebar-border z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-semibold text-sm text-sidebar-accent-foreground">李润博测试ERP</div>
          <div className="text-xs text-muted-foreground">ListingAI</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-0.5">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
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
