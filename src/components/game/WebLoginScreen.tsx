import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Mail, Lock, ArrowLeft, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface WebLoginScreenProps {
  onLogin: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  onBack: () => void;
}

export const WebLoginScreen = ({ onLogin, onBack }: WebLoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password, isSignUp);
      toast.success(isSignUp ? 'Account created!' : 'Welcome back!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, password, isSignUp, onLogin]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(108_100%_54%_/_0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, hsl(108 100% 54% / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(108 100% 54% / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />
        </div>
      </div>

      {/* Back button */}
      <motion.button
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-display text-xs">Volver</span>
      </motion.button>

      {/* Content */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/60 mx-auto mb-4 box-glow">
            <img src="/ACE.jpg" alt="ACE Flow" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary text-glow">
            ACE FLOW
          </h1>
          <p className="font-body text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card/80 border border-primary/30 text-foreground text-sm font-body focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card/80 border border-primary/30 text-foreground text-sm font-body focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-destructive text-xs font-body bg-destructive/10 border border-destructive/30 rounded-lg p-2.5"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl bg-primary/20 border border-primary/50 font-display text-sm text-primary hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">CARGANDO...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                {isSignUp ? 'REGISTRARSE' : 'ENTRAR'}
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle sign up / sign in */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="font-body text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp ? 'Ya tienes cuenta? Inicia sesión' : 'No tienes cuenta? Regístrate'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
