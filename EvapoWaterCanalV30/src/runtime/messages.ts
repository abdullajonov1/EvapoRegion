/* ═══════ EvapoWaterCanalV20 Messages ═══════ */

export interface MessagesDict {
  [key: string]: string;
}

const MESSAGES: Record<string, MessagesDict> = {
  uz_lat: {
    "evapoWaterSource.title": "Suv manbai",
    "evapoWaterSource.header": "Suv manbasini tanlang",
    "evapoWaterSource.noData": "Suv manba topilmadi",
    "evapoCanal.title": "Kanallar",
    "evapoCanal.header": "Kanallar",
    "evapoCanal.noData": "Kanal topilmadi",
    "evapoCanal.volume": "Hajm",
    "evapoCanal.percentage": "Foiz",
    "status.loading": "Yuklanmoqda...",
    "status.error": "Xato yuz berdi",
    "status.noData": "Maʼlumot topilmadi",
    "button.sort": "Saralash",
    "button.retry": "Qayta urinish",
    "button.refresh": "Yangilash",
  },
  uz_cyrl: {
    "evapoWaterSource.title": "Сув манбаи",
    "evapoWaterSource.header": "Сув манбаини танланг",
    "evapoWaterSource.noData": "Сув манбаи топилмади",
    "evapoCanal.title": "Каналлар",
    "evapoCanal.header": "Каналлар",
    "evapoCanal.noData": "Канал топилмади",
    "evapoCanal.volume": "Ҳажм",
    "evapoCanal.percentage": "Фоиз",
    "status.loading": "Юкланмоқда...",
    "status.error": "Хато юз берди",
    "status.noData": "Маʼлумот топилмади",
    "button.sort": "Саралаш",
    "button.retry": "Қайта уриниш",
    "button.refresh": "Янгилаш",
  },
  ru: {
    "evapoWaterSource.title": "Источник воды",
    "evapoWaterSource.header": "Выберите источник воды",
    "evapoWaterSource.noData": "Источник воды не найден",
    "evapoCanal.title": "Каналы",
    "evapoCanal.header": "Каналы",
    "evapoCanal.noData": "Канал не найден",
    "evapoCanal.volume": "Объём",
    "evapoCanal.percentage": "Процент",
    "status.loading": "Загрузка...",
    "status.error": "Произошла ошибка",
    "status.noData": "Данные не найдены",
    "button.sort": "Сортировка",
    "button.retry": "Повторить попытку",
    "button.refresh": "Обновить",
  },
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

export function t(lang: string, key: string): string {
  // Normalize language key
  const normalized = normalizeLang(lang);
  const dict = MESSAGES[normalized] || MESSAGES.uz_lat;
  return dict[key] ?? key;
}

export function normalizeLang(raw: string): string {
  if (!raw) return "uz_lat";
  const lower = String(raw).trim().toLowerCase().replace(/-/g, "_");

  if (
    lower === "ru" ||
    lower === "ru_ru" ||
    lower === "rus" ||
    lower === "russian"
  )
    return "ru";

  if (
    lower === "uz_cyrl" ||
    lower === "uzcyrl" ||
    lower === "uz_cyrillic" ||
    lower === "cyrillic" ||
    lower.includes("cyrl")
  )
    return "uz_cyrl";

  if (lower === "uz" || lower === "uz_lat" || lower === "uz_latin")
    return "uz_lat";

  return "uz_lat";
}

export function getInitialLang(): string {
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
