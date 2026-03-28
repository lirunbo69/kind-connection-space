import { useState, useEffect } from "react";
import { History, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ListingResult } from "@/components/GenerationResults";

interface GenerationRecord {
  id: string;
  product_name: string;
  product_description: string;
  keywords: string | null;
  market: string | null;
  language: string | null;
  title: string | null;
  selling_points: string[] | null;
  description: string | null;
  main_image: string | null;
  carousel_plan: string[] | null;
  carousel_images: string[] | null;
  created_at: string;
}

interface Props {
  onRestore: (formData: {
    productName: string;
    productDescription: string;
    keywords: string;
    market: string;
    language: string;
  }, result: ListingResult) => void;
}

const GenerationHistory = ({ onRestore }: Props) => {
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("generation_records")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Fetch records error:", error);
    } else {
      setRecords((data as unknown as GenerationRecord[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchRecords();
  }, [open]);

  const handleRestore = (r: GenerationRecord) => {
    onRestore(
      {
        productName: r.product_name,
        productDescription: r.product_description,
        keywords: r.keywords || "",
        market: r.market || "",
        language: r.language || "",
      },
      {
        title: r.title || "",
        sellingPoints: (r.selling_points as string[]) || [],
        description: r.description || "",
        mainImage: r.main_image || undefined,
        carouselPlan: (r.carousel_plan as string[]) || undefined,
        carouselImages: (r.carousel_images as string[]) || undefined,
      }
    );
    toast.success("已恢复历史记录");
  };

  return (
    <div className="glass-strong rounded-2xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/30 transition-all duration-200 rounded-2xl"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">历史生成记录</span>
          {records.length > 0 && (
            <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
              {records.length}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-6 pb-4 space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">加载中...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">暂无生成记录</p>
          ) : (
            records.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between glass rounded-xl px-4 py-3 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium truncate text-foreground">{r.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("zh-CN")}
                    {r.market && ` · ${r.market}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs shrink-0 rounded-lg hover:bg-white/50"
                  onClick={() => handleRestore(r)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  恢复
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GenerationHistory;
