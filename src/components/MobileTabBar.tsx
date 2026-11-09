import React from 'react';
import { Calendar, Compass, Flame, Heart, Smartphone } from 'lucide-react';
import { TabType } from '../types';
import { triggerHaptic } from '../utils/calendarUtils';

interface MobileTabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  favoritesCount: number;
  todayCount: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onChangeTab,
  favoritesCount,
  todayCount,
}) => {
  const tabs = [
    {
      id: 'today' as TabType,
      label: 'Dziś',
      icon: Flame,
      badge: todayCount > 0 ? `${todayCount}` : undefined,
    },
    {
      id: 'calendar' as TabType,
      label: 'Kalendarz',
      icon: Calendar,
    },
    {
      id: 'search' as TabType,
      label: 'Wszystkie',
      icon: Compass,
    },
    {
      id: 'favorites' as TabType,
      label: 'Ulubione',
      icon: Heart,
      badge: favoritesCount > 0 ? `${favoritesCount}` : undefined,
    },
    {
      id: 'install' as TabType,
      label: 'Aplikacja',
      icon: Smartphone,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#182022]/98 backdrop-blur-xl border-t border-[#3D4F52]/60 px-3 pt-1.5 tabbar-pb-safe shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic();
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#F2AB91] bg-[#243235]/70'
                  : 'text-[#BCC3C9] hover:text-[#F8FAFC]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-transform duration-150 ${
                    isActive ? 'scale-105 text-[#D97652]' : 'opacity-70 text-[#BCC3C9]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-md text-[9px] font-bold bg-[#D97652] text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium tracking-tight truncate max-w-full ${
                  isActive ? 'text-[#F8FAFC] font-bold' : 'text-[#BCC3C9]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-[#D97652]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Made by Eryk Paluch signature */}
      <div className="text-center pt-1 pb-0.5">
        <p className="text-[9px] font-medium tracking-wider text-[#BCC3C9]/50 select-none">
          Made by Eryk Paluch
        </p>
      </div>
    </nav>
  );
};
