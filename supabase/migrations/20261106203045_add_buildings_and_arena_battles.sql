/*
# Add buildings and arena battles

1. New Tables
- `buildings`: one row per building a player owns. Each player has at most one building per planet slot (slots 2 to 6). Stores the building type, its level and when it was bought.
- `arena_battles`: a record of every arena battle, used for the daily battle limit and the battle history.

2. Security
- Enable RLS on both tables.
- No policies are added: the game server reads and writes these tables with the service role, which bypasses RLS, and the browser never talks to them directly.
- Only the service role is granted access.

3. Important Notes
- Deleting a profile also deletes its buildings and battles (ON DELETE CASCADE).
- The slot and level checks protect the data even if the server code has a bug.
*/

CREATE TABLE IF NOT EXISTS buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slot_id integer NOT NULL CHECK (slot_id BETWEEN 2 AND 6),
  building_type text NOT NULL,
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, slot_id)
);

CREATE INDEX IF NOT EXISTS buildings_profile_id_idx ON buildings (profile_id);

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON buildings TO service_role;

CREATE TABLE IF NOT EXISTS arena_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  won boolean NOT NULL,
  energy_reward integer NOT NULL DEFAULT 0 CHECK (energy_reward >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS arena_battles_profile_created_idx ON arena_battles (profile_id, created_at);

ALTER TABLE arena_battles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON arena_battles TO service_role;
