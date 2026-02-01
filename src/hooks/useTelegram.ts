import { useEffect, useState, useCallback } from 'react';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setUserId(user.id.toString());
        setUsername(user.username || user.first_name);
      }
      setIsReady(true);
    } else {
      // Development mode - simulate Telegram user
      setUserId('dev_user_123');
      setUsername('AlienDev');
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
    userId,
    username,
    hapticFeedback,
    openLink,
    isTelegram: !!window.Telegram?.WebApp,
  };
};
