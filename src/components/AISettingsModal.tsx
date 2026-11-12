import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  AIModelOption,
  AIProvider,
  AISettings,
  GEMINI_MODELS,
  GROQ_MODELS,
  fetchLiveGeminiModels,
  fetchLiveGroqModels,
  getAISettings,
  getCachedModels,
  saveAISettings,
  testAIConnection,
} from '../services/aiService';
import { triggerHaptic } from '../utils/calendarUtils';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface ModelPickerProps {
  providerLabel: string;
  models: AIModelOption[];
  liveModelIds: Set<string>;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onFetchModels: () => void;
  isFetching: boolean;
  fetchError: string | null;
  customMode: boolean;
  setCustomMode: (val: boolean) => void;
  customPlaceholder: string;
}

const ModelPickerSection: React.FC<ModelPickerProps> = ({
  providerLabel,
  models,
  liveModelIds,
  selectedModel,
  onSelectModel,
  onFetchModels,
  isFetching,
  fetchError,
  customMode,
  setCustomMode,
  customPlaceholder,
}) => {
  const [listOpen, setListOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return models;
    return models.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
    );
  }, [models, searchQuery]);

  const activeOption = models.find((m) => m.id === selectedModel);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#BCC3C9]">
          Model {providerLabel} ({models.length} na liście):
        </span>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onFetchModels();
            setListOpen(true);
          }}
          disabled={isFetching}
          className="px-2.5 py-1 rounded-lg bg-[#243235] hover:bg-[#2C3B3E] border border-[#D97652]/40 text-[11px] text-[#F2AB91] hover:text-white flex items-center gap-1.5 font-semibold disabled:opacity-50 active:scale-95 transition-all"
        >
          {isFetching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>{isFetching ? 'Pobieranie...' : 'Wczytaj z konta API'}</span>
        </button>
      </div>

      {fetchError && (
        <p className="text-[11px] text-rose-300 bg-[#401F18] border border-[#73321A] rounded-xl px-3 py-2 leading-relaxed">
          {fetchError}
        </p>
      )}

      {customMode ? (
        <div className="flex gap-1.5">
          <input
            type="text"
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            placeholder={customPlaceholder}
            className="flex-1 px-3 py-2.5 rounded-xl bg-[#243235] border border-[#334346] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#D97652]"
          />
          <button
            type="button"
            onClick={() => setCustomMode(false)}
            className="px-3 py-2 text-xs text-[#BCC3C9] hover:text-white bg-[#243235] border border-[#334346] rounded-xl font-semibold"
          >
            Lista
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Active Model Trigger Button (touch-friendly replacement for native mobile <select>) */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setListOpen((prev) => !prev);
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-[#243235] hover:bg-[#2C3B3E] border border-[#334346] text-left flex items-center justify-between gap-2 transition-all"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {activeOption?.name || selectedModel}
              </p>
              <p className="text-[10px] text-[#F2AB91] font-mono truncate">
                {selectedModel}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-[#BCC3C9]">
              <span className="text-[10px] font-semibold bg-[#182022] px-2 py-0.5 rounded-md border border-[#334346]">
                {listOpen ? 'Zwiń' : `Wybierz (${models.length})`}
              </span>
              {listOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Expandable Searchable Touch List */}
          {listOpen && (
            <div className="bg-[#243235] border border-[#334346] rounded-xl p-2 space-y-2 shadow-xl">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#BCC3C9] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj modelu (np. flash, pro, llama, qwen)..."
                  className="w-full pl-8 pr-7 py-2 rounded-lg bg-[#182022] border border-[#334346] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97652]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#BCC3C9] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto overscroll-contain space-y-1 pr-0.5">
                {filteredModels.length === 0 ? (
                  <p className="text-[11px] text-[#BCC3C9] text-center py-4">
                    Brak modeli pasujących do „{searchQuery}”.
                  </p>
                ) : (
                  filteredModels.map((m) => {
                    const isSelected = m.id === selectedModel;
                    const isLive = liveModelIds.has(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic();
                          onSelectModel(m.id);
                          setListOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-all border ${
                          isSelected
                            ? 'bg-[#D97652]/20 border-[#D97652] text-white'
                            : 'bg-[#182022] hover:bg-[#2C3B3E] border-transparent text-[#E2E8F0]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate">{m.name}</span>
                            {isLive && (
                              <span className="shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                API
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] font-mono text-[#BCC3C9] truncate">
                            {m.id}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#F2AB91] shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomMode(true);
                  setListOpen(false);
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#182022] hover:bg-[#2C3B3E] border border-[#334346] text-[11px] font-semibold text-[#F2AB91] text-center"
              >
                + Wpisz własne ID modelu ręcznie
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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

  // Live & cached models
  const [fetchedGeminiModels, setFetchedGeminiModels] = useState<AIModelOption[]>(() =>
    getCachedModels('gemini')
  );
  const [isFetchingGeminiModels, setIsFetchingGeminiModels] = useState(false);
  const [geminiFetchError, setGeminiFetchError] = useState<string | null>(null);
  const [customGeminiMode, setCustomGeminiMode] = useState(false);

  const [fetchedGroqModels, setFetchedGroqModels] = useState<AIModelOption[]>(() =>
    getCachedModels('groq')
  );
  const [isFetchingGroqModels, setIsFetchingGroqModels] = useState(false);
  const [groqFetchError, setGroqFetchError] = useState<string | null>(null);
  const [customGroqMode, setCustomGroqMode] = useState(false);

  const fetchModelsForProvider = async (
    provider: AIProvider,
    keyOverride?: string,
    showFeedback: boolean = true
  ) => {
    const isGemini = provider === 'gemini';
    const apiKey = (
      keyOverride ?? (isGemini ? settings.geminiApiKey : settings.groqApiKey)
    ).trim();

    if (apiKey.length < 10) {
      if (showFeedback) {
        setTestResult({
          success: false,
          message: `Najpierw wklej klucz API ${isGemini ? 'Google Gemini' : 'Groq'}, aby pobrać listę modeli.`,
        });
      }
      return;
    }

    if (isGemini) {
      setIsFetchingGeminiModels(true);
      setGeminiFetchError(null);
    } else {
      setIsFetchingGroqModels(true);
      setGroqFetchError(null);
    }

    try {
      const models = isGemini
        ? await fetchLiveGeminiModels(apiKey)
        : await fetchLiveGroqModels(apiKey);

      if (models.length > 0) {
        if (isGemini) {
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
        } else {
          setFetchedGroqModels(models);
          setSettings((prev) => {
            const exists = models.some((m) => m.id === prev.groqModel);
            if (exists) return prev;
            const preferred =
              models.find(
                (m) =>
                  m.id.includes('gpt-oss-120b') ||
                  m.id.includes('qwen') ||
                  m.id.includes('llama-3.3')
              ) || models[0];
            return { ...prev, groqModel: preferred.id };
          });
        }

        if (showFeedback) {
          setTestResult({
            success: true,
            message: `Pobrano wszystkie aktywne modele ${isGemini ? 'Gemini' : 'Groq'} (${models.length}) z Twojego konta!`,
          });
        }
      }
    } catch (err: any) {
      const msg =
        err.message ||
        `Nie udało się pobrać listy modeli ${isGemini ? 'Gemini' : 'Groq'}.`;
      if (isGemini) setGeminiFetchError(msg);
      else setGroqFetchError(msg);

      if (showFeedback) {
        setTestResult({ success: false, message: msg });
      }
    } finally {
      if (isGemini) setIsFetchingGeminiModels(false);
      else setIsFetchingGroqModels(false);
    }
  };

  // Sync settings and load live models every time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const latest = getAISettings();
    setSettings(latest);
    setTestResult(null);
    setGeminiFetchError(null);
    setGroqFetchError(null);

    const cachedGemini = getCachedModels('gemini');
    if (cachedGemini.length > 0) setFetchedGeminiModels(cachedGemini);

    const cachedGroq = getCachedModels('groq');
    if (cachedGroq.length > 0) setFetchedGroqModels(cachedGroq);

    if (latest.geminiApiKey && latest.geminiApiKey.trim().length > 20) {
      fetchModelsForProvider('gemini', latest.geminiApiKey, false);
    }
    if (latest.groqApiKey && latest.groqApiKey.trim().length > 20) {
      fetchModelsForProvider('groq', latest.groqApiKey, false);
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

      fetchModelsForProvider(settings.provider, key, false);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Wystąpił błąd podczas sprawdzania klucza.',
      });
    } finally {
      setTesting(false);
    }
  };

  // Merge live/cached models with static fallbacks
  const liveGeminiIds = new Set(fetchedGeminiModels.map((m) => m.id));
  const combinedGeminiModels: AIModelOption[] = [];
  const seenGemini = new Set<string>();
  for (const m of [...fetchedGeminiModels, ...GEMINI_MODELS]) {
    if (!seenGemini.has(m.id)) {
      seenGemini.add(m.id);
      combinedGeminiModels.push(m);
    }
  }

  const liveGroqIds = new Set(fetchedGroqModels.map((m) => m.id));
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
              <span className="font-bold text-[#F2AB91]">Klucz API Google Gemini</span>
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
                    fetchModelsForProvider('gemini', val, false);
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

            <ModelPickerSection
              providerLabel="Gemini"
              models={combinedGeminiModels}
              liveModelIds={liveGeminiIds}
              selectedModel={settings.geminiModel}
              onSelectModel={(modelId) => setSettings((s) => ({ ...s, geminiModel: modelId }))}
              onFetchModels={() => fetchModelsForProvider('gemini', undefined, true)}
              isFetching={isFetchingGeminiModels}
              fetchError={geminiFetchError}
              customMode={customGeminiMode}
              setCustomMode={setCustomGeminiMode}
              customPlaceholder="np. gemini-3.8-flash lub gemini-4-argon"
            />
          </div>
        )}

        {/* Groq Settings View */}
        {settings.provider === 'groq' && (
          <div className="space-y-3 bg-[#182022] p-4 rounded-2xl border border-[#334346]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F2AB91]">Klucz API Groq</span>
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
                    fetchModelsForProvider('groq', val, false);
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

            <ModelPickerSection
              providerLabel="Groq"
              models={combinedGroqModels}
              liveModelIds={liveGroqIds}
              selectedModel={settings.groqModel}
              onSelectModel={(modelId) => setSettings((s) => ({ ...s, groqModel: modelId }))}
              onFetchModels={() => fetchModelsForProvider('groq', undefined, true)}
              isFetching={isFetchingGroqModels}
              fetchError={groqFetchError}
              customMode={customGroqMode}
              setCustomMode={setCustomGroqMode}
              customPlaceholder="np. openai/gpt-oss-120b lub qwen/qwen3.8-27b"
            />
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
            className="w-full py-3 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            Zapisz konfigurację AI
          </button>
        </div>
      </div>
    </div>
  );
};
