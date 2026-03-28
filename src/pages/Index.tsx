import { useState } from "react";
import ProductForm, { type ProductFormData } from "@/components/ProductForm";
import AIPipeline from "@/components/AIPipeline";
import GenerationResults, { type ListingResult } from "@/components/GenerationResults";
import CreditsBar from "@/components/CreditsBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Status = "waiting" | "running" | "done";

const STEP_LABELS = ["卖点分析", "标题生成", "描述生成", "主图生成", "轮播图规划", "轮播图生成"];

const Index = () => {
  const [statuses, setStatuses] = useState<Status[]>(Array(6).fill("waiting"));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ListingResult | null>(null);

  const updateStep = (step: number, status: Status) => {
    setStatuses((prev) => {
      const next = [...prev];
      next[step] = status;
      return next;
    });
  };

  const handleGenerate = async (formData: ProductFormData) => {
    setIsLoading(true);
    setResult(null);
    setStatuses(Array(6).fill("waiting"));

    // Show all steps as running progressively for UX
    for (let i = 0; i < 6; i++) {
      updateStep(i, "running");
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-listing", {
        body: {
          productName: formData.productName,
          productDescription: formData.productDescription,
          keywords: formData.keywords,
          market: formData.market,
          language: formData.language,
          titleLimit: formData.titleLimit,
          imageCount: formData.imageCount,
        },
      });

      if (error) throw new Error(error.message || "生成失败");
      if (data?.error) throw new Error(data.error);

      // Mark all steps done and set results
      setStatuses(Array(6).fill("done"));
      setResult({
        title: data.title,
        sellingPoints: data.sellingPoints,
        description: data.description,
        mainImage: data.mainImage,
        carouselPlan: data.carouselPlan,
        carouselImages: data.carouselImages,
      });

      toast.success("Listing 生成完成！");
    } catch (err: any) {
      console.error("Generate error:", err);
      toast.error(err.message || "生成失败，请重试");
      setStatuses(Array(6).fill("waiting"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">一款专注于美客多的listing生成器</p>
          <h1 className="text-2xl font-bold">Listing 智能生成工作台</h1>
          <p className="text-sm text-muted-foreground mt-1">填写产品信息，AI将自动完成六步生成流水线</p>
        </div>
        <CreditsBar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductForm onGenerate={handleGenerate} isLoading={isLoading} />
        <div className="space-y-6">
          <AIPipeline statuses={statuses} />
          <GenerationResults result={result} />
        </div>
      </div>
    </div>
  );
};

export default Index;
