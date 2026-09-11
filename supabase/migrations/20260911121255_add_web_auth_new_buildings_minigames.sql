-- Add new columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS solar_harvester_level INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quantum_reactor_level INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shield_generator_level INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS orbital_station_level INTEGER NOT NULL DEFAULT 0;

-- Index for web auth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- Create minigame_scores table
CREATE TABLE IF NOT EXISTS public.minigame_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  high_score INTEGER NOT NULL DEFAULT 0,
  total_plays INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, game_id)
);

-- Enable RLS on minigame_scores
ALTER TABLE public.minigame_scores ENABLE ROW LEVEL SECURITY;

-- Restrictive deny-all policy (all access through edge function with service role key)
DROP POLICY IF EXISTS "Deny all direct minigame_scores access" ON public.minigame_scores;
CREATE POLICY "Deny all direct minigame_scores access"
  ON public.minigame_scores AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);

-- Index for minigame lookups
CREATE INDEX IF NOT EXISTS idx_minigame_scores_profile_id ON public.minigame_scores(profile_id);