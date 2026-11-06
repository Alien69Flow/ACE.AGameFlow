import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTelegram } from '@/hooks/useTelegram';
import { useGameState } from '@/hooks/useGameState';
import { useGuestPlay, GUEST_MAX_STAMINA } from '@/hooks/useGuestPlay';
import { useAudio } from '@/hooks/useAudio';
import { StaminaBar } from '@/components/game/StaminaBar';
import { Navigation } from '@/components/game/Navigation';
import { Tutorial } from '@/components/game/Tutorial';
import { LandingScreen } from '@/components/game/LandingScreen';
import { WebLoginScreen } from '@/components/game/WebLoginScreen';
import { PlanetScreen } from '@/screens/PlanetScreen';
import { OFFICIAL_LINKS } from '@/lib/ecosystem';
import { MineScreen } from '@/screens/MineScreen';
import { NetworkScreen } from '@/screens/NetworkScreen';
import { UpgradesScreen } from '@/screens/UpgradesScreen';
import { AirdropScreen } from '@/screens/AirdropScreen';
import { MinigamesScreen } from '@/screens/MinigamesScreen';
import { Zap, Trophy, LogOut, Globe } from 'lucide-react';
import { toast } from 'sonner';

// Auto-dismiss achievement toast component
const AchievementToast = ({ achievement, onDismiss }: { achievement: { id: string; name: string; icon: string; reward: number }; onDismiss: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      className="fixed top-20 left-4 right-4 z-[70]"
    >
      <motion.div
        className="bg-card border border-secondary/50 rounded-xl p-3 box-glow-gold flex items-center gap-3 cursor-pointer"
        onClick={onDismiss}
      >
        <span className="text-2xl">{achievement.icon}</span>
        <div className="flex-1">
          <span className="font-display text-xs text-secondary block">🏆 LOGRO DESBLOQUEADO</span>
          <span className="font-display text-sm font-bold text-foreground">{achievement.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4 text-secondary" />
          <span className="font-display text-xs text-secondary">+{achievement.reward}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

type Screen = 'planet' | 'mine' | 'network' | 'upgrades' | 'airdrop' | 'minigames';

const GUEST_LOCKED_SCREENS: Screen[] = ['network', 'upgrades', 'airdrop'];

const MISSIONS = [
  // Verified missions (Telegram membership is checked by the server)
  { id: 'tg_channel', name: 'Unirse al Canal', url: OFFICIAL_LINKS.telegramChannel, icon: '✈️', reward: 100, verifiable: true, verifyType: 'telegram_channel' as const },
  { id: 'tg_group', name: 'Unirse al Grupo', url: OFFICIAL_LINKS.telegramGroup, icon: '💬', reward: 100, verifiable: true, verifyType: 'telegram_channel' as const },
  // Social missions (rewards pending verification)
  { id: 'x_follow', name: 'Seguir en X', url: OFFICIAL_LINKS.x, icon: '🐦', reward: 100, verifiable: false, verifyType: null },
  { id: 'facebook', name: 'Facebook', url: OFFICIAL_LINKS.facebook, icon: '📘', reward: 50, verifiable: false, verifyType: null },
  { id: 'instagram', name: 'Instagram', url: OFFICIAL_LINKS.instagram, icon: '📸', reward: 50, verifiable: false, verifyType: null },
  { id: 'linkedin', name: 'LinkedIn', url: OFFICIAL_LINKS.linkedin, icon: '💼', reward: 50, verifiable: false, verifyType: null },
  { id: 'reddit', name: 'Reddit', url: OFFICIAL_LINKS.reddit, icon: '🔴', reward: 50, verifiable: false, verifyType: null },
  { id: 'tiktok', name: 'TikTok', url: OFFICIAL_LINKS.tiktok, icon: '🎵', reward: 50, verifiable: false, verifyType: null },
  { id: 'threads', name: 'Threads', url: OFFICIAL_LINKS.threads, icon: '🧵', reward: 50, verifiable: false, verifyType: null },
  // DAO ecosystem missions
  { id: 'aitor_visit', name: 'Visitar Aitor.AlienFlow', url: OFFICIAL_LINKS.aitor, icon: '🌐', reward: 50, verifiable: false, verifyType: null },
  { id: 'adex_register', name: 'Registrarse en ADEX', url: OFFICIAL_LINKS.adex, icon: '📊', reward: 100, verifiable: false, verifyType: null },
  { id: 'atrip_join', name: 'Unirse en ATrip', url: OFFICIAL_LINKS.atrip, icon: '🚀', reward: 100, verifiable: false, verifyType: null },
];

const Index = () => {
  const { isReady, isTelegram, openLink, hapticFeedback, webSessionToken, signOutWeb } = useTelegram();
  const [showWebLogin, setShowWebLogin] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const guest = useGuestPlay();
  const isGuest = guestMode && !isTelegram && !webSessionToken;
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
    fetchBuildings,
    buyBuilding,
    arenaBattle,
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
    applyEnergyPack,
    submitMinigameScore,
    minigameScores,
    fetchMinigameScores,
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
    if (!isLoading && (isTelegram || webSessionToken) && !gameState.tutorialCompleted) {
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
    if (isGuest && GUEST_LOCKED_SCREENS.includes(screen)) {
      toast.info('Crea tu cuenta para desbloquear este edificio');
      setShowWebLogin(true);
      return;
    }
    playNavigateSound();
    setCurrentScreen(screen);
  }, [playNavigateSound, isGuest]);

  const handleEnterMine = useCallback(() => {
    playNavigateSound();
    setCurrentScreen('mine');
    if (tutorialStep === 1) {
      setTutorialStep(2);
    }
  }, [playNavigateSound, tutorialStep]);

  const guestSubmitScore = useCallback(async () => {
    toast.info('Crea tu cuenta para guardar tu puntuación y ganar energía');
    return null;
  }, []);

  const handleTap = useCallback(async () => {
    const success = isGuest ? await guest.tap() : await tapToroid();
    if (success) {
      playTapSound();
      hapticFeedback('medium');
    }
    return success;
  }, [tapToroid, guest.tap, isGuest, playTapSound, hapticFeedback]);

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
          <p className="font-display text-primary text-glow">Cargando ACE FLOW...</p>
        </div>
      </div>
    );
  }

  // Landing state for non-Telegram browsers
  if (!isTelegram && !webSessionToken && !showWebLogin && !guestMode) {
    return <LandingScreen onPlayInBrowser={() => setShowWebLogin(true)} onPlayAsGuest={() => setGuestMode(true)} />;
  }

  // Web login screen
  if (!isTelegram && !webSessionToken && showWebLogin) {
    const handleLogin = async (email: string, password: string, isSignUp: boolean) => {
      const { supabase } = await import('@/integrations/supabase/client');
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setGuestMode(false);
      setShowWebLogin(false);
    };
    return <WebLoginScreen onLogin={handleLogin} onBack={() => setShowWebLogin(false)} />;
  }

  // Loading state for web users waiting for session
  if (isLoading && !isGuest) {
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
      {/* Web logout button */}
      {!isTelegram && webSessionToken && (
        <button
          onClick={() => { signOutWeb(); }}
          className="fixed top-2 right-2 z-[65] flex items-center gap-1 px-2 py-1 rounded-lg bg-card/80 border border-muted/30 text-muted-foreground hover:text-foreground hover:border-muted/60 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span className="font-display text-[10px]">Salir</span>
        </button>
      )}

      {/* Stamina Bar */}
      <StaminaBar 
        stamina={isGuest ? guest.stamina : gameState.stamina}
        maxStamina={isGuest ? GUEST_MAX_STAMINA : gameState.maxStamina}
        energy={isGuest ? guest.energy : gameState.energy}
        multiplier={gameState.multiplier}
        multiplierExpiresAt={gameState.multiplierExpiresAt}
        achievementCounts={achievementCounts}
      />

      {isGuest && (
        <button
          onClick={() => setShowWebLogin(true)}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[65] whitespace-nowrap px-3 py-1 rounded-lg bg-card border border-secondary/60 font-display text-[10px] text-secondary hover:bg-secondary/10 transition-colors"
        >
          Modo prueba · Crear cuenta
        </button>
      )}

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

      {/* Achievement Toast — auto-dismiss after 4s */}
      <AnimatePresence>
        {newAchievementQueue.length > 0 && (
          <AchievementToast
            key={newAchievementQueue[0].id}
            achievement={newAchievementQueue[0]}
            onDismiss={dismissAchievementNotification}
          />
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
            energy={gameState.energy}
            onFetchBuildings={fetchBuildings}
            onBuyBuilding={buyBuilding}
            onArenaBattle={arenaBattle}
          />
        )}
        {currentScreen === 'mine' && (
          <MineScreen
            key="mine"
            onTap={handleTap}
            onBack={() => handleNavigate('planet')}
            stamina={isGuest ? guest.stamina : gameState.stamina}
            tutorialStep={tutorialStep}
            multiplier={gameState.multiplier}
            multiplierExpiresAt={gameState.multiplierExpiresAt}
            onActivateMultiplier={activateMultiplier}
            onApplyEnergyPack={applyEnergyPack}
            isGuest={isGuest}
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
            achievements={achievements}
            onFetchAchievements={fetchAchievements}
            onClaimAchievement={claimAchievement}
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
        {currentScreen === 'minigames' && (
          <MinigamesScreen
            key="minigames"
            onSubmitScore={isGuest ? guestSubmitScore : submitMinigameScore}
            minigameScores={minigameScores}
            onFetchScores={fetchMinigameScores}
          />
        )}
      </AnimatePresence>
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
