import { Star, Type, FileText, Image, LayoutGrid, Images, CheckCircle2, Loader2 } from "lucide-react";

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
    <div className="glass-strong rounded-2xl p-6 animate-glass-reveal" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-2.5 mb-6">
        <span className="text-lg">🔗</span>
        <h2 className="text-lg font-semibold text-foreground">AI 生成流水线</h2>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const status = statuses[i] || "waiting";
          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 ${
                status === "running"
                  ? "glass border-primary/30 shadow-md shadow-primary/5"
                  : status === "done"
                  ? "bg-emerald-50/60 backdrop-blur-sm border border-emerald-200/50"
                  : "glass-subtle"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                status === "running"
                  ? "bg-primary/15"
                  : status === "done"
                  ? "bg-emerald-100/60"
                  : "bg-white/50"
              }`}>
                {status === "running" ? (
                  <Loader2 className="w-4.5 h-4.5 text-primary animate-spin" />
                ) : status === "done" ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                ) : (
                  <step.icon className="w-4.5 h-4.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{step.label}</div>
                <div className="text-xs text-muted-foreground">{step.desc}</div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium transition-all ${
                  status === "running"
                    ? "bg-primary/15 text-primary"
                    : status === "done"
                    ? "bg-emerald-100/60 text-emerald-700"
                    : "text-muted-foreground bg-white/30"
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
