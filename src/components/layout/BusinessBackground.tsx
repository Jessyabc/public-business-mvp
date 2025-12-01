import React from 'react';

export const BusinessBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Light neutral gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f8f9fb] via-[#e8edf3] to-[#f0f4f8]" />
      
      {/* Subtle floating abstract orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large soft blue orb */}
        <div 
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(66,133,244,0.3) 0%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        
        {/* Neutral gray orb */}
        <div 
          className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(100,120,140,0.25) 0%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse',
            animationDelay: '-5s',
          }}
        />
        
        {/* Small accent orb */}
        <div 
          className="absolute top-[60%] left-[60%] w-[250px] h-[250px] rounded-full opacity-[0.05] blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(52,152,219,0.2) 0%, transparent 70%)',
            animation: 'float 15s ease-in-out infinite',
            animationDelay: '-10s',
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};
