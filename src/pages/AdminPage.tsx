import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Users, Bot, FileText, Edit2, Trash2, Coins,
  LayoutDashboard, ShoppingCart, Shield, Activity,
} from "lucide-react";
import AdminUnifiedDashboard from "@/components/admin/AdminUnifiedDashboard";
import OrderManagementPanel from "@/components/admin/OrderManagementPanel";
import SystemMonitorPanel from "@/components/admin/SystemMonitorPanel";

type UserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  remaining_points: number;
};

type AIConfig = {
  id: string;
  model_name: string;
  display_name: string;
  api_key: string | null;
  input_points_per_1k_tokens: number;
  image_points_per_image: number;
  output_points_per_1k_tokens: number;
  is_active: boolean;
};

type LogRow = {
  id: string;
  user_id: string;
  model_name: string;
  image_count: number;
  prompt_tokens: number;
  completion_tokens: number;
  points_cost: number;
  created_at: string;
  user_email?: string;
};

const AdminPage = () => {
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (adminLoading) {
    return (
      <div className="admin-dark flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: "hsl(195, 100%, 50%)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">无权限访问管理后台</div>;
  }

  return (
    <div className="admin-dark p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(0, 0%, 95%)" }}>
            <span style={{ color: "hsl(195, 100%, 50%)" }}>⚡</span> 站长经营控制台
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(220, 10%, 50%)" }}>
            实时数据大屏 · 营收分析 · 用户运营 · 系统监控
          </p>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="border-0 p-1 rounded-xl h-auto flex-wrap gap-1"
            style={{ background: "hsl(220, 15%, 10%)" }}>
            {[
              { value: "dashboard", icon: LayoutDashboard, label: "数据总览" },
              { value: "orders", icon: ShoppingCart, label: "订单管理" },
              { value: "users", icon: Users, label: "用户管理" },
              { value: "models", icon: Bot, label: "模型管理" },
              { value: "logs", icon: FileText, label: "调用日志" },
              { value: "system", icon: Shield, label: "系统监控" },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="gap-1.5 rounded-lg text-xs data-[state=active]:text-white data-[state=active]:shadow-none border-0"
                style={{ color: "hsl(220, 10%, 55%)" }}
                data-active-style>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="dashboard" className="mt-0"><AdminUnifiedDashboard /></TabsContent>
            <TabsContent value="orders" className="mt-0"><OrderManagementPanel /></TabsContent>
            <TabsContent value="users" className="mt-0"><UserManagement /></TabsContent>
            <TabsContent value="models" className="mt-0"><ModelManagement /></TabsContent>
            <TabsContent value="logs" className="mt-0"><LogsView /></TabsContent>
            <TabsContent value="system" className="mt-0"><SystemMonitorPanel /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// ── User Management ──
const UserManagement = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, phone, created_at, last_sign_in_at")
      .order("created_at", { ascending: false });

    if (!profiles) { setLoading(false); return; }

    const { data: points } = await supabase
      .from("user_points")
      .select("user_id, remaining_points");

    const pointsMap = new Map(points?.map((p) => [p.user_id, p.remaining_points]) || []);

    setUsers(profiles.map((p) => ({
      ...p,
      remaining_points: pointsMap.get(p.id) ?? 0,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdjustPoints = async () => {
    if (!adjustUserId || !adjustAmount) return;
    setAdjusting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-points", {
        body: { user_id: adjustUserId, amount: parseInt(adjustAmount), reason: adjustReason },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      toast.success(`积分修改成功，当前积分: ${data.remaining_points}`);
      setAdjustUserId(null);
      setAdjustAmount("");
      setAdjustReason("");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    }
    setAdjusting(false);
  };

  return (
    <div className="admin-glass overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>用户列表</h3>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8" style={{ color: "hsl(220, 10%, 50%)" }}>加载中...</div>
        ) : (
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>邮箱/手机号</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>注册时间</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>最后登录</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>剩余积分</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                    <TableCell style={{ color: "hsl(220, 10%, 75%)" }}>{u.email || u.phone || "—"}</TableCell>
                    <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>{new Date(u.created_at).toLocaleString("zh-CN")}</TableCell>
                    <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("zh-CN") : "—"}</TableCell>
                    <TableCell className="font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>{u.remaining_points}</TableCell>
                    <TableCell>
                      <Dialog open={adjustUserId === u.id} onOpenChange={(open) => { if (!open) setAdjustUserId(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 border-0 text-xs"
                            style={{ background: "hsl(220, 15%, 18%)", color: "hsl(195, 100%, 50%)" }}
                            onClick={() => setAdjustUserId(u.id)}>
                            <Coins className="w-3 h-3" />修改积分
                          </Button>
                        </DialogTrigger>
                        <DialogContent style={{ background: "hsl(220, 15%, 12%)", border: "1px solid hsl(220, 15%, 22%)", color: "hsl(0, 0%, 90%)" }}>
                          <DialogHeader>
                            <DialogTitle style={{ color: "hsl(195, 100%, 50%)" }}>修改积分 - {u.email || u.phone}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm" style={{ color: "hsl(220, 10%, 55%)" }}>当前积分: <span className="font-bold" style={{ color: "hsl(195, 100%, 50%)" }}>{u.remaining_points}</span></p>
                            <div className="space-y-2">
                              <Label style={{ color: "hsl(220, 10%, 65%)" }}>调整数量（正数增加，负数减少）</Label>
                              <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="如: 100 或 -50"
                                style={{ background: "hsl(220, 15%, 15%)", border: "1px solid hsl(220, 15%, 22%)", color: "#fff" }} />
                            </div>
                            <div className="space-y-2">
                              <Label style={{ color: "hsl(220, 10%, 65%)" }}>原因（选填）</Label>
                              <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="如: 充值、补偿"
                                style={{ background: "hsl(220, 15%, 15%)", border: "1px solid hsl(220, 15%, 22%)", color: "#fff" }} />
                            </div>
                            <Button onClick={handleAdjustPoints} disabled={adjusting || !adjustAmount} className="w-full border-0"
                              style={{ background: "hsl(195, 100%, 50%)", color: "#000" }}>
                              {adjusting ? "处理中..." : "确认修改"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Model Management ──
const ModelManagement = () => {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AIConfig | null>(null);
  const [form, setForm] = useState({
    model_name: "", display_name: "", api_key: "",
    input_points_per_1k_tokens: "1", image_points_per_image: "1",
    output_points_per_1k_tokens: "6", is_active: true,
  });

  const fetchConfigs = async () => {
    const { data } = await supabase.from("ai_config").select("*").order("created_at");
    if (data) setConfigs(data);
    setLoading(false);
  };

  useEffect(() => { fetchConfigs(); }, []);

  const resetForm = () => {
    setForm({ model_name: "", display_name: "", api_key: "", input_points_per_1k_tokens: "1", image_points_per_image: "1", output_points_per_1k_tokens: "6", is_active: true });
    setEditing(null);
  };

  const startEdit = (c: AIConfig) => {
    setEditing(c);
    setForm({
      model_name: c.model_name, display_name: c.display_name, api_key: c.api_key || "",
      input_points_per_1k_tokens: String(c.input_points_per_1k_tokens),
      image_points_per_image: String(c.image_points_per_image),
      output_points_per_1k_tokens: String(c.output_points_per_1k_tokens),
      is_active: c.is_active,
    });
  };

  const handleSave = async () => {
    const payload = {
      model_name: form.model_name, display_name: form.display_name,
      api_key: form.api_key || null,
      input_points_per_1k_tokens: parseInt(form.input_points_per_1k_tokens) || 1,
      image_points_per_image: parseInt(form.image_points_per_image) || 1,
      output_points_per_1k_tokens: parseInt(form.output_points_per_1k_tokens) || 6,
      is_active: form.is_active,
    };
    if (editing) {
      const { error } = await supabase.from("ai_config").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("模型配置已更新");
    } else {
      const { error } = await supabase.from("ai_config").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("模型已添加");
    }
    resetForm(); fetchConfigs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该模型？")) return;
    await supabase.from("ai_config").delete().eq("id", id);
    toast.success("已删除"); fetchConfigs();
  };

  const inputStyle = { background: "hsl(220, 15%, 15%)", border: "1px solid hsl(220, 15%, 22%)", color: "#fff" };
  const labelStyle = { color: "hsl(220, 10%, 65%)" };

  return (
    <div className="space-y-4">
      <div className="admin-glass p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "hsl(195, 100%, 50%)" }}>
          {editing ? "编辑模型" : "添加模型"}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label style={labelStyle}>模型名称 (API)</Label>
            <Input value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} placeholder="google/gemini-2.5-flash" style={inputStyle} />
          </div>
          <div className="space-y-2">
            <Label style={labelStyle}>显示名称</Label>
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Gemini 1.5 Flash" style={inputStyle} />
          </div>
          <div className="space-y-2">
            <Label style={labelStyle}>输入价格 (积分/1000 tokens)</Label>
            <Input type="number" value={form.input_points_per_1k_tokens} onChange={(e) => setForm({ ...form, input_points_per_1k_tokens: e.target.value })} style={inputStyle} />
          </div>
          <div className="space-y-2">
            <Label style={labelStyle}>图片价格 (积分/张)</Label>
            <Input type="number" value={form.image_points_per_image} onChange={(e) => setForm({ ...form, image_points_per_image: e.target.value })} style={inputStyle} />
          </div>
          <div className="space-y-2">
            <Label style={labelStyle}>输出价格 (积分/1000 tokens)</Label>
            <Input type="number" value={form.output_points_per_1k_tokens} onChange={(e) => setForm({ ...form, output_points_per_1k_tokens: e.target.value })} style={inputStyle} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <Label style={labelStyle}>启用</Label>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} disabled={!form.model_name || !form.display_name} className="border-0"
            style={{ background: "hsl(195, 100%, 50%)", color: "#000" }}>
            {editing ? "保存修改" : "添加模型"}
          </Button>
          {editing && <Button variant="outline" onClick={resetForm} style={{ background: "hsl(220, 15%, 18%)", color: "hsl(220, 10%, 70%)", border: "1px solid hsl(220, 15%, 22%)" }}>取消</Button>}
        </div>
      </div>

      <div className="admin-glass overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>模型列表</h3>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
                <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>显示名称</TableHead>
                <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>模型</TableHead>
                <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>输入/1K</TableHead>
                <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>图片/张</TableHead>
                <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>输出/1K</TableHead>
                <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>状态</TableHead>
                <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((c) => (
                <TableRow key={c.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                  <TableCell className="font-medium" style={{ color: "hsl(220, 10%, 80%)" }}>{c.display_name}</TableCell>
                  <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>{c.model_name}</TableCell>
                  <TableCell style={{ color: "hsl(220, 10%, 70%)" }}>{c.input_points_per_1k_tokens}</TableCell>
                  <TableCell style={{ color: "hsl(220, 10%, 70%)" }}>{c.image_points_per_image}</TableCell>
                  <TableCell style={{ color: "hsl(220, 10%, 70%)" }}>{c.output_points_per_1k_tokens}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs" style={{
                      background: c.is_active ? "hsl(160, 70%, 45%, 0.15)" : "hsl(220, 15%, 20%)",
                      color: c.is_active ? "hsl(160, 70%, 55%)" : "hsl(220, 10%, 45%)",
                    }}>
                      {c.is_active ? "启用" : "停用"}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(c)} style={{ color: "hsl(195, 100%, 50%)" }}><Edit2 className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} style={{ color: "hsl(350, 80%, 60%)" }}><Trash2 className="w-3 h-3" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

// ── Logs View ──
const LogsView = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data: logsData } = await supabase
        .from("ai_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (!logsData) { setLoading(false); return; }
      const userIds = [...new Set(logsData.map((l) => l.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email, phone").in("id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p.email || p.phone || "—"]) || []);
      setLogs(logsData.map((l) => ({ ...l, user_email: profileMap.get(l.user_id) || "—" })));
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="admin-glass overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>AI 调用日志（最近200条）</h3>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8" style={{ color: "hsl(220, 10%, 50%)" }}>加载中...</div>
        ) : (
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>用户</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>模型</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>图片数</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>输入 tokens</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>输出 tokens</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>消耗积分</TableHead>
                  <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                    <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 70%)" }}>{l.user_email}</TableCell>
                    <TableCell style={{ color: "hsl(220, 10%, 70%)" }}>{l.model_name}</TableCell>
                    <TableCell style={{ color: "hsl(220, 10%, 70%)" }}>{l.image_count}</TableCell>
                    <TableCell style={{ color: "hsl(220, 10%, 70%)" }}>{l.prompt_tokens}</TableCell>
                    <TableCell style={{ color: "hsl(220, 10%, 70%)" }}>{l.completion_tokens}</TableCell>
                    <TableCell className="font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>{l.points_cost}</TableCell>
                    <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>{new Date(l.created_at).toLocaleString("zh-CN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
