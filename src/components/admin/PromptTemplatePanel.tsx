import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";

const OPENROUTER_MODELS = [
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { value: "google/gemini-3-pro-image-preview", label: "Gemini 3 Pro Image" },
  { value: "google/gemini-3.1-flash-image-preview", label: "Gemini 3.1 Flash Image" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "openai/gpt-4.1", label: "GPT-4.1" },
  { value: "openai/gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "openai/gpt-4.1-nano", label: "GPT-4.1 Nano" },
  { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku" },
  { value: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick" },
  { value: "meta-llama/llama-4-scout", label: "Llama 4 Scout" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { value: "deepseek/deepseek-chat-v3-0324", label: "DeepSeek V3" },
  { value: "black-forest-labs/flux-schnell", label: "Flux Schnell (图片)" },
  { value: "black-forest-labs/flux-1.1-pro", label: "Flux 1.1 Pro (图片)" },
];

type PromptTemplate = {
  id: string;
  template_name: string;
  template_content: string;
  model: string;
  created_at: string;
};

const inputStyle = { background: "hsl(220, 15%, 15%)", border: "1px solid hsl(220, 15%, 22%)", color: "#fff" };
const labelStyle = { color: "hsl(220, 10%, 65%)" };

const PromptTemplatePanel = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [form, setForm] = useState({
    template_name: "",
    template_content: "",
    model: "google/gemini-2.5-flash",
  });
  const [testVars, setTestVars] = useState<Record<string, string>>({});

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("prompt_templates")
      .select("*")
      .order("created_at");
    if (data) setTemplates(data as PromptTemplate[]);
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const resetForm = () => {
    setForm({ template_name: "", template_content: "", model: "google/gemini-2.5-flash" });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (t: PromptTemplate) => {
    setEditingId(t.id);
    setForm({ template_name: t.template_name, template_content: t.template_content, model: t.model });
    setShowForm(true);
  };

  const startNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.template_name || !form.template_content) {
      toast.error("模板名称和内容不能为空");
      return;
    }
    const payload = {
      template_name: form.template_name,
      template_content: form.template_content,
      model: form.model,
    };
    if (editingId) {
      const { error } = await supabase.from("prompt_templates").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("模板已更新");
    } else {
      const { error } = await supabase.from("prompt_templates").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("模板已添加");
    }
    resetForm();
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该模板？")) return;
    await supabase.from("prompt_templates").delete().eq("id", id);
    toast.success("已删除");
    fetchTemplates();
  };

  // Extract variables from template content
  const extractVars = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, "")))];
  };

  const handlePreview = (t: PromptTemplate) => {
    const vars = extractVars(t.template_content);
    const initialVars: Record<string, string> = {};
    vars.forEach(v => { initialVars[v] = testVars[v] || ""; });
    setTestVars(initialVars);
    setPreviewContent(t.template_content);
    setPreviewOpen(true);
  };

  const renderPreview = (): string => {
    let rendered = previewContent;
    Object.entries(testVars).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || `[${key}]`);
    });
    return rendered;
  };

  return (
    <div className="space-y-4">
      {/* Form */}
      {showForm && (
        <div className="admin-glass p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "hsl(195, 100%, 50%)" }}>
            {editingId ? "编辑模板" : "新增模板"}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={labelStyle}>模板名称</Label>
                <Input
                  value={form.template_name}
                  onChange={e => setForm({ ...form, template_name: e.target.value })}
                  placeholder="如：卖点分析"
                  style={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <Label style={labelStyle}>AI 模型</Label>
                <Select value={form.model} onValueChange={v => setForm({ ...form, model: v })}>
                  <SelectTrigger style={inputStyle} className="w-full">
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "hsl(220, 15%, 15%)", border: "1px solid hsl(220, 15%, 22%)" }}>
                    {OPENROUTER_MODELS.map(m => (
                      <SelectItem key={m.value} value={m.value} style={{ color: "#fff" }} className="focus:bg-[hsl(220,15%,22%)] focus:text-white">
                        <span className="font-medium">{m.label}</span>
                        <span className="ml-2 text-xs opacity-50">{m.value}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label style={labelStyle}>
                Prompt 模板内容
                <span className="ml-2 text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>
                  支持变量: {"{{product_name}}"}, {"{{product_description}}"}, {"{{keywords}}"}, {"{{market}}"}, {"{{language}}"}, {"{{title_limit}}"}, {"{{image_count}}"}, {"{{selling_points}}"}, {"{{title}}"}, {"{{carousel_plan_item}}"}, {"{{has_white_bg_images}}"}, {"{{white_bg_image_count}}"}, {"{{has_reference_images}}"}, {"{{reference_image_count}}"}, {"{{has_hot_search_images}}"}, {"{{hot_search_image_count}}"}
                </span>
              </Label>
              <Textarea
                value={form.template_content}
                onChange={e => setForm({ ...form, template_content: e.target.value })}
                placeholder="输入 Prompt 模板，使用 {{变量名}} 作为占位符..."
                className="min-h-[200px] font-mono text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!form.template_name || !form.template_content}
                className="border-0" style={{ background: "hsl(195, 100%, 50%)", color: "#000" }}>
                {editingId ? "保存修改" : "添加模板"}
              </Button>
              <Button variant="outline" onClick={resetForm}
                style={{ background: "hsl(220, 15%, 18%)", color: "hsl(220, 10%, 70%)", border: "1px solid hsl(220, 15%, 22%)" }}>
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Template List */}
      <div className="admin-glass overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>Prompt 模板列表</h3>
          {!showForm && (
            <Button size="sm" onClick={startNew} className="gap-1 border-0"
              style={{ background: "hsl(195, 100%, 50%)", color: "#000" }}>
              <Plus className="w-3.5 h-3.5" />新增模板
            </Button>
          )}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8" style={{ color: "hsl(220, 10%, 50%)" }}>加载中...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8" style={{ color: "hsl(220, 10%, 50%)" }}>暂无模板</div>
          ) : (
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
                    <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>模板名称</TableHead>
                    <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>AI 模型</TableHead>
                    <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>内容预览</TableHead>
                    <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>创建时间</TableHead>
                    <TableHead style={{ color: "hsl(220, 10%, 55%)" }}>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map(t => (
                    <TableRow key={t.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                      <TableCell className="font-medium" style={{ color: "hsl(220, 10%, 80%)" }}>{t.template_name}</TableCell>
                      <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>{t.model}</TableCell>
                      <TableCell className="text-xs max-w-[300px] truncate" style={{ color: "hsl(220, 10%, 60%)" }}>
                        {t.template_content.slice(0, 80)}...
                      </TableCell>
                      <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>
                        {new Date(t.created_at).toLocaleString("zh-CN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handlePreview(t)}
                            className="h-7 w-7 p-0" style={{ color: "hsl(160, 70%, 45%)" }}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => startEdit(t)}
                            className="h-7 w-7 p-0" style={{ color: "hsl(195, 100%, 50%)" }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}
                            className="h-7 w-7 p-0" style={{ color: "hsl(350, 80%, 60%)" }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl" style={{ background: "hsl(220, 15%, 12%)", border: "1px solid hsl(220, 15%, 22%)", color: "hsl(0, 0%, 90%)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(195, 100%, 50%)" }}>模板预览</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(testVars).map(key => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs" style={labelStyle}>{key}</Label>
                  <Input
                    value={testVars[key]}
                    onChange={e => setTestVars(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`输入 ${key} 的测试值`}
                    className="h-8 text-sm"
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div>
              <Label className="text-xs mb-2 block" style={labelStyle}>渲染结果</Label>
              <div className="rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[300px] overflow-auto"
                style={{ background: "hsl(220, 15%, 8%)", border: "1px solid hsl(220, 15%, 18%)", color: "hsl(220, 10%, 75%)" }}>
                {renderPreview()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptTemplatePanel;
