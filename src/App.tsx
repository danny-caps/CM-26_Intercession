import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { InteractivePrayerGarden } from './components/InteractivePrayerGarden';
import { LivePrayerWall } from './components/LivePrayerWall';
import { PrayerJourneyTimeline } from './components/PrayerJourneyTimeline';
import { AboutIntercession } from './components/AboutIntercession';
import { SubmitPrayerModal } from './components/SubmitPrayerModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { subscribeToStore } from './lib/prayerStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);
  const [preselectedPrayerTypeId, setPreselectedPrayerTypeId] = useState<string | undefined>(undefined);
  const [, setStoreVersion] = useState<number>(0);

  // Subscribe to store updates so any state change triggers re-render
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setStoreVersion(v => v + 1);
    });
    return unsubscribe;
  }, []);

  const handleOpenOfferModal = (prayerTypeId?: string) => {
    setPreselectedPrayerTypeId(prayerTypeId);
    setIsOfferModalOpen(true);
  };

  const handleScrollToPrayerWall = () => {
    const el = document.getElementById('prayer-wall-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2A160E]">
      {/* Liturgical Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenOfferPrayerModal={() => handleOpenOfferModal()}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <HeroSection 
              onOpenOfferPrayerModal={() => handleOpenOfferModal()}
              onScrollToPrayerWall={handleScrollToPrayerWall}
            />
            <InteractivePrayerGarden 
              onOpenOfferModal={handleOpenOfferModal}
            />
            <LivePrayerWall 
              onQuickOffer={handleOpenOfferModal}
            />
          </>
        )}

        {activeTab === 'timeline' && (
          <PrayerJourneyTimeline />
        )}

        {activeTab === 'about' && (
          <AboutIntercession />
        )}
      </main>

      {/* Offer Prayer Modal (Strictly 6 Types, 100% Anonymous, Auto Date) */}
      <SubmitPrayerModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        preselectedPrayerTypeId={preselectedPrayerTypeId}
      />

      {/* Mobile Sticky Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenOfferModal={() => handleOpenOfferModal()}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

