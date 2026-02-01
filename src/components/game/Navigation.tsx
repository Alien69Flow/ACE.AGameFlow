import { motion } from 'framer-motion';
import { Globe, Pickaxe, Network, Volume2, VolumeX } from 'lucide-react';

type Screen = 'planet' | 'mine' | 'network';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const navItems: { id: Screen; icon: typeof Globe; label: string }[] = [
  { id: 'planet', icon: Globe, label: 'Planeta' },
  { id: 'mine', icon: Pickaxe, label: 'Mina' },
  { id: 'network', icon: Network, label: 'Red' },
];

export const Navigation = ({ currentScreen, onNavigate, isMuted, onToggleMute }: NavigationProps) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
    >
      <div className="bg-card/90 backdrop-blur-lg border border-primary/30 rounded-2xl p-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-glow' : ''}`} />
              <span className={`font-display text-xs relative z-10 ${isActive ? 'text-glow' : ''}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Mute button */}
        <motion.button
          onClick={onToggleMute}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </motion.nav>
  );
};
