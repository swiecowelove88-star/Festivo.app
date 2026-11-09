export type HolidayCategory =
  | 'Wszystkie'
  | 'Państwowe & Tradycyjne'
  | 'Zdrowie & Świadomość'
  | 'Zabawa & Moda'
  | 'Kulinaria'
  | 'Integracja & Życzliwość'
  | 'Edukacja & Nauka'
  | 'Środowisko & Eko'
  | 'Popkultura & Gry'
  | 'Imieniny'
  | 'Własne';

export interface Holiday {
  id: string;
  name: string;
  month: number; // 1-12
  day: number;   // 1-31
  category: HolidayCategory;
  icon: string;  // Emoji or symbol
  description: string;
  isPublicHoliday?: boolean; // Ustawowo wolne w Polsce
  schoolIdea?: string;
  dressCode?: string;
  socialIdeas?: string[];
  hashtags: string;
  postTemplate?: string;
  isCustom?: boolean;
  nameDays?: string[]; // Imieniny obchodzone w tym dniu (np. Elżbieta, Seweryn, Jakub...)
  allDayHolidays?: string[]; // Pozostałe święta obchodzone tego samego dnia
  dayOfYear?: number; // Np. 323. dzień roku
}

export type TabType = 'today' | 'calendar' | 'search' | 'favorites' | 'install';

export interface MonthInfo {
  number: number;
  name: string;
  shortName: string;
  daysCount: number;
}
