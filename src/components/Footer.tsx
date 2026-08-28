import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2A160E] text-white pt-12 pb-24 lg:pb-12 border-t-2 border-[#9A3412]" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm overflow-hidden">
                <img
                  src="/JY_Logo.png"
                  alt="Jesus Youth Logo"
                  className="w-full h-full object-contain select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-heading font-black text-xl text-white tracking-tight">
                campus <span className="text-[#FBE288]">MEET '26</span>
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-prayer italic max-w-sm">
              "And afterward, I will pour out my Spirit on all people." — Acts 2:17
            </p>

            <p className="text-xs text-white/80">
              An initiative by <strong>Jesus Youth Irinjalakuda Campus Ministry</strong>.
            </p>
          </div>

          {/* Key Conference Info */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-black text-[#FBE288] uppercase tracking-wider">
              Program Details
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#EA7A1E] shrink-0" />
                <span>18–21 September 2026</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#EA7A1E] shrink-0" />
                <span>Christ College of Engineering, Irinjalakuda</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Ministry Sub-section at bottom */}
        <div className="pb-6 border-b border-white/10 text-[11px] text-[#FDF0A6] font-semibold">
          Jesus Youth Irinjalakuda Campus Ministry
        </div>

        {/* Copyright & Sub-credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© 2026 Jesus Youth Irinjalakuda Campus Ministry.</p>
          <div className="flex items-center gap-1.5 text-[#FBE288] font-prayer italic">
            <span>Pray for Campus Meet '26</span>
            <img
              src="/Prayer_Logo.png"
              alt="Prayer"
              className="w-4 h-4 object-contain inline select-none"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>
    </footer>
  );
};
