-- Add unique constraint for mission upsert to work
ALTER TABLE public.missions_completed 
ADD CONSTRAINT missions_completed_profile_mission_unique 
UNIQUE (profile_id, mission_id);