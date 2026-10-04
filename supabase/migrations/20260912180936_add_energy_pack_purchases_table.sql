-- Table to track verified TON energy pack purchases (prevent double-claiming)
CREATE TABLE IF NOT EXISTS public.energy_pack_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  stamina_granted INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tx_hash)
);

-- Enable RLS
ALTER TABLE public.energy_pack_purchases ENABLE ROW LEVEL SECURITY;

-- Deny all direct access (all access through edge function with service role key)
DROP POLICY IF EXISTS "Deny all direct energy_pack_purchases access" ON public.energy_pack_purchases;
CREATE POLICY "Deny all direct energy_pack_purchases access"
  ON public.energy_pack_purchases AS RESTRICTIVE FOR ALL TO public
  USING (false) WITH CHECK (false);

-- Index for looking up by profile
CREATE INDEX IF NOT EXISTS idx_energy_pack_purchases_profile_id ON public.energy_pack_purchases(profile_id);