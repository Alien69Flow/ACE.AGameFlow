import { motion } from 'framer-motion';

export const LandingScreen = () => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Radar sweep animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-primary/10 absolute" />
        <div className="w-[400px] h-[400px] rounded-full border border-primary/15 absolute" />
        <div className="w-[200px] h-[200px] rounded-full border border-primary/20 absolute" />
        <motion.div
          className="w-[600px] h-[600px] absolute"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, hsl(108 100% 54% / 0.15) 30deg, transparent 60deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Logo / Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-display text-4xl md:text-5xl font-black text-primary text-glow tracking-widest">
            ALIENFLOW
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2 tracking-wider">
            ZERO POINT ENERGY MINING PROTOCOL
          </p>
        </motion.div>

        {/* Neon CTA Button */}
        <motion.a
          href="https://t.me/Alien69Bot"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative group"
        >
          {/* Glow ring */}
          <motion.div
            className="absolute -inset-2 rounded-2xl bg-primary/20 blur-xl"
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative px-8 py-5 rounded-2xl border-2 border-primary bg-card/80 backdrop-blur-sm 
                          hover:bg-primary/10 transition-all duration-300 box-glow">
            <span className="font-display text-base md:text-lg font-bold text-primary text-glow tracking-wider">
              INITIALIZE NEUTRINO LINK
            </span>
            <span className="block font-body text-xs text-muted-foreground mt-1 tracking-wider">
              (TELEGRAM)
            </span>
          </div>
        </motion.a>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-body text-xs text-muted-foreground text-center max-w-xs"
        >
          Abre en Telegram para acceder al protocolo de minería cuántica
        </motion.p>
      </div>
    </div>
  );
};
