import { Holiday } from '../types';

export type AIProvider = 'gemini' | 'groq';

export type AITone = 'humor' | 'interview' | 'pov' | 'official';

export interface AISettings {
  provider: AIProvider;
  geminiApiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
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
}

const STORAGE_KEY = 'swieta_ai_settings';

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'groq',
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  groqApiKey: '',
  groqModel: 'openai/gpt-oss-120b',
};

export const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Szybki i nowoczesny - Zalecany)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Najwyższa jakość)' },
];

export const GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (openai/gpt-oss-120b - Najwyższa jakość, Zalecany)' },
  { id: 'gpt-oss-120b', name: 'GPT OSS 120B (gpt-oss-120b)' },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B (openai/gpt-oss-20b - Bardzo szybki)' },
  { id: 'gpt-oss-20b', name: 'GPT OSS 20B (gpt-oss-20b)' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (qwen/qwen3.8-27b)' },
  { id: 'qwen-3.8-27b', name: 'Qwen 3.8 27B (qwen-3.8-27b)' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (starszy model)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (starszy model)' },
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
 * Fetches the live list of models available for this specific Groq API key!
 */
export async function fetchLiveGroqModels(apiKey: string): Promise<string[]> {
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
  const models = (data.data || [])
    .map((m: any) => m.id)
    .filter((id: string) => !id.toLowerCase().includes('whisper') && !id.toLowerCase().includes('audio'));

  return models;
}

/**
 * Builds high quality, viral prompt for school social media
 */
function buildPrompt(holiday: Holiday, tone: AITone = 'humor'): string {
  const otherHolidaysStr = holiday.allDayHolidays && holiday.allDayHolidays.length > 1
    ? `\nW tym samym dniu przypadają także inne okazje: ${holiday.allDayHolidays.join(', ')}.`
    : '';

  const nameDaysStr = holiday.nameDays && holiday.nameDays.length > 0
    ? `\nImieniny obchodzą: ${holiday.nameDays.join(', ')}.`
    : '';

  let styleDesc = '';
  switch (tone) {
    case 'interview':
      styleDesc = 'KIERUNEK: Sonda na szkolnym korytarzu! Wywiady z zaskoczenia podczas przerwy, rekwizyt jako mikrofon (np. linijka, banan, marker tablicowy), szybkie, cięte i komiczne wypowiedzi uczniów i nauczycieli.';
      break;
    case 'pov':
      styleDesc = 'KIERUNEK: Filmowy POV / Roleplay! Dramatyczny mini-skecz aktorski (np. uczeń vs nauczyciel, przewodniczący Samorządu Uczniowskiego niczym w filmie akcji lub dramacie mafijnym, zwolnione tempo, zbliżenia).';
      break;
    case 'official':
      styleDesc = 'KIERUNEK: Akcja Samorządu Uczniowskiego & Integracja! Kulturalne, ale energiczne i wesołe świętowanie, wyzwanie dla klas na korytarzu, apel Samorządu, zaangażowanie dyrekcji i grona pedagogicznego.';
      break;
    case 'humor':
    default:
      styleDesc = 'KIERUNEK: Viralowy szkolny humor & Rel! Memy, zderzenie powagi święta ze szkolną codziennością (sprawdziany, kartkówki, dzwonek na przerwę, kolejka w sklepiku), autentyczny młodzieżowy klimat bez cringeu.';
      break;
  }

  return `Jesteś wybitnym twórcą virali na TikToka/Reels (miliony wyświetleń) oraz kreatywnym opiekunem mediów Samorządu Uczniowskiego w polskiej szkole.
Twoim celem jest przygotować kompletny, porywający, pełen humoru pakiet materiałów na święto:
- Święto: "${holiday.name}"
- Data: ${holiday.day}.${holiday.month < 10 ? '0' + holiday.month : holiday.month}
- Kategoria: ${holiday.category}
- Opis święta: "${holiday.description}"${otherHolidaysStr}${nameDaysStr}
- ${styleDesc}

ŻELAZNE ZASADY KREATYWNE:
1. DLA ŚWIĄT NIETYPOWYCH/KONTROWERSYJNYCH (np. związanych z alkoholem, toaletami itp.): ZAWSZE twórz bezpieczną, genialną szkolną adaptację (np. zamiast taniego wina -> degustacja najtańszego soku jabłkowego z dyskontu lub herbaty ze sklepiku w papierowym kubeczku w stylu snobistycznego sommeliera; zamiast toalet -> recenzja szkolnych korytarzy i luster jak w hotelu 5-gwiazdkowym).
2. ŻADNYCH OGÓLNIKÓW! Pokaż konkretne postacie i dialogi: przewodniczący Samorządu, uczeń z 3B, nauczyciel chemii/WF/matematyki.
3. SCENARIUSZ TIKTOKA: musi być pełny, podzielony na sekwencje sekundowe:
   - 1. (0-3s) Visual Hook & Pierwsze słowa
   - 2. (3-8s) Rozwinięcie akcji
   - 3. (8-15s) Zwrot akcji / wejście nauczyciela
   - 4. (15-25s) Zaskakująca puenta i wezwanie do akcji
4. POST NA FACEBOOKA: musi być gotowy do publikacji na fanpage szkoły. Nie nudny referat, lecz ciepły, żywy tekst z emotkami i zintegrowany z wyzwaniem/pytaniem w komentarzach.

Zwróć odpowiedź DOKŁADNIE w poniższym formacie z tymi nagłówkami (nie zmieniaj ich nazw ani nie dodawaj gwiazdek do etykiet):

=== TIKTOK ===
TYTUŁ: [Chwytliwy, krótki tytuł filmu]
HOOK: [Dokładny hook na 0-3 sekundy: co widać na ekranie i pierwsze słowa]
SCENARIUSZ:
1. (0-3s) [Opis ujęcia i dialog]
2. (3-8s) [Opis akcji i dialog]
3. (8-15s) [Zwrot akcji i dialog]
4. (15-25s) [Puenta i finał]
DŹWIĘK: [Konkretna muzyka, trend audio z TikToka lub styl podkładu]
OPIS: [Gotowy opis do wklejenia pod filmem z humorem]
HASHTAGI: [Najlepsze hashtagi z #]

=== FACEBOOK ===
TYTUŁ: [Chwytliwy nagłówek posta z emotkami]
TREŚĆ:
[Pełny post na fanpage szkoły - 2-3 estetyczne akapity z humorem i szkolnym duchem]
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
 * Cleans multiline text (removes standalone asterisks lines and leading asterisks)
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
 * Calls Gemini API
 */
async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const cleanModel = model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;

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
        maxOutputTokens: 2500,
      },
    }),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(`Błąd Gemini API (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API zwróciło pustą odpowiedź.');
  }

  return text;
}

/**
 * Calls Groq API with automatic model retry / fallback
 */
async function callGroq(apiKey: string, requestedModel: string, prompt: string): Promise<{ text: string; usedModel: string }> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const cleanKey = apiKey.trim();

  // Primary model and list of backup candidates if 404 occurs
  const candidateModels = [
    requestedModel,
    'openai/gpt-oss-120b',
    'gpt-oss-120b',
    'openai/gpt-oss-20b',
    'gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'qwen-3.8-27b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = '';

  for (const modelToTry of candidateModels) {
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
                'Jesteś czołowym reżyserem virali na TikToka/Reels (ponad 100M wyświetleń) oraz kreatywnym liderem Samorządu Uczniowskiego w polskiej szkole. Specjalizujesz się w tworzeniu genialnych, szalenie zabawnych, autentycznych treści dla uczniów i nauczycieli. Tworzysz pełne, wyczerpujące odpowiedzi z kompletnymi scenariuszami krok po kroku (nigdy nie ucinasz tekstu!).',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 2500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return { text, usedModel: modelToTry };
        }
      }

      // If failed, extract error message
      let errorMsg = response.statusText;
      try {
        const errJson = await response.json();
        errorMsg = errJson.error?.message || response.statusText;
      } catch {
        // ignore
      }

      lastError = `(${response.status}): ${errorMsg}`;

      // If it's not a 404 model not found error, don't try other models (e.g. invalid API key 401)
      if (response.status !== 404 && response.status !== 400) {
        throw new Error(`Błąd Groq API ${lastError}`);
      }
    } catch (err: any) {
      if (!err.message?.includes('404') && !err.message?.includes('does not exist')) {
        throw err;
      }
      lastError = err.message;
    }
  }

  throw new Error(
    `Błąd Groq API: Żaden z modeli nie zadziałał. Ostatni błąd: ${lastError}. Kliknij 'Pobierz modele z konta', aby wczytać aktualne modele z Twojego konta Groq.`
  );
}

/**
 * Robust line-by-line state machine parser for generated content.
 * Prevents regex collisions with words like "opis", "dźwięk", "treść" inside the script!
 */
export function parseGeneratedText(
  raw: string,
  provider: AIProvider,
  model: string,
  tone?: AITone
): AIGenerationResult {
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

    // Check for major section headers
    if (
      /^={2,}\s*FACEBOOK/i.test(trimmed) ||
      /^#{1,3}\s*FACEBOOK/i.test(trimmed) ||
      /^\*{2,}\s*FACEBOOK/i.test(trimmed)
    ) {
      flush();
      inFacebookSection = true;
      continue;
    }
    if (
      /^={2,}\s*TIKTOK/i.test(trimmed) ||
      /^#{1,3}\s*TIKTOK/i.test(trimmed) ||
      /^\*{2,}\s*TIKTOK/i.test(trimmed)
    ) {
      flush();
      inFacebookSection = false;
      continue;
    }

    // Check for field markers at the start of a line
    // e.g. "TYTUŁ: ...", "**TYTUŁ:** ...", "### TYTUŁ: ...", "HOOK: ...", "SCENARIUSZ:"
    const headerMatch = trimmed.match(
      /^(?:#{1,4}|\*{1,3}|-)?\s*(?:(?:TIKTOK|FB)_)?(TYTUŁ|TYTUL|HOOK|SCENARIUSZ|DŹWIĘK|DZWIEK|AUDIO|MUZYKA|OPIS(?!\s*(?:SCENY|AKCJI|UJĘCIA|POSTACI))|CAPTION|HASHTAGI?|TAGI|TREŚĆ|TRESC|POST|CTA|WEZWANIE|WYZWANIE)\s*(?:\*{1,3})?\s*:\s*(.*)$/i
    );

    if (headerMatch) {
      flush();
      const rawKey = headerMatch[1].toUpperCase();
      const inlineContent = headerMatch[2].trim();

      if (rawKey.startsWith('TYTU') || rawKey.startsWith('TITLE')) {
        currentTarget = inFacebookSection ? 'FB_TITLE' : 'TIKTOK_TITLE';
      } else if (rawKey === 'HOOK') {
        currentTarget = 'TIKTOK_HOOK';
      } else if (rawKey === 'SCENARIUSZ' || rawKey === 'SCRIPT') {
        currentTarget = 'TIKTOK_SCRIPT';
      } else if (rawKey.includes('DZW') || rawKey.includes('DŹW') || rawKey === 'AUDIO' || rawKey === 'MUZYKA') {
        currentTarget = 'TIKTOK_AUDIO';
      } else if (rawKey.startsWith('OPIS') || rawKey === 'CAPTION') {
        currentTarget = 'TIKTOK_CAPTION';
      } else if (rawKey.startsWith('HASHTAG') || rawKey === 'TAGI') {
        currentTarget = inFacebookSection ? 'FB_HASHTAGS' : 'TIKTOK_HASHTAGS';
      } else if (rawKey.startsWith('TRE') || rawKey === 'POST' || rawKey === 'CONTENT') {
        currentTarget = 'FB_CONTENT';
      } else if (rawKey === 'CTA' || rawKey === 'WEZWANIE' || rawKey === 'WYZWANIE') {
        currentTarget = 'FB_CTA';
      }

      if (inlineContent) {
        buffer.push(inlineContent);
      }
      continue;
    }

    // Accumulate regular content line
    if (currentTarget) {
      if (/^[\s*#-]{2,}$/.test(trimmed)) continue;
      buffer.push(line);
    }
  }

  flush();

  // Robust fallbacks if any field was omitted
  if (!result.tikTokIdea.title) result.tikTokIdea.title = 'Viralowy pomysł na TikToka';
  if (!result.tikTokIdea.hook) result.tikTokIdea.hook = 'POV: Kiedy w szkole jest to święto...';
  if (!result.tikTokIdea.script) {
    const rawTikTok = raw.split(/={2,}\s*FACEBOOK/i)[0];
    result.tikTokIdea.script = cleanMultiLine(rawTikTok);
  }
  if (!result.tikTokIdea.audioTrend) {
    result.tikTokIdea.audioTrend = 'Popularny trend na TikToku / dynamiczna muzyka szkolna';
  }
  if (!result.tikTokIdea.hashtags) {
    result.tikTokIdea.hashtags = '#szkoła #dlaciebie #dc #viral #uczniowie';
  }

  if (!result.facebookPost.title) result.facebookPost.title = 'Dziś w naszej szkole!';
  if (!result.facebookPost.content) {
    const fbPart = raw.split(/={2,}\s*FACEBOOK/i)[1];
    result.facebookPost.content = fbPart ? cleanMultiLine(fbPart) : cleanMultiLine(raw);
  }
  if (!result.facebookPost.callToAction) {
    result.facebookPost.callToAction = 'A jak Wy świętujecie dzisiejszy dzień? Dajcie znać w komentarzach! 👇';
  }
  if (!result.facebookPost.hashtags) {
    result.facebookPost.hashtags = '#Szkoła #SamorządUczniowski #Uczniowie #SzkolneŻycie';
  }

  return result;
}

/**
 * Main function to generate holiday social ideas using the active configured AI
 */
export async function generateHolidaySocialIdeas(
  holiday: Holiday,
  tone: AITone = 'humor'
): Promise<AIGenerationResult> {
  const settings = getAISettings();
  const prompt = buildPrompt(holiday, tone);

  let rawOutput = '';
  const provider = settings.provider;
  let activeModel = '';

  if (provider === 'gemini') {
    if (!settings.geminiApiKey || settings.geminiApiKey.trim().length === 0) {
      throw new Error('Brak klucza API Gemini! Dodaj swój bezpłatny klucz w Ustawieniach AI.');
    }
    activeModel = settings.geminiModel || 'gemini-2.5-flash';
    rawOutput = await callGemini(settings.geminiApiKey, activeModel, prompt);
  } else if (provider === 'groq') {
    if (!settings.groqApiKey || settings.groqApiKey.trim().length === 0) {
      throw new Error('Brak klucza API Groq! Dodaj swój bezpłatny klucz w Ustawieniach AI.');
    }
    const requested = settings.groqModel || 'openai/gpt-oss-120b';
    const groqRes = await callGroq(settings.groqApiKey, requested, prompt);
    rawOutput = groqRes.text;
    activeModel = groqRes.usedModel;

    // If a fallback model was used, update setting so future requests use it
    if (activeModel !== requested) {
      saveAISettings({ ...settings, groqModel: activeModel });
    }
  } else {
    throw new Error('Nieznany dostawca AI.');
  }

  return parseGeneratedText(rawOutput, provider, activeModel, tone);
}

/**
 * Tests connection with the given API key
 */
export async function testAIConnection(provider: AIProvider, apiKey: string, model: string): Promise<string> {
  const testPrompt = 'Napisz krótko: "Połączenie działa prawidłowo!"';
  if (provider === 'gemini') {
    const res = await callGemini(apiKey, model || 'gemini-2.5-flash', testPrompt);
    return res;
  }
  if (provider === 'groq') {
    const res = await callGroq(apiKey, model || 'openai/gpt-oss-120b', testPrompt);
    return `Użyty model: ${res.usedModel}`;
  }
  return 'OK';
}
