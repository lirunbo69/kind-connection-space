import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export type MonthlyStatPoint = {
  month: string;
  search_volume: number;
  growth_rate: number;
};

type TrendModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword: string;
  keywordZh?: string | null;
  data: MonthlyStatPoint[];
};

/** Generate 24 months of simulated trend data based on a base search volume */
export function generateMockMonthlyStats(baseVolume: number): MonthlyStatPoint[] {
  const now = new Date();
  const points: MonthlyStatPoint[] = [];
  let vol = Math.max(200, baseVolume * (0.4 + Math.random() * 0.3));

  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    // Add seasonality + noise
    const seasonFactor = 1 + 0.25 * Math.sin((d.getMonth() / 12) * Math.PI * 2);
    const noise = 0.85 + Math.random() * 0.3;
    const trendGrowth = 1 + (23 - i) * 0.008; // slight upward trend
    vol = Math.round(vol * seasonFactor * noise * trendGrowth);
    vol = Math.max(50, vol);

    const prevVol = points.length > 0 ? points[points.length - 1].search_volume : vol;
    const growthRate = prevVol > 0 ? parseFloat((((vol - prevVol) / prevVol) * 100).toFixed(1)) : 0;

    points.push({ month, search_volume: vol, growth_rate: growthRate });
  }
  return points;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const { search_volume, growth_rate } = payload[0].payload as MonthlyStatPoint;
  const isPositive = growth_rate >= 0;

  return (
    <div className="rounded-xl px-4 py-3 shadow-xl border border-border/40 backdrop-blur-md bg-popover/95 min-w-[180px]">
      <div className="text-xs font-semibold text-foreground mb-2">{label}</div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">搜索量</span>
        <span className="font-mono font-semibold text-foreground">{search_volume.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">月增长率</span>
        <span className={`font-mono font-semibold ${isPositive ? "text-red-500" : "text-emerald-500"}`}>
          {isPositive ? "↑" : "↓"} {Math.abs(growth_rate)}%
        </span>
      </div>
    </div>
  );
};

const TrendModal = ({ open, onOpenChange, keyword, keywordZh, data }: TrendModalProps) => {
  const maxVol = Math.max(...data.map(d => d.search_volume), 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] bg-card/95 backdrop-blur-xl border-border/40 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>{keyword}</span>
            {keywordZh && <span className="text-muted-foreground text-sm font-normal">({keywordZh})</span>}
            <span className="ml-auto text-xs text-muted-foreground font-normal">近24个月趋势</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-2">
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(data.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                  domain={[0, Math.ceil(maxVol * 1.15)]}
                  width={45}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="search_volume"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  dot={false}
                  activeDot={{ r: 5, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--background))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrendModal;
