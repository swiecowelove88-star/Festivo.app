import { Holiday } from '../types';

export type AIProvider = 'gemini' | 'groq';

export type AITone = 'humor' | 'interview' | 'pov' | 'official';

export type AIScriptLength = 'detailed' | 'short';

export interface AISettings {
  provider: AIProvider;
  geminiApiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
}

export interface AIModelOption {
  id: string;
  name: string;
}

export interface AIGenerationResult {
  tikTokIdea: {
    title: string;
    hook: string;
    script: string;
    audioTrend: string;
    caption: string;
    hashtags: string;
  };
  facebookPost: {
    title: string;
    content: string;
    callToAction: string;
    hashtags: string;
  };
  rawText: string;
  provider: AIProvider;
  model: string;
  tone?: AITone;
  scriptLength?: AIScriptLength;
}

const STORAGE_KEY = 'swieta_ai_settings';

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'gemini',
  geminiApiKey: '',
  geminiModel: 'gemini-3.8-flash',
  groqApiKey: '',
  groqModel: 'openai/gpt-oss-120b',
};

export const GEMINI_MODELS: AIModelOption[] = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Najnowszy — Zalecany)' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite (Najszybszy)' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (Stabilny)' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite' },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon (Flagowy model rozumujący)' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Starszy — może wymagać historii użycia)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Starszy)' },
];

export const GROQ_MODELS: AIModelOption[] = [
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (openai/gpt-oss-120b — Najwyższa jakość)' },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B (openai/gpt-oss-20b — Szybki)' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (qwen/qwen3.8-27b)' },
  { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B (qwen/qwen3-32b)' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B' },
  { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B' },
];

export function getAISettings(): AISettings {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveAISettings(settings: AISettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save AI settings to localStorage', err);
  }
}

export function hasConfiguredAI(): boolean {
  const settings = getAISettings();
  if (settings.provider === 'gemini') {
    return Boolean(settings.geminiApiKey && settings.geminiApiKey.trim().length > 5);
  }
  if (settings.provider === 'groq') {
    return Boolean(settings.groqApiKey && settings.groqApiKey.trim().length > 5);
  }
  return false;
}

/**
 * Fetches ALL live models available for this Gemini API key!
 */
export async function fetchLiveGeminiModels(apiKey: string): Promise<AIModelOption[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return [];

  const allModels: AIModelOption[] = [];
  let pageToken = '';

  do {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}&pageSize=100${
      pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''
    }`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const err = await response.json();
        errorDetail = err.error?.message || response.statusText;
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(`Błąd pobierania modeli Gemini (${response.status}): ${errorDetail}`);
    }

    const data = await response.json();
    const models = data.models || [];
    for (const m of models) {
      const id = (m.name || '').replace(/^models\//, '');
      const methods: string[] = m.supportedGenerationMethods || [];
      const lowerId = id.toLowerCase();
      // Include all text/multimodal generation models; exclude pure embedding/imagen/aqa/tts-only
      const supportsText = methods.includes('generateContent');
      const isNonChat =
        lowerId.includes('embedding') ||
        lowerId.includes('aqa') ||
        lowerId.includes('imagen') ||
        lowerId.includes('veo');

      if (id && supportsText && !isNonChat) {
        const label = m.displayName ? `${m.displayName} (${id})` : id;
        allModels.push({ id, name: label });
      }
    }

    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return allModels;
}

/**
 * Fetches ALL live models available for this specific Groq API key!
 */
export async function fetchLiveGroqModels(apiKey: string): Promise<AIModelOption[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return [];

  const response = await fetch('https://api.groq.com/openai/v1/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const err = await response.json();
      errorDetail = err.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(`Błąd pobierania modeli Groq (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const rawModels = data.data || [];

  // Sort text/chat models first, keep everything visible so user sees all models on their account
  const mapped: AIModelOption[] = rawModels
    .filter((m: any) => m.id)
    .map((m: any) => {
      const id = String(m.id);
      const lower = id.toLowerCase();
      let suffix = '';
      if (lower.includes('whisper')) suffix = ' [Audio/STT]';
      else if (lower.includes('orpheus') || lower.includes('tts')) suffix = ' [TTS]';
      else if (lower.includes('guard') || lower.includes('safety')) suffix = ' [Moderacja]';
      const known = GROQ_MODELS.find((k) => k.id === id);
      return {
        id,
        name: known ? known.name : `${id}${suffix}`,
      };
    })
    .sort((a: AIModelOption, b: AIModelOption) => {
      const aAudio = a.name.includes('[Audio') || a.name.includes('[TTS') || a.name.includes('[Moderacja') ? 1 : 0;
      const bAudio = b.name.includes('[Audio') || b.name.includes('[TTS') || b.name.includes('[Moderacja') ? 1 : 0;
      if (aAudio !== bAudio) return aAudio - bAudio;
      return a.id.localeCompare(b.id);
    });

  return mapped;
}

/**
 * Builds high quality, viral prompt for school social media
 */
function buildPrompt(
  holiday: Holiday,
  tone: AITone = 'humor',
  scriptLength: AIScriptLength = 'detailed'
): string {
  const otherHolidaysStr =
    holiday.allDayHolidays && holiday.allDayHolidays.length > 1
      ? `\nW tym samym dniu przypadają także inne okazje: ${holiday.allDayHolidays.join(', ')}.`
      : '';

  const nameDaysStr =
    holiday.nameDays && holiday.nameDays.length > 0
      ? `\nImieniny obchodzą: ${holiday.nameDays.join(', ')}.`
      : '';

  let styleDesc = '';
  switch (tone) {
    case 'interview':
      styleDesc =
        'KIERUNEK: Sonda na szkolnym korytarzu! Wywiady z zaskoczenia podczas przerwy, rekwizyt jako mikrofon (np. linijka, banan, marker tablicowy), szybkie, cięte i komiczne wypowiedzi uczniów i nauczycieli.';
      break;
    case 'pov':
      styleDesc =
        'KIERUNEK: Filmowy POV / Roleplay! Dramatyczny mini-skecz aktorski (np. uczeń vs nauczyciel, przewodniczący Samorządu Uczniowskiego niczym w filmie akcji lub dramacie mafijnym, zwolnione tempo, zbliżenia).';
      break;
    case 'official':
      styleDesc =
        'KIERUNEK: Akcja Samorządu Uczniowskiego & Integracja! Kulturalne, ale energiczne i wesołe świętowanie, wyzwanie dla klas na korytarzu, apel Samorządu, zaangażowanie dyrekcji i grona pedagogicznego.';
      break;
    case 'humor':
    default:
      styleDesc =
        'KIERUNEK: Viralowy szkolny humor & Rel! Memy, zderzenie powagi święta ze szkolną codziennością (sprawdziany, kartkówki, dzwonek na przerwę, kolejka w sklepiku), autentyczny młodzieżowy klimat bez cringeu.';
      break;
  }

  const isShort = scriptLength === 'short';

  const lengthRules = isShort
    ? `4. TRYB SZCZEGÓŁOWOŚCI: KRÓTKI I KONKRETNY (ekspresowa ściągawka do nagrania na przerwie!):
   - HOOK: 1 krótkie, mocne zdanie (maks. 12 słów).
   - SCENARIUSZ: dokładnie 3 lub 4 bardzo zwięzłe punkty — KAŻDY W JEDNEJ LINII jako 1 krótkie zdanie (np. "1. (0-3s) Kuba wchodzi z kartonem i pyta klasę: ..."). Zero długich opisów scenografii, ubrań i wielozdaniowych akapitów!
   - DŹWIĘK i OPIS: po 1 krótkim zdaniu.
   - FACEBOOK TREŚĆ: krótki, treściwy post — 1 zwięzły akapit (3-4 zdania).`
    : `4. TRYB SZCZEGÓŁOWOŚCI: DOKŁADNY I ROZBUDOWANY (pełny scenariusz reżyserski!):
   - HOOK: szczegółowy opis pierwszych 3 sekund (kadr, ruch kamery, rekwizyt, dokładne otwierające zdanie).
   - SCENARIUSZ: 4 rozbudowane sceny krok po kroku ("1. (0-3s) ...", "2. (3-8s) ...", "3. (8-15s) ...", "4. (15-25s) ...") — w każdej wskaż ujęcie/kadr, rekwizyty, mimikę/akcję oraz pełne, żywe dialogi postaci.
   - FACEBOOK TREŚĆ: rozbudowany, angażujący post na fanpage szkoły (2-3 estetyczne akapity).`;

  const scriptTemplate = isShort
    ? `1. (0-3s) [1 krótkie zdanie: kadr + pierwsza kwestia]
2. (3-8s) [1 krótkie zdanie: główny żart/akcja]
3. (8-15s) [1 krótkie zdanie: puenta i reakcja]`
    : `1. (0-3s) [Dokładny opis ujęcia, rekwizytów i dialog]
2. (3-8s) [Rozwinięcie akcji, reakcje osób i dialog]
3. (8-15s) [Zwrot akcji, dynamika kamery i dialog]
4. (15-25s) [Finał, puenta i mocne zakończenie]`;

  return `Jesteś wybitnym twórcą virali na TikToka/Reels oraz kreatywnym opiekunem mediów Samorządu Uczniowskiego w polskiej szkole.
Twoim celem jest przygotować KOMPLETNY, PEŁNY pakiet materiałów (zarówno sekcję TIKTOK jak i sekcję FACEBOOK — nie przerywaj w połowie!) na święto:
- Święto: "${holiday.name}"
- Data: ${holiday.day}.${holiday.month < 10 ? '0' + holiday.month : holiday.month}
- Kategoria: ${holiday.category}
- Opis święta: "${holiday.description}"${otherHolidaysStr}${nameDaysStr}
- ${styleDesc}

ZASADY:
1. Dla świąt nietypowych/kontrowersyjnych (np. alkohol, toalety) zawsze twórz bezpieczną szkolną adaptację (np. sok jabłkowy zamiast wina, recenzja luster na korytarzu jak w hotelu).
2. Pisz poprawną, naturalną polszczyzną bez zmyślonych słów i literówek (używaj poprawnie nazwy "Samorząd Uczniowski", "SU").
3. Wypełnij WSZYSTKIE pola poniżej dokładnie pod tymi etykietami (każda etykieta w nowej linii, bez żadnych bloków <think>):
${lengthRules}

=== TIKTOK ===
TYTUŁ: [Chwytliwy, krótki tytuł filmu]
HOOK: [${isShort ? '1 krótkie zdanie na start (0-3s)' : 'Dokładny hook na 0-3 sekundy: co widać na ekranie i pierwsze słowa'}]
SCENARIUSZ:
${scriptTemplate}
DŹWIĘK: [Konkretna muzyka, trend audio z TikToka lub styl podkładu]
OPIS: [${isShort ? 'Krótki, 1-zdaniowy opis pod film' : 'Gotowy, barwny opis do wklejenia pod filmem z humorem'}]
HASHTAGI: [Hashtagi z #]

=== FACEBOOK ===
TYTUŁ: [Chwytliwy nagłówek posta]
TREŚĆ:
[${isShort ? 'Krótki post na fanpage szkoły - 1 zwięzły akapit (3-4 zdania)' : 'Pełny post na fanpage szkoły - 2-3 estetyczne akapity z humorem i szkolnym duchem'}]
CTA: [Chwytliwe pytanie do komentarza lub zadanie/wyzwanie dla uczniów]
HASHTAGI: [Hashtagi pod post na FB]
`;
}

/**
 * Strips leading/trailing markdown bold, asterisks, quotes
 */
export function cleanText(t: string, keepHashtags = false): string {
  if (!t) return '';
  let str = t.trim();
  if (keepHashtags) {
    str = str.replace(/^[\s*"'\`*]+/, '').replace(/[\s*"'\`*]+$/, '').trim();
  } else {
    str = str.replace(/^[\s*"'\`#*-]+/, '').replace(/[\s*"'\`#*-]+$/, '').trim();
  }
  return str;
}

/**
 * Cleans multiline text
 */
export function cleanMultiLine(text: string): string {
  if (!text) return '';
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '**' && l !== '***' && l !== '---' && l !== '___')
    .map((l) => l.replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, ''))
    .join('\n')
    .trim();
}

/**
 * Strips <think>...</think> reasoning blocks if a model emits them inline
 */
function stripThinkingTags(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls Gemini API with automatic fallback across modern Gemini models
 * (handles 404/403/400 unavailable models as well as 503 high-demand & 429 per-model spikes)
 */
async function callGemini(
  apiKey: string,
  requestedModel: string,
  prompt: string,
  maxTokens = 8192
): Promise<{ text: string; usedModel: string }> {
  const cleanKey = apiKey.trim();

  const candidateModels = [
    requestedModel,
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-4-argon',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = '';
  let sawHighDemand = false;

  for (let idx = 0; idx < candidateModels.length; idx++) {
    const modelToTry = candidateModels[idx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      modelToTry
    )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: maxTokens,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const parts: any[] = candidate?.content?.parts || [];

        // Exclude internal thought parts if present, join all real answer parts
        const answerParts = parts.filter((p) => !p.thought && typeof p.text === 'string');
        let text = answerParts.map((p) => p.text).join('\n').trim();

        if (!text) {
          text = parts
            .filter((p) => typeof p.text === 'string')
            .map((p) => p.text)
            .join('\n')
            .trim();
        }

        if (!text) {
          const blockReason = data.promptFeedback?.blockReason || candidate?.finishReason;
          throw new Error(
            `Gemini API zwróciło pustą odpowiedź (powód: ${blockReason || 'nieznany'}). Spróbuj innego modelu lub tonu.`
          );
        }

        return { text, usedModel: modelToTry };
      }

      let errorDetail = '';
      try {
        const errJson = await response.json();
        errorDetail = errJson.error?.message || response.statusText;
      } catch {
        errorDetail = response.statusText;
      }

      lastError = `(${response.status}): ${errorDetail}`;

      // Do not retry other models if the API key itself is invalid
      const isKeyInvalid =
        response.status === 401 ||
        errorDetail.toLowerCase().includes('api key not valid') ||
        errorDetail.toLowerCase().includes('api_key_invalid');

      if (isKeyInvalid) {
        throw new Error(`Błąd klucza Gemini API ${lastError}`);
      }

      const lowerDetail = errorDetail.toLowerCase();
      const isTransientOverload =
        response.status === 503 ||
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 504 ||
        lowerDetail.includes('high demand') ||
        lowerDetail.includes('overloaded') ||
        lowerDetail.includes('unavailable') ||
        lowerDetail.includes('try again');

      if (isTransientOverload) {
        sawHighDemand = true;
      }

      // Retry next candidate on model availability errors OR per-model transient spikes (503/429/5xx)
      const shouldRetryNextModel =
        isTransientOverload ||
        response.status === 404 ||
        response.status === 400 ||
        response.status === 403 ||
        lowerDetail.includes('not found') ||
        lowerDetail.includes('not supported') ||
        lowerDetail.includes('does not exist') ||
        lowerDetail.includes('access');

      if (!shouldRetryNextModel) {
        throw new Error(`Błąd Gemini API ${lastError}`);
      }

      if (isTransientOverload && idx < candidateModels.length - 1) {
        await delay(300);
      }
    } catch (err: any) {
      if (
        err.message?.includes('Błąd klucza Gemini API') ||
        err.message?.includes('Gemini API zwróciło pustą odpowiedź') ||
        err.message?.startsWith('Błąd Gemini API ')
      ) {
        throw err;
      }
      lastError = err.message || 'Nieznany błąd sieci';
    }
  }

  if (sawHighDemand) {
    throw new Error(
      `Serwery Gemini są chwilowo przeciążone (503/429). Przetestowaliśmy zapasowe modele, ale żaden nie był teraz wolny. Odczekaj kilka sekund i kliknij ponownie, lub przełącz dostawcę na Groq. Ostatni komunikat: ${lastError}`
    );
  }

  throw new Error(
    `Błąd Gemini API: Żaden z modeli nie odpowiedział (${lastError}). Kliknij „Wczytaj modele z konta” w ustawieniach.`
  );
}

/**
 * Calls Groq API with automatic model retry / fallback & token limit handling
 */
async function callGroq(
  apiKey: string,
  requestedModel: string,
  prompt: string,
  maxTokens = 8192
): Promise<{ text: string; usedModel: string }> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const cleanKey = apiKey.trim();

  const candidateModels = [
    requestedModel,
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = '';

  for (const modelToTry of candidateModels) {
    for (const tokenLimit of [maxTokens, 4096]) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cleanKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelToTry,
            messages: [
              {
                role: 'system',
                content:
                  'Jesteś czołowym reżyserem virali na TikToka/Reels oraz kreatywnym liderem Samorządu Uczniowskiego w polskiej szkole. Zawsze zwracasz KOMPLETNĄ odpowiedź zawierającą obie sekcje (=== TIKTOK === oraz === FACEBOOK ===) w wymaganym formacie, nigdy nie urywając tekstu w połowie.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.8,
            max_tokens: tokenLimit,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const msg = data.choices?.[0]?.message;
          const text = msg?.content || '';
          if (text.trim()) {
            return { text: stripThinkingTags(text), usedModel: modelToTry };
          }
        }

        let errorMsg = response.statusText;
        try {
          const errJson = await response.json();
          errorMsg = errJson.error?.message || response.statusText;
        } catch {
          // ignore
        }

        lastError = `(${response.status}): ${errorMsg}`;

        if (response.status === 401) {
          throw new Error(`Błąd klucza Groq API ${lastError}`);
        }

        // If 400 was specifically about max_tokens too large, try next smaller tokenLimit
        if (response.status === 400 && errorMsg.toLowerCase().includes('max_tokens') && tokenLimit > 4096) {
          continue;
        }

        // Otherwise break inner token loop and try next model on availability or transient overload errors
        if (
          response.status === 404 ||
          response.status === 400 ||
          response.status === 403 ||
          response.status === 429 ||
          response.status === 503 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 504
        ) {
          if (response.status === 503 || response.status === 429) {
            await delay(300);
          }
          break;
        }

        throw new Error(`Błąd Groq API ${lastError}`);
      } catch (err: any) {
        if (err.message?.includes('401') || err.message?.includes('Błąd Groq API')) {
          throw err;
        }
        lastError = err.message || 'Nieznany błąd sieci';
        break;
      }
    }
  }

  throw new Error(
    `Błąd Groq API: Żaden z modeli nie zadziałał. Ostatni błąd: ${lastError}. Kliknij „Wczytaj modele z konta” w ustawieniach.`
  );
}

/**
 * Robust line-by-line state machine parser for generated content.
 */
export function parseGeneratedText(
  rawInput: string,
  provider: AIProvider,
  model: string,
  tone?: AITone,
  scriptLength?: AIScriptLength
): AIGenerationResult {
  const raw = stripThinkingTags(rawInput || '');

  const result: AIGenerationResult = {
    tikTokIdea: {
      title: '',
      hook: '',
      script: '',
      audioTrend: '',
      caption: '',
      hashtags: '',
    },
    facebookPost: {
      title: '',
      content: '',
      callToAction: '',
      hashtags: '',
    },
    rawText: raw,
    provider,
    model,
    tone,
    scriptLength,
  };

  if (!raw || typeof raw !== 'string') return result;

  const lines = raw.split(/\r?\n/);
  let currentTarget = '';
  let buffer: string[] = [];
  let inFacebookSection = false;

  const flush = () => {
    if (!currentTarget) return;
    const text = buffer.join('\n').trim();
    if (!text) {
      currentTarget = '';
      buffer = [];
      return;
    }

    switch (currentTarget) {
      case 'TIKTOK_TITLE':
        result.tikTokIdea.title = cleanText(text);
        break;
      case 'TIKTOK_HOOK':
        result.tikTokIdea.hook = cleanText(text);
        break;
      case 'TIKTOK_SCRIPT':
        result.tikTokIdea.script = cleanMultiLine(text);
        break;
      case 'TIKTOK_AUDIO':
        result.tikTokIdea.audioTrend = cleanText(text);
        break;
      case 'TIKTOK_CAPTION':
        result.tikTokIdea.caption = cleanText(text);
        break;
      case 'TIKTOK_HASHTAGS':
        result.tikTokIdea.hashtags = cleanText(text, true);
        break;
      case 'FB_TITLE':
        result.facebookPost.title = cleanText(text);
        break;
      case 'FB_CONTENT':
        result.facebookPost.content = cleanMultiLine(text);
        break;
      case 'FB_CTA':
        result.facebookPost.callToAction = cleanText(text);
        break;
      case 'FB_HASHTAGS':
        result.facebookPost.hashtags = cleanText(text, true);
        break;
    }
    currentTarget = '';
    buffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    // Strip markdown hashes, bold stars, emojis, bullets at the start for header inspection
    const normalized = trimmed
      .replace(/^[\s#*=->\d.)]+/, '')
      .replace(/[^\p{L}\p{N}\s:_-]/gu, '')
      .trim();

    if (/^=*\s*(?:POST NA\s+)?FACEBOOK\s*=*$/i.test(normalized) || /^===+\s*FACEBOOK/i.test(trimmed)) {
      flush();
      inFacebookSection = true;
      continue;
    }
    if (/^=*\s*(?:POMYSŁ NA\s+)?TIKTOK\s*=*$/i.test(normalized) || /^===+\s*TIKTOK/i.test(trimmed)) {
      flush();
      inFacebookSection = false;
      continue;
    }

    // Match field headers robustly even with emojis, numbering, bolding, or extra descriptor words before ':'
    const cleanForColon = trimmed
      .replace(/^[\s#*->\d.)]+/, '')
      .replace(/^[^\p{L}]+/u, ''); // remove leading emojis

    const headerMatch = cleanForColon.match(
      /^(?:\*{1,3})?(?:(?:TIKTOK|FB)[\s_]+)?(TYTUŁ|TYTUL|HOOK[^:]{0,20}|SCENARIUSZ[^:]{0,20}|DŹWIĘK[^:]{0,20}|DZWIEK[^:]{0,20}|AUDIO[^:]{0,20}|MUZYKA[^:]{0,20}|OPIS(?!\s*(?:SCENY|AKCJI|UJĘCIA|POSTACI))[^:]{0,20}|CAPTION[^:]{0,15}|HASHTAG[IY]?[^:]{0,15}|TAGI|TREŚĆ[^:]{0,20}|TRESC[^:]{0,20}|POST(?:\s+NA\s+FB)?|CTA[^:]{0,25}|WEZWANIE[^:]{0,25}|WYZWANIE[^:]{0,25})(?:\*{1,3})?\s*:\s*(.*)$/i
    );

    if (headerMatch) {
      flush();
      const rawKey = headerMatch[1].toUpperCase();
      const inlineContent = headerMatch[2].replace(/^\*{1,3}\s*/, '').trim();

      if (rawKey.startsWith('TYTU')) {
        currentTarget = inFacebookSection ? 'FB_TITLE' : 'TIKTOK_TITLE';
      } else if (rawKey.startsWith('HOOK')) {
        currentTarget = 'TIKTOK_HOOK';
      } else if (rawKey.startsWith('SCENARIUSZ')) {
        currentTarget = 'TIKTOK_SCRIPT';
      } else if (
        rawKey.startsWith('DŹW') ||
        rawKey.startsWith('DZW') ||
        rawKey.startsWith('AUDIO') ||
        rawKey.startsWith('MUZYK')
      ) {
        currentTarget = 'TIKTOK_AUDIO';
      } else if (rawKey.startsWith('OPIS') || rawKey.startsWith('CAPTION')) {
        currentTarget = 'TIKTOK_CAPTION';
      } else if (rawKey.startsWith('HASHTAG') || rawKey === 'TAGI') {
        currentTarget = inFacebookSection ? 'FB_HASHTAGS' : 'TIKTOK_HASHTAGS';
      } else if (rawKey.startsWith('TRE') || rawKey.startsWith('POST')) {
        currentTarget = 'FB_CONTENT';
      } else if (rawKey.startsWith('CTA') || rawKey.startsWith('WEZWAN') || rawKey.startsWith('WYZWA')) {
        currentTarget = 'FB_CTA';
      }

      if (inlineContent) {
        buffer.push(inlineContent);
      }
      continue;
    }

    if (currentTarget) {
      if (/^[\s*#-]{2,}$/.test(trimmed)) continue;
      buffer.push(line);
    }
  }

  flush();

  // Robust fallbacks if any field was omitted or formatted unconventionally
  if (!result.tikTokIdea.title) result.tikTokIdea.title = 'Pomysł na TikToka';
  if (!result.tikTokIdea.hook) result.tikTokIdea.hook = 'Zobacz pełny scenariusz poniżej';
  if (!result.tikTokIdea.script) {
    const rawTikTok = raw.split(/={2,}\s*FACEBOOK/i)[0];
    result.tikTokIdea.script = cleanMultiLine(rawTikTok);
  }
  if (!result.tikTokIdea.audioTrend) {
    result.tikTokIdea.audioTrend = 'Popularny trend dźwiękowy na TikToku';
  }
  if (!result.tikTokIdea.hashtags) {
    result.tikTokIdea.hashtags = '#szkoła #dlaciebie #dc #viral #festivo';
  }

  if (!result.facebookPost.title) result.facebookPost.title = 'Post na szkolnego Facebooka';
  if (!result.facebookPost.content) {
    const fbSplit = raw.split(/={2,}\s*FACEBOOK|\bFACEBOOK\b\s*[:=]?/i);
    result.facebookPost.content =
      fbSplit.length > 1 ? cleanMultiLine(fbSplit.slice(1).join('\n')) : cleanMultiLine(raw);
  }
  if (!result.facebookPost.callToAction) {
    result.facebookPost.callToAction = 'Dajcie znać w komentarzach, jak świętujecie ten dzień!';
  }
  if (!result.facebookPost.hashtags) {
    result.facebookPost.hashtags = '#Szkoła #SamorządUczniowski #Festivo';
  }

  return result;
}

/**
 * Main function to generate holiday social ideas using the active configured AI
 */
export async function generateHolidaySocialIdeas(
  holiday: Holiday,
  tone: AITone = 'humor',
  scriptLength: AIScriptLength = 'detailed'
): Promise<AIGenerationResult> {
  const settings = getAISettings();
  const prompt = buildPrompt(holiday, tone, scriptLength);

  let rawOutput = '';
  const provider = settings.provider;
  let activeModel = '';

  if (provider === 'gemini') {
    if (!settings.geminiApiKey || settings.geminiApiKey.trim().length === 0) {
      throw new Error('Brak klucza API Gemini! Dodaj swój bezpłatny klucz w Ustawieniach AI.');
    }
    const requested = settings.geminiModel || 'gemini-3.8-flash';
    const geminiRes = await callGemini(settings.geminiApiKey, requested, prompt, 8192);
    rawOutput = geminiRes.text;
    activeModel = geminiRes.usedModel;

    if (activeModel !== requested) {
      saveAISettings({ ...settings, geminiModel: activeModel });
    }
  } else if (provider === 'groq') {
    if (!settings.groqApiKey || settings.groqApiKey.trim().length === 0) {
      throw new Error('Brak klucza API Groq! Dodaj swój bezpłatny klucz w Ustawieniach AI.');
    }
    const requested = settings.groqModel || 'openai/gpt-oss-120b';
    const groqRes = await callGroq(settings.groqApiKey, requested, prompt, 8192);
    rawOutput = groqRes.text;
    activeModel = groqRes.usedModel;

    if (activeModel !== requested) {
      saveAISettings({ ...settings, groqModel: activeModel });
    }
  } else {
    throw new Error('Nieznany dostawca AI.');
  }

  return parseGeneratedText(rawOutput, provider, activeModel, tone, scriptLength);
}

/**
 * Tests connection with the given API key
 */
export async function testAIConnection(
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<{ detail: string; usedModel: string }> {
  const testPrompt = 'Napisz dokładnie dwa słowa: "Połączenie działa"';
  if (provider === 'gemini') {
    const res = await callGemini(apiKey, model || 'gemini-3.8-flash', testPrompt, 1024);
    return {
      detail: `Użyty model: ${res.usedModel} (${res.text})`,
      usedModel: res.usedModel,
    };
  }
  if (provider === 'groq') {
    const res = await callGroq(apiKey, model || 'openai/gpt-oss-120b', testPrompt, 1024);
    return {
      detail: `Użyty model: ${res.usedModel} (${res.text})`,
      usedModel: res.usedModel,
    };
  }
  return { detail: 'OK', usedModel: model };
}
