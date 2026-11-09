import React from 'react';
import { Compass, Heart } from 'lucide-react';
import { Holiday } from '../types';
import { HolidayCard } from './HolidayCard';
import { triggerHaptic } from '../utils/calendarUtils';

interface FavoritesViewProps {
  holidays: Holiday[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectHoliday: (holiday: Holiday) => void;
  onExploreClick: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  holidays,
  favorites,
  onToggleFavorite,
  onSelectHoliday,
  onExploreClick,
}) => {
  const favoriteHolidays = holidays
    .filter((h) => favorites.includes(h.id))
    .sort((a, b) => a.month - b.month || a.day - b.day);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D97652] fill-[#D97652]" />
            <span>Twoje Ulubione Święta</span>
          </h2>
          <p className="text-xs text-[#BCC3C9]">
            Zapisane dni, do których masz natychmiastowy dostęp
          </p>
        </div>
        <span className="text-xs font-bold text-[#F2AB91] bg-[#73321A]/30 px-2.5 py-1 rounded-md border border-[#D97652]/40">
          {favoriteHolidays.length}
        </span>
      </div>

      {favoriteHolidays.length === 0 ? (
        <div className="bg-[#243235]/60 border border-[#334346] rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#73321A]/30 text-[#F2AB91] border border-[#D97652]/30 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Brak ulubionych świąt</h3>
            <p className="text-xs text-[#BCC3C9] mt-1 max-w-xs mx-auto">
              Kliknij serduszko przy dowolnej dacie, aby zapisać ją w ulubionych.
            </p>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onExploreClick();
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Przeglądaj wszystkie okazje</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {favoriteHolidays.map((holiday) => (
            <HolidayCard
              key={holiday.id}
              holiday={holiday}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectHoliday}
            />
          ))}
        </div>
      )}
    </div>
  );
};
