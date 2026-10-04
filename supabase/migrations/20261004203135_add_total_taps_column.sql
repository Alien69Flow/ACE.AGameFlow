-- Add total_taps column to profiles for achievement tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_taps INTEGER NOT NULL DEFAULT 0;