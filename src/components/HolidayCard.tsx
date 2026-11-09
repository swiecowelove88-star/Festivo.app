import React, { useState } from 'react';
import { Check, Copy, Heart, Info, Share2 } from 'lucide-react';
import { Holiday } from '../types';
import { getCountdownBadge, triggerHaptic } from '../utils/calendarUtils';
import { MONTHS } from '../data/categories';

interface HolidayCardProps {
  holiday: Holiday;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (holiday: Holiday) => void;
}

export const HolidayCard: React.FC<HolidayCardProps> = ({
  holiday,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const [copied, setCopied] = useState(false);
  const countdown = getCountdownBadge(holiday);
  const monthName = MONTHS.find((m) => m.number === holiday.month)?.name || '';

  const handleCopyHashtags = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    navigator.clipboard.writeText(holiday.hashtags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Festivo: ${holiday.name}`,
          text: `Sprawdź święto: ${holiday.name} (${holiday.day} ${monthName})! ${holiday.description}`,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(`${holiday.name} - ${holiday.description}`);
      alert('Skopiowano treść!');
    }
  };

  return (
    <article
      onClick={() => {
        triggerHaptic();
        onSelect(holiday);
      }}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
        countdown.isToday
          ? 'bg-gradient-to-br from-[#243235] via-[#2D393C] to-[#39201C] border-[#D97652] shadow-lg shadow-[#D97652]/10'
          : countdown.isTomorrow
          ? 'bg-[#243235] border-[#73321A]/80 shadow-sm'
          : 'bg-[#243235]/90 hover:bg-[#27363A] border-[#3D4F52]/60 hover:border-[#D97652]/50'
      } active:scale-[0.99]`}
    >
      {/* Top row: Date badge, category badge & Favorite toggle (NO circular buttons) */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Countdown badge */}
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              countdown.isToday
                ? 'bg-[#D97652] text-white'
                : countdown.isTomorrow
                ? 'bg-[#73321A] text-[#F2AB91]'
                : 'bg-[#182022] text-[#BCC3C9] border border-[#3D4F52]/50'
            }`}
          >
            {countdown.label}
          </span>

          {/* Date */}
          <span className="text-[11px] font-semibold text-[#F8FAFC] bg-[#182022] px-2 py-0.5 rounded-md border border-[#3D4F52]/50">
            {holiday.day} {monthName}
          </span>

          {/* Public holiday indicator */}
          {holiday.isPublicHoliday && (
            <span className="text-[10px] font-extrabold text-[#F2AB91] bg-[#401F18] border border-[#73321A]/70 px-2 py-0.5 rounded-md">
              Wolne
            </span>
          )}

          {/* Multiple holidays indicator */}
          {holiday.allDayHolidays && holiday.allDayHolidays.length > 1 && (
            <span className="text-[10px] font-semibold text-[#F2AB91] bg-[#39201C] px-1.5 py-0.5 rounded-md border border-[#73321A]/40">
              +{holiday.allDayHolidays.length - 1} inne
            </span>
          )}
        </div>

        {/* Favorite button (Sleek rounded-lg, NO circle) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic();
            onToggleFavorite(holiday.id);
          }}
          className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
            isFavorite
              ? 'text-[#D97652] bg-[#401F18] border-[#73321A]'
              : 'text-[#BCC3C9] hover:text-[#F2AB91] bg-[#182022] border-[#3D4F52]/60'
          }`}
          title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#D97652] text-[#D97652]' : ''}`} />
        </button>
      </div>

      {/* Main content: Emoji & Title */}
      <div className="flex items-start space-x-3">
        <span className="text-3xl select-none shrink-0 p-1.5 bg-[#182022] rounded-xl border border-[#3D4F52]/50">
          {holiday.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#F8FAFC] text-base tracking-tight leading-snug group-hover:text-[#F2AB91] transition-colors">
            {holiday.name}
          </h3>
          <p className="text-xs text-[#BCC3C9] line-clamp-2 mt-1 leading-relaxed">
            {holiday.description}
          </p>
        </div>
      </div>

      {/* Imieniny row */}
      {holiday.nameDays && holiday.nameDays.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#BCC3C9]">
          <span className="text-[#D97652] font-semibold shrink-0">Imieniny:</span>
          <span className="truncate text-[#E2E8F0]">
            {holiday.nameDays.slice(0, 5).join(', ')}
            {holiday.nameDays.length > 5 ? '...' : ''}
          </span>
        </div>
      )}

      {/* Bottom actions bar */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#3D4F52]/40">
        <span className="text-[11px] font-medium text-[#F2AB91] bg-[#39201C] px-2 py-0.5 rounded-md border border-[#73321A]/30">
          {holiday.category}
        </span>

        <div className="flex items-center space-x-1.5">
          {/* Quick copy hashtags */}
          <button
            onClick={handleCopyHashtags}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#182022] hover:bg-[#2B3B3E] text-[#BCC3C9] hover:text-[#F8FAFC] border border-[#3D4F52]/50 text-[11px] font-medium transition-all active:scale-95"
            title="Kopiuj hashtagi"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#D97652]" />
                <span className="text-[#D97652] font-bold">Skopiowano</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#BCC3C9]" />
                <span>Tagi</span>
              </>
            )}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-[#182022] hover:bg-[#2B3B3E] text-[#BCC3C9] hover:text-[#F8FAFC] border border-[#3D4F52]/50 transition-all active:scale-95"
            title="Udostępnij"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Details CTA */}
          <div className="p-1.5 rounded-lg bg-[#D97652]/20 text-[#D97652] border border-[#D97652]/30 flex items-center">
            <Info className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
};
