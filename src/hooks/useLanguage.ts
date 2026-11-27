import { useState, useCallback, useEffect } from 'react';

export type Language = 'en' | 'es';

const STORAGE_KEY = 'ace-flow-lang';

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.planet': 'Energy',
    'nav.mine': 'Mine & Games',
    'nav.upgrades': 'Upgrades',
    'nav.network': 'Network',
    'nav.airdrop': 'Airdrop',
    'stamina.label': 'STAMINA',
    'energy.label': 'ENERGY',
    'mine.title': 'MINING PLATFORM',
    'mine.subtitle': 'Zero-Point Drilling Platform',
    'mine.back': 'Energy',
    'mine.tap_instruction': 'Activate the drill to extract Zero-Point Energy',
    'mine.no_stamina': 'No Stamina. Wait for auto-recharge (+1/min)',
    'mine.challenge': 'EXTRACTION CHALLENGE',
    'mine.challenge_done': 'Challenge complete. Keep mining to maintain combo.',
    'mine.challenge_todo': 'Complete 30 taps to master the core.',
    'mine.energy_store': 'NEUTRINO INJECTION',
    'mine.boost': 'ENERGY BOOST',
    'mine.boost_desc': 'Doubles your mining',
    'mine.guest_hint': 'Trial mode: progress is not saved. Create an account to buy and claim.',
    'mine.games_title': 'GAMES ARENA',
    'mine.games_desc': '6 minigames · Play and earn energy',
    'mine.games_play': 'PLAY',
    'mine.games_back': 'Mine',
    'mine.games_back_hint': 'Back to mining',
    'guest.trial': 'Trial mode · Create account',
    'guest.create_account': 'Create your account to unlock this building',
    'guest.save_score': 'Create your account to save your score and earn energy',
    'guest.buy_energy': 'Create your account to buy energy',
    'guest.buy_boost': 'Create your account to activate the boost',
    'loading.ace': 'Loading ACE FLOW...',
    'loading.sync': 'Syncing Neutrinos...',
    'offline.welcome': 'WELCOME BACK!',
    'offline.desc': 'Your mines generated energy while you were away',
    'offline.great': 'AWESOME!',
    'logout': 'Logout',
  },
  es: {
    'nav.planet': 'Energía',
    'nav.mine': 'Mina y Juegos',
    'nav.upgrades': 'Mejoras',
    'nav.network': 'Red',
    'nav.airdrop': 'Airdrop',
    'stamina.label': 'STAMINA',
    'energy.label': 'ENERGÍA',
    'mine.title': 'PLATAFORMA DE MINADO',
    'mine.subtitle': 'Plataforma de Perforación Punto Cero',
    'mine.back': 'Energía',
    'mine.tap_instruction': 'Activa el taladro para extraer Energía Punto Cero',
    'mine.no_stamina': 'Sin Stamina. Espera recarga automática (+1/min)',
    'mine.challenge': 'RETO DE EXTRACCIÓN',
    'mine.challenge_done': 'Reto completado. Sigue minando para mantener el combo.',
    'mine.challenge_todo': 'Completa 30 taps para dominar el núcleo.',
    'mine.energy_store': 'INYECCIÓN DE NEUTRINOS',
    'mine.boost': 'BOOST DE ENERGÍA',
    'mine.boost_desc': 'Duplica tu minado',
    'mine.guest_hint': 'Modo prueba: tu progreso no se guarda. Crea una cuenta para comprar y reclamar.',
    'mine.games_title': 'ARENA DE JUEGOS',
    'mine.games_desc': '6 minijuegos · Juega y gana energía',
    'mine.games_play': 'JUGAR',
    'mine.games_back': 'Mina',
    'mine.games_back_hint': 'Volver a minar',
    'guest.trial': 'Modo prueba · Crear cuenta',
    'guest.create_account': 'Crea tu cuenta para desbloquear este edificio',
    'guest.save_score': 'Crea tu cuenta para guardar tu puntuación y ganar energía',
    'guest.buy_energy': 'Crea tu cuenta para comprar energía',
    'guest.buy_boost': 'Crea tu cuenta para activar el boost',
    'loading.ace': 'Cargando ACE FLOW...',
    'loading.sync': 'Sincronizando Neutrinos...',
    'offline.welcome': '¡BIENVENIDO DE VUELTA!',
    'offline.desc': 'Tus minas generaron energía mientras estabas fuera',
    'offline.great': '¡GENIAL!',
    'logout': 'Salir',
  },
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored === 'en' || stored === 'es' ? stored : 'es';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'es' ? 'en' : 'es'));
  }, []);

  const setLang = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] ?? key;
  }, [language]);

  return { language, toggleLanguage, setLang, t };
};
