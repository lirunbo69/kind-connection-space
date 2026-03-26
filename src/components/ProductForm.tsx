import { useState } from "react";
import { FileText, Upload, Info, Loader2 } from "lucide-react";
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
}

const ProductForm = ({ onGenerate, isLoading }: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    productDescription: "",
    keywords: "",
    market: "",
    language: "",
    titleLimit: "",
    imageCount: "",
  });

  const updateField = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              <option value="CO">哥伦比亚</option>
              <option value="CL">智利</option>
              <option value="AR">阿根廷</option>
              <option value="UY">乌拉圭</option>
              <option value="PE">秘鲁</option>
              <option value="EC">厄瓜多尔</option>
              <option value="VE">委内瑞拉</option>
              <option value="CR">哥斯达黎加</option>
              <option value="DO">多米尼加</option>
              <option value="HN">洪都拉斯</option>
              <option value="GT">危地马拉</option>
              <option value="NI">尼加拉瓜</option>
              <option value="PA">巴拿马</option>
              <option value="BO">玻利维亚</option>
              <option value="PY">巴拉圭</option>
              <option value="SV">萨尔瓦多</option>
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
              <option value="es-CO">西班牙语（哥伦比亚）</option>
              <option value="es-CL">西班牙语（智利）</option>
              <option value="es-AR">西班牙语（阿根廷）</option>
              <option value="es-UY">西班牙语（乌拉圭）</option>
              <option value="es-PE">西班牙语（秘鲁）</option>
              <option value="es-EC">西班牙语（厄瓜多尔）</option>
              <option value="es-VE">西班牙语（委内瑞拉）</option>
              <option value="es-CR">西班牙语（哥斯达黎加）</option>
              <option value="es-DO">西班牙语（多米尼加）</option>
              <option value="es-HN">西班牙语（洪都拉斯）</option>
              <option value="es-GT">西班牙语（危地马拉）</option>
              <option value="es-NI">西班牙语（尼加拉瓜）</option>
              <option value="es-PA">西班牙语（巴拿马）</option>
              <option value="es-BO">西班牙语（玻利维亚）</option>
              <option value="es-PY">西班牙语（巴拉圭）</option>
              <option value="es-SV">西班牙语（萨尔瓦多）</option>
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
          <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer">
            <Upload className="w-6 h-6" />
            <span className="text-sm">Click to upload an image</span>
          </div>
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
