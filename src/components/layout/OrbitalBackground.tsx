import { motion } from 'framer-motion';

interface OrbitalBackgroundProps {
  mode: 'public' | 'business';
}

export function OrbitalBackground({ mode }: OrbitalBackgroundProps) {
  const isPublic = mode === 'public';
  
  // Define orb configurations for each mode
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

  const businessOrbs = [
    // Large, soft pastel orbs for glassmorphism aesthetic - more visible
    {
      size: 800,
      top: '20%',
      left: '15%',
      color: 'rgba(147, 197, 253, 0.25)', // Soft light blue - more visible
      blur: 120,
      duration: 30,
      x: [-30, 30, -30],
      y: [-40, 40, -40],
      scale: [1, 1.1, 1],
    },
    {
      size: 750,
      top: '60%',
      right: '20%',
      color: 'rgba(196, 181, 253, 0.22)', // Soft lavender - more visible
      blur: 110,
      duration: 28,
      x: [40, -40, 40],
      y: [-35, 35, -35],
      scale: [1, 1.08, 1],
    },
    {
      size: 700,
      bottom: '15%',
      left: '25%',
      color: 'rgba(167, 243, 208, 0.20)', // Soft mint green - more visible
      blur: 100,
      duration: 32,
      x: [-25, 25, -25],
      y: [30, -30, 30],
    },
    {
      size: 650,
      top: '10%',
      right: '10%',
      color: 'rgba(251, 207, 232, 0.22)', // Soft pink - more visible
      blur: 105,
      duration: 26,
      x: [35, -35, 35],
      y: [-25, 25, -25],
    },
    {
      size: 600,
      top: '50%',
      left: '50%',
      color: 'rgba(186, 230, 253, 0.28)', // Soft sky blue - central - more visible
      blur: 90,
      duration: 25,
      x: [-20, 20, -20],
      y: [-20, 20, -20],
      scale: [1, 1.12, 1],
    },
    {
      size: 550,
      bottom: '25%',
      right: '15%',
      color: 'rgba(221, 214, 254, 0.20)', // Soft periwinkle - more visible
      blur: 95,
      duration: 29,
      x: [30, -30, 30],
      y: [-28, 28, -28],
    },
    {
      size: 500,
      top: '35%',
      left: '5%',
      color: 'rgba(254, 240, 138, 0.18)', // Soft yellow - more visible
      blur: 85,
      duration: 27,
      x: [-22, 22, -22],
      y: [-32, 32, -32],
    },
  ];

  const orbs = isPublic ? publicOrbs : businessOrbs;
  const baseBackground = isPublic ? '#020617' : 'linear-gradient(135deg, #F8FAFC 0%, #F0F4F8 50%, #FAFBFC 100%)';
  const blendMode = isPublic ? 'screen' : 'normal';

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden transition-colors duration-[800ms]"
      style={isPublic ? { backgroundColor: baseBackground } : { background: baseBackground }}
    >
      {/* Animated orbital gradient orbs */}
      <div 
        className="absolute inset-0" 
        style={{ mixBlendMode: blendMode as any }}
      >
        {orbs.map((orb, index) => (
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
