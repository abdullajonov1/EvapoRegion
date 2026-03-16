// Local messages for ProductivityComparisonV09 (self-contained translations)
export type LangCode = "uz_lat" | "uz_cyrl" | "ru";

export interface Translations {
  // Widget header
  widgetTitle: string;

  // Filter placeholders
  selectYear: string;
  allRegions: string;
  allDistricts: string;
  allCropTypes: string;
  allSeasons: string;

  // GroupBy options
  fermer: string;
  tuman: string;
  ekinTuri: string;

  // Chart labels
  heatmap: string;
  tumanlar: string;
  ekinTurlari: string;
  totalPoints: string;
  nonEmptyBins: string;
  nuqtalar: string;

  // Lasso
  lassoOn: string;
  lassoOff: string;
  clearSelection: string;

  // Selected bins info
  selectedBins: string;
  rawPoints: string;
  loadingRaw: string;

  // Polygons view
  selectedPolygons: string;
  backToChart: string;
  clear: string;

  // List
  selectedPolygonsList: string;
  mapVisible: string;
  clickRowToZoom: string;
  name: string;

  // Grouped data table
  tumanlarRoyxati: string;
  ekinTurlariRoyxati: string;
  farmerName: string;
  areaHa: string;
  soni: string;
  tanlangan: string;
  xaritada: string;
  polygon: string;
  tozalash: string;

  // States
  selectYearToEnable: string;
  loadingData: string;
  noDataAvailable: string;
  connectingToDataSource: string;
  failedToConnect: string;
  retryConnection: string;
  retry: string;

  // Metrics
  avgWaterSupply: string;
  avgWaterConsumption: string;
  avgYield: string;
  cropArea: string;
  waterDistribution: string;
  waterProductivity: string;
  efficiency: string;

  // Axis selectors
  xAxisMetric: string;
  yAxisMetric: string;

  // Tooltip
  binHeatmap: string;
  center: string;
  xBin: string;
  yBin: string;
  countReal: string;
  share: string;
}

export const TRANSLATIONS: Record<LangCode, Translations> = {
  uz_lat: {
    widgetTitle: "XY Chart",
    selectYear: "Yilni tanlang",
    allRegions: "Barcha viloyatlar",
    allDistricts: "Barcha tumanlar",
    allCropTypes: "Barcha ekin turlari",
    allSeasons: "Barcha mavsumlar",
    fermer: "Fermer",
    tuman: "Tuman",
    ekinTuri: "Ekin turi",
    heatmap: "Issiqlik xaritasi",
    tumanlar: "Tumanlar",
    ekinTurlari: "Ekin turlari",
    totalPoints: "jami maydonlar soni",
    nonEmptyBins: "to'liq katakchalar",
    nuqtalar: "nuqtalar",
    lassoOn: "Lasso ON",
    lassoOff: "Lasso OFF",
    clearSelection: "Tozalash",
    selectedBins: "Tanlangan katakchalar",
    rawPoints: "Raw nuqtalar",
    loadingRaw: "yuklanmoqda...",
    selectedPolygons: "Tanlangan poligonlar",
    backToChart: "Chartga qaytish",
    clear: "Tozalash",
    selectedPolygonsList: "Tanlangan poligonlar ro'yxati",
    mapVisible: "Xaritada ko'rinadi",
    clickRowToZoom: "Qatorni bosib, poligonga zoom qiling",
    name: "Nomi",
    tumanlarRoyxati: "Tumanlar ro'yxati",
    ekinTurlariRoyxati: "Ekin turlari ro'yxati",
    farmerName: "Fermer nomi",
    areaHa: "Maydoni (ga)",
    soni: "Soni",
    tanlangan: "Tanlangan",
    xaritada: "Xaritada",
    polygon: "polygon",
    tozalash: "Tozalash",
    selectYearToEnable: "Filtrlarni yoqish uchun yilni tanlang.",
    loadingData: "Ma'lumotlar yuklanmoqda...",
    noDataAvailable: "Tanlangan filtrlar uchun ma'lumot topilmadi",
    connectingToDataSource: "Ma'lumot manbaiga ulanmoqda...",
    failedToConnect: "Ma'lumot manbaiga ulanib bo'lmadi",
    retryConnection: "Qayta ulanish",
    retry: "Qayta",
    avgWaterSupply: "O'rtacha suv ta'minoti m³/ga",
    avgWaterConsumption: "O'rtacha suv iste'moli m³/ga",
    avgYield: "O'rtacha hosildorlik s/ga",
    cropArea: "Ekin yer maydoni ga",
    waterDistribution: "Suv taqsimoti m³",
    waterProductivity: "Suv samaradorligi",
    efficiency: "Samaradorlik",
    xAxisMetric: "X o'qi metrikalari",
    yAxisMetric: "Y o'qi metrikalari",
    binHeatmap: "Katakcha Issiqlik xaritasi",
    center: "markaz",
    xBin: "X katakcha",
    yBin: "Y katakcha",
    countReal: "Soni (haqiqiy)",
    share: "Ulushi",
  },
  uz_cyrl: {
    widgetTitle: "XY Чарт",
    selectYear: "Йилни танланг",
    allRegions: "Барча вилоятлар",
    allDistricts: "Барча туманлар",
    allCropTypes: "Барча экин турлари",
    allSeasons: "Барча мавсумлар",
    fermer: "Фермер",
    tuman: "Туман",
    ekinTuri: "Экин тури",
    heatmap: "Иссиқлик харитаси",
    tumanlar: "Туманлар",
    ekinTurlari: "Экин турлари",
    totalPoints: "жами майдонлар сони",
    nonEmptyBins: "тўлиқ катакчалар",
    nuqtalar: "нуқталар",
    lassoOn: "Лассо ON",
    lassoOff: "Лассо OFF",
    clearSelection: "Тозалаш",
    selectedBins: "Танланган катакчалар",
    rawPoints: "Raw нуқталар",
    loadingRaw: "юкланмоқда...",
    selectedPolygons: "Танланган полигонлар",
    backToChart: "Чартга қайтиш",
    clear: "Тозалаш",
    selectedPolygonsList: "Танланган полигонлар рўйхати",
    mapVisible: "Харитада кўринади",
    clickRowToZoom: "Қаторни босиб, полигонга zoom қилинг",
    name: "Номи",
    tumanlarRoyxati: "Туманлар рўйхати",
    ekinTurlariRoyxati: "Экин турлари рўйхати",
    farmerName: "Фермер номи",
    areaHa: "Майдони (га)",
    soni: "Сони",
    tanlangan: "Танланган",
    xaritada: "Харитада",
    polygon: "полигон",
    tozalash: "Тозалаш",
    selectYearToEnable: "Филтрларни ёқиш учун йилни танланг.",
    loadingData: "Маълумотлар юкланмоқда...",
    noDataAvailable: "Танланган филтрлар учун маълумот топилмади",
    connectingToDataSource: "Маълумот манбаига уланмоқда...",
    failedToConnect: "Маълумот манбаига уланиб бўлмади",
    retryConnection: "Қайта уланиш",
    retry: "Қайта",
    avgWaterSupply: "Ўртача сув таъминоти м³/га",
    avgWaterConsumption: "Ўртача сув истеъмоли м³/га",
    avgYield: "Ўртача ҳосилдорлик с/га",
    cropArea: "Экин ер майдони га",
    waterDistribution: "Сув тақсимоти м³",
    waterProductivity: "Сув самарадорлиги",
    efficiency: "Самарадорлик",
    xAxisMetric: "X ўқи метрикалари",
    yAxisMetric: "Y ўқи метрикалари",
    binHeatmap: "Катакча Иссиқлик харитаси",
    center: "марказ",
    xBin: "X катакча",
    yBin: "Y катакча",
    countReal: "Сони (ҳақиқий)",
    share: "Улуши",
  },
  ru: {
    widgetTitle: "XY График",
    selectYear: "Выберите год",
    allRegions: "Все регионы",
    allDistricts: "Все районы",
    allCropTypes: "Все типы культур",
    allSeasons: "Все сезоны",
    fermer: "Фермер",
    tuman: "Район",
    ekinTuri: "Тип культуры",
    heatmap: "Тепловая карта",
    tumanlar: "Районы",
    ekinTurlari: "Типы культур",
    totalPoints: "всего точек",
    nonEmptyBins: "непустые ячейки",
    nuqtalar: "точки",
    lassoOn: "Лассо ВКЛ",
    lassoOff: "Лассо ВЫКЛ",
    clearSelection: "Очистить",
    selectedBins: "Выбранные ячейки",
    rawPoints: "Исходные точки",
    loadingRaw: "загрузка...",
    selectedPolygons: "Выбранные полигоны",
    backToChart: "Назад к графику",
    clear: "Очистить",
    selectedPolygonsList: "Список выбранных полигонов",
    mapVisible: "Видно на карте",
    clickRowToZoom: "Нажмите на строку для масштабирования к полигону",
    name: "Название",
    tumanlarRoyxati: "Список районов",
    ekinTurlariRoyxati: "Список типов культур",
    farmerName: "Фермер",
    areaHa: "Площадь (га)",
    soni: "Кол-во",
    tanlangan: "Выбрано",
    xaritada: "На карте",
    polygon: "полигон",
    tozalash: "Очистить",
    selectYearToEnable: "Выберите год для включения фильтров.",
    loadingData: "Загрузка данных...",
    noDataAvailable: "Нет данных для выбранных фильтров",
    connectingToDataSource: "Подключение к источнику данных...",
    failedToConnect: "Не удалось подключиться к источнику данных",
    retryConnection: "Повторить подключение",
    retry: "Повторить",
    avgWaterSupply: "Среднее водоснабжение м³/га",
    avgWaterConsumption: "Среднее водопотребление м³/га",
    avgYield: "Средняя урожайность ц/га",
    cropArea: "Площадь посевов га",
    waterDistribution: "Распределение воды м³",
    waterProductivity: "Водопродуктивность",
    efficiency: "Эффективность",
    xAxisMetric: "Метрики оси X",
    yAxisMetric: "Метрики оси Y",
    binHeatmap: "Тепловая карта ячеек",
    center: "центр",
    xBin: "X ячейка",
    yBin: "Y ячейка",
    countReal: "Кол-во (реальное)",
    share: "Делится",
  },
};

export function t(lang: LangCode): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.uz_lat;
}

export function getInitialLang(): LangCode {
  try {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (urlLang) {
      const raw = String(urlLang).trim().toLowerCase();
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
    const sessionLang = sessionStorage.getItem("evapo_session_lang");
    if (sessionLang) {
      const raw = String(sessionLang).trim().toLowerCase();
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
    const stored = localStorage.getItem("evapo_app_lang");
    if (stored) {
      const raw = stored.toLowerCase();
      if (raw === "ru") return "ru";
      if (raw === "uz_cyrl" || raw === "uz-cyrl") return "uz_cyrl";
    }
  } catch {}
  return "uz_lat";
}

export function normalizeLangCode(input: any): LangCode {
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

// Theme support
export function getInitialTheme(): boolean {
  try {
    const stored = localStorage.getItem("evapo_app_theme");
    if (stored === "light") return false;
  } catch {}
  return true; // default dark theme
}
