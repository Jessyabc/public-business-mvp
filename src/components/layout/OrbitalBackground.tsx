import { useAppMode } from '@/contexts/AppModeContext';
import { tokens } from '@/ui/theme/tokens';

export function OrbitalBackground() {
  const { mode } = useAppMode();

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundColor: 'var(--background)',
        backgroundImage: tokens.gradients[mode].background,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    />
  );
}
