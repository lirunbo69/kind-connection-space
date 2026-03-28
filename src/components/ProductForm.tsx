import { useState, useRef } from "react";
import { FileText, Upload, Info, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface ProductFormData {
  productName: string;
  productDescription: string;
  keywords: string;
  market: string;
  language: string;
  titleLimit: string;
  imageCount: string;
}

interface ProductFormProps {
  onGenerate: (data: ProductFormData) => void;
  isLoading?: boolean;
  initialData?: ProductFormData | null;
}

const ProductForm = ({ onGenerate, isLoading, initialData }: ProductFormProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      productName: "",
      productDescription: "",
      keywords: "",
      market: "",
      language: "",
      titleLimit: "",
      imageCount: "",
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const marketToLanguage: Record<string, string> = {
    MX: "es-MX",
    BR: "pt-BR",
    CL: "es-CL",
    CO: "es-CO",
    AR: "es-AR",
    UY: "es-UY",
  };

  const updateField = (field: keyof ProductFormData, value: string) => {
    if (field === "market") {
      const lang = marketToLanguage[value] || "";
      setFormData((prev) => ({ ...prev, market: value, language: lang }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    onGenerate(formData);
  };

  return (
    <div className="bg-card rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">产品信息</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">产品名称</label>
          <Input
            placeholder="例如：无线蓝牙耳机 TWS"
            className="bg-muted/50"
            value={formData.productName}
            onChange={(e) => updateField("productName", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">产品描述</label>
          <Textarea
            placeholder="描述产品的核心功能、材质、规格等信息..."
            className="bg-muted/50 min-h-[100px] resize-none"
            value={formData.productDescription}
            onChange={(e) => updateField("productDescription", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">关键词</label>
          <Input
            placeholder="例如：auriculares bluetooth, inalámbricos"
            className="bg-muted/50"
            value={formData.keywords}
            onChange={(e) => updateField("keywords", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">目标市场</label>
            <select
              className="w-full h-10 px-3 rounded-lg border bg-muted/50 text-sm text-foreground"
              value={formData.market}
              onChange={(e) => updateField("market", e.target.value)}
            >
              <option value="">请选择市场</option>
              <option value="MX">墨西哥</option>
              <option value="BR">巴西</option>
              <option value="CL">智利</option>
              <option value="CO">哥伦比亚</option>
              <option value="AR">阿根廷</option>
              <option value="UY">乌拉圭</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">生成语言</label>
            <select
              className="w-full h-10 px-3 rounded-lg border bg-muted/50 text-sm text-foreground"
              value={formData.language}
              onChange={(e) => updateField("language", e.target.value)}
            >
              <option value="">请选择语言</option>
              <option value="es-MX">西班牙语（墨西哥）</option>
              <option value="pt-BR">葡萄牙语（巴西）</option>
              <option value="es-CL">西班牙语（智利）</option>
              <option value="es-CO">西班牙语（哥伦比亚）</option>
              <option value="es-AR">西班牙语（阿根廷）</option>
              <option value="es-UY">西班牙语（乌拉圭）</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">标题字数限制</label>
            <Input
              placeholder="例如：60"
              type="number"
              className="bg-muted/50"
              value={formData.titleLimit}
              onChange={(e) => updateField("titleLimit", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">图片生成数量</label>
            <Input
              placeholder="例如：3"
              type="number"
              className="bg-muted/50"
              value={formData.imageCount}
              onChange={(e) => updateField("imageCount", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">参考图上传（可选）</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {uploadedImage ? (
            <div className="relative border-2 border-primary/30 rounded-xl p-2 flex items-center gap-3 bg-muted/30">
              <img src={uploadedImage} alt="预览" className="w-16 h-16 object-cover rounded-lg" />
              <span className="text-sm truncate flex-1">{uploadedFileName}</span>
              <button
                type="button"
                onClick={removeImage}
                className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm">点击上传参考图片（最大 5MB）</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-accent/60 rounded-lg px-4 py-3">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">文本生成消耗10积分，每张图片消耗20积分</span>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !formData.productName || !formData.productDescription}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI 生成中...
            </>
          ) : (
            "✨ 开始生成 Listing"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductForm;
