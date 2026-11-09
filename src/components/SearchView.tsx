import React, { useMemo, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Holiday, HolidayCategory } from '../types';
import { CATEGORIES, MONTHS } from '../data/categories';
import { HolidayCard } from './HolidayCard';
import { triggerHaptic } from '../utils/calendarUtils';

interface SearchViewProps {
  holidays: Holiday[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectHoliday: (holiday: Holiday) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  holidays,
  favorites,
  onToggleFavorite,
  onSelectHoliday,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HolidayCategory>('Wszystkie');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [onlyPublicHolidays, setOnlyPublicHolidays] = useState(false);

  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const matchName = h.name.toLowerCase().includes(query);
          const matchDesc = h.description.toLowerCase().includes(query);
          const matchIdea = h.schoolIdea?.toLowerCase().includes(query) || false;
          const matchTags = h.hashtags.toLowerCase().includes(query);
          const matchDress = h.dressCode?.toLowerCase().includes(query) || false;
          const matchImieniny = h.nameDays?.some((n) => n.toLowerCase().includes(query)) || false;
          const matchAllDay = h.allDayHolidays?.some((other) => other.toLowerCase().includes(query)) || false;

          const monthObj = MONTHS.find((m) => m.number === h.month);
          const dateStr1 = `${h.day} ${monthObj?.name.toLowerCase()}`;
          const dateStr2 = `${h.day}.${h.month < 10 ? '0' + h.month : h.month}`;
          const matchDate = dateStr1.includes(query) || dateStr2.includes(query);

          if (!matchName && !matchDesc && !matchIdea && !matchTags && !matchDress && !matchImieniny && !matchAllDay && !matchDate) {
            return false;
          }
        }

        if (selectedCategory !== 'Wszystkie') {
          if (selectedCategory === 'Własne') {
            if (!h.isCustom) return false;
          } else if (selectedCategory === 'Imieniny') {
            if (!h.nameDays || h.nameDays.length === 0) return false;
          } else if (h.category !== selectedCategory) {
            return false;
          }
        }

        if (selectedMonth !== 0 && h.month !== selectedMonth) {
          return false;
        }

        if (onlyPublicHolidays && !h.isPublicHoliday) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.month - b.month || a.day - b.day);
  }, [holidays, searchTerm, selectedCategory, selectedMonth, onlyPublicHolidays]);

  const clearFilters = () => {
    triggerHaptic();
    setSearchTerm('');
    setSelectedCategory('Wszystkie');
    setSelectedMonth(0);
    setOnlyPublicHolidays(false);
  };

  const hasActiveFilters =
    searchTerm !== '' || selectedCategory !== 'Wszystkie' || selectedMonth !== 0 || onlyPublicHolidays;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BCC3C9]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Szukaj święta, daty (np. 19 listopada) lub imienia..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#243235] border border-[#334346] text-sm text-white placeholder-[#BCC3C9]/60 focus:outline-none focus:border-[#D97652] shadow-lg shadow-black/20"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#182022] text-[#BCC3C9] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic();
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#D97652] text-white shadow-sm'
                  : 'bg-[#243235] hover:bg-[#2C3B3E] text-[#BCC3C9] border border-[#334346]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filters */}
      <div className="flex items-center justify-between gap-2 bg-[#243235]/60 p-2.5 rounded-2xl border border-[#334346] text-xs">
        <div className="flex items-center gap-2">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => {
              triggerHaptic();
              setSelectedMonth(Number(e.target.value));
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#182022] border border-[#334346] text-[#BCC3C9] text-xs focus:outline-none focus:border-[#D97652]"
          >
            <option value={0}>Wszystkie miesiące</option>
            {MONTHS.map((m) => (
              <option key={m.number} value={m.number}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Public holidays filter button */}
          <button
            onClick={() => {
              triggerHaptic();
              setOnlyPublicHolidays(!onlyPublicHolidays);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              onlyPublicHolidays
                ? 'bg-[#73321A]/50 text-[#F2AB91] border border-[#D97652]/40 shadow-sm'
                : 'bg-[#182022] text-[#BCC3C9] hover:text-white border border-[#334346]'
            }`}
          >
            <span>Dni wolne</span>
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[11px] font-semibold text-[#F2AB91] hover:text-white underline"
          >
            Wyczyść
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[#BCC3C9] font-medium">
          Wyniki: <strong className="text-white">{filteredHolidays.length}</strong>
        </span>
      </div>

      {/* Results List */}
      {filteredHolidays.length === 0 ? (
        <div className="p-8 text-center bg-[#243235]/40 rounded-3xl border border-[#334346]">
          <p className="text-sm font-semibold text-[#F8FAFC]">Nie znaleziono pasujących okazji</p>
          <p className="text-xs text-[#BCC3C9] mt-1">Zmień frazę wyszukiwania lub zresetuj aktywne filtry.</p>
          <button
            onClick={clearFilters}
            className="mt-3 px-3 py-1.5 rounded-xl bg-[#182022] text-[#F2AB91] text-xs font-semibold border border-[#334346]"
          >
            Wyczyść filtry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredHolidays.map((holiday) => (
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
  );
};
