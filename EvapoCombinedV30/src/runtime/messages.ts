// Local messages for EvapoCombinedV10 (self-contained translations)
export type LangCode = "uz_lat" | "uz_cyrl" | "ru";

type Dict = Record<string, string>;
type Bundle = Record<LangCode, Dict>;

const MESSAGES: Bundle = {
  uz_lat: {
    "evapoCombined.title": "SUV ISTE'MOLI GRAFIGI",
    "evapoCombined.noData": "Maʼlumot topilmadi",
    "evapoCombined.consumption": "Iste'mol",
    "status.loading": "Yuklanmoqda...",
    "status.error": "Xato yuz berdi",
    "evapoCanal.volume": "Hajm",
    "evapoCanal.percentage": "Foiz",
    "evapoCanal.total": "Jami",
    "button.retry": "Qayta urinish",
    "details.totalConsumption": "Jami iste'mol hajmi",
    "details.avgMonthlyConsumption": "O'rtacha oylik iste'mol",
    "value.na": "N/A",
    "month.1": "Yanvar",
    "month.2": "Fevral",
    "month.3": "Mart",
    "month.4": "Aprel",
    "month.5": "May",
    "month.6": "Iyun",
    "month.7": "Iyul",
    "month.8": "Avgust",
    "month.9": "Sentabr",
    "month.10": "Oktabr",
    "month.11": "Noyabr",
    "month.12": "Dekabr",
  },
  uz_cyrl: {
    "evapoCombined.title": "СУВ ИСТЕъМОЛИ ГРАФИГИ",
    "evapoCombined.noData": "Маʼлумот топилмади",
    "evapoCombined.consumption": "Истеъмол",
    "status.loading": "Юкланмоқда...",
    "status.error": "Хато юз берди",
    "evapoCanal.volume": "Ҳажм",
    "evapoCanal.percentage": "Фоиз",
    "evapoCanal.total": "Жами",
    "button.retry": "Қайта уриниш",
    "details.totalConsumption": "Жами истеъмол ҳажми",
    "details.avgMonthlyConsumption": "Ўртача ойлик истеъмол",
    "value.na": "N/A",
    "month.1": "Январ",
    "month.2": "Феврал",
    "month.3": "Март",
    "month.4": "Апрел",
    "month.5": "Май",
    "month.6": "Июн",
    "month.7": "Июл",
    "month.8": "Август",
    "month.9": "Сентябр",
    "month.10": "Октябр",
    "month.11": "Ноябр",
    "month.12": "Декабр",
  },
  ru: {
    "evapoCombined.title": "ГРАФИК ПОТРЕБЛЕНИЯ ВОДЫ",
    "evapoCombined.noData": "Данные не найдены",
    "evapoCombined.consumption": "Потребление",
    "status.loading": "Загрузка...",
    "status.error": "Произошла ошибка",
    "evapoCanal.volume": "Объём",
    "evapoCanal.percentage": "Процент",
    "evapoCanal.total": "Итого",
    "button.retry": "Повторить попытку",
    "details.totalConsumption": "Общий объём потребления",
    "details.avgMonthlyConsumption": "Среднемесячное потребление",
    "value.na": "Н/Д",
    "month.1": "Январь",
    "month.2": "Февраль",
    "month.3": "Март",
    "month.4": "Апрель",
    "month.5": "Май",
    "month.6": "Июнь",
    "month.7": "Июль",
    "month.8": "Август",
    "month.9": "Сентябрь",
    "month.10": "Октябрь",
    "month.11": "Ноябрь",
    "month.12": "Декабрь",
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

export function t(lang: LangCode, key: string): string {
  const dict = MESSAGES[lang] || MESSAGES.uz_lat;
  return dict[key] ?? key;
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

export function normalizeLang(input: any): LangCode {
  const raw = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");

  if (raw === "ru" || raw === "ru_ru" || raw === "rus" || raw === "russian")
    return "ru";

  if (
    raw === "uz_cyrl" ||
    raw === "uzcyrl" ||
    raw === "uz_cyrillic" ||
    raw === "cyrillic" ||
    raw.includes("cyrl")
  )
    return "uz_cyrl";

  return "uz_lat";
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
