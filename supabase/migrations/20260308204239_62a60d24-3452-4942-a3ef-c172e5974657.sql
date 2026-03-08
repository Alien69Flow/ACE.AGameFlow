
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  achievement_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  claimed boolean NOT NULL DEFAULT false,
  UNIQUE(profile_id, achievement_id)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct achievements access" ON public.achievements AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);
