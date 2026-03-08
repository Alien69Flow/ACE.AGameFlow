import { useEffect, useState, useCallback } from 'react';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [initData, setInitData] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
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
      // Not in Telegram - mark as ready but no initData so landing shows
      console.warn('Not in Telegram WebApp - showing landing state');
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
