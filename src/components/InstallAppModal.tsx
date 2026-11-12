import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Apple,
  Check,
  Copy,
  Download,
  Globe,
  QrCode,
  Smartphone,
  Wifi,
  X,
} from 'lucide-react';
import { triggerHaptic } from '../utils/calendarUtils';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
}

type QrTargetMode = 'online' | 'apk' | 'local';

const ONLINE_URL = 'https://festivoapp.vercel.app/';
const APK_DIRECT_URL = 'https://festivoapp.vercel.app/festivo.apk';
const APK_MEDIAFIRE_URL = 'https://www.mediafire.com/file/bvgxsxgury9h9qm/festivo.apk/file';
const FALLBACK_LOCAL_URL = 'http://10.10.201.47:5173';

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallClick,
}) => {
  const [qrMode, setQrMode] = useState<QrTargetMode>('online');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrError, setQrError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const localNetworkUrl = useMemo(() => {
    if (typeof window === 'undefined') return FALLBACK_LOCAL_URL;
    const { protocol, origin } = window.location;
    if (
      (protocol === 'http:' || protocol === 'https:') &&
      origin !== 'https://festivoapp.vercel.app' &&
      !origin.startsWith('http://localhost') &&
      !origin.startsWith('https://localhost')
    ) {
      return origin;
    }
    return FALLBACK_LOCAL_URL;
  }, []);

  const activeTarget = useMemo(() => {
    if (qrMode === 'apk') {
      return {
        label: 'Android APK (bezpośrednie pobieranie)',
        description:
          'Zeskanuj aparatem na Androidzie, aby pobrać plik instalacyjny Festivo.apk.',
        url: APK_DIRECT_URL,
        fileName: 'festivo-qr-android-apk.png',
      };
    }
    if (qrMode === 'local') {
      return {
        label: 'Sieć domowa Wi-Fi',
        description:
          'Zeskanuj telefonem podłączonym do tej samej sieci Wi-Fi co komputer.',
        url: localNetworkUrl,
        fileName: 'festivo-qr-wifi.png',
      };
    }
    return {
      label: 'Wersja Online (iPhone & Android)',
      description:
        'Zeskanuj aparatem w telefonie — otworzy Festivo w przeglądarce, gotowe do dodania na ekran główny.',
      url: ONLINE_URL,
      fileName: 'festivo-qr-online.png',
    };
  }, [qrMode, localNetworkUrl]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setQrError(null);

    QRCode.toDataURL(activeTarget.url, {
      width: 440,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#182022',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrError('Nie udało się wygenerować kodu QR.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTarget.url]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    triggerHaptic();
    navigator.clipboard.writeText(activeTarget.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    triggerHaptic();
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = activeTarget.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <p className="text-[11px] text-[#BCC3C9]">Kod QR i szybka instalacja mobilna</p>
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

        {/* QR Code Section */}
        <div className="bg-[#182022] p-4 rounded-2xl border border-[#334346] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-[#F2AB91] text-xs font-bold uppercase tracking-wider">
              <QrCode className="w-4 h-4 text-[#D97652]" />
              <span>Zeskanuj kod QR telefonem</span>
            </div>
          </div>

          {/* QR Target Switcher */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#243235] p-1 rounded-xl border border-[#334346]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setQrMode('online');
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                qrMode === 'online'
                  ? 'bg-[#D97652] text-white shadow'
                  : 'text-[#BCC3C9] hover:text-white'
              }`}
            >
              Online (PWA)
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setQrMode('apk');
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                qrMode === 'apk'
                  ? 'bg-[#D97652] text-white shadow'
                  : 'text-[#BCC3C9] hover:text-white'
              }`}
            >
              Android APK
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setQrMode('local');
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                qrMode === 'local'
                  ? 'bg-[#D97652] text-white shadow'
                  : 'text-[#BCC3C9] hover:text-white'
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>Wi-Fi</span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center pt-1 space-y-2.5">
            {qrError ? (
              <div className="w-48 h-48 rounded-2xl bg-[#243235] border border-rose-500/40 flex items-center justify-center p-4 text-xs text-rose-300">
                {qrError}
              </div>
            ) : qrDataUrl ? (
              <div className="bg-white p-2.5 rounded-2xl shadow-lg border-2 border-[#D97652]/30">
                <img
                  src={qrDataUrl}
                  alt={`Kod QR - ${activeTarget.label}`}
                  className="w-44 h-44 sm:w-48 sm:h-48 block rounded-lg"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-2xl bg-[#243235] animate-pulse" />
            )}

            <div className="space-y-0.5 max-w-sm">
              <p className="text-xs font-bold text-white">{activeTarget.label}</p>
              <p className="text-[11px] text-[#BCC3C9] leading-relaxed">
                {activeTarget.description}
              </p>
            </div>
          </div>

          {/* URL & Actions */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#243235] border border-[#334346] font-mono text-[11px] text-[#F2AB91] gap-2">
            <span className="font-bold select-all truncate">{activeTarget.url}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-2.5 py-1.5 rounded-lg bg-[#182022] hover:bg-[#2C3B3E] text-[#F8FAFC] border border-[#334346] text-[11px] font-semibold font-sans flex items-center gap-1 transition-all active:scale-95"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Skopiowano' : 'Kopiuj'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!qrDataUrl}
                className="px-2.5 py-1.5 rounded-lg bg-[#D97652] hover:bg-[#C26340] disabled:opacity-50 text-white text-[11px] font-semibold font-sans flex items-center gap-1 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pobierz QR</span>
              </button>
            </div>
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
              Zeskanuj kod <strong className="text-white">Online (PWA)</strong> i otwórz w aplikacji <strong className="text-white">Chrome</strong> (albo użyj kodu <strong className="text-[#F2AB91]">Android APK</strong>).
            </li>
            <li>
              Dotknij menu z trzema kropkami <strong className="text-white">⋮</strong> w prawym górnym rogu.
            </li>
            <li>
              Wybierz <strong className="text-[#F2AB91]">"Zainstaluj aplikację"</strong> lub <strong className="text-[#F2AB91]">"Dodaj do ekranu głównego"</strong>.
            </li>
          </ol>
          <a
            href={APK_MEDIAFIRE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic()}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-[#243235] hover:bg-[#2C3B3E] text-[#F2AB91] border border-[#D97652]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#D97652]" />
            <span>Pobierz najnowszy plik festivo.apk (MediaFire)</span>
          </a>
        </div>

        {/* iPhone (iOS Safari) Guide */}
        <div className="bg-[#182022] p-4 rounded-2xl border border-[#334346]">
          <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider mb-2">
            <Apple className="w-4 h-4 text-[#D97652]" />
            <span>Instrukcja dla iPhone (iOS Safari)</span>
          </div>
          <ol className="space-y-2 text-xs text-[#BCC3C9] list-decimal list-inside leading-relaxed">
            <li>
              Zeskanuj kod <strong className="text-white">Online (PWA)</strong> aparatem i otwórz link w przeglądarce <strong className="text-white">Safari</strong>.
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
