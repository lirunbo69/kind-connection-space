import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface Record {
  id: string;
  user_id: string;
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
  user_email?: string;
}

const GenerationRecordsPanel = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Record | null>(null);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("generation_records")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Fetch error:", error);
      setLoading(false);
      return;
    }

    // Fetch user emails
    const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);

    setRecords(
      (data || []).map((r: any) => ({
        ...r,
        user_email: emailMap.get(r.user_id) || r.user_id.substring(0, 8),
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const cellStyle = { color: "hsl(220, 10%, 75%)" };
  const headStyle = { color: "hsl(220, 10%, 55%)" };

  return (
    <div className="space-y-4">
      <div className="admin-glass overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "hsl(195, 100%, 50%)" }}>
            用户生成记录 ({records.length})
          </h3>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8" style={{ color: "hsl(220, 10%, 50%)" }}>加载中...</div>
          ) : (
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b" style={{ borderColor: "hsl(220, 15%, 18%)" }}>
                    <TableHead style={headStyle}>用户</TableHead>
                    <TableHead style={headStyle}>产品名称</TableHead>
                    <TableHead style={headStyle}>市场</TableHead>
                    <TableHead style={headStyle}>生成标题</TableHead>
                    <TableHead style={headStyle}>时间</TableHead>
                    <TableHead style={headStyle}>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id} className="border-b" style={{ borderColor: "hsl(220, 15%, 15%)" }}>
                      <TableCell className="text-xs" style={cellStyle}>{r.user_email}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate" style={cellStyle}>{r.product_name}</TableCell>
                      <TableCell className="text-xs" style={cellStyle}>{r.market || "—"}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" style={cellStyle}>{r.title || "—"}</TableCell>
                      <TableCell className="text-xs" style={{ color: "hsl(220, 10%, 50%)" }}>
                        {new Date(r.created_at).toLocaleString("zh-CN")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 border-0 text-xs"
                          style={{ background: "hsl(220, 15%, 18%)", color: "hsl(195, 100%, 50%)" }}
                          onClick={() => setDetail(r)}
                        >
                          <Eye className="w-3 h-3" />
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto"
          style={{ background: "hsl(220, 15%, 12%)", border: "1px solid hsl(220, 15%, 22%)", color: "hsl(0, 0%, 90%)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(195, 100%, 50%)" }}>
              生成详情 - {detail?.product_name}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold" style={{ color: "hsl(220, 10%, 55%)" }}>用户</span>
                <p style={cellStyle}>{detail.user_email}</p>
              </div>
              <div>
                <span className="text-xs font-semibold" style={{ color: "hsl(220, 10%, 55%)" }}>产品描述</span>
                <p style={cellStyle}>{detail.product_description}</p>
              </div>
              {detail.title && (
                <div>
                  <span className="text-xs font-semibold" style={{ color: "hsl(220, 10%, 55%)" }}>生成标题</span>
                  <p className="font-medium" style={{ color: "hsl(195, 100%, 50%)" }}>{detail.title}</p>
                </div>
              )}
              {detail.selling_points && (
                <div>
                  <span className="text-xs font-semibold" style={{ color: "hsl(220, 10%, 55%)" }}>卖点</span>
                  <ul className="list-disc pl-4 space-y-1" style={cellStyle}>
                    {(detail.selling_points as string[]).map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
              {detail.description && (
                <div>
                  <span className="text-xs font-semibold" style={{ color: "hsl(220, 10%, 55%)" }}>描述</span>
                  <p className="whitespace-pre-wrap" style={cellStyle}>{detail.description}</p>
                </div>
              )}
              {detail.main_image && (
                <div>
                  <span className="text-xs font-semibold" style={{ color: "hsl(220, 10%, 55%)" }}>主图</span>
                  <img src={detail.main_image} alt="主图" className="w-full max-w-xs rounded-lg mt-1" />
                </div>
              )}
              {detail.carousel_images && (detail.carousel_images as string[]).length > 0 && (
                <div>
                  <span className="text-xs font-semibold" style={{ color: "hsl(220, 10%, 55%)" }}>轮播图</span>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(detail.carousel_images as string[]).map((img, i) => (
                      <img key={i} src={img} alt={`轮播图 ${i + 1}`} className="w-full rounded-lg aspect-square object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenerationRecordsPanel;
