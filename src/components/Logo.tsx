import React from 'react';

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg';
  white?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showSlogan = false,
  size = 'md',
  white = false
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const titleSizes = {
    sm: 'text-base font-extrabold',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight'
  };

  const subSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Emblem SVG inspired by the design mockup */}
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-full bg-gradient-to-br from-emerald-600 to-green-700 p-0.5 shadow-md flex items-center justify-center ring-2 ${white ? 'ring-white/40' : 'ring-emerald-700/20'}`}>
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%]" fill="none">
            {/* Sun / Earth aura */}
            <circle cx="50" cy="40" r="28" fill="#FEF3C7" />
            <circle cx="50" cy="38" r="18" fill="#F59E0B" />
            
            {/* Protecting hands / Soil furrow */}
            <path
              d="M20 78 C 35 62, 65 62, 80 78 C 70 88, 30 88, 20 78 Z"
              fill="#065F46"
            />
            {/* Sprout & Leaves */}
            <path
              d="M50 72 C 50 55, 48 42, 49 32 C 49 32, 53 45, 52 72 Z"
              fill="#047857"
            />
            {/* Left leaf */}
            <path
              d="M49 48 C 30 45, 26 30, 36 24 C 44 26, 48 38, 49 48 Z"
              fill="#10B981"
            />
            {/* Right leaf */}
            <path
              d="M51 40 C 70 36, 75 22, 64 16 C 56 19, 52 30, 51 40 Z"
              fill="#059669"
            />
            {/* Golden seed droplet */}
            <circle cx="50" cy="62" r="3.5" fill="#F59E0B" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`${titleSizes[size]} ${white ? 'text-white' : 'text-emerald-950'} font-bold`}>
            BENIN<span className="text-amber-500">-PEPI</span>
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-300/60">
            Zou &middot; Abomey
          </span>
        </div>
        <span className={`${subSizes[size]} font-medium ${white ? 'text-emerald-100' : 'text-slate-600'}`}>
          Géoportail des Pépinières du Bénin
        </span>
        {showSlogan && (
          <span className="text-[11px] font-semibold italic text-amber-600 mt-0.5">
            « Des pépinières aujourd'hui, une forêt demain ! »
          </span>
        )}
      </div>
    </div>
  );
};
