import { CheckCircle, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResultSection = ({
  label,
  placeholder,
  copyable,
}: {
  label: string;
  placeholder: string;
  copyable?: boolean;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-semibold">{label}</span>
      {copyable && (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 h-7">
          <Copy className="w-3.5 h-3.5" />
          复制
        </Button>
      )}
    </div>
    <div className="bg-muted/40 rounded-lg px-4 py-3 text-sm text-muted-foreground min-h-[48px]">
      {placeholder}
    </div>
  </div>
);

const ImageCard = ({ src, label }: { src: string; label?: string }) => (
  <div className="relative group rounded-xl overflow-hidden border bg-muted/30">
    <img src={src} alt={label || "product"} className="w-full h-40 object-cover" />
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 h-7 text-xs gap-1"
    >
      <Download className="w-3.5 h-3.5" />
      下载
    </Button>
  </div>
);

const GenerationResults = () => {
  return (
    <div className="bg-card rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <h2 className="text-lg font-semibold">生成结果</h2>
      </div>

      <div className="space-y-5">
        <ResultSection label="生成标题" placeholder="标题将在此处显示..." copyable />
        <ResultSection label="核心卖点" placeholder="卖点将在此处显示..." copyable />
        <ResultSection label="商品描述" placeholder="描述将在此处显示..." copyable />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">商品主图</span>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 h-7">
              <Download className="w-3.5 h-3.5" />
              下载
            </Button>
          </div>
          <ImageCard src="https://images.unsplash.com/photo-1560521166-167baa83205f?w=400&h=300&fit=crop" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">轮播图组</span>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 h-7">
              <Download className="w-3.5 h-3.5" />
              下载全部
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ImageCard src="https://images.unsplash.com/photo-1574346908476-431feae41e79?w=300&h=200&fit=crop" />
            <ImageCard src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop" />
            <ImageCard src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationResults;
