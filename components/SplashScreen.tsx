import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Reveal logo shortly after mount
    setTimeout(() => setShowLogo(true), 100);

    // Start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2800); // Wait 2.8s

    // Unmount callback
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3500); // 2.8s + 0.7s transition

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 transition-opacity duration-700 ease-in-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center relative">
        {/* Glowing Background Effect */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full transition-all duration-1000 ${
            showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        ></div>

        {/* Logo Icon */}
        <div 
          className={`relative z-10 mb-8 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            showLogo ? 'opacity-100 translate-y-0 scale-100 animate-float' : 'opacity-0 translate-y-10 scale-90'
          }`}
        >
          <div className="relative">
            <Sparkles size={80} className="text-white drop-shadow-[0_0_15px_rgba(165,180,252,0.5)]" strokeWidth={1} />
            <div className="absolute inset-0 bg-white/20 blur-lg animate-pulse"></div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="overflow-hidden">
          <h1 
            className={`text-5xl font-black tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-zinc-400 transition-all duration-1000 delay-300 ${
              showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            NOX
          </h1>
        </div>
        
        {/* Tagline */}
        <p 
            className={`mt-4 text-xs font-medium text-zinc-500 tracking-widest uppercase transition-all duration-1000 delay-500 ${
              showLogo ? 'opacity-100' : 'opacity-0'
            }`}
        >
          Intelligence Redefined
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;