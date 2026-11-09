import { Holiday } from '../types';

/**
 * Returns number of days until the holiday from a given date
 */
export function getDaysUntilHoliday(holiday: Holiday, fromDate: Date = new Date()): number {
  const currentYear = fromDate.getFullYear();
  let holidayDate = new Date(currentYear, holiday.month - 1, holiday.day);

  // If the holiday already occurred this year, look at next year
  const today = new Date(currentYear, fromDate.getMonth(), fromDate.getDate());
  if (holidayDate < today) {
    holidayDate = new Date(currentYear + 1, holiday.month - 1, holiday.day);
  }

  const diffTime = holidayDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Returns a human friendly countdown string in Polish
 */
export function getCountdownBadge(holiday: Holiday, fromDate: Date = new Date()): { label: string; isToday: boolean; isTomorrow: boolean; color: string } {
  const days = getDaysUntilHoliday(holiday, fromDate);

  if (days === 0) {
    return { label: '🔥 DZIŚ!', isToday: true, isTomorrow: false, color: 'bg-rose-500 text-white animate-pulse' };
  }
  if (days === 1) {
    return { label: '⚡ Jutro!', isToday: false, isTomorrow: true, color: 'bg-amber-500 text-white font-bold' };
  }
  if (days <= 7) {
    return { label: `Za ${days} dni`, isToday: false, isTomorrow: false, color: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' };
  }
  if (days <= 30) {
    return { label: `Za ${days} dni`, isToday: false, isTomorrow: false, color: 'bg-slate-800 text-slate-300' };
  }
  return { label: `Za ${days} dni`, isToday: false, isTomorrow: false, color: 'bg-slate-800/60 text-slate-400' };
}

/**
 * Export a holiday as an .ics (iCalendar) file for iPhone and Android Calendar
 */
export function exportToIcs(holiday: Holiday) {
  const year = new Date().getFullYear();
  const monthStr = String(holiday.month).padStart(2, '0');
  const dayStr = String(holiday.day).padStart(2, '0');

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Swieta Social Planner//PL',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${holiday.icon} ${holiday.name}`,
    `DESCRIPTION:${holiday.description}\\n\\nPomysł: ${holiday.schoolIdea || ''}\\nDress code: ${holiday.dressCode || ''}`,
    `DTSTART;VALUE=DATE:${year}${monthStr}${dayStr}`,
    `DTEND;VALUE=DATE:${year}${monthStr}${dayStr}`,
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${holiday.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger mobile haptic feedback if supported
 */
export function triggerHaptic(duration: number = 25) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore
    }
  }
}
