import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        .from("recharge_records").select("*").order("created_at", { ascending: false }).limit(1000);
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
    const a = document.createElement("a"); a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-8" style={{ color: "hsl(220, 10%, 50%)" }}>加载中...</div>;

  const inputStyle = { background: "hsl(220, 15%, 15%)", border: "1px solid hsl(220, 15%, 22%)", color: "#fff" };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs mb-1 block" style={{ color: "hsl(220, 10%, 50%)" }}>搜索用户/金额</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(220, 10%, 40%)" }} />
            <Input className="pl-9" placeholder="搜索..." value={search} onChange={e => setSearch(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: "hsl(220, 10%, 50%)" }}>起始日期</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: "hsl(220, 10%, 50%)" }}>截止日期</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>
        <Button className="gap-2 border-0" onClick={exportCSV}
          style={{ background: "hsl(195, 100%, 50%)", color: "#000" }}>
          <Download className="w-4 h-4" />导出 CSV
        </Button>
      </div>

      <div className="admin-glass overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>订单列表（共 {filtered.length} 条）</h3>
        </div>
        <div className="p-4">
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>用户</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>金额</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>积分</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>状态</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 200).map(r => (
                  <TableRow key={r.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                    <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 70%)" }}>{r.user_email}</TableCell>
                    <TableCell className="font-medium" style={{ color: "hsl(40, 90%, 55%)" }}>¥{r.amount}</TableCell>
                    <TableCell style={{ color: "hsl(160, 70%, 55%)" }}>+{r.points.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{
                        background: r.status === "success" ? "hsl(160, 70%, 45%, 0.15)" : "hsl(220, 15%, 20%)",
                        color: r.status === "success" ? "hsl(160, 70%, 55%)" : "hsl(220, 10%, 45%)",
                      }}>
                        {r.status === "success" ? "成功" : r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>{new Date(r.created_at).toLocaleString("zh-CN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementPanel;
