import { useState } from "react";
import { BarChart3, Search, Sparkles, Star, MessageSquare, Type, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreditsBar from "@/components/CreditsBar";

const tagColors: Record<string, string> = {
  品牌词: "bg-primary/20 text-primary border-primary/30",
  核心词: "bg-blue-100 text-blue-700 border-blue-200",
  属性词: "bg-muted text-muted-foreground border-border",
  流量词: "bg-orange-100 text-orange-600 border-orange-200",
};

const mockKeywords = [
  { word: "garrafa térmica", heat: 95 },
  { word: "botella térmica acero", heat: 88 },
  { word: "termo 500ml", heat: 82 },
  { word: "vaso térmico", heat: 76 },
  { word: "botella agua fría", heat: 70 },
  { word: "termo café portátil", heat: 65 },
];

const CompetitorPage = () => {
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [keywords, setKeywords] = useState<typeof mockKeywords>([]);
  const [selectedKw, setSelectedKw] = useState<Set<number>>(new Set());
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!competitorUrl.trim()) return;
    setAnalyzed(true);
  };

  const handleGenerateKeywords = () => {
    if (!keyword.trim()) return;
    setKeywords(mockKeywords);
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleKw = (i: number) => {
    setSelectedKw((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div>
      <CreditsBar />

      <h1 className="text-2xl font-bold text-foreground mt-2">竞品分析 & 关键词工具</h1>
      <p className="text-muted-foreground text-sm mt-1 mb-6">
        输入竞品链接获取深度分析，或通过关键词工具快速挖掘高价值搜索词
      </p>

      <div className="flex gap-6 items-start">
        {/* Left: Competitor Analysis */}
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">竞品分析</h2>
                <p className="text-xs text-muted-foreground">输入美客多商品链接，AI自动解析竞品策略</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs mb-4">消耗 15 积分</Badge>

            <label className="text-sm font-medium text-foreground block mb-1.5">美客多商品链接</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.mercadolibre.com.mx/..."
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAnalyze} className="shrink-0 gap-1.5">
                <Search className="w-4 h-4" />
                开始分析
              </Button>
            </div>
          </div>

          {/* Analysis Results */}
          {analyzed && (
            <div className="space-y-4 mt-4">
              {/* Title Breakdown */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">标题结构拆解</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard("产品类型 + 材质特点 + 容量规格 + 使用场景 + 品牌保证", "title")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedSection === "title" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {Object.entries(tagColors).map(([label, cls]) => (
                    <span key={label} className={`text-xs px-2.5 py-1 rounded-full border ${cls}`}>{label}</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">产品类型 + 材质特点 + 容量规格 + 使用场景 + 品牌保证</p>
              </div>

              {/* Selling Points */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-foreground">核心卖点总结</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard("1.双层真空保温 2.食品级不锈钢 3.24小时保温保冷 4.人体工程学设计 5.多种颜色", "selling")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedSection === "selling" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  1.双层真空保温 2.食品级不锈钢 3.24小时保温保冷 4.人体工程学设计 5.多种颜色
                </p>
              </div>

              {/* Review Keywords */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">评论高频关键词</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard("mantém temperatura, qualidade ótima, não vaza, fácil de limpar, vale a pena", "review")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedSection === "review" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  mantém temperatura, qualidade ótima, não vaza, fácil de limpar, vale a pena
                </p>
              </div>

              {/* Copy All */}
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                onClick={() => copyToClipboard("标题结构拆解\n产品类型 + 材质特点 + 容量规格 + 使用场景 + 品牌保证\n\n核心卖点总结\n1.双层真空保温 2.食品级不锈钢 3.24小时保温保冷 4.人体工程学设计 5.多种颜色\n\n评论高频关键词\nmantém temperatura, qualidade ótima, não vaza, fácil de limpar, vale a pena", "all")}
              >
                <Copy className="w-4 h-4" />
                {copiedSection === "all" ? "已复制！" : "一键复制全部分析结果"}
              </Button>
            </div>
          )}
        </div>

        {/* Right: Keyword Tool */}
        <div className="w-80 shrink-0">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">关键词工具</h2>
                <p className="text-xs text-muted-foreground">AI生成带热度评分的精准关键词列表</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs mb-4">消耗 5 积分</Badge>

            <label className="text-sm font-medium text-foreground block mb-1.5">产品类目或核心词</label>
            <Input
              placeholder="例如：蓝牙耳机、无线充电器"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="mb-3"
            />
            <Button onClick={handleGenerateKeywords} className="w-full gap-1.5">
              <Sparkles className="w-4 h-4" />
              生成关键词
            </Button>
          </div>

          {/* Keyword Results */}
          <div className="bg-card rounded-xl border border-border p-5 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">关键词列表</h3>
              {keywords.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1 h-7"
                  onClick={() => {
                    const selected = keywords.filter((_, i) => selectedKw.has(i)).map((k) => k.word).join(", ");
                    if (selected) navigator.clipboard.writeText(selected);
                  }}
                >
                  <Copy className="w-3 h-3" />
                  复制已选
                </Button>
              )}
            </div>

            {keywords.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">输入产品类目并点击生成，即可获取关键词列表</p>
              </div>
            ) : (
              <div className="space-y-2">
                {keywords.map((kw, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                      selectedKw.has(i) ? "bg-primary/10" : "hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedKw.has(i)}
                      onChange={() => toggleKw(i)}
                      className="rounded border-border accent-primary"
                    />
                    <span className="flex-1 text-foreground">{kw.word}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${kw.heat}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">{kw.heat}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorPage;
