import { useAppMode } from '@/contexts/AppModeContext';
import { tokens } from '@/ui/theme/tokens';

export function OrbitalBackground() {
  const { mode } = useAppMode();

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Base gradient layer from tokens */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: tokens.gradients[mode].background,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Animated gradient orbs layer */}
      <div className="absolute inset-0" style={{ mixBlendMode: 'screen' }}>
        {/* Blue orb top left */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-40 blur-[100px] animate-float"
          style={{
            top: '10%',
            left: '5%',
            background: 'radial-gradient(circle, hsl(210, 80%, 60%) 0%, hsl(210, 70%, 40%) 30%, transparent 70%)',
            animationDelay: '0s',
            animationDuration: '25s',
          }}
        />
        
        {/* Orange/Coral orb top right */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-35 blur-[90px] animate-float"
          style={{
            top: '15%',
            right: '8%',
            background: 'radial-gradient(circle, hsl(20, 85%, 65%) 0%, hsl(340, 70%, 55%) 40%, transparent 70%)',
            animationDelay: '3s',
            animationDuration: '28s',
          }}
        />
        
        {/* Cyan orb bottom left */}
        <div 
          className="absolute w-[550px] h-[550px] rounded-full opacity-30 blur-[95px] animate-float"
          style={{
            bottom: '10%',
            left: '10%',
            background: 'radial-gradient(circle, hsl(180, 75%, 55%) 0%, hsl(200, 65%, 45%) 35%, transparent 70%)',
            animationDelay: '6s',
            animationDuration: '30s',
          }}
        />
        
        {/* Purple/Pink orb center */}
        <div 
          className="absolute w-[650px] h-[650px] rounded-full opacity-25 blur-[120px] animate-float"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, hsl(280, 70%, 55%) 0%, hsl(320, 65%, 50%) 30%, transparent 70%)',
            animationDelay: '9s',
            animationDuration: '35s',
          }}
        />
        
        {/* Teal orb bottom right */}
        <div 
          className="absolute w-[480px] h-[480px] rounded-full opacity-35 blur-[85px] animate-float"
          style={{
            bottom: '15%',
            right: '12%',
            background: 'radial-gradient(circle, hsl(170, 70%, 60%) 0%, hsl(190, 60%, 45%) 40%, transparent 70%)',
            animationDelay: '12s',
            animationDuration: '26s',
          }}
        />
      </div>
    </div>
  );
}
