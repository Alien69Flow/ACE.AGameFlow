-- Add anti-cheat and wheel columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_tap_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_free_spin timestamptz,
ADD COLUMN IF NOT EXISTS total_spins integer DEFAULT 0;