import React from 'react';

export const BusinessBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Deep gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f1729] via-[#1a1147] to-[#0f1729]" />
      
      {/* Floating abstract orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large aqua orb */}
        <div 
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(0,217,255,0.4) 0%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        
        {/* Purple orb */}
        <div 
          className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(157,108,255,0.4) 0%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse',
            animationDelay: '-5s',
          }}
        />
        
        {/* Small accent orb */}
        <div 
          className="absolute top-[60%] left-[60%] w-[250px] h-[250px] rounded-full opacity-10 blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(255,59,92,0.3) 0%, transparent 70%)',
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
