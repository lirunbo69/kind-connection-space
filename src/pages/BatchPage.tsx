import { Upload, Download, FileSpreadsheet, Play, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sampleProducts = [
  { id: 3, name: "竹纤维瑜伽垫", keywords: "瑜伽垫 竹纤维 防滑 天然", market: "巴西", lang: "葡萄牙语", status: "running" as const },
  { id: 2, name: "防晒霜SPF50", keywords: "防晒霜 SPF50 户外 轻薄", market: "墨西哥", lang: "西班牙语", status: "done" as const },
  { id: 1, name: "折叠雨伞", keywords: "雨伞 折叠 抗风 防UV", market: "墨西哥", lang: "西班牙语", status: "waiting" as const },
  { id: 6, name: "不锈钢餐具套装", keywords: "餐具 不锈钢 便携 旅行", market: "阿根廷", lang: "西班牙语", status: "done" as const },
  { id: 5, name: "蓝牙音箱", keywords: "音箱 蓝牙 防水 便携", market: "巴西", lang: "葡萄牙语", status: "done" as const },
  { id: 4, name: "LED化妆镜", keywords: "化妆镜 LED灯 三色 可调", market: "墨西哥", lang: "西班牙语", status: "waiting" as const },
];

const historyTasks = [
  { date: "3/23/26", done: 8, total: 20 },
  { date: "3/23/26", done: 15, total: 15 },
];

const statusMap = {
  waiting: { label: "等待中", className: "bg-muted text-muted-foreground" },
  running: { label: "进行中", className: "bg-primary/15 text-primary" },
  done: { label: "已完成", className: "bg-green-100 text-green-700" },
};

const formatColumns = ["产品名称", "产品描述", "关键词", "目标市场", "生成语言"];

const BatchPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">一款专注于美客多的listing生成器</p>
        <h1 className="text-2xl font-bold">批量Listing生成</h1>
        <p className="text-sm text-muted-foreground mt-1">上传Excel产品表，AI批量生成完整Listing，一键导出结果文件</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Upload section */}
          <div className="bg-card rounded-2xl border p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">上传Excel产品表</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">支持 .xlsx / .xls 格式，每行对应一个产品</p>

            <div className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer mb-4">
              <FileSpreadsheet className="w-10 h-10 text-primary/60" />
              <span className="text-sm">将Excel文件拖拽至此，或点击下方按钮选择文件</span>
              <Button variant="outline" size="sm">选择文件</Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="w-3.5 h-3.5" />
                下载模板
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                解析并预览
              </Button>
            </div>
          </div>

          {/* Format description */}
          <div className="bg-card rounded-2xl border p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">表格列格式说明</h3>
            <div className="flex gap-2 flex-wrap">
              {formatColumns.map((col) => (
                <Badge key={col} variant="secondary" className="font-normal">{col}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Credits */}
          <div className="bg-card rounded-2xl border p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="text-sm text-muted-foreground">当前积分：</span>
              <span className="text-xl font-bold text-primary">320</span>
            </div>
            <Button variant="outline" size="sm">充值</Button>
          </div>

          {/* Progress */}
          <div className="bg-card rounded-2xl border p-5 shadow-sm">
            <h3 className="font-semibold mb-4">当前任务进度</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">整体进度</span>
                <span className="font-medium">0 / 0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">总产品数</span>
                <span>—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">已完成</span>
                <span>—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">预计消耗积分</span>
                <span>—</span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
              <Download className="w-4 h-4" />
              一键导出Excel结果
            </Button>
          </div>

          {/* History */}
          <div className="bg-card rounded-2xl border p-5 shadow-sm">
            <h3 className="font-semibold mb-4">历史批量任务</h3>
            <div className="space-y-3">
              {historyTasks.map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <div>
                    <div className="text-xs text-muted-foreground">{task.date}</div>
                    <div className="text-sm mt-0.5">{task.done} / {task.total} 条</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">已完成</Badge>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                      <Download className="w-3 h-3" />
                      下载
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product table */}
      <div className="bg-card rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">产品预览与处理状态</h2>
            <Badge variant="secondary">共 {sampleProducts.length} 条</Badge>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
            <Play className="w-4 h-4" />
            开始批量生成
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground w-12">#</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">产品名称</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">目标市场</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">语言</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">状态</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {sampleProducts.map((p) => {
                const s = statusMap[p.status];
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground">{p.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.keywords}</div>
                    </td>
                    <td className="px-5 py-3.5">{p.market}</td>
                    <td className="px-5 py-3.5">{p.lang}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={`${s.className} hover:${s.className}`}>{s.label}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                        <Eye className="w-3.5 h-3.5" />
                        查看
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatchPage;
