import { useState, useEffect } from "react";
import ProductForm, { type ProductFormData } from "@/components/ProductForm";
import AIPipeline from "@/components/AIPipeline";
import GenerationResults, { type ListingResult } from "@/components/GenerationResults";
import GenerationHistory from "@/components/GenerationHistory";
import CreditsBar from "@/components/CreditsBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Status = "waiting" | "running" | "done";

const FORM_STORAGE_KEY = "listing-form-data";
const RESULT_STORAGE_KEY = "listing-result-data";

const Index = () => {
  const [statuses, setStatuses] = useState<Status[]>(Array(6).fill("waiting"));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ListingResult | null>(() => {
    try {
      const saved = sessionStorage.getItem(RESULT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [formData, setFormData] = useState<ProductFormData>(() => {
    try {
      const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Persist form data
  useEffect(() => {
    if (formData) {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // Persist result
  useEffect(() => {
    if (result) {
      sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
      setStatuses(Array(6).fill("done"));
    }
  }, [result]);

  const updateStep = (step: number, status: Status) => {
    setStatuses((prev) => {
      const next = [...prev];
      next[step] = status;
      return next;
    });
  };

  const saveRecord = async (fd: ProductFormData, res: ListingResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("generation_records").insert({
        user_id: user.id,
        product_name: fd.productName,
        product_description: fd.productDescription,
        keywords: fd.keywords || null,
        market: fd.market || null,
        language: fd.language || null,
        title: res.title,
        selling_points: res.sellingPoints as any,
        description: res.description,
        main_image: res.mainImage || null,
        carousel_plan: res.carouselPlan as any || null,
        carousel_images: res.carouselImages as any || null,
      } as any);
    } catch (e) {
      console.error("Save record error:", e);
    }
  };

  const handleGenerate = async (fd: ProductFormData) => {
    setFormData(fd);
    setIsLoading(true);
    setResult(null);
    setStatuses(Array(6).fill("waiting"));

    for (let i = 0; i < 6; i++) {
      updateStep(i, "running");
    }

    try {
      const { data: templates } = await supabase
        .from("prompt_templates")
        .select("template_name, template_content, model");

      const { data, error } = await supabase.functions.invoke("generate-listing", {
        body: {
          productName: fd.productName,
          productDescription: fd.productDescription,
          keywords: fd.keywords,
          market: fd.market,
          language: fd.language,
          titleLimit: fd.titleLimit,
          imageCount: fd.imageCount,
          templates: templates || [],
        },
      });

      if (error) throw new Error(error.message || "生成失败");
      if (data?.error) throw new Error(data.error);

      setStatuses(Array(6).fill("done"));
      const listingResult: ListingResult = {
        title: data.title,
        sellingPoints: data.sellingPoints,
        description: data.description,
        mainImage: data.mainImage,
        carouselPlan: data.carouselPlan,
        carouselImages: data.carouselImages,
      };
      setResult(listingResult);
      await saveRecord(fd, listingResult);
      toast.success("Listing 生成完成！");
    } catch (err: any) {
      console.error("Generate error:", err);
      toast.error(err.message || "生成失败，请重试");
      setStatuses(Array(6).fill("waiting"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreHistory = (
    fd: { productName: string; productDescription: string; keywords: string; market: string; language: string },
    res: ListingResult
  ) => {
    setFormData({ ...fd, titleLimit: "", imageCount: "" } as ProductFormData);
    setResult(res);
    setStatuses(Array(6).fill("done"));
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

      <GenerationHistory onRestore={handleRestoreHistory} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductForm onGenerate={handleGenerate} isLoading={isLoading} initialData={formData} />
        <div className="space-y-6">
          <AIPipeline statuses={statuses} />
          <GenerationResults result={result} />
        </div>
      </div>
    </div>
  );
};

export default Index;
