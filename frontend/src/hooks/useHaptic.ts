import { useIsMobile } from './use-mobile';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 50,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [50, 100, 50],
};

export function useHaptic() {
  const isMobile = useIsMobile();

  const triggerHaptic = (pattern: HapticPattern = 'light') => {
    if (!isMobile || !navigator.vibrate) return;

    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  };

  return { triggerHaptic, isSupported: !!navigator.vibrate };
}
