import { useEffect, useState, useCallback } from 'react';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [initData, setInitData] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Store the full initData for server-side validation
      setInitData(tg.initData);
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setUserId(user.id.toString());
        setUsername(user.username || user.first_name);
      }
      setIsReady(true);
    } else {
      // Not in Telegram WebApp - app won't function without Telegram
      console.warn('This app requires Telegram WebApp to function');
      setInitData(null);
      setUserId(null);
      setUsername(null);
      setIsReady(false);
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
    isTelegram: !!window.Telegram?.WebApp,
  };
};
