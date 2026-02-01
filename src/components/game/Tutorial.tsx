import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface TutorialProps {
  step: number;
  onNext: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    title: "Bienvenido Alien",
    message: "Este es el Planeta Tierra Nivel 0. Tu misión es extraer Energía Punto Cero del núcleo terrestre.",
    highlight: null,
  },
  {
    title: "Core Mina",
    message: "Pulsa en la Core Mina para entrar al núcleo de energía gravitatoria.",
    highlight: "core-mina",
  },
  {
    title: "Extrae Energía",
    message: "En la Mina, pulsa el Toroide para extraer Energía Punto Cero. Cada tap consume 1 Stamina.",
    highlight: "toroid",
  },
];

export const Tutorial = ({ step, onNext, onComplete }: TutorialProps) => {
  const currentStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;

  if (!currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center pb-24"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        {/* Tutorial card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="relative z-10 mx-4 max-w-sm w-full"
        >
          <div className="bg-card border border-primary/30 rounded-2xl p-6 box-glow">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-4">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === step
                      ? 'bg-primary w-6'
                      : index < step
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="font-display text-xl font-bold text-primary text-glow mb-2">
                {currentStep.title}
              </h3>
              <p className="font-body text-foreground/80 mb-4">
                {currentStep.message}
              </p>
            </motion.div>

            {/* Action button */}
            <motion.button
              onClick={isLastStep ? onComplete : onNext}
              className="w-full py-3 px-6 bg-primary text-primary-foreground font-display font-bold rounded-xl
                        flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLastStep ? 'Comenzar' : 'Siguiente'}
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const getTutorialHighlight = (step: number): string | null => {
  return tutorialSteps[step]?.highlight || null;
};
