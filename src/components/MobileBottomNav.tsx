import React from 'react';
import { Home, TrendingUp, Info } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenOfferModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenOfferModal,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#9A3412]/15 px-4 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Wall / Altar */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'home' ? 'text-[#9A3412]' : 'text-gray-500'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#EA7A1E]' : 'text-gray-400'}`} />
          <span>Home</span>
        </button>

        {/* Center Big Offer Button */}
        <button
          onClick={onOpenOfferModal}
          id="mobile-nav-center-offer-btn"
          className="relative -top-3 w-13 h-13 rounded-full bg-white p-2 border-2 border-[#EA7A1E] flex items-center justify-center text-white shadow-xl ring-4 ring-[#FAF7F2] active:scale-95 transition-transform cursor-pointer"
          title="Offer Prayer"
        >
          <img
            src="/Offer_Prayer_Logo.png"
            alt="Offer Prayer"
            className="w-full h-full object-contain select-none"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Timeline */}
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'timeline' ? 'text-[#9A3412]' : 'text-gray-500'
          }`}
        >
          <TrendingUp className={`w-5 h-5 ${activeTab === 'timeline' ? 'text-[#EA7A1E]' : 'text-gray-400'}`} />
          <span>Timeline</span>
        </button>

        {/* About */}
        <button
          onClick={() => setActiveTab('about')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold cursor-pointer transition-colors ${
            activeTab === 'about' ? 'text-[#9A3412]' : 'text-gray-500'
          }`}
        >
          <Info className={`w-5 h-5 ${activeTab === 'about' ? 'text-[#EA7A1E]' : 'text-gray-400'}`} />
          <span>Venue</span>
        </button>

      </div>
    </div>
  );
};

