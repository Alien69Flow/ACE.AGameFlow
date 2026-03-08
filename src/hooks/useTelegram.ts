import { useEffect, useState, useCallback } from 'react';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [initData, setInitData] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    // SDK is always loaded, so check if we actually have Telegram context
    const hasTelegramContext = !!(tg?.initData && tg.initData.length > 0);
    
    if (hasTelegramContext) {
      tg.ready();
      tg.expand();
      setIsTelegram(true);
      setInitData(tg.initData);
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setUserId(user.id.toString());
        setUsername(user.username || user.first_name);
      }
      setIsReady(true);
    } else {
      // Not in Telegram - show landing page
      console.warn('No Telegram context detected - showing landing state');
      setIsTelegram(false);
      setInitData(null);
      setUserId(null);
      setUsername(null);
      setIsReady(true);
    }
  }, []);

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  }, []);

  const openLink = useCallback((url: string) => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, []);

  return {
    isReady,
    initData,
    userId,
    username,
    hapticFeedback,
    openLink,
    isTelegram,
  };
};
