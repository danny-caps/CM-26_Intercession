import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PosterEmblemProps {
  showRegistrationCTA?: boolean;
}

export const PosterEmblem: React.FC<PosterEmblemProps> = ({ showRegistrationCTA = true }) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div 
        className="relative overflow-hidden rounded-[2.5rem] bg-[#FCF8F2] shadow-2xl border-4 border-white transition-all duration-300 hover:shadow-3xl"
        id="official-poster-emblem"
      >
        <div className="relative w-full overflow-hidden rounded-[2.2rem] bg-[#FAF4EB] flex flex-col items-center justify-center p-2 sm:p-3">
          {/* Official CM26 Poster Image */}
          <img
            src="/CM26.jpeg"
            alt="Campus Meet '26 - Encounter Jesus Official Poster"
            className="w-full h-auto object-contain rounded-[1.8rem] shadow-inner select-none"
            referrerPolicy="no-referrer"
          />

          {showRegistrationCTA && (
            <div className="w-full text-center mt-4 mb-2 px-3 space-y-3">
              <p className="text-sm sm:text-base font-bold text-[#2A160E] font-prayer italic leading-snug">
                Still Not Registered Yet? Come on See you There......
              </p>
              <a
                href="https://campusmeet.jyijk.com"
                target="_blank"
                rel="noopener noreferrer"
                id="register-now-cta-btn"
                className="bc-cta"
              >
                <span className="bc-cta__label">Register Now</span>
                <span className="bc-cta__arrow">
                  <ArrowRight />
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};




