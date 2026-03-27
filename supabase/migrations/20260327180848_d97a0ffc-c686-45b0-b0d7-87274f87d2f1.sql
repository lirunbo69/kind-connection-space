
-- Create recharge_records table
CREATE TABLE public.recharge_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  points INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recharge_records ENABLE ROW LEVEL SECURITY;

-- Users can only view their own records
CREATE POLICY "Users can view own recharge records"
ON public.recharge_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own records (via edge function with service role, but also allow direct for simulation)
CREATE POLICY "Users can insert own recharge records"
ON public.recharge_records FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all records
CREATE POLICY "Admins can view all recharge records"
ON public.recharge_records FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
