/*
# Add Web Auth Support, New Buildings, Minigames, and DAO Missions

## Overview
This migration adds support for web browser authentication (email/password via Supabase Auth),
new building/upgrade types, minigame score tracking, and DAO ecosystem missions.

## Changes to existing tables

### profiles table
- `auth_user_id` (uuid, nullable, references auth.users) — links Supabase Auth users to game profiles for web login
- `wallet_address` (text, nullable) — connected EVM wallet address (Reown/MetaMask etc.)
- `wallet_type` (text, nullable) — which wallet provider is connected ('ton' | 'reown')
- `solar_harvester_level` (int, default 0) — level for Solar Harvester building (bonus passive energy)
- `quantum_reactor_level` (int, default 0) — level for Quantum Reactor building (critical tap chance)
- `shield_generator_level` (int, default 0) — level for Shield Generator building (stamina protection)
- `orbital_station_level` (int, default 0) — level for Orbital Station building (daily token bonus)

### Indexes
- `idx_profiles_auth_user_id` on profiles(auth_user_id) for web auth lookups

## New tables

### minigame_scores
- `id` (uuid, primary key)
- `profile_id` (uuid, references profiles, not null)
- `game_id` (text, not null) — e.g. 'memory_match', 'reaction_rush', 'asteroid_blitz'
- `high_score` (int, default 0)
- `total_plays` (int, default 0)
- `last_played_at` (timestamptz)
- `created_at` (timestamptz, default now())
- UNIQUE(profile_id, game_id)

## Security
- RLS enabled on minigame_scores with restrictive deny-all policy (all access through edge function, same as other tables)
- No changes to existing RLS policies — all data access continues through the game-api edge function with service role key
*/

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
