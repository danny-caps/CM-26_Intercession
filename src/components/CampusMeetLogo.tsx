import React from 'react';

interface CampusMeetLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'brand';
}

export const CampusMeetLogo: React.FC<CampusMeetLogoProps> = ({
  className = 'h-14 sm:h-20 md:h-24 w-auto',
}) => {
  return (
    <img
      src="/CM26_logo.png"
      alt="Campus Meet '26"
      className={`inline-block mix-blend-multiply filter contrast-110 object-contain select-none ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};

