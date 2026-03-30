import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ChevronDown, Search, TrendingUp, Download, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Package, Loader2, ChevronUp, Filter, RotateCcw, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

type Category = {
  id: string;
  name_es: string;
  name_zh: string;
  slug: string;
  level: number;
  parent_id: string | null;
};

type HotKeyword = {
  id: string;
  rank: number;
  keyword_es: string;
  keyword_zh: string | null;
  category_id: string | null;
  avg_price: number | null;
  sales_30d: number | null;
  revenue: number | null;
  product_count: number | null;
  supply_demand_ratio: number | null;
  conversion_rate: number | null;
  trend_data: number[];
  product_images: string[];
};

// Mini sparkline component
const Sparkline = ({ data, width = 80, height = 28 }: { data: number[]; width?: number; height?: number }) => {
  if (!data || data.length < 2) return <div className="w-20 h-7 bg-muted/30 rounded" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  const isUp = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

type SortField = "rank" | "avg_price" | "sales_30d" | "revenue" | "product_count" | "supply_demand_ratio" | "conversion_rate";
type SortDir = "asc" | "desc";

const KeywordsPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [keywords, setKeywords] = useState<HotKeyword[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [syncing, setSyncing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Advanced filter states
  const [filterCat, setFilterCat] = useState<string>("all");
  const [reviewMin, setReviewMin] = useState("");
  const [reviewMax, setReviewMax] = useState("");
  const [competitorMin, setCompetitorMin] = useState("");
  const [competitorMax, setCompetitorMax] = useState("");
  const [salesMin, setSalesMin] = useState("");
  const [salesMax, setSalesMax] = useState("");
  const [ratingMin, setRatingMin] = useState("");
  const [ratingMax, setRatingMax] = useState("");
  const [tagMatchType, setTagMatchType] = useState<string>("精准");
  const [tagKeyword, setTagKeyword] = useState("");

  const handleReset = () => {
    setFilterCat("all");
    setReviewMin(""); setReviewMax("");
    setCompetitorMin(""); setCompetitorMax("");
    setSalesMin(""); setSalesMax("");
    setRatingMin(""); setRatingMax("");
    setTagMatchType("精准"); setTagKeyword("");
    setSelectedCat(null);
    setSearchTerm("");
  };

  const handleQuery = () => {
    // Apply category filter
    if (filterCat && filterCat !== "all") {
      setSelectedCat(filterCat);
    }
    toast.success("筛选条件已应用");
  };

  // Load categories
  useEffect(() => {
    const loadCats = async () => {
      setCatLoading(true);
      const { data } = await supabase
        .from("ml_categories")
        .select("*")
        .order("name_es");
      if (data) setCategories(data);
      setCatLoading(false);
    };
    loadCats();
  }, []);

  // Load keywords when category changes
  useEffect(() => {
    const loadKeywords = async () => {
      setLoading(true);
      let query = supabase.from("ml_hot_keywords").select("*").order("rank");
      if (selectedCat) query = query.eq("category_id", selectedCat);
      const { data } = await query.limit(50);
      if (data) {
        setKeywords(data.map(k => ({
          ...k,
          trend_data: (k.trend_data as any) || [],
          product_images: (k.product_images as any) || [],
        })));
      }
      setLoading(false);
    };
    loadKeywords();
  }, [selectedCat]);

  // Build category tree
  const topCats = useMemo(() => categories.filter(c => !c.parent_id), [categories]);
  const childCats = useMemo(() => {
    const map: Record<string, Category[]> = {};
    categories.filter(c => c.parent_id).forEach(c => {
      if (!map[c.parent_id!]) map[c.parent_id!] = [];
      map[c.parent_id!].push(c);
    });
    return map;
  }, [categories]);

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedCatName = useMemo(() => {
    const cat = categories.find(c => c.id === selectedCat);
    return cat ? cat.name_zh : "全部类目";
  }, [selectedCat, categories]);

  // Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedKeywords = useMemo(() => {
    let filtered = keywords;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(k =>
        k.keyword_es.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (k.keyword_zh && k.keyword_zh.includes(searchTerm))
      );
    }

    // Advanced filters
    const numFilter = (val: number | null, min: string, max: string) => {
      if (min && val != null && val < Number(min)) return false;
      if (max && val != null && val > Number(max)) return false;
      if (min && val == null) return false;
      return true;
    };

    if (salesMin || salesMax) filtered = filtered.filter(k => numFilter(k.revenue != null ? Number(k.revenue) : null, salesMin, salesMax));
    if (competitorMin || competitorMax) filtered = filtered.filter(k => numFilter(k.product_count, competitorMin, competitorMax));
    if (reviewMin || reviewMax) filtered = filtered.filter(k => numFilter(k.sales_30d, reviewMin, reviewMax));
    if (ratingMin || ratingMax) filtered = filtered.filter(k => numFilter(k.conversion_rate != null ? Number(k.conversion_rate) : null, ratingMin, ratingMax));
    if (tagKeyword) {
      const tag = tagKeyword.toLowerCase();
      filtered = filtered.filter(k =>
        tagMatchType === "精准"
          ? k.keyword_es.toLowerCase() === tag || (k.keyword_zh && k.keyword_zh === tagKeyword)
          : k.keyword_es.toLowerCase().includes(tag) || (k.keyword_zh && k.keyword_zh.includes(tagKeyword))
      );
    }

    return [...filtered].sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [keywords, searchTerm, sortField, sortDir, salesMin, salesMax, competitorMin, competitorMax, reviewMin, reviewMax, ratingMin, ratingMax, tagKeyword, tagMatchType]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const handleExport = () => {
    if (sortedKeywords.length === 0) { toast.error("没有数据可导出"); return; }
    const headers = ["排名", "关键词(西语)", "关键词(中文)", "均价", "30天销量", "销售额", "商品数", "供需比", "转化率"];
    const rows = sortedKeywords.map(k => [
      k.rank, k.keyword_es, k.keyword_zh || "", k.avg_price ?? "", k.sales_30d ?? "", k.revenue ?? "", k.product_count ?? "", k.supply_demand_ratio ?? "", k.conversion_rate ?? ""
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `热搜词_${selectedCatName}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("导出成功");
  };

  const formatNum = (n: number | null) => {
    if (n == null) return "—";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toLocaleString();
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-3rem)]">
      {/* Left: Category Tree */}
      <div className="w-56 shrink-0 glass rounded-2xl p-3 flex flex-col overflow-hidden">
        <h3 className="text-sm font-semibold text-foreground mb-3 px-1 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-primary" />
          美客多类目
        </h3>

        {/* All categories option */}
        <button
          onClick={() => setSelectedCat(null)}
          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs mb-1 transition-colors ${
            !selectedCat ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted/50"
          }`}
        >
          📊 全部类目
        </button>

        <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin">
          {catLoading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-7 rounded-lg" />)
          ) : (
            topCats.map(cat => (
              <div key={cat.id}>
                <button
                  onClick={() => {
                    setSelectedCat(cat.id);
                    if (childCats[cat.id]) toggleExpand(cat.id);
                  }}
                  className={`w-full flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedCat === cat.id ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  {childCats[cat.id] ? (
                    expandedCats.has(cat.id) ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />
                  ) : <span className="w-3" />}
                  <span className="truncate">{cat.name_zh}</span>
                </button>
                {expandedCats.has(cat.id) && childCats[cat.id]?.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedCat(child.id)}
                    className={`w-full text-left pl-7 pr-2 py-1 rounded-lg text-xs transition-colors ${
                      selectedCat === child.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {child.name_zh}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Data Table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="glass rounded-2xl p-4 mb-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">平台热搜词</h2>
            <Badge variant="secondary" className="text-[10px]">{selectedCatName}</Badge>
          </div>

          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="搜索关键词..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs bg-background/50"
            />
          </div>

          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> 导出CSV
          </Button>

          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={syncing}
            onClick={async () => {
              setSyncing(true);
              toast.info("正在同步美客多热搜词，请稍候...");
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { toast.error("请先登录"); setSyncing(false); return; }
                const { data, error } = await supabase.functions.invoke("sync-ml-keywords");
                if (error) throw error;
                if (data?.success) {
                  toast.success(data.message || `成功同步 ${data.count} 个热搜词`);
                  // Reload keywords
                  let query = supabase.from("ml_hot_keywords").select("*").order("rank");
                  if (selectedCat) query = query.eq("category_id", selectedCat);
                  const { data: refreshed } = await query.limit(50);
                  if (refreshed) {
                    setKeywords(refreshed.map(k => ({
                      ...k,
                      trend_data: (k.trend_data as any) || [],
                      product_images: (k.product_images as any) || [],
                    })));
                  }
                } else {
                  toast.error(data?.error || "同步失败");
                }
              } catch (e: any) {
                console.error("Sync error:", e);
                toast.error("同步失败: " + (e.message || "未知错误"));
              } finally {
                setSyncing(false);
              }
            }}
          >
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            同步官方数据
          </Button>
        </div>

        {/* Advanced Filter Panel */}
        <div className="glass rounded-2xl mb-3 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-primary">推荐选品模式</span>
              <span className="text-sm text-primary cursor-pointer hover:underline">自定义</span>
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
              {filtersOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {filtersOpen && (
            <div className="px-4 py-3 space-y-3">
              {/* Row 1: 类目, 评论数, 竞品数 */}
              <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                {/* 类目 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0 w-16">
                    <span className="text-xs font-medium text-foreground">类目</span>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent className="text-xs">选择美客多商品类目</TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={filterCat} onValueChange={(v) => { setFilterCat(v); if (v !== "all") setSelectedCat(v); else setSelectedCat(null); }}>
                    <SelectTrigger className="h-8 text-xs flex-1 bg-background/50">
                      <SelectValue placeholder="类目及子类目" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类目</SelectItem>
                      {topCats.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name_zh}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 评论数 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0 w-16">
                    <span className="text-xs font-medium text-foreground">评论数</span>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent className="text-xs">按评论数量范围筛选</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input placeholder="最小值" value={reviewMin} onChange={e => setReviewMin(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" type="number" />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input placeholder="最大值" value={reviewMax} onChange={e => setReviewMax(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" type="number" />
                </div>

                {/* 竞品数 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0 w-16">
                    <span className="text-xs font-medium text-foreground">竞品数</span>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent className="text-xs">按竞品商品数量范围筛选</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input placeholder="最小值" value={competitorMin} onChange={e => setCompetitorMin(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" type="number" />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input placeholder="最大值" value={competitorMax} onChange={e => setCompetitorMax(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" type="number" />
                </div>
              </div>

              {/* Row 2: 销售额, 评分, 标签词 */}
              <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                {/* 销售额 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0 w-16">
                    <span className="text-xs font-medium text-foreground">销售额</span>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent className="text-xs">按销售额范围筛选(MXN)</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input placeholder="最小值" value={salesMin} onChange={e => setSalesMin(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" type="number" />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input placeholder="最大值" value={salesMax} onChange={e => setSalesMax(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" type="number" />
                </div>

                {/* 评分 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0 w-16">
                    <span className="text-xs font-medium text-foreground">评分</span>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent className="text-xs">按转化率/评分范围筛选</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input placeholder="最小值" value={ratingMin} onChange={e => setRatingMin(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" type="number" />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input placeholder="最大值" value={ratingMax} onChange={e => setRatingMax(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" type="number" />
                </div>

                {/* 标签词 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0 w-16">
                    <span className="text-xs font-medium text-foreground">标签词</span>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent className="text-xs">按标签关键词筛选</TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={tagMatchType} onValueChange={setTagMatchType}>
                    <SelectTrigger className="h-8 text-xs w-20 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="精准">精准</SelectItem>
                      <SelectItem value="模糊">模糊</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="标签词" value={tagKeyword} onChange={e => setTagKeyword(e.target.value)} className="h-8 text-xs bg-background/50 flex-1" />
                </div>
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <span className="text-xs text-primary cursor-pointer hover:underline mr-auto">保存当前模式</span>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-primary text-primary hover:bg-primary/5" onClick={handleReset}>
                  <RotateCcw className="w-3 h-3" /> 重置
                </Button>
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90" onClick={handleQuery}>
                  <Search className="w-3 h-3" /> 查询
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex-1 glass rounded-2xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                正在获取 <span className="text-foreground font-medium">{selectedCatName}</span> 的最新趋势...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("rank")}>
                      <span className="flex items-center gap-1">排名 <SortIcon field="rank" /></span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">关键词</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">相关产品</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">趋势</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("avg_price")}>
                      <span className="flex items-center justify-end gap-1">均价(MXN) <SortIcon field="avg_price" /></span>
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("sales_30d")}>
                      <span className="flex items-center justify-end gap-1">30天销量 <SortIcon field="sales_30d" /></span>
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("revenue")}>
                      <span className="flex items-center justify-end gap-1">销售额 <SortIcon field="revenue" /></span>
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("product_count")}>
                      <span className="flex items-center justify-end gap-1">商品数 <SortIcon field="product_count" /></span>
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("supply_demand_ratio")}>
                      <span className="flex items-center justify-end gap-1">供需比 <SortIcon field="supply_demand_ratio" /></span>
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("conversion_rate")}>
                      <span className="flex items-center justify-end gap-1">转化率 <SortIcon field="conversion_rate" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-16 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 opacity-30" />
                          <p>暂无数据，点击"同步官方数据"获取最新热搜词</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedKeywords.map((kw, idx) => (
                      <tr key={kw.id} className={`border-t border-border/30 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                            kw.rank <= 3 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {kw.rank}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-foreground text-sm leading-tight">{kw.keyword_es}</div>
                          <div className="text-muted-foreground text-[10px] mt-0.5">{kw.keyword_zh || "—"}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            {(kw.product_images.length > 0 ? kw.product_images.slice(0, 3) : [null, null, null]).map((img, i) => (
                              <div key={i} className="w-8 h-8 rounded bg-muted/50 border border-border/30 flex items-center justify-center overflow-hidden">
                                {img ? (
                                  <img src={img as string} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-3 h-3 text-muted-foreground/40" />
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <Sparkline data={kw.trend_data as number[]} />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-foreground">
                          {kw.avg_price != null ? `$${Number(kw.avg_price).toLocaleString()}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-foreground">{formatNum(kw.sales_30d)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-foreground">
                          {kw.revenue != null ? `$${formatNum(Number(kw.revenue))}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-foreground">{formatNum(kw.product_count)}</td>
                        <td className="px-3 py-2.5 text-right">
                          {kw.supply_demand_ratio != null ? (
                            <span className={Number(kw.supply_demand_ratio) > 50 ? "text-green-600 font-medium" : "text-foreground"}>
                              {Number(kw.supply_demand_ratio).toFixed(1)}%
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {kw.conversion_rate != null ? (
                            <span className="text-foreground">{Number(kw.conversion_rate).toFixed(1)}%</span>
                          ) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border/30 flex items-center justify-between bg-muted/20">
              <span className="text-[10px] text-muted-foreground">共 {sortedKeywords.length} 条热搜词</span>
              <span className="text-[10px] text-muted-foreground">数据来源: Mercado Libre Tendencias</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordsPage;
