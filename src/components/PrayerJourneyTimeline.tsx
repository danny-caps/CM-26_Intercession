import React from 'react';
import { Calendar } from 'lucide-react';
import { prayerStore } from '../lib/prayerStore';

export const PrayerJourneyTimeline: React.FC = () => {
  const dailySummaries = prayerStore.getDailySummaries();

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2]" id="prayer-timeline-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2A160E] font-heading tracking-tight">
            Intercession Journey & Milestones
          </h2>
        </div>

        {/* Daily Offerings Bar Visualization */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#9A3412]/15 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-[#2A160E] font-heading">
                Daily Prayer Offerings
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#9A3412]">
              <Calendar className="w-3.5 h-3.5 text-[#EA7A1E]" />
              <span>Aug 2026</span>
            </div>
          </div>

          <div className="space-y-3">
            {dailySummaries.map((day) => {
              const maxVal = 25000;
              const widthPct = Math.min(100, Math.round((day.total_offerings / maxVal) * 100));

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">{day.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-500">{day.submission_count} submissions</span>
                      <span className="font-black text-[#9A3412]">+{day.total_offerings.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="w-full bg-[#FAF7F2] rounded-full h-3 overflow-hidden border border-[#9A3412]/10">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#EA7A1E] to-[#9A3412]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
