import { motion } from 'framer-motion';

const RINGS = [
  { size: 640, opacity: 0.06, delay: 0 },
  { size: 500, opacity: 0.10, delay: 0.1 },
  { size: 370, opacity: 0.15, delay: 0.2 },
  { size: 250, opacity: 0.22, delay: 0.3 },
  { size: 140, opacity: 0.32, delay: 0.4 },
];

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 8 + Math.random() * 84,
  y: 8 + Math.random() * 84,
  size: 1 + Math.random() * 3,
  duration: 3 + Math.random() * 5,
  delay: Math.random() * 3,
  isGold: i % 4 === 0,
}));

const STATS = [
  { label: '3.14M+', sub: 'MINERS' },
  { label: '∞', sub: 'ENERGY' },
  { label: 'TON', sub: 'BLOCKCHAIN' },
];

const PRIMARY_SOCIALS = [
  { label: 'TELEGRAM', href: 'https://t.me/AlienFlow', icon: '⬡' },
  { label: 'X', href: 'https://x.com/alien69flow', icon: '✧' },
  { label: 'WEBSITE', href: 'https://alienflow.space', icon: '◈' },
  { label: 'DISCORD', href: '#', icon: '⬢', soon: true },
];

const SECONDARY_SOCIALS = [
  { label: 'IG', href: 'https://instagram.com/alien69flow' },
  { label: 'FB', href: 'https://facebook.com/Alien69Flow' },
  { label: 'REDDIT', href: 'https://reddit.com/u/Alien69Flow' },
  { label: 'GITHUB', href: 'https://github.com/Alien69Flow' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/company/alienflow' },
  { label: 'TIKTOK', href: 'https://tiktok.com/@alien69flow' },
  { label: 'THREADS', href: 'https://threads.net/@alien69flow' },
  { label: 'FARCASTER', href: 'https://warpcast.com/alien69flow' },
  { label: 'DORA', href: 'https://dorahacks.io/org/alien69flow' },
  { label: 'GITBOOK', href: '#', soon: true },
  { label: 'HACKMD', href: 'https://hackmd.io/@Alien69Flow' },
];

export const LandingScreen = () => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.1) 2px, hsl(var(--primary) / 0.1) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Radar system */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Crosshairs */}
        <motion.div className="absolute w-[700px] h-px bg-primary/10" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        <motion.div className="absolute w-px h-[700px] bg-primary/10" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        <motion.div className="absolute w-[500px] h-px bg-primary/5 rotate-45" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.4 }} />
        <motion.div className="absolute w-[500px] h-px bg-primary/5 -rotate-45" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.4 }} />

        {/* Concentric rings */}
        {RINGS.map((ring) => (
          <motion.div
            key={ring.size}
            className="absolute rounded-full border border-primary"
            style={{ width: ring.size, height: ring.size, opacity: 0, borderColor: `hsl(var(--primary) / ${ring.opacity})` }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: ring.delay }}
          />
        ))}

        {/* Radar sweep — circular mask */}
        <motion.div
          className="absolute rounded-full overflow-hidden"
          style={{ width: 640, height: 640 }}
        >
          <motion.div
            className="w-full h-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.18) 15deg, hsl(var(--primary) / 0.06) 35deg, transparent 55deg)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Afterglow pulse */}
        <motion.div
          className="absolute rounded-full border border-primary/10"
          style={{ width: 640, height: 640 }}
          animate={{ scale: [1, 1.03, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.isGold ? 'bg-secondary/50' : 'bg-primary/40'}`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -25, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-4 max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: 'spring', stiffness: 150 }}
          className="relative"
        >
          <motion.div
            className="absolute -inset-4 rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)' }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-primary/40"
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-primary/60 relative box-glow">
            <img src="/ACE.jpg" alt="AlienFlow Logo" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <h1
            className="text-6xl md:text-7xl font-black text-primary text-glow tracking-[0.15em]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            ALIENFLOW
          </h1>
          <p
            className="text-[11px] md:text-xs text-muted-foreground mt-3 tracking-[0.25em] uppercase"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            ZERO-POINT ENERGY MINING · NEUTRINO PROTOCOL
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="flex items-center justify-center gap-8"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <span
                className="text-xl md:text-2xl font-bold text-secondary text-glow-gold"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {stat.label}
              </span>
              <span
                className="block text-[9px] text-muted-foreground tracking-[0.3em] mt-0.5"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                {stat.sub}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.a
          href="https://t.me/Alien69Bot"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6, type: 'spring', stiffness: 120 }}
          className="relative group mt-1 w-full max-w-xs"
        >
          <motion.div
            className="absolute -inset-3 rounded-2xl blur-2xl"
            style={{ background: 'hsl(var(--primary) / 0.2)' }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute -inset-px rounded-2xl border border-primary/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative px-8 py-5 rounded-2xl border-2 border-primary bg-card/90 backdrop-blur-md hover:bg-primary/10 transition-all duration-300 box-glow text-center">
            <span
              className="text-2xl md:text-3xl font-black text-primary text-glow tracking-wider block"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              ENTER THE GRID
            </span>
            <span
              className="text-[10px] text-muted-foreground mt-1 tracking-[0.2em] block"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              INITIALIZE VIA TELEGRAM
            </span>
          </div>
        </motion.a>

        {/* Primary socials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="flex items-center justify-center gap-4 mt-1 flex-wrap"
        >
          {PRIMARY_SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.soon ? undefined : s.href}
              target={s.soon ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-0.5 group ${s.soon ? 'opacity-30 cursor-default' : ''}`}
            >
              <span className="text-base text-primary/60 group-hover:text-primary transition-colors">{s.icon}</span>
              <span
                className="text-[8px] text-muted-foreground tracking-[0.2em] group-hover:text-primary/70 transition-colors"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                {s.label}{s.soon ? ' ⏳' : ''}
              </span>
            </a>
          ))}
        </motion.div>

        {/* Secondary socials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="flex items-center justify-center gap-3 flex-wrap max-w-xs"
        >
          {SECONDARY_SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.soon ? undefined : s.href}
              target={s.soon ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={`text-[7px] tracking-[0.15em] transition-colors ${
                s.soon
                  ? 'text-muted-foreground/30 cursor-default'
                  : 'text-muted-foreground/60 hover:text-primary/70'
              }`}
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {s.label}{s.soon ? ' ⏳' : ''}
            </a>
          ))}
        </motion.div>

        {/* Bottom tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="text-[9px] text-muted-foreground/40 text-center tracking-[0.2em] mt-0"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          ALIENFLOW v0.1 · TON BLOCKCHAIN · DAO POWERED
        </motion.p>
      </div>
    </div>
  );
};
