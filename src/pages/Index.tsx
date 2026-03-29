import { useState, useEffect } from "react";
import ProductForm, { type ProductFormData } from "@/components/ProductForm";
import AIPipeline from "@/components/AIPipeline";
import GenerationResults from "@/components/GenerationResults";
import type { ListingResult } from "@/components/GenerationResults";
import GenerationHistory from "@/components/GenerationHistory";
import CreditsBar from "@/components/CreditsBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserPoints } from "@/hooks/useUserPoints";

type Status = "waiting" | "running" | "done";

const FORM_STORAGE_KEY = "listing-form-data";
const RESULT_STORAGE_KEY = "listing-result-data";

const Index = () => {
  const [statuses, setStatuses] = useState<Status[]>(Array(6).fill("waiting"));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Partial<ListingResult> | null>(() => {
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

  useEffect(() => {
    if (formData) {
      try {
        const { whiteBgImages, referenceImages, hotSearchImages, ...rest } = formData;
        sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(rest));
      } catch { /* quota exceeded, ignore */ }
    }
  }, [formData]);

  useEffect(() => {
    if (result && result.title && result.description) {
      try {
        sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
      } catch { /* quota exceeded, ignore */ }
    }
  }, [result]);

  const updateStep = (step: number, status: Status) => {
    setStatuses((prev) => { const next = [...prev]; next[step] = status; return next; });
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

    try {
      // Pre-check points on frontend for fast feedback
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("请先登录"); setIsLoading(false); return; }
      const { data: pts } = await supabase.from("user_points").select("remaining_points").eq("user_id", user.id).single();
      const mainImgCount = Math.min(Math.max(parseInt(fd.mainImageCount) || 1, 1), 3);
      const carouselImgCount = Math.min(Math.max(parseInt(fd.carouselImageCount) || 3, 1), 6);
      const estimatedCost = 10 + 20 * (mainImgCount + carouselImgCount);
      if ((pts?.remaining_points ?? 0) < estimatedCost) {
        toast.error(`积分不足，预计消耗 ${estimatedCost} 积分，当前余额 ${pts?.remaining_points ?? 0}，请先充值`, { action: { label: "去充值", onClick: () => window.location.hash = "/topup" } });
        setIsLoading(false);
        return;
      }

      const { data: templates } = await supabase
        .from("prompt_templates")
        .select("template_name, template_content, model");

      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-listing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || supabaseKey}`,
          "apikey": supabaseKey,
        },
        body: JSON.stringify({
          productName: fd.productName,
          productDescription: fd.productDescription,
          keywords: fd.keywords,
          market: fd.market,
          language: fd.language,
          titleLimit: fd.titleLimit,
          mainImageCount: fd.mainImageCount || "1",
          imageCount: fd.carouselImageCount || "3",
          aspectRatio: fd.aspectRatio || "1:1",
          templates: templates || [],
          whiteBgImages: fd.whiteBgImages || [],
          referenceImages: fd.referenceImages || [],
          hotSearchImages: fd.hotSearchImages || [],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `生成失败 (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取流式响应");

      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: ListingResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              
              if (currentEvent === "step") {
                updateStep(data.step, data.status);
              } else if (currentEvent === "result") {
                // Merge partial result
                console.log(`[SSE result] step=${data.step}, keys=${Object.keys(data.data || {}).join(",")}, mainImage=${data.data?.mainImage ? `${data.data.mainImage.substring(0, 30)}...(${data.data.mainImage.length} chars)` : "none"}`);
                setResult((prev) => ({ ...(prev || {}), ...data.data }));
              } else if (currentEvent === "done") {
                // Don't overwrite result - images were already sent via result events
                // The done event only has placeholder "[sent]" for images
                console.log("[SSE done] Generation complete");
                finalResult = {} as ListingResult; // Just mark as done
              } else if (currentEvent === "error") {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              if (currentEvent === "error") throw parseErr;
              console.warn("SSE parse warning:", parseErr);
            }
            currentEvent = "";
          }
        }
      }

      if (finalResult) {
        // Don't setResult here - partial results already accumulated via "result" events
        setStatuses(Array(6).fill("done"));
        // Save record using the accumulated result
        setResult((prev) => {
          const final = prev as ListingResult;
          if (final) saveRecord(fd, final);
          return prev;
        });
      }
      toast.success("Listing 生成完成！");
    } catch (err: any) {
      console.error("Generate error:", err);
      toast.error(err.message || "生成失败，请重试");
      setStatuses((prev) => prev.map((s) => s === "running" ? "waiting" : s));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreHistory = (
    fd: { productName: string; productDescription: string; keywords: string; market: string; language: string },
    res: ListingResult
  ) => {
    setFormData({ ...fd, titleLimit: "", imageCount: "", aspectRatio: "1:1", whiteBgImages: [], referenceImages: [], hotSearchImages: [] } as ProductFormData);
    setResult(res);
    setStatuses(Array(6).fill("done"));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-1 pb-4 shrink-0">
        <div>
          <p className="text-sm text-muted-foreground mb-1">一款专注于美客多的listing生成器</p>
          <h1 className="text-2xl font-bold text-foreground">Listing 智能生成工作台</h1>
          <p className="text-sm text-muted-foreground mt-1">填写产品信息，AI将自动完成六步生成流水线</p>
        </div>
        <CreditsBar />
      </div>

      <div className="shrink-0 px-1 pb-4">
        <GenerationHistory onRestore={handleRestoreHistory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 px-1 pb-4">
        <div className="overflow-y-auto pr-2 scrollbar-thin">
          <ProductForm onGenerate={handleGenerate} isLoading={isLoading} initialData={formData} />
        </div>
        <div className="overflow-y-auto pl-2 scrollbar-thin space-y-6">
          <AIPipeline statuses={statuses} />
          <GenerationResults result={result as ListingResult | null} />
        </div>
      </div>
    </div>
  );
};

export default Index;
