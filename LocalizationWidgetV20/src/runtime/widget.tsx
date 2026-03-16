/** @jsx jsx */
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import {
  DataSourceComponent,
  jsx,
  React,
  ReactDOM,
  type AllWidgetProps,
  type QueriableDataSource,
} from "jimu-core";
import logoImage from "../assets/uzcosmos logo white.svg";
import { type IMConfig } from "../config";
import {
  LocalColorRendererEngine,
  type ColorVisualization,
} from "./local-color-renderer";
import { LogoutHandler } from "./local-logout";
import {
  LocalMinMaxEngine,
  type AdditionalWhereClause,
  type LocalFilterState,
  type LocalMinMaxMode,
} from "./local-min-max";
import {
  LocalRegionFilterEngine,
  type RegionFilterKey,
} from "./local-region-filter";
import "./widget.css";

type LangCode = "uz_lat" | "uz_cyrl" | "ru";

interface LanguageSelectorState {
  currentLang: LangCode;
  isDarkTheme: boolean;
  showLanguageDropdown: boolean;
  showThemeDropdown: boolean;
  showMinMaxDropdown: boolean;
  showRegionFilterDropdown: boolean;
  languageDropdownStyle: React.CSSProperties;
  themeDropdownStyle: React.CSSProperties;
  minMaxDropdownStyle: React.CSSProperties;
  regionFilterDropdownStyle: React.CSSProperties;
  regionFilterOptionMenuStyle: React.CSSProperties;
  minActive: boolean;
  maxActive: boolean;
  minPolygonIds: string[];
  maxPolygonIds: string[];
  minMaxLoading: boolean;
  minMaxError: string | null;
  minMaxPolygonIdField: string;
  minMaxSourceDataSourceId: string;
  filters: LocalFilterState;
  activeVisualization: ColorVisualization;
  showColorRendererDropdown: boolean;
  colorRendererDropdownStyle: React.CSSProperties;
  colorRendererLayerFound: boolean;
  openRegionFilterMenuKey: RegionFilterKey | null;
  regionFilterLoading: boolean;
  yearOptions: string[];
  regionOptions: string[];
  districtOptions: string[];
  seasonOptions: string[];
  farmerOptions: string[];
  farmerSearchText: string;
  externalSourceFilter: string;
  externalCanalFilter: string;
  externalCropFilter: string;
  externalPolygonFilter: string;
}

const LANGUAGES: { code: LangCode; nativeLabel: string }[] = [
  { code: "uz_lat", nativeLabel: "O'zbek" },
  { code: "uz_cyrl", nativeLabel: "Ўзбек" },
  { code: "ru", nativeLabel: "Русский" },
];

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

const BUTTON_LABELS = {
  uz_lat: {
    darkMode: "Tun",
    lightMode: "Kun",
    selectLanguage: "Tilni tanlash",
    switchToLight: "Kun rejimiga o'tish",
    switchToDark: "Tun rejimiga o'tish",
    minTooltip: "Min maydonlar",
    maxTooltip: "Max maydonlar",
    minMaxNotReady: "Avval yil va viloyatni tanlang",
    cropRenderer: "Ekin turi bo'yicha",
    efficiencyRenderer: "Suv sarfi bo'yicha",
    resetRenderer: "Suv ta'minoti",
    rendererTitle: "Rang vizualizatsiyasi",
    regionFilterTitle: "Hudud filtrlari",
    logoutTitle: "Chiqish",
    yearLabel: "Yil",
    yearAllLabel: "Umumiy",
    regionLabel: "Viloyat",
    districtLabel: "Tuman",
    seasonLabel: "Mavsum",
    farmerLabel: "Fermer",
    allLabel: "Barchasi",
    searchLabel: "Qidirish...",
    loadingLabel: "Yuklanmoqda...",
    noOptionsLabel: "Variant yo'q",
  },
  uz_cyrl: {
    darkMode: "Тун",
    lightMode: "Кун",
    selectLanguage: "Тилни танлаш",
    switchToLight: "Кун режимига ўтиш",
    switchToDark: "Тун режимига ўтиш",
    minTooltip: "Мин майдонлар",
    maxTooltip: "Макс майдонлар",
    minMaxNotReady: "Аввал йил ва вилоятни танланг",
    cropRenderer: "Экин тури бўйича",
    efficiencyRenderer: "Сув сарфи бўйича",
    resetRenderer: "Сув таъминоти",
    rendererTitle: "Ранг визуализатсияси",
    regionFilterTitle: "Ҳудуд фильтрлари",
    logoutTitle: "Чиқиш",
    yearLabel: "Йил",
    yearAllLabel: "Умумий",
    regionLabel: "Вилоят",
    districtLabel: "Туман",
    seasonLabel: "Мавсум",
    farmerLabel: "Фермер",
    allLabel: "Барчаси",
    searchLabel: "Қидириш...",
    loadingLabel: "Юкланмоқда...",
    noOptionsLabel: "Вариант йўқ",
  },
  ru: {
    darkMode: "Ночь",
    lightMode: "День",
    selectLanguage: "Выбрать язык",
    switchToLight: "Переключить на светлый режим",
    switchToDark: "Переключить на тёмный режим",
    minTooltip: "Полигоны Min",
    maxTooltip: "Полигоны Max",
    minMaxNotReady: "Сначала выберите Год и Вилоят",
    cropRenderer: "По типу культур",
    efficiencyRenderer: "По водопользованию",
    resetRenderer: "Водоснабжение",
    rendererTitle: "Визуализация карты",
    regionFilterTitle: "Фильтры региона",
    logoutTitle: "Выйти",
    yearLabel: "Год",
    yearAllLabel: "Общий",
    regionLabel: "Область",
    districtLabel: "Район",
    seasonLabel: "Сезон",
    farmerLabel: "Фермер",
    allLabel: "Все",
    searchLabel: "Поиск...",
    loadingLabel: "Загрузка...",
    noOptionsLabel: "Нет вариантов",
  },
};

const GlobeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="toolbar-svg-icon"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M4.5 12h15M12 4a13 13 0 0 0 0 16M12 4a13 13 0 0 1 0 16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const PaletteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="toolbar-svg-icon"
    aria-hidden="true"
  >
    <path
      d="M12 4.5c-4.4 0-8 3.1-8 7 0 2.8 2 4.7 4.8 4.7h1.4c1.1 0 2 .9 2 2 0 1 .8 1.8 1.8 1.8 3.9 0 7-3 7-7 0-4.7-4.1-8.5-9-8.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="8.2" cy="10" r="1" fill="currentColor" />
    <circle cx="11.5" cy="8.6" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
  </svg>
);

const MinMaxIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="toolbar-svg-icon"
    aria-hidden="true"
  >
    <path
      d="M5 18L11 12L14 15L19 8"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 12V8H15"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrendDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="toolbar-mini-svg"
    aria-hidden="true"
  >
    <path
      d="M4 8h8.5l-3.2-3.2M20 16h-8.5l3.2 3.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 8l6 6m10 2-6-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const TrendUpIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="toolbar-mini-svg"
    aria-hidden="true"
  >
    <path
      d="M4 16h8.5l-3.2 3.2M20 8h-8.5l3.2-3.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 16l6-6m10-2-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const RendererIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="toolbar-svg-icon"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="4"
      width="7"
      height="7"
      rx="1"
      fill="#ffaa00"
      opacity="0.9"
    />
    <rect
      x="13"
      y="4"
      width="7"
      height="7"
      rx="1"
      fill="#008bfc"
      opacity="0.9"
    />
    <rect
      x="4"
      y="13"
      width="7"
      height="7"
      rx="1"
      fill="#1a9850"
      opacity="0.9"
    />
    <rect
      x="13"
      y="13"
      width="7"
      height="7"
      rx="1"
      fill="#d7191c"
      opacity="0.9"
    />
  </svg>
);

const RegionFilterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="toolbar-svg-icon"
    aria-hidden="true"
  >
    <path
      d="M4 6h16l-6 7v5l-4 2v-7L4 6Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="toolbar-svg-icon"
    aria-hidden="true"
  >
    <path
      d="M10 17l5-5-5-5v3H4v4h6v3Zm8-12h-6v2h6v10h-6v2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"
      fill="currentColor"
    />
  </svg>
);

const getInitialLang = (): LangCode => {
  ensureInitialPrefs();
  try {
    const saved =
      localStorage.getItem("app_lang") ||
      localStorage.getItem("evapo_app_lang") ||
      "uz_lat";
    if (saved === "uz_lat" || saved === "uz_cyrl" || saved === "ru") {
      return saved;
    }
  } catch {
    // ignore and use default
  }
  return "uz_lat";
};

const APP_BG_DARK_CLASS = "evapo-app-bg-dark";
const APP_BG_LIGHT_CLASS = "evapo-app-bg-light";

const applyAppBackgroundTheme = (theme: "dark" | "light"): void => {
  const root = document.documentElement;
  const body = document.body;
  const nextClass = theme === "dark" ? APP_BG_DARK_CLASS : APP_BG_LIGHT_CLASS;

  if (
    root.classList.contains(nextClass) &&
    body.classList.contains(nextClass)
  ) {
    return;
  }

  root.classList.remove(APP_BG_DARK_CLASS, APP_BG_LIGHT_CLASS);
  body.classList.remove(APP_BG_DARK_CLASS, APP_BG_LIGHT_CLASS);

  root.classList.add(nextClass);
  body.classList.add(nextClass);
};

const getThemeFromDom = (): "dark" | "light" => {
  const root = document.documentElement;
  const body = document.body;
  const dataTheme = root.getAttribute("data-theme");

  if (dataTheme === "light") return "light";
  if (dataTheme === "dark") return "dark";

  if (
    root.classList.contains("light-theme") ||
    body.classList.contains("light-theme")
  ) {
    return "light";
  }

  return "dark";
};

const getInitialThemeMode = (): "dark" | "light" => {
  ensureInitialPrefs();
  const root = document.documentElement;
  const body = document.body;

  try {
    const savedTheme =
      localStorage.getItem("app_theme") ||
      localStorage.getItem("evapo_app_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {
    // ignore and use DOM/default
  }

  if (
    root.getAttribute("data-theme") === "light" ||
    root.classList.contains("light-theme") ||
    body.classList.contains("light-theme")
  ) {
    return "light";
  }

  return "dark";
};

const getInitialTheme = (): boolean => getInitialThemeMode() === "dark";
const DEFAULT_INITIAL_YEAR = "2025";
const DEFAULT_INITIAL_REGION = "Farg'ona viloyati";

export default class LanguageSelectorV20 extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  LanguageSelectorState
> {
  private _isMounted = false;
  private themeObserver: MutationObserver | null = null;
  private languageBtnRef: HTMLButtonElement | null = null;
  private themeBtnRef: HTMLButtonElement | null = null;
  private minMaxBtnRef: HTMLButtonElement | null = null;
  private closeTimer: number | null = null;
  private refetchTimer: number | null = null;
  private minMaxEngine = new LocalMinMaxEngine();
  private colorRendererEngine = new LocalColorRendererEngine();
  private colorRendererBtnRef: HTMLButtonElement | null = null;
  private regionFilterEngine = new LocalRegionFilterEngine();
  private logoutHandler = new LogoutHandler();
  private regionFilterBtnRef: HTMLButtonElement | null = null;
  private regionFilterMenuRefs: Record<
    RegionFilterKey,
    HTMLButtonElement | null
  > = {
    yil: null,
    viloyat: null,
    tuman: null,
    mavsum: null,
    fermer_nom: null,
  };
  private regionFilterReqId = 0;

  /* ── Map layer control (mirrors Evapo-RegionV31) ── */
  private _dsLayerMap: Record<string, any> = {};
  private _jimuMapView: JimuMapView | null = null;
  private _lastMapViewRef: any = null;
  private _prevDefinitionExpression = "";
  private _initialSyncTimer: number | null = null;
  private _canalReverseTranslationCache: Record<
    string,
    Record<string, string>
  > = {};

  constructor(props: AllWidgetProps<IMConfig>) {
    super(props);
    this.state = {
      currentLang: getInitialLang(),
      isDarkTheme: getInitialTheme(),
      showLanguageDropdown: false,
      showThemeDropdown: false,
      showMinMaxDropdown: false,
      showRegionFilterDropdown: false,
      languageDropdownStyle: {},
      themeDropdownStyle: {},
      minMaxDropdownStyle: {},
      regionFilterDropdownStyle: {},
      regionFilterOptionMenuStyle: {},
      minActive: false,
      maxActive: false,
      minPolygonIds: [],
      maxPolygonIds: [],
      minMaxLoading: false,
      minMaxError: null,
      minMaxPolygonIdField: props.config?.polygonIdField || "GlobalID",
      minMaxSourceDataSourceId: "",
      activeVisualization: null,
      showColorRendererDropdown: false,
      colorRendererDropdownStyle: {},
      colorRendererLayerFound: false,
      openRegionFilterMenuKey: null,
      regionFilterLoading: false,
      yearOptions: [],
      regionOptions: [],
      districtOptions: [],
      seasonOptions: [],
      farmerOptions: [],
      farmerSearchText: "",
      externalSourceFilter: "",
      externalCanalFilter: "",
      externalCropFilter: "",
      externalPolygonFilter: "",
      filters: {
        yil: DEFAULT_INITIAL_YEAR,
        viloyat: DEFAULT_INITIAL_REGION,
        tuman: "",
        mavsum: "",
        fermer_nom: "",
      },
    };
  }

  componentDidMount(): void {
    this._isMounted = true;

    const initialLang = getInitialLang();
    const initialTheme = getInitialThemeMode();
    const isInitialDarkTheme = initialTheme === "dark";

    this.minMaxEngine.setPct(this.props.config?.selectionPercentage || 10);
    this.minMaxEngine.setPolyField(
      this.props.config?.polygonIdField || "GlobalID",
    );
    this.minMaxEngine.syncDsSelection(this.getSelectedDsIds());
    this.colorRendererEngine.syncDsSelection(this.getSelectedDsIds());
    this.regionFilterEngine.syncDsSelection(this.getSelectedDsIds());

    const root = document.documentElement;
    const body = document.body;
    if (initialTheme === "light") {
      root.classList.add("light-theme");
      body.classList.add("light-theme");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.remove("light-theme");
      body.classList.remove("light-theme");
      root.setAttribute("data-theme", "dark");
    }
    applyAppBackgroundTheme(initialTheme);

    this.setState({
      currentLang: initialLang,
      isDarkTheme: isInitialDarkTheme,
    });

    try {
      localStorage.setItem("app_lang", initialLang);
      localStorage.setItem("evapo_app_lang", initialLang);
      localStorage.setItem("app_theme", initialTheme);
      localStorage.setItem("evapo_app_theme", initialTheme);
    } catch {
      // storage may be unavailable
    }

    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: {
          lang: initialLang,
          language: initialLang,
          code: initialLang,
          timestamp: Date.now(),
        },
      }),
    );

    document.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: {
          theme: initialTheme,
          isDarkTheme: isInitialDarkTheme,
          timestamp: Date.now(),
        },
      }),
    );

    this.setupThemeObserver();
    this.readFiltersFromUrl();

    document.addEventListener("themeChanged", this.handleThemeChange);
    document.addEventListener("languageChanged", this.handleLanguageChange);
    document.addEventListener(
      "waterSourceSelected",
      this.handleWaterSourceSelection,
    );
    document.addEventListener("canalselected", this.handleCanalSelection);
    document.addEventListener("cropSelected", this.handleCropSelection);
    document.addEventListener(
      "minMaxPolygonSelection",
      this.handleExternalMinMaxPolygonSelection,
    );
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener(
      "clearMinMaxSelection",
      this.handleClearMinMaxSelection,
    );
    window.addEventListener("popstate", this.readFiltersFromUrl);

    void this.refreshRegionFilterOptions();

    // Re-broadcast active filters once after mount so late-mounted widgets
    // (including indicators) still receive the default 2025 state.
    this._initialSyncTimer = window.setTimeout(() => {
      if (!this._isMounted) return;
      this.notifyFilterChange();
      this.notifyYearChange(this.state.filters.yil || DEFAULT_INITIAL_YEAR);
      this.updateMinMaxSelectionEvents();
    }, 350);
  }

  componentDidUpdate(
    prevProps: AllWidgetProps<IMConfig>,
    prevState: LanguageSelectorState,
  ): void {
    if (prevProps.useDataSources !== this.props.useDataSources) {
      const ids = this.getSelectedDsIds();
      this.minMaxEngine.syncDsSelection(ids);
      this.colorRendererEngine.syncDsSelection(ids);
      this.regionFilterEngine.syncDsSelection(ids);
      if (this._jimuMapView) {
        void this.initializeMapConnection(this._jimuMapView);
      }
      void this.refreshRegionFilterOptions();
    }

    if (
      prevProps.config?.selectionPercentage !==
      this.props.config?.selectionPercentage
    ) {
      this.minMaxEngine.setPct(this.props.config?.selectionPercentage || 10);
    }

    if (
      prevProps.config?.polygonIdField !== this.props.config?.polygonIdField
    ) {
      const field = this.props.config?.polygonIdField || "GlobalID";
      this.minMaxEngine.setPolyField(field);
      this.setState({ minMaxPolygonIdField: field });
    }

    // When Color Renderer control is disabled, reset the renderer
    const prevColorRenderer =
      prevProps.config?.enableColorRendererControl !== false;
    const nextColorRenderer =
      this.props.config?.enableColorRendererControl !== false;
    if (prevColorRenderer && !nextColorRenderer) {
      this.colorRendererEngine.resetVisualization();
      if (this._isMounted) {
        this.setState({
          activeVisualization: null,
          showColorRendererDropdown: false,
        });
      }
    }

    // When Region Filter control is disabled, close the dropdown and reset min/max
    const prevRegionFilter =
      prevProps.config?.enableRegionFilterControl !== false;
    const nextRegionFilter =
      this.props.config?.enableRegionFilterControl !== false;
    if (prevRegionFilter && !nextRegionFilter) {
      if (this._isMounted) {
        this.setState({
          showRegionFilterDropdown: false,
          openRegionFilterMenuKey: null,
        });
      }
    }

    // Detect changes in region filters (external filters don't affect region options,
    // matching Evapo-RegionV31 where viloyat/tuman/mavsum are independent of crop/water/canal)
    if (
      prevState.filters.yil !== this.state.filters.yil ||
      prevState.filters.viloyat !== this.state.filters.viloyat ||
      prevState.filters.tuman !== this.state.filters.tuman ||
      prevState.filters.mavsum !== this.state.filters.mavsum ||
      prevState.filters.fermer_nom !== this.state.filters.fermer_nom
    ) {
      void this.refreshRegionFilterOptions();
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    if (this._initialSyncTimer !== null) {
      window.clearTimeout(this._initialSyncTimer);
      this._initialSyncTimer = null;
    }
    this.clearCloseTimer();
    this.clearRefetchTimer();
    this.colorRendererEngine.resetVisualization();
    this._dsLayerMap = {};
    this._jimuMapView = null;

    document.removeEventListener("themeChanged", this.handleThemeChange);
    document.removeEventListener("languageChanged", this.handleLanguageChange);
    document.removeEventListener(
      "waterSourceSelected",
      this.handleWaterSourceSelection,
    );
    document.removeEventListener("canalselected", this.handleCanalSelection);
    document.removeEventListener("cropSelected", this.handleCropSelection);
    document.removeEventListener(
      "minMaxPolygonSelection",
      this.handleExternalMinMaxPolygonSelection,
    );
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener(
      "clearMinMaxSelection",
      this.handleClearMinMaxSelection,
    );
    window.removeEventListener("popstate", this.readFiltersFromUrl);

    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
  }

  private toPlainArray<T = any>(val: any): T[] {
    if (!val) return [];
    if (Array.isArray(val)) return val as T[];
    if (typeof val.asMutable === "function")
      return val.asMutable({ deep: true }) as T[];
    if (typeof val.toArray === "function") return val.toArray() as T[];
    return [];
  }

  private getSelectedDsIds = (): string[] => {
    const uds = this.toPlainArray<any>(this.props.useDataSources);
    const ids = uds.map((u) => u?.dataSourceId).filter(Boolean);
    return Array.from(new Set(ids));
  };

  private setupThemeObserver = (): void => {
    const root = document.documentElement;
    this.themeObserver = new MutationObserver(() => {
      const nextTheme = getThemeFromDom();
      const isDarkTheme = nextTheme === "dark";
      applyAppBackgroundTheme(nextTheme);
      if (this._isMounted && isDarkTheme !== this.state.isDarkTheme) {
        this.setState({ isDarkTheme });
      }
    });
    this.themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  };

  private handleThemeChange = (e: any): void => {
    if (!this._isMounted) return;
    const detail = e?.detail;
    let nextTheme: "dark" | "light" | null = null;

    if (detail?.theme === "dark" || detail?.theme === "light") {
      nextTheme = detail.theme;
    } else if (typeof detail?.isDarkTheme === "boolean") {
      nextTheme = detail.isDarkTheme ? "dark" : "light";
    }

    if (!nextTheme) return;

    const isDarkTheme = nextTheme === "dark";
    applyAppBackgroundTheme(nextTheme);
    if (isDarkTheme !== this.state.isDarkTheme) {
      this.setState({ isDarkTheme });
    }
  };

  private handleLanguageChange = (e: any): void => {
    if (!this._isMounted) return;
    const lang = e?.detail?.lang || e?.detail?.language;
    if (lang && (lang === "uz_lat" || lang === "uz_cyrl" || lang === "ru")) {
      this.setState({ currentLang: lang });
    }
  };

  private normalizeLookupKey(value: any): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  private getDirectoryLang(lang: LangCode): "uz" | "kir" | "ru" {
    if (lang === "ru") return "ru";
    if (lang === "uz_cyrl") return "kir";
    return "uz";
  }

  private async fetchDirectoryList(
    key: "Canal" | "Canals",
    lang: "uz" | "kir" | "ru",
  ): Promise<string[]> {
    const typeCandidates = ["Evapo", "Evapo-RegionV20", "EvapoWaterCanalV20"];
    for (const typeName of typeCandidates) {
      try {
        const url = `https://apiwater.sgm.uzspace.uz/api/v1/directories/${encodeURIComponent(typeName)}?lang=${encodeURIComponent(lang)}&key=${encodeURIComponent(key)}`;
        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) continue;
        const json = await response.json();
        const rows = Array.isArray(json)
          ? json
          : Array.isArray(json?.items)
            ? json.items
            : [];
        const values = rows
          .filter((row) => row && typeof row === "object")
          .map((row) =>
            String(row?.value ?? row?.label ?? row?.name ?? "").trim(),
          )
          .filter(Boolean);
        if (values.length) return values;
      } catch {
        // try next type candidate
      }
    }
    return [];
  }

  private async ensureCanalReverseTranslationCache(
    lang: LangCode,
  ): Promise<void> {
    if (lang === "uz_lat") return;

    try {
      const [uzCanals, targetCanals, targetCanalsAlt] = await Promise.all([
        this.fetchDirectoryList("Canal", "uz"),
        this.fetchDirectoryList("Canal", this.getDirectoryLang(lang)),
        this.fetchDirectoryList("Canals", this.getDirectoryLang(lang)),
      ]);

      const target = targetCanals.length ? targetCanals : targetCanalsAlt;
      const reverse: Record<string, string> = {};
      const n = Math.min(uzCanals.length, target.length);
      for (let i = 0; i < n; i++) {
        const rawName = String(uzCanals[i] ?? "").trim();
        const localizedName = String(target[i] ?? "").trim();
        const k = this.normalizeLookupKey(localizedName);
        if (k && rawName) reverse[k] = rawName;
      }

      this._canalReverseTranslationCache[lang] = reverse;
    } catch {
      this._canalReverseTranslationCache[lang] = {};
    }
  }

  private async hasCanalNameInActiveDs(canalName: string): Promise<boolean> {
    const value = String(canalName ?? "").trim();
    if (!value) return false;

    try {
      const ds = this.regionFilterEngine.getActiveDs(this.state.filters) as any;
      if (!ds?.query) return false;

      const escaped = value.replace(/'/g, "''");
      const response = await ds.query({
        where: `kanal_nomi='${escaped}'`,
        outFields: ["kanal_nomi"],
        pageSize: 1,
        returnGeometry: false,
      });
      return Array.isArray(response?.records) && response.records.length > 0;
    } catch {
      return false;
    }
  }

  private async resolveRawCanalName(input: any): Promise<string> {
    const value = String(input ?? "").trim();
    if (!value) return "";

    const key = this.normalizeLookupKey(value);

    // Accept only if the value exists in active DS as a real canal name.
    if (await this.hasCanalNameInActiveDs(value)) return value;

    const lang = this.state.currentLang;
    if (lang === "uz_lat") return value;

    await this.ensureCanalReverseTranslationCache(lang);
    const reverse = this._canalReverseTranslationCache[lang] || {};
    const mapped = reverse[key];
    if (mapped) return mapped;

    const rawMatch = Object.values(reverse).find(
      (raw) => this.normalizeLookupKey(raw) === key,
    );
    if (rawMatch) return rawMatch;

    // If not resolvable, reject translated/unknown value to avoid invalid filtering.
    return "";
  }

  private handleWaterSourceSelection = (event: any): void => {
    const sourceSelected = event?.detail?.sourceSelected;
    const sourceFilter = sourceSelected
      ? `manba_nomi='${String(sourceSelected).replace(/'/g, "''")}'`
      : "";

    this.setState(
      { externalSourceFilter: sourceFilter, externalCanalFilter: "" },
      () => {
        this.refreshMinMaxOrMapFilters();
      },
    );
  };

  private handleCanalSelection = async (event: any): Promise<void> => {
    const rawCanalName = String(
      event?.detail?.kanal_nomi ?? event?.detail?.canalName ?? "",
    ).trim();
    const canalName = await this.resolveRawCanalName(rawCanalName);

    // Keep previous canal filter if incoming non-empty value cannot be resolved.
    if (rawCanalName && !canalName) return;

    const canalFilter = canalName
      ? `kanal_nomi='${String(canalName).replace(/'/g, "''")}'`
      : "";

    this.setState({ externalCanalFilter: canalFilter }, () => {
      this.refreshMinMaxOrMapFilters();
    });
  };

  private handleCropSelection = (event: any): void => {
    const cropType = event?.detail?.cropType;
    const cropFilter = cropType
      ? `ekin_turi='${String(cropType).replace(/'/g, "''")}'`
      : "";

    this.setState({ externalCropFilter: cropFilter }, () => {
      this.refreshMinMaxOrMapFilters();
    });
  };

  private handleExternalMinMaxPolygonSelection = (event: any): void => {
    const src = event?.detail?.source;
    const srcWidgetId = event?.detail?.widgetId;
    if (src === "LocalizationWidgetV20" || srcWidgetId === this.props.id) {
      return;
    }

    const polygonFilter = event?.detail?.polygonFilter || "";
    this.setState({ externalPolygonFilter: polygonFilter }, () => {
      void this.applyMapFilters();
    });
  };

  private handleDocumentClick = (e: MouseEvent): void => {
    if (!this._isMounted) return;
    const anyOpen =
      this.state.showLanguageDropdown ||
      this.state.showThemeDropdown ||
      this.state.showMinMaxDropdown ||
      this.state.showColorRendererDropdown ||
      this.state.showRegionFilterDropdown ||
      !!this.state.openRegionFilterMenuKey;
    if (!anyOpen) return;

    const target = e.target as HTMLElement;
    if (
      target.closest(".language-dropdown-wrapper") ||
      target.closest(".theme-dropdown-wrapper") ||
      target.closest(".minmax-dropdown-wrapper") ||
      target.closest(".color-renderer-dropdown-wrapper") ||
      target.closest(".region-filter-dropdown-wrapper") ||
      target.closest(".loc-portal-dropdown")
    ) {
      return;
    }

    this.setState({
      showLanguageDropdown: false,
      showThemeDropdown: false,
      showMinMaxDropdown: false,
      showColorRendererDropdown: false,
      showRegionFilterDropdown: false,
      openRegionFilterMenuKey: null,
      farmerSearchText: "",
    });
  };

  private clearCloseTimer = (): void => {
    if (this.closeTimer !== null) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  };

  private clearRefetchTimer = (): void => {
    if (this.refetchTimer !== null) {
      window.clearTimeout(this.refetchTimer);
      this.refetchTimer = null;
    }
  };

  private getFilterSignature = (f: LocalFilterState): string => {
    return `${f.yil}||${f.viloyat}||${f.tuman}||${f.mavsum}||${f.fermer_nom}`;
  };

  private scheduleRefetch = (): void => {
    this.clearRefetchTimer();
    this.refetchTimer = window.setTimeout(() => {
      if (this._isMounted) this.doRefetch();
    }, 150);
  };

  private updateFilter = (
    partial: Partial<LocalFilterState>,
    afterUpdate?: (next: LocalFilterState) => void,
  ): void => {
    const prevYil = this.state.filters.yil;
    const next: LocalFilterState = { ...this.state.filters, ...partial };
    if (
      this.getFilterSignature(next) ===
      this.getFilterSignature(this.state.filters)
    )
      return;
    this.minMaxEngine.cancel();
    this.colorRendererEngine.setYear(next.yil || "");
    this.setState({ filters: next }, () => {
      afterUpdate?.(next);
      this.updateUrlWithFilters(next);
      this.notifyFilterChange();
      if (prevYil !== next.yil) this.notifyYearChange(next.yil);
      if (!this.canUseMinMax()) this.resetMinMaxState();
      else if (this.state.minActive || this.state.maxActive) {
        this.notifyMinMaxPolygonSelection(null);
        this.scheduleRefetch();
      }
      void this.applyMapFilters();
    });
  };

  private updateUrlWithFilters = (
    filters: LocalFilterState = this.state.filters,
  ): void => {
    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      params.delete("yil");
      params.delete("viloyat");
      params.delete("tuman");
      params.delete("mavsum");
      params.delete("fermer_nom");

      window.history.replaceState({}, "", url.toString());
    } catch {
      // no-op: URL sync should never block filtering
    }
  };

  private notifyYearChange = (yilValue: string): void => {
    const yil = this.minMaxEngine.normalizeYear(yilValue || "");
    document.dispatchEvent(
      new CustomEvent("yilChanged", {
        detail: { yil },
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new CustomEvent("constructionYearChanged", {
        detail: { year: yil, constructionYear: yil },
        bubbles: true,
      }),
    );
  };

  private scheduleCloseDropdowns = (): void => {
    this.clearCloseTimer();
    this.closeTimer = window.setTimeout(() => {
      if (!this._isMounted) return;
      this.setState({
        showLanguageDropdown: false,
        showThemeDropdown: false,
        showMinMaxDropdown: false,
        showColorRendererDropdown: false,
        showRegionFilterDropdown: false,
        openRegionFilterMenuKey: null,
        farmerSearchText: "",
      });
    }, 120);
  };

  private openLanguageDropdown = (): void => {
    this.clearCloseTimer();
    if (!this.languageBtnRef) return;
    const rect = this.languageBtnRef.getBoundingClientRect();
    const menuWidth = 78;
    this.setState({
      showLanguageDropdown: true,
      showThemeDropdown: false,
      showMinMaxDropdown: false,
      showColorRendererDropdown: false,
      showRegionFilterDropdown: false,
      openRegionFilterMenuKey: null,
      languageDropdownStyle: {
        position: "fixed",
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - menuWidth),
        minWidth: menuWidth,
        zIndex: 99999,
      },
    });
  };

  private openThemeDropdown = (): void => {
    this.clearCloseTimer();
    if (!this.themeBtnRef) return;
    const rect = this.themeBtnRef.getBoundingClientRect();
    const menuWidth = 76;
    this.setState({
      showThemeDropdown: true,
      showLanguageDropdown: false,
      showMinMaxDropdown: false,
      showColorRendererDropdown: false,
      showRegionFilterDropdown: false,
      openRegionFilterMenuKey: null,
      themeDropdownStyle: {
        position: "fixed",
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - menuWidth),
        minWidth: menuWidth,
        zIndex: 99999,
      },
    });
  };

  private openMinMaxDropdown = (): void => {
    this.clearCloseTimer();
    if (!this.minMaxBtnRef) return;
    const rect = this.minMaxBtnRef.getBoundingClientRect();
    const menuWidth = 124;
    this.setState({
      showMinMaxDropdown: true,
      showLanguageDropdown: false,
      showThemeDropdown: false,
      showColorRendererDropdown: false,
      showRegionFilterDropdown: false,
      openRegionFilterMenuKey: null,
      minMaxDropdownStyle: {
        position: "fixed",
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - menuWidth),
        minWidth: menuWidth,
        zIndex: 99999,
      },
    });
  };

  private toggleLanguageDropdownOnClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (this.state.showLanguageDropdown) {
      this.setState({ showLanguageDropdown: false });
      return;
    }
    this.openLanguageDropdown();
  };

  private toggleThemeDropdownOnClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (this.state.showThemeDropdown) {
      this.setState({ showThemeDropdown: false });
      return;
    }
    this.openThemeDropdown();
  };

  private toggleMinMaxDropdownOnClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (this.state.showMinMaxDropdown) {
      this.setState({ showMinMaxDropdown: false });
      return;
    }
    this.openMinMaxDropdown();
  };

  private openColorRendererDropdown = (): void => {
    this.clearCloseTimer();
    if (!this.colorRendererBtnRef) return;
    const rect = this.colorRendererBtnRef.getBoundingClientRect();
    const menuWidth = 180;
    const layerFound = this.colorRendererEngine.hasLayer();
    this.setState({
      showColorRendererDropdown: true,
      showLanguageDropdown: false,
      showThemeDropdown: false,
      showMinMaxDropdown: false,
      showRegionFilterDropdown: false,
      openRegionFilterMenuKey: null,
      colorRendererLayerFound: layerFound,
      colorRendererDropdownStyle: {
        position: "fixed",
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - menuWidth),
        minWidth: menuWidth,
        zIndex: 99999,
      },
    });
  };

  private toggleColorRendererDropdownOnClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (this.state.showColorRendererDropdown) {
      this.setState({ showColorRendererDropdown: false });
      return;
    }
    this.openColorRendererDropdown();
  };

  private onActiveViewChange = (jimuMapView: JimuMapView): void => {
    if (!jimuMapView?.view) {
      this._jimuMapView = null;
      this.colorRendererEngine.setMapView(null);
      if (this._isMounted) this.setState({ colorRendererLayerFound: false });
      return;
    }
    const init = () => {
      this._jimuMapView = jimuMapView;
      this.colorRendererEngine.setMapView(jimuMapView);
      if (this._isMounted) {
        this.setState({
          colorRendererLayerFound: this.colorRendererEngine.hasLayer(),
        });
      }
      void this.initializeMapConnection(jimuMapView);
    };
    if (jimuMapView.view.ready) {
      init();
    } else {
      const w = jimuMapView.view.watch("ready", (isReady: boolean) => {
        if (isReady) {
          w.remove();
          init();
        }
      });
    }
  };

  /* ── Map layer discovery (mirrors Evapo-RegionV31 initializeMapConnection) ── */
  private initializeMapConnection = async (
    jimuMapView: JimuMapView,
  ): Promise<void> => {
    if (!this._isMounted || !jimuMapView) return;

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const getAllJlv = (): any[] =>
      (jimuMapView as any)?.getAllJimuLayerViews?.() ||
      (jimuMapView as any)?.jimuLayerViews?.toArray?.() ||
      [];

    const selectedDsIds = this.getSelectedDsIds();
    if (selectedDsIds.length === 0) return;

    const resolveLayerForDs = (dsId: string, jlvList: any[]): any | null => {
      if (!dsId) return null;
      // 1) Direct DS id match
      let found = jlvList.find(
        (v: any) =>
          v?.dataSourceId === dsId ||
          v?.layerDataSourceId === dsId ||
          v?.id === dsId,
      );
      if (found?.layer?.type === "feature") return found.layer;
      // 2) URL match
      try {
        const dsUrl = this.regionFilterEngine.getDsUrl(dsId);
        if (dsUrl) {
          const urlLower = String(dsUrl).toLowerCase();
          found = jlvList.find(
            (v: any) => String(v?.layer?.url || "").toLowerCase() === urlLower,
          );
          if (found?.layer?.type === "feature") return found.layer;
        }
      } catch {}
      return null;
    };

    // Poll until we match at least 1 DS to a layer
    const maxMs = 7500;
    const start = Date.now();
    let layerMap: Record<string, any> = {};

    while (this._isMounted && Date.now() - start < maxMs) {
      const jlvList = getAllJlv();
      layerMap = {};
      for (const dsId of selectedDsIds) {
        const fl = resolveLayerForDs(dsId, jlvList);
        if (fl) {
          layerMap[dsId] = fl;
          try {
            fl.visible = false;
          } catch {}
        }
      }
      if (Object.keys(layerMap).length > 0) break;
      await sleep(250);
    }

    if (!this._isMounted) return;
    this._dsLayerMap = layerMap;

    // Hide all initially and apply 1=0 guard
    const allLayers = Object.values(layerMap);
    allLayers.forEach((l: any) => {
      try {
        l.visible = false;
      } catch {}
    });
    await this.applyMapFilters();
  };

  /* ── Apply WHERE to a single layer view (mirrors Evapo-RegionV31) ── */
  private applyWhereToLayerView = async (
    layer: any,
    where: string,
  ): Promise<void> => {
    if (!this._jimuMapView || !layer) return;
    try {
      const view: any = this._jimuMapView.view;
      if (!view) return;

      if (this._lastMapViewRef !== this._jimuMapView) {
        this._lastMapViewRef = this._jimuMapView;
      }

      let lv: any = null;
      try {
        lv = await view.whenLayerView(layer);
      } catch {
        for (let i = 0; i < 5 && !lv; i++) {
          await new Promise<void>((r) => setTimeout(r, 80));
          try {
            lv = await view.whenLayerView(layer);
          } catch {}
        }
      }
      if (!lv) return;

      lv.filter = { where };
      try {
        lv.featureEffect = {
          filter: { where },
          excludedEffect: "opacity(30%)",
        };
      } catch {}
    } catch (err) {
      console.warn("applyWhereToLayerView failed", err);
    }
  };

  private zoomToFilteredExtent = async (
    layer: any,
    where: string,
  ): Promise<void> => {
    if (!this._jimuMapView?.view || !layer || !where || where === "1=0") return;
    try {
      const view: any = this._jimuMapView.view;
      const q = layer.createQuery ? layer.createQuery() : { where };
      q.where = where;
      q.returnGeometry = true;

      const res = await layer.queryExtent(q);
      const extent = res?.extent;
      if (!extent) return;

      const target =
        typeof extent.expand === "function" ? extent.expand(1.15) : extent;
      await view.goTo(target, { duration: 700 });
    } catch {
      // no-op: filtering should continue even if zoom fails
    }
  };

  /* ── Main map filter orchestrator (mirrors Evapo-RegionV31 applyMapFiltersOptimized) ── */
  private applyMapFilters = async (): Promise<void> => {
    if (!this._isMounted) return;
    let allLayers = Object.values(this._dsLayerMap) as any[];
    if (allLayers.length === 0 && this._jimuMapView) {
      await this.initializeMapConnection(this._jimuMapView);
      allLayers = Object.values(this._dsLayerMap) as any[];
    }
    if (allLayers.length === 0) return;

    const {
      filters,
      externalSourceFilter,
      externalCanalFilter,
      externalCropFilter,
      externalPolygonFilter,
    } = this.state;
    const hasYil = !!filters.yil;
    const hasViloyat = !!filters.viloyat;
    const isYearLayer = this.regionFilterEngine.isYearLayerMode();

    const hideAll = () => {
      allLayers.forEach((l: any) => {
        try {
          if (l.visible !== false) l.visible = false;
        } catch {}
      });
    };

    // 🔒 HARD BLOCK #1: no year → hide all + 1=0
    if (!hasYil) {
      hideAll();
      await Promise.all(
        allLayers.map((l) => this.applyWhereToLayerView(l, "1=0")),
      );
      this._prevDefinitionExpression = "1=0";
      return;
    }

    // 🔒 HARD BLOCK #2: no viloyat → hide all + 1=0
    if (!hasViloyat) {
      hideAll();
      await Promise.all(
        allLayers.map((l) => this.applyWhereToLayerView(l, "1=0")),
      );
      this._prevDefinitionExpression = "1=0";
      return;
    }

    // Both yil + viloyat selected → build WHERE and show active layer
    const internalWhere = this.regionFilterEngine.buildWhereClause(filters);
    const whereParts = [
      internalWhere,
      externalSourceFilter,
      externalCanalFilter,
      externalCropFilter,
      externalPolygonFilter,
    ].filter(Boolean);
    const where = whereParts.length ? whereParts.join(" AND ") : "1=1";

    // Determine active layer
    let activeLayer: any = null;
    if (isYearLayer && filters.yil) {
      const yearToDsId = this.regionFilterEngine.getYearToDsId();
      const dsId = yearToDsId[filters.yil] || "";
      activeLayer = dsId ? this._dsLayerMap[dsId] : allLayers[0];
    } else {
      activeLayer = allLayers[0];
    }

    // Show only the active layer
    allLayers.forEach((l: any) => {
      try {
        l.visible = l === activeLayer;
      } catch {}
    });

    // Determine targets (year-layer: only active, single-DS: active)
    const targets = activeLayer ? [activeLayer] : allLayers;
    await Promise.all(targets.map((l) => this.applyWhereToLayerView(l, where)));

    const shouldZoom = this._prevDefinitionExpression !== where;
    if (shouldZoom && activeLayer) {
      await this.zoomToFilteredExtent(activeLayer, where);
    }

    this._prevDefinitionExpression = where;
  };

  private applyCropRenderer = (): void => {
    const err = this.colorRendererEngine.visualizeCropType();
    if (!err && this._isMounted) {
      this.setState({
        activeVisualization: "crop",
        showColorRendererDropdown: false,
      });
    }
  };

  private applyEfficiencyRenderer = (): void => {
    const err = this.colorRendererEngine.visualizeWaterEfficiency();
    if (!err && this._isMounted) {
      this.setState({
        activeVisualization: "efficiency",
        showColorRendererDropdown: false,
      });
    }
  };

  private resetRenderer = (): void => {
    this.colorRendererEngine.resetVisualization();
    if (this._isMounted) {
      this.setState({
        activeVisualization: null,
        showColorRendererDropdown: false,
      });
    }
  };

  private getRegionOptionLabel = (key: RegionFilterKey): string => {
    if (key === "yil") return BUTTON_LABELS[this.state.currentLang].yearLabel;
    if (key === "viloyat")
      return BUTTON_LABELS[this.state.currentLang].regionLabel;
    if (key === "tuman")
      return BUTTON_LABELS[this.state.currentLang].districtLabel;
    if (key === "mavsum")
      return BUTTON_LABELS[this.state.currentLang].seasonLabel;
    return BUTTON_LABELS[this.state.currentLang].farmerLabel;
  };

  private getRegionOptionValues = (key: RegionFilterKey): string[] => {
    if (key === "yil") return this.state.yearOptions;
    if (key === "viloyat") return this.state.regionOptions;
    if (key === "tuman") return this.state.districtOptions;
    if (key === "mavsum") return this.state.seasonOptions;
    return this.state.farmerOptions;
  };

  private getRegionSelectedValue = (key: RegionFilterKey): string => {
    if (key === "yil") return this.state.filters.yil;
    if (key === "viloyat") return this.state.filters.viloyat;
    if (key === "tuman") return this.state.filters.tuman;
    if (key === "mavsum") return this.state.filters.mavsum;
    return this.state.filters.fermer_nom;
  };

  private isRegionOptionDisabled = (key: RegionFilterKey): boolean => {
    if (this.state.regionFilterLoading) return true;
    if (key === "yil") return this.state.yearOptions.length === 0;
    if (key === "viloyat") {
      return !this.state.filters.yil || this.state.regionOptions.length === 0;
    }
    if (key === "tuman") {
      return !this.state.filters.yil || !this.state.filters.viloyat;
    }
    if (key === "mavsum") {
      return !this.state.filters.yil || this.state.seasonOptions.length === 0;
    }
    return !this.state.filters.yil || !this.state.filters.viloyat;
  };

  private refreshRegionFilterOptions = async (
    filters: LocalFilterState = this.state.filters,
  ): Promise<void> => {
    const reqId = ++this.regionFilterReqId;
    if (this._isMounted) this.setState({ regionFilterLoading: true });

    const engine = this.regionFilterEngine;
    const isYearLayer = engine.isYearLayerMode();

    // 1. Year options (always)
    const yearOptions = await engine.getYearOptions();

    // 2. Viloyat + Mavsum in parallel (same as Evapo-RegionV31 handleYilChange)
    //    - Year-layer mode: no filter (DS is per-year)
    //    - Single-DS mode: filter by {yil}
    let regionOptions: string[] = [];
    let seasonOptions: string[] = [];
    let districtOptions: string[] = [];
    let farmerOptions: string[] = [];

    if (filters.yil) {
      const baseFilter = isYearLayer ? {} : { yil: filters.yil };

      const parallelLoads: Promise<void>[] = [];

      parallelLoads.push(
        engine
          .fetchDependentFilters("viloyat", baseFilter, filters)
          .then((opts) => {
            regionOptions = opts;
          })
          .catch(() => {}),
      );

      parallelLoads.push(
        engine
          .fetchDependentFilters("mavsum", baseFilter, filters)
          .then((opts) => {
            seasonOptions = opts;
          })
          .catch(() => {}),
      );

      // Tuman depends on viloyat (same as Evapo-RegionV31 handleViloyatChange)
      if (filters.viloyat) {
        parallelLoads.push(
          engine
            .fetchDependentFilters(
              "tuman",
              { ...baseFilter, viloyat: filters.viloyat },
              filters,
            )
            .then((opts) => {
              districtOptions = opts;
            })
            .catch(() => {}),
        );

        const farmerFilter: Record<string, string> = {
          ...baseFilter,
          viloyat: filters.viloyat,
        };
        if (filters.tuman) farmerFilter.tuman = filters.tuman;
        if (filters.mavsum) farmerFilter.mavsum = filters.mavsum;

        parallelLoads.push(
          engine
            .fetchDependentFilters("fermer_nom", farmerFilter, filters)
            .then((opts) => {
              farmerOptions = opts;
            })
            .catch(() => {}),
        );
      }

      await Promise.all(parallelLoads);
    }

    if (!this._isMounted || reqId !== this.regionFilterReqId) return;

    this.setState({
      regionFilterLoading: false,
      yearOptions,
      regionOptions,
      districtOptions,
      seasonOptions,
      farmerOptions,
    });
  };

  private openRegionFilterDropdown = (): void => {
    this.clearCloseTimer();
    if (!this.regionFilterBtnRef) return;
    const rect = this.regionFilterBtnRef.getBoundingClientRect();
    const menuWidth = 300;
    this.setState({
      showRegionFilterDropdown: true,
      showLanguageDropdown: false,
      showThemeDropdown: false,
      showMinMaxDropdown: false,
      showColorRendererDropdown: false,
      openRegionFilterMenuKey: null,
      farmerSearchText: "",
      regionFilterDropdownStyle: {
        position: "fixed",
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - menuWidth),
        minWidth: menuWidth,
        zIndex: 99999,
      },
    });
    void this.refreshRegionFilterOptions();
  };

  private toggleRegionFilterDropdownOnClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (this.state.showRegionFilterDropdown) {
      this.setState({
        showRegionFilterDropdown: false,
        openRegionFilterMenuKey: null,
        farmerSearchText: "",
      });
      return;
    }
    this.openRegionFilterDropdown();
  };

  private openRegionOptionMenu = (key: RegionFilterKey): void => {
    if (this.isRegionOptionDisabled(key)) return;
    const anchor = this.regionFilterMenuRefs[key];
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const menuWidth = 236;
    this.setState({
      openRegionFilterMenuKey: key,
      farmerSearchText: key === "fermer_nom" ? this.state.farmerSearchText : "",
      regionFilterOptionMenuStyle: {
        position: "fixed",
        top: rect.top,
        left: Math.max(8, rect.left - menuWidth - 8),
        width: menuWidth,
        zIndex: 100000,
      },
    });
  };

  private toggleRegionOptionMenu = (key: RegionFilterKey): void => {
    if (this.state.openRegionFilterMenuKey === key) {
      this.setState({ openRegionFilterMenuKey: null, farmerSearchText: "" });
      return;
    }
    this.openRegionOptionMenu(key);
  };

  private handleFarmerSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    this.setState({ farmerSearchText: e.target.value || "" });
  };

  private selectRegionFilterOption = (
    key: RegionFilterKey,
    value: string,
  ): void => {
    // Match Evapo-RegionV31 handler behavior:
    // - yil change: PRESERVE viloyat/tuman/mavsum (just reload options)
    // - viloyat change: clear tuman (dependent), preserve mavsum
    // - tuman change: nothing else cleared
    // - mavsum change: nothing else cleared
    const nextPartial: Partial<LocalFilterState> =
      key === "yil"
        ? { yil: value }
        : key === "viloyat"
          ? { viloyat: value, tuman: "", fermer_nom: "" }
          : key === "tuman"
            ? { tuman: value, fermer_nom: "" }
            : key === "mavsum"
              ? { mavsum: value, fermer_nom: "" }
              : { fermer_nom: value };

    this.updateFilter(nextPartial, (nextFilters) => {
      this.setState({ openRegionFilterMenuKey: null, farmerSearchText: "" });
      void this.refreshRegionFilterOptions(nextFilters);
      void this.applyMapFilters();
    });
  };

  private handleLogout = (): void => {
    this.logoutHandler.logout();
  };

  private setTheme = (newTheme: "light" | "dark"): void => {
    try {
      localStorage.setItem("app_theme", newTheme);
      localStorage.setItem("evapo_app_theme", newTheme);
    } catch {
      // storage may be unavailable
    }

    const root = document.documentElement;
    const body = document.body;
    if (newTheme === "light") {
      root.classList.add("light-theme");
      body.classList.add("light-theme");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.remove("light-theme");
      body.classList.remove("light-theme");
      root.setAttribute("data-theme", "dark");
    }
    applyAppBackgroundTheme(newTheme);

    document.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: {
          theme: newTheme,
          isDarkTheme: newTheme === "dark",
          timestamp: Date.now(),
        },
      }),
    );

    this.setState({
      isDarkTheme: newTheme === "dark",
      showThemeDropdown: false,
    });
  };

  private selectLanguage = (lang: LangCode): void => {
    if (lang === this.state.currentLang) {
      this.setState({ showLanguageDropdown: false });
      return;
    }

    this.setState({ currentLang: lang, showLanguageDropdown: false }, () => {
      try {
        localStorage.setItem("app_lang", lang);
        localStorage.setItem("evapo_app_lang", lang);
      } catch {
        // storage may be unavailable
      }

      document.dispatchEvent(
        new CustomEvent("languageChanged", {
          detail: { lang, language: lang, code: lang, timestamp: Date.now() },
        }),
      );
    });
  };

  private onAnyDataSourceCreated = (ds: QueriableDataSource): void => {
    const ids = this.getSelectedDsIds();
    this.minMaxEngine.onDsCreated(ds, ids);
    this.colorRendererEngine.onDsCreated(ds, ids);
    this.regionFilterEngine.onDsCreated(ds, ids);
    if (this._isMounted) {
      this.setState({
        colorRendererLayerFound: this.colorRendererEngine.hasLayer(),
      });
    }
    if (this._jimuMapView) {
      void this.initializeMapConnection(this._jimuMapView);
    }
    void this.refreshRegionFilterOptions();
  };

  private canUseMinMax = (): boolean => {
    const { yil, viloyat } = this.state.filters;
    return !!(yil && viloyat);
  };

  private hasExternalMinMaxFilters = (): boolean => {
    const { externalSourceFilter, externalCanalFilter, externalCropFilter } =
      this.state;
    return !!(
      externalSourceFilter ||
      externalCanalFilter ||
      externalCropFilter
    );
  };

  private getMinMaxAdditionalWhere = (): AdditionalWhereClause => {
    const { externalSourceFilter, externalCanalFilter, externalCropFilter } =
      this.state;
    return [
      externalSourceFilter,
      externalCanalFilter,
      externalCropFilter,
    ].filter(Boolean);
  };

  private refreshMinMaxOrMapFilters = (): void => {
    if (this.state.minActive || this.state.maxActive) {
      this.scheduleRefetch();
      return;
    }
    void this.applyMapFilters();
  };

  private isViloyatOnlySelection = (): boolean => {
    const { viloyat, tuman, mavsum } = this.state.filters;
    return !!(viloyat && !tuman && !mavsum && !this.hasExternalMinMaxFilters());
  };

  private normalizeMavsumValue = (value: string): string => {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  };

  private getOutgoingMavsumValue = (selectedValue: string): string => {
    const raw = String(selectedValue ?? "").trim();
    if (!raw) return "";

    const normalizedRaw = this.normalizeMavsumValue(raw);
    if (
      normalizedRaw.includes("ikkilamchi") ||
      normalizedRaw.includes("иккиламчи") ||
      normalizedRaw.includes("вторич")
    )
      return " Ikkilamchi";

    if (
      normalizedRaw.includes("birlamchi") ||
      normalizedRaw.includes("бирламчи") ||
      normalizedRaw.includes("первич")
    )
      return "Birlamchi va umummavsumiy";

    if (
      normalizedRaw === "umumiy" ||
      normalizedRaw === "умумий" ||
      normalizedRaw === "общий" ||
      normalizedRaw === "mavsum" ||
      normalizedRaw === "mavsumiy" ||
      normalizedRaw === "umummavsumiy" ||
      normalizedRaw === "umum mavsumiy"
    )
      return "";

    return raw;
  };

  private getOutgoingMavsumForIndicators = (selectedValue: string): string => {
    const raw = String(selectedValue ?? "").trim();
    if (!raw) return "Birlamchi va umummavsumiy";

    const normalizedRaw = this.normalizeMavsumValue(raw);
    if (
      normalizedRaw.includes("ikkilamchi") ||
      normalizedRaw.includes("иккиламчи") ||
      normalizedRaw.includes("вторич")
    )
      return " Ikkilamchi";

    if (
      normalizedRaw.includes("birlamchi") ||
      normalizedRaw.includes("бирламчи") ||
      normalizedRaw.includes("первич")
    )
      return "Birlamchi va umummavsumiy";

    if (
      normalizedRaw === "umumiy" ||
      normalizedRaw === "умумий" ||
      normalizedRaw === "общий" ||
      normalizedRaw === "mavsum" ||
      normalizedRaw === "mavsumiy" ||
      normalizedRaw === "umummavsumiy" ||
      normalizedRaw === "umum mavsumiy"
    )
      return "Birlamchi va umummavsumiy";

    return raw;
  };

  private notifyFilterChange = (): void => {
    if (!this._isMounted) return;

    const { yil, viloyat, tuman, mavsum, fermer_nom } = this.state.filters;
    const yilPayload = yil
      ? this.regionFilterEngine.isNumericField("yil")
        ? Number(yil)
        : String(yil)
      : undefined;

    const outgoingMavsum = this.getOutgoingMavsumValue(mavsum);
    const outgoingMavsumForIndicators =
      this.getOutgoingMavsumForIndicators(mavsum);

    document.dispatchEvent(
      new CustomEvent("waterSupplyFilterChanged", {
        detail: {
          viloyat,
          tuman,
          mavsum: outgoingMavsum,
          mavsumRaw: mavsum,
          mavsumForIndicators: outgoingMavsumForIndicators,
          fermer_nom,
          fermer_nomNom: fermer_nom,
          yil: yilPayload,
          lang: this.state.currentLang,
          language: this.state.currentLang,
        },
        bubbles: true,
      }),
    );
  };

  private notifyMinMaxSelection = (
    minMax: string | null,
    minMaxMode: "none" | "single" | "both",
  ): void => {
    document.dispatchEvent(
      new CustomEvent("minMaxSelected", {
        detail: {
          minMax,
          minMaxMode,
          timestamp: Date.now(),
          source: "LocalizationWidgetV20",
          widgetId: this.props.id,
        },
        bubbles: true,
      }),
    );
  };

  private notifyMinMaxPolygonSelection = (
    polygonFilter: string | null,
  ): void => {
    const currentYear = this.minMaxEngine.normalizeYear(this.state.filters.yil);
    document.dispatchEvent(
      new CustomEvent("minMaxPolygonSelection", {
        detail: {
          polygonFilter,
          yil: currentYear,
          year: currentYear,
          sourceDataSourceId: this.state.minMaxSourceDataSourceId || "",
          sourceLayerId: "",
          sourceLayerUrl: "",
          timestamp: Date.now(),
          source: "LocalizationWidgetV20",
          widgetId: this.props.id,
        },
        bubbles: true,
      }),
    );
  };

  private updateMinMaxSelectionEvents = (): void => {
    const { minActive, maxActive } = this.state;
    const minMaxMode =
      minActive && maxActive
        ? "both"
        : minActive || maxActive
          ? "single"
          : "none";
    const minMaxValue =
      minMaxMode === "none" ? null : minActive ? "min" : "max";
    this.notifyMinMaxSelection(minMaxValue, minMaxMode);
  };

  private applyCurrentPolygonFilter = (): void => {
    let polygonFilterToApply: string | null = null;

    if (
      this.isViloyatOnlySelection() &&
      (this.state.minActive || this.state.maxActive)
    ) {
      const { viloyat, yil } = this.state.filters;
      const baseWhere = [`viloyat = '${String(viloyat).replace(/'/g, "''")}'`];
      const normalizedYear = this.minMaxEngine.normalizeYear(yil);
      if (normalizedYear && /^\d{4}$/.test(normalizedYear)) {
        baseWhere.push(`yil = ${normalizedYear}`);
      }

      const minMaxCondition =
        this.state.minActive && this.state.maxActive
          ? "min_max IN ('Min','Max')"
          : this.state.minActive
            ? "min_max = 'Min'"
            : "min_max = 'Max'";
      polygonFilterToApply = `${baseWhere.join(" AND ")} AND ${minMaxCondition}`;
    } else {
      const ids = Array.from(
        new Set([...this.state.minPolygonIds, ...this.state.maxPolygonIds]),
      );
      if (ids.length > 0) {
        const polygonField = this.state.minMaxPolygonIdField || "GlobalID";
        const formattedIds = ids
          .map((id) => `'${String(id).replace(/'/g, "''")}'`)
          .join(", ");
        polygonFilterToApply = `${polygonField} IN (${formattedIds})`;
      }
    }

    const nextPolygonFilter = polygonFilterToApply || "";
    const prevPolygonFilter = this.state.externalPolygonFilter || "";
    if (nextPolygonFilter !== prevPolygonFilter) {
      this.setState({ externalPolygonFilter: nextPolygonFilter }, () => {
        void this.applyMapFilters();
      });
    } else {
      void this.applyMapFilters();
    }

    this.notifyMinMaxPolygonSelection(polygonFilterToApply);
  };

  private doRefetch = async (): Promise<void> => {
    if (!this._isMounted || !this.canUseMinMax()) return;
    const { minActive, maxActive } = this.state;
    if (!minActive && !maxActive) return;

    if (this.isViloyatOnlySelection()) {
      this.applyCurrentPolygonFilter();
      return;
    }

    this.setState({ minMaxLoading: true, minMaxError: null });
    try {
      const dsIds = this.getSelectedDsIds();
      const additionalWhere = this.getMinMaxAdditionalWhere();
      if (minActive && maxActive) {
        const r = await this.minMaxEngine.fetchBoth(
          this.state.filters,
          dsIds,
          additionalWhere,
        );
        if (!this._isMounted) return;
        this.setState(
          {
            minPolygonIds: r.min.ids,
            maxPolygonIds: r.max.ids,
            minMaxPolygonIdField: r.min.polygonIdField,
            minMaxSourceDataSourceId: r.min.sourceDataSourceId,
            minMaxLoading: false,
          },
          this.applyCurrentPolygonFilter,
        );
      } else {
        const mode: LocalMinMaxMode = minActive ? "min" : "max";
        const r = await this.minMaxEngine.fetchSingle(
          mode,
          this.state.filters,
          dsIds,
          additionalWhere,
        );
        if (!this._isMounted) return;
        this.setState(
          {
            ...(mode === "min"
              ? { minPolygonIds: r.ids }
              : { maxPolygonIds: r.ids }),
            minMaxPolygonIdField: r.polygonIdField,
            minMaxSourceDataSourceId: r.sourceDataSourceId,
            minMaxLoading: false,
          } as any,
          this.applyCurrentPolygonFilter,
        );
      }
    } catch (e: any) {
      if (
        e?.message === "cancelled" ||
        e?.name === "AbortError" ||
        !this._isMounted
      )
        return;
      this.setState({
        minMaxLoading: false,
        minMaxError: String(e?.message || e),
      });
    }
  };

  private handleMinClick = async (): Promise<void> => {
    if (this.state.minMaxLoading || !this.canUseMinMax()) return;
    const next = !this.state.minActive;
    this.minMaxEngine.cancel();
    this.setState(
      { minActive: next, minPolygonIds: next ? this.state.minPolygonIds : [] },
      () => {
        this.updateMinMaxSelectionEvents();
        if (next) this.doRefetch();
        else this.applyCurrentPolygonFilter();
      },
    );
  };

  private handleMaxClick = async (): Promise<void> => {
    if (this.state.minMaxLoading || !this.canUseMinMax()) return;
    const next = !this.state.maxActive;
    this.minMaxEngine.cancel();
    this.setState(
      { maxActive: next, maxPolygonIds: next ? this.state.maxPolygonIds : [] },
      () => {
        this.updateMinMaxSelectionEvents();
        if (next) this.doRefetch();
        else this.applyCurrentPolygonFilter();
      },
    );
  };

  private resetMinMaxState = (): void => {
    this.minMaxEngine.cancel();
    this.clearRefetchTimer();
    this.setState(
      {
        minActive: false,
        maxActive: false,
        minPolygonIds: [],
        maxPolygonIds: [],
        minMaxError: null,
      },
      () => {
        this.notifyMinMaxPolygonSelection(null);
        this.notifyMinMaxSelection(null, "none");
      },
    );
  };

  private readFiltersFromUrl = (): void => {
    try {
      const defaultFilters: LocalFilterState = {
        yil: DEFAULT_INITIAL_YEAR,
        viloyat: DEFAULT_INITIAL_REGION,
        tuman: "",
        mavsum: "",
        fermer_nom: "",
      };

      this.setState(
        {
          filters: defaultFilters,
        },
        () => {
          this.updateUrlWithFilters(this.state.filters);
          void this.refreshRegionFilterOptions(this.state.filters);
          this.notifyFilterChange();
          this.notifyYearChange(this.state.filters.yil);
          if (!this.canUseMinMax()) this.resetMinMaxState();
          void this.applyMapFilters();
        },
      );
    } catch {
      // no-op
    }
  };

  private handleResetAll = (): void => {
    const defaultFilters: LocalFilterState = {
      yil: DEFAULT_INITIAL_YEAR,
      viloyat: DEFAULT_INITIAL_REGION,
      tuman: "",
      mavsum: "",
      fermer_nom: "",
    };

    this.setState(
      {
        showRegionFilterDropdown: false,
        openRegionFilterMenuKey: null,
        externalSourceFilter: "",
        externalCanalFilter: "",
        externalCropFilter: "",
        externalPolygonFilter: "",
        filters: defaultFilters,
      },
      () => {
        this.resetMinMaxState();
        this.notifyFilterChange();
        this.notifyYearChange(DEFAULT_INITIAL_YEAR);
        const clearEvents = [
          new CustomEvent("clearWaterSourceSelection", {
            detail: { source: "LocalizationWidgetV20" },
            bubbles: true,
          }),
          new CustomEvent("clearCanalSelection", {
            detail: { source: "LocalizationWidgetV20" },
            bubbles: true,
          }),
          new CustomEvent("clearCropSelection", {
            detail: { source: "LocalizationWidgetV20" },
            bubbles: true,
          }),
          new CustomEvent("clearMinMaxSelection", {
            detail: { source: "LocalizationWidgetV20" },
            bubbles: true,
          }),
          new CustomEvent("waterSupplyFiltersReset", {
            detail: { source: "LocalizationWidgetV20" },
            bubbles: true,
          }),
        ];
        clearEvents.forEach((evt) => document.dispatchEvent(evt));
        this.updateUrlWithFilters(defaultFilters);
        void this.refreshRegionFilterOptions(defaultFilters);
        void this.applyMapFilters();
      },
    );
  };

  private handleClearMinMaxSelection = (): void => {
    if (this._isMounted) this.resetMinMaxState();
  };

  render(): React.ReactNode {
    const {
      currentLang,
      isDarkTheme,
      showLanguageDropdown,
      showThemeDropdown,
      showMinMaxDropdown,
      showRegionFilterDropdown,
      languageDropdownStyle,
      themeDropdownStyle,
      minMaxDropdownStyle,
      regionFilterDropdownStyle,
      regionFilterOptionMenuStyle,
      minActive,
      maxActive,
      minMaxLoading,
      activeVisualization,
      showColorRendererDropdown,
      colorRendererDropdownStyle,
      colorRendererLayerFound,
      openRegionFilterMenuKey,
      regionFilterLoading,
      farmerSearchText,
    } = this.state;

    const languageTitle = BUTTON_LABELS[currentLang].selectLanguage;
    const themeTitle = isDarkTheme
      ? BUTTON_LABELS[currentLang].switchToLight
      : BUTTON_LABELS[currentLang].switchToDark;
    const showMinMaxControl = this.props.config?.enableMinMaxControl !== false;
    const showColorRendererControl =
      this.props.config?.enableColorRendererControl !== false;
    const showRegionFilterControl =
      this.props.config?.enableRegionFilterControl !== false;
    const showLogoutControl = this.props.config?.enableLogoutControl !== false;
    const minMaxReady = this.canUseMinMax();

    const selectedUseDataSources = this.toPlainArray<any>(
      this.props.useDataSources,
    );
    const mapWidgetId = this.toPlainArray<string>(
      this.props.useMapWidgetIds as any,
    )[0];
    const showFocusOverlay =
      showLanguageDropdown ||
      showThemeDropdown ||
      showMinMaxDropdown ||
      showColorRendererDropdown ||
      showRegionFilterDropdown ||
      !!openRegionFilterMenuKey;

    const focusOverlay = showFocusOverlay
      ? ReactDOM.createPortal(
          <div className="loc-focus-overlay" aria-hidden="true" />,
          document.body,
        )
      : null;

    const languageMenu = showLanguageDropdown
      ? ReactDOM.createPortal(
          <div
            className="loc-portal-dropdown language-dropdown-menu"
            style={languageDropdownStyle}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`dropdown-item ${currentLang === lang.code ? "active" : ""}`}
                onClick={() => this.selectLanguage(lang.code)}
              >
                <span className="dropdown-code">
                  {lang.code === "uz_lat"
                    ? "O'z"
                    : lang.code === "uz_cyrl"
                      ? "Ўз"
                      : "Ру"}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

    const themeMenu = showThemeDropdown
      ? ReactDOM.createPortal(
          <div
            className="loc-portal-dropdown theme-dropdown-menu"
            style={themeDropdownStyle}
          >
            <button
              className={`theme-option ${isDarkTheme ? "active" : ""}`}
              onClick={() => this.setTheme("dark")}
              title={BUTTON_LABELS[currentLang].darkMode}
              aria-label={BUTTON_LABELS[currentLang].darkMode}
            >
              <span className="theme-option-icon" aria-hidden="true">
                🌙
              </span>
            </button>
            <button
              className={`theme-option ${!isDarkTheme ? "active" : ""}`}
              onClick={() => this.setTheme("light")}
              title={BUTTON_LABELS[currentLang].lightMode}
              aria-label={BUTTON_LABELS[currentLang].lightMode}
            >
              <span className="theme-option-icon" aria-hidden="true">
                ☀️
              </span>
            </button>
          </div>,
          document.body,
        )
      : null;

    const minMaxMenu = showMinMaxDropdown
      ? ReactDOM.createPortal(
          <div
            className="loc-portal-dropdown minmax-dropdown-menu"
            style={minMaxDropdownStyle}
          >
            <button
              className={`minmax-option ${minActive ? "active" : ""}`}
              onClick={this.handleMinClick}
              disabled={!minMaxReady || minMaxLoading}
              title={
                minMaxReady
                  ? BUTTON_LABELS[currentLang].minTooltip
                  : BUTTON_LABELS[currentLang].minMaxNotReady
              }
            >
              <span className="minmax-option-icon">
                <TrendDownIcon />
              </span>
              <span className="minmax-option-label">Min</span>
            </button>
            <button
              className={`minmax-option ${maxActive ? "active" : ""}`}
              onClick={this.handleMaxClick}
              disabled={!minMaxReady || minMaxLoading}
              title={
                minMaxReady
                  ? BUTTON_LABELS[currentLang].maxTooltip
                  : BUTTON_LABELS[currentLang].minMaxNotReady
              }
            >
              <span className="minmax-option-icon">
                <TrendUpIcon />
              </span>
              <span className="minmax-option-label">Max</span>
            </button>
          </div>,
          document.body,
        )
      : null;

    const colorRendererMenu = showColorRendererDropdown
      ? ReactDOM.createPortal(
          <div
            className="loc-portal-dropdown color-renderer-dropdown-menu"
            style={colorRendererDropdownStyle}
          >
            <button
              className={`renderer-option ${!activeVisualization ? "active" : ""}`}
              onClick={this.resetRenderer}
              title={BUTTON_LABELS[currentLang].resetRenderer}
            >
              <span className="renderer-option-icon">💧</span>
              <span className="renderer-option-label">
                {BUTTON_LABELS[currentLang].resetRenderer}
              </span>
            </button>
            <button
              className={`renderer-option ${activeVisualization === "crop" ? "active" : ""}`}
              onClick={this.applyCropRenderer}
              disabled={!colorRendererLayerFound}
              title={BUTTON_LABELS[currentLang].cropRenderer}
            >
              <span className="renderer-option-icon">🌾</span>
              <span className="renderer-option-label">
                {BUTTON_LABELS[currentLang].cropRenderer}
              </span>
            </button>
            <button
              className={`renderer-option ${activeVisualization === "efficiency" ? "active" : ""}`}
              onClick={this.applyEfficiencyRenderer}
              disabled={!colorRendererLayerFound}
              title={BUTTON_LABELS[currentLang].efficiencyRenderer}
            >
              <span className="renderer-option-icon">⚡</span>
              <span className="renderer-option-label">
                {BUTTON_LABELS[currentLang].efficiencyRenderer}
              </span>
            </button>
          </div>,
          document.body,
        )
      : null;

    const regionFilterKeys: RegionFilterKey[] = [
      "yil",
      "viloyat",
      "tuman",
      "mavsum",
      "fermer_nom",
    ];

    const regionFilterMenu = showRegionFilterDropdown
      ? ReactDOM.createPortal(
          <div
            className="loc-portal-dropdown region-filter-dropdown-menu"
            style={regionFilterDropdownStyle}
          >
            {regionFilterKeys.map((key) => {
              const selectedValue = this.getRegionSelectedValue(key);
              return (
                <button
                  key={key}
                  className={`region-filter-trigger ${openRegionFilterMenuKey === key ? "active" : ""}`}
                  onClick={() => this.toggleRegionOptionMenu(key)}
                  disabled={this.isRegionOptionDisabled(key)}
                  ref={(el) => {
                    this.regionFilterMenuRefs[key] = el;
                  }}
                >
                  <span className="region-filter-trigger-label">
                    {this.getRegionOptionLabel(key)}
                  </span>
                  <span
                    className={`region-filter-trigger-value ${selectedValue ? "" : "placeholder"}`}
                  >
                    {selectedValue ||
                      (key === "mavsum" || key === "yil"
                        ? key === "yil"
                          ? BUTTON_LABELS[currentLang].yearAllLabel
                          : BUTTON_LABELS[currentLang].allLabel
                        : this.getRegionOptionLabel(key))}
                  </span>
                  <span className="region-filter-trigger-arrow">◂</span>
                </button>
              );
            })}
            {regionFilterLoading && (
              <div className="region-filter-loading-row">
                {BUTTON_LABELS[currentLang].loadingLabel}
              </div>
            )}
          </div>,
          document.body,
        )
      : null;

    const regionFilterOptionsMenu = openRegionFilterMenuKey
      ? ReactDOM.createPortal(
          <div
            className="loc-portal-dropdown region-filter-options-menu"
            style={regionFilterOptionMenuStyle}
          >
            {openRegionFilterMenuKey === "fermer_nom" && (
              <div className="region-filter-search-wrap">
                <input
                  className="region-filter-search-input"
                  type="text"
                  value={farmerSearchText}
                  onChange={this.handleFarmerSearchChange}
                  placeholder={BUTTON_LABELS[currentLang].searchLabel}
                />
              </div>
            )}
            {[
              ...(openRegionFilterMenuKey === "yil"
                ? [
                    {
                      value: "",
                      label: BUTTON_LABELS[currentLang].yearAllLabel,
                    },
                  ]
                : [{ value: "", label: BUTTON_LABELS[currentLang].allLabel }]),
              ...this.getRegionOptionValues(openRegionFilterMenuKey)
                .filter((value) => {
                  if (openRegionFilterMenuKey !== "fermer_nom") return true;
                  const q = String(farmerSearchText || "")
                    .trim()
                    .toLowerCase();
                  if (!q) return true;
                  return String(value).toLowerCase().includes(q);
                })
                .map((value) => ({
                  value,
                  label: value,
                })),
            ].map((option) => (
              <button
                key={`${openRegionFilterMenuKey}-${option.value || "__all__"}`}
                className={`region-filter-option ${this.getRegionSelectedValue(openRegionFilterMenuKey) === option.value ? "active" : ""}`}
                onClick={() =>
                  this.selectRegionFilterOption(
                    openRegionFilterMenuKey,
                    option.value,
                  )
                }
              >
                {option.label || BUTTON_LABELS[currentLang].allLabel}
              </button>
            ))}
            {(this.getRegionOptionValues(openRegionFilterMenuKey).length ===
              0 ||
              (openRegionFilterMenuKey === "fermer_nom" &&
                this.getRegionOptionValues(openRegionFilterMenuKey).filter(
                  (value) => {
                    const q = String(farmerSearchText || "")
                      .trim()
                      .toLowerCase();
                    if (!q) return true;
                    return String(value).toLowerCase().includes(q);
                  },
                ).length === 0)) &&
              !regionFilterLoading && (
                <div className="region-filter-empty-row">
                  {BUTTON_LABELS[currentLang].noOptionsLabel}
                </div>
              )}
          </div>,
          document.body,
        )
      : null;

    return (
      <div
        className={`language-selector-container ${isDarkTheme ? "dark" : "light"}`}
      >
        {focusOverlay}
        <div style={{ display: "none" }}>
          {selectedUseDataSources.map((uds: any) => (
            <DataSourceComponent
              key={uds?.dataSourceId}
              useDataSource={uds}
              onDataSourceCreated={this.onAnyDataSourceCreated}
            />
          ))}
          {mapWidgetId && (
            <JimuMapViewComponent
              useMapWidgetId={mapWidgetId}
              onActiveViewChange={this.onActiveViewChange}
            />
          )}
        </div>

        <div className="header-content">
          <div className="header-left">
            <img
              className="header-logo"
              src={logoImage}
              alt="Space Water Monitoring"
            />
            <div className="header-text">
              <h1 className="header-title">Space Water Monitoring</h1>
            </div>
          </div>

          <div className="header-right">
            <div className="controls-group">
              {showRegionFilterControl && (
                <div className="region-filter-dropdown-wrapper">
                  <button
                    className={`control-button icon-control-button region-filter-dropdown ${showRegionFilterDropdown ? "active" : ""}`}
                    onClick={this.toggleRegionFilterDropdownOnClick}
                    ref={(el) => {
                      this.regionFilterBtnRef = el;
                    }}
                    title={BUTTON_LABELS[currentLang].regionFilterTitle}
                    aria-label={BUTTON_LABELS[currentLang].regionFilterTitle}
                  >
                    <span className="toolbar-icon">
                      <RegionFilterIcon />
                    </span>
                  </button>
                  {regionFilterMenu}
                  {regionFilterOptionsMenu}
                </div>
              )}

              {showMinMaxControl && (
                <div className="minmax-dropdown-wrapper">
                  <button
                    className={`control-button icon-control-button minmax-dropdown ${minActive || maxActive ? "active" : ""}`}
                    onClick={this.toggleMinMaxDropdownOnClick}
                    ref={(el) => {
                      this.minMaxBtnRef = el;
                    }}
                    title={
                      minMaxReady
                        ? "Min/Max"
                        : BUTTON_LABELS[currentLang].minMaxNotReady
                    }
                    aria-label="Min Max"
                  >
                    <span className="toolbar-icon">
                      <MinMaxIcon />
                    </span>
                  </button>
                  {minMaxMenu}
                </div>
              )}

              {showColorRendererControl && (
                <div className="color-renderer-dropdown-wrapper">
                  <button
                    className={`control-button icon-control-button color-renderer-dropdown ${activeVisualization ? "active" : ""}`}
                    onClick={this.toggleColorRendererDropdownOnClick}
                    ref={(el) => {
                      this.colorRendererBtnRef = el;
                    }}
                    title={BUTTON_LABELS[currentLang].rendererTitle}
                    aria-label={BUTTON_LABELS[currentLang].rendererTitle}
                  >
                    <span className="toolbar-icon">
                      <RendererIcon />
                    </span>
                  </button>
                  {colorRendererMenu}
                </div>
              )}

              <div className="language-dropdown-wrapper">
                <button
                  className="control-button icon-control-button language-dropdown"
                  onClick={this.toggleLanguageDropdownOnClick}
                  ref={(el) => {
                    this.languageBtnRef = el;
                  }}
                  title={languageTitle}
                  aria-label={languageTitle}
                >
                  <span className="toolbar-icon">
                    <GlobeIcon />
                  </span>
                </button>
                {languageMenu}
              </div>

              <div className="theme-dropdown-wrapper">
                <button
                  className="control-button icon-control-button theme-dropdown"
                  onClick={this.toggleThemeDropdownOnClick}
                  ref={(el) => {
                    this.themeBtnRef = el;
                  }}
                  title={themeTitle}
                  aria-label={themeTitle}
                >
                  <span className="toolbar-icon">
                    <PaletteIcon />
                  </span>
                </button>
                {themeMenu}
              </div>

              {showLogoutControl && (
                <div className="logout-dropdown-wrapper">
                  <button
                    className="control-button icon-control-button logout-dropdown"
                    onClick={this.handleLogout}
                    title={BUTTON_LABELS[currentLang].logoutTitle}
                    aria-label={BUTTON_LABELS[currentLang].logoutTitle}
                  >
                    <span className="toolbar-icon">
                      <LogoutIcon />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
