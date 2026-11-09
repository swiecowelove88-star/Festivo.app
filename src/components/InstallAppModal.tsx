import React, { useState } from 'react';
import { Apple, Check, Copy, Download, Globe, Smartphone, Wifi, X } from 'lucide-react';
import { triggerHaptic } from '../utils/calendarUtils';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallClick,
}) => {
  if (!isOpen) return null;

  const [copiedUrl, setCopiedUrl] = useState(false);
  const localWifiUrl = 'http://10.10.201.50:5173';

  const handleCopyUrl = () => {
    triggerHaptic();
    navigator.clipboard.writeText(localWifiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-selectable="true"
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[#243235] border border-[#334346] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 text-[#F8FAFC] flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334346]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D97652] text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Festivo na telefonie
              </h2>
              <p className="text-[11px] text-[#BCC3C9]">Instalacja aplikacji mobilnej</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white border border-[#334346] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Install Button if supported */}
        {deferredPrompt && (
          <div className="bg-[#182022] p-4 rounded-2xl border border-[#D97652]/40 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">Instalacja PWA dostępna</p>
              <p className="text-xs text-[#BCC3C9] mt-0.5">
                Możesz dodać aplikację do ekranu głównego jednym kliknięciem.
              </p>
            </div>
            <button
              onClick={() => {
                triggerHaptic();
                onInstallClick();
              }}
              className="px-4 py-2 bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Zainstaluj</span>
            </button>
          </div>
        )}

        {/* Local Wi-Fi direct address */}
        <div className="bg-[#182022] p-4 rounded-2xl border border-[#334346]">
          <div className="flex items-center space-x-2 text-[#F2AB91] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Wifi className="w-4 h-4 text-[#D97652]" />
            <span>Adres w domowej sieci Wi-Fi</span>
          </div>
          <p className="text-xs text-[#BCC3C9] leading-relaxed">
            Wpisz poniższy adres w przeglądarce telefonu połączonego z tym samym Wi-Fi:
          </p>
          <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-[#243235] border border-[#334346] font-mono text-xs text-[#F2AB91]">
            <span className="font-bold select-all truncate">{localWifiUrl}</span>
            <button
              onClick={handleCopyUrl}
              className="ml-2 px-3 py-1.5 rounded-lg bg-[#D97652] hover:bg-[#C26340] text-white text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 shrink-0"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Skopiowano' : 'Kopiuj'}</span>
            </button>
          </div>
        </div>

        {/* Android Guide */}
        <div className="bg-[#182022] p-4 rounded-2xl border border-[#334346]">
          <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider mb-2">
            <Globe className="w-4 h-4 text-[#D97652]" />
            <span>Instrukcja dla Android (Google Chrome)</span>
          </div>
          <ol className="space-y-2 text-xs text-[#BCC3C9] list-decimal list-inside leading-relaxed">
            <li>
              Otwórz stronę w aplikacji <strong className="text-white">Chrome</strong> na telefonie.
            </li>
            <li>
              Dotknij menu z trzema kropkami <strong className="text-white">⋮</strong> w prawym górnym rogu.
            </li>
            <li>
              Wybierz <strong className="text-[#F2AB91]">"Zainstaluj aplikację"</strong> lub <strong className="text-[#F2AB91]">"Dodaj do ekranu głównego"</strong>.
            </li>
          </ol>
        </div>

        {/* iPhone (iOS Safari) Guide */}
        <div className="bg-[#182022] p-4 rounded-2xl border border-[#334346]">
          <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider mb-2">
            <Apple className="w-4 h-4 text-[#D97652]" />
            <span>Instrukcja dla iPhone (iOS Safari)</span>
          </div>
          <ol className="space-y-2 text-xs text-[#BCC3C9] list-decimal list-inside leading-relaxed">
            <li>
              Otwórz stronę w przeglądarce <strong className="text-white">Safari</strong>.
            </li>
            <li>
              Dotknij przycisku <strong className="text-[#F2AB91]">Udostępnij</strong> (kwadrat ze strzałką w górę na dole ekranu).
            </li>
            <li>
              Wybierz z listy opcję <strong className="text-[#F2AB91]">"Do ekranu początkowego"</strong> i dotknij <strong className="text-white">Dodaj</strong>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
