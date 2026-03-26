import { useState } from "react";
import ProductForm, { type ProductFormData } from "@/components/ProductForm";
import AIPipeline from "@/components/AIPipeline";
import GenerationResults, { type ListingResult } from "@/components/GenerationResults";
import CreditsBar from "@/components/CreditsBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Status = "waiting" | "running" | "done";

const Index = () => {
  const [statuses, setStatuses] = useState<Status[]>(Array(6).fill("waiting"));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ListingResult | null>(null);

  const updatePipelineStep = (step: number, status: Status) => {
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

    // Step 0: 卖点分析
    updatePipelineStep(0, "running");

    try {
      const { data, error } = await supabase.functions.invoke("generate-listing", {
        body: {
          productName: formData.productName,
          productDescription: formData.productDescription,
          keywords: formData.keywords,
          market: formData.market,
          language: formData.language,
          titleLimit: formData.titleLimit,
        },
      });

      if (error) {
        throw new Error(error.message || "生成失败");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Simulate pipeline progression for visual effect
      for (let i = 0; i <= 2; i++) {
        if (i > 0) updatePipelineStep(i - 1, "done");
        updatePipelineStep(i, "running");
        await new Promise((r) => setTimeout(r, 400));
      }
      updatePipelineStep(2, "done");

      // Set text results
      setResult({
        title: data.title,
        sellingPoints: data.sellingPoints,
        description: data.description,
      });

      // Mark remaining steps as done (image generation not yet implemented)
      for (let i = 3; i < 6; i++) {
        updatePipelineStep(i, "done");
      }

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
