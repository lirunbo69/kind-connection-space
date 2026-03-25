import { FileText, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ProductForm = ({ onGenerate }: { onGenerate: () => void }) => {
  return (
    <div className="bg-card rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">产品信息</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">产品名称</label>
          <Input placeholder="例如：无线蓝牙耳机 TWS" className="bg-muted/50" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">产品描述</label>
          <Textarea
            placeholder="描述产品的核心功能、材质、规格等信息..."
            className="bg-muted/50 min-h-[100px] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">关键词</label>
          <Input placeholder="例如：auriculares bluetooth, inalámbricos" className="bg-muted/50" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">目标市场</label>
            <select className="w-full h-10 px-3 rounded-lg border bg-muted/50 text-sm text-foreground">
              <option value="">请选择市场</option>
              <option>墨西哥</option>
              <option>巴西</option>
              <option>阿根廷</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">生成语言</label>
            <select className="w-full h-10 px-3 rounded-lg border bg-muted/50 text-sm text-foreground">
              <option value="">请选择语言</option>
              <option>西班牙语</option>
              <option>葡萄牙语</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">标题字数限制</label>
            <Input placeholder="例如：60" type="number" className="bg-muted/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">图片生成数量</label>
            <Input placeholder="例如：3" type="number" className="bg-muted/50" />
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
          onClick={onGenerate}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md"
        >
          ✨ 开始生成 Listing
        </Button>
      </div>
    </div>
  );
};

export default ProductForm;
