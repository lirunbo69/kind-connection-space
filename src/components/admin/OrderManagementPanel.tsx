import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";

type OrderRow = {
  id: string;
  user_id: string;
  amount: number;
  points: number;
  status: string;
  created_at: string;
  user_email?: string;
};

const OrderManagementPanel = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filtered, setFiltered] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("recharge_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (!data) { setLoading(false); return; }

      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email, phone").in("id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p.email || p.phone || "—"]) || []);

      const enriched = data.map((r) => ({ ...r, user_email: profileMap.get(r.user_id) || "—" }));
      setOrders(enriched);
      setFiltered(enriched);
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    let result = orders;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.user_email?.toLowerCase().includes(q) || String(r.amount).includes(q));
    }
    if (dateFrom) result = result.filter(r => r.created_at >= dateFrom);
    if (dateTo) result = result.filter(r => r.created_at <= dateTo + "T23:59:59");
    setFiltered(result);
  }, [search, dateFrom, dateTo, orders]);

  const exportCSV = () => {
    const header = "用户,金额,积分,状态,时间\n";
    const rows = filtered.map(r =>
      `${r.user_email},${r.amount},${r.points},${r.status},${new Date(r.created_at).toLocaleString("zh-CN")}`
    ).join("\n");
    const blob = new Blob(["\ufeff" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">加载中...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground mb-1 block">搜索用户/金额</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="搜索..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">起始日期</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">截止日期</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="w-4 h-4" />导出 CSV
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">订单列表（共 {filtered.length} 条）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>积分</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 200).map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{r.user_email}</TableCell>
                    <TableCell className="font-medium">¥{r.amount}</TableCell>
                    <TableCell>+{r.points.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {r.status === "success" ? "成功" : r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("zh-CN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagementPanel;
