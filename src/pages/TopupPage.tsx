import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserPoints } from "@/hooks/useUserPoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Coins, Sparkles, Zap, Crown, History, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  out_trade_no?: string;
  trade_no?: string;
  paid_at?: string;
};

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "待支付", variant: "outline" },
  success: { label: "已完成", variant: "default" },
  closed: { label: "已关闭", variant: "secondary" },
  failed: { label: "支付失败", variant: "destructive" },
};

const TopupPage = () => {
  const { points, loading: pointsLoading, refetch } = useUserPoints();
  const [processing, setProcessing] = useState<string | null>(null);
  const [records, setRecords] = useState<RechargeRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    status: "paying" | "success" | "failed" | "closed";
    outTradeNo: string;
    points: number;
  }>({ open: false, status: "paying", outTradeNo: "", points: 0 });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase
      .from("recharge_records")
      .select("id, amount, points, status, created_at, out_trade_no, trade_no, paid_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setRecords(data as RechargeRecord[]);
    setRecordsLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (outTradeNo: string, pointsAmount: number) => {
    if (pollRef.current) clearInterval(pollRef.current);

    setPaymentDialog({ open: true, status: "paying", outTradeNo, points: pointsAmount });

    let attempts = 0;
    const maxAttempts = 90; // 15 min / 10s = 90

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const { data, error } = await supabase.functions.invoke(
          `check-order-status?out_trade_no=${outTradeNo}`,
          { method: "GET" }
        );

        if (error) return;

        if (data?.status === "success") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setPaymentDialog(prev => ({ ...prev, status: "success" }));
          toast.success(`支付成功！${pointsAmount} 积分已到账`);
          refetch();
          fetchRecords();
        } else if (data?.status === "closed" || data?.status === "failed") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setPaymentDialog(prev => ({ ...prev, status: data.status }));
          fetchRecords();
        }
      } catch {
        // ignore polling errors
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        setPaymentDialog(prev => ({ ...prev, status: "closed" }));
      }
    }, 10000); // Poll every 10s
  };

  const handleRecharge = async (packageId: string) => {
    setProcessing(packageId);
    try {
      const pkg = packages.find(p => p.id === packageId)!;
      const returnUrl = window.location.origin + "/topup";

      const { data, error } = await supabase.functions.invoke("create-alipay-order", {
        body: { package_id: packageId, return_url: returnUrl },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (data?.pay_url) {
        // Start polling for payment status
        startPolling(data.out_trade_no, pkg.points);
        // Redirect to Alipay in a new window or same window
        window.open(data.pay_url, "_blank");
        fetchRecords();
      }
    } catch (e: any) {
      toast.error(e.message || "创建订单失败，请稍后重试");
    }
    setProcessing(null);
  };

  const closePaymentDialog = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPaymentDialog(prev => ({ ...prev, open: false }));
    refetch();
    fetchRecords();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">积分充值中心</h1>
          <p className="text-sm text-muted-foreground mt-1">选择套餐，支付宝安全支付，即时到账</p>
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
                {processing === pkg.id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    创建订单中...
                  </span>
                ) : "立即充值"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Status Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => !open && closePaymentDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>支付状态</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            {paymentDialog.status === "paying" && (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg font-semibold">等待支付中...</p>
                <p className="text-sm text-muted-foreground text-center">
                  请在打开的支付宝页面完成付款<br />
                  支付完成后将自动确认，请勿关闭此页面
                </p>
                <p className="text-xs text-muted-foreground">
                  订单号: {paymentDialog.outTradeNo}
                </p>
              </>
            )}
            {paymentDialog.status === "success" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-lg font-semibold text-green-600">支付成功！</p>
                <p className="text-sm text-muted-foreground">
                  {paymentDialog.points.toLocaleString()} 积分已到账
                </p>
                <Button onClick={closePaymentDialog}>确定</Button>
              </>
            )}
            {paymentDialog.status === "closed" && (
              <>
                <Clock className="w-12 h-12 text-muted-foreground" />
                <p className="text-lg font-semibold">订单已关闭</p>
                <p className="text-sm text-muted-foreground">订单超时未支付，已自动关闭</p>
                <Button variant="outline" onClick={closePaymentDialog}>关闭</Button>
              </>
            )}
            {paymentDialog.status === "failed" && (
              <>
                <XCircle className="w-12 h-12 text-destructive" />
                <p className="text-lg font-semibold text-destructive">支付失败</p>
                <p className="text-sm text-muted-foreground">请检查支付信息后重试</p>
                <Button variant="outline" onClick={closePaymentDialog}>关闭</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
                  <TableHead>订单号</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>到账积分</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => {
                  const st = statusMap[r.status] || { label: r.status, variant: "secondary" as const };
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{new Date(r.created_at).toLocaleString("zh-CN")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{r.out_trade_no || "—"}</TableCell>
                      <TableCell className="font-medium">¥{r.amount}</TableCell>
                      <TableCell className="font-semibold text-primary">+{r.points.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={st.variant} className="text-xs">
                          {st.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopupPage;
