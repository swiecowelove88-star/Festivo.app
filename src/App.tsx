import React, { useEffect, useState } from 'react';
import { ALL_HOLIDAYS } from './data/holidays';
import { Holiday, TabType } from './types';
import { Navbar } from './components/Navbar';
import { MobileTabBar } from './components/MobileTabBar';
import { TodayView } from './components/TodayView';
import { CalendarView } from './components/CalendarView';
import { SearchView } from './components/SearchView';
import { FavoritesView } from './components/FavoritesView';
import { InstallView } from './components/InstallView';
import { HolidayDetailModal } from './components/HolidayDetailModal';
import { AddHolidayModal } from './components/AddHolidayModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AISettingsModal } from './components/AISettingsModal';

export const App: React.FC = () => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Favorites state with localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('swieta_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom holidays state with localStorage
  const [customHolidays, setCustomHolidays] = useState<Holiday[]>(() => {
    try {
      const saved = localStorage.getItem('swieta_custom_holidays');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAISettingsModalOpen, setIsAISettingsModalOpen] = useState(false);

  // PWA Install Prompt event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('swieta_favorites', JSON.stringify(favorites));
    } catch {
      // Ignored
    }
  }, [favorites]);

  // Save custom holidays to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('swieta_custom_holidays', JSON.stringify(customHolidays));
    } catch {
      // Ignored
    }
  }, [customHolidays]);

  // Listen to PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('PWA beforeinstallprompt captured!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      console.log('PWA application installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Combined holidays
  const allHolidaysList = [...ALL_HOLIDAYS, ...customHolidays];

  // Count today's holidays
  const today = new Date();
  const todayCount = allHolidaysList.filter(
    (h) => h.month === today.getMonth() + 1 && h.day === today.getDate()
  ).length;

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add custom holiday
  const handleAddHoliday = (newHoliday: Holiday) => {
    setCustomHolidays((prev) => [newHoliday, ...prev]);
    setSelectedHoliday(newHoliday);
  };

  // Trigger PWA install prompt
  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      setDeferredPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#182022] text-[#F8FAFC] flex flex-col selection:bg-[#D97652] selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAISettings={() => setIsAISettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 content-pb-safe">
        {activeTab === 'today' && (
          <TodayView
            holidays={allHolidaysList}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectHoliday={(h) => setSelectedHoliday(h)}
            onSwitchToSearch={() => setActiveTab('search')}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            holidays={allHolidaysList}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectHoliday={(h) => setSelectedHoliday(h)}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            holidays={allHolidaysList}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectHoliday={(h) => setSelectedHoliday(h)}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            holidays={allHolidaysList}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectHoliday={(h) => setSelectedHoliday(h)}
            onExploreClick={() => setActiveTab('search')}
          />
        )}

        {activeTab === 'install' && (
          <InstallView
            deferredPrompt={deferredPrompt}
            onInstallClick={handleTriggerInstall}
          />
        )}

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-xs font-semibold text-[#BCC3C9]/60 tracking-wider">
            Made by Eryk Paluch
          </p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        favoritesCount={favorites.length}
        todayCount={todayCount}
      />

      {/* Holiday Detail Modal */}
      <HolidayDetailModal
        holiday={selectedHoliday}
        isFavorite={selectedHoliday ? favorites.includes(selectedHoliday.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setSelectedHoliday(null)}
        onOpenAISettings={() => setIsAISettingsModalOpen(true)}
      />

      {/* Add Custom Holiday Modal */}
      <AddHolidayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHoliday={handleAddHoliday}
      />

      {/* Install App Guide Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallClick={handleTriggerInstall}
      />

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isAISettingsModalOpen}
        onClose={() => setIsAISettingsModalOpen(false)}
      />
    </div>
  );
};

export default App;
