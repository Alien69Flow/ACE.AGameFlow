import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
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

type Screen = 'planet' | 'mine' | 'network';

// Mission definitions
const MISSIONS = [
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/Alien69Flow', icon: '📘', reward: 50 },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/alien69flow/', icon: '📸', reward: 50 },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/company/alienflowspace', icon: '💼', reward: 50 },
  { id: 'telegram', name: 'Telegram', url: 'https://t.me/AlienFlow', icon: '✈️', reward: 50 },
  { id: 'twitter', name: 'X (Twitter)', url: 'https://x.com/alien69flow', icon: '🐦', reward: 50 },
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
  } = useGameState();
  const { isMuted, toggleMute, playTapSound, playClaimSound, playNavigateSound } = useAudio();

  const [currentScreen, setCurrentScreen] = useState<Screen>('planet');
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

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

  // Game loading (Telegram but fetching profile)
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
        {currentScreen === 'network' && (
          <NetworkScreen
            key="network"
            missions={missions}
            onStartMission={handleStartMission}
            onClaimMission={handleClaimMission}
            openLink={openLink}
            referralCode={gameState.referralCode}
            referralCount={gameState.referralCount}
            hasReferred={gameState.hasReferred}
            onApplyReferral={applyReferral}
            leaderboard={leaderboard}
            userRank={userRank}
            onFetchLeaderboard={fetchLeaderboard}
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
