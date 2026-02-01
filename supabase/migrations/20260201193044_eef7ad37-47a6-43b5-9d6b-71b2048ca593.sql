-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT NOT NULL UNIQUE,
  username TEXT,
  energy BIGINT NOT NULL DEFAULT 0,
  stamina INTEGER NOT NULL DEFAULT 100,
  max_stamina INTEGER NOT NULL DEFAULT 100,
  last_stamina_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tutorial_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missions_completed table
CREATE TABLE public.missions_completed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, mission_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions_completed ENABLE ROW LEVEL SECURITY;

-- Profiles policies - users can read/update their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (true);

-- Missions policies
CREATE POLICY "Users can view their own missions" 
ON public.missions_completed 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own missions" 
ON public.missions_completed 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own missions" 
ON public.missions_completed 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX idx_missions_profile_id ON public.missions_completed(profile_id);