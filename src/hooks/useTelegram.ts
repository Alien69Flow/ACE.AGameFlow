import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [initData, setInitData] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [webSessionToken, setWebSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
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
      setIsTelegram(false);
      setInitData(null);
      setUserId(null);
      setUsername(null);

      // Check for Supabase web session
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.access_token) {
          setWebSessionToken(data.session.access_token);
          const email = data.session.user?.email;
          if (email) {
            setUserId(data.session.user!.id);
            setUsername(email.split('@')[0]);
          }
        }
        setIsReady(true);
      });

      // Listen for auth state changes
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token) {
          setWebSessionToken(session.access_token);
          const email = session.user?.email;
          if (email) {
            setUserId(session.user!.id);
            setUsername(email.split('@')[0]);
          }
        } else {
          setWebSessionToken(null);
          setUserId(null);
          setUsername(null);
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
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

  const signOutWeb = useCallback(async () => {
    await supabase.auth.signOut();
    setWebSessionToken(null);
    setUserId(null);
    setUsername(null);
  }, []);

  return {
    isReady,
    initData,
    userId,
    username,
    hapticFeedback,
    openLink,
    isTelegram,
    webSessionToken,
    signOutWeb,
  };
};
