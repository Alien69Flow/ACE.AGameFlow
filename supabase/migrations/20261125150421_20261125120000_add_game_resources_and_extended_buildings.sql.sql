/*
# Add game resources, extended buildings, and production tracking

## Summary

This migration introduces the resource economy layer (Minerals, Data, Influence)
that complements the existing Energy system, extends the buildings table to support
new building types (surface mine, underground mine, refinery, defense center,
space hangar, orbital station), and adds a production-snapshot table for offline
resource generation.

## New Tables

1. `game_resources`
   - One row per player profile.
   - Tracks minerals, data, influence balances and last production timestamp.
   - Owned by the player (profile_id references profiles.id).

2. `resource_transactions`
   - Append-only ledger of every resource gain/spend.
   - Records resource type, amount (positive=gain, negative=spend), source, and timestamp.

3. `production_snapshots`
   - Records the last-calculated production state for offline earnings.
   - Stores energy/minerals/data production rates and the timestamp of last calculation.

## Modified Tables

- `buildings`: the slot_id CHECK constraint is widened from 2-6 to 2-12 to accommodate
  the new building types. No existing data is affected.

## Security

- RLS enabled on all new tables.
- All access is via the service_role (edge function), matching the existing buildings/arena pattern.
- No anon or authenticated policies — the browser never talks to these tables directly.
- service_role bypasses RLS and is granted CRUD on all new tables.

## Important Notes

1. The `game_resources` table is created with defaults of 0 for all resource fields
   so new players start with nothing.
2. The `production_snapshots` table uses a single row per profile (UNIQUE constraint).
3. The `resource_transactions` table is append-only — no UPDATE or DELETE grants.
4. Existing building rows (slots 2-6) remain valid under the widened CHECK constraint.
*/

-- 1. Widen buildings slot_id constraint to support slots 2-12
ALTER TABLE buildings DROP CONSTRAINT IF EXISTS buildings_slot_id_check;
ALTER TABLE buildings ADD CONSTRAINT buildings_slot_id_check CHECK (slot_id BETWEEN 2 AND 12);

-- 2. Game resources table (one row per player)
CREATE TABLE IF NOT EXISTS game_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  minerals bigint NOT NULL DEFAULT 0 CHECK (minerals >= 0),
  data bigint NOT NULL DEFAULT 0 CHECK (data >= 0),
  influence bigint NOT NULL DEFAULT 0 CHECK (influence >= 0),
  last_production_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE game_resources ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON game_resources TO service_role;

CREATE INDEX IF NOT EXISTS game_resources_profile_idx ON game_resources (profile_id);

-- 3. Resource transactions ledger (append-only)
CREATE TABLE IF NOT EXISTS resource_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('energy', 'minerals', 'data', 'influence')),
  amount bigint NOT NULL,
  source text NOT NULL,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resource_transactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON resource_transactions TO service_role;

CREATE INDEX IF NOT EXISTS resource_transactions_profile_idx ON resource_transactions (profile_id, created_at DESC);

-- 4. Production snapshots for offline earnings
CREATE TABLE IF NOT EXISTS production_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  energy_rate integer NOT NULL DEFAULT 0,
  minerals_rate integer NOT NULL DEFAULT 0,
  data_rate integer NOT NULL DEFAULT 0,
  last_calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE production_snapshots ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON production_snapshots TO service_role;

CREATE INDEX IF NOT EXISTS production_snapshots_profile_idx ON production_snapshots (profile_id);
