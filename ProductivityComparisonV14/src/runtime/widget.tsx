// @ts-nocheck
import {
  AllWidgetProps,
  DataSourceManager,
  getAppStore,
  Immutable,
  IMUseDataSource,
  React,
} from "jimu-core";
import throttle from "lodash/throttle";
import "./yield-water-chart.css";
// @ts-ignore - Recharts React type compatibility
import {
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** ✅ MAP (only used AFTER lasso selection) */
import Graphic from "esri/Graphic";
import FeatureLayer from "esri/layers/FeatureLayer";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";

const API_BASE_URL = "https://apiwater.sgm.uzspace.uz/api/v1";
const API_ENDPOINTS = {
  chartData: "/analytics/dynamic-xy-chart",
  chartFilters: "/analytics/xy-chart-filters",
  chartBins: "/analytics/xy-chart-bins",
};

const DEFAULT_BINS = 25; // fixed render grid 25x25

const CHART_HEIGHT = 400;
const CHART_MARGIN = { top: 20, right: 78, bottom: 40, left: 50 };

type AxisMetric =
  | "awt_m3ha"
  | "uwt_m3ha"
  | "yld_tot"
  | "maydon"
  | "awt_m3"
  | "wp_tot"
  | "eff";

const METRICS: Array<{ key: AxisMetric; label: string; decimals: number }> = [
  { key: "awt_m3ha", label: "O’rtacha suv ta’minotu m3/ga", decimals: 0 },
  { key: "uwt_m3ha", label: "O’rtacha suv istemoli m3/ga", decimals: 0 },
  { key: "yld_tot", label: "O’rtacha hosildorlik s/ga", decimals: 2 },
  { key: "maydon", label: "Ekin yer maydoni ga", decimals: 0 },
  { key: "awt_m3", label: "Suv taqsimoti m3", decimals: 0 },
  { key: "wp_tot", label: "Water productivity (wp_tot)", decimals: 2 },
  { key: "eff", label: "Efficiency (eff)", decimals: 3 },
];

const getMetricLabel = (m: AxisMetric): string =>
  METRICS.find((x) => x.key === m)?.label ?? m;
const getMetricDecimals = (m: AxisMetric): number =>
  METRICS.find((x) => x.key === m)?.decimals ?? 0;

type GroupByType = "fermer_nom" | "tuman" | "ekin_turi";

const GROUP_BY_OPTIONS: Array<{ key: GroupByType; label: string }> = [
  { key: "fermer_nom", label: "Fermer" },
  { key: "tuman", label: "Tuman" },
  { key: "ekin_turi", label: "Ekin turi" },
];

const START_YEAR = 2015;
const DEFAULT_INITIAL_YEAR = "2025";
const DEFAULT_INITIAL_REGION = "Farg'ona viloyati";
const DEFAULT_INITIAL_REGION_ALIASES = [
  "Fargona viloyati",
  "Farg'ona",
  "Fargona",
  "Farg‘ona viloyati",
  "Farg‘ona",
];

/** ✅ MAP CONFIG (YOU MUST SET FEATURE_LAYER_URL) */

const SELECTION_LAYER_ID = "yield-water-selection-layer";

// =============================================
// LOCALIZATION - Import from local messages.ts
// =============================================
import {
  registerCropTranslations,
  translateCropName,
} from "../../../EvapoCropV32/src/runtime/messages";
import {
  getInitialLang,
  LangCode,
  normalizeLangCode,
  Translations,
  TRANSLATIONS,
} from "./messages";

interface DensityBin {
  x: number;
  y: number;
  count: number;
}

interface ApiRange {
  min?: number;
  max?: number;
  bin_size?: number;
  [key: string]: any;
}
interface ApiFiltersResponse {
  viloyat: string[];
  tuman: string[];
  ekin_turi: string[];
  mavsum: string[];
  yil: Array<number | string>;
}

interface ApiDensityResponse {
  data: DensityBin[];
  x_range: ApiRange;
  y_range: ApiRange;
  total_points: number;
}

interface ScatterPoint {
  x_value: number;
  y_value: number;
  count: number;
  xi?: number;
  yi?: number;
  name?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ScatterPoint }>;
}

interface FilterOptions {
  yil: string[];
  viloyat: string[];
  tuman: string[];
  ekin_turi: string[];
  mavsum: string[];
}

interface FilterSelections {
  selectedViloyat: string;
  selectedTuman: string;
  selectedEkin_turi: string;
  selectedMavsum: string;
  selectedYil: string;
}

interface RawBinsRequest {
  bins: Array<{ x: number; y: number }>;
  x_bin_size: number;
  y_bin_size: number;
  x_axis: string;
  y_axis: string;
}

interface RawPoint {
  name?: string;
  globalid?: string;
  x: number;
  y: number;
  [k: string]: any;
}

interface RawPointsResponse {
  data: RawPoint[];
}

interface YieldWaterWidgetState extends FilterSelections, FilterOptions {
  loading: boolean;
  error: string | null;
  loadingFilters: boolean;
  focusedGlobalId: string;

  /** ✅ Jadval tartiblash */
  tableSortField:
    | "x"
    | "y"
    | "wp"
    | "fermer"
    | "ekin_turi"
    | "maydon"
    | "count"
    | "none";
  tableSortAsc: boolean;

  chartData: ScatterPoint[];
  rawApiData: ApiDensityResponse | null;

  xRange: { min: number; max: number; binSize: number } | null;
  yRange: { min: number; max: number; binSize: number } | null;
  totalPoints: number;
  maxBinCount: number;
  nonEmptyBins: number;

  connectionStatus: "idle" | "connecting" | "connected" | "failed";
  retryCount: number;
  viewMode: "chart" | "polygons";

  selectedXMetric: AxisMetric;
  selectedYMetric: AxisMetric;
  selectedGroupBy: GroupByType;
  openAxisMenu: "x" | "y" | null;

  chartStageWidth: number;

  lassoEnabled: boolean;
  lassoDrawing: boolean;
  lassoPath: Array<{ x: number; y: number }>;
  selectedBinKeys: string[];

  rawPointsLoading: boolean;
  rawPointsError: string | null;
  rawPoints: RawPoint[];
  rawPreviewOpen: boolean;

  /** ✅ MAP */
  jimuMapView: JimuMapView | null;
  mapError: string | null;
  mapSelectedCount: number;
  savedMapExtent: any | null;
  activePolygonLayerId: string | null;

  /** Grouped mode (tuman/ekin_turi) selected item */
  selectedGroupedItem: string | null;

  /** Localization */
  lang: LangCode;

  /** ✅ Hover effect for bins */
  hoveredBinKey: string | null;
}

interface SimpleDropdownProps {
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  hidePlaceholderItem?: boolean;
  getOptionLabel?: (value: string) => string;
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  value,
  options,
  placeholder = "",
  onChange,
  disabled = false,
  className = "",
  hidePlaceholderItem = false,
  getOptionLabel = (option) => option,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const handleScroll = (event: Event) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        target !== dropdownRef.current
      ) {
        setIsOpen(false);
      }
    };
    const handleResize = () => setIsOpen(false);

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleScroll, true);
        document.addEventListener("scroll", handleScroll, true);
      }, 10);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsOpen(!isOpen);
  };

  const selectOption = (option: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(option);
    setIsOpen(false);
  };

  const displayValue = value ? getOptionLabel(value) : placeholder;

  return (
    <div
      className={`simple-dropdown ${className} ${disabled ? "disabled" : ""} ${
        isOpen ? "is-open" : ""
      }`}
      ref={dropdownRef}
    >
      <button
        className={`dropdown-button ${isOpen ? "open" : ""}`}
        onClick={toggleDropdown}
        disabled={disabled}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="dropdown-text">{displayValue}</span>
        <span className={`dropdown-chevron ${isOpen ? "rotated" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div
          className="dropdown-menu"
          role="listbox"
          onScroll={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="dropdown-content"
            onScroll={(e) => e.stopPropagation()}
          >
            {!hidePlaceholderItem && (
              <div
                className={`dropdown-item ${!value ? "selected" : ""}`}
                onClick={(e) => selectOption("", e)}
                role="option"
                aria-selected={!value}
              >
                {placeholder}
              </div>
            )}

            {options.map((option) => (
              <div
                key={option}
                className={`dropdown-item ${
                  value === option ? "selected" : ""
                }`}
                onClick={(e) => selectOption(option, e)}
                role="option"
                aria-selected={value === option}
              >
                {getOptionLabel(option)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface CreatableDropdownProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  hideSearchInput?: boolean;
  getOptionLabel?: (value: string) => string;
  allowCustomValue?: boolean;
}

const CreatableDropdown: React.FC<CreatableDropdownProps> = ({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  className = "",
  hideSearchInput = false,
  getOptionLabel = (option) => option,
  allowCustomValue = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const handleResize = () => setIsOpen(false);

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("resize", handleResize);
        inputRef.current?.focus();
      }, 10);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) setQuery("");
    }
  };

  const selectOption = (option: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onChange(option);
    setIsOpen(false);
    setQuery("");
  };

  const commitTypedValue = () => {
    const v = query.trim();
    if (!v) return;
    const normalizedQuery = v.toLowerCase();
    const matchedOption = options.find((option) => {
      const label = getOptionLabel(option);
      return (
        option.trim().toLowerCase() === normalizedQuery ||
        String(label || "")
          .trim()
          .toLowerCase() === normalizedQuery
      );
    });

    if (matchedOption) {
      onChange(matchedOption);
    } else if (allowCustomValue) {
      onChange(v);
    } else {
      return;
    }
    setIsOpen(false);
    setQuery("");
  };

  const displayValue = value ? getOptionLabel(value) : placeholder;
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => {
        const label = String(getOptionLabel(o) || "").toLowerCase();
        return o.toLowerCase().includes(q) || label.includes(q);
      })
    : options;

  return (
    <div
      className={`simple-dropdown ${className} ${disabled ? "disabled" : ""} ${
        isOpen ? "is-open" : ""
      }`}
      ref={dropdownRef}
    >
      <button
        className={`dropdown-button ${isOpen ? "open" : ""}`}
        onClick={toggleDropdown}
        disabled={disabled}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="dropdown-text">{displayValue}</span>
        <span className={`dropdown-chevron ${isOpen ? "rotated" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div
          className="dropdown-menu"
          role="listbox"
          onScroll={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="dropdown-content"
            onScroll={(e) => e.stopPropagation()}
          >
            {!hideSearchInput && (
              <div
                className="dropdown-item"
                style={{ cursor: "default" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <input
                  ref={inputRef}
                  value={query}
                  placeholder="Type to search / add…"
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      commitTypedValue();
                    }
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "inherit",
                    font: "inherit",
                  }}
                />
              </div>
            )}

            <div
              className={`dropdown-item ${!value ? "selected" : ""}`}
              onClick={(e) => selectOption("", e)}
              role="option"
              aria-selected={!value}
            >
              {placeholder}
            </div>

            {allowCustomValue && query.trim() ? (
              <div
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  commitTypedValue();
                }}
                role="option"
                aria-selected={false}
              >
                ➕ Use: <strong>{query.trim()}</strong>
              </div>
            ) : null}

            {filtered.map((option) => (
              <div
                key={option}
                className={`dropdown-item ${
                  value === option ? "selected" : ""
                }`}
                onClick={(e) => selectOption(option, e)}
                role="option"
                aria-selected={value === option}
              >
                {getOptionLabel(option)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default class YieldWaterChartWidget extends React.PureComponent<
  AllWidgetProps<any>,
  YieldWaterWidgetState
> {
  private _isMounted = false;
  private _dirTranslationReqId = 0;
  private _dirTranslationLoaded: Partial<Record<LangCode, boolean>> = {};
  private _dirTranslationCache: Partial<
    Record<
      LangCode,
      { region: Record<string, string>; district: Record<string, string> }
    >
  > = {};
  private throttledFetchData: ReturnType<typeof throttle>;
  private throttledNotify: () => void;
  private _onReset: () => void;
  private _polygonQueryLayer: FeatureLayer | null = null;
  private _polygonQueryLayerUrl: string | null = null;
  private dsManager = DataSourceManager.getInstance();
  private _queryLayerByUseDsKey = new Map<string, FeatureLayer>();

  private yearOptionsCache = new Map<string, string[]>();

  private axisXRef = React.createRef<HTMLDivElement>();
  private axisYRef = React.createRef<HTMLDivElement>();

  private chartStageRef = React.createRef<HTMLDivElement>();
  private resizeObserver: ResizeObserver | null = null;

  /** ✅ list helpers */
  private listSearchDebounce: ReturnType<typeof throttle> | null = null;

  /** ✅ Lasso temporary path for performance */
  private _lassoTempPath: Array<{ x: number; y: number }> = [];
  private _lassoRAF: number | null = null;
  private _lassoUpdateScheduled = false;

  /** ✅ Direct DOM ref for lasso path (avoids React re-render during drawing) */
  private lassoPathRef = React.createRef<SVGPathElement>();

  /** ✅ Store Recharts pixel coordinates for each bin (updated during render) */
  private _binPixelCoords = new Map<string, { x: number; y: number }>();
  private _applySelectionReqId = 0;
  private _applySelectionInFlightSignature = "";

  constructor(props: AllWidgetProps<any>) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      viewMode: "chart",
      focusedGlobalId: "",
      tableSortField: "none",
      tableSortAsc: false, // default: no sorting

      selectedYil: DEFAULT_INITIAL_YEAR,
      selectedViloyat: DEFAULT_INITIAL_REGION,
      selectedTuman: "",
      selectedEkin_turi: "",
      selectedMavsum: "",

      yil: [],
      viloyat: [],
      tuman: [],
      ekin_turi: [],
      mavsum: ["Ikkilamchi", "Umumiy"],

      loadingFilters: false,

      chartData: [],
      rawApiData: null,
      xRange: null,
      yRange: null,
      totalPoints: 0,
      maxBinCount: 1,
      nonEmptyBins: 0,

      connectionStatus: "idle",
      retryCount: 0,

      selectedXMetric: "uwt_m3ha",
      selectedYMetric: "yld_tot",
      selectedGroupBy: "fermer_nom",
      openAxisMenu: null,

      chartStageWidth: 0,

      lassoEnabled: false,
      lassoDrawing: false,
      lassoPath: [],
      selectedBinKeys: [],

      rawPointsLoading: false,
      rawPointsError: null,
      rawPoints: [],
      rawPreviewOpen: false,

      /** ✅ MAP */
      jimuMapView: null,
      mapError: null,
      mapSelectedCount: 0,
      savedMapExtent: null,
      activePolygonLayerId: null,

      /** Grouped mode selected item */
      selectedGroupedItem: null,

      /** Localization */
      lang: getInitialLang(),

      /** ✅ Hover effect for bins */
      hoveredBinKey: null,
    };

    this.throttledFetchData = throttle(this.fetchData, 300, {
      leading: false,
      trailing: true,
    });
    this.throttledNotify = throttle(this.notifyFilters, 150, {
      leading: true,
      trailing: true,
    });
    this._onReset = this.handleReset.bind(this);
  }

  componentDidMount(): void {
    this._isMounted = true;
    this.setupEventListeners();
    this.initializeWidget();

    document.addEventListener("mousedown", this.handleAxisOutsideClick, true);
    document.addEventListener("keydown", this.handleAxisEsc, true);
    window.addEventListener("resize", this.closeAxisMenu, true);
    window.addEventListener("scroll", this.closeAxisMenu, true);
    document.addEventListener("scroll", this.closeAxisMenu, true);

    // Language change listener
    document.addEventListener("languageChanged", this.onLanguageChanged);
    document.addEventListener("appLanguageChanged", this.onLanguageChanged);
    void this.ensureDirectoryTranslationCache(this.state.lang);

    this.startResizeObserverIfReady();

    // ✅ if map connects fast, make sure polygons are still hidden
    // (safe if map not ready yet)
    this.hidePolygonLayerUntilSelection();
  }

  /** ✅ Normalize GUID values for safer matching */
  private normalizeGuid = (v: string): string => {
    const s = String(v || "").trim();
    // remove { } if present
    return s.replace(/^\{/, "").replace(/\}$/, "");
  };

  /** ✅ Return both GUID formats: with and without braces */
  private guidVariants = (v: string): string[] => {
    const core = this.normalizeGuid(v);
    if (!core) return [];
    return [core, `{${core}}`];
  };

  componentDidUpdate(prevProps: AllWidgetProps<any>): void {
    // keep your resize logic
    if (!this.resizeObserver && this.chartStageRef.current)
      this.startResizeObserverIfReady();

    // ✅ if selected DS changes -> clear selection + re-hide polygons
    const prevUrl = this.getSelectedLayerUrlFromDataSource(prevProps);
    const currUrl = this.getSelectedLayerUrlFromDataSource(this.props);

    if (this.normalizeUrl(prevUrl || "") !== this.normalizeUrl(currUrl || "")) {
      console.log("[DEBUG] DS URL changed, clearing selection", {
        prevUrl,
        currUrl,
      });
      this.clearSelection();
      this.hidePolygonLayerUntilSelection();
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    this.cleanupEventListeners();
    if (this.throttledFetchData?.cancel) this.throttledFetchData.cancel();
    if ((this.throttledNotify as any)?.cancel)
      (this.throttledNotify as any).cancel();

    document.removeEventListener(
      "mousedown",
      this.handleAxisOutsideClick,
      true,
    );
    document.removeEventListener("keydown", this.handleAxisEsc, true);
    window.removeEventListener("resize", this.closeAxisMenu, true);
    window.removeEventListener("scroll", this.closeAxisMenu, true);
    document.removeEventListener("scroll", this.closeAxisMenu, true);

    // Remove language listener
    document.removeEventListener("languageChanged", this.onLanguageChanged);
    document.removeEventListener("appLanguageChanged", this.onLanguageChanged);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // ✅ Cancel lasso RAF
    if (this._lassoRAF !== null) {
      cancelAnimationFrame(this._lassoRAF);
      this._lassoRAF = null;
    }

    // ✅ clear map highlight layer (safe)
    this.clearMapSelection();
  }

  /** Language change event handler */
  private onLanguageChanged = (ev: Event): void => {
    const ce = ev as CustomEvent;
    const detail: any = ce?.detail || {};
    const newLang = detail?.lang ?? detail?.language ?? detail?.code;
    if (!newLang || !this._isMounted) return;

    const normalized = normalizeLangCode(newLang);
    if (normalized !== this.state.lang) {
      this.setState({ lang: normalized }, () => {
        void this.ensureDirectoryTranslationCache(normalized);
      });
    }
  };

  private normalizeLookupKey = (value: any): string => {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[’ʻ`]/g, "'")
      .replace(/\s+/g, " ");
  };

  private getApiLangForDirectories = (lang: LangCode): "uz" | "kir" | "ru" => {
    if (lang === "ru") return "ru";
    if (lang === "uz_cyrl") return "kir";
    return "uz";
  };

  /** Fetch regions from /location/regions (most reliable source) */
  private fetchLocationRegions = async (): Promise<string[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/location/regions`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.regions)
        ? json.regions.map((r: any) => String(r ?? "").trim()).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  };

  /** Fetch districts from /location/districts (viloyat-filtered, most reliable for tumans) */
  private fetchLocationDistricts = async (
    viloyat: string,
  ): Promise<string[]> => {
    if (!viloyat) return [];
    try {
      const params = new URLSearchParams({ viloyat });
      const res = await fetch(
        `${API_BASE_URL}/location/districts?${params.toString()}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.districts)
        ? json.districts.map((d: any) => String(d ?? "").trim()).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  };

  private async fetchDirectoryList(
    key: "Region" | "District" | "Crop type",
    lang: "uz" | "kir" | "ru",
  ): Promise<string[]> {
    const typeCandidates = ["Evapo", "Evapo-RegionV20"];
    const baseUrls = [
      API_BASE_URL,
      "https://sgm.uzspace.uz/api/v1",
      "https://apiwater.sgm.uzspace.uz/api/v1",
    ];

    for (const baseUrl of Array.from(new Set(baseUrls))) {
      for (const typeName of typeCandidates) {
        try {
          const url = `${baseUrl}/directories/${encodeURIComponent(typeName)}?lang=${encodeURIComponent(lang)}&key=${encodeURIComponent(key)}`;
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
    if (this._dirTranslationLoaded[lang]) return;

    const reqId = ++this._dirTranslationReqId;
    try {
      const [
        uzRegions,
        uzDistricts,
        uzCrops,
        targetRegions,
        targetDistricts,
        targetCrops,
      ] = await Promise.all([
        this.fetchDirectoryList("Region", "uz"),
        this.fetchDirectoryList("District", "uz"),
        this.fetchDirectoryList("Crop type", "uz"),
        this.fetchDirectoryList("Region", this.getApiLangForDirectories(lang)),
        this.fetchDirectoryList(
          "District",
          this.getApiLangForDirectories(lang),
        ),
        this.fetchDirectoryList(
          "Crop type",
          this.getApiLangForDirectories(lang),
        ),
      ]);

      if (reqId !== this._dirTranslationReqId) return;

      if (uzCrops.length && targetCrops.length) {
        registerCropTranslations(lang, uzCrops, targetCrops);
      }

      this._dirTranslationCache[lang] = {
        region: this.buildTranslationMap(uzRegions, targetRegions),
        district: this.buildTranslationMap(uzDistricts, targetDistricts),
      };
      this._dirTranslationLoaded[lang] = true;

      if (this._isMounted) this.forceUpdate();
    } catch {
      delete this._dirTranslationCache[lang];
      delete this._dirTranslationLoaded[lang];
    }
  }

  private getLocalizedMavsumLabel = (rawValue: string): string => {
    const value = String(rawValue ?? "").trim();
    if (!value) return value;

    const normalized = this.normalizeLookupKey(value);
    const lang = this.state.lang;
    if (lang === "uz_lat") return value;

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
    kind: "region" | "district" | "crop" | "season",
    rawValue: string,
  ): string => {
    const value = String(rawValue ?? "").trim();
    if (!value) return value;

    const lang = this.state.lang;
    if (lang === "uz_lat") return value;

    if (kind === "crop") {
      const translated = translateCropName(lang as any, value);
      if (translated && translated !== value) return translated;
      return lang === "uz_cyrl"
        ? this.transliterateUzLatinToCyrillic(value)
        : value;
    }

    if (kind === "season") return this.getLocalizedMavsumLabel(value);

    const key = this.normalizeLookupKey(value);
    const cache = this._dirTranslationCache[lang];
    let translated: string | undefined =
      kind === "region" ? cache?.region?.[key] : cache?.district?.[key];

    // Retry: feature data may include "tumani"/"viloyati" suffix that the
    // directory API cache does not, causing the key to miss.
    if (!translated) {
      if (kind === "district") {
        const stripped = key
          .replace(/\s+(tumani?|rayon|район)\s*$/i, "")
          .trim();
        if (stripped !== key) translated = cache?.district?.[stripped];
      } else if (kind === "region") {
        const stripped = key
          .replace(/\s+(viloyati?|region|область)\s*$/i, "")
          .trim();
        if (stripped !== key) translated = cache?.region?.[stripped];
      }
    }

    if (translated) return translated;

    return lang === "uz_cyrl"
      ? this.transliterateUzLatinToCyrillic(value)
      : value;
  };

  /** Get translation for current language */
  private t = (key: keyof Translations): string => {
    return (
      TRANSLATIONS[this.state.lang]?.[key] ?? TRANSLATIONS.uz_lat[key] ?? key
    );
  };

  private getGroupByLabel = (key: GroupByType): string => {
    if (key === "fermer_nom") return this.t("fermer");
    if (key === "tuman") return this.t("tuman");
    return this.t("ekinTuri");
  };

  private getLocalizedGroupedItemLabel = (
    groupBy: GroupByType,
    rawValue: string,
  ): string => {
    const value = String(rawValue ?? "").trim();
    if (!value) return value;
    if (groupBy === "tuman") {
      return this.getLocalizedFilterValue("district", value);
    }
    if (groupBy === "ekin_turi") {
      return this.getLocalizedFilterValue("crop", value);
    }
    return value;
  };

  /** Get metric label with localization */
  private getLocalizedMetricLabel = (m: AxisMetric): string => {
    const metricLabelMap: Record<AxisMetric, keyof Translations> = {
      awt_m3ha: "avgWaterSupply",
      uwt_m3ha: "avgWaterConsumption",
      yld_tot: "avgYield",
      maydon: "cropArea",
      awt_m3: "waterDistribution",
      wp_tot: "waterProductivity",
      eff: "efficiency",
    };
    const key = metricLabelMap[m];
    return key ? this.t(key) : m;
  };

  /** Get metric unit for display */
  private getMetricUnit = (m: AxisMetric): string => {
    const unitMap: Record<AxisMetric, string> = {
      awt_m3ha: "m³/ga",
      uwt_m3ha: "m³/ga",
      yld_tot: "s/ga",
      maydon: "ga",
      awt_m3: "m³",
      wp_tot: "kg/m³",
      eff: "%",
    };
    return unitMap[m] || "";
  };

  /** Remove trailing unit text from indicator titles (keeps title clean). */
  private getIndicatorTitle = (m: AxisMetric): string => {
    const unit = this.getMetricUnit(m);
    const label = this.getLocalizedMetricLabel(m);
    if (!unit) return label;

    const normalizedUnit = unit
      .replace(/\u00B3/g, "3")
      .trim()
      .toLowerCase();
    const normalizedLabel = label
      .replace(/\u00B3/g, "3")
      .trim()
      .toLowerCase();
    if (normalizedLabel.endsWith(normalizedUnit)) {
      return label.slice(0, label.length - unit.length).trim();
    }
    return label;
  };

  private splitMetricHeaderLabel = (
    metric: AxisMetric,
    label: string,
  ): { top: string; bottom: string } | null => {
    const safeLabel = String(label || "").trim();
    const words = safeLabel.trim().split(/\s+/).filter(Boolean);

    if (metric === "awt_m3ha" || metric === "uwt_m3ha") {
      if (words.length >= 3) {
        return {
          top: `${words[0]} ${words[1]}`,
          bottom: words.slice(2).join(" "),
        };
      }

      const rest = label.replace(/^O['’`ʻ]\s*rtacha\s+suv\s*/i, "").trim();
      if (rest) return { top: "O'rtacha suv", bottom: rest };
    }

    if (metric === "yld_tot") {
      if (words.length >= 2) {
        return {
          top: words[0],
          bottom: words.slice(1).join(" "),
        };
      }

      const rest = label.replace(/^O['’`ʻ]\s*rtacha\s*/i, "").trim();
      if (rest) return { top: "O'rtacha", bottom: rest };
    }

    // Fallback by label content (protects against unexpected metric keys/theme strings)
    const normalized = safeLabel
      .toLowerCase()
      .replace(/[’`ʻ\u2018]/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    if (normalized.includes("hosildorlik") && words.length >= 2) {
      return { top: words[0], bottom: words.slice(1).join(" ") };
    }

    if (normalized.includes("suv") && words.length >= 3) {
      return {
        top: `${words[0]} ${words[1]}`,
        bottom: words.slice(2).join(" "),
      };
    }

    return null;
  };

  private renderSortableMetricHeader = (
    metric: AxisMetric,
    sortField: "x" | "y",
    sortIcon: string,
    iconSize: number,
  ): React.ReactNode => {
    const label = this.getLocalizedMetricLabel(metric);
    const split = this.splitMetricHeaderLabel(metric, label);

    if (!split) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>{label}</span>
          <span style={{ fontSize: iconSize }}>{sortIcon}</span>
        </div>
      );
    }

    return (
      <>
        <div style={{ lineHeight: 1.1 }}>{split.top}</div>
        <div
          style={{
            lineHeight: 1.1,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>{split.bottom}</span>
          <span style={{ fontSize: iconSize }}>{sortIcon}</span>
        </div>
      </>
    );
  };

  /** ✅ Map connection handler */
  private handleActiveViewChange = (jmv: JimuMapView): void => {
    console.log("[DEBUG] handleActiveViewChange called", {
      newJmv: jmv?.id,
      currentJmv: this.state.jimuMapView?.id,
      isSame: this.state.jimuMapView === jmv,
    });
    if (!jmv) return;

    // ✅ Skip if same view already connected (prevents reset on popup click etc.)
    if (this.state.jimuMapView === jmv) {
      console.log("[DEBUG] Same view, skipping");
      return;
    }

    this.setState({ jimuMapView: jmv, mapError: null }, async () => {
      // Always ensure graphics selection layer exists
      this.ensureSelectionLayer();

      // Only hide polygons if we currently have NO selection or focus
      const hasSelection =
        this.state.mapSelectedCount > 0 ||
        this.state.selectedBinKeys?.length > 0 ||
        this.state.rawPoints?.length > 0 ||
        this.state.focusedGlobalId?.trim();

      if (!hasSelection) {
        await this.hidePolygonLayerUntilSelection();
      }
      // If there IS a selection, do NOT touch polygon visibility here.
      // Otherwise Experience Builder view refresh will hide them again.
    });
  };
  /** ✅ Map connection handler */

  private startResizeObserverIfReady = (): void => {
    const el = this.chartStageRef.current;
    if (!el) return;
    if (this.resizeObserver) return;

    const rect0 = el.getBoundingClientRect();
    if (rect0.width && Math.abs(rect0.width - this.state.chartStageWidth) > 1) {
      this.setState({ chartStageWidth: Math.round(rect0.width) });
    }

    if (typeof (window as any).ResizeObserver !== "function") return;

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = Math.round(entry?.contentRect?.width ?? 0);
      if (!w || !this._isMounted) return;
      if (Math.abs(w - this.state.chartStageWidth) > 1) {
        // ✅ Clear cached coords when size changes - will be rebuilt during next render
        this._binPixelCoords.clear();
        this.setState({ chartStageWidth: w });
      }
    });

    this.resizeObserver.observe(el);
  };
  /** ✅ Build a safe WHERE clause for many IDs (OR-chunked IN lists) */
  private buildWhereForIds = (
    field: string,
    ids: string[],
    chunkSize = 200,
  ): string => {
    const clean = [
      ...new Set(ids.map((v) => String(v || "").trim()).filter(Boolean)),
    ];
    if (!clean.length) return "1=0";

    const chunks = this.chunkArray(clean, chunkSize);
    const parts = chunks.map((part) => {
      const quoted = part.map((v) => `'${v.replace(/'/g, "''")}'`).join(",");
      return `${field} IN (${quoted})`;
    });

    return parts.length === 1 ? parts[0] : `(${parts.join(" OR ")})`;
  };

  /**
   * ✅ Find polygon layer in the CONNECTED MAP (if it already exists in WebMap),
   * otherwise return null (we will only add it AFTER lasso).
   */
  private findPolygonLayerInMap = (): FeatureLayer | null => {
    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    const url = this.getPolygonLayerUrl();
    if (!view || !view.map || !url) return null;

    const want = this.normalizeUrl(url);

    const all = (view.map as any).allLayers?.toArray?.() ?? [];
    const hit = all.find((lyr: any) => {
      const u = this.normalizeUrl((lyr?.url ?? "").toString());
      return u && u === want;
    });

    return hit ? (hit as FeatureLayer) : null;
  };

  private ensurePolygonLayerInMapAfterLasso = async (
    year?: string,
  ): Promise<FeatureLayer | null> => {
    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    if (!view?.map) return null;

    const resolved = await this.resolveSelectedPolygonSource(year);
    const resolvedUrl = this.normalizeUrl(
      String(resolved?.url || (resolved?.layer as any)?.url || ""),
    );
    if (!resolvedUrl) {
      console.warn(
        "[ensurePolygonLayerInMapAfterLasso] no resolvedUrl",
        resolved,
      );
      return null;
    }

    const layerId = this.getPolygonLayerId(year, resolvedUrl);

    // 1) If we already added it earlier, reuse it
    const existing = view.map.findLayerById(layerId) as FeatureLayer;
    if (existing) {
      try {
        await existing.load();
      } catch {}
      return existing;
    }

    // 2) If map already has a FeatureLayer with the same URL, reuse THAT, but keep it isolated with our id
    const byUrl = this.findFeatureLayerInMapByUrl(resolvedUrl);
    if (byUrl) {
      // Important: do NOT rename/map-id a webmap layer unless you fully own it.
      // So if a webmap layer exists, just return it and control it by definitionExpression.
      // (We still prefer our own layer, but this is fine.)
      try {
        await byUrl.load();
      } catch {}
      return byUrl;
    }

    // 3) Create our own layer (the reliable option)
    const layer = new FeatureLayer({
      url: resolvedUrl,
      id: layerId,
      title: resolved?.label
        ? `Selected polygons (${resolved.label})`
        : "Selected polygons",
      visible: false,
      definitionExpression: "1=0",
    });

    try {
      view.map.add(layer);
      // optional: keep above basemap-ish content
      try {
        view.map.reorder(layer, view.map.layers.length - 1);
      } catch {}
      await layer.load();
    } catch (e) {
      console.warn("[ensurePolygonLayerInMapAfterLasso] add/load failed", e);
    }

    return layer;
  };

  private setupEventListeners(): void {
    document.addEventListener("resetAllWidgets", this._onReset);
  }

  private cleanupEventListeners(): void {
    document.removeEventListener("resetAllWidgets", this._onReset);
  }

  private notifyFilters = () => {
    const detail = {
      source: "ProductivityWidget",
      yil: this.state.selectedYil || "",
      viloyat: this.state.selectedViloyat || "",
      tuman: this.state.selectedTuman || "",
      ekin_turi: this.state.selectedEkin_turi || "",
      mavsum: this.state.selectedMavsum || "",
      timestamp: Date.now(),
    };
    document.dispatchEvent(
      new CustomEvent("productivityFilterChanged", { detail, bubbles: true }),
    );
  };

  private initializeWidget = async (): Promise<void> => {
    try {
      this.setState({ connectionStatus: "connecting" });
      await this.fetchFilterOptions();
      if (!this._isMounted) return;
      this.setState({ connectionStatus: "connected", retryCount: 0 }, () => {
        this.throttledNotify();
        this.throttledFetchData();
      });
    } catch (error: any) {
      if (!this._isMounted) return;
      this.setState({
        connectionStatus: "failed",
        error: `Initialization failed: ${error.message}`,
      });
    }
  };

  private fetchFilterOptions = async (): Promise<void> => {
    if (!this._isMounted) return;
    await this.refreshCascadingOptions();
  };

  private uniqueSorted = (arr: string[]): string[] => {
    return [...new Set(arr.map((s) => s.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  };

  private normalizeLoose = (value: string): string => {
    return String(value || "")
      .toLowerCase()
      .replace(/[’ʻ`]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  private normalizeRegionLookupKey = (value: string): string => {
    return this.normalizeLoose(value)
      .replace(/\bviloyati\b/g, "viloyat")
      .replace(/\bвилояти\b/g, "вилоят");
  };

  private getApostropheVariants = (value: string): string[] => {
    const base = String(value ?? "").trim();
    if (!base) return [];

    return Array.from(
      new Set(
        [
          base,
          base.replace(/[’ʻ`]/g, "'"),
          base.replace(/[’ʻ`]/g, "ʻ"),
          base.replace(/[’ʻ`]/g, "’"),
          base.replace(/[’ʻ`]/g, "‘"),
          base.replace(/[’ʻ`]/g, "ʼ"),
        ]
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  };

  private buildRegionValueVariants = (value: string): string[] => {
    const raw = String(value ?? "").trim();
    if (!raw) return [];

    const expanded = new Set<string>();
    const push = (candidate: string): void => {
      this.getApostropheVariants(candidate).forEach((variant) => {
        const clean = variant.trim();
        if (clean) expanded.add(clean);
      });
    };

    this.getApostropheVariants(raw).forEach((variant) => {
      push(variant);

      const lower = variant.toLowerCase();
      const isRepublic =
        lower.endsWith(" respublikasi") || lower.endsWith(" республикаси");

      if (isRepublic) return;

      if (/[^\x00-\x7F]/.test(variant)) {
        if (lower.endsWith(" вилояти")) {
          const stem = variant.slice(0, -" вилояти".length).trim();
          push(stem);
          push(`${stem} вилоят`);
        } else if (lower.endsWith(" вилоят")) {
          const stem = variant.slice(0, -" вилоят".length).trim();
          push(stem);
          push(`${stem} вилояти`);
        }
      } else if (lower.endsWith(" viloyati")) {
        const stem = variant.slice(0, -" viloyati".length).trim();
        push(stem);
        push(`${stem} viloyat`);
      } else if (lower.endsWith(" viloyat")) {
        const stem = variant.slice(0, -" viloyat".length).trim();
        push(stem);
        push(`${stem} viloyati`);
      }
    });

    return Array.from(expanded);
  };

  private mergeUniqueByNormalizedKey = (
    primary: string[],
    secondary: string[],
  ): string[] => {
    const merged = new Map<string, string>();
    const add = (value: string): void => {
      const clean = String(value ?? "").trim();
      if (!clean) return;
      const key = this.normalizeRegionLookupKey(clean);
      if (!key || merged.has(key)) return;
      merged.set(key, clean);
    };

    primary.forEach(add);
    secondary.forEach(add);

    return Array.from(merged.values());
  };

  private resolveViloyatForApi = (
    value: string,
    options: string[] = this.state.viloyat,
  ): string => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    const cleanOptions = (Array.isArray(options) ? options : [])
      .map((option) => String(option ?? "").trim())
      .filter(Boolean);
    if (!cleanOptions.length) return raw;

    const rawKey = this.normalizeRegionLookupKey(raw);
    const exactMatch = cleanOptions.find(
      (option) => this.normalizeRegionLookupKey(option) === rawKey,
    );
    if (exactMatch) return exactMatch;

    const candidateKeys = new Set(
      this.buildRegionValueVariants(raw)
        .map((candidate) => this.normalizeRegionLookupKey(candidate))
        .filter(Boolean),
    );
    const looseMatch = cleanOptions.find((option) =>
      candidateKeys.has(this.normalizeRegionLookupKey(option)),
    );

    if (looseMatch) return looseMatch;

    const nRaw = this.normalizeRegionLookupKey(raw);
    const isQashqadaryo =
      nRaw.includes("qashqad") ||
      nRaw.includes("qashkad") ||
      nRaw.includes("kashkad") ||
      nRaw.includes("қашқад") ||
      nRaw.includes("кашкад");

    if (isQashqadaryo) {
      const qashOptions = cleanOptions.filter((option) => {
        const n = this.normalizeRegionLookupKey(option);
        return (
          n.includes("qashqad") ||
          n.includes("qashkad") ||
          n.includes("kashkad") ||
          n.includes("қашқад") ||
          n.includes("кашкад")
        );
      });

      const canonicalQash =
        qashOptions.find((option) =>
          this.normalizeRegionLookupKey(option).endsWith("viloyat"),
        ) || qashOptions[0];
      if (canonicalQash) return canonicalQash;
    }

    return raw;
  };

  private escapeSqlText = (value: string): string => {
    return String(value ?? "").replace(/'/g, "''");
  };

  private buildTextValueVariants = (
    value: string,
    kind: "generic" | "region" = "generic",
  ): string[] => {
    return kind === "region"
      ? this.buildRegionValueVariants(value)
      : this.getApostropheVariants(value);
  };

  private buildExactTextWhere = (
    fieldName: string,
    value: string,
    kind: "generic" | "region" = "generic",
  ): string => {
    const clauses = this.buildTextValueVariants(value, kind)
      .map((variant) => `${fieldName} = '${this.escapeSqlText(variant)}'`)
      .filter(Boolean);

    if (!clauses.length) return "";
    if (clauses.length === 1) return clauses[0];
    return `(${clauses.join(" OR ")})`;
  };

  private combineWhereClauses = (
    ...clauses: Array<string | null | undefined>
  ): string => {
    const clean = clauses
      .map((clause) => String(clause ?? "").trim())
      .filter(Boolean);

    if (!clean.length) return "";
    if (clean.length === 1) return clean[0];
    return clean.map((clause) => `(${clause})`).join(" AND ");
  };

  private buildContextFilterWhere = (layer: FeatureLayer): string => {
    const selectedViloyat = this.resolveViloyatForApi(
      this.state.selectedViloyat,
    );
    if (!selectedViloyat) return "";

    const viloyatField =
      this.resolveFieldName(layer, "viloyat") ||
      this.resolveFieldName(layer, "viloyat_nom") ||
      this.resolveFieldName(layer, "region") ||
      null;

    // Return "" if no viloyat-like field exists in this layer.
    // Region-specific layers (e.g. Water_Kashkadarya_region_2025_year) often have
    // no viloyat column — probing a non-existent field causes a server error that
    // gets swallowed as matched=0, hiding valid GlobalID matches entirely.
    if (!viloyatField) return "";
    return this.buildExactTextWhere(viloyatField, selectedViloyat, "region");
  };

  private pickPreferredOption = (
    options: string[],
    preferred: string,
    aliases: string[] = [],
  ): string => {
    const cleaned = (Array.isArray(options) ? options : []).filter(Boolean);
    if (!cleaned.length) return "";

    if (preferred && cleaned.includes(preferred)) return preferred;

    const targetSet = new Set(
      [preferred, ...aliases]
        .map((s) => this.normalizeLoose(s))
        .filter(Boolean),
    );

    const normalizedMatch = cleaned.find((opt) =>
      targetSet.has(this.normalizeLoose(opt)),
    );
    return normalizedMatch || "";
  };

  private pickPreferredYear = (years: string[]): string => {
    if (years.includes(this.state.selectedYil)) return this.state.selectedYil;
    if (years.includes(DEFAULT_INITIAL_YEAR)) return DEFAULT_INITIAL_YEAR;
    return years.length ? years[years.length - 1] : "";
  };

  private buildFiltersParams = (
    overrides?: Partial<{
      viloyat: string;
      tuman: string;
      ekin_turi: string;
      mavsum: string;
      yil: string;
    }>,
    onlyYear: boolean = false,
  ): string => {
    const params = new URLSearchParams();

    const yil = (overrides?.yil ?? this.state.selectedYil ?? "").trim();
    const rawViloyat = (
      overrides?.viloyat ??
      this.state.selectedViloyat ??
      ""
    ).trim();
    const viloyat = this.resolveViloyatForApi(rawViloyat);
    const tuman = (overrides?.tuman ?? this.state.selectedTuman ?? "").trim();
    const ekin_turi = (
      overrides?.ekin_turi ??
      this.state.selectedEkin_turi ??
      ""
    ).trim();
    const mavsum = (
      overrides?.mavsum ??
      this.state.selectedMavsum ??
      ""
    ).trim();

    if (yil) params.set("yil", yil);

    if (!onlyYear) {
      if (viloyat) params.set("viloyat", viloyat);
      if (tuman) params.set("tuman", tuman);
      if (ekin_turi) params.set("ekin_turi", ekin_turi);
      if (mavsum) params.set("mavsum", mavsum);
    }

    return params.toString();
  };

  /** ✅ Build filters params for dropdown options (only yil + viloyat, no tuman/crop filters) */
  private buildFiltersParamsForDropdowns = (
    overrides?: Partial<{
      viloyat: string;
      yil: string;
    }>,
    onlyYear: boolean = false,
  ): string => {
    const params = new URLSearchParams();

    const yil = (overrides?.yil ?? this.state.selectedYil ?? "").trim();
    const rawViloyat = (
      overrides?.viloyat ??
      this.state.selectedViloyat ??
      ""
    ).trim();
    const viloyat = this.resolveViloyatForApi(rawViloyat);

    if (yil) params.set("yil", yil);

    if (!onlyYear) {
      if (viloyat) params.set("viloyat", viloyat);
      // NOTE: We intentionally do NOT pass tuman or crop filters here
      // so that all available options are shown in dropdowns
    }

    return params.toString();
  };

  private fetchDropdownOptions = async (
    onlyYear: boolean = false,
    overrides?: Partial<{
      viloyat: string;
      yil: string;
    }>,
  ): Promise<FilterOptions> => {
    const qs = this.buildFiltersParamsForDropdowns(overrides, onlyYear);
    const url = `${API_BASE_URL}${API_ENDPOINTS.chartFilters}${
      qs ? `?${qs}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "omit",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(
        `HTTP ${res.status}: ${res.statusText}${
          t ? ` — ${t.slice(0, 200)}` : ""
        }`,
      );
    }

    const json = (await res.json()) as Partial<ApiFiltersResponse>;

    // Merge viloyat from multiple reliable sources
    let mergedViloyat: string[] = Array.isArray(json?.viloyat)
      ? json!.viloyat
      : [];
    if (!onlyYear) {
      const [directoryViloyat, locationRegions] = await Promise.all([
        this.fetchDirectoryList("Region", "uz"),
        this.fetchLocationRegions(),
      ]);
      mergedViloyat = this.mergeUniqueByNormalizedKey(
        mergedViloyat,
        directoryViloyat,
      );
      mergedViloyat = this.mergeUniqueByNormalizedKey(
        mergedViloyat,
        locationRegions,
      );
    }

    return {
      yil: this.uniqueSorted(
        (Array.isArray(json?.yil) ? json!.yil : []).map(String),
      ),
      viloyat: this.uniqueSorted(mergedViloyat),
      tuman: this.uniqueSorted(Array.isArray(json?.tuman) ? json!.tuman : []),
      ekin_turi: this.uniqueSorted(
        Array.isArray(json?.ekin_turi) ? json!.ekin_turi : [],
      ),
      mavsum: this.uniqueSorted(
        Array.isArray(json?.mavsum) ? json!.mavsum : [],
      ),
    };
  };

  private refreshCascadingOptions = async (): Promise<void> => {
    if (!this._isMounted) return;

    this.setState({ loadingFilters: true, error: null });

    try {
      const yearSeedOptions = await this.fetchDropdownOptions(true, {
        viloyat: "",
      });
      if (!this._isMounted) return;

      const selectedYil = this.pickPreferredYear(yearSeedOptions.yil);

      if (!selectedYil) {
        this.setState({
          yil: yearSeedOptions.yil,
          selectedYil: "",
          selectedViloyat: "",
          viloyat: [],
          tuman: [],
          ekin_turi: [],
          mavsum: [],
          loadingFilters: false,
          error: null,
        });
        return;
      }

      // Step 2: Fetch options - pass the SELECTED viloyat so tumans/ekin_turi/mavsum are viloyat-specific
      // (viloyat dropdown itself is always merged from directories + /location/regions)
      const opts = await this.fetchDropdownOptions(false, {
        yil: selectedYil,
        // Do NOT override viloyat to "" — let it use this.state.selectedViloyat
        // so that xy-chart-filters returns viloyat-specific tumans/ekin_turi/mavsum
      });
      if (!this._isMounted) return;

      console.log("[refreshCascadingOptions] Step 2 result:", {
        stateViloyat: this.state.selectedViloyat,
        selectedYil,
        viloyatOptions: opts.viloyat,
        tumanCount: opts.tuman?.length,
        tumanSample: opts.tuman?.slice(0, 5),
      });

      const selectedViloyatFromState = this.resolveViloyatForApi(
        this.state.selectedViloyat,
        opts.viloyat,
      );
      const selectedViloyat =
        selectedViloyatFromState ||
        this.pickPreferredOption(opts.viloyat, DEFAULT_INITIAL_REGION, [
          ...DEFAULT_INITIAL_REGION_ALIASES,
        ]) ||
        opts.viloyat[0] ||
        "";

      // Step 3: If viloyat is selected, also fetch tumans from /location/districts
      // and merge — xy-chart-filters may not return all tumans for every viloyat
      if (selectedViloyat) {
        const resolvedViloyat = this.resolveViloyatForApi(
          selectedViloyat,
          opts.viloyat,
        );
        const locationDistricts = await this.fetchLocationDistricts(
          resolvedViloyat || selectedViloyat,
        );
        if (locationDistricts.length) {
          opts.tuman = this.uniqueSorted(
            this.mergeUniqueByNormalizedKey(opts.tuman, locationDistricts),
          );
        }
      }

      const selectedTuman =
        this.state.selectedTuman &&
        opts.tuman.includes(this.state.selectedTuman)
          ? this.state.selectedTuman
          : "";
      const selectedEkin_turi =
        this.state.selectedEkin_turi &&
        opts.ekin_turi.includes(this.state.selectedEkin_turi)
          ? this.state.selectedEkin_turi
          : "";
      const selectedMavsum =
        this.state.selectedMavsum &&
        opts.mavsum.includes(this.state.selectedMavsum)
          ? this.state.selectedMavsum
          : "";

      this.setState({
        ...opts,
        selectedYil,
        selectedViloyat,
        selectedTuman,
        selectedEkin_turi,
        selectedMavsum,
        loadingFilters: false,
        error: null,
      });
    } catch (e: any) {
      if (!this._isMounted) return;
      this.setState({
        loadingFilters: false,
        error: `Failed to load filters: ${
          e?.message ? String(e.message) : String(e)
        }`,
      });
    }
  };

  private handleReset = (): void => {
    console.log("[DEBUG] handleReset called - resetAllWidgets event triggered");
    if (!this._isMounted) return;
    void this.clearMapSelectionAndZoomOut();

    this.setState(
      {
        selectedYil: DEFAULT_INITIAL_YEAR,
        selectedViloyat: "",
        selectedTuman: "",
        selectedEkin_turi: "",
        selectedMavsum: "",
        viewMode: "chart",

        chartData: [],
        rawApiData: null,
        xRange: null,
        yRange: null,
        totalPoints: 0,
        maxBinCount: 1,
        nonEmptyBins: 0,

        lassoEnabled: false,
        lassoDrawing: false,
        lassoPath: [],
        selectedBinKeys: [],

        rawPointsLoading: false,
        rawPointsError: null,
        rawPoints: [],
        rawPreviewOpen: false,

        error: null,
        openAxisMenu: null,

        mapSelectedCount: 0,
        mapError: null,
      },
      async () => {
        await this.fetchFilterOptions();
        this.throttledNotify();
        this.throttledFetchData();
      },
    );
  };

  /** ✅ Clear widget selection state only (no map operations) */
  private clearSelectionStateOnly = (): void => {
    this.setState({
      viewMode: "chart",
      selectedBinKeys: [],
      lassoPath: [],
      lassoDrawing: false,
      rawPoints: [],
      rawPointsError: null,
      rawPointsLoading: false,
      rawPreviewOpen: false,
      focusedGlobalId: "",
      mapSelectedCount: 0,
      mapError: null,
    });
  };
  /** ✅ Internal clear (used by filter changes): hides polygons again */
  private clearSelection = (): void => {
    try {
      this.clearMapSelection();
      this.clearSelectionStateOnly();
    } catch (error: any) {
      console.warn("[clearSelection] Error:", error);
    }
  };

  /** ✅ Clear selection button: show ALL polygons for the CURRENT YEAR layer (and hide other year layers) */
  private showAllPolygonsForCurrentYearInMap = async (
    yearOverride?: string,
  ): Promise<void> => {
    if (!this._isMounted) return;

    const year = String(yearOverride ?? this.state.selectedYil ?? "").trim();

    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    if (!view?.map) {
      this.setState({
        mapError: "No connected Map widget / view yet.",
        mapSelectedCount: 0,
      });
      return;
    }

    // If no year selected -> keep the default "hidden" rule
    if (!year) {
      await this.hidePolygonLayerUntilSelection();
      this.setState({ mapError: null, mapSelectedCount: 0 });
      return;
    }

    // Resolve which DS/layer/url is the source of truth for this year
    const resolved = await this.resolveSelectedPolygonSource(year);
    const targetUrl = this.normalizeUrl(
      String(resolved?.url || (resolved?.layer as any)?.url || ""),
    );
    if (!resolved || !targetUrl) {
      this.setState({
        mapError:
          "Cannot resolve the polygon layer for the selected year. " +
          "Make sure widget settings use real FeatureLayer data sources (one per year).",
        mapSelectedCount: 0,
      });
      return;
    }

    // 1) Hide all OTHER selected DS polygon layers (other years) in the connected map
    const selected = this.toPlainArray<any>(this.props.useDataSources);
    for (const useDs of selected) {
      try {
        const url = this.getLayerUrlFromUseDataSource(useDs) || "";
        const nUrl = this.normalizeUrl(url);
        if (nUrl && nUrl !== targetUrl) {
          const other = this.findFeatureLayerInMapByUrl(url);
          if (other) {
            other.visible = false;
            other.definitionExpression = "1=0";
          }
        }
      } catch {
        // ignore per-layer errors
      }
    }

    // 2) Clear selection graphics (if any)
    try {
      const gl = view.map.findLayerById(
        SELECTION_LAYER_ID,
      ) as __esri.GraphicsLayer;
      if (gl) gl.removeAll();
    } catch {}

    // 3) Ensure current-year polygon layer exists in map, then show ALL polygons
    const layer = await this.ensurePolygonLayerInMapAfterLasso(year);
    if (!layer) {
      this.setState({
        mapError:
          "Could not create/find the polygon FeatureLayer from the selected DataSource. " +
          "Make sure you selected real FeatureLayer data sources in the widget settings.",
        mapSelectedCount: 0,
      });
      return;
    }

    try {
      await layer.load();
    } catch {}

    try {
      (layer as any).minScale = 0;
      (layer as any).maxScale = 0;
      (layer as any).opacity = 0.9;
    } catch {}

    try {
      layer.definitionExpression = "1=1"; // show everything for that layer
      layer.visible = true;
    } catch (e: any) {
      this.setState({
        mapError: `Failed to show polygons: ${e?.message ?? e}`,
        mapSelectedCount: 0,
      });
      return;
    }

    this.setState({ mapError: null, mapSelectedCount: 0 });
  };

  /** ✅ Button behavior: Clear selection should hide all polygons (return to default state) */
  private handleClearSelectionClick = (): void => {
    void (async () => {
      // Always hide polygons when clearing - return to initial state (no polygons shown)
      await this.hidePolygonLayerUntilSelection();

      // Clear all selection state
      await this.clearMapSelectionAndZoomOut();
      this.clearSelectionStateOnly();
    })();
  };

  /** ✅ Clear all filters and reset the entire widget to default state */
  private handleClearAllFilters = (): void => {
    console.log("[DEBUG] handleClearAllFilters called");
    if (!this._isMounted) return;
    void this.clearMapSelectionAndZoomOut();

    this.setState(
      {
        selectedYil: DEFAULT_INITIAL_YEAR,
        selectedViloyat: "",
        selectedTuman: "",
        selectedEkin_turi: "",
        selectedMavsum: "",
        selectedGroupBy: "fermer_nom",
        selectedGroupedItem: null,
        viewMode: "chart",
        focusedGlobalId: "",

        chartData: [],
        rawApiData: null,
        xRange: null,
        yRange: null,
        totalPoints: 0,
        maxBinCount: 1,
        nonEmptyBins: 0,

        lassoEnabled: false,
        lassoDrawing: false,
        lassoPath: [],
        selectedBinKeys: [],

        rawPointsLoading: false,
        rawPointsError: null,
        rawPoints: [],
        rawPreviewOpen: false,

        error: null,
        openAxisMenu: null,

        mapSelectedCount: 0,
        mapError: null,
      },
      async () => {
        await this.fetchFilterOptions();
        this.throttledNotify();
        this.throttledFetchData();
      },
    );
  };

  private focusPolygonFromList = async (globalid: string): Promise<void> => {
    const gid = String(globalid || "").trim();
    if (!gid) return;

    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    if (!view?.map) {
      this.setState({
        mapError: "No connected Map widget / view yet.",
        mapSelectedCount: 0,
      });
      return;
    }

    const year = String(this.state.selectedYil || "").trim();
    const layer = await this.ensurePolygonLayerInMapAfterLasso(year);
    if (!layer) {
      this.setState({
        mapError:
          "Could not create/find the polygon FeatureLayer for the selected year.",
        mapSelectedCount: 0,
      });
      return;
    }

    try {
      await layer.load();
    } catch {}

    // Your layer stores "{GUID}" strings, so always match BOTH variants
    const coreId = this.normalizeGuid(gid);
    const idFieldRaw = await this.resolveBestIdFieldForSourceIds(layer, [
      coreId,
    ]);
    const idField =
      this.resolveFieldName(layer, idFieldRaw) ||
      this.resolveFieldName(layer, "globalid") ||
      idFieldRaw;
    const values = this.guidVariants(coreId); // [GUID, {GUID}]
    const idWhere = this.buildWhereForIds(idField, values, 200);
    const contextWhere = this.buildContextFilterWhere(layer);
    let where = this.combineWhereClauses(idWhere, contextWhere);

    let matched = 0;
    try {
      // IMPORTANT: disable definitionExpression="1=0" during probe
      matched = await this.withDefinitionExpressionDisabled(layer, async () =>
        Number((await layer.queryFeatureCount({ where } as any)) ?? 0),
      );
    } catch {
      matched = 0;
    }

    // Fallback: if context filter gives 0, retry with ID-only WHERE
    if (matched <= 0 && contextWhere) {
      try {
        const idOnly = await this.withDefinitionExpressionDisabled(
          layer,
          async () =>
            Number(
              (await layer.queryFeatureCount({ where: idWhere } as any)) ?? 0,
            ),
        );
        if (idOnly > 0) {
          matched = idOnly;
          where = idWhere;
        }
      } catch {}
    }

    if (matched <= 0) {
      layer.visible = false;
      layer.definitionExpression = "1=0";
      this.setState({
        mapSelectedCount: 0,
        mapError: "Tanlangan polygon topilmadi.",
        focusedGlobalId: coreId,
      });
      return;
    }

    try {
      const gl = view.map.findLayerById(
        SELECTION_LAYER_ID,
      ) as __esri.GraphicsLayer;
      if (gl) gl.removeAll();
    } catch {}

    // Show only this polygon
    try {
      layer.definitionExpression = where;
      layer.visible = true;
    } catch (e: any) {
      this.setState({
        mapError: `Failed to apply polygon filter: ${e?.message ?? e}`,
        mapSelectedCount: 0,
      });
      return;
    }

    // ✅ Best zoom strategy: queryExtent (lightweight, avoids geometry failures)
    try {
      const ext = await layer.queryExtent({ where } as any);
      const extent = (ext as any)?.extent;
      if (extent) {
        await (view as any).goTo(extent.expand ? extent.expand(1.6) : extent, {
          duration: 450,
        });
        this.setState({
          activePolygonLayerId: layer.id,
          mapSelectedCount: matched,
          mapError: null,
          focusedGlobalId: coreId,
        });
        return;
      }
    } catch (e: any) {
      // fall through to heavier method
      console.warn("[focusPolygonFromList] queryExtent failed", e, {
        where,
        layerUrl: (layer as any)?.url,
        idField,
      });
    }

    // Fallback: queryFeatures (geometry) only if extent failed
    try {
      const fs = await layer.queryFeatures({
        where,
        outFields: [idField], // IMPORTANT: keep minimal to avoid “field not found”
        returnGeometry: true,
      } as any);

      const feats = (fs?.features || []) as __esri.Graphic[];
      if (feats.length) {
        await (view as any).goTo(feats.length === 1 ? feats[0] : feats, {
          duration: 450,
        });
        this.setState({
          activePolygonLayerId: layer.id,
          mapSelectedCount: matched,
          mapError: null,
          focusedGlobalId: coreId,
        });
        return;
      }

      this.setState({
        mapSelectedCount: 0,
        mapError: `Polygon not found for ${coreId}. Check field "${idField}" values format (expected {GUID}).`,
        focusedGlobalId: coreId,
      });
    } catch (e: any) {
      this.setState({
        mapSelectedCount: 0,
        mapError:
          `Zoom/query failed: ${e?.message ?? e}. ` +
          `This usually means the service blocks/limits query geometry. Try enabling Query on the FeatureLayer service.`,
        focusedGlobalId: coreId,
      });
    }
  };

  private restoreSelectedBinPolygons = async (): Promise<void> => {
    const ids = Array.from(
      new Set(
        (this.state.rawPoints || [])
          .map((p) => this.normalizeGuid(this.getRawPointGlobalId(p)))
          .filter(Boolean),
      ),
    );

    if (!ids.length) {
      this.clearMapSelection();
      this.setState({ mapSelectedCount: 0, mapError: null });
      return;
    }

    await this.applySelectionToMap(ids, this.state.selectedYil);
  };

  private getActiveYear = (yearOverride?: string): string => {
    return String(yearOverride ?? this.state.selectedYil ?? "").trim();
  };

  private handleYilChange = async (selectedYil: string): Promise<void> => {
    if (!this._isMounted || this.state.connectionStatus !== "connected") return;
    this.clearMapSelection();
    void this.hidePolygonLayerUntilSelection();

    this.setState(
      {
        selectedYil,

        selectedViloyat: "",
        selectedTuman: "",
        selectedEkin_turi: "",
        selectedMavsum: "",

        viewMode: "chart",
        chartData: [],
        rawApiData: null,
        xRange: null,
        yRange: null,
        totalPoints: 0,
        maxBinCount: 1,
        nonEmptyBins: 0,

        lassoEnabled: false,
        lassoDrawing: false,
        lassoPath: [],
        selectedBinKeys: [],
        rawPoints: [],
        rawPointsError: null,
        rawPointsLoading: false,
        rawPreviewOpen: false,

        error: null,
        loading: true,

        mapSelectedCount: 0,
        mapError: null,
      },
      async () => {
        await this.refreshCascadingOptions();
        this.throttledNotify();
        this.throttledFetchData();
      },
    );
  };

  private handleViloyatChange = (selectedViloyat: string): void => {
    if (!this._isMounted || this.state.connectionStatus !== "connected") return;
    this.clearMapSelection();

    this.setState(
      {
        selectedViloyat,
        selectedTuman: "",
        selectedEkin_turi: "",

        viewMode: "chart",
        lassoEnabled: false,
        lassoDrawing: false,
        lassoPath: [],
        selectedBinKeys: [],
        rawPoints: [],
        rawPointsError: null,
        rawPointsLoading: false,
        rawPreviewOpen: false,

        loading: true,
        error: null,

        mapSelectedCount: 0,
        mapError: null,
      },
      async () => {
        await this.refreshCascadingOptions();
        this.throttledNotify();
        this.throttledFetchData();
      },
    );
  };
  /** ✅ Create a stable key for a UseDataSource (so we can cache layers) */
  private useDsKey = (useDs: any): string => {
    const a = String(useDs?.dataSourceId || "");
    const b = String(useDs?.mainDataSourceId || "");
    const c = String(useDs?.rootDataSourceId || "");
    const v = String(useDs?.dataViewId || "");
    return (
      [a, b, c, v].filter(Boolean).join("|") || JSON.stringify(useDs || {})
    );
  };

  /** ✅ Best-effort label for matching year */
  private getUseDsLabel = async (useDs: any): Promise<string> => {
    try {
      const ds = await this.dsManager.createDataSourceByUseDataSource(
        Immutable(useDs) as IMUseDataSource,
      );
      const json = (ds as any)?.getDataSourceJson?.();
      return String(
        json?.label || json?.name || (ds as any)?.getLabel?.() || ds?.id || "",
      ).trim();
    } catch {
      return "";
    }
  };
  /** ✅ detect GUID / GlobalID field */
  /** ✅ detect GUID / GlobalID field (ArcGIS types: esriFieldTypeGUID / esriFieldTypeGlobalID) */
  private isGuidLikeField = (
    layer: FeatureLayer,
    fieldName: string,
  ): boolean => {
    const f = layer.fields?.find(
      (ff) => ff.name.toLowerCase() === String(fieldName || "").toLowerCase(),
    );
    if (!f) return false;

    const t = String((f as any).type || "").toLowerCase();
    // Examples:
    // - esriFieldTypeGUID
    // - esriFieldTypeGlobalID
    return t.includes("guid") || t.includes("globalid");
  };

  private getIdFieldCandidates = (layer: FeatureLayer): string[] => {
    const preferred = [
      this.getGlobalIdField(),
      "idd",
      "id",
      this.getNameField(),
      "name",
      "gid",
    ];

    // 1) Fields present in layer.fields
    const resolvedFromFields = preferred
      .map((field) => this.resolveFieldName(layer, field))
      .filter(Boolean) as string[];

    // 2) GlobalID is a reserved ArcGIS field ALWAYS queryable via REST
    //    even when NOT listed in layer.fields (common for hosted feature services).
    //    Force it unconditionally so it is always probed.
    const metaGlobalId = String((layer as any)?.globalIdField || "").trim();
    const forceGlobal = [
      metaGlobalId || "GlobalID", // use what the layer reports; fallback = "GlobalID"
      "globalid", // lowercase alias — ArcGIS REST is case-insensitive
    ].filter(Boolean);

    // 3) objectId — low-priority fallback (integer, usually won't match GUID)
    const metaObjectId = String((layer as any)?.objectIdField || "").trim();
    const forceObjectId = metaObjectId ? [metaObjectId] : [];

    // Order: known field matches first, then GlobalID, then objectId last
    return Array.from(
      new Set([...resolvedFromFields, ...forceGlobal, ...forceObjectId]),
    );
  };

  private async withDefinitionExpressionDisabled<T>(
    layer: FeatureLayer,
    fn: () => Promise<T>,
  ): Promise<T> {
    const prev = (layer as any)?.definitionExpression;
    const shouldReset = typeof prev === "string" && prev.trim().length > 0;

    if (shouldReset) {
      try {
        (layer as any).definitionExpression = "";
      } catch {
        // ignore
      }
    }

    try {
      return await fn();
    } finally {
      if (shouldReset) {
        try {
          (layer as any).definitionExpression = prev;
        } catch {
          // ignore
        }
      }
    }
  }

  private resolveBestIdFieldForSourceIds = async (
    layer: FeatureLayer,
    sourceIds: string[],
  ): Promise<string> => {
    const candidates = this.getIdFieldCandidates(layer);
    if (!candidates.length) return this.getGlobalIdField() || "globalid";

    const normalized = (sourceIds || [])
      .map((id) => this.normalizeGuid(String(id || "")))
      .filter(Boolean);
    if (!normalized.length) return candidates[0];

    const probeValues = [
      ...new Set(
        normalized.slice(0, 20).flatMap((id) => this.guidVariants(id)),
      ),
    ];
    if (!probeValues.length) return candidates[0];

    for (const field of candidates) {
      const where = this.buildWhereForIds(field, probeValues, 40);
      try {
        const count = await this.withDefinitionExpressionDisabled(
          layer,
          async () => {
            return Number(
              (await layer.queryFeatureCount({ where } as any)) ?? 0,
            );
          },
        );

        if (count > 0) return field;
      } catch {
        // try next candidate
      }
    }

    return candidates[0];
  };

  /** ✅ Pick which selected layer to use for the current selectedYil (2024/2025) */
  private scoreUseDataSourceForCurrentContext = async (
    useDs: any,
    year: string,
  ): Promise<number> => {
    let score = 0;

    try {
      const label = await this.getUseDsLabel(useDs);
      if (year && label && label.includes(year)) score += 10;

      const ds = await this.dsManager.createDataSourceByUseDataSource(
        Immutable(useDs) as IMUseDataSource,
      );
      const json = (ds as any)?.getDataSourceJson?.() ?? null;
      const layer =
        (ds as any)?.layer ||
        (typeof (ds as any)?.getLayer === "function"
          ? await (ds as any).getLayer()
          : null);

      const url = String(((layer as any)?.url || json?.url) ?? "").trim();
      const geometryType = String(
        (layer as any)?.geometryType || (json as any)?.geometryType || "",
      ).toLowerCase();
      if (geometryType.includes("polygon")) score += 8;

      const fields =
        (layer as any)?.fields ||
        (ds as any)?.getSchema?.()?.fields ||
        (json as any)?.schema?.fields ||
        [];

      const fieldNames = Array.isArray(fields)
        ? fields.map((f) => String((f as any)?.name || "").toLowerCase())
        : Object.keys(fields || {}).map((k) => String(k || "").toLowerCase());

      if (fieldNames.includes("viloyat") || fieldNames.includes("viloyat_nom"))
        score += 4;
      if (fieldNames.includes("tuman") || fieldNames.includes("tuman_nom"))
        score += 2;
      if (
        fieldNames.includes("globalid") ||
        fieldNames.includes("idd") ||
        fieldNames.includes("id") ||
        fieldNames.includes("name")
      )
        score += 3;

      const selectedViloyat = this.resolveViloyatForApi(
        this.state.selectedViloyat,
      );
      if (selectedViloyat && url) {
        const probeLayer = new FeatureLayer({ url });
        try {
          await probeLayer.load();
          const viloyatField =
            this.resolveFieldName(probeLayer, "viloyat") ||
            this.resolveFieldName(probeLayer, "viloyat_nom") ||
            this.resolveFieldName(probeLayer, "region");

          if (viloyatField) {
            const where = this.buildExactTextWhere(
              viloyatField,
              selectedViloyat,
              "region",
            );
            const count = Number(
              (await probeLayer.queryFeatureCount({ where } as any)) ?? 0,
            );
            if (count > 0) score += 30;
            else score -= 15;
          }
        } catch {
          // ignore probe errors
        }
      }
    } catch {
      // keep accumulated score
    }

    return score;
  };

  private pickUseDataSourceForYear = async (
    year?: string,
  ): Promise<any | null> => {
    const list = this.toPlainArray<any>(this.props.useDataSources);
    if (!list.length) return null;

    const y = String(year ?? this.state.selectedYil ?? "").trim();
    const scored: Array<{ useDs: any; score: number }> = [];

    for (const useDs of list) {
      const score = await this.scoreUseDataSourceForCurrentContext(useDs, y);
      scored.push({ useDs, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.useDs || list[0];
  };

  /**
   * ✅ Get a FeatureLayer for querying polygons from the selected DataSourceSelector layer.
   * This does NOT add anything to the map. It's query-only (perfect for your "don't show polygons" rule).
   */
  private getQueryFeatureLayerFromSelectedDs = async (
    year?: string,
  ): Promise<FeatureLayer | null> => {
    const useDs = await this.pickUseDataSourceForYear(year);
    if (!useDs) return null;

    const key = this.useDsKey(useDs);
    const cached = this._queryLayerByUseDsKey.get(key);
    if (cached) return cached;

    try {
      const ds = await this.dsManager.createDataSourceByUseDataSource(
        Immutable(useDs) as IMUseDataSource,
      );
      const json = (ds as any)?.getDataSourceJson?.() ?? null;

      const existingLayer =
        (ds as any)?.layer ||
        (typeof (ds as any)?.getLayer === "function"
          ? await (ds as any).getLayer()
          : null);

      const url = String(
        ((existingLayer as any)?.url || json?.url) ?? "",
      ).trim();
      if (url) {
        // Use a fresh query layer to avoid shared definitionExpression side effects.
        const fl = new FeatureLayer({ url });
        this._queryLayerByUseDsKey.set(key, fl);
        return fl;
      }

      console.warn(
        "[getQueryFeatureLayerFromSelectedDs] DS has no layer and no url",
        { useDs, json, dsId: ds?.id },
      );
      return null;
    } catch (e) {
      console.warn("[getQueryFeatureLayerFromSelectedDs] failed", e, useDs);
      return null;
    }
  };

  private handleTumanChange = (selectedTuman: string): void => {
    if (!this._isMounted || this.state.connectionStatus !== "connected") return;

    // ✅ Always clear map and reset to empty state when filter changes
    this.clearMapSelection();
    void this.hidePolygonLayerUntilSelection(true); // force=true to ignore current selection

    // If tuman is selected and current groupBy is "tuman", switch to fermer_nom
    const newGroupBy =
      selectedTuman && this.state.selectedGroupBy === "tuman"
        ? "fermer_nom"
        : this.state.selectedGroupBy;

    this.setState(
      {
        selectedTuman,
        selectedGroupBy: newGroupBy,
        selectedGroupedItem: null, // ✅ Clear grouped item selection
        focusedGlobalId: "", // ✅ Clear focused polygon
        // NOTE: Don't reset selectedEkin_turi here - let it persist if still available
        // refreshCascadingOptions will validate and clear it if no longer available

        viewMode: "chart",
        lassoEnabled: false,
        lassoDrawing: false,
        lassoPath: [],
        selectedBinKeys: [],
        rawPoints: [],
        rawPointsError: null,
        rawPointsLoading: false,
        rawPreviewOpen: false,
        mapSelectedCount: 0,
        mapError: null,

        loading: true,
        error: null,
      },
      async () => {
        await this.refreshCascadingOptions();
        this.throttledNotify();
        this.throttledFetchData();
      },
    );
  };

  private handleEkin_turiChange = (selectedEkin_turi: string): void => {
    if (!this._isMounted || this.state.connectionStatus !== "connected") return;

    // ✅ Always clear map and reset to empty state when filter changes
    this.clearMapSelection();
    void this.hidePolygonLayerUntilSelection(true); // force=true to ignore current selection

    // If ekin_turi is selected and current groupBy is "ekin_turi", switch to fermer_nom
    const newGroupBy =
      selectedEkin_turi && this.state.selectedGroupBy === "ekin_turi"
        ? "fermer_nom"
        : this.state.selectedGroupBy;

    this.setState(
      {
        selectedEkin_turi,
        selectedGroupBy: newGroupBy,
        selectedGroupedItem: null, // ✅ Clear grouped item selection
        focusedGlobalId: "", // ✅ Clear focused polygon

        viewMode: "chart",
        lassoEnabled: false,
        lassoDrawing: false,
        lassoPath: [],
        selectedBinKeys: [],
        rawPoints: [],
        rawPointsError: null,
        rawPointsLoading: false,
        rawPreviewOpen: false,
        mapSelectedCount: 0,
        mapError: null,

        loading: true,
        error: null,
      },
      async () => {
        await this.refreshCascadingOptions();
        this.throttledNotify();
        this.throttledFetchData();
      },
    );
  };

  private handleMavsumChange = (selectedMavsum: string): void => {
    if (!this._isMounted || this.state.connectionStatus !== "connected") return;
    this.clearMapSelection();

    this.setState(
      {
        selectedMavsum,

        viewMode: "chart",
        lassoEnabled: false,
        lassoDrawing: false,
        lassoPath: [],
        selectedBinKeys: [],
        rawPoints: [],
        rawPointsError: null,
        rawPointsLoading: false,
        rawPreviewOpen: false,

        loading: true,
        error: null,

        mapSelectedCount: 0,
        mapError: null,
      },
      async () => {
        await this.refreshCascadingOptions();
        this.throttledNotify();
        this.throttledFetchData();
      },
    );
  };
  /** ✅ Read map polygon layer settings from widget config */
  /** ✅ Polygon layer URL comes from DataSourceSelector first */
  private getPolygonLayerUrl = (): string => {
    const dsUrl = this.getSelectedLayerUrlFromDataSource();
    if (dsUrl) return dsUrl;

    // fallback (optional): manual URL if you still keep it in config
    const cfgUrl = (this.props.config?.featureLayerUrl ?? "").toString().trim();
    return cfgUrl;
  };

  private getGlobalIdField = (): string => {
    return (
      (this.props.config?.globalIdField ?? "globalid").toString().trim() ||
      "globalid"
    );
  };

  private getNameField = (): string => {
    return (this.props.config?.nameField ?? "name").toString().trim() || "name";
  };
  /** ✅ HARD RULE: never render polygons until we have globalids from API */
  /** ✅ HARD RULE: hide ALL selected DS polygon layers in the connected map until we have IDs */
  /** @param force - if true, skip hasActiveSelection check (used when filter changes) */
  private hidePolygonLayerUntilSelection = async (
    force = false,
  ): Promise<void> => {
    // ✅ Skip if we have active selection or focused polygon (unless forced)
    if (!force) {
      const hasActiveSelection =
        this.state.mapSelectedCount > 0 ||
        this.state.selectedBinKeys?.length > 0 ||
        this.state.rawPoints?.length > 0 ||
        this.state.focusedGlobalId?.trim();

      if (hasActiveSelection) {
        console.log("[HIDE DEBUG] Skipping hide - has active selection/focus");
        return;
      }
    }

    console.log("[HIDE DEBUG] hidePolygonLayerUntilSelection called", {
      force,
    });
    try {
      const jmv = this.state.jimuMapView;
      const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
      if (!view?.map) {
        console.log("[HIDE DEBUG] No view/map found");
        return;
      }

      const selected = this.toPlainArray<any>(this.props.useDataSources);
      console.log("[HIDE DEBUG] useDataSources count:", selected.length);
      if (!selected.length) return;

      for (const useDs of selected) {
        try {
          const ds = await this.dsManager.createDataSourceByUseDataSource(
            Immutable(useDs) as IMUseDataSource,
          );
          const dsJson = (ds as any)?.getDataSourceJson?.() ?? null;

          const lyr =
            (ds as any)?.layer ||
            (typeof (ds as any)?.getLayer === "function"
              ? await (ds as any).getLayer()
              : null);

          const url = String(
            (lyr as any)?.url || (dsJson as any)?.url || "",
          ).trim();

          // If the actual layer instance is in map
          if (lyr && (view.map.layers as any)?.includes?.(lyr)) {
            (lyr as FeatureLayer).visible = false;
            (lyr as FeatureLayer).definitionExpression = "1=0";
            continue;
          }

          // Else try by URL
          if (url) {
            const inMap = this.findFeatureLayerInMapByUrl(url);
            if (inMap) {
              inMap.visible = false;
              inMap.definitionExpression = "1=0";
            }
          }
        } catch {
          // ignore per-layer failures
        }
      }
    } catch {
      // silent by design
    }
  };

  /** ✅ Create/cached FeatureLayer ONLY for querying (never added to map). */
  private getOrCreatePolygonQueryLayer = (
    urlOverride?: string,
  ): FeatureLayer | null => {
    const url = (urlOverride ?? this.getPolygonLayerUrl() ?? "")
      .toString()
      .trim();
    if (!url) return null;

    if (this._polygonQueryLayer && this._polygonQueryLayerUrl === url)
      return this._polygonQueryLayer;

    this._polygonQueryLayer = new FeatureLayer({
      url,
      // IMPORTANT: no definitionExpression here!
    });
    this._polygonQueryLayerUrl = url;
    return this._polygonQueryLayer;
  };
  /** ✅ Query polygons by GlobalIDs in chunks (avoids maxRecordCount / URL limits). */
  private queryPolygonsByIdsChunked = async (
    layer: FeatureLayer,
    idField: string,
    ids: string[],
    outFields: string[],
  ): Promise<__esri.Graphic[]> => {
    const clean = [
      ...new Set(ids.map((v) => String(v || "").trim()).filter(Boolean)),
    ];
    if (!clean.length) return [];

    const chunks = this.chunkArray(clean, 80); // safe chunk size for GUID IN lists
    const all: __esri.Graphic[] = [];

    await this.withDefinitionExpressionDisabled(layer, async () => {
      for (const chunk of chunks) {
        const whereChunk = this.buildWhereForIds(idField, chunk, chunk.length);

        const fs = await layer.queryFeatures({
          where: whereChunk,
          outFields,
          returnGeometry: false,
        } as any);

        const feats = (fs?.features || []) as __esri.Graphic[];
        all.push(...feats);
      }
    });

    // de-dupe by idField (some servers may return duplicates)
    const seen = new Set<string>();
    const uniq: __esri.Graphic[] = [];
    for (const f of all) {
      const k = String((f as any)?.attributes?.[idField] ?? "");
      if (!k) continue;
      if (seen.has(k)) continue;
      seen.add(k);
      uniq.push(f);
    }

    return uniq;
  };

  private buildCurrentLayerFilterWhere = (layer: FeatureLayer): string => {
    const clauses: string[] = [];

    const contextWhere = this.buildContextFilterWhere(layer);
    if (contextWhere) clauses.push(contextWhere);

    if (this.state.selectedTuman) {
      const tumanField =
        this.resolveFieldName(layer, "tuman") ||
        this.resolveFieldName(layer, "tuman_nom") ||
        this.resolveFieldName(layer, "district") ||
        null;
      if (tumanField) {
        clauses.push(
          this.buildExactTextWhere(tumanField, this.state.selectedTuman),
        );
      }
    }

    if (this.state.selectedEkin_turi) {
      const ekinField =
        this.resolveFieldName(layer, "ekin_turi") ||
        this.resolveFieldName(layer, "ekin_turi_nomi") ||
        this.resolveFieldName(layer, "crop_type") ||
        null;
      if (ekinField) {
        clauses.push(
          this.buildExactTextWhere(ekinField, this.state.selectedEkin_turi),
        );
      }
    }

    if (this.state.selectedMavsum) {
      const mavsumField =
        this.resolveFieldName(layer, "mavsum") ||
        this.resolveFieldName(layer, "season") ||
        null;
      if (mavsumField) {
        clauses.push(
          this.buildExactTextWhere(mavsumField, this.state.selectedMavsum),
        );
      }
    }

    return this.combineWhereClauses(...clauses);
  };

  private formatSqlNumber = (value: number): string => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "0";
    return String(Number(num.toFixed(10)));
  };

  private buildSelectedBinMetricWhere = (layer: FeatureLayer): string => {
    const xRange = this.state.xRange;
    const yRange = this.state.yRange;
    if (!xRange || !yRange) return "";

    const xField = this.resolveFieldName(layer, this.state.selectedXMetric);
    const yField = this.resolveFieldName(layer, this.state.selectedYMetric);
    if (!xField || !yField) return "";

    const selectedSet = new Set(this.state.selectedBinKeys || []);
    const selectedBins = (this.state.chartData || []).filter((bin) =>
      selectedSet.has(this.binKey(bin)),
    );
    if (!selectedBins.length) return "";

    const xHalf = Number(xRange.binSize) / 2;
    const yHalf = Number(yRange.binSize) / 2;
    if (
      !Number.isFinite(xHalf) ||
      !Number.isFinite(yHalf) ||
      xHalf <= 0 ||
      yHalf <= 0
    ) {
      return "";
    }

    const tolX = Math.abs(xRange.binSize) * 1e-6;
    const tolY = Math.abs(yRange.binSize) * 1e-6;

    const binClauses = selectedBins
      .map((bin) => {
        const xCenter = Number(bin.x_value);
        const yCenter = Number(bin.y_value);
        if (!Number.isFinite(xCenter) || !Number.isFinite(yCenter)) return "";

        const xMin = this.formatSqlNumber(xCenter - xHalf);
        const xMax = this.formatSqlNumber(xCenter + xHalf);
        const yMin = this.formatSqlNumber(yCenter - yHalf);
        const yMax = this.formatSqlNumber(yCenter + yHalf);

        const xUpperOp =
          Math.abs(xCenter + xHalf - xRange.max) <= tolX ? "<=" : "<";
        const yUpperOp =
          Math.abs(yCenter + yHalf - yRange.max) <= tolY ? "<=" : "<";

        return `(${xField} >= ${xMin} AND ${xField} ${xUpperOp} ${xMax} AND ${yField} >= ${yMin} AND ${yField} ${yUpperOp} ${yMax})`;
      })
      .filter(Boolean);

    if (!binClauses.length) return "";

    return this.combineWhereClauses(
      binClauses.length === 1 ? binClauses[0] : `(${binClauses.join(" OR ")})`,
      this.buildCurrentLayerFilterWhere(layer),
    );
  };

  private queryPolygonsBySelectedBinRanges = async (
    layer: FeatureLayer,
    outFields: string[],
  ): Promise<__esri.Graphic[]> => {
    const where = this.buildSelectedBinMetricWhere(layer);
    if (!where) return [];
    return await this.queryFeaturesByWhereChunked(layer, where, outFields);
  };

  private mapFeaturesToRawPoints = (
    layer: FeatureLayer,
    features: __esri.Graphic[],
  ): RawPoint[] => {
    const idField =
      this.resolveFieldName(layer, "globalid") ||
      String((layer as any)?.globalIdField || "").trim() ||
      this.resolveFieldName(layer, "id") ||
      this.resolveFieldName(layer, "idd") ||
      "globalid";
    const xField =
      this.resolveFieldName(layer, this.state.selectedXMetric) ||
      this.state.selectedXMetric;
    const yField =
      this.resolveFieldName(layer, this.state.selectedYMetric) ||
      this.state.selectedYMetric;
    const fermerField =
      this.resolveFieldName(layer, "fermer_nom") ||
      this.resolveFieldName(layer, "fermer") ||
      null;
    const ekinField =
      this.resolveFieldName(layer, "ekin_turi") ||
      this.resolveFieldName(layer, "ekin_turi_nomi") ||
      this.resolveFieldName(layer, "crop_type") ||
      null;
    const maydonField =
      this.resolveFieldName(layer, "maydon") ||
      this.resolveFieldName(layer, "maydon_ga") ||
      this.resolveFieldName(layer, "area") ||
      this.resolveFieldName(layer, "area_ga") ||
      null;

    return (features || []).map((feature) => {
      const attrs = (feature as any)?.attributes || {};
      const rawId = String(attrs[idField] ?? "").trim();
      return {
        ...attrs,
        name: rawId,
        globalid: rawId,
        x: Number(attrs[xField] ?? 0),
        y: Number(attrs[yField] ?? 0),
        fermer_nom: fermerField ? attrs[fermerField] : attrs.fermer_nom,
        ekin_turi: ekinField ? attrs[ekinField] : attrs.ekin_turi,
        maydon: maydonField ? attrs[maydonField] : attrs.maydon,
      } as RawPoint;
    });
  };

  private buildApiParams = (): string => {
    const params = new URLSearchParams();

    if (this.state.selectedYil?.trim())
      params.set("yil", this.state.selectedYil.trim());
    if (this.state.selectedViloyat?.trim())
      params.set(
        "viloyat",
        this.resolveViloyatForApi(this.state.selectedViloyat.trim()),
      );
    if (this.state.selectedTuman?.trim())
      params.set("tuman", this.state.selectedTuman.trim());
    if (this.state.selectedEkin_turi?.trim())
      params.set("ekin_turi", this.state.selectedEkin_turi.trim());
    if (this.state.selectedMavsum?.trim())
      params.set("mavsum", this.state.selectedMavsum.trim());

    params.set("x", this.state.selectedXMetric);
    params.set("y", this.state.selectedYMetric);
    params.set("group_by", this.state.selectedGroupBy);
    params.set("bins", String(DEFAULT_BINS));

    return params.toString();
  };

  private buildFilterQueryOnly = (): string => {
    const params = new URLSearchParams();
    if (this.state.selectedYil?.trim())
      params.set("yil", this.state.selectedYil.trim());
    if (this.state.selectedViloyat?.trim())
      params.set(
        "viloyat",
        this.resolveViloyatForApi(this.state.selectedViloyat.trim()),
      );
    if (this.state.selectedTuman?.trim())
      params.set("tuman", this.state.selectedTuman.trim());
    if (this.state.selectedEkin_turi?.trim())
      params.set("ekin_turi", this.state.selectedEkin_turi.trim());
    if (this.state.selectedMavsum?.trim())
      params.set("mavsum", this.state.selectedMavsum.trim());
    return params.toString();
  };

  private formatMetricValue = (metric: AxisMetric, value: number): string => {
    const decimals = getMetricDecimals(metric);
    if (!Number.isFinite(value)) return "0";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  private normalizeRange = (
    r: ApiRange | null | undefined,
  ): { min: number; max: number; binSize: number } | null => {
    if (!r) return null;
    const min = Number(r.min);
    const max = Number(r.max);
    const binSize = Number(r.bin_size);
    if (
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      Number.isFinite(binSize) &&
      binSize > 0
    )
      return { min, max, binSize };
    return null;
  };

  private adjustRangeToEdgesIfNeeded = (
    range: { min: number; max: number; binSize: number },
    data: DensityBin[],
    axis: "x" | "y",
  ): { min: number; max: number; binSize: number } => {
    const step = range.binSize;
    if (!data?.length || !Number.isFinite(step) || step <= 0) return range;

    const vals = data
      .map((b) => Number(axis === "x" ? b.x : b.y))
      .filter((v) => Number.isFinite(v));

    if (!vals.length) return range;

    const minVal = Math.min(...vals);
    const tol = step * 0.26;
    const asEdgeMin = range.min;
    const expectedCenterIfEdge = asEdgeMin + step / 2;

    if (Math.abs(minVal - expectedCenterIfEdge) <= tol) return range;
    if (Math.abs(minVal - asEdgeMin) <= tol) {
      return {
        min: range.min - step / 2,
        max: range.max + step / 2,
        binSize: step,
      };
    }
    return range;
  };

  private buildFullGrid = (
    apiBins: DensityBin[],
    xRange: { min: number; max: number; binSize: number } | null,
    yRange: { min: number; max: number; binSize: number } | null,
  ): { grid: ScatterPoint[]; nonEmpty: number; maxCount: number } => {
    const gridBins = DEFAULT_BINS; // API bilan bir xil bo'lishi kerak (50x50)
    const nonEmpty = apiBins.filter((b) => Number(b?.count ?? 0) > 0).length;

    if (!xRange || !yRange) {
      let maxCount = 1;
      const pts = apiBins.map((b) => {
        const c = Number(b?.count ?? 0);
        if (Number.isFinite(c) && c > maxCount) maxCount = c;
        return { x_value: Number(b.x), y_value: Number(b.y), count: c };
      });
      return { grid: pts, nonEmpty, maxCount: Math.max(1, maxCount) };
    }

    const xMin = Number(xRange.min);
    const xMax = Number(xRange.max);
    const yMin = Number(yRange.min);
    const yMax = Number(yRange.max);

    const xStep50 = (xMax - xMin) / gridBins;
    const yStep50 = (yMax - yMin) / gridBins;
    const x0 = xMin + xStep50 / 2;
    const y0 = yMin + yStep50 / 2;

    const counts = new Map<string, number>();
    let maxCount = 1;

    for (const b of apiBins) {
      const c = Number(b?.count ?? 0);
      const bx = Number(b?.x);
      const by = Number(b?.y);
      if (!Number.isFinite(c) || c < 0) continue;
      if (!Number.isFinite(bx) || !Number.isFinite(by)) continue;

      const xi = Math.floor((bx - xMin) / xStep50);
      const yi = Math.floor((by - yMin) / yStep50);
      if (xi < 0 || yi < 0 || xi >= gridBins || yi >= gridBins) continue;

      const key = `${xi}|${yi}`;
      const prev = counts.get(key) ?? 0;
      const next = prev + c;
      counts.set(key, next);
      if (next > maxCount) maxCount = next;
    }

    const grid: ScatterPoint[] = [];
    for (let yi = 0; yi < gridBins; yi++) {
      const yCenter = y0 + yi * yStep50;
      for (let xi = 0; xi < gridBins; xi++) {
        const xCenter = x0 + xi * xStep50;
        const key = `${xi}|${yi}`;
        grid.push({
          x_value: xCenter,
          y_value: yCenter,
          count: counts.get(key) ?? 0,
          xi,
          yi,
        });
      }
    }

    return { grid, nonEmpty, maxCount: Math.max(1, maxCount) };
  };
  /** ✅ Best source of truth: resolve selected DS -> actual FeatureLayer OR url (via DataSourceManager) */
  private resolveSelectedPolygonSource = async (
    year?: string,
  ): Promise<{
    useDs: any;
    layer: FeatureLayer | null;
    url: string | null;
    label: string;
  } | null> => {
    const useDs = await this.pickUseDataSourceForYear(year);
    if (!useDs) return null;

    try {
      const ds = await this.dsManager.createDataSourceByUseDataSource(
        Immutable(useDs) as IMUseDataSource,
      );
      const dsJson = (ds as any)?.getDataSourceJson?.() ?? null;

      const label = String(
        dsJson?.label ||
          dsJson?.name ||
          (ds as any)?.getLabel?.() ||
          ds?.id ||
          "",
      ).trim();

      // Try to get an actual FeatureLayer instance
      const maybeLayer =
        (ds as any)?.layer ||
        (typeof (ds as any)?.getLayer === "function"
          ? await (ds as any).getLayer()
          : null);

      const layer =
        maybeLayer && typeof (maybeLayer as any).queryFeatures === "function"
          ? (maybeLayer as FeatureLayer)
          : null;

      // Try to get URL (works even if layer instance is missing)
      const url =
        String(
          (layer as any)?.url || (dsJson as any)?.url || (ds as any)?.url || "",
        ).trim() || null;

      if (!layer && !url) {
        console.warn("[resolveSelectedPolygonSource] no layer and no url", {
          useDs,
          dsJson,
          dsId: ds?.id,
        });
        return null;
      }

      return { useDs, layer, url, label };
    } catch (e) {
      console.warn("[resolveSelectedPolygonSource] failed", e, useDs);
      return null;
    }
  };

  /** ✅ Find a FeatureLayer already in the connected map by URL (normalized) */
  private findFeatureLayerInMapByUrl = (url: string): FeatureLayer | null => {
    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    if (!view?.map || !url) return null;

    const want = this.normalizeUrl(url);
    const all = (view.map as any).allLayers?.toArray?.() ?? [];

    const hit = all.find((lyr: any) => {
      const u = this.normalizeUrl(String(lyr?.url ?? ""));
      return u && u === want && lyr?.type === "feature";
    });

    return hit ? (hit as FeatureLayer) : null;
  };

  private computeDomainForHeatmap = (
    range: { min: number; max: number; binSize: number } | null,
    axis: "x" | "y",
  ): [number, number] => {
    if (range) {
      const mn = Number(range.min);
      const mx = Number(range.max);
      if (Number.isFinite(mn) && Number.isFinite(mx) && mx !== mn)
        return [mn, mx];
    }
    const data = this.state.chartData;
    if (!data.length) return [0, 1];
    let mn = Number.POSITIVE_INFINITY;
    let mx = Number.NEGATIVE_INFINITY;
    for (const d of data) {
      const v = axis === "x" ? Number(d.x_value) : Number(d.y_value);
      if (!Number.isFinite(v)) continue;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx)) return [0, 1];
    if (mn === mx) return [mn - 1, mx + 1];
    return [mn, mx];
  };
  /** ✅ Get URL of a specific UseDataSource (FeatureLayer) from appConfig */
  private getLayerUrlFromUseDataSource = (useDs: any): string | null => {
    try {
      const dsId = String(
        useDs?.mainDataSourceId || useDs?.dataSourceId || "",
      ).trim();
      if (!dsId) return null;

      const state = getAppStore().getState();
      const dsJson = state?.appConfig?.dataSources?.[dsId];
      const url = (dsJson?.url ?? "").toString().trim();
      return url || null;
    } catch {
      return null;
    }
  };

  private heatFill = (count: number): string => {
    const c = Number(count ?? 0);
    const isLightTheme =
      typeof document !== "undefined" &&
      (document.documentElement.classList.contains("light-theme") ||
        document.documentElement.getAttribute("data-theme") === "light" ||
        document.body?.classList.contains("light-theme"));

    // Bo'sh yacheykalar uchun - oppoq/shaffof
    if (!Number.isFinite(c) || c <= 0) {
      return isLightTheme ? "rgba(61, 87, 85, 0.08)" : "hsla(0, 0%, 100%, 0.1)";
    }

    const max = Math.max(1, Number(this.state.maxBinCount ?? 1));
    const n0 = Math.min(1, Math.max(0, c / max));
    const n = Math.pow(n0, 0.65);

    if (isLightTheme) {
      const alpha = 0.28 + 0.56 * n; // 0.28 dan 0.84 gacha
      return `rgba(61, 87, 85, ${alpha.toFixed(3)})`;
    }

    // To'q ko'k ranglar - malumot ko'p bolsa to'qroq
    // Hue: 205 (ko'k), Lightness: tiqar (to'q)
    const light = 65 - 45 * n; // 65% dan 20% gacha (aniqroq gradient)
    const alpha = 0.7 + 0.3 * n; // 0.7 dan 1.0 gacha
    return `hsla(205, 85%, ${light}%, ${alpha})`;
  };

  private binKey = (p: ScatterPoint): string => {
    if (typeof p.xi === "number" && typeof p.yi === "number")
      return `${p.xi}|${p.yi}`;
    return `${p.x_value}|${p.y_value}`;
  };

  private toggleLasso = (): void => {
    const willDisable = this.state.lassoEnabled;
    if (willDisable) {
      this._lassoTempPath = [];
      if (this._lassoRAF !== null) {
        cancelAnimationFrame(this._lassoRAF);
        this._lassoRAF = null;
      }
      this._lassoUpdateScheduled = false;
    }
    this.setState((prev) => ({
      lassoEnabled: !prev.lassoEnabled,
      lassoDrawing: false,
      lassoPath: prev.lassoEnabled ? [] : prev.lassoPath,
    }));
  };

  private handleGroupByChange = (value: string): void => {
    const groupBy = value as GroupByType;
    if (groupBy === this.state.selectedGroupBy) return;

    this.clearSelection();
    this.setState(
      { selectedGroupBy: groupBy, selectedGroupedItem: null },
      () => {
        this.throttledFetchData();
      },
    );
  };

  /** Clear grouped selection and hide map polygons with zoom out */
  private clearGroupedSelection = async (): Promise<void> => {
    console.log("[CLEAR DEBUG] clearGroupedSelection called");
    this.setState({
      selectedGroupedItem: null,
      mapSelectedCount: 0,
      mapError: null,
    });

    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;

    // Get layer and hide it directly
    const year = this.state.selectedYil;
    const layer = await this.ensurePolygonLayerInMapAfterLasso(year);
    if (layer) {
      console.log("[CLEAR DEBUG] Hiding layer directly");
      layer.visible = false;
      layer.definitionExpression = "1=0";
    }

    try {
      const gl = view?.map?.findLayerById(
        SELECTION_LAYER_ID,
      ) as __esri.GraphicsLayer;
      if (gl) gl.removeAll();
    } catch {}

    // Zoom out
    if (view) {
      try {
        // If viloyat is selected, zoom to viloyat extent
        if (this.state.selectedViloyat && layer) {
          const viloyatField =
            this.resolveFieldName(layer, "viloyat") ||
            this.resolveFieldName(layer, "viloyat_nom") ||
            this.resolveFieldName(layer, "region") ||
            "viloyat";
          const where = this.buildExactTextWhere(
            viloyatField,
            this.state.selectedViloyat,
            "region",
          );
          // Temporarily allow query for extent
          layer.definitionExpression = where;
          const extent = await layer.queryExtent({ where } as any);
          // Hide again after getting extent
          layer.visible = false;
          layer.definitionExpression = "1=0";
          if (extent?.extent) {
            view.goTo(extent.extent.expand(1.1), { duration: 500 });
          }
        } else {
          // Zoom out to a default scale
          view.goTo({ zoom: Math.max(view.zoom - 2, 5) }, { duration: 500 });
        }
      } catch (e) {
        console.log("[CLEAR DEBUG] Zoom error:", e);
      }
    }
  };

  /** Update map for selected grouped item (without toggle logic) */
  private updateMapForGroupedItem = async (): Promise<void> => {
    if (!this._isMounted) return;

    const itemName = this.state.selectedGroupedItem;
    if (!itemName) return;

    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    if (!view?.map) {
      this.setState({ mapError: "No connected Map widget / view yet." });
      return;
    }

    const year = this.state.selectedYil;
    const layer = await this.ensurePolygonLayerInMapAfterLasso(year);
    if (!layer) {
      this.setState({ mapError: "Could not find/create polygon layer." });
      return;
    }

    try {
      await layer.load();
    } catch {}

    try {
      (layer as any).minScale = 0;
      (layer as any).maxScale = 0;
      (layer as any).opacity = 0.9;
    } catch {}

    // Build WHERE clause with all active filters
    const whereParts: string[] = [];
    const groupBy = this.state.selectedGroupBy;

    // 1. Add the clicked item filter
    if (groupBy === "tuman") {
      const tumanField =
        this.resolveFieldName(layer, "tuman") ||
        this.resolveFieldName(layer, "tuman_nom") ||
        this.resolveFieldName(layer, "district") ||
        "tuman";
      whereParts.push(this.buildExactTextWhere(tumanField, itemName));
    } else if (groupBy === "ekin_turi") {
      const ekinField =
        this.resolveFieldName(layer, "ekin_turi") ||
        this.resolveFieldName(layer, "ekin_nomi") ||
        this.resolveFieldName(layer, "crop_type") ||
        "ekin_turi";
      whereParts.push(this.buildExactTextWhere(ekinField, itemName));
    }

    // 2. Add filter dropdown selections (if any)
    if (groupBy === "ekin_turi" && this.state.selectedTuman) {
      const tumanField =
        this.resolveFieldName(layer, "tuman") ||
        this.resolveFieldName(layer, "tuman_nom") ||
        this.resolveFieldName(layer, "district") ||
        "tuman";
      whereParts.push(
        this.buildExactTextWhere(tumanField, this.state.selectedTuman),
      );
    }

    if (groupBy === "tuman" && this.state.selectedEkin_turi) {
      const ekinField =
        this.resolveFieldName(layer, "ekin_turi") ||
        this.resolveFieldName(layer, "ekin_nomi") ||
        this.resolveFieldName(layer, "crop_type") ||
        "ekin_turi";
      whereParts.push(
        this.buildExactTextWhere(ekinField, this.state.selectedEkin_turi),
      );
    }

    // 3. Add viloyat filter if selected
    if (this.state.selectedViloyat) {
      const viloyatField =
        this.resolveFieldName(layer, "viloyat") ||
        this.resolveFieldName(layer, "viloyat_nom") ||
        this.resolveFieldName(layer, "region") ||
        "viloyat";
      whereParts.push(
        this.buildExactTextWhere(
          viloyatField,
          this.state.selectedViloyat,
          "region",
        ),
      );
    }

    // 4. Add mavsum filter if selected
    if (this.state.selectedMavsum) {
      const mavsumField =
        this.resolveFieldName(layer, "mavsum") ||
        this.resolveFieldName(layer, "season") ||
        "mavsum";
      whereParts.push(
        this.buildExactTextWhere(mavsumField, this.state.selectedMavsum),
      );
    }

    const where = whereParts.join(" AND ");

    if (!where) {
      this.setState({ mapError: "Could not build filter expression" });
      return;
    }

    try {
      layer.definitionExpression = where;
      layer.visible = true;
      // ✅ ASYNC - count and zoom in background (fire-and-forget)
      const countPromise = layer
        .queryFeatureCount({ where } as any)
        .catch(() => null);
      const extentPromise = (layer as any)
        .queryExtent({ where })
        .catch(() => null);

      countPromise
        .then(async (matched) => {
          if (!this._isMounted) return;
          if (matched === 0) {
            this.setState({
              mapError: `0 polygons matched for this filter.`,
              mapSelectedCount: 0,
            });
          } else {
            try {
              const gl = view?.map?.findLayerById(
                SELECTION_LAYER_ID,
              ) as __esri.GraphicsLayer;
              if (gl) gl.removeAll();
            } catch {}
            this.setState({
              mapSelectedCount: matched || 0,
              mapError: null,
              activePolygonLayerId: layer.id,
            });
          }
        })
        .catch(() => {
          if (this._isMounted) this.setState({ mapSelectedCount: 0 });
        });

      extentPromise
        .then((ext) => {
          if (!this._isMounted) return;
          const extent = ext?.extent;
          if (extent && (view as any).goTo) {
            (view as any)
              .goTo(extent.expand ? extent.expand(1.3) : extent, {
                duration: 300,
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error("[MAP ERROR]", err);
    }
  };

  /** ✅ Handle grouped item (tuman/ekin_turi) click - toggle selection and update map */
  private handleGroupedItemClick = async (itemName: string): Promise<void> => {
    if (!this._isMounted) return;

    const isCurrentlySelected = this.state.selectedGroupedItem === itemName;

    if (isCurrentlySelected) {
      // Deselect: clear the grouped item and hide polygons
      await this.clearGroupedSelection();
    } else {
      // Select: update selectedGroupedItem and update the map
      this.setState({ selectedGroupedItem: itemName }, async () => {
        await this.updateMapForGroupedItem();
      });
    }
  };

  /** ✅ API returns GlobalID sometimes as `globalid`, but in your case it's inside `name` (see screenshot). */
  private getRawPointGlobalId = (p: RawPoint | null | undefined): string => {
    const raw =
      (p as any)?.globalid ??
      (p as any)?.GlobalID ??
      (p as any)?.gid ??
      (p as any)?.idd ??
      (p as any)?.id ??
      (p as any)?.objectid ??
      (p as any)?.OBJECTID ??
      (p as any)?.name ??
      "";
    return String(raw || "").trim();
  };

  private onLassoPointerDown = (
    e: React.PointerEvent<SVGRectElement> | any,
  ) => {
    if (!this.state.lassoEnabled) return;
    e.preventDefault?.();
    e.stopPropagation?.();

    const host = this.chartStageRef.current;
    if (!host) return;

    const r = host.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    // ✅ Get coordinates relative to chart stage (same coordinate system as Recharts p.cx/p.cy)
    const x = clientX - r.left;
    const y = clientY - r.top;
    const p = { x, y };

    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {}

    // Store in temp path for performance
    this._lassoTempPath = [p];

    // ✅ Only set lassoDrawing=true, don't update lassoPath during drawing
    this.setState({ lassoDrawing: true });

    // ✅ Initialize SVG path directly
    const pathEl = this.lassoPathRef.current;
    if (pathEl) {
      const d = this.polygonPathD([p], false);
      pathEl.setAttribute("d", d);
    }
  };

  private scheduleLassoUpdate = () => {
    if (this._lassoUpdateScheduled) return;
    this._lassoUpdateScheduled = true;

    this._lassoRAF = requestAnimationFrame(() => {
      this._lassoUpdateScheduled = false;
      if (this._isMounted && this._lassoTempPath.length > 0) {
        // ✅ Direct DOM update - no React re-render!
        const pathEl = this.lassoPathRef.current;
        if (pathEl) {
          const d = this.polygonPathD(this._lassoTempPath, false);
          pathEl.setAttribute("d", d);
        }
      }
    });
  };

  private onLassoPointerMove = (
    e: React.PointerEvent<SVGRectElement> | any,
  ) => {
    if (!this.state.lassoEnabled || !this.state.lassoDrawing) return;
    e.preventDefault?.();
    e.stopPropagation?.();

    const host = this.chartStageRef.current;
    if (!host) return;

    const r = host.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    // ✅ Get coordinates relative to chart stage (same coordinate system as Recharts p.cx/p.cy)
    const x = clientX - r.left;
    const y = clientY - r.top;
    const p = { x, y };

    const last = this._lassoTempPath[this._lassoTempPath.length - 1];
    if (!last) return;

    const dx = p.x - last.x;
    const dy = p.y - last.y;
    if (dx * dx + dy * dy < 16) return; // 4px threshold for better performance

    // ✅ Update temp path immediately (no setState = faster)
    this._lassoTempPath.push(p);

    // ✅ Schedule visual update via RAF (60fps max)
    this.scheduleLassoUpdate();
  };

  private onLassoPointerUp = async (
    e: React.PointerEvent<SVGRectElement> | any,
  ) => {
    if (!this.state.lassoEnabled || !this.state.lassoDrawing) return;
    e.preventDefault?.();
    e.stopPropagation?.();

    // ✅ Cancel any pending RAF update
    if (this._lassoRAF !== null) {
      cancelAnimationFrame(this._lassoRAF);
      this._lassoRAF = null;
    }
    this._lassoUpdateScheduled = false;

    const poly =
      this._lassoTempPath.length > 0
        ? this._lassoTempPath
        : this.state.lassoPath;

    this.setState({ lassoDrawing: false, lassoPath: [...poly] });

    if (!poly || poly.length < 3) {
      this.setState({ lassoPath: [] });
      this._lassoTempPath = [];
      return;
    }

    const selectedKeys = this.computeSelectedBins(poly);
    this._lassoTempPath = []; // Clear temp path

    this.setState({ selectedBinKeys: selectedKeys }, async () => {
      // ✅ ONLY NOW: fetch raw points AND draw polygons on map
      await this.fetchRawPointsForSelectedBins();
    });
  };

  private polygonPathD = (
    pts: Array<{ x: number; y: number }>,
    close: boolean,
  ): string => {
    if (!pts.length) return "";
    const head = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    const rest = pts
      .slice(1)
      .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");
    return `${head} ${rest} ${close ? "Z" : ""}`.trim();
  };

  private pointInPolygon = (
    pt: { x: number; y: number },
    poly: Array<{ x: number; y: number }>,
  ): boolean => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x,
        yi = poly[i].y;
      const xj = poly[j].x,
        yj = poly[j].y;

      const intersect =
        yi > pt.y !== yj > pt.y &&
        pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi || 1e-9) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  };

  private binCenterToPixel = (
    p: ScatterPoint,
  ): { x: number; y: number } | null => {
    const xr = this.state.xRange;
    const yr = this.state.yRange;
    if (!xr || !yr) return null;

    const xMin = xr.min;
    const xMax = xr.max;
    const yMin = yr.min;
    const yMax = yr.max;

    // ✅ Use current stage width (dynamically updated via ResizeObserver)
    const stageWidth = this.state.chartStageWidth || 800;
    const axisW = Math.max(
      1,
      stageWidth - CHART_MARGIN.left - CHART_MARGIN.right,
    );
    const axisH = Math.max(
      1,
      CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom,
    );

    if (xMax === xMin || yMax === yMin) return null;

    // ✅ Normalize data value to [0, 1]
    const nx = (p.x_value - xMin) / (xMax - xMin);
    const ny = (yMax - p.y_value) / (yMax - yMin);

    // ✅ Check if normalized values are in valid range
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;

    // ✅ Convert to pixel coordinates (including margin offset)
    const x = CHART_MARGIN.left + nx * axisW;
    const y = CHART_MARGIN.top + ny * axisH;

    return { x, y };
  };

  private computeSelectedBins = (
    poly: Array<{ x: number; y: number }>,
  ): string[] => {
    if (!poly || poly.length < 3) return [];

    // ✅ If no cached coords yet, fall back to calculated coords
    const useCached = this._binPixelCoords.size > 0;

    const keys: string[] = [];
    for (const b of this.state.chartData) {
      const key = this.binKey(b);

      let coords: { x: number; y: number } | null | undefined;

      if (useCached) {
        // Use Recharts' actual pixel coordinates (stored during render)
        coords = this._binPixelCoords.get(key);
      } else {
        // Fallback: calculate coordinates manually
        coords = this.binCenterToPixel(b);
      }

      if (!coords) continue;

      // ✅ Check if bin center is inside lasso polygon
      if (this.pointInPolygon(coords, poly)) {
        keys.push(key);
      }
    }

    return keys;
  };

  private getRawBubbleData = (): Array<RawPoint & { size: number }> => {
    return (this.state.rawPoints || []).map((p) => ({
      ...p,
      size: 1,
    }));
  };

  private RawPointsTooltip = ({ active, payload }: any): JSX.Element | null => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload as RawPoint;
    if (!p) return null;

    const gid = this.getRawPointGlobalId(p);

    return (
      <div className="chart-tooltip">
        <div className="tooltip-header">Polygon point</div>
        <div className="tooltip-content">
          <div className="tooltip-row">
            <span className="label">GlobalID:</span>
            <span className="value">{gid || "-"}</span>
          </div>

          <div className="tooltip-row">
            <span className="label">X:</span>
            <span className="value">
              {this.formatMetricValue(this.state.selectedXMetric, Number(p.x))}
            </span>
          </div>
          <div className="tooltip-row">
            <span className="label">Y:</span>
            <span className="value">
              {this.formatMetricValue(this.state.selectedYMetric, Number(p.y))}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /** ✅ MAP: ensure selection graphics layer exists (no fetch, just a layer holder) */
  /** ✅ MAP: ensure selection graphics layer exists */
  private ensureSelectionLayer = (): GraphicsLayer | null => {
    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    if (!view || !view.map) return null;

    const existing = view.map.findLayerById(
      SELECTION_LAYER_ID,
    ) as GraphicsLayer;
    if (existing) {
      existing.visible = true;
      return existing;
    }

    const gl = new GraphicsLayer({
      id: SELECTION_LAYER_ID,
      title: "Selected polygons",
      visible: true,
    });

    view.map.add(gl);
    return gl;
  };

  private renderSelectionOverlay = async (
    layer: FeatureLayer,
    where: string,
    matched: number,
  ): Promise<void> => {
    const gl = this.ensureSelectionLayer();
    if (!gl) return;

    try {
      gl.removeAll();
    } catch {}

    const objectIdField =
      String((layer as any)?.objectIdField || "").trim() || "objectid";

    let objectIds: number[] = [];
    try {
      objectIds = await this.withDefinitionExpressionDisabled(
        layer,
        async () => {
          const ids = await layer.queryObjectIds({ where } as any);
          return Array.isArray(ids) ? ids : [];
        },
      );
    } catch {
      objectIds = [];
    }

    if (!objectIds.length) return;

    const maxOverlayFeatures =
      matched > 20000
        ? 3500
        : matched > 5000
          ? 2500
          : matched > 1500
            ? 1500
            : Math.max(500, matched);
    const sampleIds = objectIds.slice(0, maxOverlayFeatures);
    const chunks = this.chunkArray(sampleIds, 200);

    for (const chunk of chunks) {
      try {
        const fs = await this.withDefinitionExpressionDisabled(
          layer,
          async () => {
            return await layer.queryFeatures({
              objectIds: chunk,
              outFields: ["*"],
              returnGeometry: true,
            } as any);
          },
        );

        const features = ((fs as any)?.features || []) as __esri.Graphic[];
        for (const feature of features) {
          const geometry = (feature as any)?.geometry as __esri.Geometry;
          if (!geometry) continue;

          if ((geometry as any)?.type === "polygon") {
            const symbol = this.buildOverlaySymbolFromLayer(
              layer,
              feature,
              matched,
            );
            gl.add(
              new Graphic({
                geometry,
                symbol,
              }),
            );
          }
        }
      } catch {
        // keep whatever overlay graphics we already managed to draw
      }
    }

    try {
      const jmv = this.state.jimuMapView;
      const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
      if (view?.map) {
        view.map.reorder(gl, view.map.layers.length - 1);
      }
    } catch {}
  };

  /** ✅ Our own polygon layer id (stable, per year/url) */
  private getPolygonLayerId = (year?: string, url?: string): string => {
    const y = String(year ?? this.state.selectedYil ?? "").trim() || "no-year";
    const u = this.normalizeUrl(String(url || this.getPolygonLayerUrl() || ""));
    // shorten to keep ids reasonable
    const short = u ? u.slice(-40).replace(/[^a-z0-9]/gi, "") : "no-url";
    return `yield-water-polygons-${y}-${short}`;
  };

  /** ✅ Hide all our polygon layers (and DS layers) safely */
  private hideAllPolygonLayersInMap = async (): Promise<void> => {
    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    if (!view?.map) return;

    const all = (view.map as any).allLayers?.toArray?.() ?? [];
    for (const lyr of all) {
      try {
        if (lyr?.type !== "feature") continue;
        const id = String(lyr?.id || "");
        // hide our created layers
        if (id.startsWith("yield-water-polygons-")) {
          const fl = lyr as FeatureLayer;
          fl.visible = false;
          fl.definitionExpression = "1=0";
        }
      } catch {}
    }

    // also hide selected DS layers (your "hard rule")
    await this.hidePolygonLayerUntilSelection();
  };

  private clearMapSelection = (): void => {
    try {
      const jmv = this.state.jimuMapView;
      const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
      if (!view?.map) return;

      // Hide ALL our polygon layers
      const all = (view.map as any).allLayers?.toArray?.() ?? [];
      const activeId = this.state.activePolygonLayerId;

      for (const lyr of all) {
        try {
          if (lyr?.type !== "feature") continue;
          const id = String(lyr?.id || "");

          // Hide if it's our layer OR if it's the active layer we used
          const isOurLayer = id.startsWith("yield-water-polygons-");
          const isActiveLayer = activeId && id === activeId;

          if (isOurLayer || isActiveLayer) {
            const fl = lyr as FeatureLayer;
            fl.definitionExpression = "1=0";
            fl.visible = false;
          }
        } catch {}
      }

      // Also clear selection graphics
      const gl = view.map.findLayerById(
        SELECTION_LAYER_ID,
      ) as __esri.GraphicsLayer;
      if (gl) gl.removeAll();

      this.setState({
        mapSelectedCount: 0,
        mapError: null,
        activePolygonLayerId: null,
      });
    } catch {
      // silent
    }
  };

  private buildOverlaySymbolFromLayer = (
    layer: FeatureLayer,
    feature: __esri.Graphic,
    matched: number,
  ): any => {
    const fallback = {
      type: "simple-fill",
      color: matched > 5000 ? [255, 166, 0, 0.42] : [255, 170, 0, 0.3],
      outline: {
        color: [0, 0, 0, 0],
        width: 0,
      },
    } as any;

    try {
      const renderer = (layer as any)?.renderer;
      const rendered = renderer?.getSymbol
        ? renderer.getSymbol(feature)
        : renderer?.symbol;
      const symbol = rendered?.clone ? rendered.clone() : rendered;
      if (!symbol) return fallback;

      if (symbol?.type === "simple-fill") {
        symbol.outline = {
          ...(symbol.outline || {}),
          color: [0, 0, 0, 0],
          width: 0,
        };
      }

      return symbol;
    } catch {
      return fallback;
    }
  };

  /** ✅ Clear selection and zoom out to viloyat/region extent */
  /** ✅ Clear row focus and zoom to viloyat level */
  private clearMapSelectionAndZoomOut = async (): Promise<void> => {
    try {
      const jmv = this.state.jimuMapView;
      const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
      if (!view) return;

      this.clearMapSelection();

      const { savedMapExtent, selectedYil, selectedViloyat } = this.state;

      if ((view as any).goTo && savedMapExtent) {
        try {
          await (view as any).goTo(savedMapExtent, { duration: 500 });
          this.setState({ savedMapExtent: null });
          return;
        } catch (restoreErr) {
          console.warn(
            "[clearMapSelectionAndZoomOut] restore saved extent failed:",
            restoreErr,
          );
        }
      }

      if ((view as any).goTo && selectedViloyat) {
        try {
          const layer =
            await this.ensurePolygonLayerInMapAfterLasso(selectedYil);
          if (layer) {
            const viloyatField =
              this.resolveFieldName(layer, "viloyat") ||
              this.resolveFieldName(layer, "viloyat_nom") ||
              this.resolveFieldName(layer, "region") ||
              "viloyat";
            const where = this.buildExactTextWhere(
              viloyatField,
              selectedViloyat,
              "region",
            );
            const extent = await (layer as any).queryExtent({ where });
            if (extent?.extent) {
              await (view as any).goTo(extent.extent.expand(1.1), {
                duration: 500,
              });
            }
          }
        } catch (zoomErr) {
          console.warn(
            "[clearMapSelectionAndZoomOut] zoom to viloyat failed:",
            zoomErr,
          );
        }
      }

      this.setState({ savedMapExtent: null });
    } catch (e) {
      console.warn("[clearMapSelectionAndZoomOut] error:", e);
    }
  };

  private chunkArray<T>(arr: T[], chunkSize: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize)
      out.push(arr.slice(i, i + chunkSize));
    return out;
  }
  /** ✅ Find a polygon FeatureLayer in the CONNECTED map that has a globalid/globalID field (loads layers first) */
  private findPolygonLayerFromMap = async (): Promise<FeatureLayer | null> => {
    const jmv = this.state.jimuMapView;
    const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
    if (!view?.map) return null;

    const layers = (view.map as any).allLayers?.toArray?.() ?? [];
    const wantField = (this.getGlobalIdField() || "globalid").toLowerCase();

    for (const lyr of layers) {
      try {
        if (!lyr || lyr.type !== "feature") continue;

        const gt = (lyr.geometryType ?? "").toString().toLowerCase();
        if (gt && gt !== "polygon") continue;

        const fl = lyr as FeatureLayer;
        await fl.load();

        const fields = (fl.fields || []) as Array<{ name: string }>;
        const has =
          fields.some((f) => (f?.name || "").toLowerCase() === wantField) ||
          fields.some((f) => (f?.name || "").toLowerCase() === "globalid") ||
          fields.some((f) => (f?.name || "").toLowerCase() === "globalid");

        if (has) return fl;
      } catch {
        // skip broken layers
      }
    }

    return null;
  };

  /** ✅ Works for both Array<string> and ImmutableArray<string> */
  /** ✅ Map widget id from Experience Builder connection */
  /** ✅ Map widget id from Experience Builder connection (ImmutableArray-safe) */
  private getConnectedMapWidgetId = (): string | null => {
    const ids = this.props.useMapWidgetIds;
    if (!ids || ids.length === 0) return null;

    const first = ids[0];
    return first ? String(first) : null;
  };

  private isStaleApplySelectionRun = (runId: number): boolean => {
    return !this._isMounted || runId !== this._applySelectionReqId;
  };

  private applySelectionToMap = async (
    globalids: string[],
    year?: string,
  ): Promise<void> => {
    if (!this._isMounted) return;
    const runId = ++this._applySelectionReqId;
    const rawIds = Array.isArray(globalids) ? globalids : [];
    const coreIds = [
      ...new Set(
        rawIds.map((g) => this.normalizeGuid(String(g || ""))).filter(Boolean),
      ),
    ];
    const y = String(year ?? this.state.selectedYil ?? "").trim();
    const signature = `${y}::${coreIds.slice().sort().join(",")}`;

    if (signature && signature === this._applySelectionInFlightSignature) {
      return;
    }

    this._applySelectionInFlightSignature = signature;

    try {
      const jmv = this.state.jimuMapView;
      const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
      if (!view?.map) {
        if (!this.isStaleApplySelectionRun(runId)) {
          this.setState({
            mapError: "No connected Map widget / view yet.",
            mapSelectedCount: 0,
          });
        }
        return;
      }

      if (!coreIds.length) {
        this.clearMapSelection();
        return;
      }

      const layer = await this.ensurePolygonLayerInMapAfterLasso(y);
      if (this.isStaleApplySelectionRun(runId)) return;
      if (!layer) {
        console.warn("[applySelectionToMap] No polygon layer found/created", {
          year: y,
          viloyat: this.state.selectedViloyat,
          useDsSources:
            this.toPlainArray(this.props.useDataSources)?.length ?? 0,
        });
        this.setState({
          mapError:
            "Could not create/find the polygon FeatureLayer for the selected year. " +
            "Make sure widget settings use real FeatureLayer data sources (one per year).",
          mapSelectedCount: 0,
        });
        return;
      }

      try {
        await layer.load();
      } catch {}
      if (this.isStaleApplySelectionRun(runId)) return;

      console.log("[applySelectionToMap] Layer resolved:", {
        url: (layer as any)?.url,
        id: layer.id,
        fields: layer.fields?.map((f) => f.name)?.slice(0, 15),
        geometryType: (layer as any)?.geometryType,
        idsCount: globalids?.length,
        viloyat: this.state.selectedViloyat,
      });

      // IMPORTANT: your layer stores strings like "{GUID}" (see screenshot),
      // so we must match BOTH formats regardless of field type.

      const idFieldRaw = await this.resolveBestIdFieldForSourceIds(
        layer,
        coreIds,
      );
      if (this.isStaleApplySelectionRun(runId)) return;
      const idField =
        this.resolveFieldName(layer, idFieldRaw) ||
        this.resolveFieldName(layer, "globalid") ||
        idFieldRaw;

      const values = [...new Set(coreIds.flatMap((g) => this.guidVariants(g)))]; // => [guid, {guid}]
      const idWhere = this.buildWhereForIds(idField, values, 200);
      const contextWhere = this.buildContextFilterWhere(layer);
      const whereWithCtx = this.combineWhereClauses(idWhere, contextWhere);
      const candidates = this.getIdFieldCandidates(layer);
      console.log(
        `[applySelectionToMap] idField=${idField} globalIdField=${(layer as any)?.globalIdField ?? "null"} ` +
          `layerFields=${layer.fields?.map((f) => f.name).join(",") || "(none)"} ` +
          `candidates=${candidates.slice(0, 6).join(",")} sampleId=${coreIds[0] ?? "n/a"}`,
      );

      // Clear selection graphics
      try {
        const gl = view.map.findLayerById(
          SELECTION_LAYER_ID,
        ) as __esri.GraphicsLayer;
        if (gl) gl.removeAll();
      } catch {}

      let matched = 0;
      let where = whereWithCtx;
      try {
        // IMPORTANT: Use withDefinitionExpressionDisabled — newly-created layers
        // start with definitionExpression="1=0" which would block all queries.
        matched = await this.withDefinitionExpressionDisabled(layer, async () =>
          Number((await layer.queryFeatureCount({ where } as any)) ?? 0),
        );
        console.log("[applySelectionToMap] Query result:", {
          where: where.length > 300 ? where.slice(0, 300) + "..." : where,
          idField,
          matched,
          sampleIds: coreIds.slice(0, 3),
          contextWhere: contextWhere || "(none)",
          layerDefExpr: (layer as any)?.definitionExpression ?? "(none)",
          globalIdField: (layer as any)?.globalIdField ?? "(none)",
        });
        console.log(
          `[applySelectionToMap] matched=${matched} idField=${idField} contextWhere=${contextWhere ? contextWhere.slice(0, 60) + "..." : "(none)"}`,
        );

        // If context filter gives 0, retry with ID-only WHERE
        if (matched <= 0 && contextWhere) {
          const idOnlyCount = await this.withDefinitionExpressionDisabled(
            layer,
            async () =>
              Number(
                (await layer.queryFeatureCount({ where: idWhere } as any)) ?? 0,
              ),
          );
          console.log(
            `[applySelectionToMap] Retry idOnly: idOnlyCount=${idOnlyCount} field=${idField} sampleWhere=${idWhere.slice(0, 80)}`,
          );
          if (idOnlyCount > 0) {
            matched = idOnlyCount;
            where = idWhere;
          }
        }

        if (matched <= 0) {
          const binRangeWhere = this.buildSelectedBinMetricWhere(layer);
          if (binRangeWhere) {
            const rangeCount = await this.withDefinitionExpressionDisabled(
              layer,
              async () =>
                Number(
                  (await layer.queryFeatureCount({
                    where: binRangeWhere,
                  } as any)) ?? 0,
                ),
            );
            console.log(
              `[applySelectionToMap] Retry binRange: rangeCount=${rangeCount} sampleWhere=${binRangeWhere.slice(0, 120)}`,
            );
            if (rangeCount > 0) {
              matched = rangeCount;
              where = binRangeWhere;
            }
          }
        }

        if (matched <= 0) {
          if (this.isStaleApplySelectionRun(runId)) return;
          layer.definitionExpression = "1=0";
          layer.visible = false;
          this.setState({
            activePolygonLayerId: layer.id,
            mapError: "Tanlangan bin uchun polygon topilmadi. ID mos kelmadi.",
            mapSelectedCount: 0,
          });
          return;
        }

        layer.definitionExpression = where;
        layer.visible = true;

        await this.renderSelectionOverlay(layer, where, matched);
        if (this.isStaleApplySelectionRun(runId)) return;

        // Save active layer ID so we can hide it later
        this.setState({ activePolygonLayerId: layer.id, mapError: null });
      } catch (e: any) {
        if (!this.isStaleApplySelectionRun(runId)) {
          this.setState({
            mapError: `Failed to apply filter: ${e?.message ?? e}`,
            mapSelectedCount: 0,
          });
        }
        return;
      }

      if (this.isStaleApplySelectionRun(runId)) return;
      this.setState({ mapSelectedCount: matched, mapError: null });

      try {
        const ext = await (layer as any).queryExtent({ where });
        if (this.isStaleApplySelectionRun(runId)) return;
        const extent = ext?.extent;
        if (extent && (view as any).goTo) {
          await (view as any).goTo(
            extent.expand ? extent.expand(1.3) : extent,
            {
              duration: 300,
            },
          );
        }
      } catch {
        // Keep polygons visible even if zoom fails.
      }
    } finally {
      if (this._applySelectionInFlightSignature === signature) {
        this._applySelectionInFlightSignature = "";
      }
    }
  };

  /** ✅ Handle single bin click - select bin and fetch raw points */
  private handleBinClick = async (payload: ScatterPoint): Promise<void> => {
    if (!payload) return;

    const key = this.binKey(payload);
    if (!key) return;

    const count = Number(payload.count ?? 0);

    // Agar bin bo'sh bo'lsa, hech narsa qilmaslik
    if (count <= 0) return;

    // Toggle selection: if already selected, deselect; otherwise select only this bin
    const isCurrentlySelected = this.state.selectedBinKeys.includes(key);

    if (isCurrentlySelected) {
      // Deselect - clear everything and zoom back to default
      this.setState({
        selectedBinKeys: [],
        rawPoints: [],
        rawPointsError: null,
        rawPointsLoading: false,
        rawPreviewOpen: false,
        viewMode: "chart",
        mapSelectedCount: 0,
      });
      // Clear map selection and zoom out
      await this.clearMapSelectionAndZoomOut();
      return;
    }

    // Select this bin only
    // ✅ Reset table sort to default when new bin is clicked
    this.setState({ tableSortField: "none", tableSortAsc: false });

    // ✅ Save current map extent BEFORE zooming (for restore on second click)
    if (!this.state.savedMapExtent) {
      try {
        const jmv = this.state.jimuMapView;
        const view = jmv?.view as __esri.MapView | __esri.SceneView | undefined;
        if (view && (view as any).extent) {
          const currentExtent = (view as any).extent;
          // Clone the extent properly
          const clonedExtent = currentExtent.clone
            ? currentExtent.clone()
            : { ...currentExtent };
          this.setState({ savedMapExtent: clonedExtent });
        }
      } catch (e) {
        // Keep selection flow working even if extent snapshot fails.
      }
    }

    this.setState(
      {
        selectedBinKeys: [key],
        rawPointsLoading: true,
        rawPointsError: null,
      },
      async () => {
        // ✅ Callback ichida - setState tugagandan keyin fetch qilamiz
        await this.fetchRawPointsForSelectedBins();
      },
    );
  };

  private fetchRawPointsForSelectedBins = async (): Promise<void> => {
    if (!this._isMounted) return;

    const xr = this.state.xRange;
    const yr = this.state.yRange;
    if (!xr || !yr) {
      this.setState({
        rawPointsError: "Missing x/y range for bin request",
        rawPoints: [],
        rawPointsLoading: false,
      });
      return;
    }

    const selectedSet = new Set(this.state.selectedBinKeys);
    if (!selectedSet.size) {
      this.setState({
        rawPoints: [],
        rawPointsError: null,
        rawPointsLoading: false,
        rawPreviewOpen: false,
        viewMode: "chart",
      });
      return;
    }

    const bins: Array<{ x: number; y: number }> = [];
    for (const b of this.state.chartData) {
      const k = this.binKey(b);
      if (selectedSet.has(k))
        bins.push({ x: Number(b.x_value), y: Number(b.y_value) });
    }

    // ✅ UI gridBins bilan mos binSize ishlatamiz
    const GRID_BINS = DEFAULT_BINS; // API bilan bir xil (50)
    const xBinSize = (xr.max - xr.min) / GRID_BINS;
    const yBinSize = (yr.max - yr.min) / GRID_BINS;

    const body: RawBinsRequest = {
      bins,
      x_bin_size: xBinSize,
      y_bin_size: yBinSize,
      x_axis: this.state.selectedXMetric,
      y_axis: this.state.selectedYMetric,
    };
    const qp = this.buildFilterQueryOnly();
    const qs = qp ? `?${qp}` : "";

    this.setState({
      rawPointsLoading: true,
      rawPointsError: null,
      rawPoints: [],
    });

    // ✅ API endpoint - /analytics/xy-chart-bins (POST)
    const url = `${API_BASE_URL}${API_ENDPOINTS.chartBins}${qs}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(
          `HTTP ${res.status}: ${res.statusText}${
            t ? ` — ${t.slice(0, 300)}` : ""
          }`,
        );
      }

      const json = (await res.json()) as RawPointsResponse;
      const data = Array.isArray(json?.data) ? json.data : [];

      if (!this._isMounted) return;

      // API returns the GlobalID in `name` field (per Swagger: XYDataPoint = {name, x, y})
      const ids = data.map((d) => this.getRawPointGlobalId(d)).filter(Boolean);

      console.log("[fetchRawPointsForSelectedBins] Bins API result:", {
        url,
        totalPoints: data.length,
        idsExtracted: ids.length,
        sampleData: data.slice(0, 2),
        sampleIds: ids.slice(0, 5),
        viloyat: this.state.selectedViloyat,
      });

      if (ids.length === 0) {
        this.setState({
          rawPoints: data,
          rawPointsLoading: false,
          rawPointsError: "Bu bin uchun polygon topilmadi",
          rawPreviewOpen: false,
          viewMode: "chart",
          mapSelectedCount: 0,
        });
        return;
      }

      // ✅ AFTER raw points received: highlight polygons on map
      await this.applySelectionToMap(ids, this.state.selectedYil);

      // ✅ Enrich rawPoints with FeatureLayer data (fermer_nom, ekin_turi, maydon)
      let enrichedData = data;
      try {
        const layer = await this.getQueryFeatureLayerFromSelectedDs(
          this.state.selectedYil,
        );
        if (layer && ids.length > 0) {
          const idFieldRaw = await this.resolveBestIdFieldForSourceIds(
            layer,
            ids,
          );
          const idField =
            this.resolveFieldName(layer, idFieldRaw) ||
            this.resolveFieldName(layer, "globalid") ||
            idFieldRaw;
          const xField =
            this.resolveFieldName(layer, this.state.selectedXMetric) ||
            this.state.selectedXMetric;
          const yField =
            this.resolveFieldName(layer, this.state.selectedYMetric) ||
            this.state.selectedYMetric;

          // Try to resolve field names for fermer_nom, ekin_turi, maydon
          const fermerField =
            this.resolveFieldName(layer, "fermer_nom") ||
            this.resolveFieldName(layer, "fermer") ||
            null;
          const ekinTuriField =
            this.resolveFieldName(layer, "ekin_turi") ||
            this.resolveFieldName(layer, "ekin_turi_nomi") ||
            this.resolveFieldName(layer, "crop_type") ||
            null;
          const maydonField =
            this.resolveFieldName(layer, "maydon") ||
            this.resolveFieldName(layer, "maydon_ga") ||
            this.resolveFieldName(layer, "area") ||
            this.resolveFieldName(layer, "area_ga") ||
            null;

          const candidateOutFields = [
            idField,
            xField,
            yField,
            fermerField,
            ekinTuriField,
            maydonField,
          ].filter(Boolean) as string[];

          const outFields = Array.from(
            new Set(
              candidateOutFields
                .map((field) => this.resolveFieldName(layer, field) || "")
                .filter(Boolean),
            ),
          );

          let features: __esri.Graphic[] = [];
          try {
            features = await this.queryPolygonsByIdsChunked(
              layer,
              idField,
              ids,
              outFields,
            );
          } catch (idQueryError: any) {
            console.warn(
              `[fetchRawPoints] ID enrichment query failed; fallbacking to bin range. idField=${idField} message=${idQueryError?.message ?? idQueryError}`,
            );
            features = [];
          }

          if (!features.length) {
            features = await this.queryPolygonsBySelectedBinRanges(
              layer,
              outFields,
            );
            if (features.length) {
              console.log(
                `[fetchRawPoints] Fallbacked to bin-range layer query: features=${features.length}`,
              );
              enrichedData = this.mapFeaturesToRawPoints(layer, features);
            }
          }

          if (features.length && enrichedData === data) {
            // Create a map of GlobalID -> attributes
            const attrsMap = new Map<string, any>();
            for (const feat of features) {
              const gid = this.normalizeGuid(
                String((feat as any)?.attributes?.[idField] ?? ""),
              );
              if (gid) {
                attrsMap.set(gid, (feat as any)?.attributes ?? {});
              }
            }

            // Enrich rawPoints with FeatureLayer attributes
            enrichedData = data.map((point) => {
              const gid = this.normalizeGuid(this.getRawPointGlobalId(point));
              const attrs = attrsMap.get(gid) || {};

              return {
                ...point,
                fermer_nom: attrs[fermerField || ""] || undefined,
                ekin_turi: attrs[ekinTuriField || ""] || undefined,
                maydon: attrs[maydonField || ""] || undefined,
              };
            });
          }
        }
      } catch (enrichError: any) {
        console.warn(
          "[fetchRawPoints] Failed to enrich with FeatureLayer data:",
          enrichError,
        );
        // Continue with original data if enrichment fails
        enrichedData = data;
      }

      // Xaritada ko'rsatildi, chart rejimida qoladi (jadval yo'q)
      this.setState({
        rawPoints: enrichedData,
        rawPointsLoading: false,
        rawPointsError: null,
        rawPreviewOpen: false,
        viewMode: "chart",
      });
    } catch (e: any) {
      if (!this._isMounted) return;
      this.setState({
        rawPointsLoading: false,
        rawPointsError: `Raw points request failed. ${
          e?.message ? String(e.message) : String(e)
        }`,
        rawPoints: [],
        viewMode: "chart",
      });
    }
  };

  /** ✅ Pick polygon FeatureLayer: prefer widget config URL, else auto-detect in map */
  /** ✅ Pick polygon layer ONLY from selected DataSource/url */
  private getTargetPolygonLayerForSelection =
    async (): Promise<FeatureLayer | null> => {
      const url = this.getPolygonLayerUrl();
      if (!url) return null;

      // ensure layer exists in map only after lasso
      const lyr = await this.ensurePolygonLayerInMapAfterLasso();
      return lyr;
    };

  /** ✅ Resolve a field name in a layer case-insensitively. Returns exact field.name or null. */
  private resolveFieldName = (
    layer: FeatureLayer,
    desired: string,
  ): string | null => {
    const want = (desired || "").trim();
    if (!want) return null;

    const fields = (layer.fields || []) as Array<{ name: string }>;
    const hit = fields.find(
      (f) => (f?.name || "").toLowerCase() === want.toLowerCase(),
    );
    return hit?.name ?? null;
  };

  /**
   * ✅ Query features safely even when server has maxRecordCount limits:
   * 1) queryObjectIds(where)
   * 2) chunk objectIds
   * 3) queryFeatures(objectIds chunk)
   */
  private queryFeaturesByWhereChunked = async (
    layer: FeatureLayer,
    where: string,
    outFields: string[],
  ): Promise<__esri.Graphic[]> => {
    try {
      const objectIds = await this.withDefinitionExpressionDisabled(
        layer,
        async () => {
          const ids = await layer.queryObjectIds({ where } as any);
          return Array.isArray(ids) ? ids : [];
        },
      );

      if (!objectIds.length) return [];

      const chunks = this.chunkArray(objectIds, 500);
      const feats: __esri.Graphic[] = [];

      await this.withDefinitionExpressionDisabled(layer, async () => {
        for (const chunk of chunks) {
          const fs = await layer.queryFeatures({
            objectIds: chunk,
            outFields,
            returnGeometry: false,
          } as any);
          feats.push(...(((fs as any)?.features || []) as __esri.Graphic[]));
        }
      });

      console.log(
        `[queryFeaturesByWhereChunked] Returned ${
          feats.length
        } features for where: ${where.substring(0, 100)}...`,
      );
      return feats;
    } catch (error: any) {
      console.warn("[queryFeaturesByWhereChunked] Error:", error);
      return [];
    }
  };

  private backToChart = (): void => {
    // ✅ Switch UI back to heatmap, but KEEP the fetched polygons on map
    this.setState({ viewMode: "chart", rawPreviewOpen: false });
  };

  private fetchData = async (): Promise<void> => {
    if (!this._isMounted) return;

    if (!this.state.selectedYil?.trim()) {
      this.clearSelection();
      this.setState({
        loading: false,
        error: null,
        chartData: [],
        rawApiData: null,
        xRange: null,
        yRange: null,
        totalPoints: 0,
        maxBinCount: 1,
        nonEmptyBins: 0,
        lassoEnabled: false,
      });
      return;
    }

    try {
      this.setState({ loading: true, error: null });

      const queryParams = this.buildApiParams();
      const url = `${API_BASE_URL}${API_ENDPOINTS.chartData}?${queryParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const apiData: ApiDensityResponse = await response.json();
      if (!this._isMounted) return;

      if (!apiData || !Array.isArray(apiData.data)) {
        throw new Error("Invalid data structure received from API");
      }

      let xRange = this.normalizeRange(apiData.x_range);
      let yRange = this.normalizeRange(apiData.y_range);

      const isGroupedMode = this.state.selectedGroupBy !== "fermer_nom";

      let grid: ScatterPoint[];
      let nonEmpty: number;
      let maxCount: number;

      if (isGroupedMode) {
        // tuman/ekin_turi mode: use data directly as scatter points (no binning)
        // ✅ Debug: API response strukturasini tekshirish
        if (apiData.data && apiData.data.length > 0) {
          console.log("[fetchData] API response sample:", apiData.data[0]);
          console.log(
            "[fetchData] API response keys:",
            Object.keys(apiData.data[0] || {}),
          );
        }

        grid = apiData.data.map((d: any) => {
          // ✅ Maydon ma'lumotlarini API dan olish (barcha variantlarni tekshirish)
          let maydonValue: number | undefined = undefined;

          // Barcha mumkin bo'lgan field nomlarini tekshirish
          const maydonFields = [
            "maydon",
            "maydon_ga",
            "area",
            "area_ga",
            "maydoni",
            "maydoni_ga",
            "yuzasi",
            "yuzasi_ga",
            "total_area",
            "total_maydon",
            "sum_area",
            "sum_maydon",
          ];

          for (const field of maydonFields) {
            if (
              d[field] !== undefined &&
              d[field] !== null &&
              d[field] !== ""
            ) {
              const val = Number(d[field]);
              if (!isNaN(val) && val > 0) {
                maydonValue = val;
                break;
              }
            }
          }

          return {
            x_value: Number(d.x ?? 0),
            y_value: Number(d.y ?? 0),
            count: Number(d.count ?? 0),
            name: d.name ?? "",
            maydon: maydonValue,
          };
        });

        // ✅ Debug: Maydon ma'lumotlarini tekshirish
        const maydonCount = grid.filter(
          (p: any) => p.maydon !== undefined && p.maydon > 0,
        ).length;
        console.log(
          `[fetchData] Grouped mode: ${grid.length} items, ${maydonCount} with maydon`,
        );
        nonEmpty = grid.length;
        maxCount = Math.max(1, ...grid.map((p) => p.count));

        // Calculate xRange/yRange from actual data points with padding
        if (grid.length > 0) {
          const xValues = grid.map((p) => p.x_value);
          const yValues = grid.map((p) => p.y_value);
          const xMin = Math.min(...xValues);
          const xMax = Math.max(...xValues);
          const yMin = Math.min(...yValues);
          const yMax = Math.max(...yValues);

          // Add 5% padding to prevent bins from touching edges
          const xPad = (xMax - xMin) * 0.05 || 1;
          const yPad = (yMax - yMin) * 0.05 || 1;

          xRange = {
            min: xMin - xPad,
            max: xMax + xPad,
            binSize: 0,
          };
          yRange = {
            min: yMin - yPad,
            max: yMax + yPad,
            binSize: 0,
          };
        }

        // ✅ Grouped mode da maydon ma'lumotlarini FeatureLayer dan enrich qilish
        if (grid.length > 0) {
          const hasMaydon = grid.some(
            (p: any) =>
              p.maydon !== undefined && p.maydon !== null && p.maydon > 0,
          );
          console.log(`[fetchData] Has maydon from API: ${hasMaydon}`);

          // Agar API dan maydon kelmasa, FeatureLayer dan enrich qilamiz
          if (!hasMaydon) {
            console.log("[fetchData] Starting enrichment...");
            try {
              const enrichedGrid = await this.enrichGroupedModeMaydon(
                grid,
                this.state.selectedGroupBy,
                this.state.selectedYil,
              );
              if (enrichedGrid && enrichedGrid.length > 0) {
                grid = enrichedGrid;
                console.log("[fetchData] Enrichment completed, grid updated");
              }
            } catch (err) {
              console.warn("[fetchData] Enrichment failed:", err);
            }
          }
        }
      } else {
        // fermer_nom mode: build heatmap grid
        if (xRange)
          xRange = this.adjustRangeToEdgesIfNeeded(xRange, apiData.data, "x");
        if (yRange)
          yRange = this.adjustRangeToEdgesIfNeeded(yRange, apiData.data, "y");

        const result = this.buildFullGrid(apiData.data, xRange, yRange);
        grid = result.grid;
        nonEmpty = result.nonEmpty;
        maxCount = result.maxCount;
      }

      const totalPoints = Number(apiData.total_points ?? 0);

      // ✅ Clear cached pixel coords when data changes
      this._binPixelCoords.clear();

      // ✅ Maydon ma'lumotlarini FeatureLayer dan enrich qilish (agar API dan kelmasa)
      // Ehtiyotkorlik: Bu async operatsiya, lekin state'ni darhol yangilash kerak
      if (isGroupedMode && grid.length > 0) {
        const hasMaydon = grid.some(
          (p: any) =>
            p.maydon !== undefined && p.maydon !== null && p.maydon > 0,
        );
        console.log(
          `[fetchData] Has maydon from API: ${hasMaydon}, grid length: ${grid.length}`,
        );

        if (!hasMaydon) {
          console.log("[fetchData] Starting enrichment immediately...");
          // Darhol enrich qilish (await qilamiz, chunki state'ni yangilash kerak)
          try {
            const enrichedGrid = await this.enrichGroupedModeMaydon(
              grid,
              this.state.selectedGroupBy,
              this.state.selectedYil,
            );
            if (enrichedGrid && enrichedGrid.length > 0) {
              grid = enrichedGrid;
              console.log(
                "[fetchData] Enrichment completed, grid updated with maydon data",
              );
            }
          } catch (err) {
            console.warn("[fetchData] Enrichment failed:", err);
          }
        }
      }

      // ✅ whenever data refresh, remove selection + map highlight
      this.clearMapSelection();

      this.setState({
        viewMode: "chart",
        rawApiData: apiData,
        chartData: grid,
        xRange,
        yRange,
        totalPoints,
        maxBinCount: maxCount,
        nonEmptyBins: nonEmpty,
        loading: false,
        error: null,

        lassoEnabled: false,
        lassoDrawing: false,
        lassoPath: [],
        selectedBinKeys: [],
        rawPoints: [],
        rawPointsError: null,
        rawPointsLoading: false,
        rawPreviewOpen: false,

        mapSelectedCount: 0,
        mapError: null,
      });
    } catch (error: any) {
      if (!this._isMounted) return;
      this.setState({ error: `API Error: ${error.message}`, loading: false });
    }
  };

  /** ✅ Background'da grouped mode maydon ma'lumotlarini enrich qilish */
  private enrichGroupedModeMaydon = async (
    currentGrid: ScatterPoint[],
    selectedGroupBy: GroupByType,
    selectedYil: string | null,
  ): Promise<ScatterPoint[]> => {
    if (!this._isMounted || !selectedYil) {
      return currentGrid || [];
    }

    try {
      const layer = await this.getQueryFeatureLayerFromSelectedDs(selectedYil);
      if (!layer) {
        console.warn("[enrichGroupedModeMaydon] No layer found");
        return currentGrid || [];
      }

      const groupByField =
        selectedGroupBy === "tuman"
          ? this.resolveFieldName(layer, "tuman") ||
            this.resolveFieldName(layer, "tuman_nomi") ||
            null
          : this.resolveFieldName(layer, "ekin_turi") ||
            this.resolveFieldName(layer, "ekin_turi_nomi") ||
            this.resolveFieldName(layer, "crop_type") ||
            null;

      const maydonField =
        this.resolveFieldName(layer, "maydon") ||
        this.resolveFieldName(layer, "maydon_ga") ||
        this.resolveFieldName(layer, "area") ||
        this.resolveFieldName(layer, "area_ga") ||
        null;

      if (!groupByField || !maydonField) {
        console.warn("[enrichGroupedModeMaydon] Missing fields:", {
          groupByField,
          maydonField,
          selectedGroupBy,
        });
        return currentGrid || [];
      }

      console.log("[enrichGroupedModeMaydon] Starting enrichment:", {
        groupByField,
        maydonField,
        selectedGroupBy,
        gridLength: currentGrid.length,
      });

      // Barcha grouped item nomlarini olish
      const groupNames = currentGrid
        .map((item) => item.name)
        .filter((name): name is string => Boolean(name));

      if (groupNames.length === 0) {
        console.warn("[enrichGroupedModeMaydon] No group names found");
        return currentGrid || [];
      }

      console.log(
        "[enrichGroupedModeMaydon] Group names:",
        groupNames.slice(0, 5),
      );

      // Barcha grouped itemlar uchun bir marta query qilish (IN clause)
      const escapedNames = groupNames.map(
        (name) => `'${name.replace(/'/g, "''")}'`,
      );

      // WHERE clause ni chunk qilish (SQL IN clause limit)
      // Ehtiyotkorlik: chunk size'ni kichikroq qilish (SQL IN clause limit)
      const chunkSize = 50; // Kichikroq chunk size
      const nameChunks = this.chunkArray(escapedNames, chunkSize);

      console.log(
        `[enrichGroupedModeMaydon] Querying ${nameChunks.length} chunks`,
      );

      let allFeatures: __esri.Graphic[] = [];

      for (let i = 0; i < nameChunks.length; i++) {
        const nameChunk = nameChunks[i];
        const where = `${groupByField} IN (${nameChunk.join(",")})`;
        console.log(
          `[enrichGroupedModeMaydon] Querying chunk ${i + 1}/${
            nameChunks.length
          }`,
        );

        try {
          // To'g'ridan-to'g'ri query qilish (queryFeaturesByWhereChunked o'rniga)
          const fs = await layer.queryFeatures({
            where: where,
            outFields: [groupByField, maydonField],
            returnGeometry: false,
            num: 100000,
          } as any);

          const features = (fs?.features || []) as __esri.Graphic[];
          allFeatures.push(...features);
          console.log(
            `[enrichGroupedModeMaydon] Chunk ${i + 1} returned ${
              features.length
            } features`,
          );
        } catch (chunkError: any) {
          console.warn(
            `[enrichGroupedModeMaydon] Chunk ${i + 1} failed:`,
            chunkError,
          );
          // Continue with next chunk
        }
      }

      // Barcha feature'larni grouplab maydon yig'indisini hisoblash
      const maydonMap = new Map<string, number>();
      console.log(
        `[enrichGroupedModeMaydon] Processing ${allFeatures.length} features`,
      );

      for (const feat of allFeatures) {
        const attrs = (feat as any)?.attributes ?? {};
        const groupName = String(attrs[groupByField] ?? "").trim();
        const maydonVal = Number(attrs[maydonField] ?? 0);

        if (groupName && !isNaN(maydonVal) && maydonVal > 0) {
          const current = maydonMap.get(groupName) ?? 0;
          maydonMap.set(groupName, current + maydonVal);
        }
      }

      console.log(
        "[enrichGroupedModeMaydon] Maydon map:",
        Array.from(maydonMap.entries()).slice(0, 5),
      );

      if (!this._isMounted || !currentGrid || currentGrid.length === 0) {
        return currentGrid || [];
      }

      // Enriched grid'ni yaratish - faqat maydon ma'lumotlarini yangilash
      const enrichedGrid = currentGrid.map((p: any) => {
        const newMaydon = maydonMap.get(p.name);
        // Agar maydon topilsa, yangilash
        if (newMaydon !== undefined && newMaydon > 0) {
          return { ...p, maydon: newMaydon };
        }
        return p;
      });

      console.log("[enrichGroupedModeMaydon] Enrichment completed:", {
        originalCount: currentGrid.length,
        enrichedCount: enrichedGrid.length,
        maydonMapSize: maydonMap.size,
        sampleMaydon: Array.from(maydonMap.entries()).slice(0, 3),
      });

      // Enriched grid'ni qaytarish
      return enrichedGrid;
    } catch (enrichError: any) {
      console.warn(
        "[enrichGroupedModeMaydon] Failed to enrich maydon:",
        enrichError,
      );
      return currentGrid || [];
    }
  };

  /** ✅ normalize Immutable/array-like -> plain array */
  private toPlainArray<T = any>(val: any): T[] {
    if (!val) return [];
    if (Array.isArray(val)) return val as T[];
    if (typeof val.asMutable === "function")
      return val.asMutable({ deep: true }) as T[];
    if (typeof val.toArray === "function") return val.toArray() as T[];
    return [];
  }

  /** ✅ get the selected (first) UseDataSource from props */
  private getSelectedUseDataSource(props: any = this.props): any | null {
    const list = this.toPlainArray<any>((props as any)?.useDataSources);
    return list?.[0] ?? null;
  }

  /** ✅ get URL of the selected DS (FeatureLayer) from appConfig */
  private getSelectedLayerUrlFromDataSource(
    props: any = this.props,
  ): string | null {
    try {
      const useDs = this.getSelectedUseDataSource(props);
      if (!useDs) return null;

      const dsId = String(
        useDs?.mainDataSourceId || useDs?.dataSourceId || "",
      ).trim();
      if (!dsId) return null;

      const state = getAppStore().getState();
      const dsJson = state?.appConfig?.dataSources?.[dsId];
      const url = (dsJson?.url ?? "").toString().trim();
      return url || null;
    } catch {
      return null;
    }
  }

  /** ✅ normalize urls for compare */
  private normalizeUrl(u: string): string {
    return String(u || "")
      .trim()
      .replace(/\/+$/, "");
  }

  private closeAxisMenu = (e?: Event) => {
    if (!this._isMounted) return;
    if (!this.state.openAxisMenu) return;

    if (e?.target) {
      const target = e.target as Node;
      const xr = this.axisXRef.current;
      const yr = this.axisYRef.current;
      if ((xr && xr.contains(target)) || (yr && yr.contains(target))) return;
    }

    this.setState({ openAxisMenu: null });
  };

  private handleAxisEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.closeAxisMenu();
  };

  private handleAxisOutsideClick = (e: MouseEvent) => {
    if (!this.state.openAxisMenu) return;
    const target = e.target as Node;
    const xr = this.axisXRef.current;
    const yr = this.axisYRef.current;
    const insideX = xr && xr.contains(target);
    const insideY = yr && yr.contains(target);
    if (!insideX && !insideY) this.closeAxisMenu();
  };

  private toggleAxisMenu = (axis: "x" | "y", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      openAxisMenu: this.state.openAxisMenu === axis ? null : axis,
    });
  };

  private chooseMetric = (axis: "x" | "y", metric: AxisMetric) => {
    const { selectedXMetric, selectedYMetric } = this.state;
    if (axis === "x") {
      if (metric === selectedYMetric) return;
      this.setState(
        {
          selectedXMetric: metric,
          openAxisMenu: null,
        },
        () => this.throttledFetchData(),
      );
    } else {
      if (metric === selectedXMetric) return;
      this.setState(
        {
          selectedYMetric: metric,
          openAxisMenu: null,
        },
        () => this.throttledFetchData(),
      );
    }
  };

  private renderAxisSelectors = (
    margin: { top: number; right: number; bottom: number; left: number },
    stageHeight: number,
  ): JSX.Element => {
    const { openAxisMenu, selectedXMetric, selectedYMetric } = this.state;

    const xLabel = this.getLocalizedMetricLabel(selectedXMetric);
    const yLabel = this.getLocalizedMetricLabel(selectedYMetric);

    // ========= Button sizes (must match your CSS-ish reality)
    const X_BTN_H = 34;
    const Y_BTN_W = 34; // because vertical writing-mode pill is ~34px wide

    // ========= Small visual offsets (tweak if you want)
    const X_AXIS_OFFSET_UP = -10; // move down to prevent overlap with chart
    const Y_AXIS_OFFSET_LEFT = 20; // move more left to prevent overlap on resize

    // Plot area inside stage:
    // left edge  = margin.left
    // right edge = stageWidth - margin.right (we only need center X, so use calc)
    const plotCenterX = `calc(${margin.left}px + (100% - ${
      margin.left + margin.right
    }px) / 2)`;
    const plotCenterY =
      margin.top + (stageHeight - margin.top - margin.bottom) / 2;

    // === Place X pill centered ON the X-axis line:
    // X-axis line is at y = stageHeight - margin.bottom
    // We want the pill centered around that line (slightly above)
    const axisXStyle: React.CSSProperties = {
      left: plotCenterX,
      top: stageHeight - margin.bottom - X_BTN_H / 2 - X_AXIS_OFFSET_UP,
      transform: "translateX(-50%)",
    };

    // === Place Y pill centered ON the Y-axis line:
    // Y-axis line is at x = margin.left
    // We want pill centered around that line (slightly left)
    const axisYStyle: React.CSSProperties = {
      left: margin.left - Y_BTN_W / 2 - Y_AXIS_OFFSET_LEFT,
      top: plotCenterY,
      transform: "translateY(-50%)",
    };

    const renderMenu = (axis: "x" | "y") => {
      const isOpen = openAxisMenu === axis;
      const current = axis === "x" ? selectedXMetric : selectedYMetric;
      if (!isOpen) return null;

      return (
        <div className={`axis-menu axis-menu-${axis}`} role="menu">
          <div className="axis-menu-head">
            <span className="axis-menu-title">
              {axis === "x" ? this.t("xAxisMetric") : this.t("yAxisMetric")}
            </span>
          </div>

          <div className="axis-menu-list" role="listbox">
            {METRICS.map((m) => {
              const disabled =
                axis === "x"
                  ? m.key === selectedYMetric
                  : m.key === selectedXMetric;
              const active = m.key === current;
              const localizedLabel = this.getLocalizedMetricLabel(m.key);

              return (
                <button
                  key={`${axis}-${m.key}`}
                  type="button"
                  className={`axis-menu-item ${active ? "active" : ""} ${
                    disabled ? "disabled" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!disabled) this.chooseMetric(axis, m.key);
                  }}
                  disabled={disabled}
                  role="option"
                  aria-selected={active}
                >
                  <div className="axis-item-left">
                    <div className="axis-item-label">{localizedLabel}</div>
                    <div className="axis-item-code">{m.key}</div>
                  </div>

                  {disabled ? (
                    <div className="axis-lock">🔒</div>
                  ) : active ? (
                    <div className="axis-check">✓</div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="axis-selectors" aria-label="Axis metric selectors">
        <div
          className="axis-selector axis-x"
          ref={this.axisXRef}
          style={axisXStyle}
        >
          <button
            type="button"
            className={`axis-label-btn axis-label-btn-x ${
              openAxisMenu === "x" ? "open" : ""
            }`}
            onClick={(e) => this.toggleAxisMenu("x", e)}
            title="Change X-axis metric"
          >
            <span className="axis-prefix">X</span>
            <span className="axis-label-text">{xLabel}</span>
            <span className="axis-chevron">▼</span>
          </button>
          {renderMenu("x")}
        </div>

        <div
          className="axis-selector axis-y"
          ref={this.axisYRef}
          style={axisYStyle}
        >
          <button
            type="button"
            className={`axis-label-btn axis-label-btn-y ${
              openAxisMenu === "y" ? "open" : ""
            }`}
            onClick={(e) => this.toggleAxisMenu("y", e)}
            title="Change Y-axis metric"
          >
            <span className="axis-prefix">Y</span>
            <span className="axis-label-text">{yLabel}</span>
            <span className="axis-chevron">▼</span>
          </button>
          {renderMenu("y")}
        </div>
      </div>
    );
  };

  /** Find the densest point (point with maximum count) from bubble data */
  private calculateDensityCentroid = (
    data: Array<{ x: number; y: number; count?: number; name?: string }>,
  ): { x: number; y: number } | null => {
    if (!data || data.length === 0) return null;

    // Find the point with the maximum count (densest point)
    let maxCount = 0;
    let densestPoint: { x: number; y: number } | null = null;

    for (const point of data) {
      const count = point.count ?? 1;
      if (count > maxCount) {
        maxCount = count;
        densestPoint = { x: point.x, y: point.y };
      }
    }

    return densestPoint;
  };

  /** Find the WEIGHTED AVERAGE center for heatmap data (crosshair always shows average) */
  private calculateHeatmapCentroid = (
    data: Array<{
      x_value: number;
      y_value: number;
      count: number;
      name?: string;
    }>,
  ): { x: number; y: number } | null => {
    if (!data || data.length === 0) return null;

    // ✅ Calculate WEIGHTED AVERAGE (o'rtacha qiymat) - not maximum
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (const point of data) {
      const count = Number(point.count) || 0;
      if (count <= 0) continue;

      const x = Number(point.x_value);
      const y = Number(point.y_value);

      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

      weightedX += x * count;
      weightedY += y * count;
      totalWeight += count;
    }

    if (totalWeight <= 0) return null;

    const result = {
      x: weightedX / totalWeight,
      y: weightedY / totalWeight,
    };

    return result;
  };

  private CustomTooltip = ({
    active,
    payload,
  }: CustomTooltipProps): JSX.Element | null => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    if (!data) return null;
    if (Number(data.count) <= 0) return null;

    const xLabel = this.getLocalizedMetricLabel(this.state.selectedXMetric);
    const yLabel = this.getLocalizedMetricLabel(this.state.selectedYMetric);

    const isGroupedMode = this.state.selectedGroupBy !== "fermer_nom";
    const groupByLabel =
      this.state.selectedGroupBy === "fermer_nom"
        ? this.t("fermer")
        : this.state.selectedGroupBy === "tuman"
          ? this.t("tuman")
          : this.t("ekinTuri");

    const pct =
      this.state.totalPoints > 0
        ? (Number(data.count) / this.state.totalPoints) * 100
        : 0;

    const xr = this.state.xRange;
    const yr = this.state.yRange;
    const halfX = xr && !isGroupedMode ? xr.binSize / 2 : 0;
    const halfY = yr && !isGroupedMode ? yr.binSize / 2 : 0;

    const x0 = xr ? Number(data.x_value) - halfX : Number(data.x_value);
    const x1 = xr ? Number(data.x_value) + halfX : Number(data.x_value);
    const y0 = yr ? Number(data.y_value) - halfY : Number(data.y_value);
    const y1 = yr ? Number(data.y_value) + halfY : Number(data.y_value);

    return (
      <div className="chart-tooltip">
        <div className="tooltip-header">
          {isGroupedMode ? groupByLabel : this.t("binHeatmap")}
        </div>
        <div className="tooltip-content">
          {isGroupedMode && data.name && (
            <div className="tooltip-row" style={{ marginBottom: 6 }}>
              <span className="label" style={{ fontWeight: 600 }}>
                {groupByLabel}:
              </span>
              <span
                className="value"
                style={{ fontWeight: 700, color: "#3498db" }}
              >
                {data.name}
              </span>
            </div>
          )}
          <div className="tooltip-row">
            <span className="label">
              {xLabel}
              {isGroupedMode ? "" : ` (${this.t("center")})`}:
            </span>
            <span className="value">
              {this.formatMetricValue(
                this.state.selectedXMetric,
                Number(data.x_value),
              )}
            </span>
          </div>
          <div className="tooltip-row">
            <span className="label">
              {yLabel}
              {isGroupedMode ? "" : ` (${this.t("center")})`}:
            </span>
            <span className="value">
              {this.formatMetricValue(
                this.state.selectedYMetric,
                Number(data.y_value),
              )}
            </span>
          </div>

          {xr && !isGroupedMode ? (
            <div className="tooltip-row">
              <span className="label">{this.t("xBin")}:</span>
              <span className="value">
                {this.formatMetricValue(this.state.selectedXMetric, x0)} –{" "}
                {this.formatMetricValue(this.state.selectedXMetric, x1)}
              </span>
            </div>
          ) : null}

          {yr && !isGroupedMode ? (
            <div className="tooltip-row">
              <span className="label">{this.t("yBin")}:</span>
              <span className="value">
                {this.formatMetricValue(this.state.selectedYMetric, y0)} –{" "}
                {this.formatMetricValue(this.state.selectedYMetric, y1)}
              </span>
            </div>
          ) : null}

          <div className="tooltip-row">
            <span className="label">{this.t("countReal")}:</span>
            <span className="value">{Number(data.count).toLocaleString()}</span>
          </div>
          <div className="tooltip-row">
            <span className="label">{this.t("share")}:</span>
            <span className="value">{pct.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    );
  };

  /** ✅ Indikatorlar va jadval - bin bosilganda ko'rsatiladi */
  private renderSelectedList = (): JSX.Element => {
    const { rawPoints, rawPointsLoading, selectedBinKeys, focusedGlobalId } =
      this.state;

    // Agar bin tanlanmagan yoki ma'lumot yo'q bo'lsa, hech narsa ko'rsatmaslik
    if (!selectedBinKeys.length || (!rawPoints.length && !rawPointsLoading)) {
      return null;
    }

    // Loading holati
    if (rawPointsLoading) {
      return (
        <div
          className="selected-polygons-panel"
          style={{
            marginTop: 0,
            padding: 16,
            background: "var(--bg-secondary, #2c3e50)",
            borderRadius: 8,
            textAlign: "center",
            color: "var(--text-secondary, #bdc3c7)",
          }}
        >
          {this.t("loadingRaw") || "Ma'lumotlar yuklanmoqda..."}
        </div>
      );
    }

    if (!rawPoints.length) return null;

    // ✅ API x va y field'laridan foydalanish
    // x = X o'qi metrikasi (masalan: uwt_m3ha - suv istemoli)
    // y = Y o'qi metrikasi (masalan: yld_tot - hosildorlik)
    const xMetric = this.state.selectedXMetric; // "uwt_m3ha" yoki boshqa
    const yMetric = this.state.selectedYMetric; // "yld_tot" yoki boshqa

    // ✅ Tartiblash uchun
    const { tableSortField, tableSortAsc } = this.state;

    // ✅ WP hisoblash funksiyasi
    const calcWP = (p: RawPoint): number => {
      const x = Number(p.x || 0);
      const y = Number(p.y || 0);
      return x > 0 ? (y * 10) / x : 0;
    };

    // ✅ Tartiblangan rawPoints (none = original tartib)
    const sortedPoints =
      tableSortField === "none"
        ? rawPoints
        : [...rawPoints].sort((a, b) => {
            // Fermer nomi va Ekin turi - alfavit bo'yicha
            if (tableSortField === "fermer") {
              const aVal = String(
                (a as any).fermer_nom ||
                  (a as any).fermer ||
                  (a as any).fermer_nomi ||
                  a.name ||
                  "",
              ).toLowerCase();
              const bVal = String(
                (b as any).fermer_nom ||
                  (b as any).fermer ||
                  (b as any).fermer_nomi ||
                  b.name ||
                  "",
              ).toLowerCase();
              return tableSortAsc
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }
            if (tableSortField === "ekin_turi") {
              const aVal = String(
                (a as any).ekin_turi ||
                  (a as any).ekin_turi_nomi ||
                  (a as any).crop_type ||
                  (a as any).crop ||
                  "",
              ).toLowerCase();
              const bVal = String(
                (b as any).ekin_turi ||
                  (b as any).ekin_turi_nomi ||
                  (b as any).crop_type ||
                  (b as any).crop ||
                  "",
              ).toLowerCase();
              return tableSortAsc
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }
            // Maydon - qiymat bo'yicha
            if (tableSortField === "maydon") {
              const aVal =
                Number((a as any).maydon) ||
                Number((a as any).maydon_ga) ||
                Number((a as any).area) ||
                Number((a as any).area_ga) ||
                0;
              const bVal =
                Number((b as any).maydon) ||
                Number((b as any).maydon_ga) ||
                Number((b as any).area) ||
                Number((b as any).area_ga) ||
                0;
              return tableSortAsc ? aVal - bVal : bVal - aVal;
            }
            // X, Y, WP - raqamli qiymatlar
            let aVal: number, bVal: number;
            if (tableSortField === "x") {
              aVal = Number(a.x || 0);
              bVal = Number(b.x || 0);
            } else if (tableSortField === "y") {
              aVal = Number(a.y || 0);
              bVal = Number(b.y || 0);
            } else {
              aVal = calcWP(a);
              bVal = calcWP(b);
            }
            return tableSortAsc ? aVal - bVal : bVal - aVal;
          });

    // ✅ O'rtacha qiymatlarni hisoblash - x va y field'larini ishlatamiz
    const calcAvg = (field: "x" | "y"): number => {
      const values = rawPoints
        .map((p) => Number(p[field] || 0))
        .filter((v) => !isNaN(v) && v > 0);
      if (!values.length) return 0;
      return values.reduce((a, b) => a + b, 0) / values.length;
    };

    const avgX = calcAvg("x"); // X o'qi qiymati (suv istemoli)
    const avgY = calcAvg("y"); // Y o'qi qiymati (hosildorlik)
    // WP = Yield / Water (kg/m³)
    const avgWP = avgX > 0 ? (avgY * 10) / avgX : 0; // s/ga -> kg/ga (*100), keyin m³/ga ga bo'lish

    // ✅ Sort button click handler
    const handleSortClick = (
      field: "x" | "y" | "wp" | "fermer" | "ekin_turi" | "maydon",
    ) => {
      if (tableSortField === field) {
        // Xuddi shu field bosildi - yo'nalishni o'zgartirish
        this.setState({ tableSortAsc: !tableSortAsc });
      } else {
        // Yangi field - alfavit uchun ascending, raqam uchun descending bilan boshlash
        const isAscending =
          field === "fermer" || field === "ekin_turi" ? true : false;
        this.setState({ tableSortField: field, tableSortAsc: isAscending });
      }
    };

    // ✅ Sort icon
    const getSortIcon = (
      field: "x" | "y" | "wp" | "fermer" | "ekin_turi" | "maydon",
    ) => {
      if (tableSortField !== field) return "↕";
      return tableSortAsc ? "↑" : "↓";
    };

    // ✅ Jadval uchun row click handler
    const handleRowClick = async (point: RawPoint) => {
      const gidRaw = this.getRawPointGlobalId(point);
      const gid = this.normalizeGuid(gidRaw);
      if (!gid) return;

      const currentFocused = this.normalizeGuid(focusedGlobalId || "");
      const isCurrentlyFocused = currentFocused === gid;

      if (isCurrentlyFocused) {
        // Ikkinchi marta bosildi: row focusni yechib, bin selection xaritasini qayta tiklash
        this.setState({ focusedGlobalId: "" });
        await this.restoreSelectedBinPolygons();
      } else {
        // Birinchi marta bosildi: aynan shu maydonga zoom
        this.setState({ focusedGlobalId: gid });
        await this.focusPolygonFromList(gid);
      }
    };

    // ✅ Jadvalda faqat 10 ta element ko'rsatish (FERMER REJIMIDA EMAS - HAMMASI CHIQADI)
    const MAX_TABLE_ITEMS = 10;
    const isFermerMode = this.state.selectedGroupBy === "fermer_nom";

    // Fermer rejimida: hamma qatorlar ko'rsatiladi
    // Tuman/Ekin rejimida: 10 tadan kam bo'lsa ko'rsatiladi
    const displayPoints = isFermerMode
      ? sortedPoints
      : sortedPoints.slice(0, MAX_TABLE_ITEMS);
    const hasMoreItems = !isFermerMode && sortedPoints.length > MAX_TABLE_ITEMS;

    // Fermer rejimida: hamma jadval ko'rsatiladi
    // Tuman/Ekin rejimida: 10 tadan kam bo'lsa ko'rsatiladi
    const showTable = isFermerMode || rawPoints.length <= MAX_TABLE_ITEMS;

    return (
      <div
        className="selected-list-panel"
        style={{
          marginTop: 0,
          padding: "0 8px 8px 8px",
          background: "var(--widget-bg-tertiary, #3a4a5c)",
          borderRadius: 6,
          borderTop: "2px solid var(--border-accent, #3498db)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
          flex: "1 1 auto" /* O'zgaruvchan - scrollable */,
          minHeight: 0,
          overflow: "hidden" /* Jadval ichida scroll bo'ladi */,
        }}
      >
        {/* ✅ INDIKATORLAR - tepada fixed */}
        <div
          className="indicators-row"
          style={{
            display: "flex",
            gap: 6,
            marginTop: 6,
            marginBottom: 6,
            flexWrap: "nowrap",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          {/* X o'qi - Suv istemoli */}
          <div
            className="indicator-card"
            style={{
              flex: "1 1 0",
              minWidth: 0,
              padding: "4px 5px",
              background: "var(--bg-tertiary, #3a4a5c)",
              borderRadius: 4,
              textAlign: "center",
              borderLeft: "3px solid #3498db",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "var(--text-secondary, #bdc3c7)",
                marginBottom: 7,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {this.getIndicatorTitle(xMetric)}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#3498db",
                  lineHeight: 1.1,
                }}
              >
                {avgX.toLocaleString("uz-UZ", { maximumFractionDigits: 0 })}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary, #bdc3c7)",
                  whiteSpace: "nowrap",
                }}
              >
                {this.getMetricUnit(xMetric)}
              </span>
            </div>
          </div>

          {/* Y o'qi - Hosildorlik */}
          <div
            className="indicator-card"
            style={{
              flex: "1 1 0",
              minWidth: 0,
              padding: "4px 5px",
              background: "var(--bg-tertiary, #3a4a5c)",
              borderRadius: 4,
              textAlign: "center",
              borderLeft: "3px solid #27ae60",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "var(--text-secondary, #bdc3c7)",
                marginBottom: 7,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {this.getIndicatorTitle(yMetric)}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#27ae60",
                  lineHeight: 1.1,
                }}
              >
                {avgY.toLocaleString("uz-UZ", { maximumFractionDigits: 2 })}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary, #bdc3c7)",
                  whiteSpace: "nowrap",
                }}
              >
                {this.getMetricUnit(yMetric)}
              </span>
            </div>
          </div>

          {/* Suv samaradorligi (WP) */}
          <div
            className="indicator-card"
            style={{
              flex: "1 1 0",
              minWidth: 0,
              padding: "4px 5px",
              background: "var(--bg-tertiary, #3a4a5c)",
              borderRadius: 4,
              textAlign: "center",
              borderLeft: "3px solid #e67e22",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "var(--text-secondary, #bdc3c7)",
                marginBottom: 7,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {this.t("waterProductivity")}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#e67e22",
                  lineHeight: 1.1,
                }}
              >
                {avgWP.toLocaleString("uz-UZ", { maximumFractionDigits: 2 })}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary, #bdc3c7)",
                  whiteSpace: "nowrap",
                }}
              >
                kg/m³
              </span>
            </div>
          </div>
        </div>

        {/* ✅ JADVAL - 10 tadan kam bo'lsa ko'rsatiladi */}
        {showTable && (
          <div
            className="selected-table-container"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              borderRadius: 4,
              border: "1px solid var(--border-color, #4a5a6c)",
              width: "100%",
              background: "var(--widget-bg-tertiary, #3a4a5c)",
            }}
          >
            <table
              className="selected-polygons-table"
              dir="ltr"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--widget-bg-elevated, #445566)",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <th
                    style={{
                      padding: "4px 6px",
                      textAlign: "left",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        padding: "3px 6px",
                        color: "#3498db",
                        fontWeight: 600,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        whiteSpace: "normal",
                        lineHeight: 1.15,
                        minWidth: "fit-content",
                        width: "100%",
                        minHeight: "32px",
                      }}
                    >
                      <span>{this.t("farmerName")}</span>
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "4px 6px",
                      textAlign: "left",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      onClick={() => handleSortClick("ekin_turi")}
                      style={{
                        background:
                          tableSortField === "ekin_turi"
                            ? "rgba(52, 152, 219, 0.25)"
                            : "rgba(52, 152, 219, 0.1)",
                        border:
                          tableSortField === "ekin_turi"
                            ? "1px solid #3498db"
                            : "1px solid rgba(52, 152, 219, 0.3)",
                        borderRadius: 4,
                        padding: "3px 6px",
                        color: "#3498db",
                        fontWeight: 600,
                        fontSize: 7,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        whiteSpace: "normal",
                        lineHeight: 1.15,
                        minWidth: "fit-content",
                        width: "100%",
                        minHeight: "32px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>{this.t("ekinTuri")}</span>
                        <span style={{ fontSize: 7 }}>
                          {getSortIcon("ekin_turi")}
                        </span>
                      </div>
                    </button>
                  </th>
                  <th
                    style={{
                      padding: "4px 6px",
                      textAlign: "right",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      onClick={() => handleSortClick("maydon")}
                      style={{
                        background:
                          tableSortField === "maydon"
                            ? "rgba(136, 136, 255, 0.25)"
                            : "rgba(136, 136, 255, 0.1)",
                        border:
                          tableSortField === "maydon"
                            ? "1px solid #8888ff"
                            : "1px solid rgba(136, 136, 255, 0.3)",
                        borderRadius: 4,
                        padding: "3px 6px",
                        color: "#8888ff",
                        fontWeight: 600,
                        fontSize: 7,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        whiteSpace: "normal",
                        lineHeight: 1.15,
                        minWidth: "fit-content",
                        width: "100%",
                        minHeight: "32px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>{this.t("areaHa")}</span>
                        <span style={{ fontSize: 7 }}>
                          {getSortIcon("maydon")}
                        </span>
                      </div>
                    </button>
                  </th>
                  <th
                    style={{
                      padding: "4px 6px",
                      textAlign: "right",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      className="metric-header-btn"
                      onClick={() => handleSortClick("x")}
                      style={{
                        background:
                          tableSortField === "x"
                            ? "rgba(52, 152, 219, 0.25)"
                            : "rgba(52, 152, 219, 0.1)",
                        border:
                          tableSortField === "x"
                            ? "1px solid #3498db"
                            : "1px solid rgba(52, 152, 219, 0.3)",
                        borderRadius: 4,
                        padding: "3px 6px",
                        color: "#3498db",
                        fontWeight: 600,
                        fontSize: 7,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        gap: 1,
                        marginLeft: "0",
                        whiteSpace: "normal",
                        lineHeight: 1.15,
                        minWidth: "fit-content",
                        width: "100%",
                        minHeight: "32px",
                      }}
                    >
                      {this.renderSortableMetricHeader(
                        xMetric,
                        "x",
                        getSortIcon("x"),
                        7,
                      )}
                    </button>
                  </th>
                  <th
                    style={{
                      padding: "4px 6px",
                      textAlign: "right",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      className="metric-header-btn"
                      onClick={() => handleSortClick("y")}
                      style={{
                        background:
                          tableSortField === "y"
                            ? "rgba(39, 174, 96, 0.25)"
                            : "rgba(39, 174, 96, 0.1)",
                        border:
                          tableSortField === "y"
                            ? "1px solid #27ae60"
                            : "1px solid rgba(39, 174, 96, 0.3)",
                        borderRadius: 4,
                        padding: "3px 6px",
                        color: "#27ae60",
                        fontWeight: 600,
                        fontSize: 7,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        gap: 1,
                        marginLeft: "0",
                        whiteSpace: "normal",
                        lineHeight: 1.15,
                        minWidth: "fit-content",
                        width: "100%",
                        minHeight: "32px",
                      }}
                    >
                      {this.renderSortableMetricHeader(
                        yMetric,
                        "y",
                        getSortIcon("y"),
                        7,
                      )}
                    </button>
                  </th>
                  <th
                    style={{
                      padding: "4px 6px",
                      textAlign: "right",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      onClick={() => handleSortClick("wp")}
                      style={{
                        background:
                          tableSortField === "wp"
                            ? "rgba(230, 126, 34, 0.25)"
                            : "rgba(230, 126, 34, 0.1)",
                        border:
                          tableSortField === "wp"
                            ? "1px solid #e67e22"
                            : "1px solid rgba(230, 126, 34, 0.3)",
                        borderRadius: 4,
                        padding: "3px 6px",
                        color: "#e67e22",
                        fontWeight: 600,
                        fontSize: 7,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: 1,
                        marginLeft: "auto",
                        whiteSpace: "normal",
                        lineHeight: 1.15,
                        minWidth: "fit-content",
                        width: "100%",
                        minHeight: "32px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          lineHeight: 1.1,
                        }}
                      >
                        <span>WP</span>
                        <span style={{ fontSize: 7 }}>{getSortIcon("wp")}</span>
                      </div>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayPoints.map((point, idx) => {
                  const gid = this.normalizeGuid(
                    this.getRawPointGlobalId(point),
                  );
                  const isFocused =
                    this.normalizeGuid(focusedGlobalId || "") === gid;
                  // ✅ API dan kelgan real field nomlarini ishlatish
                  // Fermer nomi uchun: fermer_nom, fermer, name
                  const fermerName =
                    (point as any).fermer_nom ||
                    (point as any).fermer ||
                    (point as any).fermer_nomi ||
                    point.name ||
                    point.globalid ||
                    `Fermer ${idx + 1}`;

                  // Ekin turi uchun: ekin_turi, ekin_turi_nomi, crop_type, crop
                  const ekinTuri =
                    (point as any).ekin_turi ||
                    (point as any).ekin_turi_nomi ||
                    (point as any).crop_type ||
                    (point as any).crop ||
                    (point as any).ekin_turi_nom ||
                    "-";

                  // Maydon uchun: maydon, maydon_ga, area, area_ga, maydoni
                  const maydonRaw =
                    (point as any).maydon ||
                    (point as any).maydon_ga ||
                    (point as any).area ||
                    (point as any).area_ga ||
                    (point as any).maydoni ||
                    (point as any).maydon_ha ||
                    null;
                  const maydon = maydonRaw !== null ? maydonRaw : "-";
                  // API x va y field'larini ishlatamiz
                  const xVal = Number(point.x || 0);
                  const yVal = Number(point.y || 0);
                  const wpVal = calcWP(point);

                  const baseBackground =
                    idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)";

                  return (
                    <tr
                      key={gid || idx}
                      onClick={() => handleRowClick(point)}
                      style={{
                        cursor: "pointer",
                        background: isFocused
                          ? "rgba(52, 152, 219, 0.35)"
                          : baseBackground,
                        borderLeft: isFocused
                          ? "3px solid var(--border-accent)"
                          : "3px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isFocused)
                          e.currentTarget.style.background =
                            "rgba(52, 152, 219, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isFocused)
                          e.currentTarget.style.background = baseBackground;
                      }}
                    >
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "var(--text-primary, #fff)",
                          borderBottom:
                            "1px solid var(--border-color, #4a5a6c)",
                          fontSize: 11,
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          lineHeight: 1.2,
                          maxWidth: 150,
                        }}
                      >
                        {fermerName}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "var(--text-primary, #fff)",
                          borderBottom:
                            "1px solid var(--border-color, #4a5a6c)",
                          fontSize: 11,
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          lineHeight: 1.2,
                          maxWidth: 120,
                        }}
                      >
                        {ekinTuri}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          color: "var(--text-primary, #fff)",
                          borderBottom:
                            "1px solid var(--border-color, #4a5a6c)",
                          fontSize: 11,
                        }}
                      >
                        {(() => {
                          if (maydon === undefined || maydon === null) {
                            return "-";
                          }
                          const maydonNum =
                            typeof maydon === "number"
                              ? maydon
                              : typeof maydon === "string"
                                ? Number(maydon)
                                : Number(maydon);
                          if (isNaN(maydonNum)) {
                            return String(maydon);
                          }
                          return maydonNum.toLocaleString("uz-UZ", {
                            maximumFractionDigits: 2,
                          });
                        })()}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          color: "#3498db",
                          borderBottom:
                            "1px solid var(--border-color, #4a5a6c)",
                        }}
                      >
                        {xVal.toLocaleString("uz-UZ", {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          color: "#27ae60",
                          borderBottom:
                            "1px solid var(--border-color, #4a5a6c)",
                        }}
                      >
                        {yVal.toLocaleString("uz-UZ", {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          color: "#e67e22",
                          borderBottom:
                            "1px solid var(--border-color, #4a5a6c)",
                        }}
                      >
                        {wpVal.toLocaleString("uz-UZ", {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Ma'lumot - jadval ko'rsatilmasa ham maydonlar soni ko'rsatiladi */}
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--text-secondary, #bdc3c7)",
            textAlign: "center",
          }}
        ></div>
      </div>
    );
  };

  render(): JSX.Element {
    const {
      loading,
      error,
      chartData,
      connectionStatus,
      selectedYil,
      selectedViloyat,
      selectedTuman,
      selectedEkin_turi,
      selectedMavsum,
      yil,
      viloyat,
      tuman,
      ekin_turi,
      mavsum,
      xRange,
      yRange,
      totalPoints,
      nonEmptyBins,
      rawPoints,
    } = this.state;

    const hasRawPoints = Array.isArray(rawPoints) && rawPoints.length > 0;

    const yilLocked = !selectedYil?.trim();

    // ✅ Responsive chart height - kichik ekranlarda chart height kamayadi
    const windowHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;
    const responsiveChartHeight = Math.max(
      300,
      Math.min(CHART_HEIGHT, Math.floor(windowHeight * 0.45)),
    );

    const xAxisLabel = this.getLocalizedMetricLabel(this.state.selectedXMetric);
    const yAxisLabel = this.getLocalizedMetricLabel(this.state.selectedYMetric);

    const xDomain = this.computeDomainForHeatmap(xRange, "x");
    const yDomain = this.computeDomainForHeatmap(yRange, "y");

    const axisW = Math.max(
      1,
      (this.state.chartStageWidth || 0) -
        CHART_MARGIN.left -
        CHART_MARGIN.right,
    );
    const axisH = Math.max(
      1,
      responsiveChartHeight - CHART_MARGIN.top - CHART_MARGIN.bottom,
    );

    const GRID_BINS = DEFAULT_BINS; // API bilan bir xil (25)
    const cellW = axisW / GRID_BINS;
    const cellH = axisH / GRID_BINS;

    // ✅ Responsive gap - consistent across all modes (fermer, tuman, ekin_turi)
    const chartWidth = this.state.chartStageWidth || 400;
    // Consistent bin size: 3-5px across all modes
    const gap = chartWidth < 400 ? 3 : chartWidth < 600 ? 4 : 5;
    const rectW = Math.max(cellW - gap, 3); // minimum 3px
    const rectH = Math.max(cellH - gap, 3); // minimum 3px

    const selectedSet = new Set(this.state.selectedBinKeys);

    const boxOrCircleShape = (p: any) => {
      const payload = p?.payload as ScatterPoint;
      const c = Number(payload?.count ?? 0);
      const key = payload ? this.binKey(payload) : "";

      // ✅ Store Recharts pixel coords for bin click selection
      if (key && typeof p.cx === "number" && typeof p.cy === "number") {
        this._binPixelCoords.set(key, { x: p.cx, y: p.cy });
      }

      const isSelected = key && selectedSet.has(key);
      const isHovered = c > 0 && key && this.state.hoveredBinKey === key;
      const isLightTheme =
        typeof document !== "undefined" &&
        (document.documentElement.classList.contains("light-theme") ||
          document.documentElement.getAttribute("data-theme") === "light" ||
          document.body?.classList.contains("light-theme"));

      const fill = isSelected
        ? isLightTheme
          ? "rgba(61, 87, 85, 0.88)"
          : "rgba(100, 200, 255, 0.75)"
        : this.heatFill(c);
      // ✅ Yellow border on hover, red on click (selected)
      const strokeColor = isHovered
        ? "#ffff00"
        : isSelected
          ? "#ff3333"
          : isLightTheme
            ? "rgba(61, 87, 85, 0.22)"
            : "rgba(255,255,255,0.08)";
      const strokeW = isSelected || isHovered ? 2 : 0.8;

      const x = (p.cx ?? 0) - rectW / 2;
      const y = (p.cy ?? 0) - rectH / 2;
      const rx = Math.max(0, Math.min(3, rectW / 5, rectH / 5));

      return (
        <rect
          x={x}
          y={y}
          width={rectW}
          height={rectH}
          rx={rx}
          ry={rx}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeW}
          shapeRendering="crispEdges"
          style={{
            cursor:
              c > 0 && this.state.selectedGroupBy === "fermer_nom"
                ? "pointer"
                : "default",
            transition: "stroke 0.05s linear, stroke-width 0.05s linear",
          }}
          onMouseEnter={() => {
            if (c > 0 && key) this.setState({ hoveredBinKey: key });
          }}
          onMouseLeave={() => this.setState({ hoveredBinKey: null })}
          onClick={() => {
            // Faqat Fermer rejimida bin bosiladi
            if (c > 0 && key && this.state.selectedGroupBy === "fermer_nom") {
              this.handleBinClick(payload);
            }
          }}
        />
      );
    };

    const bubbleData = this.getRawBubbleData();

    return (
      <div className="yield-water-chart-widget evapo-v30-style">
        {/* ✅ Map connection (must pass real mapWidgetId) */}
        {(() => {
          const mapWidgetId = this.getConnectedMapWidgetId();
          if (!mapWidgetId) return null;

          return (
            <JimuMapViewComponent
              useMapWidgetId={mapWidgetId}
              onActiveViewChange={(jmv) => this.handleActiveViewChange(jmv)}
            />
          );
        })()}

        {connectionStatus === "connected" ? (
          <>
            <div className="filters-container">
              <SimpleDropdown
                value={selectedYil}
                options={[
                  ...(yil && yil.length > 0 ? yil : []),
                  ...(yil?.includes("2024") ? [] : ["2024"]),
                  ...(yil?.includes("2025") ? [] : ["2025"]),
                ].filter((v, i, a) => a.indexOf(v) === i)}
                placeholder={this.t("selectYear")}
                onChange={this.handleYilChange}
                disabled={loading}
                className="filter-dropdown"
              />

              <CreatableDropdown
                value={selectedViloyat}
                options={viloyat}
                placeholder={this.t("allRegions")}
                onChange={this.handleViloyatChange}
                disabled={loading || yilLocked}
                className="filter-dropdown"
                hideSearchInput={true}
                allowCustomValue={false}
                getOptionLabel={(option) =>
                  this.getLocalizedFilterValue("region", option)
                }
              />

              <CreatableDropdown
                value={selectedTuman}
                options={tuman}
                placeholder={this.t("allDistricts")}
                onChange={this.handleTumanChange}
                disabled={loading || yilLocked || !selectedViloyat}
                className="filter-dropdown"
                allowCustomValue={false}
                getOptionLabel={(option) =>
                  this.getLocalizedFilterValue("district", option)
                }
              />

              <CreatableDropdown
                value={selectedEkin_turi}
                options={ekin_turi}
                placeholder={this.t("allCropTypes")}
                onChange={this.handleEkin_turiChange}
                disabled={loading || yilLocked || !selectedViloyat}
                className="filter-dropdown"
                allowCustomValue={false}
                getOptionLabel={(option) =>
                  this.getLocalizedFilterValue("crop", option)
                }
              />

              <SimpleDropdown
                value={selectedMavsum}
                options={mavsum}
                placeholder={this.t("allSeasons")}
                onChange={this.handleMavsumChange}
                disabled={loading || yilLocked}
                className="filter-dropdown"
                getOptionLabel={(option) =>
                  this.getLocalizedFilterValue("season", option)
                }
              />
            </div>

            <div className="chart-container">
              {yilLocked ? (
                <div className="empty-state">
                  <p>{this.t("selectYearToEnable")}</p>
                </div>
              ) : loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>{this.t("loadingData")}</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button onClick={this.fetchData} className="retry-btn">
                    {this.t("retry")}
                  </button>
                </div>
              ) : nonEmptyBins === 0 ? (
                <div className="empty-state">
                  <p>{this.t("noDataAvailable")}</p>
                </div>
              ) : !selectedViloyat ? (
                <div className="empty-state">
                  <p>
                    {this.t("allRegions")} tanlanmasa, ma'lumot ko'rsatilmaydi
                  </p>
                </div>
              ) : this.state.viewMode === "polygons" ? (
                <div className="chart-inner">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      className="heatmap-summary-text"
                      style={{ fontSize: 13, opacity: 0.85, minWidth: "200px" }}
                    >
                      <strong>{this.t("selectedPolygons")}</strong>
                      <span className="info-text-detail">
                        {" "}
                        ({this.t("rawPoints")})
                      </span>
                      :{" "}
                      {this.state.rawPointsLoading
                        ? this.t("loadingRaw")
                        : this.state.rawPoints.length.toLocaleString()}
                      {this.state.rawPointsError ? (
                        <span
                          style={{ marginLeft: 10, color: "var(--btn-danger)" }}
                        >
                          {this.state.rawPointsError}
                        </span>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="retry-btn btn-responsive"
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          background: "var(--btn-secondary)",
                          boxShadow: "none",
                          whiteSpace: "nowrap",
                        }}
                        onClick={this.backToChart}
                      >
                        <span className="btn-text-full">
                          {this.t("backToChart")}
                        </span>
                        <span className="btn-text-short">
                          {this.t("backToChart").split(" ")[0]}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="retry-btn btn-responsive"
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          background: "var(--btn-secondary)",
                          boxShadow: "none",
                          whiteSpace: "nowrap",
                        }}
                        onClick={this.handleClearSelectionClick}
                        disabled={
                          this.state.rawPointsLoading &&
                          this.state.rawPoints.length === 0
                        }
                      >
                        <span className="btn-text-full">
                          {this.t("clearSelection")}
                        </span>
                        <span className="btn-text-short">
                          {this.t("clear")}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* ✅ ONE chart stage: axis selectors live ONLY here */}
                  <div
                    ref={this.chartStageRef}
                    className="chart-stage"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 280,
                      marginBottom: 12,
                    }}
                  >
                    {this.renderAxisSelectors(
                      { top: 18, right: 22, bottom: 30, left: 45 },
                      280,
                    )}

                    <ResponsiveContainer width="100%" height="100%">
                      {(() => {
                        // Calculate density centroid (weighted average by count)
                        const densityCentroid =
                          this.calculateDensityCentroid(bubbleData);

                        return (
                          <ScatterChart
                            margin={{
                              top: 18,
                              right: 22,
                              bottom: 30,
                              left: 45,
                            }}
                          >
                            <XAxis
                              type="number"
                              dataKey="x"
                              domain={["auto", "auto"]}
                              name={xAxisLabel}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(v) =>
                                this.formatMetricValue(
                                  this.state.selectedXMetric,
                                  Number(v),
                                )
                              }
                            />
                            <YAxis
                              type="number"
                              dataKey="y"
                              domain={["auto", "auto"]}
                              name={yAxisLabel}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(v) =>
                                this.formatMetricValue(
                                  this.state.selectedYMetric,
                                  Number(v),
                                )
                              }
                            />
                            <Tooltip content={<this.RawPointsTooltip />} />

                            <Scatter
                              data={bubbleData}
                              isAnimationActive={false}
                              shape={(p: any) => (
                                <circle
                                  cx={p.cx}
                                  cy={p.cy}
                                  r={7} // Increased radius for better visibility
                                  fill="hsla(205, 85%, 62%, 0.85)"
                                  stroke="rgba(255,255,255,0.35)"
                                  strokeWidth={1}
                                />
                              )}
                            />

                            {/* No ReferenceLine in raw points view - it should only show in heatmap view */}
                          </ScatterChart>
                        );
                      })()}
                    </ResponsiveContainer>
                  </div>

                  {/* ✅ List under chart */}
                  {this.renderSelectedList()}
                </div>
              ) : (
                <div className="chart-inner">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      className="heatmap-summary-text"
                      style={{ fontSize: 13, opacity: 0.85, minWidth: "200px" }}
                    >
                      <strong>
                        {this.state.selectedGroupBy === "fermer_nom"
                          ? this.t("heatmap")
                          : this.state.selectedGroupBy === "tuman"
                            ? this.t("tumanlar")
                            : this.t("ekinTurlari")}
                      </strong>
                      <span className="info-text-detail">
                        {" "}
                        · {this.t("totalPoints")}:{" "}
                        {Number(totalPoints).toLocaleString()}
                      </span>
                      <span
                        className={
                          hasRawPoints
                            ? "info-text-separator"
                            : "info-text-detail"
                        }
                      >
                        {" "}
                        ·{" "}
                        {hasRawPoints
                          ? this.t("rawPoints")
                          : this.state.selectedGroupBy === "fermer_nom"
                            ? this.t("nonEmptyBins")
                            : this.t("nuqtalar")}
                        :{" "}
                        {hasRawPoints
                          ? (Array.isArray(rawPoints)
                              ? rawPoints.length
                              : 0
                            ).toLocaleString()
                          : Number(nonEmptyBins).toLocaleString()}
                      </span>
                    </div>

                    <div
                      className="grouped-controls-row"
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "nowrap",
                        alignItems: "center",
                        minWidth: 0,
                      }}
                    >
                      {/* Fermer dropdown - rejimni o'zgartirish uchun */}
                      <SimpleDropdown
                        value={this.getGroupByLabel(this.state.selectedGroupBy)}
                        options={GROUP_BY_OPTIONS.filter((opt) => {
                          // Hide "Tuman" option if tuman is selected in filter
                          if (opt.key === "tuman" && this.state.selectedTuman) {
                            return false;
                          }
                          // Hide "Ekin turi" option if ekin_turi is selected in filter
                          if (
                            opt.key === "ekin_turi" &&
                            this.state.selectedEkin_turi
                          ) {
                            return false;
                          }
                          return true;
                        }).map((opt) => this.getGroupByLabel(opt.key))}
                        hidePlaceholderItem={true}
                        onChange={(label) => {
                          const found = GROUP_BY_OPTIONS.find(
                            (opt) => this.getGroupByLabel(opt.key) === label,
                          );
                          if (found) this.handleGroupByChange(found.key);
                        }}
                        className="group-by-dropdown"
                      />

                      {/* Clear button for grouped mode */}
                      <button
                        type="button"
                        onClick={this.handleClearAllFilters}
                        disabled={false}
                        className="filter-clear-btn"
                        title={this.t("tozalash")}
                        style={{
                          height: "32px",
                          padding: "0 12px",
                          fontSize: "9px",
                        }}
                      >
                        {this.t("tozalash")}
                      </button>
                    </div>
                  </div>

                  {/* ✅ ONE chart stage: axis selectors live ONLY here */}
                  <div
                    ref={this.chartStageRef}
                    className="chart-stage"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: responsiveChartHeight,
                    }}
                  >
                    {this.renderAxisSelectors(
                      CHART_MARGIN,
                      responsiveChartHeight,
                    )}

                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: responsiveChartHeight,
                      }}
                    >
                      <ResponsiveContainer
                        width="100%"
                        height={responsiveChartHeight}
                      >
                        {(() => {
                          // Calculate weighted average center for crosshair (always visible)
                          const heatmapCentroid =
                            this.calculateHeatmapCentroid(chartData);
                          // ✅ Crosshair har doim ko'rinadi (bin tanlanganda ham)
                          const showCrosshair = !!heatmapCentroid;

                          return (
                            <ScatterChart margin={CHART_MARGIN}>
                              <XAxis
                                type="number"
                                dataKey="x_value"
                                domain={xDomain}
                                name={xAxisLabel}
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) =>
                                  this.formatMetricValue(
                                    this.state.selectedXMetric,
                                    Number(v),
                                  )
                                }
                              />
                              <YAxis
                                type="number"
                                dataKey="y_value"
                                domain={yDomain}
                                name={yAxisLabel}
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) =>
                                  this.formatMetricValue(
                                    this.state.selectedYMetric,
                                    Number(v),
                                  )
                                }
                              />
                              {/* ✅ Tooltip o'chirildi - user request */}

                              <Scatter
                                data={chartData.filter(
                                  (p) => Number(p.count ?? 0) > 0,
                                )}
                                shape={boxOrCircleShape}
                                fill="#4A90E2"
                                isAnimationActive={false}
                              />

                              {/* ✅ Crosshair lines - AFTER Scatter for z-index */}
                              {showCrosshair && (
                                <>
                                  <ReferenceLine
                                    x={heatmapCentroid.x}
                                    stroke="#ff3333"
                                    strokeWidth={2.5}
                                    strokeDasharray="8 4"
                                    strokeOpacity={1}
                                    label={{
                                      value: `X: ${this.formatMetricValue(
                                        this.state.selectedXMetric,
                                        heatmapCentroid.x,
                                      )}`,
                                      position: "top",
                                      fill: "#ff3333",
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  />
                                  <ReferenceLine
                                    y={heatmapCentroid.y}
                                    stroke="#ff3333"
                                    strokeWidth={2.5}
                                    strokeDasharray="8 4"
                                    strokeOpacity={1}
                                    label={{
                                      value: `Y: ${this.formatMetricValue(
                                        this.state.selectedYMetric,
                                        heatmapCentroid.y,
                                      )}`,
                                      position: "right",
                                      dx: 6,
                                      fill: "#ff3333",
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  />
                                </>
                              )}
                            </ScatterChart>
                          );
                        })()}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ✅ Fermer rejimida: Indikatorlar va jadval (bin bosilganda) */}
                  {this.state.selectedGroupBy === "fermer_nom" &&
                    this.renderSelectedList()}

                  {/* ✅ Tuman/Ekin turi rejimida: Indikatorlar va Jadval */}
                  {this.state.selectedGroupBy !== "fermer_nom" &&
                    this.state.chartData.length > 0 && (
                      <div
                        className="grouped-mode-panel"
                        style={{
                          marginTop: 0,
                          padding: "0 8px 8px 8px",
                          background: "var(--widget-bg-tertiary, #3a4a5c)",
                          borderRadius: 6,
                          borderTop: "2px solid var(--border-accent, #3498db)",
                        }}
                      >
                        {/* ✅ Indikatorlar - chartData dan hisoblash */}
                        {(() => {
                          const data = this.state.chartData;
                          const totalCount = data.reduce(
                            (sum, d) => sum + (d.count || 0),
                            0,
                          );

                          // Weighted average hisoblash
                          const sumX = data.reduce(
                            (sum, d) => sum + (d.x_value || 0) * (d.count || 0),
                            0,
                          );
                          const sumY = data.reduce(
                            (sum, d) => sum + (d.y_value || 0) * (d.count || 0),
                            0,
                          );

                          const avgX = totalCount > 0 ? sumX / totalCount : 0;
                          const avgY = totalCount > 0 ? sumY / totalCount : 0;
                          const avgWP = avgX > 0 ? (avgY * 10) / avgX : 0;

                          const xMetric = this.state.selectedXMetric;
                          const yMetric = this.state.selectedYMetric;

                          return (
                            <div
                              className="indicators-row"
                              style={{
                                display: "flex",
                                gap: 6,
                                marginTop: 6,
                                marginBottom: 6,
                                flexWrap: "nowrap",
                                flexShrink: 0,
                                flexGrow: 0,
                              }}
                            >
                              {/* X o'qi - Suv istemoli */}
                              <div
                                className="indicator-card"
                                style={{
                                  flex: "1 1 0",
                                  minWidth: 0,
                                  padding: "4px 5px",
                                  background: "var(--bg-tertiary, #3a4a5c)",
                                  borderRadius: 4,
                                  textAlign: "center",
                                  borderLeft: "3px solid #3498db",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: "var(--text-secondary, #bdc3c7)",
                                    marginBottom: 7,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  {this.getIndicatorTitle(xMetric)}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "baseline",
                                    gap: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 18,
                                      fontWeight: 700,
                                      color: "#3498db",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {avgX.toLocaleString("uz-UZ", {
                                      maximumFractionDigits: 0,
                                    })}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "var(--text-secondary, #bdc3c7)",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {this.getMetricUnit(xMetric)}
                                  </span>
                                </div>
                              </div>

                              {/* Y o'qi - Hosildorlik */}
                              <div
                                className="indicator-card"
                                style={{
                                  flex: "1 1 0",
                                  minWidth: 0,
                                  padding: "4px 5px",
                                  background: "var(--bg-tertiary, #3a4a5c)",
                                  borderRadius: 4,
                                  textAlign: "center",
                                  borderLeft: "3px solid #27ae60",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: "var(--text-secondary, #bdc3c7)",
                                    marginBottom: 7,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  {this.getIndicatorTitle(yMetric)}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "baseline",
                                    gap: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 18,
                                      fontWeight: 700,
                                      color: "#27ae60",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {avgY.toLocaleString("uz-UZ", {
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "var(--text-secondary, #bdc3c7)",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {this.getMetricUnit(yMetric)}
                                  </span>
                                </div>
                              </div>

                              {/* Suv samaradorligi */}
                              <div
                                className="indicator-card"
                                style={{
                                  flex: "1 1 0",
                                  minWidth: 0,
                                  padding: "4px 5px",
                                  background: "var(--bg-tertiary, #3a4a5c)",
                                  borderRadius: 4,
                                  textAlign: "center",
                                  borderLeft: "3px solid #e67e22",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: "var(--text-secondary, #bdc3c7)",
                                    marginBottom: 7,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  {this.t("waterProductivity")}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "baseline",
                                    gap: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 18,
                                      fontWeight: 700,
                                      color: "#e67e22",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {avgWP.toLocaleString("uz-UZ", {
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "var(--text-secondary, #bdc3c7)",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    kg/m³
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div
                          className="grouped-data-table"
                          style={{
                            marginTop: 4,
                            width: "100%",
                            boxSizing: "border-box",
                            flex: "0 0 auto",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className="grouped-list-title"
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--text-accent)",
                            }}
                          >
                            {this.state.selectedGroupBy === "tuman"
                              ? this.t("tumanlarRoyxati")
                              : this.t("ekinTurlariRoyxati")}{" "}
                            ({this.state.chartData.length})
                          </div>
                          <div
                            style={{
                              flex: "0 0 auto",
                              overflowY: "visible",
                              overflowX: "visible",
                              maxHeight: "none",
                              background: "var(--widget-bg-tertiary)",
                              borderRadius: 6,
                              border: "1px solid var(--border-secondary)",
                              width: "100%",
                            }}
                          >
                            <table
                              dir="ltr"
                              style={{
                                width: "100%",
                                minWidth: "100%",
                                borderCollapse: "collapse",
                                fontSize: 12,
                                tableLayout: "fixed",
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    background: "var(--widget-bg-elevated)",
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 1,
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: "10px 12px",
                                      textAlign: "left",
                                      borderBottom:
                                        "1px solid var(--border-secondary)",
                                      width: "23%",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {this.state.selectedGroupBy === "tuman"
                                      ? this.t("tuman")
                                      : this.t("ekinTuri")}
                                  </th>
                                  <th
                                    style={{
                                      padding: "4px 6px",
                                      textAlign: "right",
                                      verticalAlign: "middle",
                                      borderBottom:
                                        "1px solid var(--border-secondary)",
                                      width: "20%",
                                    }}
                                  >
                                    <button
                                      className="metric-header-btn"
                                      onClick={() => {
                                        const field = "x";
                                        if (
                                          this.state.tableSortField === field
                                        ) {
                                          this.setState({
                                            tableSortAsc:
                                              !this.state.tableSortAsc,
                                          });
                                        } else {
                                          this.setState({
                                            tableSortField: field,
                                            tableSortAsc: false,
                                          });
                                        }
                                      }}
                                      style={{
                                        background:
                                          this.state.tableSortField === "x"
                                            ? "rgba(52, 152, 219, 0.25)"
                                            : "rgba(52, 152, 219, 0.1)",
                                        border:
                                          this.state.tableSortField === "x"
                                            ? "1px solid #3498db"
                                            : "1px solid rgba(52, 152, 219, 0.3)",
                                        borderRadius: 4,
                                        padding: "3px 6px",
                                        color: "#3498db",
                                        fontWeight: 600,
                                        fontSize: 9,
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        justifyContent: "center",
                                        gap: 1,
                                        marginLeft: "0",
                                        whiteSpace: "normal",
                                        lineHeight: 1.15,
                                        minWidth: "fit-content",
                                        width: "100%",
                                        minHeight: "32px",
                                      }}
                                    >
                                      {this.renderSortableMetricHeader(
                                        this.state.selectedXMetric,
                                        "x",
                                        this.state.tableSortField === "x"
                                          ? this.state.tableSortAsc
                                            ? "↑"
                                            : "↓"
                                          : "↕",
                                        9,
                                      )}
                                    </button>
                                  </th>
                                  <th
                                    style={{
                                      padding: "4px 6px",
                                      textAlign: "right",
                                      verticalAlign: "middle",
                                      borderBottom:
                                        "1px solid var(--border-secondary)",
                                      width: "20%",
                                    }}
                                  >
                                    <button
                                      className="metric-header-btn"
                                      onClick={() => {
                                        const field = "y";
                                        if (
                                          this.state.tableSortField === field
                                        ) {
                                          this.setState({
                                            tableSortAsc:
                                              !this.state.tableSortAsc,
                                          });
                                        } else {
                                          this.setState({
                                            tableSortField: field,
                                            tableSortAsc: false,
                                          });
                                        }
                                      }}
                                      style={{
                                        background:
                                          this.state.tableSortField === "y"
                                            ? "rgba(39, 174, 96, 0.25)"
                                            : "rgba(39, 174, 96, 0.1)",
                                        border:
                                          this.state.tableSortField === "y"
                                            ? "1px solid #27ae60"
                                            : "1px solid rgba(39, 174, 96, 0.3)",
                                        borderRadius: 4,
                                        padding: "3px 6px",
                                        color: "#27ae60",
                                        fontWeight: 600,
                                        fontSize: 9,
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        justifyContent: "center",
                                        gap: 1,
                                        marginLeft: "0",
                                        whiteSpace: "normal",
                                        lineHeight: 1.15,
                                        minWidth: "fit-content",
                                        width: "100%",
                                        minHeight: "32px",
                                      }}
                                    >
                                      {this.renderSortableMetricHeader(
                                        this.state.selectedYMetric,
                                        "y",
                                        this.state.tableSortField === "y"
                                          ? this.state.tableSortAsc
                                            ? "↑"
                                            : "↓"
                                          : "↕",
                                        9,
                                      )}
                                    </button>
                                  </th>
                                  <th
                                    style={{
                                      padding: "4px 6px",
                                      textAlign: "right",
                                      verticalAlign: "middle",
                                      borderBottom:
                                        "1px solid var(--border-secondary)",
                                      width: "15%",
                                    }}
                                  >
                                    <button
                                      onClick={() => {
                                        const field = "wp";
                                        if (
                                          this.state.tableSortField === field
                                        ) {
                                          this.setState({
                                            tableSortAsc:
                                              !this.state.tableSortAsc,
                                          });
                                        } else {
                                          this.setState({
                                            tableSortField: field,
                                            tableSortAsc: false,
                                          });
                                        }
                                      }}
                                      style={{
                                        background:
                                          this.state.tableSortField === "wp"
                                            ? "rgba(230, 126, 34, 0.25)"
                                            : "rgba(230, 126, 34, 0.1)",
                                        border:
                                          this.state.tableSortField === "wp"
                                            ? "1px solid #e67e22"
                                            : "1px solid rgba(230, 126, 34, 0.3)",
                                        borderRadius: 4,
                                        padding: "3px 6px",
                                        color: "#e67e22",
                                        fontWeight: 600,
                                        fontSize: 9,
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        justifyContent: "center",
                                        gap: 1,
                                        marginLeft: "auto",
                                        whiteSpace: "normal",
                                        lineHeight: 1.15,
                                        minWidth: "fit-content",
                                        width: "100%",
                                        minHeight: "32px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                        }}
                                      >
                                        <span>WP</span>
                                        <span style={{ fontSize: 7 }}>
                                          {this.state.tableSortField === "wp"
                                            ? this.state.tableSortAsc
                                              ? "↑"
                                              : "↓"
                                            : "↕"}
                                        </span>
                                      </div>
                                    </button>
                                  </th>
                                  <th
                                    style={{
                                      padding: "4px 6px",
                                      textAlign: "right",
                                      verticalAlign: "middle",
                                      borderBottom:
                                        "1px solid var(--border-secondary)",
                                      width: "12%",
                                    }}
                                  >
                                    <button
                                      onClick={() => {
                                        const field = "maydon";
                                        if (
                                          this.state.tableSortField === field
                                        ) {
                                          this.setState({
                                            tableSortAsc:
                                              !this.state.tableSortAsc,
                                          });
                                        } else {
                                          this.setState({
                                            tableSortField: field,
                                            tableSortAsc: false,
                                          });
                                        }
                                      }}
                                      style={{
                                        background:
                                          this.state.tableSortField === "maydon"
                                            ? "rgba(136, 136, 255, 0.25)"
                                            : "rgba(136, 136, 255, 0.1)",
                                        border:
                                          this.state.tableSortField === "maydon"
                                            ? "1px solid #8888ff"
                                            : "1px solid rgba(136, 136, 255, 0.3)",
                                        borderRadius: 4,
                                        padding: "3px 6px",
                                        color: "#8888ff",
                                        fontWeight: 600,
                                        fontSize: 9,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        whiteSpace: "normal",
                                        lineHeight: 1.15,
                                        minWidth: "fit-content",
                                        width: "100%",
                                        minHeight: "32px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                        }}
                                      >
                                        <span>{this.t("areaHa")}</span>
                                        <span style={{ fontSize: 7 }}>
                                          {this.state.tableSortField ===
                                          "maydon"
                                            ? this.state.tableSortAsc
                                              ? "↑"
                                              : "↓"
                                            : "↕"}
                                        </span>
                                      </div>
                                    </button>
                                  </th>
                                  <th
                                    style={{
                                      padding: "4px 6px",
                                      textAlign: "right",
                                      verticalAlign: "middle",
                                      borderBottom:
                                        "1px solid var(--border-secondary)",
                                      width: "10%",
                                    }}
                                  >
                                    <button
                                      onClick={() => {
                                        const field = "count";
                                        if (
                                          this.state.tableSortField === field
                                        ) {
                                          this.setState({
                                            tableSortAsc:
                                              !this.state.tableSortAsc,
                                          });
                                        } else {
                                          this.setState({
                                            tableSortField: field,
                                            tableSortAsc: false,
                                          });
                                        }
                                      }}
                                      style={{
                                        background:
                                          this.state.tableSortField === "count"
                                            ? "rgba(136, 136, 255, 0.25)"
                                            : "rgba(136, 136, 255, 0.1)",
                                        border:
                                          this.state.tableSortField === "count"
                                            ? "1px solid #8888ff"
                                            : "1px solid rgba(136, 136, 255, 0.3)",
                                        borderRadius: 4,
                                        padding: "3px 6px",
                                        color: "#8888ff",
                                        fontWeight: 600,
                                        fontSize: 9,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        gap: 4,
                                        whiteSpace: "normal",
                                        lineHeight: 1.15,
                                        minWidth: "fit-content",
                                        width: "100%",
                                        minHeight: "32px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                        }}
                                      >
                                        <span>{this.t("soni")}</span>
                                        <span style={{ fontSize: 7 }}>
                                          {this.state.tableSortField === "count"
                                            ? this.state.tableSortAsc
                                              ? "↑"
                                              : "↓"
                                            : "↕"}
                                        </span>
                                      </div>
                                    </button>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  // ✅ Grouped mode uchun tartiblash
                                  const { tableSortField, tableSortAsc } =
                                    this.state;
                                  const sortedData = [
                                    ...this.state.chartData,
                                  ].sort((a, b) => {
                                    if (
                                      tableSortField === "none" ||
                                      !tableSortField
                                    ) {
                                      return b.count - a.count; // Default: count bo'yicha
                                    }

                                    if (tableSortField === "x") {
                                      return tableSortAsc
                                        ? a.x_value - b.x_value
                                        : b.x_value - a.x_value;
                                    }
                                    if (tableSortField === "y") {
                                      return tableSortAsc
                                        ? a.y_value - b.y_value
                                        : b.y_value - a.y_value;
                                    }
                                    if (tableSortField === "wp") {
                                      const wpA =
                                        a.x_value > 0
                                          ? (a.y_value * 10) / a.x_value
                                          : 0;
                                      const wpB =
                                        b.x_value > 0
                                          ? (b.y_value * 10) / b.x_value
                                          : 0;
                                      return tableSortAsc
                                        ? wpA - wpB
                                        : wpB - wpA;
                                    }
                                    if (tableSortField === "maydon") {
                                      const maydonA = Number(
                                        (a as any).maydon ||
                                          (a as any).maydon_ga ||
                                          (a as any).area ||
                                          (a as any).area_ga ||
                                          0,
                                      );
                                      const maydonB = Number(
                                        (b as any).maydon ||
                                          (b as any).maydon_ga ||
                                          (b as any).area ||
                                          (b as any).area_ga ||
                                          0,
                                      );
                                      return tableSortAsc
                                        ? maydonA - maydonB
                                        : maydonB - maydonA;
                                    }
                                    // Default: count bo'yicha
                                    return b.count - a.count;
                                  });

                                  return sortedData.map((item, idx) => {
                                    const isSelected =
                                      this.state.selectedGroupedItem ===
                                      item.name;
                                    const localizedItemName =
                                      this.getLocalizedGroupedItemLabel(
                                        this.state.selectedGroupBy,
                                        item.name || "",
                                      ) || "-";
                                    const baseBackground = isSelected
                                      ? "rgba(52, 152, 219, 0.35)"
                                      : idx % 2 === 0
                                        ? "transparent"
                                        : "rgba(255,255,255,0.02)";

                                    return (
                                      <tr
                                        key={item.name || idx}
                                        style={{
                                          background: baseBackground,
                                          cursor: "pointer",
                                          transition: "background 0.15s ease",
                                          borderLeft: isSelected
                                            ? "3px solid var(--border-accent)"
                                            : "3px solid transparent",
                                        }}
                                        onClick={() => {
                                          if (item.name) {
                                            void this.handleGroupedItemClick(
                                              item.name,
                                            );
                                          }
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isSelected)
                                            e.currentTarget.style.background =
                                              "rgba(52, 152, 219, 0.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background =
                                            baseBackground;
                                        }}
                                      >
                                        <td
                                          style={{
                                            padding: "8px 12px",
                                            borderBottom:
                                              "1px solid var(--border-secondary)",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            fontWeight: isSelected ? 600 : 400,
                                          }}
                                          title={localizedItemName}
                                        >
                                          {localizedItemName}
                                        </td>
                                        <td
                                          style={{
                                            padding: "8px 12px",
                                            textAlign: "right",
                                            borderBottom:
                                              "1px solid var(--border-secondary)",
                                            fontFamily: "monospace",
                                          }}
                                        >
                                          {this.formatMetricValue(
                                            this.state.selectedXMetric,
                                            item.x_value,
                                          )}
                                        </td>
                                        <td
                                          style={{
                                            padding: "8px 12px",
                                            textAlign: "right",
                                            borderBottom:
                                              "1px solid var(--border-secondary)",
                                            fontFamily: "monospace",
                                          }}
                                        >
                                          {this.formatMetricValue(
                                            this.state.selectedYMetric,
                                            item.y_value,
                                          )}
                                        </td>
                                        <td
                                          style={{
                                            padding: "8px 12px",
                                            textAlign: "right",
                                            borderBottom:
                                              "1px solid var(--border-secondary)",
                                            fontFamily: "monospace",
                                          }}
                                        >
                                          {(() => {
                                            const wp =
                                              item.x_value > 0
                                                ? (item.y_value * 10) /
                                                  item.x_value
                                                : 0;
                                            return wp.toLocaleString("uz-UZ", {
                                              maximumFractionDigits: 2,
                                            });
                                          })()}
                                        </td>
                                        <td
                                          style={{
                                            padding: "8px 12px",
                                            textAlign: "right",
                                            borderBottom:
                                              "1px solid var(--border-secondary)",
                                            fontFamily: "monospace",
                                          }}
                                        >
                                          {(() => {
                                            const maydonValue =
                                              (item as any).maydon ||
                                              (item as any).maydon_ga ||
                                              (item as any).area ||
                                              (item as any).area_ga;
                                            if (
                                              maydonValue === undefined ||
                                              maydonValue === null
                                            ) {
                                              return "-";
                                            }
                                            const maydonNum =
                                              Number(maydonValue);
                                            if (isNaN(maydonNum)) {
                                              return String(maydonValue);
                                            }
                                            return maydonNum.toLocaleString(
                                              "uz-UZ",
                                              { maximumFractionDigits: 2 },
                                            );
                                          })()}
                                        </td>
                                        <td
                                          style={{
                                            padding: "8px 12px",
                                            textAlign: "right",
                                            borderBottom:
                                              "1px solid var(--border-secondary)",
                                            fontWeight: 600,
                                            color: "var(--text-accent)",
                                          }}
                                        >
                                          {item.count.toLocaleString()}
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </>
        ) : connectionStatus === "connecting" ? (
          <div className="connection-state">
            <div className="loading-spinner"></div>
            <p>{this.t("connectingToDataSource")}</p>
          </div>
        ) : (
          <div className="connection-error">
            <p>{error || this.t("failedToConnect")}</p>
            <button onClick={this.initializeWidget} className="retry-btn">
              {this.t("retryConnection")}
            </button>
          </div>
        )}
      </div>
    );
  }
}
