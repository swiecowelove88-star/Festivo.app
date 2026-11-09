import React from 'react';
import { Bot, Plus, Share2 } from 'lucide-react';
import { triggerHaptic } from '../utils/calendarUtils';
import { hasConfiguredAI } from '../services/aiService';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenAISettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenAISettings,
}) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const isAIActive = hasConfiguredAI();

  const handleShare = async () => {
    triggerHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Festivo — Kalendarz Świąt & Social Planner',
          text: 'Sprawdź wszystkie święta, pomysły do szkoły i gotowe posty w Festivo!',
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Skopiowano link do Festivo!');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#182022]/95 backdrop-blur-md border-b border-[#3D4F52]/60 px-4 py-3 pt-safe">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Festivo Wordmark & Symbol */}
        <div className="flex items-center space-x-3">
          <div className="h-8 flex items-center">
            <img
              src="/festivo-logo-light.svg"
              alt="Festivo"
              className="h-7 w-auto select-none"
            />
          </div>
          <div className="hidden sm:block border-l border-[#3D4F52]/70 pl-3">
            <p className="text-xs text-[#BCC3C9] capitalize font-medium">
              {dateFormatted}
            </p>
          </div>
        </div>

        {/* Quiet, Elegant Action Buttons - NO circular buttons */}
        <div className="flex items-center space-x-2">
          {/* AI Settings Button */}
          <button
            onClick={() => {
              triggerHaptic();
              onOpenAISettings();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#243235] hover:bg-[#2B3B3E] border border-[#425759]/70 text-[#F8FAFC] text-xs font-semibold active:scale-95 transition-all relative"
            title="Ustawienia AI"
          >
            <Bot className="w-3.5 h-3.5 text-[#D97652]" />
            <span>AI</span>
            {isAIActive ? (
              <span className="w-1.5 h-1.5 rounded-sm bg-[#D97652]" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-sm bg-[#73321A]" />
            )}
          </button>

          {/* Add Custom Holiday */}
          <button
            onClick={() => {
              triggerHaptic();
              onOpenAddModal();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#243235] hover:bg-[#2B3B3E] border border-[#425759]/70 text-[#F8FAFC] text-xs font-semibold active:scale-95 transition-all"
            title="Dodaj święto"
          >
            <Plus className="w-3.5 h-3.5 text-[#F2AB91]" />
            <span className="hidden sm:inline">Własne</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#243235] hover:bg-[#2B3B3E] border border-[#425759]/70 text-[#BCC3C9] hover:text-[#F8FAFC] active:scale-95 transition-all"
            title="Udostępnij"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
