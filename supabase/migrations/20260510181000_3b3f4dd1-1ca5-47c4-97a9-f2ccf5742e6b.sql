
-- Remove tables from realtime publication: client doesn't use realtime,
-- and broadcasting profile/clan rows would expose other users' data.
ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
ALTER PUBLICATION supabase_realtime DROP TABLE public.clans;

-- Convert permissive deny policies to RESTRICTIVE so they cannot be
-- bypassed if a permissive policy is ever added later.
DROP POLICY IF EXISTS "No direct profile access" ON public.profiles;
CREATE POLICY "Deny all direct profile access"
  ON public.profiles AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct mission access" ON public.missions_completed;
CREATE POLICY "Deny all direct mission access"
  ON public.missions_completed AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct achievements access" ON public.achievements;
CREATE POLICY "Deny all direct achievements access"
  ON public.achievements AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct clans access" ON public.clans;
CREATE POLICY "Deny all direct clans access"
  ON public.clans AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct clan_members access" ON public.clan_members;
CREATE POLICY "Deny all direct clan_members access"
  ON public.clan_members AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct daily_combos access" ON public.daily_combos;
CREATE POLICY "Deny all direct daily_combos access"
  ON public.daily_combos AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No direct upgrades access" ON public.upgrades;
CREATE POLICY "Deny all direct upgrades access"
  ON public.upgrades AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);
