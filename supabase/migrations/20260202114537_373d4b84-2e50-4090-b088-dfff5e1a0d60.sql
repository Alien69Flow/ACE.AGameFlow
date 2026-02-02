-- Fix RLS policies for profiles table
-- Since this app uses Telegram WebApp auth (not Supabase Auth), 
-- we need a different approach. We'll create a helper function and 
-- restrict access based on telegram_id passed via RPC or JWT claims.

-- For now, we'll make the tables more restrictive and require 
-- the application to use authenticated Edge Functions for data access.

-- Drop all existing overly permissive policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Drop all existing overly permissive policies on missions_completed
DROP POLICY IF EXISTS "Users can view their own missions" ON public.missions_completed;
DROP POLICY IF EXISTS "Users can insert their own missions" ON public.missions_completed;
DROP POLICY IF EXISTS "Users can update their own missions" ON public.missions_completed;

-- Create restrictive policies that deny direct client access
-- All access will go through authenticated Edge Functions using service role

-- Profiles: No direct access (will use Edge Functions)
CREATE POLICY "No direct profile access" 
ON public.profiles 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Missions: No direct access (will use Edge Functions)  
CREATE POLICY "No direct mission access" 
ON public.missions_completed 
FOR ALL 
USING (false)
WITH CHECK (false);