/**
 * OrbitalBackground - GPU-optimized animated background
 * 
 * Performance optimizations:
 * - Uses CSS animations instead of Framer Motion for orbital orbs
 * - GPU-accelerated with will-change and transform
 * - Respects reduced motion preferences
 * - Static backgrounds for workspace/business modes (no animation overhead)
 */

interface OrbitalBackgroundProps {
  mode: 'public' | 'business' | 'workspace';
}

// CSS keyframes styles - injected once
const orbKeyframes = `
  @keyframes orb-float-0 {
    0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
    50% { transform: translate(-50%, -50%) translate(20px, 20px) scale(1.15); }
  }
  @keyframes orb-float-1 {
    0%, 100% { transform: translate(-40px, -60px); }
    50% { transform: translate(40px, 60px); }
  }
  @keyframes orb-float-2 {
    0%, 100% { transform: translate(50px, -40px); }
    50% { transform: translate(-50px, 70px); }
  }
  @keyframes orb-float-3 {
    0%, 100% { transform: translate(-60px, 40px); }
    50% { transform: translate(60px, -50px); }
  }
  @keyframes orb-float-4 {
    0%, 100% { transform: translate(-70px, -80px); }
    50% { transform: translate(70px, 80px); }
  }
  @keyframes orb-float-5 {
    0%, 100% { transform: translate(60px, -50px); }
    50% { transform: translate(-60px, 50px); }
  }
`;

export function OrbitalBackground({ mode }: OrbitalBackgroundProps) {
  // Workspace mode: Warm neumorphic sanctuary with PB blue ambient glow
  // The "innermost layer" - private, warm, but clearly PB
  if (mode === 'workspace') {
    return (
      <div 
        className="pointer-events-none fixed inset-0 -z-50"
        style={{
          background: '#EDE8E3',
          contain: 'strict'
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
          background: '#E6E4E2',
          contain: 'strict'
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

  // Public mode: CSS-animated orbital orbs (space-inspired)
  // Using CSS animations instead of Framer Motion for better performance
  const publicOrbs = [
    { size: 700, top: '50%', left: '50%', color: 'rgba(72, 159, 227, 0.55)', blur: 40, duration: 25, isCentered: true },
    { size: 600, top: '10%', left: '5%', color: 'rgba(72, 159, 227, 0.40)', blur: 80, duration: 16 },
    { size: 500, top: '15%', right: '8%', color: 'rgba(103, 255, 216, 0.30)', blur: 80, duration: 19 },
    { size: 550, bottom: '10%', left: '10%', color: 'rgba(255, 200, 91, 0.28)', blur: 80, duration: 17 },
    { size: 650, top: '40%', left: '50%', color: 'rgba(254, 94, 180, 0.22)', blur: 80, duration: 20 },
    { size: 480, bottom: '15%', right: '12%', color: 'rgba(72, 159, 227, 0.35)', blur: 80, duration: 15 },
  ];

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
      style={{ 
        backgroundColor: '#020617',
        contain: 'strict'
      }}
    >
      {/* Inject keyframes */}
      <style dangerouslySetInnerHTML={{ __html: orbKeyframes }} />
      
      {/* Animated orbital gradient orbs using CSS animations */}
      <div 
        className="absolute inset-0" 
        style={{ mixBlendMode: 'screen' }}
      >
        {publicOrbs.map((orb, index) => (
          <div
            key={index}
            className="absolute rounded-full motion-reduce:animate-none"
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              top: orb.top,
              bottom: (orb as any).bottom,
              left: orb.left,
              right: (orb as any).right,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: `blur(${orb.blur}px)`,
              willChange: 'transform',
              animation: `orb-float-${index} ${orb.duration}s ease-in-out infinite alternate`,
              ...(orb.isCentered && { 
                transform: 'translate(-50%, -50%)',
              }),
            }}
          />
        ))}
      </div>
    </div>
  );
}
