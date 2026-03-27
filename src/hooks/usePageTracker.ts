import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function getVisitorId(): string {
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }
  return id;
}

function getDeviceType(): "mobile" | "desktop" {
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    ? "mobile"
    : "desktop";
}

export function usePageTracker(pagePath: string) {
  useEffect(() => {
    const track = async () => {
      const visitorId = getVisitorId();
      const deviceType = getDeviceType();
      const today = new Date().toISOString().split("T")[0];

      // Check if already tracked today for this page
      const key = `pv_${pagePath}_${today}`;
      if (sessionStorage.getItem(key)) return;

      await supabase.from("page_views").insert({
        visitor_id: visitorId,
        page_path: pagePath,
        device_type: deviceType,
        user_agent: navigator.userAgent,
        visit_date: today,
      });

      sessionStorage.setItem(key, "1");
    };

    track();
  }, [pagePath]);
}
