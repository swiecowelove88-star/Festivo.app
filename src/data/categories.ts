import { HolidayCategory } from '../types';

export const CATEGORIES: { id: HolidayCategory; label: string; icon: string; color: string; bg: string }[] = [
  { id: 'Wszystkie', label: 'Wszystkie', icon: '🌟', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  { id: 'Państwowe & Tradycyjne', label: 'Państwowe & Tradycyjne', icon: '🇵🇱', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { id: 'Zdrowie & Świadomość', label: 'Zdrowie & Świadomość', icon: '🩺', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'Zabawa & Moda', label: 'Zabawa & Moda', icon: '🎉', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { id: 'Kulinaria', label: 'Kulinaria & Smaki', icon: '🍕', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'Integracja & Życzliwość', label: 'Integracja & Życzliwość', icon: '🤗', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'Edukacja & Nauka', label: 'Edukacja & Nauka', icon: '🔬', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { id: 'Środowisko & Eko', label: 'Środowisko & Eko', icon: '🌱', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { id: 'Popkultura & Gry', label: 'Popkultura & Gry', icon: '🎮', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'Własne', label: 'Własne święta', icon: '✏️', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
];

export const MONTHS = [
  { number: 1, name: 'Styczeń', shortName: 'Sty', daysCount: 31 },
  { number: 2, name: 'Luty', shortName: 'Lut', daysCount: 29 },
  { number: 3, name: 'Marzec', shortName: 'Mar', daysCount: 31 },
  { number: 4, name: 'Kwiecień', shortName: 'Kwi', daysCount: 30 },
  { number: 5, name: 'Maj', shortName: 'Maj', daysCount: 31 },
  { number: 6, name: 'Czerwiec', shortName: 'Cze', daysCount: 30 },
  { number: 7, name: 'Lipiec', shortName: 'Lip', daysCount: 31 },
  { number: 8, name: 'Sierpień', shortName: 'Sie', daysCount: 31 },
  { number: 9, name: 'Wrzesień', shortName: 'Wrz', daysCount: 30 },
  { number: 10, name: 'Październik', shortName: 'Paź', daysCount: 31 },
  { number: 11, name: 'Listopad', shortName: 'Lis', daysCount: 30 },
  { number: 12, name: 'Grudzień', shortName: 'Gru', daysCount: 31 },
];
