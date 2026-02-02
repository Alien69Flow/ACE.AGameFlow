import { useState, useEffect, useCallback, useRef } from 'react';
import { useTelegram } from './useTelegram';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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

// Helper function to call the Edge Function
async function callGameApi(endpoint: string, initData: string, body?: object) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/game-api/${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-init-data': initData,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export const useGameState = () => {
  const { initData, isReady } = useTelegram();
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

  // Initialize or fetch profile via Edge Function
  useEffect(() => {
    if (!isReady || !initData) return;

    const initProfile = async () => {
      try {
        const data = await callGameApi('init-profile', initData);
        
        if (data.profile) {
          setGameState({
            energy: data.profile.energy,
            stamina: data.profile.stamina,
            maxStamina: data.profile.max_stamina,
            tutorialCompleted: data.profile.tutorial_completed,
            profileId: data.profile.id,
          });

          // Map completed missions
          if (data.missions) {
            setMissions(prev => prev.map(m => {
              const completed = data.missions.find((cm: { mission_id: string }) => cm.mission_id === m.id);
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
        console.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();
  }, [isReady, initData]);

  // Stamina regeneration timer (sync with server periodically)
  useEffect(() => {
    if (!gameState.profileId || !initData) return;

    staminaIntervalRef.current = setInterval(async () => {
      if (gameState.stamina < gameState.maxStamina) {
        try {
          const data = await callGameApi('sync-stamina', initData);
          setGameState(prev => ({ 
            ...prev, 
            stamina: data.stamina,
            maxStamina: data.maxStamina 
          }));
        } catch {
          // Silent fail for sync
        }
      }
    }, 60000); // Every 60 seconds

    return () => {
      if (staminaIntervalRef.current) {
        clearInterval(staminaIntervalRef.current);
      }
    };
  }, [gameState.profileId, gameState.stamina, gameState.maxStamina, initData]);

  const tapToroid = useCallback(async () => {
    if (gameState.stamina <= 0 || !gameState.profileId || !initData) return false;

    // Optimistic update
    setGameState(prev => ({
      ...prev,
      energy: prev.energy + 1,
      stamina: prev.stamina - 1,
    }));

    try {
      const data = await callGameApi('tap', initData);
      
      if (!data.success) {
        // Revert on failure
        setGameState(prev => ({
          ...prev,
          energy: prev.energy - 1,
          stamina: prev.stamina + 1,
        }));
        return false;
      }
      
      // Sync with server values
      setGameState(prev => ({
        ...prev,
        energy: data.energy,
        stamina: data.stamina,
      }));
      
      return true;
    } catch {
      // Revert on error
      setGameState(prev => ({
        ...prev,
        energy: prev.energy - 1,
        stamina: prev.stamina + 1,
      }));
      return false;
    }
  }, [gameState.stamina, gameState.profileId, initData]);

  const startMission = useCallback(async (missionId: string) => {
    if (!gameState.profileId || !initData) return;

    try {
      const data = await callGameApi('start-mission', initData, { missionId });
      
      setMissions(prev => prev.map(m => 
        m.id === missionId ? { ...m, startedAt: new Date(data.startedAt) } : m
      ));
    } catch (error) {
      console.error('Failed to start mission');
    }
  }, [gameState.profileId, initData]);

  const claimMission = useCallback(async (missionId: string, reward: number) => {
    if (!gameState.profileId || !initData) return false;

    const mission = missions.find(m => m.id === missionId);
    if (!mission?.startedAt || mission.claimed) return false;

    try {
      const data = await callGameApi('claim-mission', initData, { missionId, reward });
      
      if (data.success) {
        setGameState(prev => ({ ...prev, energy: data.energy }));
        setMissions(prev => prev.map(m => 
          m.id === missionId ? { ...m, completedAt: new Date(), claimed: true } : m
        ));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [gameState.profileId, missions, initData]);

  const completeTutorial = useCallback(async () => {
    if (!gameState.profileId || !initData) return;

    try {
      await callGameApi('complete-tutorial', initData);
      setGameState(prev => ({ ...prev, tutorialCompleted: true }));
    } catch {
      // Silent fail
    }
  }, [gameState.profileId, initData]);

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
