import React, { useState } from 'react';
import { prayerStore } from '../lib/prayerStore';
import { PrayerIcon } from './PrayerIcon';

interface LivePrayerWallProps {
  onQuickOffer: (prayerTypeId: string) => void;
}

export const LivePrayerWall: React.FC<LivePrayerWallProps> = ({ onQuickOffer }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const prayerStats = prayerStore.getPrayerTypeStats();

  const filteredStats = prayerStats.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.slug === selectedFilter;
  });

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2]" id="prayer-wall-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-left text-3xl sm:text-4xl md:text-[43px] font-extrabold text-[#2A160E] font-heading tracking-tight leading-tight">
              Prayer Offerings
            </h2>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'bg-white text-[#44261B] hover:bg-[#FAF7F2] border border-gray-200'
              }`}
            >
              All Offerings
            </button>
            {prayerStats.map(stat => (
              <button
                key={stat.slug}
                onClick={() => setSelectedFilter(stat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedFilter === stat.slug
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'bg-white text-[#44261B] hover:bg-[#FAF7F2] border border-gray-200'
                }`}
              >
                {stat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStats.map((item) => {
            return (
              <div
                key={item.prayer_type_id}
                className="bg-white rounded-3xl p-6 border border-[#9A3412]/15 hover:border-[#9A3412]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header with Icon */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#9A3412]/20 flex items-center justify-center p-2 group-hover:scale-105 transition-transform shadow-xs">
                      <PrayerIcon slug={item.slug} className="w-8 h-8 object-contain" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-center text-2xl sm:text-[28px] font-black text-[#2A160E] font-heading group-hover:text-[#9A3412] transition-colors leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-center text-xs text-[#6B4E41] leading-relaxed mt-2 min-h-[36px]">
                    {item.description}
                  </p>

                  {/* Big Number Offered */}
                  <div className="my-4 pt-3 border-t border-gray-100 flex items-baseline justify-center">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-[#9A3412] font-heading">
                        {item.total_quantity.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#6B4E41] font-semibold ml-2">offered</span>
                    </div>
                  </div>
                </div>

                {/* Offer Button */}
                <button
                  type="button"
                  onClick={() => onQuickOffer(item.prayer_type_id)}
                  id={`quick-offer-btn-${item.slug}`}
                  className="mt-5 w-full py-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#9A3412] text-[#9A3412] hover:text-white border border-[#9A3412]/20 hover:border-transparent text-xs font-black uppercase tracking-wider shadow-2xs hover:shadow-md transition-all flex items-center justify-center gap-2 group-hover:bg-[#9A3412] group-hover:text-white"
                >
                  <img
                    src="/Prayer_Logo.png"
                    alt="Prayer"
                    className="w-4 h-4 object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                  <span>Offer {item.name}</span>
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
