import React from 'react';

interface GoodShepherdIllustrationProps {
  className?: string;
}

export const GoodShepherdIllustration: React.FC<GoodShepherdIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none overflow-hidden ${className}`} id="good-shepherd-visual-container">
      {/* Background Radiant Sun Halo & Soft Gradient Orbs */}
      <div className="absolute inset-0 bg-radial from-[#FDE047]/35 via-[#EA7A1E]/15 to-transparent rounded-full filter blur-xl pointer-events-none" />
      
      {/* Decorative Radial Rays */}
      <svg 
        className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%] opacity-25 animate-spin" 
        style={{ animationDuration: '60s' }}
        viewBox="0 0 400 400"
      >
        <defs>
          <linearGradient id="rayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA7A1E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(12)].map((_, i) => (
          <path
            key={i}
            d="M200 200 L185 0 L215 0 Z"
            fill="url(#rayGrad)"
            transform={`rotate(${i * 30} 200 200)`}
          />
        ))}
      </svg>

      {/* Floating Prayer Light Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B] animate-float opacity-80" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[#EA7A1E] shadow-[0_0_10px_#EA7A1E] animate-float opacity-70" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-[#FDE047] shadow-[0_0_8px_#FDE047] animate-float opacity-90" style={{ animationDelay: '3s' }} />
        <div className="absolute top-2/3 right-1/5 w-2 h-2 rounded-full bg-[#9A3412] shadow-[0_0_6px_#9A3412] animate-float opacity-60" style={{ animationDelay: '2s' }} />
      </div>

      {/* The Good Shepherd Spiritual Art Card */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-[400px] aspect-[4/5] rounded-3xl p-3 bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] border-2 border-[#9A3412]/15 shadow-xl flex flex-col items-center justify-between overflow-hidden">
        {/* Soft Arc Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#FDF0A6]/40 to-transparent rounded-t-3xl" />
        
        {/* Top Badges / Scripture Pill */}
        <div className="relative z-20 flex items-center justify-between w-full px-2 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9A3412] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBE288] animate-pulse" />
            <span>The Good Shepherd</span>
          </div>
          <span className="text-[11px] font-bold text-[#9A3412] tracking-tight bg-[#FBE288]/80 px-2.5 py-0.5 rounded-full border border-[#EAB308]/40">
            John 10:11
          </span>
        </div>

        {/* Central Pastoral Art Illustration */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center px-4">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-[#FDE895] via-[#F6C068] to-[#EA7A1E]/30 p-1 shadow-inner flex items-center justify-center">
            {/* Inner Circular Frame with Shepherd & Lamb Vector Silhouette */}
            <div className="w-full h-full rounded-full bg-[#FFFDF9] flex items-center justify-center overflow-hidden relative border-4 border-white shadow-md">
              <svg viewBox="0 0 200 200" className="w-full h-full p-2" fill="none">
                {/* Sun Halo */}
                <circle cx="100" cy="70" r="45" fill="#FEF08A" opacity="0.8" />
                <circle cx="100" cy="70" r="38" stroke="#EA7A1E" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                
                {/* Shepherd Head & Face Outline */}
                <path d="M85 55 Q100 45 115 55 Q120 75 115 90 Q100 102 85 90 Q80 75 85 55 Z" fill="#E6AF85" />
                {/* Shepherd Hair & Beard */}
                <path d="M80 50 Q100 35 120 50 Q128 70 122 88 Q118 105 100 108 Q82 105 78 88 Q72 70 80 50 Z" fill="#603813" opacity="0.9" />
                <path d="M87 62 Q100 55 113 62 Q117 76 112 85 Q100 95 88 85 Z" fill="#F4D0B4" />
                {/* Joyful Eyes & Smile */}
                <path d="M92 72 Q95 70 98 72" stroke="#4A2608" strokeWidth="2" strokeLinecap="round" />
                <path d="M102 72 Q105 70 108 72" stroke="#4A2608" strokeWidth="2" strokeLinecap="round" />
                <path d="M96 82 Q100 86 104 82" stroke="#8B2500" strokeWidth="2" strokeLinecap="round" />

                {/* Robe / Garment (Warm Earthy Linen) */}
                <path d="M60 115 Q100 100 140 115 L155 200 L45 200 Z" fill="#8B4513" />
                <path d="M75 115 Q100 110 125 115 L135 200 L65 200 Z" fill="#A0522D" />
                <path d="M88 115 L88 200 L112 200 L112 115 Z" fill="#D2B48C" />

                {/* Gentle Lamb in Loving Arms */}
                <g transform="translate(60, 115)">
                  {/* Lamb Body Wool */}
                  <ellipse cx="40" cy="30" rx="32" ry="24" fill="#FAF9F6" stroke="#D1C7BD" strokeWidth="2" />
                  {/* Lamb Fluffy Texture */}
                  <circle cx="25" cy="24" r="8" fill="#FFFFFF" />
                  <circle cx="40" cy="20" r="9" fill="#FFFFFF" />
                  <circle cx="55" cy="26" r="8" fill="#FFFFFF" />
                  <circle cx="32" cy="36" r="8" fill="#FFFFFF" />
                  <circle cx="48" cy="36" r="8" fill="#FFFFFF" />
                  
                  {/* Lamb Head */}
                  <ellipse cx="68" cy="18" rx="14" ry="12" fill="#F5F2EB" stroke="#D1C7BD" strokeWidth="1.5" />
                  {/* Lamb Ears */}
                  <path d="M62 10 Q54 6 56 16 Z" fill="#E8DFD8" />
                  <path d="M76 10 Q84 6 82 16 Z" fill="#E8DFD8" />
                  {/* Lamb Face details */}
                  <circle cx="72" cy="16" r="1.5" fill="#3D2817" />
                  <path d="M75 22 Q78 24 81 22" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Lamb Legs */}
                  <rect x="25" y="48" width="6" height="22" rx="3" fill="#EFECE6" />
                  <rect x="48" y="48" width="6" height="20" rx="3" fill="#EFECE6" />
                  <rect x="25" y="65" width="6" height="5" rx="1.5" fill="#4A3B32" />
                  <rect x="48" y="63" width="6" height="5" rx="1.5" fill="#4A3B32" />
                </g>

                {/* Shepherd's Protective Arms */}
                <path d="M52 140 Q65 170 95 168 Q85 155 75 145 Z" fill="#DDB18E" />
                <path d="M148 138 Q135 168 105 168 Q115 155 125 145 Z" fill="#DDB18E" />
              </svg>
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-base font-extrabold text-[#9A3412] tracking-tight">
              Encounter His Unconditional Love
            </h4>
            <p className="text-xs text-[#6B4E41] font-medium leading-relaxed max-w-xs mt-1">
              "He gathers the lambs in his arms and carries them close to his heart."
            </p>
          </div>
        </div>

        {/* Bottom Banner within visual */}
        <div className="relative z-20 w-full py-2 px-3 rounded-2xl bg-[#9A3412]/10 border border-[#9A3412]/20 flex items-center justify-between text-[11px] font-bold text-[#9A3412]">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#EA7A1E]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            18–21 Sept 2026
          </span>
          <span className="text-[#EA7A1E] font-black uppercase tracking-wider">
            Christ College, Irinjalakuda
          </span>
        </div>
      </div>
    </div>
  );
};
