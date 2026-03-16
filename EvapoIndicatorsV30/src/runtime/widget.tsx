/** @jsx jsx */
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import { jsx, React, type AllWidgetProps } from "jimu-core";
import "./indicators.css";

/* ═══════ TRANSLATIONS ═══════ */
const translations: Record<string, Record<string, string>> = {
  "evapoCount.title": {
    "uz-latin": "Ekin maydonlari soni",
    "uz-cyrillic": "Екин майдонлари сони",
    ru: "Количество обрабатываемых полей",
  },
  "evapoArea.title": {
    "uz-latin": "Ekin maydonlari",
    "uz-cyrillic": "Екин майдонлари",
    ru: "Посевные площади",
  },
  "evapoYield.title": {
    "uz-latin": "Hosildorlik",
    "uz-cyrillic": "Ҳосилдорлик",
    ru: "Урожайность",
  },
  "evapoYield.selectCrop": {
    "uz-latin": "Ekin turini tanlang",
    "uz-cyrillic": "Экин турини танланг",
    ru: "Выберите тип культуры",
  },
  "evapoEfficiency.title": {
    "uz-latin": "Samaradorlik",
    "uz-cyrillic": "Самарадорлик",
    ru: "Эффективность",
  },
  "evapoEfficiency.selectCrop": {
    "uz-latin": "Ekin turini tanlang",
    "uz-cyrillic": "Экин турини танланг",
    ru: "Выберите тип культуры",
  },
};

function t(lang: string, key: string): string {
  return translations[key]?.[lang] || translations[key]?.["uz-latin"] || key;
}

const DEFAULT_INITIAL_YEAR = "2025";
const DEFAULT_INITIAL_REGION = "Farg'ona viloyati";

/* ═══════ STATE ═══════ */
interface IndicatorsState {
  lang: string;
  isDarkTheme: boolean;
  // Filters
  viloyat: string;
  tuman: string;
  mavsum: string;
  mavsumForCountArea: string;
  fermerNom: string;
  yil: string;
  minMax: string;
  minMaxMode: "none" | "single" | "both";
  cropType: string;
  manbaNomi: string;
  kanalNomi: string;
  // Count
  countLoading: boolean;
  countError: string;
  fieldCount: number | null;
  // Area
  areaLoading: boolean;
  areaError: string;
  totalArea: number | null;
  // Yield
  yieldLoading: boolean;
  yieldError: string;
  yieldData: any;
  yieldAnimate: boolean;
  // Efficiency
  efficiencyLoading: boolean;
  efficiencyError: string;
  efficiencyData: any;
  efficiencyAnimate: boolean;
  // Map
  connectionStatus: string;
  // Layout
  layoutClass: string;
  isCompactHeight: boolean;
  isRoomyHeight: boolean;
  // Water waves animation
  waterWaves: Array<{ id: number; x: number; y: number; timestamp: number }>;
}

/* ═══════ WIDGET CLASS ═══════ */
export default class EvapoIndicatorsV20 extends React.Component<
  AllWidgetProps<any>,
  IndicatorsState
> {
  private _isMounted = false;
  private _countAbortController: AbortController | null = null;
  private _areaAbortController: AbortController | null = null;
  private _yieldAbortController: AbortController | null = null;
  private _efficiencyAbortController: AbortController | null = null;
  private _countTimer: any = null;
  private _sessionId =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  private _lastMinMaxKey = "";
  private _jimuMapView: JimuMapView | null = null;
  private _containerRef = React.createRef<HTMLDivElement>();
  private _resizeObserver: ResizeObserver | null = null;
  private _layoutClass = "layout-2x2";

  constructor(props: AllWidgetProps<any>) {
    super(props);
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

    // Initialize language from localStorage or default
    const getInitialLang = (): string => {
      ensureInitialPrefs();
      try {
        const saved =
          localStorage.getItem("app_lang") ||
          localStorage.getItem("evapo_app_lang") ||
          "uz_lat";
        const lang = saved.toLowerCase().trim();
        if (lang === "uz_lat" || lang === "uz-lat" || lang === "uz-latin")
          return "uz-latin";
        if (
          lang === "uz_cyrl" ||
          lang === "uz-cyrl" ||
          lang === "uz_cyrillic" ||
          lang === "uz-cyrillic" ||
          lang === "uz-cyrill" ||
          lang === "uz-cyrilic"
        )
          return "uz-cyrillic";
        if (lang === "ru" || lang === "rus" || lang === "russian") return "ru";
      } catch {}
      return "uz-latin";
    };

    const getInitialTheme = (): boolean => {
      ensureInitialPrefs();
      try {
        const saved =
          localStorage.getItem("app_theme") ||
          localStorage.getItem("evapo_app_theme");
        if (saved === "light") return false;
        if (saved === "dark") return true;
      } catch {}
      return true;
    };

    this.state = {
      lang: getInitialLang(),
      isDarkTheme: getInitialTheme(),
      viloyat: DEFAULT_INITIAL_REGION,
      tuman: "",
      mavsum: "",
      mavsumForCountArea: "Birlamchi va umummavsumiy",
      fermerNom: "",
      yil: DEFAULT_INITIAL_YEAR,
      minMax: "",
      minMaxMode: "none",
      cropType: "",
      manbaNomi: "",
      kanalNomi: "",
      countLoading: false,
      countError: "",
      fieldCount: null,
      areaLoading: false,
      areaError: "",
      totalArea: null,
      yieldLoading: false,
      yieldError: "",
      yieldData: null,
      yieldAnimate: false,
      efficiencyLoading: false,
      efficiencyError: "",
      efficiencyData: null,
      efficiencyAnimate: false,
      connectionStatus: "connecting",
      layoutClass: "layout-2x2",
      isCompactHeight: false,
      isRoomyHeight: false,
      waterWaves: [],
    };
  }

  /* ─── LIFECYCLE ─── */
  componentDidMount(): void {
    this._isMounted = true;
    this.addEventListeners();
    // Don't read URL params on mount - widget should start in default state
    // Only respond to events from other widgets
    // Auto-refresh count every 60s
    this._countTimer = setInterval(() => {
      if (this._isMounted) this.fetchCountData();
    }, 60000);
    // Setup ResizeObserver for dynamic layout
    this.setupResizeObserver();
    // Setup water wave animation
    this.setupWaterWaves();

    // Load initial count/area with defaults even if filter event was emitted before this widget mounted.
    this.fetchCountData();
    this.fetchAreaData();
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    this.removeEventListeners();
    if (this._countTimer) clearInterval(this._countTimer);
    this._countAbortController?.abort();
    this._areaAbortController?.abort();
    this._yieldAbortController?.abort();
    this._efficiencyAbortController?.abort();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    this.cleanupWaterWaves();
  }

  /* ─── RESIZE OBSERVER ─── */
  private setupResizeObserver(): void {
    if (!this._containerRef.current) {
      // Retry after render
      requestAnimationFrame(() => this.setupResizeObserver());
      return;
    }
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        this.applyResponsiveScale(w, h);
        const compact = h < 120;
        const roomy = h >= 145;
        if (compact !== this.state.isCompactHeight && this._isMounted) {
          this.setState({ isCompactHeight: compact });
        }
        if (roomy !== this.state.isRoomyHeight && this._isMounted) {
          this.setState({ isRoomyHeight: roomy });
        }
        const newLayout = this.getLayoutClass(w, h);
        if (newLayout !== this._layoutClass) {
          this._layoutClass = newLayout;
          if (this._isMounted) {
            this.setState({ layoutClass: newLayout });
          }
        }
      }
    });
    this._resizeObserver.observe(this._containerRef.current);
    // Set initial layout
    const rect = this._containerRef.current.getBoundingClientRect();
    this.applyResponsiveScale(rect.width, rect.height);
    const initialCompact = rect.height < 120;
    const initialRoomy = rect.height >= 145;
    const initialLayout = this.getLayoutClass(rect.width, rect.height);
    this._layoutClass = initialLayout;
    this.setState({
      layoutClass: initialLayout,
      isCompactHeight: initialCompact,
      isRoomyHeight: initialRoomy,
    });
  }

  private applyResponsiveScale(w: number, h: number): void {
    if (!this._containerRef.current) return;
    const shortestSide = Math.max(1, Math.min(w, h));
    const scale = Math.min(1.25, Math.max(0.78, shortestSide / 140));
    const mainValueScale = Math.min(
      1.85,
      Math.max(0.82, (w / 260 + h / 95) / 2),
    );
    this._containerRef.current.style.setProperty(
      "--indicator-scale",
      scale.toFixed(3),
    );
    this._containerRef.current.style.setProperty(
      "--indicator-main-scale",
      mainValueScale.toFixed(3),
    );
  }

  private getLayoutClass(w: number, h: number): string {
    // Very narrow → single column (1x4)
    if (w < 200) return "layout-1col";
    // Wide & short → single row (4x1)
    if (w >= 500 && h < 130) return "layout-4col";
    // Medium-wide & short → 4 columns still fits
    if (w >= 400 && h < 130) return "layout-4col";
    // Wide enough for 4 columns, decent height
    if (w >= 600) return "layout-4col";
    // Narrow-medium & tall → single column
    if (w < 250 && h > 200) return "layout-1col";
    // Default 2x2 grid
    return "layout-2x2";
  }

  /* ─── EVENT LISTENERS ─── */
  private addEventListeners(): void {
    document.addEventListener("languageChanged", this.onLanguageChanged);
    document.addEventListener("themeChanged", this.onThemeChanged);
    document.addEventListener("themeToggled", this.onThemeChanged);
    document.addEventListener("waterSupplyFilterChanged", this.onFilterChanged);
    document.addEventListener("cropSelected", this.onCropSelected);
    document.addEventListener(
      "waterSourceSelected",
      this.onWaterSourceSelected,
    );
    document.addEventListener("canalselected", this.onCanalSelected);
    document.addEventListener("minMaxSelected", this.onMinMaxSelected);
    document.addEventListener("yilChanged", this.onYilChanged);
    document.addEventListener(
      "constructionYearChanged",
      this.onConstructionYearChanged,
    );
    document.addEventListener("resetAllWidgets", this.onResetAll, true);
    document.addEventListener("masterStateUpdate", this.onMasterStateUpdate);
    // Don't listen to popstate - widget should not restore state from URL
    // window.addEventListener("popstate", this.onPopState);
  }

  private removeEventListeners(): void {
    document.removeEventListener("languageChanged", this.onLanguageChanged);
    document.removeEventListener("themeChanged", this.onThemeChanged);
    document.removeEventListener("themeToggled", this.onThemeChanged);
    document.removeEventListener(
      "waterSupplyFilterChanged",
      this.onFilterChanged,
    );
    document.removeEventListener("cropSelected", this.onCropSelected);
    document.removeEventListener(
      "waterSourceSelected",
      this.onWaterSourceSelected,
    );
    document.removeEventListener("canalselected", this.onCanalSelected);
    document.removeEventListener("minMaxSelected", this.onMinMaxSelected);
    document.removeEventListener("yilChanged", this.onYilChanged);
    document.removeEventListener(
      "constructionYearChanged",
      this.onConstructionYearChanged,
    );
    document.removeEventListener("resetAllWidgets", this.onResetAll, true);
    // document.removeEventListener("masterStateUpdate", this.onMasterStateUpdate);
    window.removeEventListener("popstate", this.onPopState);
  }

  /* ─── EVENT HANDLERS ─── */
  private onLanguageChanged = (e: any): void => {
    const raw =
      e?.detail?.language || e?.detail?.lang || e?.detail?.code || "uz-latin";
    // Normalize language codes from LocalizationWidgetV20 format to widget format
    // LocalizationWidgetV20 uses: uz_lat, uz_cyrl, ru
    // This widget uses: uz-latin, uz-cyrillic, ru
    let lang = raw.toLowerCase().trim();
    if (lang === "uz_lat" || lang === "uz-lat") {
      lang = "uz-latin";
    } else if (
      lang === "uz_cyrl" ||
      lang === "uz-cyrl" ||
      lang === "uz_cyrillic" ||
      lang === "uz-cyrillic"
    ) {
      lang = "uz-cyrillic";
    } else if (lang === "ru" || lang === "rus" || lang === "russian") {
      lang = "ru";
    } else {
      // Default fallback
      lang = "uz-latin";
    }
    if (this._isMounted && lang !== this.state.lang) {
      try {
        const normalizedLang =
          lang === "uz-latin"
            ? "uz_lat"
            : lang === "uz-cyrillic"
              ? "uz_cyrl"
              : "ru";
        localStorage.setItem("app_lang", normalizedLang);
        localStorage.setItem("evapo_app_lang", normalizedLang);
      } catch {}
      this.setState({ lang });
    }
  };

  private onThemeChanged = (e: any): void => {
    const d = e?.detail || {};
    let isDarkTheme: boolean | null = null;

    if (typeof d.isDarkTheme === "boolean") {
      isDarkTheme = d.isDarkTheme;
    } else if (typeof d.theme === "string") {
      isDarkTheme = String(d.theme).toLowerCase() !== "light";
    }

    if (isDarkTheme === null) return;

    try {
      const theme = isDarkTheme ? "dark" : "light";
      localStorage.setItem("app_theme", theme);
      localStorage.setItem("evapo_app_theme", theme);
    } catch {}

    if (this._isMounted && this.state.isDarkTheme !== isDarkTheme) {
      this.setState({ isDarkTheme });
    }
  };

  private inferYearFromString(value: any): string | null {
    const match = String(value ?? "").match(/(19|20)\d{2}/);
    return match ? match[0] : null;
  }

  private normalizeYearValue(value: any): string {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    return this.inferYearFromString(raw) || raw;
  }

  private normalizeMavsumForApi(value: any): string {
    const raw = String(value ?? "");
    const normalized = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (!normalized) return "";

    if (
      normalized.includes("ikkilamchi") ||
      normalized.includes("иккиламчи") ||
      normalized.includes("вторич")
    ) {
      return " Ikkilamchi";
    }

    if (
      normalized.includes("birlamchi") ||
      normalized.includes("бирламчи") ||
      normalized.includes("первич")
    ) {
      return "Birlamchi va umummavsumiy";
    }

    if (
      normalized === "umumiy" ||
      normalized === "умумий" ||
      normalized === "общий" ||
      normalized === "mavsum" ||
      normalized === "mavsumiy" ||
      normalized === "umummavsumiy" ||
      normalized === "umum mavsumiy"
    ) {
      return "";
    }

    return raw;
  }

  private normalizeCropTypeValue(value: any): string {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const normalized = raw.toLowerCase().replace(/\s+/g, " ");

    if (normalized === "mosh" || normalized === "мош") return "Mosh";

    return raw;
  }

  private getCropTypeApiCandidates(cropType: string): string[] {
    const raw = String(cropType || "").trim();
    if (!raw) return [];
    // Return only the normalized value; the API is case-sensitive
    // and rejects unknown variants with 400.
    return [this.normalizeCropTypeValue(raw)];
  }

  private onFilterChanged = (e: any): void => {
    const d = e?.detail || {};
    const newState: Partial<IndicatorsState> = {};
    if (d.viloyat !== undefined) newState.viloyat = d.viloyat || "";
    if (d.tuman !== undefined) newState.tuman = d.tuman || "";
    if (d.mavsum !== undefined) newState.mavsum = d.mavsum || "";
    if (d.mavsumForIndicators !== undefined) {
      newState.mavsumForCountArea = d.mavsumForIndicators || "";
    }
    if (d.fermer_nom !== undefined) newState.fermerNom = d.fermer_nom || "";
    if (d.fermer_nomNom !== undefined)
      newState.fermerNom = d.fermer_nomNom || "";
    if (d.yil !== undefined) newState.yil = this.normalizeYearValue(d.yil);
    this.setState(newState as any, () => {
      this.fetchCountData();
      this.fetchAreaData();
      if (this.state.cropType) {
        this.fetchYieldData();
        this.fetchEfficiencyData();
      }
    });
  };

  private onCropSelected = (e: any): void => {
    const cropType = this.normalizeCropTypeValue(
      e?.detail?.cropType ||
        e?.detail?.ekin_turi ||
        e?.detail?.selectedCropType ||
        "",
    );
    this.setState({ cropType }, () => {
      this.fetchCountData();
      this.fetchAreaData();
      if (cropType) {
        this.fetchYieldData();
        this.fetchEfficiencyData();
      } else {
        this.setState({
          yieldData: null,
          efficiencyData: null,
        });
      }
    });
  };

  private onWaterSourceSelected = (e: any): void => {
    const manbaNomi =
      e?.detail?.manba_nomi ||
      e?.detail?.manbaNomi ||
      e?.detail?.sourceSelected ||
      e?.detail?.waterSource ||
      "";
    // Clear stale canal when water source changes
    this.setState({ manbaNomi, kanalNomi: "" }, () => {
      this.fetchCountData();
      this.fetchAreaData();
      if (this.state.cropType) {
        this.fetchYieldData();
        this.fetchEfficiencyData();
      }
    });
  };

  private onCanalSelected = (e: any): void => {
    const kanalNomi =
      e?.detail?.kanal_nomi ||
      e?.detail?.kanalNomi ||
      e?.detail?.canalName ||
      e?.detail?.canal ||
      "";
    this.setState({ kanalNomi }, () => {
      this.fetchCountData();
      this.fetchAreaData();
      if (this.state.cropType) {
        this.fetchYieldData();
        this.fetchEfficiencyData();
      }
    });
  };

  private onMinMaxSelected = (e: any): void => {
    const minMax =
      e?.detail?.min_max || e?.detail?.minMax || e?.detail?.value || "";
    const minMaxMode: "none" | "single" | "both" =
      e?.detail?.minMaxMode || (minMax ? "single" : "none");
    const minMaxKey = `${minMaxMode}:${minMax}`;
    if (minMaxKey === this._lastMinMaxKey) return;
    this._lastMinMaxKey = minMaxKey;
    this.setState({ minMax, minMaxMode }, () => {
      this.fetchCountData();
      this.fetchAreaData();
      if (this.state.cropType) {
        this.fetchYieldData();
        this.fetchEfficiencyData();
      }
    });
  };

  private onYilChanged = (e: any): void => {
    const yil = this.normalizeYearValue(
      e?.detail?.yil || e?.detail?.year || "",
    );
    this.setState({ yil }, () => {
      this.fetchCountData();
      this.fetchAreaData();
      if (this.state.cropType) {
        this.fetchYieldData();
        this.fetchEfficiencyData();
      }
    });
  };

  private onConstructionYearChanged = (e: any): void => {
    const yil = this.normalizeYearValue(
      e?.detail?.constructionYear || e?.detail?.yil || "",
    );
    this.setState({ yil }, () => {
      this.fetchCountData();
      this.fetchAreaData();
      if (this.state.cropType) {
        this.fetchYieldData();
        this.fetchEfficiencyData();
      }
    });
  };

  private onResetAll = (): void => {
    this.setState(
      {
        viloyat: "",
        tuman: "",
        mavsum: "",
        mavsumForCountArea: "Birlamchi va umummavsumiy",
        fermerNom: "",
        yil: "",
        minMax: "",
        minMaxMode: "none",
        cropType: "",
        manbaNomi: "",
        kanalNomi: "",
        fieldCount: null,
        totalArea: null,
        yieldData: null,
        efficiencyData: null,
        countError: "",
        areaError: "",
        yieldError: "",
        efficiencyError: "",
      },
      () => {
        this._lastMinMaxKey = "";
        setTimeout(() => {
          this.fetchCountData();
          this.fetchAreaData();
        }, 100);
      },
    );
  };

  private onMasterStateUpdate = (e: any): void => {
    const d = e?.detail || {};
    const newState: Partial<IndicatorsState> = {};
    if (d.viloyat !== undefined) newState.viloyat = d.viloyat || "";
    if (d.tuman !== undefined) newState.tuman = d.tuman || "";
    if (d.mavsum !== undefined) newState.mavsum = d.mavsum || "";
    if (d.fermer_nom !== undefined) newState.fermerNom = d.fermer_nom || "";
    if (d.yil !== undefined) newState.yil = this.normalizeYearValue(d.yil);
    if (d.ekin_turi !== undefined)
      newState.cropType = this.normalizeCropTypeValue(d.ekin_turi);
    if (d.manba_nomi !== undefined) newState.manbaNomi = d.manba_nomi || "";
    if (d.kanal_nomi !== undefined) newState.kanalNomi = d.kanal_nomi || "";
    if (d.min_max !== undefined) {
      const minMaxValue = (d.min_max || "").toString();
      newState.minMax = minMaxValue === "both" ? "" : minMaxValue;
      newState.minMaxMode = minMaxValue
        ? minMaxValue === "both"
          ? "both"
          : "single"
        : "none";
    }
    if (Object.keys(newState).length > 0) {
      this.setState(newState as any, () => {
        this.fetchCountData();
        this.fetchAreaData();
        if (this.state.cropType) {
          this.fetchYieldData();
          this.fetchEfficiencyData();
        }
      });
    }
  };

  private onPopState = (): void => {
    this.readUrlParams();
  };

  private readUrlParams(): void {
    try {
      const params = new URLSearchParams(window.location.search);
      const newState: Partial<IndicatorsState> = {};
      if (params.get("viloyat")) newState.viloyat = params.get("viloyat");
      if (params.get("tuman")) newState.tuman = params.get("tuman");
      if (params.get("mavsum")) newState.mavsum = params.get("mavsum");
      if (params.get("fermer_nom"))
        newState.fermerNom = params.get("fermer_nom");
      if (params.get("yil"))
        newState.yil = this.normalizeYearValue(params.get("yil"));
      if (params.get("ekin_turi")) {
        newState.cropType = this.normalizeCropTypeValue(
          params.get("ekin_turi"),
        );
      }
      if (params.get("manba_nomi"))
        newState.manbaNomi = params.get("manba_nomi");
      if (params.get("kanal_nomi"))
        newState.kanalNomi = params.get("kanal_nomi");
      if (params.get("min_max")) {
        const minMaxValue = params.get("min_max") || "";
        newState.minMax = minMaxValue === "both" ? "" : minMaxValue;
        newState.minMaxMode = minMaxValue
          ? minMaxValue === "both"
            ? "both"
            : "single"
          : "none";
      }
      if (Object.keys(newState).length > 0) {
        this.setState(newState as any, () => {
          this.fetchCountData();
          this.fetchAreaData();
          if (this.state.cropType) {
            this.fetchYieldData();
            this.fetchEfficiencyData();
          }
        });
      } else {
        this.fetchCountData();
        this.fetchAreaData();
      }
    } catch {
      this.fetchCountData();
      this.fetchAreaData();
    }
  }

  /* ─── MAP CONNECTION ─── */
  private onActiveViewChange = (jimuMapView: JimuMapView): void => {
    this._jimuMapView = jimuMapView;
    if (jimuMapView) {
      this.setState({ connectionStatus: "connected" }, () => {
        if (this.state.cropType) {
          this.fetchYieldData();
          this.fetchEfficiencyData();
        }
      });
    }
  };

  /* ═══════ DATA FETCHING ═══════ */

  /* ─── COUNT ─── */
  private async fetchCountData(): Promise<void> {
    if (!this._isMounted) return;
    const {
      viloyat,
      tuman,
      mavsum,
      mavsumForCountArea,
      fermerNom,
      cropType,
      manbaNomi,
      kanalNomi,
      minMax,
      minMaxMode,
      yil,
    } = this.state;
    const yilStr = (yil || "").toString().trim();
    const hasValidYear = /^\d{4}$/.test(yilStr);
    if (!hasValidYear) {
      return; // Year hard gate
    }

    this._countAbortController?.abort();
    this._countAbortController = new AbortController();

    this.setState({ countLoading: true, countError: "" });

    try {
      const buildParams = (minMaxValue?: string, cropTypeValue?: string) => {
        const params = new URLSearchParams();
        if (viloyat) params.append("viloyat", viloyat);
        if (tuman) params.append("tuman", tuman);
        const cropRaw = cropTypeValue ?? cropType ?? "";
        const cropParam = String(cropRaw).trim();
        // Skip mavsum when a specific crop is selected: crops like
        // Mosh/Sholi are secondary-season and would return 0 with the
        // default "Birlamchi va umummavsumiy" filter.
        if (!cropParam) {
          const normalizedMavsum = this.normalizeMavsumForApi(
            mavsumForCountArea || mavsum,
          );
          if (normalizedMavsum) params.append("mavsum", normalizedMavsum);
        }
        if (fermerNom) params.append("fermer_nom", fermerNom);
        if (cropParam) params.append("ekin_turi", cropParam);
        if (manbaNomi) params.append("manba_nomi", manbaNomi);
        if (kanalNomi) params.append("kanal_nomi", kanalNomi);
        if (minMaxValue) params.append("min_max", minMaxValue);
        params.append("yil", yilStr);
        params.append("_session", this._sessionId);
        params.append("_t", Date.now().toString());
        params.append("_r", Math.random().toString(36).substring(2, 15));
        params.append("_nocache", "1");
        params.append("forceRefresh", "true");
        return params;
      };

      const fetchCountFor = async (minMaxValue?: string): Promise<number> => {
        const fetchSingle = async (cropCandidate?: string): Promise<number> => {
          const params = buildParams(minMaxValue, cropCandidate);
          const url = `https://sgm.uzspace.uz/api/v1/area/count_fields?${params.toString()}`;
          const resp = await fetch(url, {
            signal: this._countAbortController.signal,
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          return data.field_count || 0;
        };

        const candidates = this.getCropTypeApiCandidates(cropType);
        if (!candidates.length) {
          return await fetchSingle();
        }

        let best = 0;
        for (const candidate of candidates) {
          let value = 0;
          try {
            value = await fetchSingle(candidate);
          } catch {
            continue;
          }
          if (value > best) best = value;
          if (value > 0) break;
        }
        return best;
      };

      const fieldCount =
        minMaxMode === "both"
          ? (
              await Promise.all([fetchCountFor("min"), fetchCountFor("max")])
            ).reduce((sum, value) => sum + (value || 0), 0)
          : await fetchCountFor(minMax || undefined);
      if (this._isMounted) {
        this.setState({
          countLoading: false,
          fieldCount,
        });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (this._isMounted) {
        this.setState({
          countLoading: false,
          countError: err?.message || "Error",
        });
      }
    }
  }

  /* ─── AREA ─── */
  private async fetchAreaData(): Promise<void> {
    if (!this._isMounted) return;
    const {
      viloyat,
      tuman,
      mavsum,
      mavsumForCountArea,
      fermerNom,
      cropType,
      manbaNomi,
      kanalNomi,
      minMax,
      minMaxMode,
      yil,
    } = this.state;
    const yilStr = (yil || "").toString().trim();
    const hasValidYear = /^\d{4}$/.test(yilStr);
    if (!hasValidYear) {
      // Year hard gate — show dashes until year is selected
      return;
    }

    this._areaAbortController?.abort();
    this._areaAbortController = new AbortController();

    this.setState({ areaLoading: true, areaError: "" });

    try {
      const buildParams = (minMaxValue?: string, cropTypeValue?: string) => {
        const params = new URLSearchParams();
        if (viloyat) params.append("viloyat", viloyat);
        if (tuman) params.append("tuman", tuman);
        const cropRaw = cropTypeValue ?? cropType ?? "";
        const cropParam = String(cropRaw).trim();
        // Skip mavsum when a specific crop is selected (same reason
        // as count: secondary-season crops return 0 otherwise).
        if (!cropParam) {
          const normalizedMavsum = this.normalizeMavsumForApi(
            mavsumForCountArea || mavsum,
          );
          if (normalizedMavsum) params.append("mavsum", normalizedMavsum);
        }
        if (fermerNom) params.append("fermer_nom", fermerNom);
        if (cropParam) params.append("ekin_turi", cropParam);
        if (manbaNomi) params.append("manba_nomi", manbaNomi);
        if (kanalNomi) params.append("kanal_nomi", kanalNomi);
        if (minMaxValue) params.append("min_max", minMaxValue);
        params.append("yil", yilStr);
        params.append("_t", Date.now().toString());
        return params;
      };

      const fetchAreaFor = async (minMaxValue?: string): Promise<number> => {
        const fetchSingle = async (cropCandidate?: string): Promise<number> => {
          const params = buildParams(minMaxValue, cropCandidate);
          const url = `https://apiwater.sgm.uzspace.uz/api/v1/area/calculate_total_area?${params.toString()}`;
          const resp = await fetch(url, {
            signal: this._areaAbortController.signal,
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          return data.total_maydon ?? data.totalMaydonGa ?? 0;
        };

        const candidates = this.getCropTypeApiCandidates(cropType);
        if (!candidates.length) {
          return await fetchSingle();
        }

        let best = 0;
        for (const candidate of candidates) {
          let value = 0;
          try {
            value = await fetchSingle(candidate);
          } catch {
            continue;
          }
          if (value > best) best = value;
          if (value > 0) break;
        }
        return best;
      };

      const totalArea =
        minMaxMode === "both"
          ? (
              await Promise.all([fetchAreaFor("min"), fetchAreaFor("max")])
            ).reduce((sum, value) => sum + (value || 0), 0)
          : await fetchAreaFor(minMax || undefined);
      if (this._isMounted) {
        this.setState({ areaLoading: false, totalArea });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (this._isMounted) {
        this.setState({
          areaLoading: false,
          areaError: err?.message || "Error",
        });
      }
    }
  }

  /* ─── YIELD ─── */
  private async fetchYieldData(): Promise<void> {
    if (!this._isMounted) return;
    if (this.state.connectionStatus !== "connected") return;
    const {
      viloyat,
      tuman,
      mavsum,
      cropType,
      fermerNom,
      manbaNomi,
      kanalNomi,
      minMax,
      minMaxMode,
      yil,
    } = this.state;
    if (!cropType) {
      this.setState({ yieldData: null });
      return;
    }

    this._yieldAbortController?.abort();
    this._yieldAbortController = new AbortController();

    this.setState({ yieldLoading: true, yieldError: "" });

    try {
      const buildParams = (minMaxValue?: string) => {
        const params = new URLSearchParams();
        if (viloyat) params.append("viloyat", viloyat);
        if (tuman) params.append("tuman", tuman);
        const normalizedMavsum = this.normalizeMavsumForApi(mavsum);
        if (normalizedMavsum) params.append("mavsum", normalizedMavsum);
        if (cropType) params.append("ekin_turi", cropType);
        if (fermerNom) params.append("fermer_nom", fermerNom);
        if (manbaNomi) params.append("manba_nomi", manbaNomi);
        if (kanalNomi) params.append("kanal_nomi", kanalNomi);
        if (minMaxValue) params.append("min_max", minMaxValue);
        if (yil && /^\d{4}$/.test(yil)) params.append("yil", yil);
        return params;
      };

      const fetchYieldFor = async (minMaxValue?: string): Promise<any> => {
        const params = buildParams(minMaxValue);
        const url = `https://sgm.uzspace.uz/api/v1/analytics/yield-indicator?${params.toString()}`;
        const resp = await fetch(url, {
          signal: this._yieldAbortController.signal,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
      };

      const combineYieldData = (minData: any, maxData: any) => {
        if (!minData && !maxData) return null;
        const combined = { ...(minData || {}), ...(maxData || {}) };
        combined.median_yield =
          (minData?.median_yield || 0) + (maxData?.median_yield || 0);
        combined.max_yield =
          (minData?.max_yield || 0) + (maxData?.max_yield || 0);
        return combined;
      };

      const data =
        minMaxMode === "both"
          ? combineYieldData(
              ...(await Promise.all([
                fetchYieldFor("min"),
                fetchYieldFor("max"),
              ])),
            )
          : await fetchYieldFor(minMax || undefined);
      if (this._isMounted) {
        this.setState({
          yieldLoading: false,
          yieldData: data,
          yieldAnimate: true,
        });
        setTimeout(() => {
          if (this._isMounted) this.setState({ yieldAnimate: false });
        }, 500);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (this._isMounted) {
        this.setState({
          yieldLoading: false,
          yieldError: err?.message || "Error",
        });
      }
    }
  }

  /* ─── EFFICIENCY ─── */
  private async fetchEfficiencyData(): Promise<void> {
    if (!this._isMounted) return;
    if (this.state.connectionStatus !== "connected") return;
    const {
      viloyat,
      tuman,
      mavsum,
      cropType,
      manbaNomi,
      kanalNomi,
      minMax,
      minMaxMode,
      yil,
    } = this.state;
    if (!cropType) {
      this.setState({ efficiencyData: null });
      return;
    }

    this._efficiencyAbortController?.abort();
    this._efficiencyAbortController = new AbortController();

    this.setState({ efficiencyLoading: true, efficiencyError: "" });

    try {
      const buildParams = (minMaxValue?: string) => {
        const params = new URLSearchParams();
        if (viloyat) params.append("viloyat", viloyat);
        if (tuman) params.append("tuman", tuman);
        const normalizedMavsum = this.normalizeMavsumForApi(mavsum);
        if (normalizedMavsum) params.append("mavsum", normalizedMavsum);
        if (cropType) params.append("ekin_turi", cropType);
        if (minMaxValue) params.append("min_max", minMaxValue);
        if (manbaNomi) params.append("manba_nomi", manbaNomi);
        if (kanalNomi) params.append("kanal_nomi", kanalNomi);
        if (yil && /^\d{4}$/.test(yil)) params.append("yil", yil);
        return params;
      };

      const fetchEfficiencyFor = async (minMaxValue?: string): Promise<any> => {
        const params = buildParams(minMaxValue);
        const url = `https://sgm.uzspace.uz/api/v1/analytics/efficiency-indicator?${params.toString()}`;
        const resp = await fetch(url, {
          signal: this._efficiencyAbortController.signal,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
      };

      const combineEfficiencyData = (minData: any, maxData: any) => {
        if (!minData && !maxData) return null;
        const combined = { ...(minData || {}), ...(maxData || {}) };
        combined.median_efficiency =
          (minData?.median_efficiency || 0) + (maxData?.median_efficiency || 0);
        combined.max_efficiency =
          (minData?.max_efficiency || 0) + (maxData?.max_efficiency || 0);
        return combined;
      };

      const data =
        minMaxMode === "both"
          ? combineEfficiencyData(
              ...(await Promise.all([
                fetchEfficiencyFor("min"),
                fetchEfficiencyFor("max"),
              ])),
            )
          : await fetchEfficiencyFor(minMax || undefined);
      if (this._isMounted) {
        this.setState({
          efficiencyLoading: false,
          efficiencyData: data,
          efficiencyAnimate: true,
        });
        setTimeout(() => {
          if (this._isMounted) this.setState({ efficiencyAnimate: false });
        }, 500);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (this._isMounted) {
        this.setState({
          efficiencyLoading: false,
          efficiencyError: err?.message || "Error",
        });
      }
    }
  }

  /* ═══════ HELPERS ═══════ */
  private formatNumber(
    num: number | null | undefined,
    decimals: number = 0,
  ): string {
    if (num === null || num === undefined) return "----------";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  private formatNumberWithUnit(
    num: number | null | undefined,
    unit: string,
    decimals: number = 0,
  ): string {
    const value = this.formatNumber(num, decimals);
    return value === "----------" ? value : `${value} ${unit}`;
  }

  private getLocalizedUnit(type: "count" | "area"): string {
    const { lang } = this.state;
    if (type === "count") {
      if (lang === "ru") return "шт";
      if (lang === "uz-cyrillic") return "та";
      return "ta";
    }
    if (lang === "ru") return "га";
    if (lang === "uz-cyrillic") return "га";
    return "ga";
  }

  /* ═══════ WATER WAVES ANIMATION ═══════ */
  private _waterWaveIdCounter = 0;
  private _waterWaveCleanupInterval: any = null;

  private setupWaterWaves(): void {
    if (!this._containerRef.current) {
      requestAnimationFrame(() => this.setupWaterWaves());
      return;
    }
    const container = this._containerRef.current;
    container.addEventListener("mousemove", this.handleMouseMove);
    container.addEventListener("mouseleave", this.handleMouseLeave);

    // Cleanup old waves periodically
    this._waterWaveCleanupInterval = setInterval(() => {
      if (this._isMounted && this.state.waterWaves.length > 0) {
        const now = Date.now();
        const activeWaves = this.state.waterWaves.filter(
          (wave) => now - wave.timestamp < 1500,
        );
        if (activeWaves.length !== this.state.waterWaves.length) {
          this.setState({ waterWaves: activeWaves });
        }
      }
    }, 100);
  }

  private cleanupWaterWaves(): void {
    if (this._containerRef.current) {
      this._containerRef.current.removeEventListener(
        "mousemove",
        this.handleMouseMove,
      );
      this._containerRef.current.removeEventListener(
        "mouseleave",
        this.handleMouseLeave,
      );
    }
    if (this._waterWaveCleanupInterval) {
      clearInterval(this._waterWaveCleanupInterval);
      this._waterWaveCleanupInterval = null;
    }
  }

  private _lastMouseX = 0;
  private _lastMouseY = 0;
  private _waveThrottle = 0;

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this._containerRef.current) return;
    const rect = this._containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Calculate movement speed
    const dx = x - this._lastMouseX;
    const dy = y - this._lastMouseY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // Throttle wave creation based on movement speed
    this._waveThrottle += speed;
    if (this._waveThrottle < 2) {
      this._lastMouseX = x;
      this._lastMouseY = y;
      return;
    }
    this._waveThrottle = 0;

    // Create wave slightly behind cursor (in movement direction)
    const offsetX = dx * 0.3;
    const offsetY = dy * 0.3;
    const waveX = x - offsetX;
    const waveY = y - offsetY;

    const newWave = {
      id: this._waterWaveIdCounter++,
      x: waveX,
      y: waveY,
      timestamp: Date.now(),
    };

    this._lastMouseX = x;
    this._lastMouseY = y;

    this.setState((prevState) => ({
      waterWaves: [...prevState.waterWaves, newWave],
    }));
  };

  private handleMouseLeave = (): void => {
    // Clear all waves when mouse leaves
    this.setState({ waterWaves: [] });
  };

  /* ═══════ RENDER ═══════ */
  render(): React.ReactNode {
    const {
      lang,
      countLoading,
      countError,
      fieldCount,
      areaLoading,
      areaError,
      totalArea,
      yieldLoading,
      yieldError,
      yieldData,
      yieldAnimate,
      efficiencyLoading,
      efficiencyError,
      efficiencyData,
      efficiencyAnimate,
      connectionStatus,
      cropType,
      isCompactHeight,
      isRoomyHeight,
    } = this.state;

    const rawIndicatorType = this.props.config?.indicatorType || "count-area";
    const indicatorType =
      rawIndicatorType === "count" || rawIndicatorType === "area"
        ? "count-area"
        : rawIndicatorType === "yield" || rawIndicatorType === "efficiency"
          ? "yield-efficiency"
          : rawIndicatorType;
    const showCountArea = indicatorType === "count-area";
    const showYieldEfficiencyPair = indicatorType === "yield-efficiency";

    const medianYield = yieldData?.median_yield || 0;
    const maxYield = yieldData?.max_yield || 0;
    const medianEfficiency = efficiencyData?.median_efficiency || 0;
    const maxEfficiency = efficiencyData?.max_efficiency || 0;
    const showYieldEfficiency = connectionStatus === "connected";
    const hasCropType = !!cropType;

    return (
      <div
        ref={this._containerRef}
        className={`indicators-container ${this.state.layoutClass} single-indicator ${isCompactHeight ? "compact-content" : ""} ${isRoomyHeight ? "roomy-content" : ""}`}
      >
        {/* Water waves animation */}
        {this.state.waterWaves.map((wave) => (
          <div
            key={wave.id}
            className="water-wave"
            style={{
              left: `${wave.x}%`,
              top: `${wave.y}%`,
            }}
          />
        ))}
        {/* Hidden map connector */}
        {showYieldEfficiencyPair && this.props.useMapWidgetIds?.length > 0 && (
          <div style={{ display: "none" }}>
            <JimuMapViewComponent
              useMapWidgetId={this.props.useMapWidgetIds?.[0]}
              onActiveViewChange={this.onActiveViewChange}
            />
          </div>
        )}

        {/* ─── CARD: Count + Area ─── */}
        {showCountArea && (
          <div className="indicator-card indicator-pair-card">
            <div className="indicator-pair-row">
              <div className="indicator-pair-label">
                {t(lang, "evapoCount.title")}
              </div>
              <div className="indicator-pair-value">
                {countLoading ? (
                  <span className="indicator-loading">...</span>
                ) : countError ? (
                  <span className="indicator-error">{countError}</span>
                ) : (
                  <span className="indicator-value">
                    {this.formatNumberWithUnit(
                      fieldCount,
                      this.getLocalizedUnit("count"),
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="indicator-pair-divider" />
            <div className="indicator-pair-row">
              <div className="indicator-pair-label">
                {t(lang, "evapoArea.title")}
              </div>
              <div className="indicator-pair-value">
                {areaLoading ? (
                  <span className="indicator-loading">...</span>
                ) : areaError ? (
                  <span className="indicator-error">{areaError}</span>
                ) : (
                  <span className="indicator-value">
                    {this.formatNumberWithUnit(
                      totalArea,
                      this.getLocalizedUnit("area"),
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── CARD: Yield + Efficiency ─── */}
        {showYieldEfficiencyPair && (
          <div className="indicator-card indicator-pair-card">
            {(yieldLoading || efficiencyLoading) && (
              <div className="indicator-spinner">
                <div className="indicator-spinner-dot" />
              </div>
            )}
            <div className="indicator-pair-row">
              <div className="indicator-pair-label">
                {t(lang, "evapoYield.title")}
              </div>
              <div className="indicator-pair-value">
                {yieldError ? (
                  <span className="indicator-error">{yieldError}</span>
                ) : showYieldEfficiency && !hasCropType ? (
                  <span className="indicator-placeholder">
                    {t(lang, "evapoYield.selectCrop")}
                  </span>
                ) : showYieldEfficiency && hasCropType && yieldData ? (
                  <span
                    className={`indicator-main-value ${yieldAnimate ? "indicator-animate" : ""}`}
                  >
                    {medianYield.toFixed(1)} t/ha
                  </span>
                ) : (
                  <span className="indicator-loading">...</span>
                )}
              </div>
            </div>
            <div className="indicator-pair-divider" />
            <div className="indicator-pair-row">
              <div className="indicator-pair-label">
                {t(lang, "evapoEfficiency.title")}
              </div>
              <div className="indicator-pair-value">
                {efficiencyError ? (
                  <span className="indicator-error">{efficiencyError}</span>
                ) : showYieldEfficiency && !hasCropType ? (
                  <span className="indicator-placeholder">
                    {t(lang, "evapoEfficiency.selectCrop")}
                  </span>
                ) : showYieldEfficiency && hasCropType && efficiencyData ? (
                  <span
                    className={`indicator-main-value ${
                      efficiencyAnimate ? "indicator-animate" : ""
                    }`}
                  >
                    {medianEfficiency.toFixed(1)} kg/m3
                  </span>
                ) : (
                  <span className="indicator-loading">...</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
