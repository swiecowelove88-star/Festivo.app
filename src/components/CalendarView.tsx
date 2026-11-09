import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Holiday } from '../types';
import { MONTHS } from '../data/categories';
import { HolidayCard } from './HolidayCard';
import { triggerHaptic } from '../utils/calendarUtils';

interface CalendarViewProps {
  holidays: Holiday[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectHoliday: (holiday: Holiday) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  holidays,
  favorites,
  onToggleFavorite,
  onSelectHoliday,
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const currentMonthInfo = MONTHS.find((m) => m.number === selectedMonth) || MONTHS[0];

  const monthHolidays = holidays.filter((h) => h.month === selectedMonth);

  const holidaysByDay: { [day: number]: Holiday[] } = {};
  monthHolidays.forEach((h) => {
    if (!holidaysByDay[h.day]) holidaysByDay[h.day] = [];
    holidaysByDay[h.day].push(h);
  });

  const displayHolidays = selectedDay
    ? monthHolidays.filter((h) => h.day === selectedDay)
    : monthHolidays.sort((a, b) => a.day - b.day);

  const handlePrevMonth = () => {
    triggerHaptic();
    setSelectedDay(null);
    setSelectedMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    triggerHaptic();
    setSelectedDay(null);
    setSelectedMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const daysArray = Array.from({ length: currentMonthInfo.daysCount }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {/* Month Navigation Card */}
      <div className="bg-[#243235] border border-[#334346] rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white border border-[#334346] active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#D97652]" />
              <span>{currentMonthInfo.name}</span>
            </h2>
            <p className="text-[11px] text-[#BCC3C9]">
              {monthHolidays.length} {monthHolidays.length === 1 ? 'okazja' : 'okazji'} w tym miesiącu
            </p>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white border border-[#334346] active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Month Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {MONTHS.map((m) => {
            const isCurrent = m.number === selectedMonth;

            return (
              <button
                key={m.number}
                onClick={() => {
                  triggerHaptic();
                  setSelectedDay(null);
                  setSelectedMonth(m.number);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-[#D97652] text-white shadow-sm'
                    : 'bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white border border-[#334346]'
                }`}
              >
                <span>{m.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Days Grid */}
        <div className="mt-3">
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-[#BCC3C9] py-1">
                {d}
              </span>
            ))}

            {daysArray.map((day) => {
              const dayHolidays = holidaysByDay[day] || [];
              const isSelected = selectedDay === day;
              const isToday =
                currentDate.getDate() === day && currentDate.getMonth() + 1 === selectedMonth;
              const hasPublicHoliday = dayHolidays.some((h) => h.isPublicHoliday);

              return (
                <button
                  key={day}
                  onClick={() => {
                    triggerHaptic();
                    setSelectedDay(isSelected ? null : day);
                  }}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-between transition-all relative ${
                    isSelected
                      ? 'bg-[#D97652] text-white ring-2 ring-[#F2AB91] font-bold shadow-sm'
                      : isToday
                      ? 'bg-[#73321A]/50 text-[#F2AB91] border border-[#D97652]/60 font-bold'
                      : dayHolidays.length > 0
                      ? 'bg-[#182022] hover:bg-[#2C3B3E] text-[#F8FAFC] border border-[#334346]'
                      : 'bg-[#182022]/40 text-[#BCC3C9]/60 hover:text-[#BCC3C9]'
                  }`}
                >
                  <span className="text-[11px]">{day}</span>
                  {dayHolidays.length > 0 && (
                    <div className="flex items-center justify-center space-x-0.5 overflow-hidden">
                      {hasPublicHoliday && (
                        <span className="w-1.5 h-1.5 rounded-sm bg-[#D97652] shrink-0" />
                      )}
                      <span className="text-[9px] leading-none select-none">
                        {dayHolidays[0].icon}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Reset if day selected */}
        {selectedDay && (
          <div className="mt-3 pt-2.5 border-t border-[#334346] flex items-center justify-between text-xs">
            <span className="text-[#BCC3C9]">
              Dzień: <strong className="text-white">{selectedDay} {currentMonthInfo.name}</strong>
            </span>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-[#F2AB91] hover:text-white font-semibold underline text-xs"
            >
              Pokaż cały miesiąc
            </button>
          </div>
        )}
      </div>

      {/* Holidays List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-[#F8FAFC]">
            {selectedDay
              ? `Okazje: ${selectedDay} ${currentMonthInfo.name}`
              : `Wszystkie okazje: ${currentMonthInfo.name}`}
          </h3>
          <span className="text-xs text-[#BCC3C9]">
            Pozycji: {displayHolidays.length}
          </span>
        </div>

        {displayHolidays.length === 0 ? (
          <div className="p-8 text-center bg-[#243235]/40 rounded-2xl border border-[#334346]">
            <p className="text-sm text-[#BCC3C9]">Brak zapisanych okazji na ten dzień.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {displayHolidays.map((holiday) => (
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
      </div>
    </div>
  );
};
