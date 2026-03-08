import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTelegram } from '@/hooks/useTelegram';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { StaminaBar } from '@/components/game/StaminaBar';
import { Navigation } from '@/components/game/Navigation';
import { Tutorial } from '@/components/game/Tutorial';
import { LandingScreen } from '@/components/game/LandingScreen';
import { PlanetScreen } from '@/screens/PlanetScreen';
import { MineScreen } from '@/screens/MineScreen';
import { NetworkScreen } from '@/screens/NetworkScreen';
import { UpgradesScreen } from '@/screens/UpgradesScreen';
import { AirdropScreen } from '@/screens/AirdropScreen';
import { Zap } from 'lucide-react';

type Screen = 'planet' | 'mine' | 'network' | 'upgrades' | 'airdrop';

const MISSIONS = [
  // Auto-verified missions (double reward)
  { id: 'tg_channel', name: 'Unirse al Canal', url: 'https://t.me/AlienFlow', icon: '✈️', reward: 100, verifiable: true, verifyType: 'telegram_channel' as const },
  { id: 'tg_group', name: 'Unirse al Grupo', url: 'https://t.me/AlienFlowChat', icon: '💬', reward: 100, verifiable: true, verifyType: 'telegram_channel' as const },
  { id: 'x_follow', name: 'Seguir en X', url: 'https://x.com/alien69flow', icon: '🐦', reward: 100, verifiable: true, verifyType: 'x_follow' as const },
  // Standard missions
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/Alien69Flow', icon: '📘', reward: 50, verifiable: false, verifyType: null },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/alien69flow/', icon: '📸', reward: 50, verifiable: false, verifyType: null },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/company/alienflowspace', icon: '💼', reward: 50, verifiable: false, verifyType: null },
  { id: 'twitter', name: 'X (Twitter)', url: 'https://x.com/alien69flow', icon: '🐦', reward: 50, verifiable: false, verifyType: null },
];

const Index = () => {
  const { isReady, isTelegram, openLink, hapticFeedback } = useTelegram();
  const { 
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
  } = useGameState();
  const { isMuted, toggleMute, playTapSound, playClaimSound, playNavigateSound } = useAudio();

  const [currentScreen, setCurrentScreen] = useState<Screen>('planet');
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Initialize missions
  useEffect(() => {
    setMissions(MISSIONS.map(m => ({
      ...m,
      startedAt: null,
      completedAt: null,
      claimed: false,
    })));
  }, [setMissions]);

  // Start tutorial if not completed
  useEffect(() => {
    if (!isLoading && isTelegram && !gameState.tutorialCompleted) {
      setTutorialStep(0);
    }
  }, [isLoading, isTelegram, gameState.tutorialCompleted]);

  // Show offline earnings modal
  useEffect(() => {
    if (offlineEarnings > 0 && !isLoading) {
      setShowOfflineModal(true);
    }
  }, [offlineEarnings, isLoading]);

  const handleNavigate = useCallback((screen: Screen) => {
    playNavigateSound();
    setCurrentScreen(screen);
  }, [playNavigateSound]);

  const handleEnterMine = useCallback(() => {
    playNavigateSound();
    setCurrentScreen('mine');
    if (tutorialStep === 1) {
      setTutorialStep(2);
    }
  }, [playNavigateSound, tutorialStep]);

  const handleTap = useCallback(async () => {
    const success = await tapToroid();
    if (success) {
      playTapSound();
      hapticFeedback('medium');
    }
    return success;
  }, [tapToroid, playTapSound, hapticFeedback]);

  const handleStartMission = useCallback((missionId: string) => {
    startMission(missionId);
  }, [startMission]);

  const handleClaimMission = useCallback((missionId: string, reward: number) => {
    const success = claimMission(missionId, reward);
    if (success) {
      playClaimSound();
      hapticFeedback('heavy');
    }
  }, [claimMission, playClaimSound, hapticFeedback]);

  const handleTutorialNext = useCallback(() => {
    if (tutorialStep !== null) {
      setTutorialStep(prev => (prev !== null ? prev + 1 : null));
    }
  }, [tutorialStep]);

  const handleTutorialComplete = useCallback(() => {
    setTutorialStep(null);
    completeTutorial();
  }, [completeTutorial]);

  // Loading state
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-primary text-glow">Cargando AlienFlow...</p>
        </div>
      </div>
    );
  }

  // Landing state for non-Telegram browsers
  if (!isTelegram) {
    return <LandingScreen />;
  }

  // Game loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-primary text-glow">Sincronizando Neutrinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Stamina Bar */}
      <StaminaBar 
        stamina={gameState.stamina} 
        maxStamina={gameState.maxStamina} 
        energy={gameState.energy}
        multiplier={gameState.multiplier}
        multiplierExpiresAt={gameState.multiplierExpiresAt}
      />

      {/* Offline Earnings Modal */}
      <AnimatePresence>
        {showOfflineModal && offlineEarnings > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-card border border-primary/40 rounded-2xl p-6 w-full max-w-sm text-center space-y-4 box-glow"
            >
              <h2 className="font-display text-xl font-bold text-primary text-glow">
                ¡BIENVENIDO DE VUELTA!
              </h2>
              <p className="font-body text-xs text-muted-foreground">
                Tus minas generaron energía mientras estabas fuera
              </p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex items-center justify-center gap-2"
              >
                <Zap className="w-8 h-8 text-secondary" />
                <span className="font-display text-3xl font-bold text-secondary text-glow-gold">
                  +{offlineEarnings.toLocaleString()}
                </span>
              </motion.div>
              <motion.button
                onClick={() => { setShowOfflineModal(false); dismissOfflineEarnings(); }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 rounded-xl bg-primary/20 border border-primary/40 font-display text-sm text-primary hover:bg-primary/30 transition-colors"
              >
                ¡GENIAL!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentScreen === 'planet' && (
          <PlanetScreen 
            key="planet"
            onEnterMine={handleEnterMine} 
            tutorialStep={tutorialStep}
            dailyRewardAvailable={dailyRewardAvailable}
            dailyStreak={gameState.dailyStreak}
            onClaimDaily={claimDaily}
            onSpinWheel={spinWheel}
            canSpinFree={canSpinFree}
          />
        )}
        {currentScreen === 'mine' && (
          <MineScreen
            key="mine"
            onTap={handleTap}
            onBack={() => handleNavigate('planet')}
            stamina={gameState.stamina}
            tutorialStep={tutorialStep}
            multiplier={gameState.multiplier}
            multiplierExpiresAt={gameState.multiplierExpiresAt}
            onActivateMultiplier={activateMultiplier}
          />
        )}
        {currentScreen === 'upgrades' && (
          <UpgradesScreen
            key="upgrades"
            energy={gameState.energy}
            onFetchUpgrades={fetchUpgrades}
            onBuyUpgrade={buyUpgrade}
          />
        )}
        {currentScreen === 'network' && (
          <NetworkScreen
            key="network"
            missions={missions}
            onStartMission={handleStartMission}
            onClaimMission={handleClaimMission}
            onVerifyMission={verifyMission}
            openLink={openLink}
            referralCode={gameState.referralCode}
            referralCount={gameState.referralCount}
            hasReferred={gameState.hasReferred}
            onApplyReferral={applyReferral}
            leaderboard={leaderboard}
            userRank={userRank}
            onFetchLeaderboard={fetchLeaderboard}
            clan={clan}
            clanId={gameState.clanId}
            onCreateClan={createClan}
            onJoinClan={joinClan}
            onLeaveClan={leaveClan}
            clanLeaderboard={clanLeaderboard}
            onFetchClanLeaderboard={fetchClanLeaderboard}
            friends={friends}
            onFetchFriends={fetchFriends}
          />
        )}
        {currentScreen === 'airdrop' && (
          <AirdropScreen
            key="airdrop"
            energy={gameState.energy}
            referralCount={gameState.referralCount}
            dailyStreak={gameState.dailyStreak}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* Tutorial Overlay */}
      {tutorialStep !== null && (
        <Tutorial
          step={tutorialStep}
          onNext={handleTutorialNext}
          onComplete={handleTutorialComplete}
        />
      )}
    </div>
  );
};

export default Index;
