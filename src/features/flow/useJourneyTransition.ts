import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Journey } from './graph';

export const transitionTiming = { camera: 640, reveal: 600, delay: 90, edge: 520, exit: 700, total: 700 };
export const forwardEase = [.22, 1, .36, 1] as const;
export const reverseEase = [.64, 0, .78, 0] as const;
export interface JourneyTransition { serial: number; kind: 'advance' | 'retreat'; journey: Journey; reduced: boolean }
export function useJourneyTransition() {
  const reduced = useReducedMotion();
  const [transition, setTransition] = useState<JourneyTransition | null>(null);
  const locked = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined), serial = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const cancel = () => { clearTimeout(timer.current); locked.current = false; setTransition(null); };
  const begin = (kind: JourneyTransition['kind'], journey: Journey) => {
    if (locked.current) return false;
    locked.current = true;
    setTransition({ serial: ++serial.current, kind, journey, reduced: Boolean(reduced) });
    timer.current = setTimeout(() => { locked.current = false; setTransition(null); }, reduced ? 0 : kind === 'advance' ? transitionTiming.total : transitionTiming.exit);
    return true;
  };
  return { transition, begin, cancel };
}