import { CheckCircle, Copy, Clock, Image, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ListingResult {
  title: string;
  sellingPoints: string[];
  description: string;
  mainImage?: string;
  carouselPlan?: string[];
  carouselImages?: string[];
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

const ImagePlaceholder = ({ label, placeholder, image }: { label: string; placeholder: string; image?: string }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-2">
      <Image className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
    {image ? (
      <img src={image} alt={label} className="w-full rounded-lg border object-cover max-h-[240px]" />
    ) : (
      <div className="rounded-lg border-2 border-dashed bg-muted/30 flex items-center justify-center h-[160px] text-sm text-muted-foreground">
        {placeholder}
      </div>
    )}
  </div>
);

const CarouselGallery = ({
  plan,
  images,
}: {
  plan?: string[];
  images?: string[];
}) => (
  <div>
    <div className="flex items-center gap-1.5 mb-2">
      <Images className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-semibold">轮播图</span>
    </div>

    {plan && plan.length > 0 && (
      <div className="mb-3">
        <span className="text-xs text-muted-foreground font-medium mb-1 block">内容规划</span>
        <div className="space-y-1.5">
          {plan.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {images && images.length > 0 ? (
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <img key={i} src={img} alt={`轮播图 ${i + 1}`} className="w-full rounded-lg border object-cover aspect-square" />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-lg border-2 border-dashed bg-muted/30 flex items-center justify-center aspect-square text-xs text-muted-foreground">
            轮播图 {n}
          </div>
        ))}
      </div>
    )}
  </div>
);

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
        {/* Step 1: 卖点分析 */}
        <ResultSection
          label="核心卖点"
          content={result?.sellingPoints?.map((p, i) => `${i + 1}. ${p}`).join("\n")}
          placeholder="卖点将在此处显示..."
          copyable
        />

        {/* Step 2: 标题生成 */}
        <ResultSection
          label="生成标题"
          content={result?.title}
          placeholder="标题将在此处显示..."
          copyable
        />

        {/* Step 3: 描述生成 */}
        <ResultSection
          label="商品描述"
          content={result?.description}
          placeholder="描述将在此处显示..."
          copyable
        />

        {/* Step 4: 主图生成 */}
        <ImagePlaceholder
          label="商品主图"
          placeholder="主图将在此处显示..."
          image={result?.mainImage}
        />

        {/* Step 5 & 6: 轮播图规划 + 轮播图生成 */}
        <CarouselGallery
          plan={result?.carouselPlan}
          images={result?.carouselImages}
        />
      </div>
    </div>
  );
};

export default GenerationResults;
