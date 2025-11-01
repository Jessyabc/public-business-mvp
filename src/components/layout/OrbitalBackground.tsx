import { motion } from 'framer-motion';

interface OrbitalBackgroundProps {
  mode: 'public' | 'business';
}

export function OrbitalBackground({ mode }: OrbitalBackgroundProps) {
  const isPublic = mode === 'public';
  
  // Define orb configurations for each mode
  const publicOrbs = [
    {
      size: 600,
      top: '10%',
      left: '5%',
      color: 'rgba(72, 159, 227, 0.25)', // PB Blue
      blur: 80,
      duration: 32,
      x: [-40, 40, -40],
      y: [-60, 60, -60],
    },
    {
      size: 500,
      top: '15%',
      right: '8%',
      color: 'rgba(103, 255, 216, 0.18)', // PB Aqua
      blur: 90,
      duration: 38,
      x: [50, -50, 50],
      y: [-40, 70, -40],
    },
    {
      size: 550,
      bottom: '10%',
      left: '10%',
      color: 'rgba(255, 200, 91, 0.15)', // PB Gold
      blur: 85,
      duration: 35,
      x: [-60, 60, -60],
      y: [40, -50, 40],
    },
    {
      size: 650,
      top: '40%',
      left: '50%',
      color: 'rgba(254, 94, 180, 0.12)', // Magenta
      blur: 100,
      duration: 40,
      x: [-70, 70, -70],
      y: [-80, 80, -80],
    },
    {
      size: 480,
      bottom: '15%',
      right: '12%',
      color: 'rgba(72, 159, 227, 0.20)', // PB Blue variant
      blur: 75,
      duration: 30,
      x: [60, -60, 60],
      y: [-50, 50, -50],
    },
  ];

  const businessOrbs = [
    {
      size: 500,
      top: '12%',
      left: '8%',
      color: 'rgba(255, 170, 120, 0.12)', // Warm orange
      blur: 80,
      duration: 34,
      x: [-45, 45, -45],
      y: [-55, 55, -55],
    },
    {
      size: 450,
      top: '20%',
      right: '10%',
      color: 'rgba(80, 120, 200, 0.10)', // Cool blue
      blur: 85,
      duration: 36,
      x: [50, -50, 50],
      y: [-45, 65, -45],
    },
    {
      size: 520,
      bottom: '12%',
      left: '12%',
      color: 'rgba(72, 159, 227, 0.12)', // PB Blue accent
      blur: 90,
      duration: 32,
      x: [-55, 55, -55],
      y: [45, -55, 45],
    },
    {
      size: 480,
      bottom: '18%',
      right: '15%',
      color: 'rgba(103, 255, 216, 0.08)', // Aqua shimmer
      blur: 75,
      duration: 38,
      x: [60, -60, 60],
      y: [-50, 50, -50],
    },
  ];

  const orbs = isPublic ? publicOrbs : businessOrbs;
  const baseBackground = isPublic ? '#020617' : '#F8FAFC';
  const blendMode = isPublic ? 'screen' : 'overlay';

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-colors duration-800"
      style={{ backgroundColor: baseBackground }}
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
              ...(orb.left === '50%' && { transform: 'translateX(-50%)' }),
            }}
            animate={{
              x: orb.x,
              y: orb.y,
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
