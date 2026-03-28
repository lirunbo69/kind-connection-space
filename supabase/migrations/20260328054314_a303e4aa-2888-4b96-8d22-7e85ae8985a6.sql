-- Create prompt_templates table
CREATE TABLE public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  template_content text NOT NULL,
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage prompt_templates"
  ON public.prompt_templates
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- All authenticated users can read
CREATE POLICY "Users can read prompt_templates"
  ON public.prompt_templates
  FOR SELECT
  TO authenticated
  USING (true);