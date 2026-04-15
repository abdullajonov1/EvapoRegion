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

const console = {
  log: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {},
  info: (..._args: any[]) => {},
  debug: (..._args: any[]) => {},
};

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

const LANGUAGE_OPTIONS = [
  { code: "uz_lat", nativeLabel: "O'zbek" },
  { code: "uz_cyrl", nativeLabel: "Ўзбек" },
  { code: "ru", nativeLabel: "Русский" },
];

const PREFS_INIT_KEY = "evapo_pref_initialized";
const PREFS_INIT_KEY_V2 = "evapo_pref_initialized_ru_v2";

const ensureInitialPrefs = (): void => {
  try {
    if (localStorage.getItem(PREFS_INIT_KEY_V2) === "1") return;
    localStorage.setItem("app_lang", "ru");
    localStorage.setItem("evapo_app_lang", "ru");
    localStorage.setItem("app_theme", "dark");
    localStorage.setItem("evapo_app_theme", "dark");
    localStorage.setItem(PREFS_INIT_KEY, "1");
    localStorage.setItem(PREFS_INIT_KEY_V2, "1");
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
      "ru";
    if (saved === "uz_lat" || saved === "uz_cyrl" || saved === "ru") {
      return saved;
    }
  } catch {
    // ignore and use default
  }
  return "ru";
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
  /** Cached FeatureLayerView instances keyed by layer.id — allows synchronous lv.filter updates. */
  private _layerViewMap: Map<string, any> = new Map();
  private _prevDefinitionExpression = "";
  private _prevActiveLayerId = "";
  private _prevAppliedYear = "";
  private _mapFilterRunId = 0;
  private _fallbackLayerId: string | null = null;
  private _fallbackOriginalDefExpr: string | null = null;
  private _fallbackOriginalMinScale: number | null = null;
  private _fallbackOriginalMaxScale: number | null = null;
  /** true = restore maxAllowableOffset from _fallbackOriginalMaxAllowableOffsetValue on clear */
  private _fallbackMaxAllowableOffsetCaptured = false;
  private _fallbackOriginalMaxAllowableOffsetValue: number | undefined =
    undefined;
  /** true = restore featureReduction from _fallbackOriginalFeatureReductionValue on clear */
  private _fallbackFeatureReductionCaptured = false;
  private _fallbackOriginalFeatureReductionValue: any = undefined;
  private _initialSyncTimer: number | null = null;
  private _canalReverseTranslationCache: Record<
    string,
    Record<string, string>
  > = {};
  private _dirTranslationCache: Record<
    LangCode,
    {
      region: Record<string, string>;
      district: Record<string, string>;
      months: Record<string, string>;
    }
  > = {
    uz_lat: { region: {}, district: {}, months: {} },
    uz_cyrl: { region: {}, district: {}, months: {} },
    ru: { region: {}, district: {}, months: {} },
  };
  private _dirTranslationReqId = 0;
  private _regionDirectoryOptionsCache: string[] = [];
  private _regionDirectoryCacheAt = 0;
  private _lastNotifiedFilterKey = "";
  private _lastNotifiedAt = 0;
  private _districtOptionsCache: Record<
    string,
    { opts: string[]; at: number }
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

    void this.ensureDirectoryTranslationCache(initialLang);

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
      this.setState({ currentLang: lang }, () => {
        void this.ensureDirectoryTranslationCache(lang);
      });
    }
  };

  private normalizeLookupKey(value: any): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[’ʻ`]/g, "'")
      .replace(/\s+/g, " ");
  }

  private normalizeRegionLookupKey(value: any): string {
    return this.normalizeLookupKey(value)
      .replace(/\s+viloyati$/i, "")
      .replace(/\s+вилояти$/i, "")
      .trim();
  }

  private escapeSqlLiteral(value: string): string {
    return String(value ?? "").replace(/'/g, "''");
  }

  private getApostropheVariants(value: string): string[] {
    const raw = String(value ?? "").trim();
    if (!raw) return [];

    const base = raw.replace(/[’`ʻ‘ʼ]/g, "'");
    const variants = [
      base,
      base.replace(/'/g, "’"),
      base.replace(/'/g, "`"),
      base.replace(/'/g, "ʻ"),
    ];

    return Array.from(new Set(variants.map((v) => v.trim()).filter(Boolean)));
  }

  private getDirectoryLang(lang: LangCode): "uz" | "kir" | "ru" {
    if (lang === "ru") return "ru";
    if (lang === "uz_cyrl") return "kir";
    return "uz";
  }

  private async fetchDirectoryList(
    key: "Canal" | "Canals" | "Region" | "District" | "Months",
    lang: "uz" | "kir" | "ru",
  ): Promise<string[]> {
    const typeCandidates = ["Evapo", "Evapo-RegionV20", "EvapoWaterCanalV20"];
    // Try sgm.uzspace.uz first (CORS allowed from localhost), then apiwater fallback
    const domains = ["sgm.uzspace.uz", "apiwater.sgm.uzspace.uz"];
    for (const domain of domains) {
      for (const typeName of typeCandidates) {
        try {
          const url = `https://${domain}/api/v1/directories/${encodeURIComponent(typeName)}?lang=${encodeURIComponent(lang)}&key=${encodeURIComponent(key)}`;
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
          // try next candidate
        }
      }
    }
    return [];
  }

  private sortDisplayOptions = (values: string[]): string[] => {
    return Array.from(
      new Set(values.map((v) => String(v ?? "").trim()).filter(Boolean)),
    ).sort((a, b) =>
      a.localeCompare(b, "uz", {
        sensitivity: "base",
        ignorePunctuation: true,
        numeric: true,
      }),
    );
  };

  private mergeUniqueByNormalizedKey = (
    primary: string[],
    secondary: string[],
    keyResolver: (value: string) => string = (value) =>
      this.normalizeLookupKey(value),
  ): string[] => {
    const keyToValue = new Map<string, string>();
    const add = (values: string[]): void => {
      values.forEach((value) => {
        const displayValue = String(value ?? "").trim();
        if (!displayValue) return;
        const normalized = keyResolver(displayValue);
        if (!normalized || keyToValue.has(normalized)) return;
        keyToValue.set(normalized, displayValue);
      });
    };

    add(primary);
    add(secondary);

    return this.sortDisplayOptions(Array.from(keyToValue.values()));
  };

  private async getDirectoryRegionOptions(
    forceRefresh = false,
  ): Promise<string[]> {
    const now = Date.now();
    const cacheTtlMs = 3 * 60 * 1000;
    if (
      !forceRefresh &&
      this._regionDirectoryOptionsCache.length > 0 &&
      now - this._regionDirectoryCacheAt < cacheTtlMs
    ) {
      return [...this._regionDirectoryOptionsCache];
    }

    try {
      // Try directories API first, then fall back to location/regions endpoint
      let regions = await this.fetchDirectoryList("Region", "uz");
      if (!regions.length) {
        for (const domain of ["sgm.uzspace.uz", "apiwater.sgm.uzspace.uz"]) {
          try {
            const res = await fetch(
              `https://${domain}/api/v1/location/regions`,
              {
                headers: { Accept: "application/json" },
              },
            );
            if (!res.ok) continue;
            const json = await res.json();
            regions = Array.isArray(json?.regions) ? json.regions : [];
            if (regions.length) break;
          } catch {
            /* try next */
          }
        }
      }
      const normalized = this.sortDisplayOptions(regions);
      this._regionDirectoryOptionsCache = normalized;
      this._regionDirectoryCacheAt = Date.now();
      return [...normalized];
    } catch {
      return [...this._regionDirectoryOptionsCache];
    }
  }

  private async getDistrictOptionsFromApi(viloyat: string): Promise<string[]> {
    const now = Date.now();
    const cached = this._districtOptionsCache[viloyat];
    if (cached && now - cached.at < 3 * 60 * 1000) {
      return [...cached.opts];
    }

    for (const domain of ["sgm.uzspace.uz", "apiwater.sgm.uzspace.uz"]) {
      try {
        const url = `https://${domain}/api/v1/location/districts?viloyat=${encodeURIComponent(viloyat)}`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) continue;
        const json = await res.json();
        const districts: string[] = Array.isArray(json?.districts)
          ? json.districts
          : [];
        if (districts.length > 0) {
          this._districtOptionsCache = {
            ...this._districtOptionsCache,
            [viloyat]: { opts: districts, at: Date.now() },
          };
          return [...districts];
        }
      } catch {}
    }
    return [];
  }

  private buildTranslationMap = (
    base: string[],
    target: string[],
  ): Record<string, string> => {
    const out: Record<string, string> = {};
    const n = Math.min(base.length, target.length);
    for (let i = 0; i < n; i++) {
      const from = this.normalizeLookupKey(base[i]);
      const to = String(target[i] ?? "").trim();
      if (from && to) out[from] = to;
    }
    return out;
  };

  private transliterateUzLatinToCyrillic = (input: string): string => {
    let text = String(input ?? "");
    const wordPairs: Array<[RegExp, string]> = [
      [/O‘/g, "Ў"],
      [/o‘/g, "ў"],
      [/G‘/g, "Ғ"],
      [/g‘/g, "ғ"],
      [/Yo/g, "Ё"],
      [/yo/g, "ё"],
      [/Yu/g, "Ю"],
      [/yu/g, "ю"],
      [/Ya/g, "Я"],
      [/ya/g, "я"],
      [/Sh/g, "Ш"],
      [/sh/g, "ш"],
      [/Ch/g, "Ч"],
      [/ch/g, "ч"],
      [/Ng/g, "Нг"],
      [/ng/g, "нг"],
    ];
    wordPairs.forEach(([re, to]) => {
      text = text.replace(re, to);
    });

    const charMap: Record<string, string> = {
      A: "А",
      a: "а",
      B: "Б",
      b: "б",
      D: "Д",
      d: "д",
      E: "Е",
      e: "е",
      F: "Ф",
      f: "ф",
      G: "Г",
      g: "г",
      H: "Ҳ",
      h: "ҳ",
      I: "И",
      i: "и",
      J: "Ж",
      j: "ж",
      K: "К",
      k: "к",
      L: "Л",
      l: "л",
      M: "М",
      m: "м",
      N: "Н",
      n: "н",
      O: "О",
      o: "о",
      P: "П",
      p: "п",
      Q: "Қ",
      q: "қ",
      R: "Р",
      r: "р",
      S: "С",
      s: "с",
      T: "Т",
      t: "т",
      U: "У",
      u: "у",
      V: "В",
      v: "в",
      X: "Х",
      x: "х",
      Y: "Й",
      y: "й",
      Z: "З",
      z: "з",
      "'": "",
      "`": "",
      "’": "",
    };

    return [...text].map((c) => charMap[c] ?? c).join("");
  };

  private async ensureDirectoryTranslationCache(lang: LangCode): Promise<void> {
    if (lang === "uz_lat") return;

    const existing = this._dirTranslationCache[lang];
    if (
      existing &&
      (Object.keys(existing.region).length > 0 ||
        Object.keys(existing.district).length > 0 ||
        Object.keys(existing.months).length > 0)
    ) {
      return;
    }

    const reqId = ++this._dirTranslationReqId;
    try {
      const targetLang = this.getDirectoryLang(lang);
      const [
        uzRegions,
        uzDistricts,
        uzMonths,
        targetRegions,
        targetDistricts,
        targetMonths,
      ] = await Promise.all([
        this.fetchDirectoryList("Region", "uz"),
        this.fetchDirectoryList("District", "uz"),
        this.fetchDirectoryList("Months", "uz"),
        this.fetchDirectoryList("Region", targetLang),
        this.fetchDirectoryList("District", targetLang),
        this.fetchDirectoryList("Months", targetLang),
      ]);

      if (reqId !== this._dirTranslationReqId) return;

      this._dirTranslationCache[lang] = {
        region: this.buildTranslationMap(uzRegions, targetRegions),
        district: this.buildTranslationMap(uzDistricts, targetDistricts),
        months: this.buildTranslationMap(uzMonths, targetMonths),
      };

      if (this._isMounted) this.forceUpdate();
    } catch {
      this._dirTranslationCache[lang] = {
        region: {},
        district: {},
        months: {},
      };
    }
  }

  private getLocalizedMavsumLabel = (rawValue: string): string => {
    const value = String(rawValue ?? "").trim();
    if (!value) return value;

    const normalized = this.normalizeLookupKey(value);
    const lang = this.state.currentLang;
    if (lang === "uz_lat") return value;

    const monthTranslated =
      this._dirTranslationCache[lang]?.months?.[normalized];
    if (monthTranslated) return monthTranslated;

    const isUmumiy =
      normalized === "umumiy" ||
      normalized === "умумий" ||
      normalized === "общий";
    const isIkkilamchi =
      normalized.includes("ikkilamchi") ||
      normalized.includes("иккиламчи") ||
      normalized.includes("вторич");
    const isBirlamchi =
      normalized.includes("birlamchi") ||
      normalized.includes("бирламчи") ||
      normalized.includes("первич");

    if (lang === "uz_cyrl") {
      if (isUmumiy) return "Умумий";
      if (isIkkilamchi) return "Иккиламчи";
      if (isBirlamchi) return "Бирламчи ва умуммавсумий";
      return this.transliterateUzLatinToCyrillic(value);
    }

    if (isUmumiy) return "Общий";
    if (isIkkilamchi) return "Вторичный";
    if (isBirlamchi) return "Первичный и общесезонный";
    return value;
  };

  private getLocalizedFilterValue = (
    kind: "region" | "district" | "season",
    rawValue: string,
  ): string => {
    const value = String(rawValue ?? "").trim();
    if (!value) return value;

    const lang = this.state.currentLang;
    if (lang === "uz_lat") return value;

    if (kind === "season") {
      return this.getLocalizedMavsumLabel(value);
    }

    const normalized = this.normalizeLookupKey(value);
    const map = this._dirTranslationCache[lang]?.[kind] || {};
    const cached = map[normalized];
    if (cached) {
      if (lang === "uz_cyrl" || lang === "ru") {
        const hasCyrillic = /[\u0400-\u04FF]/.test(cached);
        return hasCyrillic
          ? cached
          : this.transliterateUzLatinToCyrillic(cached);
      }
      return cached;
    }

    if (lang === "uz_cyrl" || lang === "ru") {
      return this.transliterateUzLatinToCyrillic(value);
    }
    return value;
  };

  private getLocalizedRegionOptionLabel = (
    key: RegionFilterKey,
    value: string,
  ): string => {
    if (key === "viloyat") return this.getLocalizedFilterValue("region", value);
    if (key === "tuman") return this.getLocalizedFilterValue("district", value);
    if (key === "mavsum") return this.getLocalizedFilterValue("season", value);
    return value;
  };

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
    // Canal values come from trusted widget events; active DS may legitimately
    // have 0 rows (fallback-layer mode), so DS existence checks can incorrectly
    // drop valid canal filters.
    return !!value;
  }

  private async resolveRawCanalName(input: any): Promise<string> {
    const value = String(input ?? "").trim();
    if (!value) return "";

    const key = this.normalizeLookupKey(value);

    // Accept non-empty raw canal names from trusted cross-widget events.
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
    const cropType = String(event?.detail?.cropType ?? "").trim();
    const variants = this.getApostropheVariants(cropType);

    // For compound names like "Qovun-tarvuz", also add each part and
    // common map-side aliases so the layer filter actually matches.
    const allVariants = new Set<string>(variants);
    const parts = cropType
      .split(/[-/]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      for (const part of parts) {
        this.getApostropheVariants(part).forEach((v) => allVariants.add(v));
      }
    }

    // Known API→layer name aliases
    const lower = cropType.toLowerCase().replace(/[`''\u02bb\u02bc]/g, "'");
    const CROP_ALIASES: Record<string, string[]> = {
      "qovun-tarvuz": [
        "Qovun-tarvuz",
        "Qovun tarvuz",
        "Qovun",
        "Tarvuz",
        "qovun-tarvuz",
        "qovun tarvuz",
        "qovun",
        "tarvuz",
      ],
      "yeryong'oq": ["Yeryong'oq", "Yer yong'oq", "yeryong'oq", "yer yong'oq"],
    };
    if (CROP_ALIASES[lower]) {
      for (const alias of CROP_ALIASES[lower]) {
        this.getApostropheVariants(alias).forEach((v) => allVariants.add(v));
      }
    }

    const finalVariants = Array.from(allVariants).filter(Boolean);

    const cropFilter = finalVariants.length
      ? finalVariants.length === 1
        ? `ekin_turi='${this.escapeSqlLiteral(finalVariants[0])}'`
        : `(${finalVariants
            .map((v) => `ekin_turi='${this.escapeSqlLiteral(v)}'`)
            .join(" OR ")})`
      : "";

    this.setState({ externalCropFilter: cropFilter }, () => {
      // ✅ NEW: Validate if dependent filters (like kanal) still have data with new crop
      void this.validateAndAdjustDependentFilters();
      this.refreshMinMaxOrMapFilters();
    });
  };

  /**
   * After a filter changes (crop, district, etc.), validate if dependent filters
   * still have data. If not, auto-clear conflicting filters.
   * Example: If crop=Beda is selected but kanal=SharqYulduzi9 has no Beda → clear kanal.
   */
  private async validateAndAdjustDependentFilters(): Promise<void> {
    if (!this.regionFilterEngine) return;

    const currentFilters = { ...this.state.filters };

    // Check if current filter combination has data
    const hasData =
      await this.regionFilterEngine.checkFilterCombinationExists(
        currentFilters,
      );

    if (hasData) {
      // Current combination is valid, no adjustment needed
      return;
    }

    // Current combination has NO data - need to clear something
    // Strategy: clear the most recently changed filter to restore balance
    // For now, clear fermer_nom if it was set, or kanal if external filter exists
    const newFilters = { ...currentFilters };

    // If kanal was filtered externally (from EvapoCropV32/EvapoWaterCanalV30),
    // that's usually less important than region filters, so try clearing that first
    if (newFilters.fermer_nom) {
      newFilters.fermer_nom = "";

      // Re-validate after clearing fermer
      const stillNoData =
        !(await this.regionFilterEngine.checkFilterCombinationExists(
          newFilters,
        ));

      if (stillNoData && this.state.filters.tuman) {
        // If still no data, try clearing tuman as well (less common)
        newFilters.tuman = "";
      }
    }

    // Update state with adjusted filters
    if (
      this.getFilterSignature(newFilters) !==
      this.getFilterSignature(currentFilters)
    ) {
      this.setState({ filters: newFilters });

      // Broadcast the cleared filters to other widgets
      document.dispatchEvent(
        new CustomEvent("waterSupplyFilterChanged", {
          detail: newFilters,
          bubbles: true,
        }),
      );
    }
  }

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

  private isStaleMapFilterRun = (runId: number): boolean => {
    return !this._isMounted || runId !== this._mapFilterRunId;
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
    const prevViloyat = this.state.filters.viloyat;
    const next: LocalFilterState = { ...this.state.filters, ...partial };
    if (
      this.getFilterSignature(next) ===
      this.getFilterSignature(this.state.filters)
    )
      return;
    this.minMaxEngine.cancel();
    this.colorRendererEngine.setYear(next.yil || "");

    // ✅ NEW: Validate and adjust dependent filters if main filter changed
    void this.validateAndClearDependentOnFilterChange(
      this.state.filters,
      next,
    ).then((validatedNext) => {
      this.setState({ filters: validatedNext }, () => {
        afterUpdate?.(validatedNext);
        this.updateUrlWithFilters(validatedNext);
        this.notifyFilterChange();
        if (prevYil !== validatedNext.yil)
          this.notifyYearChange(validatedNext.yil);

        // ⚠️ CRITICAL: If viloyat changed, clear min/max polygon
        // (polygon from old viloyat is now outside new viloyat bounds)
        const viloyatChanged = prevViloyat !== validatedNext.viloyat;
        if (viloyatChanged && (this.state.minActive || this.state.maxActive)) {
          this.resetMinMaxState();
        } else if (!this.canUseMinMax()) {
          this.resetMinMaxState();
        } else if (this.state.minActive || this.state.maxActive) {
          this.notifyMinMaxPolygonSelection(null);
          this.scheduleRefetch();
        }
        void this.applyMapFilters();
      });
    });
  };

  /**
   * When a main filter (viloyat, tuman) changes, validate that dependent filters
   * (fermer_nom, etc.) still have data. If not, clear the dependent filters.
   *
   * Example: viloyat changes → check if tuman still exists in new viloyat
   *          if not, clear tuman and fermer_nom
   */
  private async validateAndClearDependentOnFilterChange(
    prevFilters: LocalFilterState,
    nextFilters: LocalFilterState,
  ): Promise<LocalFilterState> {
    if (!this.regionFilterEngine) return nextFilters;

    // Check which filter changed (main filter vs dependent)
    const mainChanged =
      prevFilters.viloyat !== nextFilters.viloyat ||
      prevFilters.tuman !== nextFilters.tuman;

    if (!mainChanged) return nextFilters; // Only dependent changed, no cascade needed

    const result = { ...nextFilters };

    // Strategy: If viloyat changed, check if new viloyat still has the selected tuman
    if (prevFilters.viloyat !== nextFilters.viloyat && result.tuman) {
      const tumanExists =
        await this.regionFilterEngine.checkFilterCombinationExists({
          ...result,
          fermer_nom: "", // Ignore fermer when checking tuman
        });

      if (!tumanExists) {
        result.tuman = "";
        result.fermer_nom = "";
      }
    }

    // If tuman changed, check if new tuman still has the selected fermer_nom
    if (prevFilters.tuman !== nextFilters.tuman && result.fermer_nom) {
      const farmerExists =
        await this.regionFilterEngine.checkFilterCombinationExists({
          ...result,
        });

      if (!farmerExists) {
        result.fermer_nom = "";
      }
    }

    return result;
  }

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

  /**
   * Har qanday zoomda maydon polygonlarini to‘liq geometriya bilan chizish.
   * (maxAllowableOffset bo‘lmasa xarita uzoqdan soddalashtirilgan kontur ko‘rsatadi.)
   */
  private configureFeatureLayerFullGeometry = (layer: any): void => {
    if (!layer || layer.type !== "feature") return;
    try {
      layer.minScale = 0;
      layer.maxScale = 0;
      layer.maxAllowableOffset = 0;
      if (layer.featureReduction != null) {
        layer.featureReduction = null;
      }
    } catch {
      // ignore
    }
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

      // When the map view instance changes, flush the layer view cache.
      if (this._lastMapViewRef !== this._jimuMapView) {
        this._lastMapViewRef = this._jimuMapView;
        this._layerViewMap.clear();
      }

      const cachedLv = this._layerViewMap.get(layer.id);
      if (cachedLv) {
        // Fast path: apply filter synchronously — no async gap = no flash of old/unfiltered data.
        cachedLv.filter = { where };
        try {
          cachedLv.featureEffect = {
            filter: { where },
            excludedEffect: "opacity(30%)",
          };
        } catch {}
        try {
          layer.definitionExpression = where;
        } catch {}
        return;
      }

      // Slow path (first call for this layer): obtain the FeatureLayerView and cache it.
      // Pre-apply server-side expression before the async wait so the layer
      // starts loading only matching features from the outset.
      try {
        layer.definitionExpression = where;
      } catch {}

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

      // Cache for all future calls (synchronous fast path).
      this._layerViewMap.set(layer.id, lv);

      // Apply client-side filter FIRST (immediate effect), then confirm server-side expression.
      lv.filter = { where };
      try {
        lv.featureEffect = {
          filter: { where },
          excludedEffect: "opacity(30%)",
        };
      } catch {}
      // definitionExpression already set above; re-assert in case of race.
      try {
        layer.definitionExpression = where;
      } catch {}
    } catch {}
  };

  private zoomToFilteredExtent = async (
    layer: any,
    where: string,
    runId?: number,
  ): Promise<void> => {
    if (!this._jimuMapView?.view || !layer || !where || where === "1=0") return;
    try {
      if (typeof runId === "number" && this.isStaleMapFilterRun(runId)) return;
      const view: any = this._jimuMapView.view;
      const q = layer.createQuery ? layer.createQuery() : { where };
      q.where = where;
      q.returnGeometry = true;
      q.maxAllowableOffset = 0;

      let extent = null as any;

      try {
        const res = await layer.queryExtent(q);
        extent = res?.extent || null;
      } catch {}

      if (typeof runId === "number" && this.isStaleMapFilterRun(runId)) return;

      if (!extent) {
        try {
          const lv = await view.whenLayerView(layer);
          if (lv?.queryExtent) {
            const lvRes = await lv.queryExtent(q);
            extent = lvRes?.extent || null;
          }
        } catch {}
      }

      if (typeof runId === "number" && this.isStaleMapFilterRun(runId)) return;

      if (!extent) return;

      // Guard against invalid extents (0,0,0,0 or world bounds)
      const xmin = Number(extent.xmin || 0);
      const ymin = Number(extent.ymin || 0);
      const xmax = Number(extent.xmax || 0);
      const ymax = Number(extent.ymax || 0);
      const isValid =
        Number.isFinite(xmin) &&
        Number.isFinite(ymin) &&
        Number.isFinite(xmax) &&
        Number.isFinite(ymax) &&
        !(xmin === 0 && ymin === 0 && xmax === 0 && ymax === 0) &&
        !(xmin === -180 && ymin === -90 && xmax === 180 && ymax === 90) &&
        Math.abs(xmax - xmin) > 0.001 &&
        Math.abs(ymax - ymin) > 0.001;

      if (!isValid) return;

      const target =
        typeof extent.expand === "function" ? extent.expand(1.05) : extent;
      if (typeof runId === "number" && this.isStaleMapFilterRun(runId)) return;
      await view.goTo(target, { duration: 700 });
    } catch {
      // no-op: filtering should continue even if zoom fails
    }
  };

  /* ── Main map filter orchestrator (mirrors Evapo-RegionV31 applyMapFiltersOptimized) ── */
  private applyMapFilters = async (): Promise<void> => {
    if (!this._isMounted) return;
    const runId = ++this._mapFilterRunId;
    let allLayers = Object.values(this._dsLayerMap) as any[];
    if (allLayers.length === 0 && this._jimuMapView) {
      await this.initializeMapConnection(this._jimuMapView);
      if (this.isStaleMapFilterRun(runId)) return;
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
      await this.clearFallbackLayer();
      if (this.isStaleMapFilterRun(runId)) return;
      this._prevDefinitionExpression = "1=0";
      this._prevActiveLayerId = "";
      this._prevAppliedYear = "";
      return;
    }

    // 🔒 HARD BLOCK #2: no viloyat → hide all + 1=0
    if (!hasViloyat) {
      hideAll();
      await Promise.all(
        allLayers.map((l) => this.applyWhereToLayerView(l, "1=0")),
      );
      await this.clearFallbackLayer();
      if (this.isStaleMapFilterRun(runId)) return;
      this._prevDefinitionExpression = "1=0";
      this._prevActiveLayerId = "";
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
    let yearModeTargets: any[] = [];
    if (isYearLayer && filters.yil) {
      const mappedDs = this.regionFilterEngine.getActiveDs(filters) as any;
      const mappedLayer = mappedDs?.id ? this._dsLayerMap[mappedDs.id] : null;
      if (mappedLayer) {
        activeLayer = mappedLayer;
      }

      const candidateDsIds = await this.regionFilterEngine.getDsIdsMatchingYear(
        filters.yil,
      );
      const candidateLayers = candidateDsIds
        .map((id) => this._dsLayerMap[id])
        .filter(Boolean);
      yearModeTargets = candidateLayers;

      if (!activeLayer) {
        activeLayer = candidateLayers[0] || allLayers[0];
      }
    } else {
      activeLayer = allLayers[0];
    }

    if (this.isStaleMapFilterRun(runId)) return;

    // Pre-filter the active layer BEFORE making it visible so it loads with the
    // correct definitionExpression from the first render frame — prevents flash of
    // unfiltered features while the async lv.filter is being applied.
    if (activeLayer) {
      try {
        this.configureFeatureLayerFullGeometry(activeLayer);
        activeLayer.definitionExpression = where;
      } catch {}
    }

    // In year-layer mode, keep all layers that contain the selected year visible.
    // This avoids blank states when one candidate layer is slow/empty for a region.
    const visibleSet = new Set<any>(
      isYearLayer ? yearModeTargets : activeLayer ? [activeLayer] : [],
    );
    allLayers.forEach((l: any) => {
      try {
        l.visible = isYearLayer ? visibleSet.has(l) : l === activeLayer;
      } catch {}
    });

    // Determine filter targets
    const targets =
      isYearLayer && yearModeTargets.length
        ? yearModeTargets
        : activeLayer
          ? [activeLayer]
          : allLayers;
    await Promise.all(targets.map((l) => this.applyWhereToLayerView(l, where)));
    if (this.isStaleMapFilterRun(runId)) return;

    // Also apply WHERE to extra feature layers in the map that have viloyat field.
    // If the DS active layer has 0 features for the region, activate a fallback layer
    // that DOES have matching features (e.g. the field polygon layer).
    await this.syncExtraMapLayers(allLayers, where, activeLayer);
    if (this.isStaleMapFilterRun(runId)) return;

    const activeLayerId = String(activeLayer?.id || "");
    const yearChanged = this._prevAppliedYear !== String(filters.yil || "");
    const layerChanged = this._prevActiveLayerId !== activeLayerId;
    const shouldZoom =
      this._prevDefinitionExpression !== where || yearChanged || layerChanged;
    if (shouldZoom) {
      // Zoom to fallback layer if one was activated, otherwise DS active layer
      let zoomLayer = this._fallbackLayerId
        ? this.getFallbackLayer()
        : activeLayer;
      if (zoomLayer) {
        // Pre-check: if the zoom target has 0 features for the strict WHERE,
        // fall back to the base region WHERE so the map at least shows the
        // correct region (avoids "[Map] Extent invalid or empty" for narrow
        // crop+canal+min_max combos that have no feature-layer data).
        let effectiveZoomWhere = where;
        let zoomFeatureCount = -1;
        try {
          const checkQ = zoomLayer.createQuery
            ? zoomLayer.createQuery()
            : ({} as any);
          checkQ.where = where;
          zoomFeatureCount = Number(
            (await zoomLayer.queryFeatureCount(checkQ)) || 0,
          );
        } catch {}
        if (zoomFeatureCount === 0 && this.regionFilterEngine) {
          const baseRegionWhere =
            this.regionFilterEngine.buildWhereClause(filters);
          if (baseRegionWhere && baseRegionWhere !== where) {
            effectiveZoomWhere = baseRegionWhere;

            // Re-check: does the current zoom layer have features for
            // baseRegionWhere?  For regions like Qashqadaryo the DS active
            // layer has 0 features even for the base region.  In that case
            // find any feature layer with a viloyat field that *does* have
            // matching features and zoom on it instead.
            let baseCount = -1;
            try {
              const bq = zoomLayer.createQuery
                ? zoomLayer.createQuery()
                : ({} as any);
              bq.where = baseRegionWhere;
              baseCount = Number((await zoomLayer.queryFeatureCount(bq)) || 0);
            } catch {}
            if (baseCount === 0) {
              try {
                const v: any = this._jimuMapView?.view;
                const allM: any[] =
                  v?.map?.allLayers?.toArray?.() ||
                  v?.map?.allLayers?.items ||
                  [];
                for (const ml of allM) {
                  if (!ml || ml.type !== "feature" || ml.id === zoomLayer.id)
                    continue;
                  const flds: any[] = ml.fields || [];
                  if (
                    !Array.isArray(flds) ||
                    !flds.some(
                      (f: any) =>
                        String(f?.name || "").toLowerCase() === "viloyat",
                    )
                  )
                    continue;
                  try {
                    const mq = ml.createQuery ? ml.createQuery() : ({} as any);
                    mq.where = baseRegionWhere;
                    const mc = Number((await ml.queryFeatureCount(mq)) || 0);
                    if (mc > 0) {
                      zoomLayer = ml;
                      break;
                    }
                  } catch {}
                }
              } catch {}
            }
          }
        }
        if (this.isStaleMapFilterRun(runId)) return;
        await this.zoomToFilteredExtent(zoomLayer, effectiveZoomWhere, runId);
      }
    }

    if (this.isStaleMapFilterRun(runId)) return;
    this._prevDefinitionExpression = where;
    this._prevActiveLayerId = activeLayerId;
    this._prevAppliedYear = String(filters.yil || "");
  };

  /** Get the current fallback layer object (if any) */
  private getFallbackLayer = (): any | null => {
    if (!this._fallbackLayerId || !this._jimuMapView?.view) return null;
    try {
      const view: any = this._jimuMapView.view;
      const allMap: any[] =
        view.map?.allLayers?.toArray?.() || view.map?.allLayers?.items || [];
      return allMap.find((l: any) => l?.id === this._fallbackLayerId) || null;
    } catch {
      return null;
    }
  };

  /** Restore fallback layer to its original state without a visible flash. */
  private clearFallbackLayer = async (): Promise<void> => {
    if (!this._fallbackLayerId || !this._jimuMapView?.view) return;
    const fallbackId = this._fallbackLayerId;
    const originalDefExpr = this._fallbackOriginalDefExpr;
    const originalMinScale = this._fallbackOriginalMinScale;
    const originalMaxScale = this._fallbackOriginalMaxScale;
    const maxAOCaptured = this._fallbackMaxAllowableOffsetCaptured;
    const originalMaxAO = this._fallbackOriginalMaxAllowableOffsetValue;
    const frCaptured = this._fallbackFeatureReductionCaptured;
    const originalFR = this._fallbackOriginalFeatureReductionValue;
    // Clear tracking first so recursive / concurrent calls are no-ops.
    this._fallbackLayerId = null;
    this._fallbackOriginalDefExpr = null;
    this._fallbackOriginalMinScale = null;
    this._fallbackOriginalMaxScale = null;
    this._fallbackMaxAllowableOffsetCaptured = false;
    this._fallbackOriginalMaxAllowableOffsetValue = undefined;
    this._fallbackFeatureReductionCaptured = false;
    this._fallbackOriginalFeatureReductionValue = undefined;
    try {
      const view: any = this._jimuMapView.view;
      const allMap: any[] =
        view.map?.allLayers?.toArray?.() || view.map?.allLayers?.items || [];
      const fb = allMap.find((l: any) => l?.id === fallbackId);
      if (fb) {
        // Step 1: Immediately hide features client-side via 1=0 guard to prevent
        // a flash of unfiltered features while the server expression is restored.
        const cachedLv = this._layerViewMap.get(fb.id);
        if (cachedLv) {
          try {
            cachedLv.filter = { where: "1=0" };
          } catch {}
          try {
            cachedLv.featureEffect = null;
          } catch {}
        }
        // Step 2: Restore original server-side expression and scale (layer is visually
        // empty due to the 1=0 client filter, so this triggers no visible flash).
        try {
          fb.definitionExpression = originalDefExpr ?? null;
        } catch {}
        if (originalMinScale !== null) {
          try {
            fb.minScale = originalMinScale;
          } catch {}
        }
        if (originalMaxScale !== null) {
          try {
            fb.maxScale = originalMaxScale;
          } catch {}
        }
        if (maxAOCaptured) {
          try {
            fb.maxAllowableOffset = originalMaxAO;
          } catch {}
        }
        if (frCaptured) {
          try {
            fb.featureReduction = originalFR;
          } catch {}
        }
        // Step 3: Remove the 1=0 guard — features load gradually from the server.
        if (cachedLv) {
          try {
            cachedLv.filter = null;
          } catch {}
        } else {
          try {
            const lv = await view.whenLayerView(fb);
            if (lv) {
              lv.filter = null;
              try {
                lv.featureEffect = null;
              } catch {}
            }
          } catch {}
        }
      }
    } catch {}
  };

  /**
   * When the DS active layer has 0 features for the current WHERE,
   * find a map feature layer with matching data and set its
   * definitionExpression so the server renders only the selected region.
   *
   * Uses an ATOMIC SWAP: the new fallback filter is applied BEFORE the old
   * fallback is cleared, eliminating the flash of unfiltered features that
   * occurred when the old fallback was restored to null before finding a new one.
   */
  private syncExtraMapLayers = async (
    dsLayers: any[],
    where: string,
    activeLayer: any,
  ): Promise<void> => {
    if (!this._jimuMapView?.view) return;
    try {
      const view: any = this._jimuMapView.view;
      const allMap: any[] =
        view.map?.allLayers?.toArray?.() || view.map?.allLayers?.items || [];
      const dsIds = new Set(dsLayers.map((l: any) => l?.id).filter(Boolean));

      // Step 1: Check if DS active layer has features for this WHERE.
      let dsHasFeatures = false;
      if (activeLayer) {
        try {
          const q = activeLayer.createQuery
            ? activeLayer.createQuery()
            : ({} as any);
          q.where = where;
          const count = Number((await activeLayer.queryFeatureCount(q)) || 0);
          dsHasFeatures = count > 0;
        } catch {}
      }

      if (dsHasFeatures) {
        // DS layer has data — no fallback needed. Safe to clear now because DS is
        // already rendering the correct features (no flash on the DS layer side).
        await this.clearFallbackLayer();
        return;
      }

      // Step 2: Find the new fallback layer WITHOUT modifying any layer yet.
      // (Observing only so that we can do the atomic swap in step 3.)
      let newFallbackLayer: any = null;
      let newFallbackOriginalDefExpr: string | null = null;
      for (const ml of allMap) {
        if (!ml || dsIds.has(ml.id) || ml.type !== "feature") continue;
        const fields: any[] = ml.fields || [];
        if (!Array.isArray(fields)) continue;
        const hasViloyat = fields.some(
          (f: any) => String(f?.name || "").toLowerCase() === "viloyat",
        );
        if (!hasViloyat) continue;
        try {
          const q = ml.createQuery ? ml.createQuery() : ({} as any);
          q.where = where;
          const count = Number((await ml.queryFeatureCount(q)) || 0);
          if (count > 0) {
            newFallbackLayer = ml;
            newFallbackOriginalDefExpr =
              ml.definitionExpression !== undefined &&
              ml.definitionExpression !== null
                ? String(ml.definitionExpression)
                : null;
            break;
          }
        } catch {}
      }

      if (!newFallbackLayer) {
        // No suitable fallback found — clear any previous one.
        await this.clearFallbackLayer();
        return;
      }

      // Step 3: ATOMIC SWAP — apply the new filter FIRST, then clear the old fallback.
      // This ensures there is never a moment where an unfiltered layer is visible.
      const oldFallbackId = this._fallbackLayerId;
      const oldFallbackOriginalDefExpr = this._fallbackOriginalDefExpr;
      const oldFallbackOriginalMinScale = this._fallbackOriginalMinScale;
      const oldFallbackOriginalMaxScale = this._fallbackOriginalMaxScale;
      const oldFallbackMaxAOCaptured = this._fallbackMaxAllowableOffsetCaptured;
      const oldFallbackOriginalMaxAO = this._fallbackOriginalMaxAllowableOffsetValue;
      const oldFallbackFRCaptured = this._fallbackFeatureReductionCaptured;
      const oldFallbackOriginalFR = this._fallbackOriginalFeatureReductionValue;
      const isSameLayer =
        !!oldFallbackId && oldFallbackId === newFallbackLayer.id;

      // Apply filter to the new (or same) fallback layer.
      newFallbackLayer.definitionExpression = where;
      newFallbackLayer.visible = true;
      // Remove any minScale restriction so the layer renders at all zoom levels.
      // (The fallback layer may have a minScale configured by the map author that
      // would hide it until the user zooms in manually — we override it while the
      // fallback is active and restore it when deactivated.)
      const savedMinScale =
        typeof newFallbackLayer.minScale === "number"
          ? newFallbackLayer.minScale
          : 0;
      const savedMaxScale =
        typeof newFallbackLayer.maxScale === "number"
          ? newFallbackLayer.maxScale
          : 0;
      const savedMaxAllowableOffset = newFallbackLayer.maxAllowableOffset;
      const savedFeatureReduction = newFallbackLayer.featureReduction;

      if (!isSameLayer) {
        this._fallbackOriginalMaxAllowableOffsetValue = savedMaxAllowableOffset;
        this._fallbackMaxAllowableOffsetCaptured = true;
        this._fallbackOriginalFeatureReductionValue = savedFeatureReduction;
        this._fallbackFeatureReductionCaptured = true;
      }

      try {
        this.configureFeatureLayerFullGeometry(newFallbackLayer);
      } catch {}

      if (!isSameLayer) {
        // Update tracking to point at the new fallback before any async work.
        this._fallbackLayerId = newFallbackLayer.id;
        this._fallbackOriginalDefExpr = newFallbackOriginalDefExpr;
        this._fallbackOriginalMinScale = savedMinScale;
        this._fallbackOriginalMaxScale = savedMaxScale;
      }

      try {
        if (typeof newFallbackLayer.refresh === "function")
          newFallbackLayer.refresh();
      } catch {}

      try {
        const lv = await view.whenLayerView(newFallbackLayer);
        if (lv) {
          // Cache for synchronous fast-path on next filter change.
          this._layerViewMap.set(newFallbackLayer.id, lv);
          lv.filter = { where };
          try {
            lv.featureEffect = {
              filter: { where },
              excludedEffect: "opacity(30%)",
            };
          } catch {}
          if (typeof lv.when === "function") {
            await Promise.race([
              lv.when(),
              new Promise<void>((r) => setTimeout(r, 2000)),
            ]);
          }
        }
      } catch {}

      // Step 4: NOW clear the previous fallback (different layer) — the new
      // fallback is already showing filtered data, so this is visually seamless.
      if (
        !isSameLayer &&
        oldFallbackId &&
        oldFallbackId !== newFallbackLayer.id
      ) {
        const oldFb = allMap.find((l: any) => l?.id === oldFallbackId);
        if (oldFb) {
          const oldCachedLv = this._layerViewMap.get(oldFb.id);
          if (oldCachedLv) {
            try {
              oldCachedLv.filter = null;
            } catch {}
            try {
              oldCachedLv.featureEffect = null;
            } catch {}
          }
          try {
            oldFb.definitionExpression = oldFallbackOriginalDefExpr ?? null;
          } catch {}
          if (oldFallbackOriginalMinScale !== null) {
            try {
              oldFb.minScale = oldFallbackOriginalMinScale;
            } catch {}
          }
          if (oldFallbackOriginalMaxScale !== null) {
            try {
              oldFb.maxScale = oldFallbackOriginalMaxScale;
            } catch {}
          }
          if (oldFallbackMaxAOCaptured) {
            try {
              oldFb.maxAllowableOffset = oldFallbackOriginalMaxAO;
            } catch {}
          }
          if (oldFallbackFRCaptured) {
            try {
              oldFb.featureReduction = oldFallbackOriginalFR;
            } catch {}
          }
        }
      }
    } catch {}
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
      const layerBasedViloyatOptions = [...regionOptions];
      console.log("[LocalizationWidgetV20] Region options snapshot", {
        selectedYil: filters.yil || "",
        availableYilsFromAllLayers: yearOptions,
        availableViloyatsAfterSelectedYil: layerBasedViloyatOptions,
      });

      // Merge API-sourced options: regions from directory + districts from location API
      // Run in parallel to avoid sequential delays.
      const [directoryRegionOptions, apiDistrictOptions] = await Promise.all([
        this.getDirectoryRegionOptions(),
        filters.viloyat
          ? this.getDistrictOptionsFromApi(filters.viloyat)
          : Promise.resolve([] as string[]),
      ]);

      regionOptions = this.mergeUniqueByNormalizedKey(
        regionOptions,
        directoryRegionOptions,
        (value) => this.normalizeRegionLookupKey(value),
      );
      if (apiDistrictOptions.length > 0) {
        districtOptions = this.mergeUniqueByNormalizedKey(
          districtOptions,
          apiDistrictOptions,
        );
      }
    }

    if (!this._isMounted || reqId !== this.regionFilterReqId) return;

    const selectedViloyat = String(filters.viloyat ?? "").trim();
    const selectedExists =
      !selectedViloyat ||
      regionOptions.some(
        (option) =>
          this.normalizeRegionLookupKey(option) ===
          this.normalizeRegionLookupKey(selectedViloyat),
      );

    if (selectedViloyat && regionOptions.length > 0 && !selectedExists) {
      const fallbackViloyat =
        regionOptions.find(
          (option) =>
            this.normalizeRegionLookupKey(option) ===
            this.normalizeRegionLookupKey(DEFAULT_INITIAL_REGION),
        ) || regionOptions[0];

      const nextFilters: LocalFilterState = {
        ...filters,
        viloyat: fallbackViloyat,
        tuman: "",
        fermer_nom: "",
      };

      this.setState(
        {
          regionFilterLoading: false,
          filters: nextFilters,
          yearOptions,
          regionOptions,
          districtOptions,
          seasonOptions,
          farmerOptions,
        },
        () => {
          this.updateUrlWithFilters(nextFilters);
          this.notifyFilterChange();
          if (this.state.minActive || this.state.maxActive) {
            this.resetMinMaxState();
          }
          void this.applyMapFilters();
          void this.refreshRegionFilterOptions(nextFilters);
        },
      );
      return;
    }

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
    // - tuman change: RESET ALL dependent filters (crop, canal, source, min/max)
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

    // Special handling for hierarchical filters:
    // - viloyat/tuman/fermer changes must clear dependent external filters.
    if (key === "viloyat") {
      this.handleViloyatChange(value, nextPartial);
    } else if (key === "tuman") {
      this.handleTumanChange(value, nextPartial);
    } else if (key === "fermer_nom") {
      this.handleFermerChange(value, nextPartial);
    } else {
      this.updateFilter(nextPartial, (nextFilters) => {
        this.setState({ openRegionFilterMenuKey: null, farmerSearchText: "" });
        void this.refreshRegionFilterOptions(nextFilters);
      });
    }
  };

  /**
   * Shared logic: clear all external filters and broadcast clear events.
   * Called when tuman or fermer_nom changes.
   */
  private resetExternalFilters = (
    reason: string,
    callback: () => void,
  ): void => {
    this.minMaxEngine.cancel();
    this.clearRefetchTimer();
    this.setState(
      {
        openRegionFilterMenuKey: null,
        farmerSearchText: "",
        externalCropFilter: "",
        externalCanalFilter: "",
        externalSourceFilter: "",
        externalPolygonFilter: "",
        minActive: false,
        maxActive: false,
        minPolygonIds: [],
        maxPolygonIds: [],
        minMaxError: null,
      },
      () => {
        document.dispatchEvent(
          new CustomEvent("clearCropSelection", {
            detail: { source: "EvapoWidget", timestamp: Date.now(), reason },
            bubbles: true,
          }),
        );
        document.dispatchEvent(
          new CustomEvent("clearCanalSelection", {
            detail: { source: "EvapoWidget", timestamp: Date.now(), reason },
            bubbles: true,
          }),
        );
        document.dispatchEvent(
          new CustomEvent("clearWaterSourceSelection", {
            detail: { source: "EvapoWidget", timestamp: Date.now(), reason },
            bubbles: true,
          }),
        );
        document.dispatchEvent(
          new CustomEvent("regionDependentFiltersReset", {
            detail: { source: "EvapoWidget", timestamp: Date.now(), reason },
            bubbles: true,
          }),
        );
        // notifyFilterChange() is intentionally omitted here — updateFilter (called
        // from callback below) will broadcast the new tuman/fermer to dependent widgets.
        this.notifyMinMaxPolygonSelection(null);
        this.notifyMinMaxSelection(null, "none");
        callback();
      },
    );
  };

  /**
   * When viloyat changes, reset all dependent external filters (crop, canal, source)
   * and clear min/max polygon. This prevents stale constraints from previous region.
   */
  private handleViloyatChange = (
    viloyatValue: string,
    nextPartial: Partial<LocalFilterState>,
  ): void => {
    const prevViloyat = this.state.filters.viloyat;

    // Only reset if actually changing viloyat
    if (viloyatValue === prevViloyat) return;

    this.resetExternalFilters("viloyatChanged", () => {
      this.updateFilter(nextPartial, (nextFilters) => {
        void this.refreshRegionFilterOptions(nextFilters);
      });
    });
  };

  /**
   * When tuman changes, reset all dependent external filters (crop, canal, source)
   * and clear min/max polygon. This shows all available data for the selected tuman.
   */
  private handleTumanChange = (
    tumanValue: string,
    nextPartial: Partial<LocalFilterState>,
  ): void => {
    const prevTuman = this.state.filters.tuman;

    // Only reset if actually changing tuman
    if (tumanValue === prevTuman) return;

    // Clear external filters FIRST so that updateFilter's own notifyFilterChange()
    // and applyMapFilters() broadcasts see the already-clean state (no stale crop/canal/source).
    // This also correctly handles "no tuman → first tuman" selection.
    this.resetExternalFilters("tumanChanged", () => {
      this.updateFilter(nextPartial, (nextFilters) => {
        void this.refreshRegionFilterOptions(nextFilters);
      });
    });
  };

  /**
   * When fermer_nom changes, reset all dependent external filters (crop, canal, source)
   * and clear min/max polygon. This shows all available data for the selected farmer.
   */
  private handleFermerChange = (
    fermerValue: string,
    nextPartial: Partial<LocalFilterState>,
  ): void => {
    const prevFermer = this.state.filters.fermer_nom;

    // Only reset if actually changing fermer
    if (fermerValue === prevFermer) return;

    // Same pattern: clear external filters first, then update fermer filter.
    this.resetExternalFilters("fermerChanged", () => {
      this.updateFilter(nextPartial, (nextFilters) => {
        void this.refreshRegionFilterOptions(nextFilters);
      });
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
      void this.ensureDirectoryTranslationCache(lang);

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
    const { viloyat, tuman, mavsum, fermer_nom } = this.state.filters;
    return !!(
      viloyat &&
      !tuman &&
      !mavsum &&
      !fermer_nom &&
      !this.hasExternalMinMaxFilters()
    );
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
    const notifyKey = `${yil}|${viloyat}|${tuman}|${mavsum}|${fermer_nom}|${this.state.currentLang}`;
    const now = Date.now();
    if (
      notifyKey === this._lastNotifiedFilterKey &&
      now - this._lastNotifiedAt < 250
    ) {
      return;
    }
    this._lastNotifiedFilterKey = notifyKey;
    this._lastNotifiedAt = now;

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
      minMaxMode === "none"
        ? null
        : minMaxMode === "both"
          ? "both"
          : minActive
            ? "min"
            : "max";
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
      } else if (this.state.minActive || this.state.maxActive) {
        // The DS layer returned no polygon IDs (e.g. region uses a fallback layer with
        // no data in the configured DS).  Fall back to the pre-labelled min_max field so
        // the map still applies the correct filter even without computed polygon IDs.
        const minMaxCondition =
          this.state.minActive && this.state.maxActive
            ? "min_max IN ('Min','Max')"
            : this.state.minActive
              ? "min_max = 'Min'"
              : "min_max = 'Max'";
        polygonFilterToApply = minMaxCondition;
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
      {
        minActive: next,
        minPolygonIds: next ? this.state.minPolygonIds : [],
      },
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
      {
        maxActive: next,
        maxPolygonIds: next ? this.state.maxPolygonIds : [],
      },
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
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                className={`dropdown-item ${currentLang === lang.code ? "active" : ""}`}
                onClick={() => this.selectLanguage(lang.code as LangCode)}
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
                    {(selectedValue
                      ? this.getLocalizedRegionOptionLabel(key, selectedValue)
                      : "") ||
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
                  label: this.getLocalizedRegionOptionLabel(
                    openRegionFilterMenuKey,
                    value,
                  ),
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
