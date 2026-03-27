
-- Create page_views table for tracking website visits
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  page_path text NOT NULL,
  device_type text NOT NULL DEFAULT 'desktop',
  user_agent text,
  ip_address text,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (to track anonymous visits)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create index for fast date queries
CREATE INDEX idx_page_views_visit_date ON public.page_views(visit_date);
CREATE INDEX idx_page_views_device_type ON public.page_views(device_type);
