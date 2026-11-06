import { useState, useRef, useCallback } from 'react';

export const GUEST_MAX_STAMINA = 100;

export const useGuestPlay = () => {
  const [stamina, setStamina] = useState(GUEST_MAX_STAMINA);
  const [energy, setEnergy] = useState(0);
  const staminaRef = useRef(GUEST_MAX_STAMINA);
  const energyRef = useRef(0);

  const tap = useCallback(async () => {
    if (staminaRef.current <= 0) return false;
    staminaRef.current -= 1;
    energyRef.current += 1;
    setStamina(staminaRef.current);
    setEnergy(energyRef.current);
    return true;
  }, []);

  return { stamina, energy, tap };
};
