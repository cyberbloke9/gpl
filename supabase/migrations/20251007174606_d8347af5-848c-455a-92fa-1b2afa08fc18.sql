-- Phase 1: Add unique constraint to prevent duplicate checklists per user per day
ALTER TABLE public.checklists 
  ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);

-- Add index for better query performance on transformer logs
CREATE INDEX IF NOT EXISTS idx_transformer_logs_date ON public.transformer_logs(date);
CREATE INDEX IF NOT EXISTS idx_transformer_logs_user_date ON public.transformer_logs(user_id, date);