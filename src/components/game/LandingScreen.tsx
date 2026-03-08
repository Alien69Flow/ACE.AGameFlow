import { motion } from 'framer-motion';

const RINGS = [
  { size: 600, opacity: 0.08, delay: 0 },
  { size: 480, opacity: 0.12, delay: 0.1 },
  { size: 360, opacity: 0.16, delay: 0.2 },
  { size: 240, opacity: 0.22, delay: 0.3 },
  { size: 120, opacity: 0.3, delay: 0.4 },
];

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  size: 1 + Math.random() * 3,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 3,
  isGold: i % 5 === 0,
}));

const STATS = [
  { label: '3.14M+', sub: 'MINERS' },
  { label: '∞', sub: 'ENERGY' },
  { label: 'TON', sub: 'NETWORK' },
];

export const LandingScreen = () => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Scan lines overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.1) 2px, hsl(var(--primary) / 0.1) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Radar system */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Crosshair lines */}
        <motion.div
          className="absolute w-[700px] h-px bg-primary/10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.div
          className="absolute w-px h-[700px] bg-primary/10"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        {/* Diagonal crosshairs */}
        <motion.div
          className="absolute w-[500px] h-px bg-primary/5 rotate-45"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />
        <motion.div
          className="absolute w-[500px] h-px bg-primary/5 -rotate-45"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />

        {/* Concentric rings */}
        {RINGS.map((ring) => (
          <motion.div
            key={ring.size}
            className="absolute rounded-full border border-primary"
            style={{
              width: ring.size,
              height: ring.size,
              opacity: 0,
              borderColor: `hsl(var(--primary) / ${ring.opacity})`,
            }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: ring.delay }}
          />
        ))}

        {/* Radar sweep */}
        <motion.div
          className="absolute"
          style={{
            width: 600,
            height: 600,
            background: 'conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.2) 20deg, hsl(var(--primary) / 0.05) 40deg, transparent 60deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.isGold ? 'bg-secondary/50' : 'bg-primary/40'}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.15, 0.7, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: 'spring', stiffness: 150 }}
          className="relative"
        >
          {/* Glow behind logo */}
          <motion.div
            className="absolute -inset-4 rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)' }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Pulsing ring */}
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-primary/40"
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-primary/60 relative box-glow">
            <img
              src="/ACE.jpg"
              alt="AlienFlow Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-display text-5xl md:text-6xl font-black text-primary text-glow tracking-[0.25em]">
            ALIENFLOW
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-3 tracking-[0.3em] uppercase">
            Zero Point Energy Mining Neutrino Protocol
          </p>
        </motion.div>

        {/* Stats ticker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="flex items-center justify-center gap-6 md:gap-8"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <span className="font-display text-lg md:text-xl font-bold text-secondary text-glow-gold">
                {stat.label}
              </span>
              <span className="block font-body text-[10px] text-muted-foreground tracking-widest mt-0.5">
                {stat.sub}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.a
          href="https://t.me/Alien69Bot"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6, type: 'spring', stiffness: 120 }}
          className="relative group mt-2 w-full max-w-xs"
        >
          {/* Outer glow */}
          <motion.div
            className="absolute -inset-3 rounded-2xl blur-2xl"
            style={{ background: 'hsl(var(--primary) / 0.2)' }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          {/* Inner glow ring */}
          <motion.div
            className="absolute -inset-px rounded-2xl border border-primary/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative px-8 py-6 rounded-2xl border-2 border-primary bg-card/90 backdrop-blur-md 
                          hover:bg-primary/10 transition-all duration-300 box-glow text-center">
            <span className="font-display text-xl md:text-2xl font-black text-primary text-glow tracking-wider block">
              INITIALIZE
            </span>
            <span className="font-body text-xs text-muted-foreground mt-1.5 tracking-[0.2em] block">
              OPEN IN TELEGRAM LINK
            </span>
          </div>
        </motion.a>

        {/* Social row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="flex items-center gap-5 mt-2"
        >
          {[
            { label: 'TG', href: 'https://t.me/Alien69Bot', icon: '✦' },
            { label: 'X', href: 'https://x.com', icon: '✧' },
            { label: 'IG', href: 'https://instagram.com', icon: '◈' },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group"
            >
              <span className="text-lg text-primary/50 group-hover:text-primary transition-colors duration-300">
                {social.icon}
              </span>
              <span className="font-body text-[9px] text-muted-foreground tracking-widest group-hover:text-primary/70 transition-colors duration-300">
                {social.label}
              </span>
            </a>
          ))}
        </motion.div>

        {/* Bottom tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="font-body text-[10px] text-muted-foreground/50 text-center tracking-widest mt-1"
        >
          QUANTUM MINING v0.1 — TON BLOCKCHAIN
        </motion.p>
      </div>
    </div>
  );
};
