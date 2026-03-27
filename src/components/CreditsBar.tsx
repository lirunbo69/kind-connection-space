import { Coins } from "lucide-react";
import { useUserPoints } from "@/hooks/useUserPoints";

const CreditsBar = () => {
  const { points, loading } = useUserPoints();

  return (
    <div className="flex items-center gap-2 bg-card border rounded-full px-4 py-2 shadow-sm">
      <Coins className="w-4 h-4 text-primary" />
      <span className="text-sm text-muted-foreground">可用积分：</span>
      <span className="text-lg font-bold text-primary">
        {loading ? "—" : (points ?? 0)}
      </span>
    </div>
  );
};

export default CreditsBar;
