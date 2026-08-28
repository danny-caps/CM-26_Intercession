import React, { useState } from 'react';
import { 
  Home,
  Flame, 
  TrendingUp, 
  Info, 
  Menu, 
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenOfferPrayerModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenOfferPrayerModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'timeline', label: 'Journey Timeline', icon: TrendingUp },
    { id: 'about', label: 'About Campus Meet', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#9A3412]/15 shadow-xs transition-all">
      {/* Top Ministry Accent Bar */}
      <div className="bg-gradient-to-r from-[#9A3412] via-[#EA7A1E] to-[#9A3412] text-white py-1 px-4 text-xs font-bold flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-1.5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="tracking-wide text-[10px] sm:text-xs font-extrabold">
              Campus Meet'26
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px]">
            <span className="text-[#FDF0A6]">18–21 Sept 2026</span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">Christ College of Engineering, Irinjalakuda</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
            id="nav-logo-button"
          >
            {/* Jesus Youth Emblem */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center ring-2 ring-[#EA7A1E]/30 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/JY_Logo.png"
                alt="Jesus Youth Logo"
                className="w-full h-full object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl sm:text-2xl text-[#9A3412] tracking-tight leading-none">
                  campus
                </span>
                <span className="font-heading font-black text-xl sm:text-2xl text-[#EA7A1E] tracking-tight leading-none">
                  MEET '26
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#6B4E41] uppercase tracking-wider leading-tight mt-0.5 flex items-center gap-1">
                <span>Intercession Page</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#9A3412] text-white shadow-sm'
                      : 'text-[#44261B] hover:text-[#9A3412] hover:bg-[#9A3412]/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FBE288]' : 'text-[#EA7A1E]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Offer Prayer CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Primary Action CTA: Offer Prayer */}
            <button
              onClick={onOpenOfferPrayerModal}
              id="header-offer-prayer-btn"
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#EA7A1E] to-[#9A3412] text-white text-xs font-black tracking-wide uppercase shadow-md hover:shadow-lg hover:from-[#F29543] hover:to-[#B8431B] transform hover:-translate-y-0.5 active:translate-y-0 transition-all border border-white/20 cursor-pointer"
            >
              <img
                src="/Offer_Prayer_Logo.png"
                alt="Offer Prayer"
                className="w-5 h-5 object-contain select-none"
                referrerPolicy="no-referrer"
              />
              <span>Offer Prayer</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenOfferPrayerModal}
              id="mobile-header-offer-btn"
              className="sm:hidden px-3.5 py-2 rounded-xl bg-[#EA7A1E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <img
                src="/Offer_Prayer_Logo.png"
                alt="Offer Prayer"
                className="w-4 h-4 object-contain select-none"
                referrerPolicy="no-referrer"
              />
              <span>Offer</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-2 rounded-xl text-[#9A3412] hover:bg-[#9A3412]/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-b border-[#9A3412]/20 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#9A3412] text-white'
                      : 'text-[#44261B] hover:bg-[#9A3412]/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#FBE288]' : 'text-[#EA7A1E]'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#9A3412]/15 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenOfferPrayerModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#EA7A1E] to-[#9A3412] text-white text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md mt-2 cursor-pointer"
            >
              <Flame className="w-5 h-5 text-[#FBE288]" />
              <span>Offer a Prayer Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

