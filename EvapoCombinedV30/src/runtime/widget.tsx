import { AllWidgetProps, React } from "jimu-core";
import throttle from "lodash/throttle";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartType } from "../config";
import {
  getInitialLang,
  getInitialTheme,
  LangCode,
  normalizeLang,
  t,
} from "./messages";
import "./water-unified-widget.css";

const DEFAULT_INITIAL_YEAR = "2025";

// Interface for monthly data
interface MonthlyData {
  month: number;
  month_name: string;
  consumption_m3ha: number;
  total_consumption_m3: number;
  supply_m3ha: number;
  total_supply_m3: number;
}

// Interfaces for the API responses
interface WaterConsumptionResponse {
  uwt_m3: number;
  monthly_consumption_data: {
    month: number;
    month_name: string;
    consumption_m3ha: number;
    total_consumption_m3: number;
  }[];
}

interface WaterSupplyResponse {
  awt_m3: number;
  monthly_supply_data: {
    month: number;
    month_name: string;
    supply_m3ha: number;
    total_supply_m3: number;
  }[];
}

// Interface for the widget properties
interface WaterUnifiedWidgetProps extends AllWidgetProps<any> {
  // Optional prop to receive filter values from the parent application
  externalFilters?: {
    viloyat?: string;
    tuman?: string;
    mavsum?: string;
    mavsumRaw?: string;
    fermer_nomNom?: string;
    yil?: string; // ✅ NEW
  };
}

// Interface for the additional filter options specific to this widget
interface CropFieldFilters {
  ekinTuri: string[];
  manbaNomi: string[];
  kanalNomi: string[];

  selectedEkinTuri: string;
  selectedManbaNomi: string;
  selectedKanalNomi: string;
}

// Interface for the widget state
interface WaterUnifiedWidgetState {
  lang: LangCode;
  loadingConsumption: boolean;
  loadingSupply: boolean;
  error: string | null;
  data: {
    totalConsumption: number | null;
    totalSupply: number | null;
    monthlyData: MonthlyData[];
  };
  minMax: string | null; // Add this to track min/max selection
  lastMinMaxEventTimestamp: number; // Add this to track event timestamps
  // Base filters (synced with other widgets)
  viloyat: string;
  tuman: string;
  mavsum: string;
  fermer_nomNom: string;
  yil: string; // ✅ NEW: keep as string ('2025')

  // Additional crop field filters
  cropFieldFilters: CropFieldFilters;

  // UI state
  loadingFilters: boolean;
  filtersExpanded: boolean;
  isDarkTheme: boolean; // Theme state property

  // Interactive totals state
  hoveredTotal: "consumption" | "supply" | null;
  showTotalDetails: boolean;
}

export default class WaterUnifiedWidget extends React.PureComponent<
  WaterUnifiedWidgetProps,
  WaterUnifiedWidgetState
> {
  // Reference to track if component is mounted
  _isMounted = false;
  waterSourceSelectedHandler: any = null;
  canalselectedHandler: any = null;
  cropSelectedHandler: any = null;
  // For polling updates
  updateTimer: any = null;
  // New properties for better fetch coordination
  private _abortController: AbortController | null = null;
  private _fetchQueue: number = 0;
  private _lastFetchId: number = 0;
  private _inFlightFetchSignature: string | null = null;
  private _lastCompletedFetchSignature: string | null = null;
  private throttledFetchData: any;
  // Event handler reference
  filterChangeHandler: any = null;
  clearSelectionHandler: any = null;
  private _lastExternalClearTimestamp: number = 0;
  // Reference for pie chart container to measure size
  private _pieChartContainerRef: React.RefObject<HTMLDivElement> =
    React.createRef();
  // Reference for pie chart wrapper to measure size
  private _pieChartWrapperRef: React.RefObject<HTMLDivElement> =
    React.createRef();
  // State for responsive pie chart dimensions - start with reasonable default
  private _pieChartSize: { width: number; height: number } = {
    width: 500,
    height: 500,
  };
  private _pieLegendWidth: number = 145;
  private _resizeObserver: ResizeObserver | null = null;

  constructor(props) {
    super(props);
    this.waterUnifiedHandleWaterSourceSelected =
      this.waterUnifiedHandleWaterSourceSelected.bind(this);
    this.waterUnifiedHandlecanalselected =
      this.waterUnifiedHandlecanalselected.bind(this);
    this.waterUnifiedHandleCropSelected =
      this.waterUnifiedHandleCropSelected.bind(this);

    // Create a more robust throttled fetch
    this.throttledFetchData = throttle(
      () => {
        // Cancel any existing abort controller
        if (this._abortController) {
          this._abortController.abort();
          this._abortController = null;
        }

        // Start a new fetch
        this.waterUnifiedFetchData();
      },
      300,
      { leading: false, trailing: true },
    );

    // Initialize the state with default values
    this.state = {
      lang: getInitialLang(),
      loadingConsumption: false,
      loadingSupply: false,
      error: null,
      data: {
        totalConsumption: null,
        totalSupply: null,
        monthlyData: [],
      },
      yil: DEFAULT_INITIAL_YEAR, // ✅ NEW

      minMax: null,
      lastMinMaxEventTimestamp: 0,
      // Initialize base filters (will be updated from props if available)
      viloyat: "",
      tuman: "",
      mavsum: "",
      fermer_nomNom: "",

      // Initialize crop field specific filters
      cropFieldFilters: {
        ekinTuri: [],
        manbaNomi: [],
        kanalNomi: [],

        selectedEkinTuri: "",
        selectedManbaNomi: "",
        selectedKanalNomi: "",
      },

      // UI state
      loadingFilters: false,
      filtersExpanded: false,
      isDarkTheme: getInitialTheme(),

      // Interactive totals state
      hoveredTotal: null,
      showTotalDetails: false,
    };

    // Bind methods
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.waterUnifiedFetchData = this.waterUnifiedFetchData.bind(this);
    this.waterUnifiedFetchConsumptionData =
      this.waterUnifiedFetchConsumptionData.bind(this);
    this.waterUnifiedFetchSupplyData =
      this.waterUnifiedFetchSupplyData.bind(this);
    this.waterUnifiedFetchFilterOptions =
      this.waterUnifiedFetchFilterOptions.bind(this);
    this.waterUnifiedHandleFilterChange =
      this.waterUnifiedHandleFilterChange.bind(this);
    this.waterUnifiedHandleThemeChange =
      this.waterUnifiedHandleThemeChange.bind(this);
    this.waterUnifiedHandleMinMaxSelection =
      this.waterUnifiedHandleMinMaxSelection.bind(this);

    // Bind new interactive methods
    this.waterUnifiedHandleTotalHover =
      this.waterUnifiedHandleTotalHover.bind(this);
    this.waterUnifiedHandleTotalLeave =
      this.waterUnifiedHandleTotalLeave.bind(this);
    this.waterUnifiedHandleTotalClick =
      this.waterUnifiedHandleTotalClick.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    // Language change listener
    document.addEventListener("languageChanged", this.handleLanguageChange);

    // Set up event listeners first
    this.waterSourceSelectedHandler =
      this.waterUnifiedHandleWaterSourceSelected;
    document.addEventListener(
      "waterSourceSelected",
      this.waterSourceSelectedHandler,
    );
    document.addEventListener(
      "minMaxSelected",
      this.waterUnifiedHandleMinMaxSelection,
    );

    this.canalselectedHandler = this.waterUnifiedHandlecanalselected;
    document.addEventListener("canalselected", this.canalselectedHandler);
    document.addEventListener(
      "waterSupplyFiltersReset",
      this.handleWaterSupplyReset,
    );

    this.cropSelectedHandler = this.waterUnifiedHandleCropSelected;
    document.addEventListener("cropSelected", this.cropSelectedHandler);

    this.filterChangeHandler = this.waterUnifiedHandleFilterChange;
    document.addEventListener(
      "waterSupplyFilterChanged",
      this.filterChangeHandler,
    );

    this.clearSelectionHandler = this.handleExternalDependentFiltersClear;
    document.addEventListener("clearCropSelection", this.clearSelectionHandler);
    document.addEventListener(
      "clearCanalSelection",
      this.clearSelectionHandler,
    );
    document.addEventListener(
      "clearWaterSourceSelection",
      this.clearSelectionHandler,
    );
    document.addEventListener(
      "regionDependentFiltersReset",
      this.clearSelectionHandler,
    );

    document.addEventListener(
      "themeToggled",
      this.waterUnifiedHandleThemeChange as EventListener,
    );
    document.addEventListener(
      "themeChanged",
      this.waterUnifiedHandleThemeChange as EventListener,
    );

    // Initialize theme from storage first, then DOM fallback
    try {
      const saved =
        localStorage.getItem("app_theme") ||
        localStorage.getItem("evapo_app_theme");
      if (saved === "light" || saved === "dark") {
        this.setState({ isDarkTheme: saved === "dark" });
      } else {
        this.setState({ isDarkTheme: true });
      }
      console.log(
        "[EvapoCombinedV9] Initial theme from DOM, isDarkTheme:",
        this.state.isDarkTheme,
      );
    } catch {}

    document.addEventListener("yilChanged", this.waterUnifiedHandleYilEvent);
    document.addEventListener(
      "constructionYearChanged",
      this.waterUnifiedHandleYilAliasEvent,
    );
    // Sequential initialization is important to prevent race conditions
    Promise.resolve()
      .then(() => this.waterUnifiedFetchFilterOptions())
      .then(() => {
        // Only after filter options are loaded:
        if (this.props.externalFilters) {
          this.waterUnifiedUpdateFiltersFromProps(this.props.externalFilters);
        } else {
          this.waterUnifiedUpdateUrlWithFilters();
          // Initial data fetch - only do this if we don't have external filters
          this.waterUnifiedFetchData();
        }
      })
      .catch((error) => {
        console.error("Error during initialization:", error);
        if (this._isMounted) {
          this.setState({ error: "Failed to initialize: " + error.message });
        }
      });

    // Set up periodic updates (every 5 minutes)
    this.updateTimer = setInterval(() => {
      if (this._isMounted) {
        this.waterUnifiedFetchData(true);
      }
    }, 300000); // 5 minutes

    // Set up ResizeObserver for responsive pie chart (after render)
    setTimeout(() => {
      this.setupPieChartResizeObserver();
    }, 100);
  }

  componentDidUpdate(prevProps) {
    // Setup ResizeObserver if not already set up and refs are available
    if (
      !this._resizeObserver &&
      (this._pieChartContainerRef.current || this._pieChartWrapperRef.current)
    ) {
      this.setupPieChartResizeObserver();
    }

    // If external filters changed, update our internal state
    if (this.props.externalFilters !== prevProps.externalFilters) {
      if (this.props.externalFilters) {
        this.waterUnifiedUpdateFiltersFromProps(this.props.externalFilters);
      }
    }
  }

  // Setup ResizeObserver to make pie chart responsive
  setupPieChartResizeObserver = () => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    // Cleanup existing observer
    if (this._resizeObserver) {
      if (this._pieChartContainerRef.current) {
        this._resizeObserver.unobserve(this._pieChartContainerRef.current);
      }
      if (this._pieChartWrapperRef.current) {
        this._resizeObserver.unobserve(this._pieChartWrapperRef.current);
      }
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    const container = this._pieChartContainerRef.current;

    if (!container) {
      // Retry after a short delay if ref is not ready
      setTimeout(() => {
        if (this._pieChartContainerRef.current && !this._resizeObserver) {
          this.setupPieChartResizeObserver();
        }
      }, 100);
      return;
    }

    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          const horizontalPadding = 8;
          const verticalPadding = 4;
          const chartGap = 8;

          // Keep legend responsive to container width so month names remain readable
          const legendRatio = width < 320 ? 0.56 : width < 420 ? 0.5 : 0.36;
          const legendMinWidth = width < 360 ? 120 : 130;
          const legendWidth = Math.min(
            220,
            Math.max(legendMinWidth, Math.floor(width * legendRatio)),
          );

          // Calculate available space for pie chart (right side area)
          const availableWidth =
            width - legendWidth - chartGap - horizontalPadding * 2;
          const availableHeight = height - verticalPadding * 2;

          // Keep chart strictly inside container bounds
          const hardMax = Math.min(
            Math.floor(availableWidth),
            Math.floor(availableHeight),
          );
          if (hardMax < 28) {
            continue;
          }

          // Responsive square size with safe margin so it never overflows
          const desiredSize = Math.floor(hardMax);
          const chartSize = Math.max(28, Math.min(desiredSize, hardMax));

          if (
            Math.abs(chartSize - this._pieChartSize.width) > 5 ||
            Math.abs(chartSize - this._pieChartSize.height) > 5 ||
            Math.abs(legendWidth - this._pieLegendWidth) > 3
          ) {
            this._pieChartSize = {
              width: chartSize,
              height: chartSize,
            };
            this._pieLegendWidth = legendWidth;
            // Force re-render to update ResponsiveContainer
            if (this._isMounted) {
              this.forceUpdate();
            }
          }
        }
      }
    });

    // Observe container to get widget size
    if (container) {
      this._resizeObserver.observe(container);
    }
  };
  waterUnifiedHandleMinMaxSelection(event) {
    if (event?.detail?.minMax !== undefined) {
      const { minMax, timestamp = 0, source } = event.detail;

      if ((minMax ?? null) === (this.state.minMax ?? null)) {
        return;
      }

      // Skip if this is a duplicate event or from this widget
      if (
        timestamp <= this.state.lastMinMaxEventTimestamp ||
        source === "WaterUnifiedWidget"
      ) {
        console.log(
          "[waterUnifiedHandleMinMaxSelection] Skipping duplicate or self-triggered event",
        );
        return;
      }

      console.log(
        `[waterUnifiedHandleMinMaxSelection] Received min/max selection: ${minMax}`,
      );

      this.setState(
        {
          minMax,
          lastMinMaxEventTimestamp: timestamp,
        },
        () => {
          // Min/Max toggle should feel immediate across widgets.
          if (this.throttledFetchData?.cancel) this.throttledFetchData.cancel();
          this.waterUnifiedFetchData();
          this.waterUnifiedUpdateUrlWithFilters();
        },
      );
    }
  }
  handleWaterSupplyReset = () => {
    const alreadyReset =
      !this.state.viloyat &&
      !this.state.tuman &&
      !this.state.mavsum &&
      !this.state.fermer_nomNom &&
      !this.state.cropFieldFilters.selectedEkinTuri &&
      !this.state.cropFieldFilters.selectedManbaNomi &&
      !this.state.cropFieldFilters.selectedKanalNomi;
    if (alreadyReset) return;

    this.setState(
      {
        viloyat: "",
        tuman: "",
        mavsum: "",
        fermer_nomNom: "",
        cropFieldFilters: {
          ...this.state.cropFieldFilters,
          selectedEkinTuri: "",
          selectedManbaNomi: "",
          selectedKanalNomi: "",
        },
      },
      () => {
        this.waterUnifiedFetchData();
        this.waterUnifiedUpdateUrlWithFilters();
      },
    );
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

  private normalizeMavsumForCombinedApi(value: any): string {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    const normalized = raw.toLowerCase().replace(/\s+/g, " ");

    const isIkkilamchi =
      normalized.includes("ikkilamchi") ||
      normalized.includes("иккиламчи") ||
      normalized.includes("вторич");
    if (isIkkilamchi) return " Ikkilamchi";

    const isBirlamchi =
      normalized.includes("birlamchi") ||
      normalized.includes("бирламчи") ||
      normalized.includes("первич");
    if (isBirlamchi) return "Birlamchi va umummavsumiy";

    const isUmumiy =
      normalized === "umumiy" ||
      normalized === "умумий" ||
      normalized === "общий" ||
      normalized === "mavsum" ||
      normalized === "mavsumiy" ||
      normalized === "umummavsumiy" ||
      normalized === "umum mavsumiy";
    if (isUmumiy) return "";

    return raw;
  }

  private parseMetricValue(value: any): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;

    const raw = String(value ?? "").trim();
    if (!raw) return 0;

    const compact = raw.replace(/\s+/g, "").replace(/,/g, "");
    const withUnit = compact.match(/^(-?\d+(?:\.\d+)?)([kmb])$/i);
    if (withUnit) {
      const base = Number(withUnit[1]);
      const unit = withUnit[2].toUpperCase();
      const multiplier =
        unit === "B" ? 1_000_000_000 : unit === "M" ? 1_000_000 : 1_000;
      return Number.isFinite(base) ? base * multiplier : 0;
    }

    const numeric = Number(compact.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private parseMonthIndexFromName(value: any): number {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/yo/g, "yo")
      .replace(/ё/g, "е");

    if (!normalized) return 0;

    const monthPatterns: Array<[number, RegExp]> = [
      [1, /^(yan|jan|янв)/],
      [2, /^(fev|feb|фев)/],
      [3, /^(mar|mart|март)/],
      [4, /^(apr|aprel|april|апр)/],
      [5, /^(may|май)/],
      [6, /^(iyun|jun|june|июн)/],
      [7, /^(iyul|jul|july|июл)/],
      [8, /^(avg|aug|авг)/],
      [9, /^(sen|sep|sent|сент)/],
      [10, /^(okt|oct|окт)/],
      [11, /^(noy|nov|ноя)/],
      [12, /^(dek|dec|дек)/],
    ];

    for (const [monthIndex, pattern] of monthPatterns) {
      if (pattern.test(normalized)) return monthIndex;
    }

    return 0;
  }

  private resolveMonthIndex(monthValue: any, monthName?: any): number {
    const fromName = this.parseMonthIndexFromName(monthName);
    if (fromName >= 1 && fromName <= 12) return fromName;

    const fromNumber = Number(String(monthValue ?? "").trim());
    if (Number.isInteger(fromNumber) && fromNumber >= 1 && fromNumber <= 12) {
      return fromNumber;
    }

    return 0;
  }

  private normalizeMonthlyConsumptionItems(
    items: any[] = [],
  ): Array<
    Pick<
      MonthlyData,
      "month" | "month_name" | "consumption_m3ha" | "total_consumption_m3"
    >
  > {
    return items
      .map((item) => {
        const month = this.resolveMonthIndex(item?.month, item?.month_name);
        return {
          month,
          month_name: String(item?.month_name ?? "").trim(),
          consumption_m3ha: this.parseMetricValue(item?.consumption_m3ha),
          total_consumption_m3: this.parseMetricValue(
            item?.total_consumption_m3,
          ),
        };
      })
      .filter((item) => item.month >= 1 && item.month <= 12)
      .sort((a, b) => a.month - b.month);
  }

  private normalizeMonthlySupplyItems(
    items: any[] = [],
  ): Array<
    Pick<
      MonthlyData,
      "month" | "month_name" | "supply_m3ha" | "total_supply_m3"
    >
  > {
    return items
      .map((item) => {
        const month = this.resolveMonthIndex(item?.month, item?.month_name);
        return {
          month,
          month_name: String(item?.month_name ?? "").trim(),
          supply_m3ha: this.parseMetricValue(item?.supply_m3ha),
          total_supply_m3: this.parseMetricValue(item?.total_supply_m3),
        };
      })
      .filter((item) => item.month >= 1 && item.month <= 12)
      .sort((a, b) => a.month - b.month);
  }

  private waterUnifiedHandleYilEvent = (e: any) => {
    const incoming =
      this.normalizeYearValue(e?.detail?.yil ?? "") || DEFAULT_INITIAL_YEAR;
    if (!this._isMounted) return;
    if ((incoming || "") === (this.state.yil || "")) return;

    this.setState({ yil: incoming }, () => {
      this.throttledFetchData();
      this.waterUnifiedUpdateUrlWithFilters();
    });
  };

  private waterUnifiedHandleYilAliasEvent = (e: any) => {
    const incoming =
      this.normalizeYearValue(
        e?.detail?.year ?? e?.detail?.constructionYear ?? "",
      ) || DEFAULT_INITIAL_YEAR;
    if (!this._isMounted) return;
    if ((incoming || "") === (this.state.yil || "")) return;

    this.setState({ yil: incoming }, () => {
      this.throttledFetchData();
      this.waterUnifiedUpdateUrlWithFilters();
    });
  };

  componentWillUnmount() {
    this._isMounted = false;

    // Cleanup ResizeObserver
    if (this._resizeObserver) {
      if (this._pieChartContainerRef.current) {
        this._resizeObserver.unobserve(this._pieChartContainerRef.current);
      }
      if (this._pieChartWrapperRef.current) {
        this._resizeObserver.unobserve(this._pieChartWrapperRef.current);
      }
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    // Language change listener cleanup
    document.removeEventListener("languageChanged", this.handleLanguageChange);

    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    if (this.throttledFetchData?.cancel) this.throttledFetchData.cancel();

    document.removeEventListener(
      "minMaxSelected",
      this.waterUnifiedHandleMinMaxSelection,
    );
    document.removeEventListener(
      "waterSupplyFiltersReset",
      this.handleWaterSupplyReset,
    );
    document.removeEventListener(
      "waterSupplyFilterChanged",
      this.filterChangeHandler,
    );
    document.removeEventListener(
      "clearCropSelection",
      this.clearSelectionHandler,
    );
    document.removeEventListener(
      "clearCanalSelection",
      this.clearSelectionHandler,
    );
    document.removeEventListener(
      "clearWaterSourceSelection",
      this.clearSelectionHandler,
    );
    document.removeEventListener(
      "regionDependentFiltersReset",
      this.clearSelectionHandler,
    );
    document.removeEventListener(
      "themeToggled",
      this.waterUnifiedHandleThemeChange as EventListener,
    );
    document.removeEventListener(
      "themeChanged",
      this.waterUnifiedHandleThemeChange as EventListener,
    );
    document.removeEventListener(
      "waterSourceSelected",
      this.waterSourceSelectedHandler,
    );
    document.removeEventListener("canalselected", this.canalselectedHandler);
    document.removeEventListener("cropSelected", this.cropSelectedHandler);

    // ✅ NEW: cleanup year listeners
    document.removeEventListener("yilChanged", this.waterUnifiedHandleYilEvent);
    document.removeEventListener(
      "constructionYearChanged",
      this.waterUnifiedHandleYilAliasEvent,
    );

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private handleExternalDependentFiltersClear = (event: any): void => {
    const timestamp = Number(event?.detail?.timestamp || 0);
    if (timestamp && timestamp <= this._lastExternalClearTimestamp) {
      return;
    }
    if (timestamp) {
      this._lastExternalClearTimestamp = timestamp;
    }

    const reason = String(event?.detail?.reason || "");
    const shouldClearMinMax =
      reason === "tumanChanged" || reason === "fermerChanged";

    this.setState(
      (prev) => {
        const hasDependentSelection =
          !!prev.cropFieldFilters.selectedEkinTuri ||
          !!prev.cropFieldFilters.selectedManbaNomi ||
          !!prev.cropFieldFilters.selectedKanalNomi;
        const hasMinMaxToClear = shouldClearMinMax && !!prev.minMax;

        if (!hasDependentSelection && !hasMinMaxToClear) return null;

        return {
          minMax: shouldClearMinMax ? null : prev.minMax,
          cropFieldFilters: {
            ...prev.cropFieldFilters,
            selectedEkinTuri: "",
            selectedManbaNomi: "",
            selectedKanalNomi: "",
          },
        };
      },
      () => {
        this.throttledFetchData();
        this.waterUnifiedUpdateUrlWithFilters();
      },
    );
  };

  waterUnifiedHandleWaterSourceSelected(event) {
    if (event?.detail?.sourceSelected !== undefined) {
      const source = event.detail.sourceSelected;
      if (
        (source || "") === (this.state.cropFieldFilters.selectedManbaNomi || "")
      ) {
        return;
      }
      this.setState(
        (s) => ({
          cropFieldFilters: {
            ...s.cropFieldFilters,
            selectedManbaNomi: source,
            selectedKanalNomi: "", // clear stale canal when source changes
          },
        }),
        () => {
          this.throttledFetchData();
          this.waterUnifiedUpdateUrlWithFilters();
        },
      );
    }
  }

  waterUnifiedHandlecanalselected(event) {
    if (
      event?.detail?.canalName !== undefined ||
      event?.detail?.kanal_nomi !== undefined
    ) {
      const canal = event.detail.kanal_nomi ?? event.detail.canalName;
      const prevCanal = this.state.cropFieldFilters.selectedKanalNomi || "";

      if ((canal || "") === prevCanal) {
        return;
      }

      // Guard: don't clear canal filter during active min/max switch
      if (
        !canal &&
        this.state.minMax &&
        this.state.cropFieldFilters.selectedKanalNomi
      ) {
        return;
      }
      this.setState(
        (s) => ({
          cropFieldFilters: {
            ...s.cropFieldFilters,
            selectedKanalNomi: canal,
          },
        }),
        () => {
          this.throttledFetchData();
          this.waterUnifiedUpdateUrlWithFilters();
        },
      );
    }
  }

  waterUnifiedHandleCropSelected(event) {
    if (event?.detail?.cropType !== undefined) {
      const crop = event.detail.cropType;

      // Skip clearing a crop selection from external event (e.g., EvapoCrop broadcasting crop=null)
      // Only update if: 1) crop is explicitly set to a new value, or 2) crop stays null and is already null
      const prevCrop = this.state.cropFieldFilters.selectedEkinTuri || null;
      if (crop === null && prevCrop === null) {
        return; // Already null, no-op
      }
      if (crop === null && prevCrop !== null) {
        return; // Ignore external crop clear events
      }
      if (
        (crop || "") === (this.state.cropFieldFilters.selectedEkinTuri || "")
      ) {
        return;
      }

      this.setState(
        (s) => ({
          cropFieldFilters: {
            ...s.cropFieldFilters,
            selectedEkinTuri: crop,
          },
        }),
        () => {
          this.throttledFetchData();
          this.waterUnifiedUpdateUrlWithFilters();
        },
      );
    }
  }

  // Handler for theme change events
  waterUnifiedHandleThemeChange = (event): void => {
    if (!event || !event.detail) return;

    const d: any = event.detail || {};
    console.log("[EvapoCombinedV9] Theme change event:", d);

    const applyTheme = (isDarkTheme: boolean) => {
      try {
        const theme = isDarkTheme ? "dark" : "light";
        localStorage.setItem("app_theme", theme);
        localStorage.setItem("evapo_app_theme", theme);
      } catch {
        // ignore storage errors
      }
      this.setState({ isDarkTheme }, () => {
        setTimeout(() => {
          this.setupPieChartResizeObserver();
        }, 0);
      });
    };

    // Check for isDarkTheme property
    if (typeof d.isDarkTheme === "boolean") {
      console.log(
        "[EvapoCombinedV9] Setting isDarkTheme from detail.isDarkTheme:",
        d.isDarkTheme,
      );
      applyTheme(d.isDarkTheme);
      return;
    }

    // Check for theme property ("light" or "dark")
    if (typeof d.theme === "string") {
      const isLight = String(d.theme).toLowerCase() === "light";
      console.log(
        "[EvapoCombinedV9] Setting isDarkTheme from detail.theme:",
        d.theme,
        "-> isDarkTheme:",
        !isLight,
      );
      applyTheme(!isLight);
      return;
    }

    // Fallback: infer from DOM classes
    const root = document.documentElement;
    const body = document.body;
    const isLight =
      root.classList.contains("light-theme") ||
      root.getAttribute("data-theme") === "light" ||
      body.classList.contains("light-theme");
    console.log(
      "[EvapoCombinedV9] Setting isDarkTheme from DOM fallback, isLight:",
      isLight,
    );
    applyTheme(!isLight);
  };

  // Interactive total handlers
  waterUnifiedHandleTotalHover = (totalType: "consumption" | "supply") => {
    this.setState({ hoveredTotal: totalType });
  };

  waterUnifiedHandleTotalLeave = () => {
    this.setState({ hoveredTotal: null });
  };

  waterUnifiedHandleTotalClick = () => {
    this.setState({ showTotalDetails: !this.state.showTotalDetails });
  };

  private buildFetchSignature = (): string => {
    const {
      viloyat,
      tuman,
      mavsum,
      fermer_nomNom,
      cropFieldFilters,
      minMax,
      yil,
    } = this.state;
    const normalizedMavsum = this.normalizeMavsumForCombinedApi(mavsum);
    const normalizedYear = yil && /^\d{4}$/.test(yil) ? yil : "";
    const { selectedEkinTuri, selectedManbaNomi, selectedKanalNomi } =
      cropFieldFilters;

    return [
      viloyat || "",
      tuman || "",
      normalizedMavsum || "",
      fermer_nomNom || "",
      selectedEkinTuri || "",
      selectedManbaNomi || "",
      selectedKanalNomi || "",
      minMax || "",
      normalizedYear,
    ].join("|");
  };

  // Main data fetching method with better coordination
  waterUnifiedFetchData = async (force: boolean = false) => {
    const fetchSignature = this.buildFetchSignature();
    if (
      !force &&
      (fetchSignature === this._inFlightFetchSignature ||
        fetchSignature === this._lastCompletedFetchSignature)
    ) {
      console.log("[WaterUnifiedWidget] Skipping duplicate fetch request");
      return;
    }

    this._inFlightFetchSignature = fetchSignature;

    // Generate a unique ID for this fetch operation
    const fetchId = ++this._lastFetchId;
    this._fetchQueue++;

    // Show loading state
    this.setState({
      loadingConsumption: true,
      loadingSupply: true,
      error: null,
    });

    try {
      // Cancel any in-flight requests
      if (this._abortController) {
        this._abortController.abort();
      }

      // Create a new abort controller for this operation
      this._abortController = new AbortController();
      const signal = this._abortController.signal;

      // Fetch both data sets concurrently
      console.log(
        `[WaterUnifiedWidget] Starting fetch #${fetchId} for consumption and supply data`,
      );

      const [consumptionData, supplyData] = await Promise.all([
        this.waterUnifiedFetchConsumptionData(signal),
        this.waterUnifiedFetchSupplyData(signal),
      ]);

      // If this request was aborted or superseded by a newer one, bail out
      if (signal.aborted || fetchId !== this._lastFetchId) {
        console.log(
          `[WaterUnifiedWidget] Fetch #${fetchId} was aborted or superseded`,
        );
        return;
      }

      if (this._isMounted) {
        console.log(
          `[WaterUnifiedWidget] Fetch #${fetchId} completed successfully`,
        );

        this._lastCompletedFetchSignature = fetchSignature;

        // Merge the data from both sources
        this.waterUnifiedMergeData({
          totalConsumption: consumptionData.totalConsumption,
          consumptionData: consumptionData.monthlyData,
          totalSupply: supplyData.totalSupply,
          supplyData: supplyData.monthlyData,
        });

        this.setState({
          loadingConsumption: false,
          loadingSupply: false,
          error: null,
        });
      }
    } catch (error) {
      if (
        error.name !== "AbortError" &&
        fetchId === this._lastFetchId &&
        this._isMounted
      ) {
        console.error(
          `[WaterUnifiedWidget] Error in fetch #${fetchId}:`,
          error,
        );

        this.setState({
          error: `Failed to fetch water data: ${error.message}`,
          loadingConsumption: false,
          loadingSupply: false,
        });
      }
    } finally {
      this._fetchQueue--;

      if (this._inFlightFetchSignature === fetchSignature) {
        this._inFlightFetchSignature = null;
      }

      // Only clear the controller if this was the last fetch in the queue
      if (this._fetchQueue === 0) {
        this._abortController = null;
      }
    }
  };

  waterUnifiedFetchConsumptionData = async (
    signal: AbortSignal,
  ): Promise<{ totalConsumption: number; monthlyData: any[] }> => {
    try {
      const {
        viloyat,
        tuman,
        mavsum,
        fermer_nomNom,
        cropFieldFilters,
        minMax,
        yil,
      } = this.state;
      const { selectedEkinTuri, selectedManbaNomi, selectedKanalNomi } =
        cropFieldFilters;

      const queryParams = new URLSearchParams();
      if (viloyat) queryParams.append("viloyat", viloyat);
      if (tuman) queryParams.append("tuman", tuman);
      const normalizedMavsum = this.normalizeMavsumForCombinedApi(mavsum);
      if (normalizedMavsum) queryParams.append("mavsum", normalizedMavsum);
      if (fermer_nomNom) queryParams.append("fermer_nom", fermer_nomNom);
      if (selectedEkinTuri) queryParams.append("ekin_turi", selectedEkinTuri);
      if (selectedManbaNomi)
        queryParams.append("manba_nomi", selectedManbaNomi);
      if (selectedKanalNomi)
        queryParams.append("kanal_nomi", selectedKanalNomi);
      if (minMax) queryParams.append("min_max", minMax);
      // ✅ YEAR
      if (yil && /^\d{4}$/.test(yil)) queryParams.append("yil", yil);

      const apiUrl = `https://sgm.uzspace.uz/api/v1/water/consumption?${queryParams.toString()}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (signal.aborted) throw new Error("AbortError");
      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);

      const data = await response.json();
      if (signal.aborted) throw new Error("AbortError");

      const totalConsumption = this.parseMetricValue(data.uwt_m3);
      const monthlyConsumptionData = this.normalizeMonthlyConsumptionItems(
        data.monthly_consumption_data || [],
      );

      return { totalConsumption, monthlyData: monthlyConsumptionData };
    } catch (error) {
      if (error.name === "AbortError" || error.message === "AbortError")
        throw new Error("AbortError");
      console.error("Error fetching consumption data:", error);
      throw error;
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.loadingConsumption !== nextState.loadingConsumption ||
      this.state.loadingSupply !== nextState.loadingSupply ||
      this.state.error !== nextState.error ||
      this.state.isDarkTheme !== nextState.isDarkTheme ||
      this.state.hoveredTotal !== nextState.hoveredTotal ||
      this.state.showTotalDetails !== nextState.showTotalDetails
    ) {
      return true;
    }

    // Check if filters changed
    if (
      this.state.viloyat !== nextState.viloyat ||
      this.state.tuman !== nextState.tuman ||
      this.state.mavsum !== nextState.mavsum ||
      this.state.fermer_nomNom !== nextState.fermer_nomNom ||
      this.state.cropFieldFilters.selectedEkinTuri !==
        nextState.cropFieldFilters.selectedEkinTuri ||
      this.state.cropFieldFilters.selectedManbaNomi !==
        nextState.cropFieldFilters.selectedManbaNomi ||
      this.state.cropFieldFilters.selectedKanalNomi !==
        nextState.cropFieldFilters.selectedKanalNomi
    ) {
      return true;
    }

    // Deep check for data changes
    if (
      this.state.data.totalConsumption !== nextState.data.totalConsumption ||
      this.state.data.totalSupply !== nextState.data.totalSupply ||
      JSON.stringify(this.state.data.monthlyData) !==
        JSON.stringify(nextState.data.monthlyData)
    ) {
      return true;
    }

    return false;
  }
  waterUnifiedFetchSupplyData = async (
    signal: AbortSignal,
  ): Promise<{ totalSupply: number; monthlyData: any[] }> => {
    try {
      const {
        viloyat,
        tuman,
        mavsum,
        fermer_nomNom,
        cropFieldFilters,
        minMax,
        yil,
      } = this.state;
      const { selectedEkinTuri, selectedManbaNomi, selectedKanalNomi } =
        cropFieldFilters;

      const queryParams = new URLSearchParams();
      if (viloyat) queryParams.append("viloyat", viloyat);
      if (tuman) queryParams.append("tuman", tuman);
      const normalizedMavsum = this.normalizeMavsumForCombinedApi(mavsum);
      if (normalizedMavsum) queryParams.append("mavsum", normalizedMavsum);
      if (fermer_nomNom) queryParams.append("fermer_nom", fermer_nomNom);
      if (selectedEkinTuri) queryParams.append("ekin_turi", selectedEkinTuri);
      if (selectedManbaNomi)
        queryParams.append("manba_nomi", selectedManbaNomi);
      if (selectedKanalNomi)
        queryParams.append("kanal_nomi", selectedKanalNomi);
      if (minMax) queryParams.append("min_max", minMax);
      // ✅ YEAR
      if (yil && /^\d{4}$/.test(yil)) queryParams.append("yil", yil);

      const apiUrl = `https://sgm.uzspace.uz/api/v1/water/supply?${queryParams.toString()}`;
      console.log("Fetching water supply data from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (signal.aborted) throw new Error("AbortError");
      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);

      const data = await response.json();
      if (signal.aborted) throw new Error("AbortError");

      const totalSupply = this.parseMetricValue(data.awt_m3);
      const monthlySupplyData = this.normalizeMonthlySupplyItems(
        data.monthly_supply_data || [],
      );

      return { totalSupply, monthlyData: monthlySupplyData };
    } catch (error) {
      if (error.name === "AbortError" || error.message === "AbortError")
        throw new Error("AbortError");
      console.error("Error fetching supply data:", error);
      throw error;
    }
  };

  // Merge consumption and supply data into a unified dataset
  waterUnifiedMergeData({
    totalConsumption,
    totalSupply,
    consumptionData,
    supplyData,
  }: {
    totalConsumption?: number;
    totalSupply?: number;
    consumptionData?: WaterConsumptionResponse["monthly_consumption_data"];
    supplyData?: WaterSupplyResponse["monthly_supply_data"];
  }) {
    const newData = {
      totalConsumption: totalConsumption ?? null,
      totalSupply: totalSupply ?? null,
      monthlyData: [] as MonthlyData[],
    };

    const monthMap = new Map<number, MonthlyData>();

    if (consumptionData) {
      consumptionData.forEach((item) => {
        const month = this.resolveMonthIndex(item?.month, item?.month_name);
        if (month < 1 || month > 12) return;
        const existingData = monthMap.get(month) || {
          month,
          month_name: String(item?.month_name ?? "").trim(),
          supply_m3ha: 0,
          total_supply_m3: 0,
          consumption_m3ha: 0,
          total_consumption_m3: 0,
        };

        monthMap.set(month, {
          ...existingData,
          month,
          month_name:
            String(item?.month_name ?? "").trim() || existingData.month_name,
          consumption_m3ha: this.parseMetricValue(item?.consumption_m3ha),
          total_consumption_m3: this.parseMetricValue(
            item?.total_consumption_m3,
          ),
        });
      });
    }

    if (supplyData) {
      supplyData.forEach((item) => {
        const month = this.resolveMonthIndex(item?.month, item?.month_name);
        if (month < 1 || month > 12) return;
        const existingData = monthMap.get(month) || {
          month,
          month_name: String(item?.month_name ?? "").trim(),
          consumption_m3ha: 0,
          total_consumption_m3: 0,
          supply_m3ha: 0,
          total_supply_m3: 0,
        };

        monthMap.set(month, {
          ...existingData,
          month,
          month_name:
            String(item?.month_name ?? "").trim() || existingData.month_name,
          supply_m3ha: this.parseMetricValue(item?.supply_m3ha),
          total_supply_m3: this.parseMetricValue(item?.total_supply_m3),
        });
      });
    }

    newData.monthlyData = Array.from(monthMap.values()).sort(
      (a, b) => a.month - b.month,
    );

    this.setState({ data: newData });
  }

  // Fetch filter options for crop-specific filters
  waterUnifiedFetchFilterOptions = async () => {
    try {
      this.setState({ loadingFilters: true });

      // For demonstration purposes, using mock data as in the original components
      const ekinTuri = [
        "Wheat",
        "Cotton",
        "Rice",
        "Corn",
        "Vegetables",
        "Fruits",
      ];
      const manbaNomi = [
        "River",
        "Lake",
        "Underground",
        "Reservoir",
        "Collection Basin",
      ];
      const kanalNomi = [
        "Main Canal",
        "Secondary Canal",
        "Tertiary Canal",
        "Irrigation Ditch",
        "Distribution Channel",
      ];

      // Sort options alphabetically
      ekinTuri.sort();
      manbaNomi.sort();
      kanalNomi.sort();

      this.setState({
        cropFieldFilters: {
          ...this.state.cropFieldFilters,
          ekinTuri,
          manbaNomi,
          kanalNomi,
        },
        loadingFilters: false,
      });

      console.log("Filter options loaded successfully");
      return true;
    } catch (error) {
      console.error("Error fetching filter options:", error);
      this.setState({
        error: `Failed to fetch filter options: ${error.message}`,
        loadingFilters: false,
      });
      return false;
    }
  };

  waterUnifiedHandleFilterChange(event) {
    if (event && event.detail) {
      const filters = event.detail;
      const hasRawMavsum =
        filters && Object.prototype.hasOwnProperty.call(filters, "mavsumRaw");
      const incomingMavsum = hasRawMavsum
        ? String(filters.mavsumRaw ?? "")
        : String(filters.mavsum ?? "");
      const nextViloyat = filters.viloyat || "";
      const nextTuman = filters.tuman || "";
      const nextFermer = filters.fermer_nomNom || "";
      const nextYil =
        this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR;

      const tumanChanged = nextTuman !== (this.state.tuman || "");
      const fermerChanged = nextFermer !== (this.state.fermer_nomNom || "");
      const shouldResetDependentFilters = tumanChanged || fermerChanged;

      const hasNoChanges =
        nextViloyat === (this.state.viloyat || "") &&
        nextTuman === (this.state.tuman || "") &&
        incomingMavsum === (this.state.mavsum || "") &&
        nextFermer === (this.state.fermer_nomNom || "") &&
        nextYil === (this.state.yil || DEFAULT_INITIAL_YEAR);
      if (hasNoChanges) return;

      this.setState(
        (prev) => ({
          viloyat: nextViloyat,
          tuman: nextTuman,
          mavsum: incomingMavsum,
          fermer_nomNom: nextFermer,
          // ✅ YEAR passthrough
          yil: nextYil,
          // IMPORTANT: when district/farmer changes, clear dependent filters
          // so stale ekin/manba/kanal/min_max are not carried into new fetches.
          minMax: shouldResetDependentFilters ? null : prev.minMax,
          cropFieldFilters: shouldResetDependentFilters
            ? {
                ...prev.cropFieldFilters,
                selectedEkinTuri: "",
                selectedManbaNomi: "",
                selectedKanalNomi: "",
              }
            : prev.cropFieldFilters,
        }),
        () => {
          this.throttledFetchData();
          this.waterUnifiedUpdateUrlWithFilters();
        },
      );
    }
  }

  waterUnifiedUpdateFiltersFromProps(filters) {
    const hasRawMavsum =
      filters && Object.prototype.hasOwnProperty.call(filters, "mavsumRaw");
    const incomingMavsum = hasRawMavsum
      ? String(filters.mavsumRaw ?? "")
      : String(filters.mavsum ?? "");
    const nextTuman = filters.tuman || "";
    const nextFermer = filters.fermer_nomNom || "";
    const tumanChanged = nextTuman !== (this.state.tuman || "");
    const fermerChanged = nextFermer !== (this.state.fermer_nomNom || "");
    const shouldResetDependentFilters = tumanChanged || fermerChanged;
    const newState = {
      viloyat: filters.viloyat || "",
      tuman: nextTuman,
      mavsum: incomingMavsum,
      fermer_nomNom: nextFermer,
      // ✅ YEAR
      yil: this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR,
    };

    const hasNoChanges =
      newState.viloyat === (this.state.viloyat || "") &&
      newState.tuman === (this.state.tuman || "") &&
      newState.mavsum === (this.state.mavsum || "") &&
      newState.fermer_nomNom === (this.state.fermer_nomNom || "") &&
      newState.yil === (this.state.yil || DEFAULT_INITIAL_YEAR);
    if (hasNoChanges) return;

    this.setState(
      (prev) => ({
        ...newState,
        minMax: shouldResetDependentFilters ? null : prev.minMax,
        cropFieldFilters: shouldResetDependentFilters
          ? {
              ...prev.cropFieldFilters,
              selectedEkinTuri: "",
              selectedManbaNomi: "",
              selectedKanalNomi: "",
            }
          : prev.cropFieldFilters,
      }),
      () => {
        this.throttledFetchData();
        this.waterUnifiedUpdateUrlWithFilters();
      },
    );
  }
  waterUnifiedUpdateUrlWithFilters = () => {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;

    urlParams.delete("viloyat");
    urlParams.delete("tuman");
    urlParams.delete("mavsum");
    urlParams.delete("fermer_nom");
    urlParams.delete("ekin_turi");
    urlParams.delete("manba_nomi");
    urlParams.delete("kanal_nomi");
    urlParams.delete("min_max");
    urlParams.delete("yil");

    const search = urlParams.toString();
    const newUrl = search ? `${url.pathname}?${search}` : url.pathname;
    window.history.replaceState({ path: newUrl }, "", newUrl);
  };

  // Format number with commas and specified decimal places
  waterUnifiedFormatNumber = (
    num: number | null | undefined,
    decimalPlaces: number = 1,
  ) => {
    if (num === null || num === undefined) {
      return t(this.state.lang, "value.na");
    }
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  // Format large number in a more readable way (K, M, B)
  waterUnifiedFormatLargeNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) {
      return t(this.state.lang, "value.na");
    }

    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }

    return num.toString();
  };

  // Helper function to adjust color brightness for gradients
  adjustColorBrightness = (color: string, percent: number): string => {
    if (!color || !color.startsWith("#")) {
      return color;
    }
    const num = parseInt(color.replace("#", ""), 16);
    if (isNaN(num)) {
      return color;
    }
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    const hex = (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    return `#${hex.toUpperCase()}`;
  };

  // Custom tooltip for charts - more compact
  waterUnifiedRenderCustomTooltip = (props) => {
    if (!props.active || !props.payload || !props.payload.length) {
      return null;
    }

    const { payload, label } = props;

    return (
      <div className="water-unified-tooltip">
        <div className="water-unified-tooltip-title">{`${label}`}</div>
        <div className="water-unified-tooltip-content">
          {payload.map((entry, index) => {
            const rawLabel = String(entry?.name ?? entry?.dataKey ?? "");
            const localizedLabel =
              rawLabel === "Istemol"
                ? t(this.state.lang, "evapoCombined.consumption")
                : rawLabel;
            return (
              <div className="water-unified-tooltip-row" key={`item-${index}`}>
                <span
                  className="water-unified-tooltip-label"
                  style={
                    this.state.isDarkTheme ? { color: entry.color } : undefined
                  }
                >
                  {localizedLabel}:
                </span>
                <span className="water-unified-tooltip-value">
                  {this.waterUnifiedFormatLargeNumber(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Wave animation for bar shapes
  private renderWaveBarShape = (props: any): JSX.Element => {
    const {
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      fill = "#4FD8D8",
      index = 0,
    } = props;
    const safeWidth = Math.max(0, width);
    const safeHeight = Math.max(2, height);
    const radius = Math.min(6, safeHeight / 2);
    const showEdgeWave = safeHeight > 12;
    const ampMain = Math.max(1.1, Math.min(2.8, safeWidth * 0.12));
    const ampFine = Math.max(0.7, Math.min(1.9, safeWidth * 0.08));
    const segmentCount = Math.max(
      10,
      Math.min(26, Math.round(safeWidth / 2.2)),
    );
    const topY = y;
    const clipId = `wc-wave-${index}-${Math.round(y)}`;

    const buildWaveTop = (phase: number, amp: number, driftY = 0): string => {
      let d = `M ${x} ${topY + driftY}`;
      const waveFreq = (Math.PI * 2) / Math.max(6, segmentCount - 1);
      for (let i = 1; i < segmentCount; i++) {
        const px = x + (safeWidth * i) / (segmentCount - 1);
        const wobble = Math.sin(i * waveFreq + phase) * amp;
        const py = topY + driftY + wobble;
        d += ` L ${px} ${py}`;
      }
      return d;
    };

    const waveTopA = buildWaveTop(0, ampMain);
    const waveTopB = buildWaveTop(Math.PI / 2, ampMain);
    const waveTopC = buildWaveTop(Math.PI, ampMain);
    const waveTopD = buildWaveTop((Math.PI * 3) / 2, ampMain);

    const foamTopA = buildWaveTop(Math.PI / 4, ampFine, 0.8);
    const foamTopB = buildWaveTop((Math.PI * 3) / 4, ampFine, 0.8);
    const foamTopC = buildWaveTop((Math.PI * 5) / 4, ampFine, 0.8);
    const foamTopD = buildWaveTop((Math.PI * 7) / 4, ampFine, 0.8);

    const toFillPath = (edgePath: string): string =>
      `${edgePath} V ${y + safeHeight} H ${x} Z`;

    const fillPathA = toFillPath(waveTopA);
    const fillPathB = toFillPath(waveTopB);
    const fillPathC = toFillPath(waveTopC);
    const fillPathD = toFillPath(waveTopD);

    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect
              x={x}
              y={y}
              width={safeWidth}
              height={safeHeight}
              rx={radius}
              ry={radius}
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path
            d={
              showEdgeWave
                ? fillPathA
                : `M ${x} ${y} H ${x + safeWidth} V ${y + safeHeight} H ${x} Z`
            }
            fill={fill}
          >
            {showEdgeWave && (
              <animate
                attributeName="d"
                values={`${fillPathA};${fillPathB};${fillPathC};${fillPathD};${fillPathA}`}
                dur="2.6s"
                repeatCount="indefinite"
              />
            )}
          </path>
          {showEdgeWave && (
            <path
              d={waveTopA}
              fill="none"
              stroke="rgba(238, 252, 255, 0.84)"
              strokeWidth={1.1}
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values={`${waveTopA};${waveTopB};${waveTopC};${waveTopD};${waveTopA}`}
                dur="2.6s"
                repeatCount="indefinite"
              />
            </path>
          )}
          {showEdgeWave && (
            <path
              d={foamTopA}
              fill="none"
              stroke="rgba(193, 241, 255, 0.64)"
              strokeWidth={0.9}
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values={`${foamTopA};${foamTopB};${foamTopC};${foamTopD};${foamTopA}`}
                dur="3.4s"
                repeatCount="indefinite"
              />
            </path>
          )}
        </g>
      </g>
    );
  };

  // Render chart based on chart type
  renderChartByType = (
    chartType: ChartType,
    chartData: any[],
    consumptionColor: string,
    isDarkTheme: boolean,
  ) => {
    const commonProps = {
      data: chartData,
      margin: { top: 14, right: 8, left: 6, bottom: 1 },
    };

    const commonAxisProps = {
      tick: { fontSize: 10, fill: isDarkTheme ? "#ccc" : "#3d5755" },
      axisLine: {
        stroke: isDarkTheme ? "#ccc" : "rgba(61, 87, 85, 0.52)",
      },
    };

    const xAxisTickProps = {
      fontSize: 10,
      fill: isDarkTheme ? "#ccc" : "#3d5755",
    };

    switch (chartType) {
      case "line":
        return (
          // @ts-ignore - Recharts type compatibility issue with React
          <LineChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDarkTheme ? "#eee" : "rgba(61, 87, 85, 0.18)"}
            />
            {/* @ts-ignore */}
            <XAxis
              dataKey="name"
              tickMargin={0}
              height={20}
              interval="preserveStartEnd"
              {...commonAxisProps}
              tick={xAxisTickProps}
            />
            {/* @ts-ignore */}
            <YAxis
              yAxisId="total"
              orientation="left"
              tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
              domain={[
                0,
                (dataMax) => Math.ceil((Number(dataMax) || 0) * 1.12),
              ]}
              width={42}
              {...commonAxisProps}
            />
            <Tooltip
              content={this.waterUnifiedRenderCustomTooltip}
              cursor={false}
            />
            {/* @ts-ignore */}
            <Line
              yAxisId="total"
              type="monotone"
              dataKey="Istemol"
              stroke={consumptionColor}
              strokeWidth={3}
              dot={{ r: 4, fill: consumptionColor }}
              activeDot={{ r: 6, fill: consumptionColor }}
            />
          </LineChart>
        );

      case "bar":
        return (
          // @ts-ignore - Recharts type compatibility issue with React
          <BarChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDarkTheme ? "#eee" : "rgba(61, 87, 85, 0.18)"}
            />
            {/* @ts-ignore */}
            <XAxis
              dataKey="name"
              tickMargin={0}
              height={20}
              interval="preserveStartEnd"
              {...commonAxisProps}
              tick={xAxisTickProps}
            />
            {/* @ts-ignore */}
            <YAxis
              yAxisId="total"
              orientation="left"
              tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
              domain={[
                0,
                (dataMax) => Math.ceil((Number(dataMax) || 0) * 1.12),
              ]}
              width={42}
              {...commonAxisProps}
            />
            <Tooltip
              content={this.waterUnifiedRenderCustomTooltip}
              cursor={false}
            />
            {/* @ts-ignore */}
            <Bar
              yAxisId="total"
              dataKey="Istemol"
              fill={consumptionColor}
              activeBar={false}
              shape={this.renderWaveBarShape}
              radius={[6, 6, 0, 0]}
              minPointSize={3}
            />
          </BarChart>
        );

      case "area":
        return (
          // @ts-ignore - Recharts type compatibility issue with React
          <AreaChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDarkTheme ? "#eee" : "rgba(61, 87, 85, 0.18)"}
            />
            {/* @ts-ignore */}
            <XAxis
              dataKey="name"
              tickMargin={0}
              height={20}
              interval="preserveStartEnd"
              {...commonAxisProps}
              tick={xAxisTickProps}
            />
            {/* @ts-ignore */}
            <YAxis
              yAxisId="total"
              orientation="left"
              tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
              domain={[
                0,
                (dataMax) => Math.ceil((Number(dataMax) || 0) * 1.12),
              ]}
              width={42}
              {...commonAxisProps}
            />
            <Tooltip content={this.waterUnifiedRenderCustomTooltip} />
            {/* @ts-ignore */}
            <Area
              yAxisId="total"
              type="monotone"
              dataKey="Istemol"
              stroke={consumptionColor}
              fill={consumptionColor}
              fillOpacity={0.6}
              dot={{ r: 4, fill: consumptionColor }}
              activeDot={{ r: 6, fill: consumptionColor }}
            />
          </AreaChart>
        );

      case "pie":
      default:
        // Prepare data for pie chart - convert monthly data to pie chart format
        const pieData = chartData
          .filter(
            (item) =>
              item && item.Istemol !== undefined && item.Istemol !== null,
          )
          .map((item) => ({
            name: item.name || `Month ${item.month || ""}`,
            value: Number(item.Istemol) || 0,
          }));

        // If no valid data, return empty state message
        if (pieData.length === 0 || pieData.every((item) => item.value === 0)) {
          return (
            <div
              ref={this._pieChartContainerRef}
              className="pie-chart-container-3d"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  color: isDarkTheme ? "#ecf0f1" : "#1a2634",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                {t(this.state.lang, "evapoCombined.noData")}
              </div>
            </div>
          );
        }

        // Beautiful gradient colors for pie chart segments - more vibrant and professional
        const COLORS = isDarkTheme
          ? [
              "#00D4FF",
              "#7B2CBF",
              "#FF6B35",
              "#F7B801",
              "#06FFA5",
              "#FF006E",
              "#8338EC",
              "#3A86FF",
              "#FFBE0B",
              "#FB5607",
              "#FF006E",
              "#8338EC",
            ]
          : [
              "#425c5a",
              "#3d5755",
              "#c79d34",
              "#6b8784",
              "#8aa39f",
              "#b28d3a",
              "#56726f",
              "#91aaa7",
              "#7a9641",
              "#8b6b2f",
              "#708b88",
              "#a3b9b6",
            ];

        return (
          <div
            ref={this._pieChartContainerRef}
            className="pie-chart-container-3d"
          >
            {/* Pie Chart - Always centered in widget */}
            <div
              ref={this._pieChartWrapperRef}
              className="pie-chart-wrapper-3d"
              style={{
                width: `${this._pieChartSize.width}px`,
                height: `${this._pieChartSize.height}px`,
              }}
            >
              {/* @ts-ignore - Recharts type compatibility issue with React */}
              <ResponsiveContainer
                width={this._pieChartSize.width}
                height={this._pieChartSize.height}
              >
                {/* @ts-ignore - Recharts type compatibility issue with React */}
                <PieChart>
                  {/* @ts-ignore */}
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    isAnimationActive={true}
                    labelLine={false}
                    label={({
                      percent,
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                    }) => {
                      // Only show label if segment is large enough
                      if (percent < 0.05) return null; // Hide labels for segments < 5%

                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      const responsiveFontSize = 10;

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={isDarkTheme ? "#ecf0f1" : "#3d5755"}
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={responsiveFontSize}
                          fontWeight={600}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius="96%"
                    innerRadius="25%"
                    fill="#8884d8"
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => {
                      const color = COLORS[index % COLORS.length];
                      return (
                        // @ts-ignore
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#gradient-${index})`}
                          stroke={this.adjustColorBrightness(color, -30)}
                          strokeWidth={2}
                        />
                      );
                    })}
                  </Pie>
                  <defs>
                    {pieData.map((entry, index) => {
                      const color = COLORS[index % COLORS.length];
                      const darkerColor = this.adjustColorBrightness(
                        color,
                        -25,
                      );
                      return (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`gradient-${index}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop
                            offset="100%"
                            stopColor={darkerColor}
                            stopOpacity={1}
                          />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const total = pieData.reduce(
                          (sum, item) => sum + item.value,
                          0,
                        );
                        const percent =
                          total > 0
                            ? ((data.value / total) * 100).toFixed(2)
                            : "0";
                        return (
                          <div className="water-unified-tooltip pie-chart-tooltip">
                            <div className="water-unified-tooltip-title">
                              {data.name}
                            </div>
                            <div className="water-unified-tooltip-content">
                              <div className="water-unified-tooltip-row">
                                <span className="water-unified-tooltip-label">
                                  {t(this.state.lang, "evapoCanal.volume")}:
                                </span>
                                <span className="water-unified-tooltip-value">
                                  {this.waterUnifiedFormatNumber(data.value, 0)}{" "}
                                  m³
                                </span>
                              </div>
                              <div className="water-unified-tooltip-row">
                                <span className="water-unified-tooltip-label">
                                  {t(this.state.lang, "evapoCanal.percentage")}:
                                </span>
                                <span className="water-unified-tooltip-value">
                                  {percent}%
                                </span>
                              </div>
                              <div className="water-unified-tooltip-row">
                                <span className="water-unified-tooltip-label">
                                  {t(this.state.lang, "evapoCanal.total")}:
                                </span>
                                <span className="water-unified-tooltip-value">
                                  {this.waterUnifiedFormatNumber(total, 0)} m³
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Positioned separately, not affecting PieChart centering */}
            <div
              className="pie-chart-legend-vertical"
              style={{
                width: `${this._pieLegendWidth}px`,
                minWidth: `${this._pieLegendWidth}px`,
                maxWidth: `${this._pieLegendWidth}px`,
              }}
            >
              {pieData.map((entry, index) => {
                const color = COLORS[index % COLORS.length];
                const total = pieData.reduce(
                  (sum, item) => sum + item.value,
                  0,
                );
                const percent =
                  total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
                return (
                  <div
                    key={`legend-${index}`}
                    className="pie-legend-item-vertical"
                  >
                    <div
                      className="pie-legend-color-box"
                      style={{
                        background: `linear-gradient(135deg, ${color} 0%, ${this.adjustColorBrightness(color, -20)} 100%)`,
                        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                      }}
                    />
                    <div className="pie-legend-text-vertical">
                      <span className="pie-legend-name">{entry.name}</span>
                      <span className="pie-legend-percent">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  private handleLanguageChange = (e: any) => {
    const raw = e?.detail?.language || e?.detail?.lang || e?.detail?.code || "";
    const newLang = normalizeLang(raw);
    if (this._isMounted && newLang !== this.state.lang) {
      try {
        localStorage.setItem("app_lang", newLang);
        localStorage.setItem("evapo_app_lang", newLang);
      } catch {
        // ignore storage errors
      }
      console.log("[EvapoCombined] Language changed to:", newLang);
      this.setState({ lang: newLang }, () => {
        this.forceUpdate();
      });
    }
  };

  render() {
    const {
      loadingConsumption,
      loadingSupply,
      error,
      data,
      isDarkTheme,
      hoveredTotal,
      showTotalDetails,
      lang,
    } = this.state;

    const { monthlyData, totalConsumption } = data;
    // Determine if loading
    const loading = loadingConsumption || loadingSupply;

    // Get chart type from config, default to 'pie'
    const chartType: ChartType =
      (this.props.config?.chartType as ChartType) || "pie";

    // Get month names from localization based on current language
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      t(lang, `month.${i + 1}`),
    );

    // Prepare data for the charts
    const chartData =
      monthlyData.length > 0
        ? monthlyData.map((item) => {
            const monthIndex = this.resolveMonthIndex(
              item.month,
              item.month_name,
            );
            const monthName =
              monthNames[monthIndex - 1] || item.month_name || `${item.month}`;

            return {
              name: monthName,
              month: monthIndex || item.month,
              Istemol: this.parseMetricValue(item.total_consumption_m3),
              "Consumption m³/ha": this.parseMetricValue(item.consumption_m3ha),
            };
          }) // If no real data, generate sample data with real month names
        : [...Array(7)].map((_, index) => {
            // Generate realistic sample data with increasing trend
            const monthIndex = (index + 2) % 12; // Start from March (index 2)
            const baseTotalConsumption =
              100000000 +
              index * 50000000 +
              (Math.random() * 20000000 - 10000000);
            const baseConsumptionPerHa =
              200 + index * 100 + (Math.random() * 50 - 25);

            return {
              name: monthNames[monthIndex],
              month: monthIndex + 1, // Month number (1-12)
              Istemol: baseTotalConsumption,
              "Consumption m³/ha": baseConsumptionPerHa,
            };
          });

    // Sort by month number to ensure chronological order
    chartData.sort((a, b) => a.month - b.month);

    // Get color for consumption
    const consumptionColor = isDarkTheme ? "#1D91A8" : "#425c5a";

    // Apply theme class based on isDarkTheme state
    const themeClass = !isDarkTheme ? "light-theme" : "";

    return (
      <div className={`water-unified-card ${themeClass}`}>
        <div className="water-unified-header">
          <div className="water-unified-title">
            {t(lang, "evapoCombined.title")}
            {loading && <span className="water-unified-loading">…</span>}
          </div>

          {/* Big total number above chart, no grey container, no "Istemol" text */}
          <div
            className="water-unified-total-display"
            onClick={this.waterUnifiedHandleTotalClick}
          >
            {this.waterUnifiedFormatNumber(totalConsumption, 0)} m³
          </div>

          {/* Additional Details Panel */}
          {showTotalDetails && (
            <div className="water-unified-details-panel">
              <div className="water-unified-detail-row">
                <span>{t(lang, "details.totalConsumption")}:</span>
                <span>
                  {this.waterUnifiedFormatNumber(totalConsumption, 0)} m³
                </span>
              </div>
              <div className="water-unified-detail-row">
                <span>{t(lang, "details.avgMonthlyConsumption")}:</span>
                <span>
                  {monthlyData.length > 0
                    ? this.waterUnifiedFormatLargeNumber(
                        totalConsumption / monthlyData.length,
                      ) + " m³"
                    : t(lang, "value.na")}
                </span>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="water-unified-error">
            <p>{error}</p>
            <button onClick={() => this.waterUnifiedFetchData(true)}>
              {t(lang, "button.retry")}
            </button>
          </div>
        ) : chartType === "pie" ? (
          <div className="water-unified-chart-container">
            {this.renderChartByType(
              chartType,
              chartData,
              consumptionColor,
              isDarkTheme,
            )}
          </div>
        ) : (
          <div className="water-unified-chart-container">
            {/* @ts-ignore - Recharts type compatibility issue with React */}
            <ResponsiveContainer width="100%" height="100%">
              {this.renderChartByType(
                chartType,
                chartData,
                consumptionColor,
                isDarkTheme,
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }
}
