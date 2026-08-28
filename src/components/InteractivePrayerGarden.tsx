import React, { useState } from 'react';
import { prayerStore } from '../lib/prayerStore';
import { PrayerIcon } from './PrayerIcon';

interface InteractivePrayerGardenProps {
  onOpenOfferModal: (prayerTypeId?: string) => void;
}

export const InteractivePrayerGarden: React.FC<InteractivePrayerGardenProps> = ({
  onOpenOfferModal,
}) => {
  const [activeHoverType, setActiveHoverType] = useState<string | null>(null);
  const prayerStats = prayerStore.getPrayerTypeStats();
  const totalStats = prayerStore.getTotalStats();

  return (
    <section className="py-12 sm:py-16 bg-[#2A160E] text-white relative overflow-hidden" id="prayer-garden-section">
      {/* Background liturgical candlelight ambiance */}
      <div className="absolute inset-0 bg-radial from-[#EA7A1E]/15 via-transparent to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-white">
            Consecrated Prayers for Campus Meet '26
          </h2>
          <p className="text-sm sm:text-base text-white/80 font-prayer italic mt-2">
            "Each candle represents real prayers, fasts, and Masses rising like incense before God."
          </p>
        </div>

        {/* Visual Candle Altar Grid - 6 Core Offerings */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-10">
          {prayerStats.map((stat) => {
            const isHovered = activeHoverType === stat.prayer_type_id;

            return (
              <div
                key={stat.prayer_type_id}
                onMouseEnter={() => setActiveHoverType(stat.prayer_type_id)}
                onMouseLeave={() => setActiveHoverType(null)}
                onClick={() => onOpenOfferModal(stat.prayer_type_id)}
                className={`relative rounded-3xl p-5 border transition-all duration-300 cursor-pointer flex flex-col items-center text-center group ${
                  isHovered
                    ? 'bg-gradient-to-b from-[#9A3412] to-[#44261B] border-[#FBE288] scale-105 shadow-2xl ring-2 ring-[#FBE288]/40'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 shadow-md'
                }`}
              >
                {/* Lit Candle Flame Emblem with High-Contrast Background */}
                <div className="relative mb-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg group-hover:shadow-[#EA7A1E]/50 group-hover:scale-105 transition-all border border-[#FBE288]/40">
                    <PrayerIcon slug={stat.slug} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                  </div>
                  {/* Floating Flame Glow */}
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#EA7A1E] flex items-center justify-center text-[10px] text-[#FBE288] animate-candle shadow-xs">
                    ✦
                  </span>
                </div>

                <h4 className="text-sm font-black font-heading tracking-wide text-white group-hover:text-[#FBE288] transition-colors">
                  {stat.name}
                </h4>

                <div className="my-2">
                  <span className="text-xl sm:text-2xl font-black font-heading text-[#FBE288]">
                    {stat.total_quantity.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-white/70 block">offered</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Total Encouragement Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#9A3412]/80 via-[#B8431B]/80 to-[#7C290D]/80 border border-[#FBE288]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 p-1.5 flex items-center justify-center shrink-0 border border-[#FBE288]/40 shadow-sm">
              <img
                src="/Offer_Prayer_Logo.png"
                alt="Offer Prayer"
                className="w-full h-full object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold text-[#FBE288] tracking-wider block">
                Total Prayers Offered Till Now
              </span>
              <p className="text-sm text-white/90 font-medium">
                {totalStats.total_offerings.toLocaleString()} total prayers consecrated for the outpouring of the Holy Spirit.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenOfferModal()}
            id="garden-offer-prayer-btn"
            className="px-6 py-3 rounded-2xl bg-[#FBE288] hover:bg-[#FDF0A6] text-[#9A3412] text-xs font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            Offer Your Prayer
          </button>
        </div>

      </div>
    </section>
  );
};
