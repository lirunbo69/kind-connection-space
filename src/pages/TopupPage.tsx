import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPoints } from "@/hooks/useUserPoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Coins, Sparkles, Zap, Crown, History } from "lucide-react";
import { useEffect } from "react";

const packages = [
  {
    id: "basic",
    name: "基础套餐",
    price: 10,
    points: 1000,
    bonus: 0,
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    popular: false,
  },
  {
    id: "standard",
    name: "标准套餐",
    price: 50,
    points: 5200,
    bonus: 200,
    icon: Sparkles,
    color: "from-violet-500 to-purple-500",
    popular: true,
  },
  {
    id: "premium",
    name: "尊享套餐",
    price: 100,
    points: 11000,
    bonus: 1000,
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    popular: false,
  },
];

type RechargeRecord = {
  id: string;
  amount: number;
  points: number;
  status: string;
  created_at: string;
};

const TopupPage = () => {
  const { points, loading: pointsLoading, refetch } = useUserPoints();
  const [processing, setProcessing] = useState<string | null>(null);
  const [records, setRecords] = useState<RechargeRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);

  const fetchRecords = async () => {
    const { data } = await supabase
      .from("recharge_records")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setRecords(data as RechargeRecord[]);
    setRecordsLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleRecharge = async (packageId: string) => {
    setProcessing(packageId);
    try {
      const { data, error } = await supabase.functions.invoke("process-recharge", {
        body: { package_id: packageId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      toast.success(`充值成功！到账 ${data.points_added} 积分，当前余额 ${data.remaining_points} 积分`);
      refetch();
      fetchRecords();
    } catch (e: any) {
      toast.error(e.message || "充值失败，请稍后重试");
    }
    setProcessing(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">积分充值中心</h1>
          <p className="text-sm text-muted-foreground mt-1">选择套餐，即时到账</p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-full px-5 py-2.5 shadow-sm">
          <Coins className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">当前积分：</span>
          <span className="text-xl font-bold text-primary">
            {pointsLoading ? "—" : (points ?? 0)}
          </span>
        </div>
      </div>

      {/* Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
              pkg.popular ? "ring-2 ring-primary shadow-md" : ""
            }`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0">
                <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground text-xs px-3 py-1">
                  最受欢迎
                </Badge>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-3`}>
                <pkg.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">¥{pkg.price}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-muted-foreground">
                    到账 <span className="font-semibold text-foreground">{pkg.points.toLocaleString()}</span> 积分
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="text-xs text-primary font-medium">
                      🎁 额外赠送 {pkg.bonus.toLocaleString()} 积分
                    </div>
                  )}
                </div>
              </div>
              <Button
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
                onClick={() => handleRecharge(pkg.id)}
                disabled={processing !== null}
              >
                {processing === pkg.id ? "处理中..." : "立即充值"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recharge History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="w-4 h-4" />
            充值记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">加载中...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">暂无充值记录</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>到账积分</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{new Date(r.created_at).toLocaleString("zh-CN")}</TableCell>
                    <TableCell className="font-medium">¥{r.amount}</TableCell>
                    <TableCell className="font-semibold text-primary">+{r.points.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "success" ? "default" : "secondary"} className="text-xs">
                        {r.status === "success" ? "成功" : r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopupPage;
