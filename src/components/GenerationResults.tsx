import { useState } from "react";
import { CheckCircle, Copy, Clock, Image, Images, Download, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

export interface ListingResult {
  title: string;
  sellingPoints: string[];
  description: string;
  mainImages?: string[];
  mainImage?: string; // legacy compat
  carouselPlan?: string[];
  carouselImages?: string[];
}

async function downloadImage(url: string, filename: string) {
  try {
    // Fetch the image and create a blob URL for reliable cross-origin download
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    // Fallback: open in new tab
    window.open(url, "_blank");
  }
}

async function downloadAllImages(mainImage?: string, carouselImages?: string[]) {
  const images: { url: string; name: string }[] = [];
  if (mainImage) images.push({ url: mainImage, name: "main-image.png" });
  if (carouselImages) {
    carouselImages.forEach((img, i) => {
      images.push({ url: img, name: `carousel-${i + 1}.png` });
    });
  }
  if (images.length === 0) {
    toast.error("没有可下载的图片");
    return;
  }
  for (const img of images) {
    downloadImage(img.url, img.name);
    // Small delay between downloads to avoid browser blocking
    await new Promise((r) => setTimeout(r, 300));
  }
  toast.success(`已下载 ${images.length} 张图片`);
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
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {copyable && content && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground gap-1 h-7 hover:bg-white/50 rounded-lg"
            onClick={handleCopy}
          >
            <Copy className="w-3.5 h-3.5" />
            复制
          </Button>
        )}
      </div>
      <div
        className={`rounded-xl px-4 py-3 text-sm min-h-[48px] whitespace-pre-wrap transition-all ${
          content ? "glass text-foreground" : "glass-subtle text-muted-foreground"
        }`}
      >
        {content || placeholder}
      </div>
    </div>
  );
};

const MainImageGallery = ({ images, onImageClick }: { images?: string[]; onImageClick: (url: string) => void }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <Image className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">商品主图</span>
      </div>
      {images && images.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1 h-7 hover:bg-white/50 rounded-lg"
          onClick={() => {
            images.forEach((img, i) => {
              setTimeout(() => downloadImage(img, `main-image-${i + 1}.png`), i * 300);
            });
            toast.success(`正在下载 ${images.length} 张主图`);
          }}
        >
          <Download className="w-3.5 h-3.5" />
          {images.length > 1 ? "全部下载" : "下载"}
        </Button>
      )}
    </div>
    {images && images.length > 0 ? (
      <div className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {images.map((img, i) => (
          <div key={i} className="relative group cursor-pointer" onClick={() => onImageClick(img)}>
            <img src={img} alt={`主图 ${i + 1}`} className="w-full rounded-xl border border-white/40 object-contain max-h-[400px] shadow-md bg-white" />
            <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); downloadImage(img, `main-image-${i + 1}.png`); }}
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-xl border-2 border-dashed border-border/40 glass-subtle flex items-center justify-center h-[160px] text-sm text-muted-foreground font-sans">
        主图将在此处显示...
      </div>
    )}
  </div>
);

const CarouselGallery = ({
  plan,
  images,
  onImageClick,
}: {
  plan?: string[];
  images?: string[];
  onImageClick: (url: string) => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <Images className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">轮播图</span>
      </div>
      {images && images.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1 h-7 hover:bg-white/50 rounded-lg"
          onClick={() => {
            images.forEach((img, i) => {
              setTimeout(() => downloadImage(img, `carousel-${i + 1}.png`), i * 300);
            });
            toast.success(`正在下载 ${images.length} 张轮播图`);
          }}
        >
          <Download className="w-3.5 h-3.5" />
          全部下载
        </Button>
      )}
    </div>

    {plan && plan.length > 0 && (
      <div className="mb-3">
        <span className="text-xs text-muted-foreground font-medium mb-1 block">内容规划</span>
        <div className="space-y-1.5">
          {plan.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm glass rounded-xl px-3 py-2">
              <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
              <span className="text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {images && images.length > 0 ? (
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative group cursor-pointer" onClick={() => onImageClick(img)}>
            <img src={img} alt={`轮播图 ${i + 1}`} className="w-full rounded-xl border border-white/40 object-contain bg-white shadow-sm hover:shadow-md transition-shadow" />
            <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); downloadImage(img, `carousel-${i + 1}.png`); }}
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-xl border-2 border-dashed border-border/40 glass-subtle flex items-center justify-center aspect-square text-xs text-muted-foreground">
            轮播图 {n}
          </div>
        ))}
      </div>
    )}
  </div>
);

const GenerationResults = ({ result }: { result: ListingResult | null }) => {
  const hasResult = !!result;
  // Support both mainImages array and legacy mainImage string
  const allMainImages = result?.mainImages?.length
    ? result.mainImages
    : result?.mainImage
      ? [result.mainImage]
      : [];
  const hasAnyImage = allMainImages.length > 0 || (result?.carouselImages && result.carouselImages.length > 0);

  return (
    <div className="glass-strong rounded-2xl p-6 animate-glass-reveal" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          {hasResult ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <Clock className="w-5 h-5 text-muted-foreground" />
          )}
          <h2 className="text-lg font-semibold text-foreground">生成结果</h2>
        </div>
        {hasAnyImage && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1 h-8 rounded-lg"
            onClick={() => downloadAllImages(undefined, [...allMainImages, ...(result?.carouselImages || [])])}
          >
            <Download className="w-3.5 h-3.5" />
            批量下载全部图片
          </Button>
        )}
      </div>

      <div className="space-y-5">
        <ResultSection label="核心卖点" content={result?.sellingPoints?.map((p, i) => `${i + 1}. ${p}`).join("\n")} placeholder="卖点将在此处显示..." copyable />
        <ResultSection label="生成标题" content={result?.title} placeholder="标题将在此处显示..." copyable />
        <ResultSection label="商品描述" content={result?.description} placeholder="描述将在此处显示..." copyable />
        <MainImageGallery images={allMainImages.length > 0 ? allMainImages : undefined} />
        <CarouselGallery plan={result?.carouselPlan} images={result?.carouselImages} />
      </div>
    </div>
  );
};

export default GenerationResults;