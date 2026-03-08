import { useState, useEffect, useCallback, useRef } from 'react';
import { useTelegram } from './useTelegram';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface GameState {
  energy: number;
  stamina: number;
  maxStamina: number;
  tutorialCompleted: boolean;
  profileId: string | null;
  referralCode: string | null;
  referralCount: number;
  hasReferred: boolean;
  dailyStreak: number;
  lastDailyClaim: string | null;
  multiplier: number;
  multiplierExpiresAt: string | null;
  tapPowerLevel: number;
  passiveIncomeLevel: number;
  maxStaminaLevel: number;
  regenSpeedLevel: number;
  clanId: string | null;
}

interface Mission {
  id: string;
  name: string;
  url: string;
  icon: string;
  reward: number;
  verifiable?: boolean;
  verifyType?: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  claimed: boolean;
}

interface LeaderboardEntry {
  username: string | null;
  energy: number;
  referral_count: number;
}

interface AchievementInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  unlockedAt: string | null;
  claimed: boolean;
  progress: number;
  target: number;
}

interface NewAchievement {
  id: string;
  name: string;
  icon: string;
  reward: number;
}

interface ClanInfo {
  id: string;
  name: string;
  member_count: number;
  total_energy: number;
}

interface UpgradeInfo {
  type: string;
  currentLevel: number;
  maxLevel: number;
  currentValue: number;
  nextValue: number | null;
  nextCost: number | null;
  canAfford: boolean;
}

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
    referralCode: null,
    referralCount: 0,
    hasReferred: false,
    dailyStreak: 0,
    lastDailyClaim: null,
    multiplier: 1,
    multiplierExpiresAt: null,
    tapPowerLevel: 0,
    passiveIncomeLevel: 0,
    maxStaminaLevel: 0,
    regenSpeedLevel: 0,
    clanId: null,
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyRewardAvailable, setDailyRewardAvailable] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  const [clan, setClan] = useState<ClanInfo | null>(null);
  const [clanLeaderboard, setClanLeaderboard] = useState<ClanInfo[]>([]);
  
  const staminaIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMiningRef = useRef(false);

  // Init profile
  useEffect(() => {
    if (!isReady || !initData) return;

    const initProfile = async () => {
      try {
        const data = await callGameApi('init-profile', initData);
        
        if (data.profile) {
          const p = data.profile;
          setGameState({
            energy: p.energy,
            stamina: p.stamina,
            maxStamina: p.max_stamina,
            tutorialCompleted: p.tutorial_completed,
            profileId: p.id,
            referralCode: p.referral_code || null,
            referralCount: p.referral_count || 0,
            hasReferred: !!p.referred_by,
            dailyStreak: p.daily_streak || 0,
            lastDailyClaim: p.last_daily_claim || null,
            multiplier: p.multiplier || 1,
            multiplierExpiresAt: p.multiplier_expires_at || null,
            tapPowerLevel: p.tap_power_level || 0,
            passiveIncomeLevel: p.passive_income_level || 0,
            maxStaminaLevel: p.max_stamina_level || 0,
            regenSpeedLevel: p.regen_speed_level || 0,
            clanId: p.clan_id || null,
          });

          // Offline earnings
          if (data.offlineEarnings > 0) {
            setOfflineEarnings(data.offlineEarnings);
          }

          // Clan info
          if (data.clan) {
            setClan(data.clan);
          }

          // Check daily reward
          if (!p.last_daily_claim) {
            setDailyRewardAvailable(true);
          } else {
            const hoursSince = (Date.now() - new Date(p.last_daily_claim).getTime()) / (1000 * 60 * 60);
            setDailyRewardAvailable(hoursSince >= 24);
          }

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
        console.error('Error Crítico: Fallo en carga de perfil Neutrino');
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();
  }, [isReady, initData]);

  // Stamina regen sync
  useEffect(() => {
    if (!gameState.profileId || !initData) return;

    staminaIntervalRef.current = setInterval(async () => {
      if (gameState.stamina < gameState.maxStamina && !isMiningRef.current) {
        try {
          const data = await callGameApi('sync-stamina', initData);
          setGameState(prev => ({ 
            ...prev, 
            stamina: data.stamina,
            maxStamina: data.maxStamina 
          }));
        } catch { /* silent */ }
      }
    }, 60000);

    return () => {
      if (staminaIntervalRef.current) clearInterval(staminaIntervalRef.current);
    };
  }, [gameState.profileId, gameState.stamina, gameState.maxStamina, initData]);

  const lastTapTimeRef = useRef(0);

  const tapToroid = useCallback(async () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 150) return false; // 150ms cooldown
    lastTapTimeRef.current = now;

    if (gameState.stamina <= 0 || !gameState.profileId || !initData || isMiningRef.current) return false;

    isMiningRef.current = true;

    const gain = gameState.multiplier > 1 && gameState.multiplierExpiresAt && new Date(gameState.multiplierExpiresAt) > new Date() ? gameState.multiplier : 1;

    setGameState(prev => ({
      ...prev,
      energy: prev.energy + gain,
      stamina: prev.stamina - 1,
    }));

    try {
      const data = await callGameApi('tap', initData);
      
      if (!data.success) {
        setGameState(prev => ({
          ...prev,
          energy: prev.energy - gain,
          stamina: prev.stamina + 1,
        }));
        if (data.error?.includes('Rate')) toast.error('⚡ Demasiado rápido, espera un momento');
        return false;
      }
      
      setGameState(prev => ({
        ...prev,
        energy: data.energy,
        stamina: data.stamina,
      }));
      
      return true;
    } catch {
      setGameState(prev => ({
        ...prev,
        energy: prev.energy - gain,
        stamina: prev.stamina + 1,
      }));
      return false;
    } finally {
      isMiningRef.current = false;
    }
  }, [gameState.stamina, gameState.profileId, gameState.multiplier, gameState.multiplierExpiresAt, initData]);

  const startMission = useCallback(async (missionId: string) => {
    if (!gameState.profileId || !initData) return;
    try {
      const data = await callGameApi('start-mission', initData, { missionId });
      setMissions(prev => prev.map(m => 
        m.id === missionId ? { ...m, startedAt: new Date(data.startedAt) } : m
      ));
    } catch (error) {
      console.error('Misión fallida');
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
    } catch { /* Silent fail */ }
  }, [gameState.profileId, initData]);

  // Referral
  const applyReferral = useCallback(async (referralCode: string) => {
    if (!initData) return { success: false, error: 'Not ready' };
    try {
      const data = await callGameApi('apply-referral', initData, { referralCode });
      if (data.success) {
        setGameState(prev => ({ 
          ...prev, 
          energy: prev.energy + data.energyGained,
          hasReferred: true,
        }));
        return { success: true };
      }
      return { success: false, error: 'Failed' };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Error' };
    }
  }, [initData]);

  // Daily reward
  const claimDaily = useCallback(async () => {
    if (!initData) return null;
    try {
      const data = await callGameApi('claim-daily', initData);
      if (data.success) {
        setGameState(prev => ({ 
          ...prev, 
          energy: data.energy,
          dailyStreak: data.streak,
          lastDailyClaim: new Date().toISOString(),
        }));
        setDailyRewardAvailable(false);
        return { reward: data.reward, streak: data.streak };
      }
      return null;
    } catch {
      return null;
    }
  }, [initData]);

  // Leaderboard
  const fetchLeaderboard = useCallback(async () => {
    if (!initData) return;
    try {
      const data = await callGameApi('leaderboard', initData);
      setLeaderboard(data.leaderboard || []);
      setUserRank(data.userRank);
    } catch { /* silent */ }
  }, [initData]);

  // Activate multiplier
  const activateMultiplier = useCallback(async () => {
    if (!initData) return false;
    try {
      const data = await callGameApi('buy-multiplier', initData);
      if (data.success) {
        setGameState(prev => ({
          ...prev,
          multiplier: data.multiplier,
          multiplierExpiresAt: data.expiresAt,
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [initData]);

  // Upgrades
  const fetchUpgrades = useCallback(async () => {
    if (!initData) return null;
    try {
      const data = await callGameApi('get-upgrades', initData);
      return data as { upgrades: UpgradeInfo[]; energy: number };
    } catch {
      return null;
    }
  }, [initData]);

  const buyUpgrade = useCallback(async (upgradeType: string) => {
    if (!initData) return null;
    try {
      const data = await callGameApi('buy-upgrade', initData, { upgradeType });
      if (data.success) {
        setGameState(prev => ({
          ...prev,
          energy: data.energy,
          [`${data.upgradeType}Level`]: data.newLevel, // won't actually set due to camelCase mismatch, but energy updates
        }));
        // Refresh specific level
        const levelMap: Record<string, keyof GameState> = {
          tap_power: 'tapPowerLevel',
          passive_income: 'passiveIncomeLevel',
          max_stamina: 'maxStaminaLevel',
          regen_speed: 'regenSpeedLevel',
        };
        const key = levelMap[data.upgradeType];
        if (key) {
          setGameState(prev => ({ ...prev, [key]: data.newLevel, energy: data.energy }));
        }
        if (data.upgradeType === 'max_stamina') {
          setGameState(prev => ({ ...prev, maxStamina: data.newValue }));
        }
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, [initData]);

  // Dismiss offline earnings
  const dismissOfflineEarnings = useCallback(() => {
    setOfflineEarnings(0);
  }, []);

  // Clan actions
  const createClan = useCallback(async (name: string) => {
    if (!initData) return { success: false, error: 'Not ready' };
    try {
      const data = await callGameApi('create-clan', initData, { name });
      if (data.success) {
        setGameState(prev => ({ ...prev, clanId: data.clan.id, energy: data.energy }));
        setClan(data.clan);
        return { success: true };
      }
      return { success: false, error: 'Failed' };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Error' };
    }
  }, [initData]);

  const joinClan = useCallback(async (clanId: string) => {
    if (!initData) return { success: false, error: 'Not ready' };
    try {
      const data = await callGameApi('join-clan', initData, { clanId });
      if (data.success) {
        setGameState(prev => ({ ...prev, clanId }));
        return { success: true };
      }
      return { success: false, error: 'Failed' };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Error' };
    }
  }, [initData]);

  const leaveClan = useCallback(async () => {
    if (!initData) return false;
    try {
      const data = await callGameApi('leave-clan', initData);
      if (data.success) {
        setGameState(prev => ({ ...prev, clanId: null }));
        setClan(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [initData]);

  const fetchClanLeaderboard = useCallback(async () => {
    if (!initData) return;
    try {
      const data = await callGameApi('clan-leaderboard', initData);
      setClanLeaderboard(data.clans || []);
    } catch { /* silent */ }
  }, [initData]);

  // Verify mission (Telegram channel check)
  const verifyMission = useCallback(async (missionId: string, verifyType: string) => {
    if (!initData) return null;
    try {
      const data = await callGameApi('verify-mission', initData, { missionId, verifyType });
      return data as { verified: boolean; error?: string };
    } catch (e: unknown) {
      return { verified: false, error: e instanceof Error ? e.message : 'Error' };
    }
  }, [initData]);

  // Achievements
  const [achievements, setAchievements] = useState<AchievementInfo[]>([]);
  const [achievementCounts, setAchievementCounts] = useState<{ unlocked: number; total: number }>({ unlocked: 0, total: 13 });
  const [newAchievementQueue, setNewAchievementQueue] = useState<NewAchievement[]>([]);

  const processNewAchievements = useCallback((newAchievements?: NewAchievement[]) => {
    if (newAchievements && newAchievements.length > 0) {
      setNewAchievementQueue(prev => [...prev, ...newAchievements]);
      setAchievementCounts(prev => ({ ...prev, unlocked: prev.unlocked + newAchievements.length }));
    }
  }, []);

  const dismissAchievementNotification = useCallback(() => {
    setNewAchievementQueue(prev => prev.slice(1));
  }, []);

  const fetchAchievements = useCallback(async () => {
    if (!initData) return;
    try {
      const data = await callGameApi('get-achievements', initData);
      setAchievements(data.achievements || []);
      setAchievementCounts({ unlocked: data.unlockedCount || 0, total: data.totalCount || 13 });
    } catch { /* silent */ }
  }, [initData]);

  const claimAchievement = useCallback(async (achievementId: string) => {
    if (!initData) return false;
    try {
      const data = await callGameApi('claim-achievement', initData, { achievementId });
      if (data.success) {
        setGameState(prev => ({ ...prev, energy: data.energy }));
        setAchievements(prev => prev.map(a => a.id === achievementId ? { ...a, claimed: true } : a));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [initData]);

  // Lucky wheel
  const [canSpinFree, setCanSpinFree] = useState(false);

  // Fetch wheel status on init
  useEffect(() => {
    if (!initData || !gameState.profileId) return;
    const checkWheelStatus = async () => {
      try {
        const data = await callGameApi('get-wheel-status', initData);
        setCanSpinFree(data.canSpinFree);
      } catch { /* silent */ }
    };
    checkWheelStatus();
  }, [initData, gameState.profileId]);

  const spinWheel = useCallback(async () => {
    if (!initData) return { prize: null, canSpinFree: false, error: 'Not ready' };
    try {
      const data = await callGameApi('spin-wheel', initData);
      if (data.success) {
        setGameState(prev => ({ ...prev, energy: data.newEnergy }));
        setCanSpinFree(data.canSpinFree);
        return { prize: data.prize, canSpinFree: data.canSpinFree };
      }
      return { prize: null, canSpinFree: data.canSpinFree ?? false, error: data.error };
    } catch (e: unknown) {
      return { prize: null, canSpinFree: false, error: e instanceof Error ? e.message : 'Error' };
    }
  }, [initData]);

  // Friends list
  const [friends, setFriends] = useState<{ username: string | null; energy: number; last_seen_at: string }[]>([]);

  const fetchFriends = useCallback(async () => {
    if (!initData) return;
    try {
      const data = await callGameApi('get-friends', initData);
      setFriends(data.friends || []);
    } catch { /* silent */ }
  }, [initData]);

  return {
    gameState,
    missions,
    setMissions,
    isLoading,
    tapToroid,
    startMission,
    claimMission,
    completeTutorial,
    applyReferral,
    claimDaily,
    dailyRewardAvailable,
    fetchLeaderboard,
    leaderboard,
    userRank,
    activateMultiplier,
    fetchUpgrades,
    buyUpgrade,
    offlineEarnings,
    dismissOfflineEarnings,
    clan,
    createClan,
    joinClan,
    leaveClan,
    fetchClanLeaderboard,
    clanLeaderboard,
    verifyMission,
    spinWheel,
    canSpinFree,
    friends,
    fetchFriends,
    achievements,
    achievementCounts,
    fetchAchievements,
    claimAchievement,
    newAchievementQueue,
    dismissAchievementNotification,
    processNewAchievements,
  };
};
