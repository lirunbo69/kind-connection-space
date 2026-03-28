CREATE TABLE public.generation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_description text NOT NULL,
  keywords text,
  market text,
  language text,
  title text,
  selling_points jsonb,
  description text,
  main_image text,
  carousel_plan jsonb,
  carousel_images jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.generation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own records" ON public.generation_records
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON public.generation_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all records" ON public.generation_records
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));