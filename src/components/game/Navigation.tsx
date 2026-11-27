import { motion } from 'framer-motion';
import { Zap, Pickaxe, Users, ArrowUpCircle, Rocket, Volume2, VolumeX } from 'lucide-react';

type Screen = 'planet' | 'mine' | 'network' | 'upgrades' | 'airdrop';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const navItems: { id: Screen; icon: typeof Zap; label: string }[] = [
  { id: 'planet', icon: Zap, label: 'Energía' },
  { id: 'mine', icon: Pickaxe, label: 'Mina' },
  { id: 'upgrades', icon: ArrowUpCircle, label: 'Mejoras' },
  { id: 'network', icon: Users, label: 'Red' },
  { id: 'airdrop', icon: Rocket, label: 'Airdrop' },
];

export const Navigation = ({ currentScreen, onNavigate, isMuted, onToggleMute }: NavigationProps) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2"
    >
      <div className="bg-card/90 backdrop-blur-lg border border-primary/30 rounded-xl p-1 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-glow' : ''}`} />
              <span className={`font-display text-[9px] relative z-10 ${isActive ? 'text-glow' : ''}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Mute button */}
        <motion.button
          onClick={onToggleMute}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? (
            <VolumeX className="w-3 h-3" />
          ) : (
            <Volume2 className="w-3 h-3" />
          )}
        </motion.button>
      </div>
    </motion.nav>
  );
};
