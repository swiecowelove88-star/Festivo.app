import React, { useEffect, useState } from 'react';
import { Bot, Check, ExternalLink, Eye, EyeOff, Key, Loader2, RefreshCw, Sparkles, X, Zap } from 'lucide-react';
import {
  AISettings,
  GEMINI_MODELS,
  GROQ_MODELS,
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
  if (!isOpen) return null;

  const [settings, setSettings] = useState<AISettings>(getAISettings);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Live models fetched from Groq API
  const [fetchedGroqModels, setFetchedGroqModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [customModelMode, setCustomModelMode] = useState(false);

  useEffect(() => {
    if (settings.groqApiKey && settings.groqApiKey.trim().length > 10) {
      handleFetchGroqModels(false);
    }
  }, []);

  const handleFetchGroqModels = async (showFeedback: boolean = true) => {
    if (!settings.groqApiKey || settings.groqApiKey.trim().length < 5) {
      if (showFeedback) {
        setTestResult({
          success: false,
          message: 'Najpierw wklej klucz API Groq, aby pobrać listę modeli.',
        });
      }
      return;
    }

    setIsFetchingModels(true);
    try {
      const models = await fetchLiveGroqModels(settings.groqApiKey);
      if (models.length > 0) {
        setFetchedGroqModels(models);
        if (!models.includes(settings.groqModel)) {
          const preferred =
            models.find((m) => m.includes('120b') || m.includes('gpt-oss') || m.includes('qwen') || m.includes('70b')) ||
            models[0];
          setSettings((s) => ({ ...s, groqModel: preferred }));
        }
        if (showFeedback) {
          setTestResult({
            success: true,
            message: `Wczytano ${models.length} aktywnych modeli z Twojego konta Groq! Wybrano model: ${settings.groqModel}`,
          });
        }
      }
    } catch (err: any) {
      if (showFeedback) {
        setTestResult({
          success: false,
          message: `Nie udało się wczytać listy modeli: ${err.message}`,
        });
      }
    } finally {
      setIsFetchingModels(false);
    }
  };

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
      const detail = await testAIConnection(settings.provider, key, model);
      setTestResult({
        success: true,
        message: `Połączenie z ${settings.provider === 'gemini' ? 'Google Gemini' : 'Groq'} działa poprawnie! (${detail})`,
      });

      if (settings.provider === 'groq') {
        handleFetchGroqModels(false);
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

  const combinedGroqModels = Array.from(
    new Set([...fetchedGroqModels, ...GROQ_MODELS.map((m) => m.id)])
  );

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
              <span>Groq (Llama / Qwen)</span>
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
                onChange={(e) =>
                  setSettings((s) => ({ ...s, geminiApiKey: e.target.value }))
                }
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

            <div>
              <label className="block text-[11px] font-semibold text-[#BCC3C9] mb-1">
                Model Gemini:
              </label>
              <select
                value={settings.geminiModel}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, geminiModel: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl bg-[#243235] border border-[#334346] text-xs text-slate-200 focus:outline-none focus:border-[#D97652]"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
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
                onChange={(e) =>
                  setSettings((s) => ({ ...s, groqApiKey: e.target.value }))
                }
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
                Model Groq:
              </label>
              <button
                type="button"
                onClick={() => handleFetchGroqModels(true)}
                disabled={isFetchingModels}
                className="text-[11px] text-[#F2AB91] hover:text-white flex items-center gap-1 font-semibold underline disabled:opacity-50"
              >
                {isFetchingModels ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span>Wczytaj aktywne modele z konta</span>
              </button>
            </div>

            {/* Model Select or Custom Input */}
            {!customModelMode ? (
              <div className="space-y-1.5">
                <select
                  value={settings.groqModel}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomModelMode(true);
                    } else {
                      setSettings((s) => ({ ...s, groqModel: e.target.value }));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#243235] border border-[#334346] text-xs text-slate-200 focus:outline-none focus:border-[#D97652]"
                >
                  {combinedGroqModels.map((modelId) => {
                    const found = GROQ_MODELS.find((m) => m.id === modelId);
                    return (
                      <option key={modelId} value={modelId}>
                        {found ? found.name : `${modelId}`}
                      </option>
                    );
                  })}
                  <option value="__custom__">Wpisz inną nazwę modelu...</option>
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
                    onClick={() => setCustomModelMode(false)}
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
