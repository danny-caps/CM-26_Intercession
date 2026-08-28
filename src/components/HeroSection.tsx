import React from 'react';
import { prayerStore } from '../lib/prayerStore';
import { PosterEmblem } from './PosterEmblem';

interface HeroSectionProps {
  onOpenOfferPrayerModal: () => void;
  onScrollToPrayerWall?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenOfferPrayerModal,
}) => {
  const stats = prayerStore.getTotalStats();

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE6] to-[#FAF7F2]" id="hero-section">
      {/* Background Decorative Halos */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#FBE288]/30 via-[#EA7A1E]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 2-Column Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Spiritual Vision & Live Counters */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#2A160E] font-heading tracking-tight leading-tight">
                Let's Pray for <br className="hidden sm:inline" />
                <span className="block mt-1 sm:mt-2">
                  <img
                    src="/CM26_logo.png"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = '/campus-meet-logo.png';
                    }}
                    alt="Campus Meet '26"
                    className="h-16 sm:h-22 md:h-28 w-auto max-w-full inline-block mix-blend-multiply filter contrast-110 object-contain drop-shadow-xs select-none"
                    referrerPolicy="no-referrer"
                  />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#6B4E41] font-prayer italic max-w-2xl mx-auto lg:mx-0">
                "And afterward, I will pour out my Spirit on all people." — Acts 2:17
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#44261B] leading-relaxed max-w-xl mx-auto lg:mx-0">
              "Let join together in prayer for Campus Meet."
            </p>

            {/* Live Aggregate Stat Counters Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#9A3412]/20 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs font-black text-[#9A3412] uppercase tracking-wider flex items-center gap-1.5">
                  <img
                    src="/Offer_Prayer_Logo.png"
                    alt="Offer Prayer"
                    className="w-5 h-5 object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                  <span>Prayer Offerings</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 text-center sm:text-left">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">Total Prayers Offered</span>
                  <span className="text-2xl sm:text-4xl font-black text-[#9A3412] font-heading tracking-tight">
                    {stats.total_offerings.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block">Offerings Today</span>
                  <span className="text-2xl sm:text-4xl font-black text-[#EA7A1E] font-heading tracking-tight">
                    +{stats.today_offerings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenOfferPrayerModal}
                id="hero-offer-prayer-cta"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#EA7A1E] to-[#9A3412] hover:from-[#F29543] hover:to-[#B8431B] text-white text-sm font-black uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-3 border border-white/20 cursor-pointer"
              >
                <img
                  src="/Offer_Prayer_Logo.png"
                  alt="Offer Prayer"
                  className="w-6 h-6 object-contain select-none"
                  referrerPolicy="no-referrer"
                />
                <span>Offer Your Prayer</span>
              </button>
            </div>

          </div>

          {/* Right Column: Poster-Style Visual Emblem */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md">
              <PosterEmblem />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
