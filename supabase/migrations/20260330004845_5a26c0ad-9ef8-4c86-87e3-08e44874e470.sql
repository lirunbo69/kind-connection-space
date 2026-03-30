
-- Create ml_categories table
CREATE TABLE public.ml_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es text NOT NULL,
  name_zh text NOT NULL,
  parent_id uuid REFERENCES public.ml_categories(id) ON DELETE CASCADE,
  level integer NOT NULL DEFAULT 1,
  slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create ml_hot_keywords table
CREATE TABLE public.ml_hot_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank integer NOT NULL,
  keyword_es text NOT NULL,
  keyword_zh text,
  category_id uuid REFERENCES public.ml_categories(id) ON DELETE CASCADE,
  avg_price numeric,
  sales_30d integer,
  revenue numeric,
  product_count integer,
  supply_demand_ratio numeric,
  conversion_rate numeric,
  trend_data jsonb DEFAULT '[]'::jsonb,
  product_images jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ml_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_hot_keywords ENABLE ROW LEVEL SECURITY;

-- RLS policies for ml_categories (readable by all authenticated)
CREATE POLICY "Authenticated can read categories" ON public.ml_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" ON public.ml_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for ml_hot_keywords (readable by all authenticated)
CREATE POLICY "Authenticated can read keywords" ON public.ml_hot_keywords
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage keywords" ON public.ml_hot_keywords
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_ml_categories_parent ON public.ml_categories(parent_id);
CREATE INDEX idx_ml_categories_slug ON public.ml_categories(slug);
CREATE INDEX idx_ml_hot_keywords_category ON public.ml_hot_keywords(category_id);
CREATE INDEX idx_ml_hot_keywords_rank ON public.ml_hot_keywords(rank);
