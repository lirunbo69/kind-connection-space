import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserPoints = () => {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("user_points")
      .select("remaining_points")
      .eq("user_id", user.id)
      .single();
    if (data) setPoints(data.remaining_points);
    setLoading(false);
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  return { points, loading, refetch: fetchPoints };
};
