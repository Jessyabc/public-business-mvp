import { motion } from 'framer-motion';

interface OrbitalBackgroundProps {
  mode: 'public' | 'business' | 'workspace';
}

export function OrbitalBackground({ mode }: OrbitalBackgroundProps) {
  // Workspace mode: Warm neumorphic sanctuary with PB blue ambient glow
  // The "innermost layer" - private, warm, but clearly PB
  if (mode === 'workspace') {
    return (
      <div 
        className="pointer-events-none fixed inset-0 -z-50"
        style={{
          // Warmer base than business - sanctuary feel
          background: '#EDE8E3'
        }}
      >
        {/* Warm center gradient - like soft light from above */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255,252,245,0.6) 0%, transparent 60%)'
          }}
        />
        
        {/* PB Blue ambient glow at edges - you're still in PB */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 0% 0%, rgba(72, 159, 227, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 100% 0%, rgba(72, 159, 227, 0.06) 0%, transparent 45%),
              radial-gradient(ellipse at 100% 100%, rgba(72, 159, 227, 0.07) 0%, transparent 50%),
              radial-gradient(ellipse at 0% 100%, rgba(72, 159, 227, 0.05) 0%, transparent 45%)
            `
          }}
        />
        
        {/* Paper texture overlay - warmth and intimacy */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url(/noise.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
        
        {/* Soft vignette - cozy, focused */}
        <div 
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 250px rgba(140, 125, 110, 0.12)'
          }}
        />
      </div>
    );
  }

  // Business mode: Crisp, neutral neumorphic surface
  // The "middle layer" - professional, focused, structured
  if (mode === 'business') {
    return (
      <div 
        className="pointer-events-none fixed inset-0 -z-50 transition-colors duration-[800ms]"
        style={{
          // Cooler, more neutral than workspace - professional feel
          background: '#E6E4E2'
        }}
      >
        {/* Clean top-down light gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 30%, rgba(200,195,190,0.1) 100%)'
          }}
        />
        
        {/* Subtle PB Blue accent in corners - brand presence */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 0% 0%, rgba(72, 159, 227, 0.04) 0%, transparent 40%),
              radial-gradient(ellipse at 100% 100%, rgba(72, 159, 227, 0.03) 0%, transparent 35%)
            `
          }}
        />
        
        {/* Paper texture overlay - subtle */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'url(/noise.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
        
        {/* Light vignette - professional focus */}
        <div 
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 200px rgba(160, 155, 150, 0.08)'
          }}
        />
      </div>
    );
  }

  // Public mode: Animated orbital orbs (space-inspired)
  const publicOrbs = [
    // Central warping orb - more defined
    {
      size: 700,
      top: '50%',
      left: '50%',
      color: 'rgba(72, 159, 227, 0.55)', // PB Blue - stronger
      blur: 40,
      duration: 25,
      x: [-20, 20, -20],
      y: [-20, 20, -20],
      scale: [1, 1.15, 1],
    },
    {
      size: 600,
      top: '10%',
      left: '5%',
      color: 'rgba(72, 159, 227, 0.40)', // PB Blue
      blur: 80,
      duration: 16,
      x: [-40, 40, -40],
      y: [-60, 60, -60],
    },
    {
      size: 500,
      top: '15%',
      right: '8%',
      color: 'rgba(103, 255, 216, 0.30)', // PB Aqua
      blur: 80,
      duration: 19,
      x: [50, -50, 50],
      y: [-40, 70, -40],
    },
    {
      size: 550,
      bottom: '10%',
      left: '10%',
      color: 'rgba(255, 200, 91, 0.28)', // PB Gold
      blur: 80,
      duration: 17,
      x: [-60, 60, -60],
      y: [40, -50, 40],
    },
    {
      size: 650,
      top: '40%',
      left: '50%',
      color: 'rgba(254, 94, 180, 0.22)', // Magenta
      blur: 80,
      duration: 20,
      x: [-70, 70, -70],
      y: [-80, 80, -80],
    },
    {
      size: 480,
      bottom: '15%',
      right: '12%',
      color: 'rgba(72, 159, 227, 0.35)', // PB Blue variant
      blur: 80,
      duration: 15,
      x: [60, -60, 60],
      y: [-50, 50, -50],
    },
  ];

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden transition-colors duration-[800ms]"
      style={{ backgroundColor: '#020617' }}
    >
      {/* Animated orbital gradient orbs */}
      <div 
        className="absolute inset-0" 
        style={{ mixBlendMode: 'screen' }}
      >
        {publicOrbs.map((orb, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              top: orb.top,
              bottom: orb.bottom,
              left: orb.left,
              right: orb.right,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: `blur(${orb.blur}px)`,
              ...(orb.left === '50%' && orb.top === '50%' && { 
                transform: 'translate(-50%, -50%)',
              }),
            }}
            animate={{
              x: orb.x,
              y: orb.y,
              scale: (orb as any).scale || 1,
            }}
            transition={{
              duration: orb.duration,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>
    </div>
  );
}
