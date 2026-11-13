/*
# Add Satoshis Rewards System

## Changes

### 1. New table: `satoshis_ledger`
Tracks every satoshi reward earned by users through ads, minigames, and mining.
- `id` (uuid, primary key)
- `profile_id` (uuid, FK to profiles)
- `amount_sats` (integer, satoshis amount — positive for earned, negative for withdrawn)
- `source` (text: 'ad_reward', 'minigame_bonus', 'mining_milestone', 'withdrawal')
- `reference` (text, nullable — e.g. ad ID or withdrawal tx)
- `created_at` (timestamp)

### 2. New table: `ad_reward_claims`
Tracks ad reward claims to prevent abuse (one ad reward per user per cooldown).
- `id` (uuid, primary key)
- `profile_id` (uuid, FK to profiles)
- `ad_type` (text: 'daily_bonus', 'minigame_double', 'satoshis_reward')
- `claimed_at` (timestamp)

### 3. New column on `profiles`: `satoshis_balance`
Running balance of withdrawable satoshis (integer, default 0).

## Security
- RLS enabled on both new tables.
- Grants to `authenticated` only (server-side edge function uses service_role).
- Users can read their own ledger entries and ad claims.
*/

CREATE TABLE IF NOT EXISTS satoshis_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_sats integer NOT NULL,
  source text NOT NULL CHECK (source IN ('ad_reward', 'minigame_bonus', 'mining_milestone', 'withdrawal')),
  reference text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE satoshis_ledger ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON satoshis_ledger TO authenticated;

DROP POLICY IF EXISTS "select_own_satoshis_ledger" ON satoshis_ledger;
CREATE POLICY "select_own_satoshis_ledger"
ON satoshis_ledger FOR SELECT
TO authenticated USING (auth.uid() = profile_id);

CREATE TABLE IF NOT EXISTS ad_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ad_type text NOT NULL CHECK (ad_type IN ('daily_bonus', 'minigame_double', 'satoshis_reward')),
  claimed_at timestamptz DEFAULT now()
);

ALTER TABLE ad_reward_claims ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON ad_reward_claims TO authenticated;

DROP POLICY IF EXISTS "select_own_ad_claims" ON ad_reward_claims;
CREATE POLICY "select_own_ad_claims"
ON ad_reward_claims FOR SELECT
TO authenticated USING (auth.uid() = profile_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'satoshis_balance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN satoshis_balance integer NOT NULL DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_satoshis_ledger_profile ON satoshis_ledger(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_claims_profile_type ON ad_reward_claims(profile_id, ad_type, claimed_at DESC);
