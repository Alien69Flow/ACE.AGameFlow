
-- Upgrades table
CREATE TABLE public.upgrades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  upgrade_type text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (profile_id, upgrade_type)
);

ALTER TABLE public.upgrades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct upgrades access" ON public.upgrades AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);

-- Clans table
CREATE TABLE public.clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  member_count integer NOT NULL DEFAULT 1,
  total_energy bigint NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct clans access" ON public.clans AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);

-- Clan members table
CREATE TABLE public.clan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (profile_id)
);

ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct clan_members access" ON public.clan_members AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);

-- Daily combos table
CREATE TABLE public.daily_combos (
  date date PRIMARY KEY DEFAULT CURRENT_DATE,
  combo text[] NOT NULL,
  claimed_by jsonb NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.daily_combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct daily_combos access" ON public.daily_combos AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);

-- Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tap_power_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS passive_income_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_stamina_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS regen_speed_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS clan_id uuid REFERENCES public.clans(id);

-- Enable realtime for clans leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.clans;
