import { Coins } from "lucide-react";

const CreditsBar = () => (
  <div className="flex items-center gap-2 bg-card border rounded-full px-4 py-2 shadow-sm">
    <Coins className="w-4 h-4 text-primary" />
    <span className="text-sm text-muted-foreground">可用积分：</span>
    <span className="text-lg font-bold text-primary">320</span>
  </div>
);

export default CreditsBar;
