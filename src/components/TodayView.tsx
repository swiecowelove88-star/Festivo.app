import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Flame, Zap } from 'lucide-react';
import { Holiday } from '../types';
import { HolidayCard } from './HolidayCard';
import { getDaysUntilHoliday, triggerHaptic } from '../utils/calendarUtils';

interface TodayViewProps {
  holidays: Holiday[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectHoliday: (holiday: Holiday) => void;
  onSwitchToSearch: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  holidays,
  favorites,
  onToggleFavorite,
  onSelectHoliday,
}) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const todayHolidays = holidays.filter(
    (h) => h.month === currentMonth && h.day === currentDay
  );

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowMonth = tomorrow.getMonth() + 1;
  const tomorrowDay = tomorrow.getDate();
  const tomorrowHolidays = holidays.filter(
    (h) => h.month === tomorrowMonth && h.day === tomorrowDay
  );

  const upcomingHolidays = holidays
    .map((h) => ({ holiday: h, daysUntil: getDaysUntilHoliday(h, now) }))
    .filter((item) => item.daysUntil > 1 && item.daysUntil <= 14)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .map((item) => item.holiday);

  const publicHolidaysCount = holidays.filter((h) => h.isPublicHoliday).length;

  return (
    <div className="space-y-6">
      {/* Banner / Stat Overview */}
      <div className="bg-[#243235] border border-[#334346] rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F2AB91]">
              Festivo • Kalendarz Świąt & Social Planner
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Dzisiejsze okazje
            </h2>
          </div>

          <span className="px-3 py-1 rounded-xl bg-[#182022] text-[#BCC3C9] border border-[#334346] text-xs font-mono font-semibold">
            {currentDay}.{currentMonth < 10 ? `0${currentMonth}` : currentMonth}
          </span>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#182022] p-3 rounded-2xl border border-[#334346] text-center">
            <span className="block text-xl font-black text-white">{holidays.length}</span>
            <span className="text-[10px] text-[#BCC3C9] font-medium">Wszystkich okazji</span>
          </div>
          <div className="bg-[#182022] p-3 rounded-2xl border border-[#334346] text-center">
            <span className="block text-xl font-black text-[#F2AB91]">{publicHolidaysCount}</span>
            <span className="text-[10px] text-[#BCC3C9] font-medium">Dni wolnych</span>
          </div>
          <div className="bg-[#182022] p-3 rounded-2xl border border-[#334346] text-center">
            <span className="block text-xl font-black text-[#D97652]">{favorites.length}</span>
            <span className="text-[10px] text-[#BCC3C9] font-medium">Ulubionych</span>
          </div>
        </div>
      </div>

      {/* TODAY'S HOLIDAYS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#73321A]/30 text-[#F2AB91]">
              <Flame className="w-4 h-4 fill-[#D97652] text-[#D97652]" />
            </span>
            <span>Święta na dziś ({currentDay}.{currentMonth < 10 ? `0${currentMonth}` : currentMonth})</span>
          </h3>
          {todayHolidays.length > 0 && (
            <span className="text-xs font-bold text-[#F2AB91] bg-[#73321A]/40 px-2 py-0.5 rounded-md border border-[#D97652]/40">
              DZIŚ
            </span>
          )}
        </div>

        {todayHolidays.length === 0 ? (
          <div className="bg-[#243235]/60 border border-[#334346] rounded-2xl p-5 text-center">
            <p className="text-sm font-semibold text-[#F8FAFC]">
              Brak zdefiniowanego święta nietypowego na dzisiejszy dzień.
            </p>
            <p className="text-xs text-[#BCC3C9] mt-1">
              Sprawdź co wypada jutro lub przejrzyj nadchodzące okazje w kalendarzu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {todayHolidays.map((holiday) => (
              <HolidayCard
                key={holiday.id}
                holiday={holiday}
                isFavorite={favorites.includes(holiday.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectHoliday}
              />
            ))}
          </div>
        )}
      </section>

      {/* TOMORROW'S HOLIDAYS */}
      {tomorrowHolidays.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-sm text-[#F8FAFC] flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#73321A]/30 text-[#F2AB91]">
                <Zap className="w-4 h-4 text-[#D97652]" />
              </span>
              <span>Jutro ({tomorrowDay}.{tomorrowMonth < 10 ? `0${tomorrowMonth}` : tomorrowMonth})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {tomorrowHolidays.map((holiday) => (
              <HolidayCard
                key={holiday.id}
                holiday={holiday}
                isFavorite={favorites.includes(holiday.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectHoliday}
              />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING NEXT 14 DAYS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-[#F8FAFC] flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#425759]/40 text-[#BCC3C9]">
              <Calendar className="w-4 h-4 text-[#D97652]" />
            </span>
            <span>Najbliższe 14 dni</span>
          </h3>
          <span className="text-xs text-[#F2AB91] font-semibold">
            {upcomingHolidays.length} pozycji
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {upcomingHolidays.map((holiday) => (
            <HolidayCard
              key={holiday.id}
              holiday={holiday}
              isFavorite={favorites.includes(holiday.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectHoliday}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
