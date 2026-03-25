import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ProductForm from "@/components/ProductForm";
import AIPipeline from "@/components/AIPipeline";
import GenerationResults from "@/components/GenerationResults";
import CreditsBar from "@/components/CreditsBar";

type Status = "waiting" | "running" | "done";

const Index = () => {
  const [statuses, setStatuses] = useState<Status[]>(Array(6).fill("waiting"));

  const handleGenerate = () => {
    // Demo: animate through pipeline steps
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
    <div className="min-h-screen flex">
      <AppSidebar />

      <main className="flex-1 ml-52">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">一款专注于美客多的listing生成器</p>
            <h1 className="text-2xl font-bold">Listing 智能生成工作台</h1>
            <p className="text-sm text-muted-foreground mt-1">填写产品信息，AI将自动完成六步生成流水线</p>
          </div>
          <CreditsBar />
        </div>

        {/* Content */}
        <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <ProductForm onGenerate={handleGenerate} />

          {/* Right column */}
          <div className="space-y-6">
            <AIPipeline statuses={statuses} />
            <GenerationResults />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
