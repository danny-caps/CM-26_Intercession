import React from 'react';
import { MapPin } from 'lucide-react';
import { PosterEmblem } from './PosterEmblem';

export const AboutIntercession: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2]" id="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-[#2A160E] font-heading tracking-tight">
            About Campus Meet '26 
          </h2>
        </div>

        {/* 2-Column Info Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#9A3412]/15 shadow-sm space-y-4">
              <h3 className="text-xl font-black text-[#9A3412] font-heading">
                Campus Meet'26
              </h3>
              <p className="text-xs sm:text-sm text-[#44261B] leading-relaxed">
                Campus Meet '26 is Zonal Gathering for our campuses taking place on <strong>18–21 September 2026</strong> at <strong>Christ College of Engineering</strong>, the Campus Meet brings Our campuses together In Joy, fellowship, make some new friends outside the campuses in Jesus.
              </p>
              <p className="text-xs sm:text-sm text-[#44261B] leading-relaxed">
                So Stay Tuned for Campus Meet'26.Don't forget to pray
              </p>
            </div>

          </div>

          {/* Right Column: Venue & Poster */}
          <div className="lg:col-span-6 space-y-6">
            <PosterEmblem />

            {/* Venue Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#9A3412]/15 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#9A3412]" />
                <h4 className="text-base font-black text-[#2A160E] font-heading">
                  Venue Details
                </h4>
              </div>
              <p className="text-xs text-[#6B4E41]">
                <strong>Christ College of Engineering</strong><br />
                Irinjalakuda, Thrissur District, Kerala 680125<br />
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
