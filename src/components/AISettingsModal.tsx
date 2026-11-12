import React, { useEffect, useState } from 'react';
import { Bot, Check, ExternalLink, Eye, EyeOff, Key, Loader2, RefreshCw, X } from 'lucide-react';
import {
  AIModelOption,
  AISettings,
  GEMINI_MODELS,
  GROQ_MODELS,
  fetchLiveGeminiModels,
  fetchLiveGroqModels,
  getAISettings,
  saveAISettings,
  testAIConnection,
} from '../services/aiService';
import { triggerHaptic } from '../utils/calendarUtils';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [settings, setSettings] = useState<AISettings>(getAISettings);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Live models fetched from API
  const [fetchedGeminiModels, setFetchedGeminiModels] = useState<AIModelOption[]>([]);
  const [isFetchingGeminiModels, setIsFetchingGeminiModels] = useState(false);
  const [customGeminiMode, setCustomGeminiMode] = useState(false);

  const [fetchedGroqModels, setFetchedGroqModels] = useState<AIModelOption[]>([]);
  const [isFetchingGroqModels, setIsFetchingGroqModels] = useState(false);
  const [customGroqMode, setCustomGroqMode] = useState(false);

  const handleFetchGeminiModels = async (keyOverride?: string, showFeedback: boolean = true) => {
    const apiKey = (keyOverride ?? settings.geminiApiKey).trim();
    if (apiKey.length < 10) {
      if (showFeedback) {
        setTestResult({
          success: false,
          message: 'Najpierw wklej klucz API Google Gemini, aby pobrać listę modeli.',
        });
      }
      return;
    }

    setIsFetchingGeminiModels(true);
    try {
      const models = await fetchLiveGeminiModels(apiKey);
      if (models.length > 0) {
        setFetchedGeminiModels(models);
        setSettings((prev) => {
          const exists = models.some((m) => m.id === prev.geminiModel);
          if (exists) return prev;
          const preferred =
            models.find((m) => m.id === 'gemini-3.8-flash') ||
            models.find((m) => m.id === 'gemini-3.5-flash-lite') ||
            models.find((m) => m.id.includes('flash')) ||
            models[0];
          return { ...prev, geminiModel: preferred.id };
        });

        if (showFeedback) {
          setTestResult({
            success: true,
            message: `Pobrano wszystkie aktywne modele Gemini (${models.length}) z Twojego konta!`,
          });
        }
      }
    } catch (err: any) {
      if (showFeedback) {
        setTestResult({
          success: false,
          message: err.message || 'Nie udało się pobrać listy modeli Gemini.',
        });
      }
    } finally {
      setIsFetchingGeminiModels(false);
    }
  };

  const handleFetchGroqModels = async (keyOverride?: string, showFeedback: boolean = true) => {
    const apiKey = (keyOverride ?? settings.groqApiKey).trim();
    if (apiKey.length < 10) {
      if (showFeedback) {
        setTestResult({
          success: false,
          message: 'Najpierw wklej klucz API Groq, aby pobrać listę modeli.',
        });
      }
      return;
    }

    setIsFetchingGroqModels(true);
    try {
      const models = await fetchLiveGroqModels(apiKey);
      if (models.length > 0) {
        setFetchedGroqModels(models);
        setSettings((prev) => {
          const exists = models.some((m) => m.id === prev.groqModel);
          if (exists) return prev;
          const preferred =
            models.find((m) => m.id.includes('gpt-oss-120b') || m.id.includes('qwen') || m.id.includes('llama-3.3')) ||
            models[0];
          return { ...prev, groqModel: preferred.id };
        });

        if (showFeedback) {
          setTestResult({
            success: true,
            message: `Pobrano wszystkie aktywne modele Groq (${models.length}) z Twojego konta!`,
          });
        }
      }
    } catch (err: any) {
      if (showFeedback) {
        setTestResult({
          success: false,
          message: err.message || 'Nie udało się wczytać listy modeli Groq.',
        });
      }
    } finally {
      setIsFetchingGroqModels(false);
    }
  };

  // Sync settings and load live models every time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const latest = getAISettings();
    setSettings(latest);
    setTestResult(null);

    if (latest.geminiApiKey && latest.geminiApiKey.trim().length > 20) {
      handleFetchGeminiModels(latest.geminiApiKey, false);
    }
    if (latest.groqApiKey && latest.groqApiKey.trim().length > 20) {
      handleFetchGroqModels(latest.groqApiKey, false);
    }
  }, [isOpen]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleSave = () => {
    triggerHaptic();
    saveAISettings(settings);
    if (onSaved) onSaved();
    onClose();
  };

  const handleTestConnection = async () => {
    triggerHaptic();
    setTesting(true);
    setTestResult(null);

    const isGemini = settings.provider === 'gemini';
    const key = isGemini ? settings.geminiApiKey : settings.groqApiKey;
    const model = isGemini ? settings.geminiModel : settings.groqModel;

    if (!key || key.trim().length === 0) {
      setTesting(false);
      setTestResult({
        success: false,
        message: 'Najpierw wklej klucz API, aby móc go przetestować.',
      });
      return;
    }

    try {
      const { detail, usedModel } = await testAIConnection(settings.provider, key, model);
      const switchedNotice =
        usedModel && usedModel !== model
          ? ` (Wybrany model ${model} był przeciążony — automatycznie przełączono na ${usedModel})`
          : '';

      if (usedModel && usedModel !== model) {
        setSettings((prev) =>
          isGemini ? { ...prev, geminiModel: usedModel } : { ...prev, groqModel: usedModel }
        );
      }

      setTestResult({
        success: true,
        message: `Połączenie z ${isGemini ? 'Google Gemini' : 'Groq'} działa poprawnie! ${detail}${switchedNotice}`,
      });

      // Refresh live models automatically on successful connection
      if (isGemini) {
        handleFetchGeminiModels(key, false);
      } else {
        handleFetchGroqModels(key, false);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Wystąpił błąd podczas sprawdzania klucza.',
      });
    } finally {
      setTesting(false);
    }
  };

  // Merge live models with static fallbacks (live first so all account models appear)
  const combinedGeminiModels: AIModelOption[] = [];
  const seenGemini = new Set<string>();
  for (const m of [...fetchedGeminiModels, ...GEMINI_MODELS]) {
    if (!seenGemini.has(m.id)) {
      seenGemini.add(m.id);
      combinedGeminiModels.push(m);
    }
  }

  const combinedGroqModels: AIModelOption[] = [];
  const seenGroq = new Set<string>();
  for (const m of [...fetchedGroqModels, ...GROQ_MODELS]) {
    if (!seenGroq.has(m.id)) {
      seenGroq.add(m.id);
      combinedGroqModels.push(m);
    }
  }

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
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Ustawienia AI (Gemini / Groq)
              </h2>
              <p className="text-[11px] text-[#BCC3C9]">
                Konfiguracja silnika do generowania scenariuszy i postów
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white border border-[#334346] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Toggle Tabs */}
        <div>
          <label className="block text-[#BCC3C9] font-bold text-xs uppercase tracking-wider mb-1.5">
            Wybierz silnik sztucznej inteligencji:
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#182022] p-1.5 rounded-2xl border border-[#334346]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setSettings((s) => ({ ...s, provider: 'gemini' }));
                setTestResult(null);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                settings.provider === 'gemini'
                  ? 'bg-[#D97652] text-white shadow-sm'
                  : 'text-[#BCC3C9] hover:text-white'
              }`}
            >
              <span>Google Gemini</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setSettings((s) => ({ ...s, provider: 'groq' }));
                setTestResult(null);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                settings.provider === 'groq'
                  ? 'bg-[#D97652] text-white shadow-sm'
                  : 'text-[#BCC3C9] hover:text-white'
              }`}
            >
              <span>Groq (GPT OSS / Qwen / Llama)</span>
            </button>
          </div>
        </div>

        {/* Gemini Settings View */}
        {settings.provider === 'gemini' && (
          <div className="space-y-3 bg-[#182022] p-4 rounded-2xl border border-[#334346]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F2AB91]">
                Klucz API Google Gemini
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#F2AB91] hover:text-white underline flex items-center gap-1 font-semibold"
              >
                <span>Pobierz darmowy klucz</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BCC3C9]" />
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={settings.geminiApiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings((s) => ({ ...s, geminiApiKey: val }));
                  if (val.trim().length >= 35) {
                    handleFetchGeminiModels(val, false);
                  }
                }}
                placeholder="Wklej klucz (AIzaSy...)"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#243235] border border-[#334346] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97652] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BCC3C9] hover:text-white"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[#BCC3C9]">
                Model Gemini ({combinedGeminiModels.length} na liście):
              </label>
              <button
                type="button"
                onClick={() => handleFetchGeminiModels(undefined, true)}
                disabled={isFetchingGeminiModels}
                className="text-[11px] text-[#F2AB91] hover:text-white flex items-center gap-1 font-semibold underline disabled:opacity-50"
              >
                {isFetchingGeminiModels ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span>Wczytaj wszystkie modele</span>
              </button>
            </div>

            {!customGeminiMode ? (
              <select
                value={settings.geminiModel}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setCustomGeminiMode(true);
                  } else {
                    setSettings((s) => ({ ...s, geminiModel: e.target.value }));
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#243235] border border-[#334346] text-xs text-slate-200 focus:outline-none focus:border-[#D97652]"
              >
                {combinedGeminiModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
                <option value="__custom__">+ Wpisz własną nazwę modelu...</option>
              </select>
            ) : (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={settings.geminiModel}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, geminiModel: e.target.value }))
                  }
                  placeholder="np. gemini-3.8-flash lub gemini-4-argon"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#243235] border border-[#334346] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#D97652]"
                />
                <button
                  type="button"
                  onClick={() => setCustomGeminiMode(false)}
                  className="px-2.5 py-1 text-xs text-[#BCC3C9] hover:text-white bg-[#243235] border border-[#334346] rounded-xl"
                >
                  Lista
                </button>
              </div>
            )}
          </div>
        )}

        {/* Groq Settings View */}
        {settings.provider === 'groq' && (
          <div className="space-y-3 bg-[#182022] p-4 rounded-2xl border border-[#334346]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F2AB91]">
                Klucz API Groq
              </span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#F2AB91] hover:text-white underline flex items-center gap-1 font-semibold"
              >
                <span>Pobierz darmowy klucz</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BCC3C9]" />
              <input
                type={showGroqKey ? 'text' : 'password'}
                value={settings.groqApiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings((s) => ({ ...s, groqApiKey: val }));
                  if (val.trim().length >= 35) {
                    handleFetchGroqModels(val, false);
                  }
                }}
                placeholder="Wklej klucz (gsk_...)"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#243235] border border-[#334346] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97652] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGroqKey(!showGroqKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BCC3C9] hover:text-white"
              >
                {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Model Fetch button */}
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[#BCC3C9]">
                Model Groq ({combinedGroqModels.length} na liście):
              </label>
              <button
                type="button"
                onClick={() => handleFetchGroqModels(undefined, true)}
                disabled={isFetchingGroqModels}
                className="text-[11px] text-[#F2AB91] hover:text-white flex items-center gap-1 font-semibold underline disabled:opacity-50"
              >
                {isFetchingGroqModels ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span>Wczytaj wszystkie modele</span>
              </button>
            </div>

            {/* Model Select or Custom Input */}
            {!customGroqMode ? (
              <div className="space-y-1.5">
                <select
                  value={settings.groqModel}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomGroqMode(true);
                    } else {
                      setSettings((s) => ({ ...s, groqModel: e.target.value }));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#243235] border border-[#334346] text-xs text-slate-200 focus:outline-none focus:border-[#D97652]"
                >
                  {combinedGroqModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                  <option value="__custom__">+ Wpisz inną nazwę modelu...</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={settings.groqModel}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, groqModel: e.target.value }))
                    }
                    placeholder="np. openai/gpt-oss-120b lub qwen/qwen3.8-27b"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#243235] border border-[#334346] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#D97652]"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomGroqMode(false)}
                    className="px-2.5 py-1 text-xs text-[#BCC3C9] hover:text-white bg-[#243235] border border-[#334346] rounded-xl"
                  >
                    Lista
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Connection Button */}
        <div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full py-2.5 px-3 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all border border-[#334346] active:scale-95 disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D97652]" />
                <span>Testowanie połączenia...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-[#F2AB91]" />
                <span>Przetestuj połączenie z API</span>
              </>
            )}
          </button>

          {testResult && (
            <div
              className={`mt-2 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-[#182022] border border-[#D97652]/40 text-[#F2AB91]'
                  : 'bg-[#401F18] border border-[#73321A] text-[#F2AB91]'
              }`}
            >
              <span>{testResult.success ? '✓' : '✗'}</span>
              <p className="flex-1 leading-relaxed whitespace-pre-line">{testResult.message}</p>
            </div>
          )}
        </div>

        {/* Privacy notice */}
        <p className="text-[11px] text-[#BCC3C9] leading-relaxed bg-[#182022] p-3 rounded-xl border border-[#334346]">
          Twój klucz API jest przechowywany wyłącznie lokalnie na tym urządzeniu w pamięci przeglądarki i łączy się bezpośrednio z API Google/Groq.
        </p>

        {/* Save CTA */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Zapisz ustawienia
          </button>
        </div>
      </div>
    </div>
  );
};
