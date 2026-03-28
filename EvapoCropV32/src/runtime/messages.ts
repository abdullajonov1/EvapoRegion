// Local messages for EvapoCropV12 (self-contained translations)
export type LangCode = "uz_lat" | "uz_cyrl" | "ru";

type Dict = Record<string, string>;
type Bundle = Record<LangCode, Dict>;

const normalizeCropLookupKey = (value: string): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[‘’`ʻʼʹʽ´]/g, "'")
    .replace(/\s+/g, " ");

const MESSAGES: Bundle = {
  uz_lat: {
    "evapoCrop.title": "Ekinlar",
    "evapoCrop.header": "Ekin tanlang",
    "evapoCrop.noData": "Ekin topilmadi",
    "evapoCrop.areaUnit": "ga",
    "evapoCrop.loading": "Yuklanmoqda...",
    "evapoCrop.error": "Xatolik yuz berdi",
    "evapoCrop.unit.thousand": "ming",
    "evapoCrop.unit.million": "million",
    "status.loading": "Yuklanmoqda...",
    "status.error": "Xatolik yuz berdi",
    "status.noData": "Ma'lumot topilmadi",
    "status.connecting": "Ulanmoqda...",
    "button.retry": "Qayta urinish",
    "button.refresh": "Yangilash",
  },
  uz_cyrl: {
    "evapoCrop.title": "Экинлар",
    "evapoCrop.header": "Экинни танланг",
    "evapoCrop.noData": "Экин топилмади",
    "evapoCrop.areaUnit": "га",
    "evapoCrop.loading": "Юкланмоқда...",
    "evapoCrop.error": "Хатолик юз берди",
    "evapoCrop.unit.thousand": "минг",
    "evapoCrop.unit.million": "миллион",
    "status.loading": "Юкланмоқда...",
    "status.error": "Хатолик юз берди",
    "status.noData": "Маълумот топилмади",
    "status.connecting": "Уланмоқда...",
    "button.retry": "Қайта уриниш",
    "button.refresh": "Янгилаш",
  },
  ru: {
    "evapoCrop.title": "Культуры",
    "evapoCrop.header": "Выберите культуру",
    "evapoCrop.noData": "Культура не найдена",
    "evapoCrop.areaUnit": "га",
    "evapoCrop.loading": "Загрузка...",
    "evapoCrop.error": "Произошла ошибка",
    "evapoCrop.unit.thousand": "тысяч",
    "evapoCrop.unit.million": "миллион",
    "status.loading": "Загрузка...",
    "status.error": "Произошла ошибка",
    "status.noData": "Данные не найдены",
    "status.connecting": "Подключение...",
    "button.retry": "Повторить",
    "button.refresh": "Обновить",
  },
};

// Crop name translations
const CROP_NAMES: Record<string, Record<LangCode, string>> = {
  "Aralash ekin": {
    uz_lat: "Aralash ekin",
    uz_cyrl: "Аралаш экин",
    ru: "Смешанный урожай",
  },
  "Baliq hovuz": {
    uz_lat: "Baliq hovuz",
    uz_cyrl: "Балиқ ҳовуз",
    ru: "Рыбный пруд",
  },
  Beda: { uz_lat: "Beda", uz_cyrl: "Беда", ru: "Люцерна" },
  "Bo'z yer": { uz_lat: "Bo'z yer", uz_cyrl: "Бўз ер", ru: "Целинная земля" },
  "Bog'": { uz_lat: "Bog'", uz_cyrl: "Боғ", ru: "Сад" },
  "Bug'doy": { uz_lat: "Bug'doy", uz_cyrl: "Буғдой", ru: "Пшеница" },
  Ikkilamchi: { uz_lat: "Ikkilamchi", uz_cyrl: "Иккиламчи", ru: "Вторичный" },
  "Ikkilamchi ekin ekilmagan": {
    uz_lat: "Ikkilamchi ekin ekilmagan",
    uz_cyrl: "Иккиламчи экин экилмаган",
    ru: "Вторичная культура не высажена",
  },
  "Makkajo'xori": {
    uz_lat: "Makkajo'xori",
    uz_cyrl: "Маккажўхори",
    ru: "Кукуруза",
  },
  Mosh: { uz_lat: "Mosh", uz_cyrl: "Мош", ru: "Маш" },
  Paxta: { uz_lat: "Paxta", uz_cyrl: "Пахта", ru: "Хлопок" },
  "Qovun-tarvuz": {
    uz_lat: "Qovun-tarvuz",
    uz_cyrl: "Қовун-тарвуз",
    ru: "Дыня-арбуз",
  },
  Sabzi: { uz_lat: "Sabzi", uz_cyrl: "Сабзи", ru: "Морковь" },
  Sholi: { uz_lat: "Sholi", uz_cyrl: "Шоли", ru: "Рис" },
  Umumiy: { uz_lat: "Umumiy", uz_cyrl: "Умумий", ru: "Общий" },
  Vegetatsiyasiz: {
    uz_lat: "Vegetatsiyasiz",
    uz_cyrl: "Вегетациясиз",
    ru: "Безвегетационный",
  },
};

const DYNAMIC_CROP_NAMES: Partial<Record<LangCode, Record<string, string>>> = {
  uz_lat: {},
  uz_cyrl: {},
  ru: {},
};

const PREFS_INIT_KEY = "evapo_pref_initialized";

const ensureInitialPrefs = (): void => {
  try {
    if (localStorage.getItem(PREFS_INIT_KEY) === "1") return;
    localStorage.setItem("app_lang", "uz_lat");
    localStorage.setItem("evapo_app_lang", "uz_lat");
    localStorage.setItem("app_theme", "dark");
    localStorage.setItem("evapo_app_theme", "dark");
    localStorage.setItem(PREFS_INIT_KEY, "1");
  } catch {
    // ignore storage errors
  }
};

export function t(lang: LangCode, key: string): string {
  const dict = MESSAGES[lang] || MESSAGES.uz_lat;
  return dict[key] ?? key;
}

export function registerCropTranslations(
  lang: LangCode,
  baseValues: string[],
  translatedValues: string[],
): void {
  if (lang === "uz_lat") return;

  const bucket = DYNAMIC_CROP_NAMES[lang] || {};
  const count = Math.min(baseValues.length, translatedValues.length);
  for (let index = 0; index < count; index++) {
    const from = normalizeCropLookupKey(baseValues[index]);
    const to = String(translatedValues[index] ?? "").trim();
    if (from && to) bucket[from] = to;
  }
  DYNAMIC_CROP_NAMES[lang] = bucket;
}

export function translateCropName(lang: LangCode, cropName: string): string {
  const normalized = normalizeCropLookupKey(cropName);
  const dynamic = DYNAMIC_CROP_NAMES[lang]?.[normalized];
  if (dynamic) return dynamic;

  const item = CROP_NAMES[cropName];
  if (item) return item[lang] || cropName;

  for (const [rawName, translations] of Object.entries(CROP_NAMES)) {
    if (normalizeCropLookupKey(rawName) === normalized) {
      return translations[lang] || cropName;
    }
  }

  return cropName;
}

export function normalizeLang(input: any): LangCode {
  const raw = String(input ?? "")
    .trim()
    .toLowerCase();
  if (raw === "ru" || raw === "rus" || raw === "russian") return "ru";
  if (
    raw === "uz_cyrl" ||
    raw === "uz-cyrl" ||
    raw === "uzcyrl" ||
    raw === "cyrillic"
  )
    return "uz_cyrl";
  return "uz_lat";
}

export function getInitialLang(): LangCode {
  ensureInitialPrefs();
  try {
    const saved =
      localStorage.getItem("app_lang") ||
      localStorage.getItem("evapo_app_lang") ||
      "uz_lat";
    return normalizeLang(saved);
  } catch {
    return "uz_lat";
  }
}

// Theme support
export function getInitialTheme(): boolean {
  ensureInitialPrefs();
  try {
    const saved =
      localStorage.getItem("app_theme") ||
      localStorage.getItem("evapo_app_theme");
    if (saved === "light") return false;
    if (saved === "dark") return true;
  } catch {
    // ignore and fallback
  }
  return true;
}
