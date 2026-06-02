import { useState, useEffect } from 'react';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function useCountdown(targetDate: string): Countdown {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1000);
    return { days, hours, minutes, seconds, isExpired: false };
  };

  const [state, setState] = useState(calc);

  useEffect(() => {
    setState(calc());
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return state;
}
