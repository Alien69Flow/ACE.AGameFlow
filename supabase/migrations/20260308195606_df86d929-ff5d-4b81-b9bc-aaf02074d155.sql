
-- Referral system columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Daily login rewards
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_daily_claim timestamp with time zone,
  ADD COLUMN IF NOT EXISTS daily_streak integer NOT NULL DEFAULT 0;

-- Premium multiplier
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS multiplier integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS multiplier_expires_at timestamp with time zone;

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
