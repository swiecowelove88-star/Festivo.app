import React, { useEffect, useState } from 'react';
import {
  Bot,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Flame,
  Heart,
  Loader2,
  Maximize2,
  MessageSquare,
  Minimize2,
  RefreshCw,
  Share2,
  Shirt,
  Sparkles,
  Video,
  X,
  FileText
} from 'lucide-react';
import { Holiday } from '../types';
import { exportToIcs, getCountdownBadge, triggerHaptic } from '../utils/calendarUtils';
import { MONTHS } from '../data/categories';
import {
  AIGenerationResult,
  AITone,
  generateHolidaySocialIdeas,
  getAISettings,
  hasConfiguredAI,
} from '../services/aiService';

interface HolidayDetailModalProps {
  holiday: Holiday | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onOpenAISettings: () => void;
}

const AI_TONES: { id: AITone; label: string; desc: string }[] = [
  { id: 'humor', label: 'Szkolny humor', desc: 'Memy, codzienność szkolna, rel' },
  { id: 'interview', label: 'Sonda korytarzowa', desc: 'Szybkie pytania i wywiady z uczniami' },
  { id: 'pov', label: 'Filmowy POV', desc: 'Roleplay, dynamiczne ujęcia i zwroty akcji' },
  { id: 'official', label: 'Akcja i Samorząd', desc: 'Integracja szkoły i wyzwanie dla klas' },
];

export const HolidayDetailModal: React.FC<HolidayDetailModalProps> = ({
  holiday,
  isFavorite,
  onToggleFavorite,
  onClose,
  onOpenAISettings,
}) => {
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedAITikTok, setCopiedAITikTok] = useState(false);
  const [copiedAIFb, setCopiedAIFb] = useState(false);
  const [copiedAIRaw, setCopiedAIRaw] = useState(false);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIGenerationResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeAITab, setActiveAITab] = useState<'tiktok' | 'facebook' | 'raw'>('tiktok');
  const [selectedTone, setSelectedTone] = useState<AITone>('humor');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setAiResult(null);
    setAiError(null);
  }, [holiday?.id]);

  if (!holiday) return null;

  const countdown = getCountdownBadge(holiday);
  const monthName = MONTHS.find((m) => m.number === holiday.month)?.name || '';
  const aiSettings = getAISettings();
  const isAIReady = hasConfiguredAI();

  const handleCopyHashtags = () => {
    triggerHaptic();
    navigator.clipboard.writeText(holiday.hashtags);
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  const handleCopyAITikTok = () => {
    if (!aiResult) return;
    triggerHaptic();
    const text = `TYTUŁ: ${aiResult.tikTokIdea.title}\n\nHOOK (0-3s):\n${aiResult.tikTokIdea.hook}\n\nSCENARIUSZ:\n${aiResult.tikTokIdea.script}\n\nDŹWIĘK:\n${aiResult.tikTokIdea.audioTrend}\n\nOPIS:\n${aiResult.tikTokIdea.caption}\n\nHASHTAGI:\n${aiResult.tikTokIdea.hashtags}`;
    navigator.clipboard.writeText(text);
    setCopiedAITikTok(true);
    setTimeout(() => setCopiedAITikTok(false), 2000);
  };

  const handleCopyAIFb = () => {
    if (!aiResult) return;
    triggerHaptic();
    const text = `${aiResult.facebookPost.title}\n\n${aiResult.facebookPost.content}\n\n${aiResult.facebookPost.callToAction}\n\n${aiResult.facebookPost.hashtags}`;
    navigator.clipboard.writeText(text);
    setCopiedAIFb(true);
    setTimeout(() => setCopiedAIFb(false), 2000);
  };

  const handleCopyAIRaw = () => {
    if (!aiResult) return;
    triggerHaptic();
    navigator.clipboard.writeText(aiResult.rawText);
    setCopiedAIRaw(true);
    setTimeout(() => setCopiedAIRaw(false), 2000);
  };

  const handleGenerateAI = async (toneToUse?: AITone) => {
    triggerHaptic();
    if (!isAIReady) {
      onOpenAISettings();
      return;
    }

    const tone = toneToUse || selectedTone;
    setIsGenerating(true);
    setAiError(null);

    try {
      const result = await generateHolidaySocialIdeas(holiday, tone);
      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || 'Nie udało się wygenerować pomysłów przez AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToneSelect = (tone: AITone) => {
    setSelectedTone(tone);
    if (isAIReady) {
      handleGenerateAI(tone);
    }
  };

  const handleShare = async () => {
    triggerHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Festivo: ${holiday.name}`,
          text: `${holiday.name} (${holiday.day} ${monthName})\n${holiday.description}`,
          url: window.location.href,
        });
      } catch {
        // Cancelled
      }
    } else {
      navigator.clipboard.writeText(
        `${holiday.name} (${holiday.day} ${monthName}) — ${holiday.description}`
      );
      alert('Skopiowano treść święta do schowka.');
    }
  };

  const handleAddToCalendar = () => {
    triggerHaptic();
    exportToIcs(holiday);
  };

  const renderScript = (scriptText: string) => {
    const lines = scriptText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const match = line.match(
            /^(\d+\.|\*|-)?\s*(?:\*\*)?(?:Scena\s*\d+\s*:?\s*)?\((\d+[-–]\d+s?)\)(?:\*\*)?:?\s*(.*)$/i
          );
          if (match) {
            const time = match[2];
            const text = match[3]
              .replace(/^\*\*\s*/, '')
              .replace(/\s*\*\*$/, '')
              .replace(/\*\*/g, '');

            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 bg-[#182022] p-3 rounded-xl border border-[#2C3B3E] text-xs sm:text-sm"
              >
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#73321A]/30 text-[#F2AB91] border border-[#D97652]/40 font-mono font-bold text-[11px]">
                  {time}
                </span>
                <p className="text-[#F8FAFC] leading-relaxed">{text}</p>
              </div>
            );
          }

          const cleanedLine = line.replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, '').replace(/\*\*/g, '');
          return (
            <p
              key={idx}
              className="text-[#E2E8F0] text-xs sm:text-sm leading-relaxed bg-[#182022] p-2.5 rounded-xl border border-[#2C3B3E]"
            >
              {cleanedLine}
            </p>
          );
        })}
      </div>
    );
  };

  const renderFbContent = (fbText: string) => {
    const paragraphs = fbText
      .split(/\r?\n\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    return (
      <div className="space-y-2.5">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="text-[#E2E8F0] text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {para.replace(/\*\*/g, '')}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-selectable="true"
        className={`w-full transition-all duration-200 bg-[#243235] border border-[#334346] text-[#F8FAFC] flex flex-col ${
          isExpanded
            ? 'sm:max-w-4xl h-[96vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-7'
            : 'sm:max-w-xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6'
        } overflow-y-auto space-y-4 shadow-2xl`}
      >
        {/* Header with Close, Expand and Favorite */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334346]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#D97652]/20 text-[#F2AB91] border border-[#D97652]/30">
              {countdown.label}
            </span>
            <span className="text-xs font-semibold text-[#BCC3C9] bg-[#182022] px-2.5 py-1 rounded-md border border-[#2C3B3E]">
              {holiday.day} {monthName}
            </span>
            {holiday.isPublicHoliday && (
              <span className="text-xs font-bold text-[#F2AB91] bg-[#73321A]/40 border border-[#D97652]/40 px-2 py-1 rounded-md">
                Dzień wolny
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white transition-all hidden sm:flex items-center justify-center border border-[#334346]"
              title={isExpanded ? 'Zmniejsz okno' : 'Rozwiń na pełny ekran'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                onToggleFavorite(holiday.id);
              }}
              className={`p-2 rounded-xl transition-all border ${
                isFavorite
                  ? 'text-[#F2AB91] bg-[#73321A]/40 border-[#D97652]/50'
                  : 'text-[#BCC3C9] hover:text-[#F2AB91] bg-[#182022] border-[#334346]'
              }`}
              title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#D97652] text-[#D97652]' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white transition-all border border-[#334346]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero: Emoji + Title */}
        <div className="flex items-start space-x-4">
          <div className="text-4xl select-none p-3 bg-[#182022] rounded-2xl border border-[#334346] shrink-0">
            {holiday.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {holiday.name}
            </h2>
            <p className="text-xs font-semibold text-[#F2AB91] mt-1">
              {holiday.category}
            </p>
            {holiday.dayOfYear && (
              <p className="text-[11px] text-[#BCC3C9] mt-0.5">
                {holiday.dayOfYear}. dzień roku • Pozostało: {365 - holiday.dayOfYear} dni
              </p>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* AI SOCIAL MEDIA GENERATOR CARD (FESTIVO PALETTE)              */}
        {/* ============================================================== */}
        <div className="bg-[#1E2B2D] p-4 sm:p-5 rounded-2xl border border-[#334346] shadow-lg relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-xl bg-[#D97652] text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Generator Pomysłów AI
                </h4>
                <p className="text-[10px] text-[#BCC3C9]">
                  {aiSettings.provider === 'gemini'
                    ? `Google Gemini (${aiSettings.geminiModel})`
                    : `Groq (${aiSettings.groqModel})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2.5 py-1 rounded-xl bg-[#243235] hover:bg-[#2C3B3E] text-[#BCC3C9] text-[11px] font-semibold border border-[#334346] flex sm:hidden items-center gap-1 active:scale-95 transition-all"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isExpanded ? 'Zmniejsz' : 'Rozwiń'}</span>
              </button>

              <button
                onClick={onOpenAISettings}
                className="px-2.5 py-1 rounded-xl bg-[#243235] hover:bg-[#2C3B3E] text-[#F8FAFC] text-[11px] font-semibold border border-[#334346] flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Ustawienia API</span>
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="mb-3">
            <label className="text-[10px] font-bold text-[#BCC3C9] uppercase tracking-wider block mb-1.5">
              Styl materiałów:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {AI_TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleToneSelect(t.id)}
                  disabled={isGenerating}
                  className={`py-2 px-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                    selectedTone === t.id
                      ? 'bg-[#D97652] border-[#D97652] text-white shadow-sm'
                      : 'bg-[#182022] hover:bg-[#243235] text-[#BCC3C9] border-[#2C3B3E]'
                  }`}
                  title={t.desc}
                >
                  <span className="block truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* If No AI Key Configured Banner */}
          {!isAIReady && !aiResult && (
            <div className="mt-2 bg-[#182022] p-3.5 rounded-xl border border-[#2C3B3E] text-xs text-[#BCC3C9] flex items-center justify-between gap-3">
              <p className="text-[11px] leading-relaxed">
                Wprowadź darmowy klucz <strong className="text-white">Gemini</strong> lub{' '}
                <strong className="text-white">Groq</strong>, aby generować scenariusze TikTok i posty na Facebooka.
              </p>
              <button
                onClick={onOpenAISettings}
                className="px-3 py-1.5 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-xs whitespace-nowrap active:scale-95 shrink-0"
              >
                Wprowadź klucz
              </button>
            </div>
          )}

          {/* Generate Button */}
          {isAIReady && !aiResult && !isGenerating && (
            <button
              onClick={() => handleGenerateAI()}
              className="mt-2 w-full py-3 px-4 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#F2AB91]" />
              <span>Generuj pomysły na TikTok i Facebook</span>
            </button>
          )}

          {/* Loader */}
          {isGenerating && (
            <div className="py-7 text-center space-y-2 bg-[#182022] rounded-xl border border-[#2C3B3E]">
              <Loader2 className="w-6 h-6 text-[#D97652] animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-white">
                Przygotowywanie scenariuszy ({aiSettings.provider === 'gemini' ? 'Google Gemini' : 'Groq'})...
              </p>
              <p className="text-[11px] text-[#BCC3C9]">
                Klimat: {AI_TONES.find((t) => t.id === selectedTone)?.label}
              </p>
            </div>
          )}

          {/* Error Message */}
          {aiError && (
            <div className="mt-2 p-3.5 rounded-xl bg-[#401F18] border border-[#73321A] text-[#F2AB91] text-xs">
              <p className="font-bold">Błąd generowania:</p>
              <p className="mt-0.5">{aiError}</p>
              <button
                onClick={onOpenAISettings}
                className="mt-2 text-[#F2AB91] underline text-[11px] font-semibold"
              >
                Sprawdź klucz API w ustawieniach
              </button>
            </div>
          )}

          {/* Generated Result Display */}
          {aiResult && !isGenerating && (
            <div className="mt-3 space-y-3">
              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-[#334346] pb-2">
                <div className="flex items-center space-x-1.5 overflow-x-auto">
                  <button
                    onClick={() => {
                      triggerHaptic();
                      setActiveAITab('tiktok');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      activeAITab === 'tiktok'
                        ? 'bg-[#D97652] text-white'
                        : 'bg-[#182022] text-[#BCC3C9] hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Pomysł na TikTok</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic();
                      setActiveAITab('facebook');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      activeAITab === 'facebook'
                        ? 'bg-[#425759] text-white'
                        : 'bg-[#182022] text-[#BCC3C9] hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Post na Facebook</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic();
                      setActiveAITab('raw');
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
                      activeAITab === 'raw'
                        ? 'bg-[#73321A] text-white'
                        : 'bg-[#182022] text-[#BCC3C9] hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tekst surowy</span>
                  </button>
                </div>

                <button
                  onClick={() => handleGenerateAI()}
                  className="p-1.5 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white transition-all active:scale-95 shrink-0 ml-1 border border-[#334346]"
                  title="Wygeneruj ponownie"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* TIKTOK CONTENT TAB */}
              {activeAITab === 'tiktok' && (
                <div className="space-y-3 text-xs bg-[#182022] p-3.5 sm:p-4 rounded-xl border border-[#2C3B3E]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#F2AB91] text-xs sm:text-sm">
                      {aiResult.tikTokIdea.title}
                    </span>
                    <button
                      onClick={handleCopyAITikTok}
                      className="px-2.5 py-1 rounded-xl bg-[#243235] text-[#F8FAFC] hover:bg-[#2F3F42] border border-[#334346] text-[11px] font-bold flex items-center gap-1.5 shrink-0 active:scale-95"
                    >
                      {copiedAITikTok ? <Check className="w-3.5 h-3.5 text-[#F2AB91]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAITikTok ? 'Skopiowano' : 'Kopiuj'}</span>
                    </button>
                  </div>

                  {/* Hook */}
                  <div className="bg-[#243235] p-3 rounded-xl border border-[#334346]">
                    <span className="text-[10px] font-bold uppercase text-[#D97652] block mb-1">
                      Początek wideo (0-3 sekundy):
                    </span>
                    <p className="font-semibold text-white italic text-xs sm:text-sm leading-relaxed">
                      "{aiResult.tikTokIdea.hook}"
                    </p>
                  </div>

                  {/* Script */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#BCC3C9] block mb-1.5">
                      Scenariusz krok po kroku:
                    </span>
                    {renderScript(aiResult.tikTokIdea.script)}
                  </div>

                  {/* Audio Trend */}
                  {aiResult.tikTokIdea.audioTrend && (
                    <div className="flex items-center gap-2 text-[#E2E8F0] bg-[#243235] p-2.5 rounded-xl border border-[#334346]">
                      <span className="text-[#D97652] font-bold text-xs shrink-0">Muzyka/Audio:</span>
                      <span className="text-xs text-[#BCC3C9]">{aiResult.tikTokIdea.audioTrend}</span>
                    </div>
                  )}

                  {/* Caption */}
                  {aiResult.tikTokIdea.caption && (
                    <div className="bg-[#243235] p-2.5 rounded-xl border border-[#334346]">
                      <span className="text-[10px] font-bold uppercase text-[#BCC3C9] block mb-0.5">
                        Opis:
                      </span>
                      <p className="text-[#E2E8F0] text-xs">{aiResult.tikTokIdea.caption}</p>
                    </div>
                  )}

                  {/* Hashtags */}
                  {aiResult.tikTokIdea.hashtags && (
                    <div className="text-[11px] text-[#F2AB91] font-mono select-all bg-[#73321A]/20 p-2 rounded-xl border border-[#D97652]/30">
                      {aiResult.tikTokIdea.hashtags}
                    </div>
                  )}
                </div>
              )}

              {/* FACEBOOK CONTENT TAB */}
              {activeAITab === 'facebook' && (
                <div className="space-y-3 text-xs bg-[#182022] p-3.5 sm:p-4 rounded-xl border border-[#2C3B3E]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#F8FAFC] text-xs sm:text-sm">
                      {aiResult.facebookPost.title}
                    </span>
                    <button
                      onClick={handleCopyAIFb}
                      className="px-2.5 py-1 rounded-xl bg-[#243235] text-[#F8FAFC] hover:bg-[#2F3F42] border border-[#334346] text-[11px] font-bold flex items-center gap-1.5 shrink-0 active:scale-95"
                    >
                      {copiedAIFb ? <Check className="w-3.5 h-3.5 text-[#F2AB91]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAIFb ? 'Skopiowano' : 'Kopiuj'}</span>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="bg-[#243235] p-3 sm:p-4 rounded-xl border border-[#334346]">
                    {renderFbContent(aiResult.facebookPost.content)}
                  </div>

                  {/* CTA */}
                  {aiResult.facebookPost.callToAction && (
                    <div className="bg-[#243235] p-3 rounded-xl border border-[#334346]">
                      <span className="text-[10px] font-bold text-[#D97652] uppercase block mb-1">
                        Pytanie do dyskusji:
                      </span>
                      <p className="text-[#F8FAFC] text-xs sm:text-sm">{aiResult.facebookPost.callToAction}</p>
                    </div>
                  )}

                  {/* Hashtags */}
                  {aiResult.facebookPost.hashtags && (
                    <div className="text-[11px] text-[#F2AB91] font-mono select-all bg-[#73321A]/20 p-2 rounded-xl border border-[#D97652]/30">
                      {aiResult.facebookPost.hashtags}
                    </div>
                  )}
                </div>
              )}

              {/* FULL RAW AI OUTPUT TAB */}
              {activeAITab === 'raw' && (
                <div className="space-y-2.5 text-xs bg-[#182022] p-3.5 rounded-xl border border-[#2C3B3E]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#BCC3C9] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Pełny tekst odpowiedzi:</span>
                    </span>
                    <button
                      onClick={handleCopyAIRaw}
                      className="px-2.5 py-1 rounded-xl bg-[#243235] text-[#F8FAFC] border border-[#334346] text-[10px] font-bold flex items-center gap-1"
                    >
                      {copiedAIRaw ? <Check className="w-3 h-3 text-[#F2AB91]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAIRaw ? 'Skopiowano' : 'Kopiuj całość'}</span>
                    </button>
                  </div>
                  <pre className="text-[#E2E8F0] bg-[#243235] p-3 rounded-xl border border-[#334346] overflow-x-auto whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-[50vh] overflow-y-auto">
                    {aiResult.rawText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* IMIENINY SECTION */}
        {holiday.nameDays && holiday.nameDays.length > 0 && (
          <div className="bg-[#1E2B2D] p-3.5 rounded-2xl border border-[#334346]">
            <div className="text-[#F2AB91] font-bold text-xs uppercase tracking-wider mb-1.5">
              Imieniny w tym dniu:
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {holiday.nameDays.map((name) => (
                <span
                  key={name}
                  className="px-2.5 py-1 rounded-xl bg-[#182022] text-[#F8FAFC] border border-[#2C3B3E] text-xs font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* OTHER HOLIDAYS ON THIS DAY */}
        {holiday.allDayHolidays && holiday.allDayHolidays.length > 1 && (
          <div className="bg-[#1E2B2D] p-3.5 rounded-2xl border border-[#334346]">
            <div className="text-[#BCC3C9] font-bold text-xs uppercase tracking-wider mb-2">
              Inne okazje w dniu {holiday.day} {monthName}:
            </div>
            <ul className="space-y-1.5 text-xs text-[#E2E8F0]">
              {holiday.allDayHolidays.map((hName, idx) => (
                <li key={idx} className="flex items-center space-x-2 bg-[#182022] p-2 rounded-xl border border-[#2C3B3E]">
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#D97652] shrink-0" />
                  <span className={hName === holiday.name ? 'font-bold text-[#F2AB91]' : 'text-[#BCC3C9]'}>
                    {hName} {hName === holiday.name ? '(przeglądasz)' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        <div className="bg-[#1E2B2D] p-3.5 rounded-2xl border border-[#334346]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#BCC3C9] mb-1">
            Opis i geneza
          </h4>
          <p className="text-sm text-[#F8FAFC] leading-relaxed whitespace-pre-line">{holiday.description}</p>
        </div>

        {/* School Idea */}
        {holiday.schoolIdea && (
          <div className="bg-[#1E2B2D] p-4 rounded-2xl border border-[#334346]">
            <div className="text-[#F2AB91] font-bold text-xs uppercase tracking-wider mb-1.5">
              Pomysł do szkoły i samorządu
            </div>
            <p className="text-sm text-[#F8FAFC] leading-relaxed">{holiday.schoolIdea}</p>
          </div>
        )}

        {/* Dress code */}
        {holiday.dressCode && (
          <div className="bg-[#1E2B2D] p-4 rounded-2xl border border-[#334346]">
            <div className="flex items-center space-x-2 text-[#BCC3C9] font-bold text-xs uppercase tracking-wider mb-1.5">
              <Shirt className="w-4 h-4 text-[#D97652]" />
              <span>Dress code (co założyć)</span>
            </div>
            <p className="text-sm text-[#F8FAFC] leading-relaxed">{holiday.dressCode}</p>
          </div>
        )}

        {/* Hashtags */}
        <div className="bg-[#1E2B2D] p-3.5 rounded-2xl border border-[#334346]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BCC3C9]">
              Hashtagi
            </span>
            <button
              onClick={handleCopyHashtags}
              className="flex items-center space-x-1 text-xs font-semibold text-[#F2AB91] hover:text-white"
            >
              {copiedTags ? <Check className="w-3 h-3 text-[#F2AB91]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedTags ? 'Skopiowano' : 'Kopiuj'}</span>
            </button>
          </div>
          <p className="text-xs text-[#D97652] font-mono select-all break-words leading-relaxed">
            {holiday.hashtags}
          </p>
        </div>

        {/* Action Buttons: Add to Calendar & Share */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#F8FAFC] text-xs sm:text-sm font-semibold transition-all active:scale-95 border border-[#334346]"
          >
            <Calendar className="w-4 h-4 text-[#D97652]" />
            <span>Zapisz w kalendarzu</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Udostępnij</span>
          </button>
        </div>
      </div>
    </div>
  );
};
