import React from 'react';
import { 
  Cross, 
  Disc, 
  Flame, 
  Church, 
  Coffee, 
  Compass,
  HeartHandshake,
  Sparkles,
  Sun,
  Clock,
  BookOpen,
  LucideIcon
} from 'lucide-react';

interface PrayerIconProps {
  slug?: string;
  iconName?: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  'holy-mass': Flame,
  'eucharistic-visits': Church,
  'creed': BookOpen,
  'memorare': HeartHandshake,
  'fastings': Coffee,
  'way-of-cross': Compass,
  'our-father': Cross,
  'decades': Disc,
  // Fallbacks
  'Flame': Flame,
  'Church': Church,
  'Coffee': Coffee,
  'Compass': Compass,
  'Cross': Cross,
  'Disc': Disc,
  'HeartHandshake': HeartHandshake,
  'Sparkles': Sparkles,
  'Sun': Sun,
  'Clock': Clock,
  'BookOpen': BookOpen,
};

const PRAYER_IMAGE_MAP: Record<string, { src: string; alt: string }> = {
  'holy-mass': { src: '/Holy_Mass_logo.png', alt: 'Holy Mass' },
  'eucharistic-visits': { src: '/Chapel_Logo.png', alt: 'Eucharistic Visits' },
  'chapel': { src: '/Chapel_Logo.png', alt: 'Chapel' },
  'creed': { src: '/Faith_logo.png', alt: 'Creed' },
  'faith': { src: '/Faith_logo.png', alt: 'Creed' },
  'memorare': { src: '/Memorare_logo.png', alt: 'Memorare' },
  'fastings': { src: '/Fasting_Logo.png', alt: 'Fastings' },
  'fasting': { src: '/Fasting_Logo.png', alt: 'Fasting' },
  'way-of-cross': { src: '/Way_of_Cross_Logo.png', alt: 'Way of Cross' },
  'our-father': { src: '/Our_Father_Logo.png', alt: 'Our Father' },
  'decades': { src: '/Decade_Logo.png', alt: 'Decades' },
};

export const PrayerIcon: React.FC<PrayerIconProps> = ({
  slug,
  iconName,
  className = 'w-5 h-5',
  size = 20
}) => {
  const key = (slug || iconName || '').toLowerCase().replace(/\s+/g, '-');
  const imageInfo = PRAYER_IMAGE_MAP[key] || (slug ? PRAYER_IMAGE_MAP[slug] : undefined);

  if (imageInfo) {
    return (
      <img
        src={imageInfo.src}
        alt={imageInfo.alt}
        className={`${className} object-contain select-none`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const IconComponent = (slug && ICON_MAP[slug]) || (iconName && ICON_MAP[iconName]) || Flame;
  return <IconComponent className={className} size={size} />;
};
