import { useState } from "react";
import ProductForm from "@/components/ProductForm";
import AIPipeline from "@/components/AIPipeline";
import GenerationResults from "@/components/GenerationResults";
import CreditsBar from "@/components/CreditsBar";

type Status = "waiting" | "running" | "done";

const Index = () => {
  const [statuses, setStatuses] = useState<Status[]>(Array(6).fill("waiting"));

  const handleGenerate = () => {
    const newStatuses: Status[] = [...statuses];
    let step = 0;
    const interval = setInterval(() => {
      if (step > 0) newStatuses[step - 1] = "done";
      if (step < 6) {
        newStatuses[step] = "running";
        step++;
      } else {
        clearInterval(interval);
      }
      setStatuses([...newStatuses]);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">一款专注于美客多的listing生成器</p>
          <h1 className="text-2xl font-bold">Listing 智能生成工作台</h1>
          <p className="text-sm text-muted-foreground mt-1">填写产品信息，AI将自动完成六步生成流水线</p>
        </div>
        <CreditsBar />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductForm onGenerate={handleGenerate} />
        <div className="space-y-6">
          <AIPipeline statuses={statuses} />
          <GenerationResults />
        </div>
      </div>
    </div>
  );
};

export default Index;
