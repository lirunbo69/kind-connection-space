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
import { Users, Bot, FileText, Plus, Edit2, Trash2, Coins } from "lucide-react";

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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">无权限访问管理后台</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">管理后台</h1>
        <p className="text-sm text-muted-foreground">用户管理、AI模型配置、日志查看</p>
      </div>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1"><Users className="w-4 h-4" />用户管理</TabsTrigger>
          <TabsTrigger value="models" className="gap-1"><Bot className="w-4 h-4" />模型管理</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1"><FileText className="w-4 h-4" />调用日志</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><UserManagement /></TabsContent>
        <TabsContent value="models"><ModelManagement /></TabsContent>
        <TabsContent value="logs"><LogsView /></TabsContent>
      </Tabs>
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
    <Card>
      <CardHeader><CardTitle>用户列表</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>邮箱/手机号</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead>剩余积分</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email || u.phone || "—"}</TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleString("zh-CN")}</TableCell>
                  <TableCell>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("zh-CN") : "—"}</TableCell>
                  <TableCell className="font-semibold">{u.remaining_points}</TableCell>
                  <TableCell>
                    <Dialog open={adjustUserId === u.id} onOpenChange={(open) => { if (!open) setAdjustUserId(null); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setAdjustUserId(u.id)}>
                          <Coins className="w-3 h-3" />修改积分
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>修改积分 - {u.email || u.phone}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">当前积分: <span className="font-bold text-foreground">{u.remaining_points}</span></p>
                          <div className="space-y-2">
                            <Label>调整数量（正数增加，负数减少）</Label>
                            <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="如: 100 或 -50" />
                          </div>
                          <div className="space-y-2">
                            <Label>原因（选填）</Label>
                            <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="如: 充值、补偿" />
                          </div>
                          <Button onClick={handleAdjustPoints} disabled={adjusting || !adjustAmount} className="w-full">
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
        )}
      </CardContent>
    </Card>
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
      model_name: c.model_name,
      display_name: c.display_name,
      api_key: c.api_key || "",
      input_points_per_1k_tokens: String(c.input_points_per_1k_tokens),
      image_points_per_image: String(c.image_points_per_image),
      output_points_per_1k_tokens: String(c.output_points_per_1k_tokens),
      is_active: c.is_active,
    });
  };

  const handleSave = async () => {
    const payload = {
      model_name: form.model_name,
      display_name: form.display_name,
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
    resetForm();
    fetchConfigs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该模型？")) return;
    await supabase.from("ai_config").delete().eq("id", id);
    toast.success("已删除");
    fetchConfigs();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "编辑模型" : "添加模型"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>模型名称 (API)</Label>
              <Input value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} placeholder="google/gemini-2.5-flash" />
            </div>
            <div className="space-y-2">
              <Label>显示名称</Label>
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Gemini 1.5 Flash（标准版）" />
            </div>
            <div className="space-y-2">
              <Label>输入价格 (积分/1000 tokens)</Label>
              <Input type="number" value={form.input_points_per_1k_tokens} onChange={(e) => setForm({ ...form, input_points_per_1k_tokens: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>图片价格 (积分/张)</Label>
              <Input type="number" value={form.image_points_per_image} onChange={(e) => setForm({ ...form, image_points_per_image: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>输出价格 (积分/1000 tokens)</Label>
              <Input type="number" value={form.output_points_per_1k_tokens} onChange={(e) => setForm({ ...form, output_points_per_1k_tokens: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>启用</Label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={!form.model_name || !form.display_name}>
              {editing ? "保存修改" : "添加模型"}
            </Button>
            {editing && <Button variant="outline" onClick={resetForm}>取消</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>模型列表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>显示名称</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>输入/1K</TableHead>
                <TableHead>图片/张</TableHead>
                <TableHead>输出/1K</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.display_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.model_name}</TableCell>
                  <TableCell>{c.input_points_per_1k_tokens}</TableCell>
                  <TableCell>{c.image_points_per_image}</TableCell>
                  <TableCell>{c.output_points_per_1k_tokens}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.is_active ? "启用" : "停用"}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(c)}><Edit2 className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-3 h-3" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
        .from("ai_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!logsData) { setLoading(false); return; }

      // Fetch user emails
      const userIds = [...new Set(logsData.map((l) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, phone")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.email || p.phone || "—"]) || []);

      setLogs(logsData.map((l) => ({
        ...l,
        user_email: profileMap.get(l.user_id) || "—",
      })));
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle>AI 调用日志（最近200条）</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>图片数</TableHead>
                <TableHead>输入 tokens</TableHead>
                <TableHead>输出 tokens</TableHead>
                <TableHead>消耗积分</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{l.user_email}</TableCell>
                  <TableCell>{l.model_name}</TableCell>
                  <TableCell>{l.image_count}</TableCell>
                  <TableCell>{l.prompt_tokens}</TableCell>
                  <TableCell>{l.completion_tokens}</TableCell>
                  <TableCell className="font-semibold">{l.points_cost}</TableCell>
                  <TableCell className="text-xs">{new Date(l.created_at).toLocaleString("zh-CN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPage;
