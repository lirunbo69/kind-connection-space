import { Star, Type, FileText, Image, LayoutGrid, Images } from "lucide-react";

const steps = [
  { icon: Star, label: "卖点分析", desc: "提取产品核心卖点" },
  { icon: Type, label: "标题生成", desc: "生成SEO优化标题" },
  { icon: FileText, label: "描述生成", desc: "生成完整商品描述" },
  { icon: Image, label: "主图生成", desc: "AI生成商品主图" },
  { icon: LayoutGrid, label: "轮播图规划", desc: "规划轮播图内容结构" },
  { icon: Images, label: "轮播图生成", desc: "AI批量生成轮播图" },
];

type Status = "waiting" | "running" | "done";

const AIPipeline = ({ statuses }: { statuses: Status[] }) => {
  return (
    <div className="bg-card rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="text-lg">🔗</span>
        <h2 className="text-lg font-semibold">AI 生成流水线</h2>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const status = statuses[i] || "waiting";
          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                status === "running"
                  ? "border-primary/40 bg-accent/50"
                  : status === "done"
                  ? "border-green-200 bg-green-50/50"
                  : "border-transparent bg-muted/40"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <step.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-xs text-muted-foreground">{step.desc}</div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  status === "running"
                    ? "bg-primary/15 text-primary font-medium"
                    : status === "done"
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {status === "waiting" ? "等待中" : status === "running" ? "进行中" : "已完成"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIPipeline;
