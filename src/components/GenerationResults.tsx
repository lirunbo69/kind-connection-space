import { CheckCircle, Copy, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ListingResult {
  title: string;
  sellingPoints: string[];
  description: string;
}

const ResultSection = ({
  label,
  content,
  placeholder,
  copyable,
}: {
  label: string;
  content?: string;
  placeholder: string;
  copyable?: boolean;
}) => {
  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success("已复制到剪贴板");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        {copyable && content && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground gap-1 h-7"
            onClick={handleCopy}
          >
            <Copy className="w-3.5 h-3.5" />
            复制
          </Button>
        )}
      </div>
      <div
        className={`rounded-lg px-4 py-3 text-sm min-h-[48px] whitespace-pre-wrap ${
          content ? "bg-muted/60 text-foreground" : "bg-muted/40 text-muted-foreground"
        }`}
      >
        {content || placeholder}
      </div>
    </div>
  );
};

const GenerationResults = ({ result }: { result: ListingResult | null }) => {
  const hasResult = !!result;

  return (
    <div className="bg-card rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        {hasResult ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Clock className="w-5 h-5 text-muted-foreground" />
        )}
        <h2 className="text-lg font-semibold">生成结果</h2>
      </div>

      <div className="space-y-5">
        <ResultSection
          label="生成标题"
          content={result?.title}
          placeholder="标题将在此处显示..."
          copyable
        />
        <ResultSection
          label="核心卖点"
          content={result?.sellingPoints?.map((p, i) => `${i + 1}. ${p}`).join("\n")}
          placeholder="卖点将在此处显示..."
          copyable
        />
        <ResultSection
          label="商品描述"
          content={result?.description}
          placeholder="描述将在此处显示..."
          copyable
        />
      </div>
    </div>
  );
};

export default GenerationResults;
