import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCheck,
  Package,
  QrCode,
  Smartphone,
  Wifi,
  Zap,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../utils/calendarUtils';

interface InstallViewProps {
  deferredPrompt: any;
  onInstallClick: () => void;
}

export const InstallView: React.FC<InstallViewProps> = ({
  deferredPrompt,
  onInstallClick,
}) => {
  const [copiedApkUrl, setCopiedApkUrl] = useState(false);
  const [copiedWebUrl, setCopiedWebUrl] = useState(false);

  // Network origin
  const localIp = '10.10.201.50';
  const localPort = '5173';
  const networkOrigin = `http://${localIp}:${localPort}`;

  const activeOrigin =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
      ? window.location.origin
      : networkOrigin;

  const apkUrl = `${activeOrigin}/festivo.apk`;
  const webUrl = activeOrigin;

  const handleCopyApkUrl = () => {
    triggerHaptic();
    navigator.clipboard.writeText(apkUrl);
    setCopiedApkUrl(true);
    setTimeout(() => setCopiedApkUrl(false), 2000);
  };

  const handleCopyWebUrl = () => {
    triggerHaptic();
    navigator.clipboard.writeText(webUrl);
    setCopiedWebUrl(true);
    setTimeout(() => setCopiedWebUrl(false), 2000);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* 1. NATIVE ANDROID APK DOWNLOAD HERO (FESTIVO) */}
      <div className="bg-[#243235] border border-[#334346] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-2 text-[#F2AB91] font-bold text-xs uppercase tracking-wider mb-2">
          <Package className="w-4 h-4 text-[#D97652]" />
          <span>Aplikacja Android (.APK)</span>
          <span className="px-2 py-0.5 rounded-md bg-[#73321A]/30 text-[#F2AB91] text-[10px] font-bold border border-[#D97652]/40">
            Wersja 1.0.0
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          Festivo na telefon (Redmi 8 & Android)
        </h2>
        <p className="text-xs sm:text-sm text-[#BCC3C9] mt-1.5 leading-relaxed">
          Pobierz bezpośredni instalator <strong className="text-white">festivo.apk</strong> (4.3 MB). Działa natywnie na telefonie bez konieczności korzystania ze sklepu Play.
        </p>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <a
            href={apkUrl}
            download="festivo.apk"
            onClick={() => triggerHaptic()}
            className="flex-1 py-3.5 px-4 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
          >
            <Download className="w-4 h-4" />
            <span>Pobierz festivo.apk (4.3 MB)</span>
          </a>

          <button
            onClick={handleCopyApkUrl}
            className="py-3 px-4 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white border border-[#334346] text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {copiedApkUrl ? <Check className="w-4 h-4 text-[#F2AB91]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedApkUrl ? 'Skopiowano link' : 'Kopiuj bezpośredni link'}</span>
          </button>
        </div>

        {/* QR CODE BOX */}
        <div className="mt-5 bg-[#182022] p-5 rounded-2xl border border-[#334346] flex flex-col items-center justify-center text-center space-y-3">
          <div className="flex items-center gap-2 text-[#F2AB91] text-xs font-bold">
            <QrCode className="w-4 h-4" />
            <span>Zeskanuj aparatem telefonu, aby pobrać APK:</span>
          </div>

          <div className="p-3 bg-white rounded-xl shadow-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(apkUrl)}`}
              alt="Kod QR do pobrania festivo.apk"
              className="w-44 h-44 rounded-lg select-none"
              loading="lazy"
            />
          </div>

          <p className="text-[11px] text-[#BCC3C9] max-w-sm leading-relaxed">
            Skieruj aparat telefonu na kod QR. Kliknij wyświetlone powiadomienie, a telefon natychmiast rozpocznie pobieranie pliku APK.
          </p>
        </div>

        {/* Quick Install Guide */}
        <div className="mt-4 bg-[#182022] p-4 rounded-2xl border border-[#2C3B3E] space-y-2 text-xs text-[#BCC3C9]">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4 text-[#D97652]" />
            <span>Instalacja pliku APK na telefonie:</span>
          </h4>
          <ol className="space-y-1.5 list-decimal list-inside leading-relaxed text-[#BCC3C9]">
            <li>
              Po pobraniu dotknij plik <strong className="text-white">festivo.apk</strong> w powiadomieniach (lub w <em>Pobrane</em>).
            </li>
            <li>
              Gdy system zapyta o instalację, wybierz <strong className="text-white">Ustawienia</strong> i włącz <strong className="text-[#F2AB91]">Zezwalaj z tego źródła</strong>.
            </li>
            <li>
              Kliknij <strong className="text-[#F2AB91]">Zainstaluj</strong>. Ikona Festivo pojawi się na ekranie głównym.
            </li>
          </ol>
        </div>
      </div>

      {/* 2. BROWSER VERSION */}
      <div className="bg-[#243235] border border-[#334346] rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-[#F2AB91] font-bold text-xs uppercase tracking-wider">
          <Wifi className="w-4 h-4 text-[#D97652]" />
          <span>Dostęp w lokalnej sieci Wi-Fi</span>
        </div>
        <p className="text-xs text-[#BCC3C9] leading-relaxed">
          Możesz także korzystać z Festivo bezpośrednio w przeglądarce mobilnej Chrome:
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#182022] border border-[#334346] font-mono text-xs text-[#F2AB91]">
          <span className="font-bold select-all truncate">{webUrl}</span>
          <button
            onClick={handleCopyWebUrl}
            className="ml-2 px-3 py-1.5 rounded-lg bg-[#243235] hover:bg-[#2C3B3E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 border border-[#334346]"
          >
            {copiedWebUrl ? <Check className="w-3.5 h-3.5 text-[#F2AB91]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedWebUrl ? 'Skopiowano' : 'Kopiuj'}</span>
          </button>
        </div>

        {deferredPrompt && (
          <button
            onClick={() => {
              triggerHaptic();
              onInstallClick();
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Zainstaluj jako aplikację PWA</span>
          </button>
        )}
      </div>

      {/* Features Overview */}
      <div className="bg-[#243235]/60 border border-[#334346] rounded-3xl p-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2">
          <span className="font-bold text-white block">366 Dni</span>
          <span className="text-[10px] text-[#BCC3C9]">Wszystkie okazje roku</span>
        </div>
        <div className="p-2">
          <span className="font-bold text-white block">Imieniny</span>
          <span className="text-[10px] text-[#BCC3C9]">Dla każdego dnia</span>
        </div>
        <div className="p-2">
          <span className="font-bold text-white block">Moduł AI</span>
          <span className="text-[10px] text-[#BCC3C9]">TikTok & Facebook</span>
        </div>
      </div>
    </div>
  );
};
