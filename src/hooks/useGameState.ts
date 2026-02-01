import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegram } from './useTelegram';

interface GameState {
  energy: number;
  stamina: number;
  maxStamina: number;
  tutorialCompleted: boolean;
  profileId: string | null;
}

interface Mission {
  id: string;
  name: string;
  url: string;
  icon: string;
  reward: number;
  startedAt: Date | null;
  completedAt: Date | null;
  claimed: boolean;
}

export const useGameState = () => {
  const { userId, username, isReady } = useTelegram();
  const [gameState, setGameState] = useState<GameState>({
    energy: 0,
    stamina: 100,
    maxStamina: 100,
    tutorialCompleted: false,
    profileId: null,
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const staminaIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or fetch profile
  useEffect(() => {
    if (!isReady || !userId) return;

    const initProfile = async () => {
      try {
        // Try to fetch existing profile
        let { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', userId)
          .maybeSingle();

        if (!profile) {
          // Create new profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              telegram_id: userId,
              username: username,
            })
            .select()
            .single();

          if (createError) throw createError;
          profile = newProfile;
        }

        // Calculate stamina regeneration
        if (profile) {
          const lastUpdate = new Date(profile.last_stamina_update);
          const now = new Date();
          const secondsElapsed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
          const staminaRegen = Math.floor(secondsElapsed / 60); // +1 per minute
          const newStamina = Math.min(profile.stamina + staminaRegen, profile.max_stamina);

          if (newStamina !== profile.stamina) {
            await supabase
              .from('profiles')
              .update({ 
                stamina: newStamina, 
                last_stamina_update: now.toISOString() 
              })
              .eq('id', profile.id);
            profile.stamina = newStamina;
          }

          setGameState({
            energy: profile.energy,
            stamina: profile.stamina,
            maxStamina: profile.max_stamina,
            tutorialCompleted: profile.tutorial_completed,
            profileId: profile.id,
          });

          // Fetch completed missions
          const { data: completedMissions } = await supabase
            .from('missions_completed')
            .select('*')
            .eq('profile_id', profile.id);

          if (completedMissions) {
            setMissions(prev => prev.map(m => {
              const completed = completedMissions.find(cm => cm.mission_id === m.id);
              if (completed) {
                return {
                  ...m,
                  startedAt: completed.started_at ? new Date(completed.started_at) : null,
                  completedAt: completed.completed_at ? new Date(completed.completed_at) : null,
                  claimed: completed.claimed,
                };
              }
              return m;
            }));
          }
        }
      } catch (error) {
        console.error('Error initializing profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();
  }, [isReady, userId, username]);

  // Stamina regeneration timer
  useEffect(() => {
    if (!gameState.profileId) return;

    staminaIntervalRef.current = setInterval(async () => {
      if (gameState.stamina < gameState.maxStamina) {
        const newStamina = gameState.stamina + 1;
        setGameState(prev => ({ ...prev, stamina: newStamina }));
        
        await supabase
          .from('profiles')
          .update({ 
            stamina: newStamina, 
            last_stamina_update: new Date().toISOString() 
          })
          .eq('id', gameState.profileId);
      }
    }, 60000); // Every 60 seconds

    return () => {
      if (staminaIntervalRef.current) {
        clearInterval(staminaIntervalRef.current);
      }
    };
  }, [gameState.profileId, gameState.stamina, gameState.maxStamina]);

  const tapToroid = useCallback(async () => {
    if (gameState.stamina <= 0 || !gameState.profileId) return false;

    const newEnergy = gameState.energy + 1;
    const newStamina = gameState.stamina - 1;

    setGameState(prev => ({
      ...prev,
      energy: newEnergy,
      stamina: newStamina,
    }));

    await supabase
      .from('profiles')
      .update({ 
        energy: newEnergy, 
        stamina: newStamina,
        last_stamina_update: new Date().toISOString(),
      })
      .eq('id', gameState.profileId);

    return true;
  }, [gameState.stamina, gameState.energy, gameState.profileId]);

  const startMission = useCallback(async (missionId: string) => {
    if (!gameState.profileId) return;

    const now = new Date();
    
    await supabase
      .from('missions_completed')
      .upsert({
        profile_id: gameState.profileId,
        mission_id: missionId,
        started_at: now.toISOString(),
      });

    setMissions(prev => prev.map(m => 
      m.id === missionId ? { ...m, startedAt: now } : m
    ));
  }, [gameState.profileId]);

  const claimMission = useCallback(async (missionId: string, reward: number) => {
    if (!gameState.profileId) return false;

    const mission = missions.find(m => m.id === missionId);
    if (!mission?.startedAt || mission.claimed) return false;

    const elapsedSeconds = (Date.now() - mission.startedAt.getTime()) / 1000;
    if (elapsedSeconds < 33) return false;

    const newEnergy = gameState.energy + reward;
    const now = new Date();

    await supabase
      .from('missions_completed')
      .update({
        completed_at: now.toISOString(),
        claimed: true,
      })
      .eq('profile_id', gameState.profileId)
      .eq('mission_id', missionId);

    await supabase
      .from('profiles')
      .update({ energy: newEnergy })
      .eq('id', gameState.profileId);

    setGameState(prev => ({ ...prev, energy: newEnergy }));
    setMissions(prev => prev.map(m => 
      m.id === missionId ? { ...m, completedAt: now, claimed: true } : m
    ));

    return true;
  }, [gameState.profileId, gameState.energy, missions]);

  const completeTutorial = useCallback(async () => {
    if (!gameState.profileId) return;

    await supabase
      .from('profiles')
      .update({ tutorial_completed: true })
      .eq('id', gameState.profileId);

    setGameState(prev => ({ ...prev, tutorialCompleted: true }));
  }, [gameState.profileId]);

  return {
    gameState,
    missions,
    setMissions,
    isLoading,
    tapToroid,
    startMission,
    claimMission,
    completeTutorial,
  };
};
