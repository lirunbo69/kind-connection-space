
-- Add Alipay payment fields to recharge_records
ALTER TABLE public.recharge_records
  ADD COLUMN IF NOT EXISTS out_trade_no text UNIQUE,
  ADD COLUMN IF NOT EXISTS trade_no text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS package_id text;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_recharge_out_trade_no ON public.recharge_records(out_trade_no);
CREATE INDEX IF NOT EXISTS idx_recharge_status ON public.recharge_records(status);
CREATE INDEX IF NOT EXISTS idx_recharge_user_id ON public.recharge_records(user_id);

-- Allow service role to update recharge_records (for alipay callback)
CREATE POLICY "Service can update recharge records" ON public.recharge_records
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
