// CropDistributionWidget - Fully Scalable Version

import FeatureLayer from "esri/layers/FeatureLayer";
import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import { AllWidgetProps, ImmutableArray, React } from "jimu-core";
import { Button, Loading, LoadingType } from "jimu-ui";
import "./crop-distribution-widget.css";
import {
  getInitialLang,
  getInitialTheme,
  LangCode,
  normalizeLang,
  registerCropTranslations,
  t,
  translateCropName,
} from "./messages";

const console = {
  log: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {},
  info: (..._args: any[]) => {},
  debug: (..._args: any[]) => {},
};

const DEFAULT_INITIAL_YEAR = "2025";
const DEFAULT_INITIAL_REGION = "Farg'ona viloyati";

// Interface for crop distribution data
interface CropData {
  ekin_turi: string;
  area_ha: number;
  uw: number; // Water usage
  percentage?: number; // Will be calculated
}

// Interface for the API response
interface CropDistributionResponse {
  crop_distribution: CropData[];
}

interface CropDistributionFilters {
  viloyat?: string;
  tuman?: string;
  mavsum?: string;
  fermer_nom?: string;
  waterSource?: string;
  canalName?: string;
  minMax?: string | null;
  yil?: string;
}

// Interface for the widget properties
interface CropDistributionWidgetProps extends AllWidgetProps<any> {
  externalFilters?: {
    viloyat?: string;
    tuman?: string;
    mavsum?: string;
    fermer_nom?: string;
    manba_nomi?: string;
    kanal_nomi?: string;
  };
  useMapWidgetIds?: ImmutableArray<string>; // Map widget ID
}

// Interface for the widget state
interface CropDistributionWidgetState {
  lang: LangCode;
  loading: boolean;
  error: string | null;
  cropData: {
    crops: CropData[];
    totalArea: number;
  };
  yil: string; // keep as string for URL/APIs; e.g., '2025'

  minMax: string | null;
  lastMinMaxEventTimestamp: number;
  // Base filters (synced with other widgets)
  viloyat: string;
  tuman: string;
  mavsum: string;
  fermer_nom: string;
  waterSource: string;
  canalName: string;

  // UI state
  activeSlice: number | null;
  showTopN: number;
  currentPage: number;
  isDarkTheme: boolean;

  // Map-related state
  activeMapView?: JimuMapView;
  featureLayer?: __esri.FeatureLayer;
  featureLayerFields: string[]; // Track available fields
  selectedCrop: string | null;

  // Event tracking
  lastWaterSourceEventTimestamp: number;
  lastCanalEventTimestamp: number;
  isHandlingExternalEvent: boolean;

  // Map connection status
  mapConnectionAttempts: number;
  mapLoadingStatus: "idle" | "loading" | "loaded" | "failed";
  connectionStatus: "idle" | "connecting" | "connected" | "failed";

  // Container sizing - simplified
  containerWidth: number;
  containerHeight: number;
}

export default class CropDistributionWidget extends React.PureComponent<
  CropDistributionWidgetProps,
  CropDistributionWidgetState
> {
  private readonly CROP_PAGE_SIZE = 8;
  private readonly CROP_SLIDE_STEP = 3;
  _isMounted = false;
  updateTimer: any = null;
  filterChangeHandler: any = null;
  waterSourceChangeHandler: any = null;
  canalselectionHandler: any = null;
  containerRef: React.RefObject<HTMLDivElement>;
  resizeObserver: ResizeObserver | null = null;
  themeObserver: MutationObserver | null = null;
  private _canalReverseTranslationCache: Record<
    string,
    Record<string, string>
  > = {};
  private _cropTranslationReqId = 0;

  // Add abort controller for fetch operations
  private fetchAbortController: AbortController | null = null;
  private canalValidationAbortController: AbortController | null = null;
  private externalRefreshTimer: number | null = null;
  private pendingMinMaxClearTimer: number | null = null;
  private cropFetchInFlightKey = "";
  private lastCropFetchKey = "";
  private lastCropFetchAt = 0;

  // Connection constants
  MAX_CONNECTION_ATTEMPTS = 3;

  // Crops come dynamically from the API — no hardcoded allowlist.

  // Crop name mapping: Backend API name -> Map Layer name
  // Add variations if backend and map use different names
  CROP_NAME_MAP: Record<string, string> = {
    // Try different apostrophe variations
    "Makkajo'xori": "Makkajo`xori", // Try backtick
    "Bug'doy": "Bug`doy", // Try backtick
    "Bog'": "Bog`", // Try backtick
    "Bog'lar": "Bog`lar", // Try backtick
    // Add more mappings as needed
  };

  // Chart colors - updated to match the reference image
  CROP_COLORS = [
    "#6c258c", // Purple (for Mosh)
    "#8b3c75", // Purple-pink (for Bug'doy)
    "#35b7c0", // Teal (for Paxta)
    "#68357d", // Dark purple (for Bedа)
    "#75c6ca", // Light blue (for Kartoshka)
    "#47c4d3", // Cyan (for Sabzi)
    "#9e4c91", // Pink (additional color)
  ];

  // Reset method
  private _onReset = (): void => {
    if (this.pendingMinMaxClearTimer !== null) {
      window.clearTimeout(this.pendingMinMaxClearTimer);
      this.pendingMinMaxClearTimer = null;
    }
    this.setState(
      {
        viloyat: DEFAULT_INITIAL_REGION,
        tuman: "",
        mavsum: "",
        fermer_nom: "",
        waterSource: "",
        canalName: "",
        selectedCrop: null,
        activeSlice: null,
        currentPage: 0,
        error: null,
      },
      () => {
        if (this.state.connectionStatus === "connected") {
          this.fetchCropData();
        }
      },
    );
  };

  constructor(props: AllWidgetProps<any>) {
    super(props);

    this.containerRef = React.createRef();

    this.state = {
      lang: getInitialLang(),
      loading: false,
      error: null,
      cropData: {
        crops: [],
        totalArea: 0,
      },
      yil: DEFAULT_INITIAL_YEAR,

      minMax: null,
      lastMinMaxEventTimestamp: 0,
      viloyat: DEFAULT_INITIAL_REGION,
      tuman: "",
      mavsum: "",
      fermer_nom: "",
      waterSource: "",
      canalName: "",

      activeSlice: null,
      showTopN: 8,
      currentPage: 0,
      isDarkTheme: getInitialTheme(),

      activeMapView: undefined,
      featureLayer: undefined,
      featureLayerFields: [],
      selectedCrop: null,

      // Event tracking
      lastWaterSourceEventTimestamp: 0,
      lastCanalEventTimestamp: 0,
      isHandlingExternalEvent: false,

      // Map connection status
      mapConnectionAttempts: 0,
      mapLoadingStatus: "idle",
      connectionStatus: "idle",

      // Container sizing
      containerWidth: 0,
      containerHeight: 0,
    };

    this.handleMinMaxSelection = this.handleMinMaxSelection.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.fetchCropData = this.fetchCropData.bind(this);
    this.handlecanalselection = this.handlecanalselection.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleWaterSourceChange = this.handleWaterSourceChange.bind(this);
    this.readFiltersFromUrl = this.readFiltersFromUrl.bind(this);
    this.handleSliceClick = this.handleSliceClick.bind(this);
    this.applyCropFilter = this.applyCropFilter.bind(this);
    this.notifyCropSelection = this.notifyCropSelection.bind(this);
    this.notifyFilterStateChange = this.notifyFilterStateChange.bind(this);
    this.notifyMinMaxWidget = this.notifyMinMaxWidget.bind(this);
    this.getFeatureLayerFields = this.getFeatureLayerFields.bind(this);
    this.checkFieldsExistence = this.checkFieldsExistence.bind(this);
    this.retryMapConnection = this.retryMapConnection.bind(this);
    this.updateUrlWithCrop = this.updateUrlWithCrop.bind(this);
    this.handleThemeToggle = this.handleThemeToggle.bind(this);
    this.updateFiltersFromProps = this.updateFiltersFromProps.bind(this);
    this.logMapDetails = this.logMapDetails.bind(this);
    this.waitForMapToLoad = this.waitForMapToLoad.bind(this);
    this.connectToMap = this.connectToMap.bind(this);
    this.initializeAfterConnection = this.initializeAfterConnection.bind(this);
    this.handleMasterStateUpdate = this.handleMasterStateUpdate.bind(this);
    this.registerWithMaster = this.registerWithMaster.bind(this);
    this.handleCropSelection = this.handleCropSelection.bind(this);
    this.updateContainerSize = this.updateContainerSize.bind(this);
    this.getSizeClass = this.getSizeClass.bind(this);
    this.getLayoutClass = this.getLayoutClass.bind(this);
    this.getResponsiveFontSizes = this.getResponsiveFontSizes.bind(this);
    this.checkCurrentTheme = this.checkCurrentTheme.bind(this);
    this.setupThemeObserver = this.setupThemeObserver.bind(this);
  }

  private clearExternalRefreshTimer = (): void => {
    if (this.externalRefreshTimer !== null) {
      window.clearTimeout(this.externalRefreshTimer);
      this.externalRefreshTimer = null;
    }
  };

  private scheduleExternalFetch = (): void => {
    this.clearExternalRefreshTimer();
    this.externalRefreshTimer = window.setTimeout(() => {
      if (!this._isMounted) return;
      this.fetchCropData();
    }, 120);
  };

  // Update container size with debounce
  updateContainerSize = (): void => {
    if (this.containerRef.current) {
      const rect = this.containerRef.current.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      // Only update if size actually changed
      if (
        width !== this.state.containerWidth ||
        height !== this.state.containerHeight
      ) {
        this.setState({
          containerWidth: width,
          containerHeight: height,
        });
      }
    }
  };

  // Get size class based on container dimensions
  getSizeClass = (): string => {
    const { containerWidth, containerHeight } = this.state;

    // Determine size based on both width and height
    if (containerWidth < 200 || containerHeight < 100) {
      return "size-xs";
    } else if (containerWidth < 350 || containerHeight < 150) {
      return "size-sm";
    } else if (containerWidth < 500 || containerHeight < 250) {
      return "size-md";
    } else if (containerWidth < 800 || containerHeight < 400) {
      return "size-lg";
    } else {
      return "size-xl";
    }
  };

  // Get layout class based on aspect ratio
  getLayoutClass = (): string => {
    const { containerWidth, containerHeight } = this.state;
    const aspectRatio = containerWidth / Math.max(containerHeight, 1);

    // If widget is narrow (tall and thin), use vertical layout
    if (aspectRatio < 0.8) {
      return "layout-vertical";
    }
    return "";
  };

  // Calculate responsive font sizes based on container size
  getResponsiveFontSizes = () => {
    const { containerWidth, containerHeight } = this.state;
    const { crops } = this.state.cropData;
    const cardCount = crops.length || 1;

    // Base scale factor from container size - increased base
    const minDimension = Math.min(containerWidth, containerHeight);
    const scale = Math.max(0.6, Math.min(2.5, minDimension / 150));

    // Calculate available card width/height with tighter outer spacing
    const containerBase = Math.min(containerWidth, containerHeight || 0);
    const containerPadding = Math.max(2, Math.min(6, containerBase * 0.03));
    const gapSize = Math.max(
      3,
      Math.min(7, Math.min(containerWidth * 0.006, containerBase * 0.08)),
    );
    const availableWidth = Math.max(100, containerWidth - containerPadding * 2);
    const gapTotal = gapSize * (cardCount - 1);
    const cardWidth = (availableWidth - gapTotal) / cardCount;

    // Scale fonts based on card width and container height - increased multipliers
    const widthRatio = cardWidth / 80;
    const heightRatio = containerHeight / 60;
    const fontScale = Math.min(widthRatio, heightRatio, scale);

    return {
      iconSize: Math.max(12, Math.min(28, Math.round(16 * fontScale))),
      nameSize: Math.max(10, Math.min(18, Math.round(13 * fontScale))),
      areaValueSize: Math.max(14, Math.min(26, Math.round(18 * fontScale))),
      areaUnitSize: Math.max(10, Math.min(16, Math.round(12 * fontScale))),
      waterSize: Math.max(9, Math.min(15, Math.round(11 * fontScale))),
      cardPadding: Math.max(6, Math.min(14, Math.round(10 * fontScale))),
      elementGap: Math.max(3, Math.min(8, Math.round(5 * fontScale))),
      containerGap: gapSize,
      containerPadding: containerPadding,
    };
  };

  // Add method to handle min/max selection event
  handleMinMaxSelection = (event: any): void => {
    if (!event || !event.detail) return;

    const { minMax, timestamp = 0, source } = event.detail;
    const nextMinMax = minMax || null;
    const prevMinMax = this.state.minMax || null;

    if (
      timestamp <= this.state.lastMinMaxEventTimestamp ||
      source === "CropDistributionWidget"
    ) {
      return;
    }

    if (nextMinMax === prevMinMax) {
      return;
    }

    // During min -> max switches, some emitters briefly send a clear event.
    // Defer clear so we do not flash an unfiltered state in between.
    if (this.pendingMinMaxClearTimer !== null) {
      window.clearTimeout(this.pendingMinMaxClearTimer);
      this.pendingMinMaxClearTimer = null;
    }

    const applyMinMax = (value: string | null): void => {
      if (this.state.connectionStatus !== "connected") {
        this.setState({
          minMax: value,
          lastMinMaxEventTimestamp: timestamp,
        });
        return;
      }

      this.setState(
        {
          minMax: value,
          lastMinMaxEventTimestamp: timestamp,
          isHandlingExternalEvent: true,
          error: null,
        },
        () => {
          this.scheduleExternalFetch();
          this.notifyFilterStateChange();

          setTimeout(() => {
            if (this._isMounted) {
              this.setState({ isHandlingExternalEvent: false });
            }
          }, 500);
        },
      );
    };

    if (nextMinMax === null) {
      this.pendingMinMaxClearTimer = window.setTimeout(() => {
        this.pendingMinMaxClearTimer = null;
        if (!this._isMounted) return;
        applyMinMax(null);
      }, 180);
      return;
    }

    applyMinMax(nextMinMax);
  };

  // Wait for map to load fully
  waitForMapToLoad = (jimuMapView: JimuMapView): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (jimuMapView.view.ready) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Map load timeout"));
      }, 30000);

      const watchHandle = jimuMapView.view.watch("ready", (isReady) => {
        if (isReady) {
          clearTimeout(timeout);
          watchHandle.remove();
          resolve();
        }
      });
    });
  };

  // Connect to map after it's loaded
  connectToMap = async (jimuMapView: JimuMapView): Promise<void> => {
    try {
      const layers = jimuMapView.view.map.layers.toArray();
      const featureLayer = layers.find(
        (l) => l.type === "feature",
      ) as FeatureLayer;

      if (!featureLayer) {
        throw new Error("No feature layers found in the map.");
      }

      await featureLayer.load();
      const fields = featureLayer.fields.map((f) => f.name);

      return new Promise((resolve) => {
        this.setState(
          {
            activeMapView: jimuMapView,
            featureLayer,
            featureLayerFields: fields,
            connectionStatus: "connected",
            error: null,
          },
          () => {
            resolve();
          },
        );
      });
    } catch (err) {
      throw err;
    }
  };

  // Initialize after successful connection
  initializeAfterConnection = (): void => {
    if (
      !this.state.activeMapView ||
      this.state.connectionStatus !== "connected"
    ) {
      return;
    }

    this.logMapDetails();
    this.readFiltersFromUrl();
    this.fetchCropData();

    if (this.state.selectedCrop) {
      this.applyCropFilter();
    }
  };

  // Log detailed map information
  logMapDetails = () => {
    const { activeMapView, featureLayer } = this.state;
    if (!activeMapView) return;

    console.log("[MAP INFO] Map details:", {
      basemap: activeMapView.view.map.basemap?.title || "Unknown",
      layerCount: activeMapView.view.map.layers?.length || 0,
      portalItemId: (activeMapView.view.map as any).portalItem?.id || "Unknown",
    });
  };

  // Function to manually retry connection
  retryMapConnection() {
    this.setState({
      connectionStatus: "idle",
      mapLoadingStatus: "idle",
      mapConnectionAttempts: 0,
      error: null,
    });
  }

  // Handle active map view changes
  onActiveViewChange = async (jimuMapView: JimuMapView) => {
    if (!jimuMapView) {
      if (this.state.mapConnectionAttempts === 0) {
        this.setState({
          mapLoadingStatus: "failed",
          mapConnectionAttempts: 1,
        });
      }
      return;
    }

    this.setState({
      mapLoadingStatus: "loading",
      error: null,
    });

    try {
      await this.waitForMapToLoad(jimuMapView);

      this.setState({
        mapLoadingStatus: "loaded",
        connectionStatus: "connecting",
      });

      await this.connectToMap(jimuMapView);
      this.initializeAfterConnection();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.setState({
        error: `Error initializing map: ${errMsg}`,
        mapLoadingStatus: errMsg.includes("timeout")
          ? "failed"
          : this.state.mapLoadingStatus,
        connectionStatus: "failed",
      });
    }
  };

  // Get available fields from the feature layer
  getFeatureLayerFields() {
    const { featureLayer } = this.state;
    if (!featureLayer) return;

    try {
      const fields = featureLayer.fields?.map((field) => field.name) || [];

      this.setState(
        {
          featureLayerFields: fields,
        },
        () => {
          this.checkFieldsExistence();
        },
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.setState({
        error: `Error retrieving layer fields: ${errMsg}`,
      });
    }
  }

  // Check if required fields exist in the feature layer
  checkFieldsExistence() {
    const { featureLayerFields, featureLayer } = this.state;

    const cropFieldExists = featureLayerFields.some(
      (field) => field.toLowerCase() === "ekin_turi",
    );

    if (!cropFieldExists) {
      this.setState({
        error:
          "Warning: 'ekin_turi' field is missing. Crop filtering may not work correctly.",
      });
    } else {
      // Log unique crop names from the map for debugging
      const query = featureLayer.createQuery();
      query.where = "1=1";
      query.returnDistinctValues = true;
      query.outFields = ["ekin_turi"];

      featureLayer
        .queryFeatures(query)
        .then((result) => {
          const uniqueCrops = result.features
            .map((f) => f.attributes.ekin_turi)
            .filter(Boolean)
            .sort();
          console.log(
            "[EvapoCrop] Unique crop names in map layer:",
            uniqueCrops,
          );
        })
        .catch((err) => {
          console.warn("[EvapoCrop] Could not query crop names:", err);
        });
    }
  }

  // Sanitize input for SQL expressions
  private escapeArcGIS(value: string): string {
    return value ? value.replace(/'/g, "''") : "";
  }

  // Format numbers for display
  private formatNumber(value: number): string {
    const lang = this.state?.lang || "ru";
    const thousandUnit = t(lang as any, "evapoCrop.unit.thousand");
    const millionUnit = t(lang as any, "evapoCrop.unit.million");

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} ${millionUnit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} ${thousandUnit}`;
    } else {
      return value.toFixed(1);
    }
  }

  private formatAreaParts(value: number): {
    mainValue: string;
    scaleUnit: string;
  } {
    const lang = this.state?.lang || "ru";
    const thousandUnit = t(lang as any, "evapoCrop.unit.thousand");
    const millionUnit = t(lang as any, "evapoCrop.unit.million");

    if (value >= 1000000) {
      return {
        mainValue: (value / 1000000).toFixed(1),
        scaleUnit: millionUnit,
      };
    }

    if (value >= 1000) {
      return {
        mainValue: (value / 1000).toFixed(1),
        scaleUnit: thousandUnit,
      };
    }

    return {
      mainValue: value.toFixed(1),
      scaleUnit: "",
    };
  }

  // Apply crop filter to the map
  applyCropFilter = () => {
    const { featureLayer, activeMapView, selectedCrop, connectionStatus } =
      this.state;

    if (connectionStatus !== "connected" || !featureLayer) {
      return;
    }

    if (selectedCrop) {
      if (activeMapView && !this.state.isHandlingExternalEvent) {
        this.zoomToSelectedCrop(selectedCrop);
      }
    }
  };

  // Notify crop selection
  notifyCropSelection() {
    if (this.state.connectionStatus !== "connected") {
      return;
    }

    const { selectedCrop, minMax, viloyat, tuman, mavsum, fermer_nom } =
      this.state;

    const event = new CustomEvent("cropSelected", {
      detail: {
        cropType: selectedCrop,
        minMax: minMax,
        viloyat: viloyat,
        tuman: tuman,
        mavsum: mavsum,
        fermer_nom: fermer_nom,
        timestamp: new Date().getTime(),
        source: "CropDistributionWidget",
        widgetId: this.props.id,
        priority: true,
      },
      bubbles: true,
    });

    document.dispatchEvent(event);
    this.updateUrlWithCrop();
  }

  notifyFilterStateChange() {
    const {
      viloyat,
      tuman,
      mavsum,
      fermer_nom,
      waterSource,
      canalName,
      selectedCrop,
      minMax,
      yil,
    } = this.state;

    const event = new CustomEvent("cropWidgetFilterChanged", {
      detail: {
        viloyat,
        tuman,
        mavsum,
        fermer_nom,
        fermer_nomNom: fermer_nom,
        waterSource,
        canalName,
        selectedCrop,
        minMax,
        // ✅
        yil,
        timestamp: Date.now(),
        source: "CropDistributionWidget",
      },
      bubbles: true,
    });

    document.dispatchEvent(event);
  }

  notifyMinMaxWidget() {
    const {
      viloyat,
      tuman,
      mavsum,
      fermer_nom,
      waterSource,
      canalName,
      selectedCrop,
      minMax,
      yil,
    } = this.state;

    const event = new CustomEvent("minMaxShouldUpdateFilters", {
      detail: {
        viloyat,
        tuman,
        mavsum,
        fermer_nom,
        manba_nomi: waterSource,
        kanal_nomi: canalName,
        ekin_turi: selectedCrop,
        min_max: minMax,
        // ✅
        yil,
        timestamp: Date.now(),
        source: "CropDistributionWidget",
        action: "applyFilters",
      },
      bubbles: true,
    });

    document.dispatchEvent(event);
  }

  updateUrlWithCrop() {
    const urlParams = new URLSearchParams(window.location.search);
    // Crop widget selection must be ephemeral: never persist it in URL.
    urlParams.delete("crop_type");
    urlParams.delete("min_max");

    const qs = urlParams.toString();
    const newUrl = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }

  // Component lifecycle methods
  componentDidMount() {
    this._isMounted = true;

    // Set up resize observer for container size tracking
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0 && this._isMounted) {
          this.updateContainerSize();
        }
      });

      if (this.containerRef.current) {
        this.resizeObserver.observe(this.containerRef.current);
      }
    }

    // Update initial container size
    this.updateContainerSize();

    this.setState({
      mapLoadingStatus: "idle",
      connectionStatus: "idle",
    });

    // Set up event listeners
    document.addEventListener(
      "themeToggled",
      this.handleThemeToggle as EventListener,
    );
    document.addEventListener(
      "appThemeChanged",
      this.handleThemeToggle as EventListener,
    );
    document.addEventListener(
      "themeChanged",
      this.handleThemeToggle as EventListener,
    );

    // Check initial theme from DOM
    this.checkCurrentTheme();
    this.setupThemeObserver();

    if (this.props.externalFilters) {
      this.setState({
        viloyat: this.props.externalFilters.viloyat || "",
        tuman: this.props.externalFilters.tuman || "",
        mavsum: this.props.externalFilters.mavsum || "",
        fermer_nom: this.props.externalFilters.fermer_nom || "",
        waterSource: this.props.externalFilters.manba_nomi || "",
        canalName: this.props.externalFilters.kanal_nomi || "",
      });
    }
    document.addEventListener("yilChanged", this.handleYilEvent);
    // ✅ alias some flows use
    document.addEventListener(
      "constructionYearChanged",
      this.handleYilAliasEvent,
    );
    document.addEventListener("minMaxSelected", this.handleMinMaxSelection);

    // Set up event handlers
    this.canalselectionHandler = this.handlecanalselection;
    document.addEventListener("canalselected", this.canalselectionHandler);

    this.filterChangeHandler = this.handleFilterChange;
    document.addEventListener(
      "waterSupplyFilterChanged",
      this.filterChangeHandler,
    );

    this.waterSourceChangeHandler = this.handleWaterSourceChange;
    document.addEventListener(
      "waterSourceSelected",
      this.waterSourceChangeHandler,
    );

    window.addEventListener("popstate", this.readFiltersFromUrl);
    document.addEventListener("resetAllWidgets", this._onReset);
    document.addEventListener(
      "masterStateUpdate",
      this.handleMasterStateUpdate,
    );
    this.registerWithMaster();

    document.addEventListener("clearCropSelection", this.handleClearSelection);
    document.addEventListener(
      "regionDependentFiltersReset",
      this.handleExternalDependentReset,
    );

    // Listen for language changes
    document.addEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );
    document.addEventListener(
      "appLanguageChanged",
      this.handleLanguageChange as EventListener,
    );

    void this.ensureCropTranslationCache(this.state.lang);
  }

  handleLanguageChange = (ev: Event) => {
    const ce = ev as CustomEvent;
    const d: any = ce?.detail || {};
    const incoming = normalizeLang(d.lang ?? d.language ?? d.code ?? "");
    if (incoming && incoming !== this.state.lang) {
      try {
        localStorage.setItem("app_lang", incoming);
        localStorage.setItem("evapo_app_lang", incoming);
      } catch {
        // ignore storage errors
      }
      this.setState({ lang: incoming }, () => {
        void this.ensureCropTranslationCache(incoming);
        this.forceUpdate();
      });
    }
  };

  private normalizeLookupKey(value: any): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  // Build a small set of apostrophe/backtick quote variants used across layer attributes.
  private buildQuoteVariants(value: any): string[] {
    const raw = String(value ?? "").trim();
    if (!raw) return [];

    const quoteChars = ["'", "`", "‘", "’", "ʻ", "ʼ", "ʹ", "ʽ", "´"];
    const baseForms = new Set<string>([raw]);
    for (const ch of quoteChars) {
      if (raw.includes(ch)) {
        baseForms.add(raw.replace(new RegExp(ch, "g"), "'"));
        baseForms.add(raw.replace(new RegExp(ch, "g"), "`"));
      }
    }

    const expanded = new Set<string>();
    for (const form of baseForms) {
      expanded.add(form);
      for (const ch of quoteChars) {
        expanded.add(form.replace(/["'`‘’ʻʼʹʽ´]/g, ch));
      }
    }

    return Array.from(expanded)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private getDirectoryLang(lang: LangCode): "uz" | "kir" | "ru" {
    if (lang === "ru") return "ru";
    if (lang === "uz_cyrl") return "kir";
    return "uz";
  }

  private async fetchDirectoryList(
    key: "Canal" | "Canals" | "Crop type",
    lang: "uz" | "kir" | "ru",
  ): Promise<string[]> {
    const typeCandidates = ["Evapo", "Evapo-RegionV20", "EvapoWaterCanalV20"];
    // Try sgm.uzspace.uz first (CORS-allowed from localhost), then apiwater as fallback
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
            .filter((row: any) => row && typeof row === "object")
            .map((row: any) =>
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

  private async ensureCropTranslationCache(lang: LangCode): Promise<void> {
    if (lang === "uz_lat") return;

    const reqId = ++this._cropTranslationReqId;
    try {
      const [uzCrops, targetCrops] = await Promise.all([
        this.fetchDirectoryList("Crop type", "uz"),
        this.fetchDirectoryList("Crop type", this.getDirectoryLang(lang)),
      ]);

      if (reqId !== this._cropTranslationReqId) return;
      if (!uzCrops.length || !targetCrops.length) return;

      registerCropTranslations(lang, uzCrops, targetCrops);
      if (this._isMounted) this.forceUpdate();
    } catch {
      // Static translations remain as fallback.
    }
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

  private async hasCanalNameInFeatureLayer(
    canalName: string,
  ): Promise<boolean> {
    const value = String(canalName ?? "").trim();
    const { featureLayer, featureLayerFields } = this.state;
    if (!value || !featureLayer) return false;

    const hasField = (name: string): boolean =>
      featureLayerFields?.some(
        (f) => String(f).toLowerCase() === name.toLowerCase(),
      );
    if (!hasField("kanal_nomi")) return false;

    try {
      const q = featureLayer.createQuery();
      q.where = `kanal_nomi='${this.escapeArcGIS(value)}'`;
      q.returnGeometry = false;
      const count = await featureLayer.queryFeatureCount(q);
      return Number(count) > 0;
    } catch {
      return false;
    }
  }

  private async resolveRawCanalName(input: any): Promise<string> {
    const value = String(input ?? "").trim();
    if (!value) return "";

    const key = this.normalizeLookupKey(value);

    if (
      this.state.connectionStatus === "connected" &&
      (await this.hasCanalNameInFeatureLayer(value))
    )
      return value;

    const lang = this.state.lang;
    if (lang === "uz_lat") return value;

    await this.ensureCanalReverseTranslationCache(lang);
    const reverse = this._canalReverseTranslationCache[lang] || {};
    const mapped = reverse[key];
    if (mapped) return mapped;

    const rawMatch = Object.values(reverse).find(
      (raw) => this.normalizeLookupKey(raw) === key,
    );
    if (rawMatch) return rawMatch;

    return "";
  }

  // Validate if a crop exists for the given canal
  private async validateCropForCanal(
    selectedCrop: string | null,
    canalName: string,
  ): Promise<string | null> {
    if (!selectedCrop || !canalName) return selectedCrop;

    // Abort any previous canal validation that is still in-flight
    if (this.canalValidationAbortController) {
      this.canalValidationAbortController.abort();
    }
    this.canalValidationAbortController = new AbortController();
    const signal = this.canalValidationAbortController.signal;

    try {
      const { viloyat, tuman, mavsum, fermer_nom, waterSource, minMax, yil } =
        this.state;

      const queryParams = new URLSearchParams();
      if (viloyat) queryParams.append("viloyat", viloyat);
      if (tuman) queryParams.append("tuman", tuman);
      if (mavsum) queryParams.append("mavsum", mavsum);
      if (fermer_nom) queryParams.append("fermer_nom", fermer_nom);
      if (waterSource) queryParams.append("manba_nomi", waterSource);
      if (canalName) queryParams.append("kanal_nomi", canalName);
      if (minMax && String(minMax).toLowerCase() !== "both") {
        queryParams.append("min_max", minMax);
      }
      if (yil && /^\d{4}$/.test(yil)) queryParams.append("yil", yil);

      const data = await this.fetchCropDistributionData(
        queryParams.toString(),
        {
          viloyat,
          tuman,
          mavsum,
          fermer_nom,
          waterSource,
          canalName,
          minMax,
          yil,
        },
        signal,
      );
      const crops = (data.crop_distribution || []).filter(
        (c) => c.area_ha > 0 && !!c.ekin_turi,
      );

      // Check if selectedCrop exists in available crops for this canal
      const cropExists = crops.some((c) => c.ekin_turi === selectedCrop);
      return cropExists ? selectedCrop : null;
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.log("[EvapoCropV32] Canal validation aborted (state changed)");
        return selectedCrop; // Keep crop when aborted
      }
      console.warn("[EvapoCropV32] Error validating crop for canal:", error);
      return selectedCrop; // On error, keep crop (don't clear)
    }
  }

  // Handle canal selection
  handlecanalselection = async (event: any): Promise<void> => {
    if (event && event.detail) {
      const { timestamp = 0, source } = event.detail;
      const incomingCanal = String(
        event.detail?.kanal_nomi ?? event.detail?.canalName ?? "",
      ).trim();
      console.log(
        "[EvapoCropV32] handlecanalselection: incomingCanal =",
        incomingCanal,
      );

      const canalName = await this.resolveRawCanalName(incomingCanal);
      const nextCanalName = String(canalName || "").trim();
      const prevCanalName = String(this.state.canalName || "").trim();
      const currentCrop = this.state.selectedCrop;

      console.log("[EvapoCropV32] Canal resolution:", {
        incomingCanal,
        resolved: canalName,
        nextCanalName,
        prevCanalName,
      });

      if (
        timestamp <= this.state.lastCanalEventTimestamp ||
        source === "CropDistributionWidget"
      ) {
        console.log(
          "[EvapoCropV32] Canal event ignored: stale timestamp or internal source",
        );
        return;
      }

      // Ignore unresolved non-empty canal values to avoid dropping active filters.
      if (incomingCanal && !canalName) {
        console.warn(
          "[EvapoCropV32] Canal could not be resolved, keeping current state:",
          { incomingCanal, currentCanal: prevCanalName },
        );
        return;
      }

      if (nextCanalName === prevCanalName) {
        console.log("[EvapoCropV32] Canal unchanged, skipping update");
        return;
      }

      if (this.state.connectionStatus !== "connected") {
        console.log(
          "[EvapoCropV32] Map not connected yet, updating state only",
        );
        this.setState({
          canalName: canalName || "",
          lastCanalEventTimestamp: timestamp,
        });
        return;
      }

      // ✅ NEW: Validate that selected crop still exists for new canal
      const validatedCrop =
        currentCrop && nextCanalName
          ? await this.validateCropForCanal(currentCrop, nextCanalName)
          : currentCrop;

      this.setState(
        {
          canalName: nextCanalName,
          lastCanalEventTimestamp: timestamp,
          isHandlingExternalEvent: true,
          selectedCrop: validatedCrop,
          error: null,
        },
        () => {
          this.scheduleExternalFetch();

          if (this.state.selectedCrop !== currentCrop) {
            console.log(
              `[EvapoCropV32] Crop cleared due to canal change: ${currentCrop} → ${validatedCrop}`,
            );
            this.notifyCropSelection();
          }
          this.notifyFilterStateChange();
          this.notifyMinMaxWidget();

          setTimeout(() => {
            if (this._isMounted) {
              this.setState({ isHandlingExternalEvent: false });
            }
          }, 500);
        },
      );
    }
  };

  // Component update handling
  componentDidUpdate(prevProps: any, prevState: any) {
    // Handle external filter changes
    if (this.props.externalFilters !== prevProps.externalFilters) {
      if (this.props.externalFilters) {
        this.updateFiltersFromProps(this.props.externalFilters);
      }
    }

    // Check if we need to initialize after a successful connection update
    if (
      prevState.connectionStatus !== "connected" &&
      this.state.connectionStatus === "connected"
    ) {
      setTimeout(() => {
        if (this._isMounted && this.state.activeMapView) {
          this.initializeAfterConnection();
        }
      }, 100);
    }

    // Handle map connection retry logic
    const { mapLoadingStatus, mapConnectionAttempts } = this.state;
    const { useMapWidgetIds } = this.props;

    if (
      (mapLoadingStatus === "failed" || mapLoadingStatus === "idle") &&
      useMapWidgetIds &&
      useMapWidgetIds.length > 0 &&
      !this.state.activeMapView &&
      mapConnectionAttempts !== prevState.mapConnectionAttempts
    ) {
      if (mapConnectionAttempts < this.MAX_CONNECTION_ATTEMPTS) {
        setTimeout(() => {
          if (this._isMounted) {
            this.setState((prevState) => ({
              mapConnectionAttempts: prevState.mapConnectionAttempts + 1,
              mapLoadingStatus: "idle",
            }));
          }
        }, 2000);
      } else {
        this.setState({
          mapLoadingStatus: "failed",
          connectionStatus: "failed",
          error: t(this.state.lang, "status.error"),
        });
      }
    }
  }
  handleMasterStateUpdate = (event: any) => {
    if (!event?.detail || event.detail.source !== "MasterController") return;

    const m = event.detail;
    const currentCrop = this.state.selectedCrop;

    this.setState(
      {
        viloyat: m.viloyat || this.state.viloyat || DEFAULT_INITIAL_REGION,
        tuman: m.tuman || "",
        mavsum: m.mavsum || "",
        fermer_nom: m.fermer_nom || "",
        waterSource: m.manba_nomi || "",
        canalName: m.kanal_nomi || "",
        minMax: m.min_max || null,
        // ✅ year
        yil: this.normalizeYearValue(m.yil) || DEFAULT_INITIAL_YEAR,
        selectedCrop: currentCrop,
        activeSlice: null,
      },
      () => {
        this.fetchCropData();
        this.applyCropFilter();
      },
    );
  };

  handleFilterChange = (event: any): void => {
    const { detail: filters } = event;
    if (!filters || filters.source === "CropDistributionWidget") return;

    const currentCrop = this.state.selectedCrop;

    const incomingFermer = filters.fermer_nomNom ?? filters.fermer_nom ?? "";
    const incomingWaterSource =
      filters.manba_nomi ?? filters.sourceSelected ?? this.state.waterSource;
    const incomingCanal =
      filters.kanal_nomi ?? filters.canalName ?? this.state.canalName;
    const incomingMinMax =
      filters.min_max ?? filters.minMax ?? this.state.minMax ?? null;

    // When key filters change, clear selected crop to avoid stale selection
    // that may not exist for the new filter combination.
    const viloyatChanged = (filters.viloyat || "") !== this.state.viloyat;
    const tumanChanged = (filters.tuman || "") !== this.state.tuman;
    const fermerChanged = incomingFermer !== this.state.fermer_nom;
    const waterSourceChanged =
      String(incomingWaterSource || "") !==
      String(this.state.waterSource || "");
    const canalChanged =
      String(incomingCanal || "") !== String(this.state.canalName || "");
    const minMaxChanged =
      String(incomingMinMax || "") !== String(this.state.minMax || "");

    const nextCrop =
      viloyatChanged ||
      tumanChanged ||
      fermerChanged ||
      waterSourceChanged ||
      canalChanged ||
      minMaxChanged
        ? null
        : currentCrop;

    if (this.state.connectionStatus !== "connected") {
      this.setState({
        viloyat:
          filters.viloyat || this.state.viloyat || DEFAULT_INITIAL_REGION,
        tuman: filters.tuman || "",
        mavsum: filters.mavsum || "",
        fermer_nom: incomingFermer,
        waterSource: incomingWaterSource || "",
        canalName: incomingCanal || "",
        minMax: incomingMinMax,
        yil: this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR,
        selectedCrop: nextCrop,
        activeSlice:
          viloyatChanged ||
          tumanChanged ||
          fermerChanged ||
          waterSourceChanged ||
          canalChanged ||
          minMaxChanged
            ? null
            : this.state.activeSlice,
      });
      return;
    }

    const otherFiltersChanged =
      viloyatChanged ||
      tumanChanged ||
      filters.mavsum !== this.state.mavsum ||
      (this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR) !==
        this.state.yil ||
      waterSourceChanged ||
      canalChanged ||
      minMaxChanged;

    // Fermer-only changes still must refresh API data for correct crop totals.
    const shouldRefetch = fermerChanged || otherFiltersChanged;
    if (!shouldRefetch) return;

    this.setState(
      {
        viloyat:
          filters.viloyat || this.state.viloyat || DEFAULT_INITIAL_REGION,
        tuman: filters.tuman || "",
        mavsum: filters.mavsum || "",
        fermer_nom: incomingFermer,
        waterSource: incomingWaterSource || "",
        canalName: incomingCanal || "",
        minMax: incomingMinMax,
        yil: this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR,
        selectedCrop: nextCrop,
        activeSlice:
          viloyatChanged ||
          tumanChanged ||
          fermerChanged ||
          waterSourceChanged ||
          canalChanged ||
          minMaxChanged
            ? null
            : this.state.activeSlice,
        isHandlingExternalEvent: true,
        error: null,
      },
      () => {
        this.fetchCropData();

        if (this.state.selectedCrop !== currentCrop) {
          this.notifyCropSelection();
        }
        this.notifyFilterStateChange();
        this.notifyMinMaxWidget();

        setTimeout(() => {
          if (this._isMounted)
            this.setState({ isHandlingExternalEvent: false });
        }, 500);
      },
    );
  };

  registerWithMaster = () => {
    const event = new CustomEvent("widgetRegistration", {
      detail: {
        widgetId: this.props.id,
        widgetName: "CropDistributionWidget",
        capabilities: ["selection"],
        timestamp: Date.now(),
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  unregisterFromMaster = () => {
    const event = new CustomEvent("widgetUnregistration", {
      detail: { widgetId: this.props.id, timestamp: Date.now() },
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  // Component cleanup
  componentWillUnmount() {
    this._isMounted = false;
    this.clearExternalRefreshTimer();
    if (this.pendingMinMaxClearTimer !== null) {
      window.clearTimeout(this.pendingMinMaxClearTimer);
      this.pendingMinMaxClearTimer = null;
    }

    // All event listener cleanup - MUST match componentDidMount registrations
    document.removeEventListener(
      "themeToggled",
      this.handleThemeToggle as EventListener,
    );
    document.removeEventListener(
      "appThemeChanged",
      this.handleThemeToggle as EventListener,
    );
    document.removeEventListener(
      "themeChanged",
      this.handleThemeToggle as EventListener,
    );
    document.removeEventListener("yilChanged", this.handleYilEvent);
    document.removeEventListener(
      "constructionYearChanged",
      this.handleYilAliasEvent,
    );
    document.removeEventListener("minMaxSelected", this.handleMinMaxSelection);
    document.removeEventListener(
      "waterSupplyFilterChanged",
      this.filterChangeHandler,
    );
    document.removeEventListener(
      "waterSourceSelected",
      this.waterSourceChangeHandler,
    );
    document.removeEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );
    document.removeEventListener(
      "appLanguageChanged",
      this.handleLanguageChange as EventListener,
    );
    document.removeEventListener("canalselected", this.canalselectionHandler);
    window.removeEventListener("popstate", this.readFiltersFromUrl);
    document.removeEventListener("resetAllWidgets", this._onReset);
    document.removeEventListener(
      "masterStateUpdate",
      this.handleMasterStateUpdate,
    );
    document.removeEventListener(
      "clearCropSelection",
      this.handleClearSelection,
    );
    document.removeEventListener(
      "regionDependentFiltersReset",
      this.handleExternalDependentReset,
    );

    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clean up theme observer
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }

    // Abort any pending fetch requests
    if (this.fetchAbortController) {
      this.fetchAbortController.abort();
      this.fetchAbortController = null;
    }
    if (this.canalValidationAbortController) {
      this.canalValidationAbortController.abort();
      this.canalValidationAbortController = null;
    }
    document.removeEventListener("yilChanged", this.handleYilEvent);
    document.removeEventListener(
      "constructionYearChanged",
      this.handleYilAliasEvent,
    );
    // Clean up all event listeners
    document.removeEventListener(
      "themeToggled",
      this.handleThemeToggle as EventListener,
    );
    document.removeEventListener(
      "appThemeChanged",
      this.handleThemeToggle as EventListener,
    );
    document.removeEventListener(
      "themeChanged",
      this.handleThemeToggle as EventListener,
    );
    document.removeEventListener(
      "waterSupplyFilterChanged",
      this.filterChangeHandler,
    );
    document.removeEventListener(
      "waterSourceSelected",
      this.waterSourceChangeHandler,
    );
    document.removeEventListener("canalselected", this.canalselectionHandler);
    window.removeEventListener("popstate", this.readFiltersFromUrl);
    document.removeEventListener("resetAllWidgets", this._onReset);
    document.removeEventListener("minMaxSelected", this.handleMinMaxSelection);
    document.removeEventListener(
      "masterStateUpdate",
      this.handleMasterStateUpdate,
    );
    document.removeEventListener(
      "clearCropSelection",
      this.handleClearSelection,
    );
    document.removeEventListener(
      "regionDependentFiltersReset",
      this.handleExternalDependentReset,
    );
    document.removeEventListener(
      "appLanguageChanged",
      this.handleLanguageChange as EventListener,
    );
    this.unregisterFromMaster();

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  // Handler for theme change events
  handleThemeToggle = (event: CustomEvent): void => {
    if (event && event.detail) {
      // Support multiple event formats
      const isDark =
        event.detail.isDarkTheme ??
        event.detail.isDark ??
        event.detail.theme === "dark";
      if (typeof isDark === "boolean") {
        try {
          const theme = isDark ? "dark" : "light";
          localStorage.setItem("app_theme", theme);
          localStorage.setItem("evapo_app_theme", theme);
        } catch {
          // ignore storage errors
        }
        this.setState({ isDarkTheme: isDark });
      }
    }
  };

  // Check current theme from DOM
  checkCurrentTheme = (): void => {
    try {
      const saved =
        localStorage.getItem("app_theme") ||
        localStorage.getItem("evapo_app_theme");
      if (saved === "dark" || saved === "light") {
        const isDark = saved === "dark";
        if (this.state.isDarkTheme !== isDark) {
          this.setState({ isDarkTheme: isDark });
        }
        return;
      }

      // First run with no saved preference: default to dark.
      if (this.state.isDarkTheme !== true) {
        this.setState({ isDarkTheme: true });
      }
      return;
    } catch {
      // ignore storage errors
    }

    const html = document.documentElement;
    const body = document.body;
    const isDark = !(
      html.classList.contains("light-theme") ||
      html.classList.contains("calcite-mode-light") ||
      html.getAttribute("data-theme") === "light" ||
      body.classList.contains("light-theme") ||
      body.classList.contains("calcite-mode-light") ||
      body.getAttribute("data-theme") === "light"
    );
    if (this.state.isDarkTheme !== isDark) {
      this.setState({ isDarkTheme: isDark });
    }
  };

  // Set up MutationObserver to watch for theme changes
  setupThemeObserver = (): void => {
    if (this.themeObserver) return;

    this.themeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "class" ||
            mutation.attributeName === "data-theme")
        ) {
          this.checkCurrentTheme();
          break;
        }
      }
    });

    // Observe both html and body elements
    const config = {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    };
    this.themeObserver.observe(document.documentElement, config);
    this.themeObserver.observe(document.body, config);
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

  private handleYilEvent = (e: any) => {
    const incoming =
      this.normalizeYearValue(e?.detail?.yil ?? "") || DEFAULT_INITIAL_YEAR;
    if (!this._isMounted) return;
    if ((incoming || "") === (this.state.yil || "")) return;
    this.setState(
      { yil: incoming, selectedCrop: null, activeSlice: null },
      () => {
        this.fetchCropData();
        this.notifyCropSelection();
        // crop filter is selection-based; no persistent def expr here
      },
    );
  };

  private handleYilAliasEvent = (e: any) => {
    const incoming =
      this.normalizeYearValue(
        e?.detail?.year ?? e?.detail?.constructionYear ?? "",
      ) || DEFAULT_INITIAL_YEAR;
    if (!this._isMounted) return;
    if ((incoming || "") === (this.state.yil || "")) return;
    this.setState(
      { yil: incoming, selectedCrop: null, activeSlice: null },
      () => {
        this.fetchCropData();
        this.notifyCropSelection();
      },
    );
  };

  // Handle water source change
  handleWaterSourceChange = (event: any): void => {
    if (event && event.detail && event.detail.sourceSelected !== undefined) {
      const selectedWaterSource = event.detail.sourceSelected;
      const timestamp = event.detail.timestamp || 0;
      const source = event.detail.source;
      const currentCrop = this.state.selectedCrop;

      if (
        timestamp <= this.state.lastWaterSourceEventTimestamp ||
        source === "CropDistributionWidget"
      ) {
        return;
      }

      // Abort any in-flight canal validation — the water source just changed
      if (this.canalValidationAbortController) {
        this.canalValidationAbortController.abort();
        this.canalValidationAbortController = null;
      }

      if (this.state.connectionStatus !== "connected") {
        this.setState({
          waterSource: selectedWaterSource,
          lastWaterSourceEventTimestamp: timestamp,
        });
        return;
      }

      this.setState(
        {
          waterSource: selectedWaterSource,
          canalName: "", // clear stale canal when water source changes
          lastWaterSourceEventTimestamp: timestamp,
          isHandlingExternalEvent: true,
          selectedCrop: currentCrop,
          error: null,
        },
        () => {
          this.fetchCropData();

          if (this.state.selectedCrop !== currentCrop) {
            this.notifyCropSelection();
          }

          this.notifyFilterStateChange();
          this.notifyMinMaxWidget();

          setTimeout(() => {
            if (this._isMounted) {
              this.setState({ isHandlingExternalEvent: false });
            }
          }, 500);
        },
      );
    }
  };

  readFiltersFromUrl = async (): Promise<void> => {
    try {
      if (this.state.connectionStatus !== "connected") return;

      const p = new URLSearchParams(window.location.search);

      const viloyat =
        p.get("viloyat") || this.state.viloyat || DEFAULT_INITIAL_REGION;
      const tuman = p.get("tuman") || "";
      const mavsum = p.get("mavsum") || "";
      const fermer_nom = p.get("fermer_nom") || p.get("fermer_nomNom") || "";
      const waterSource = p.get("water_source") || "";
      const incomingCanalName = p.get("canal_name") || "";
      const canalName = incomingCanalName
        ? await this.resolveRawCanalName(incomingCanalName)
        : "";
      // ✅ YEAR
      const yil =
        this.normalizeYearValue(p.get("yil") || "") ||
        this.state.yil ||
        DEFAULT_INITIAL_YEAR;

      if (
        viloyat !== this.state.viloyat ||
        tuman !== this.state.tuman ||
        mavsum !== this.state.mavsum ||
        fermer_nom !== this.state.fermer_nom ||
        waterSource !== this.state.waterSource ||
        canalName !== this.state.canalName ||
        yil !== this.state.yil
      ) {
        this.setState(
          {
            viloyat,
            tuman,
            mavsum,
            fermer_nom,
            waterSource,
            canalName,
            yil, // ✅
            isHandlingExternalEvent: true,
            error: null,
          },
          () => {
            this.fetchCropData();
            this.applyCropFilter();
            setTimeout(() => {
              if (this._isMounted)
                this.setState({ isHandlingExternalEvent: false });
            }, 500);
          },
        );
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.setState({ error: `Error reading URL parameters: ${errMsg}` });
    }
  };

  updateFiltersFromProps = async (filters: any): Promise<void> => {
    try {
      const currentCrop = this.state.selectedCrop;
      const incomingCanalName = filters.kanal_nomi || "";
      const resolvedCanalName = incomingCanalName
        ? await this.resolveRawCanalName(incomingCanalName)
        : "";

      if (this.state.connectionStatus !== "connected") {
        this.setState({
          viloyat:
            filters.viloyat || this.state.viloyat || DEFAULT_INITIAL_REGION,
          tuman: filters.tuman || "",
          mavsum: filters.mavsum || "",
          fermer_nom: filters.fermer_nom || filters.fermer_nomNom || "",
          waterSource: filters.manba_nomi || "",
          canalName: resolvedCanalName,
          // ✅
          yil: this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR,
          selectedCrop: currentCrop,
          error: null,
        });
        return;
      }

      const newState = {
        viloyat:
          filters.viloyat || this.state.viloyat || DEFAULT_INITIAL_REGION,
        tuman: filters.tuman || "",
        mavsum: filters.mavsum || "",
        fermer_nom: filters.fermer_nom || filters.fermer_nomNom || "",
        waterSource: filters.manba_nomi || "",
        canalName: resolvedCanalName,
        minMax: filters.min_max || null,
        // ✅
        yil: this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR,
        selectedCrop: currentCrop,
        isHandlingExternalEvent: true,
        error: null as any,
      };

      const changed =
        this.state.viloyat !== newState.viloyat ||
        this.state.tuman !== newState.tuman ||
        this.state.mavsum !== newState.mavsum ||
        this.state.fermer_nom !== newState.fermer_nom ||
        this.state.waterSource !== newState.waterSource ||
        this.state.canalName !== newState.canalName ||
        this.state.yil !== newState.yil; // ✅ compare year too

      if (changed) {
        this.setState(newState, () => {
          this.fetchCropData();
          this.applyCropFilter();
          if (this.state.selectedCrop !== currentCrop)
            this.notifyCropSelection();
          setTimeout(() => {
            if (this._isMounted)
              this.setState({ isHandlingExternalEvent: false });
          }, 500);
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.setState({ error: `Error updating filters: ${errMsg}` });
    }
  };

  // Handle slice click
  handleSliceClick = (data: any, index: any): void => {
    if (this.state.connectionStatus !== "connected") {
      return;
    }

    const selectedCropName = data.cropType || data.name;

    if (index === this.state.activeSlice) {
      this.setState(
        {
          activeSlice: null,
          selectedCrop: null,
          isHandlingExternalEvent: false,
          error: null,
        },
        () => {
          this.applyCropFilter();
          this.notifyCropSelection();
        },
      );
    } else {
      this.setState(
        {
          activeSlice: index,
          selectedCrop: selectedCropName,
          isHandlingExternalEvent: false,
          error: null,
        },
        () => {
          this.applyCropFilter();
          this.notifyCropSelection();
        },
      );
    }
  };
  fetchCropData = async (): Promise<void> => {
    if (this.state.connectionStatus !== "connected") return;

    let requestKey = "";
    let activeSignal: AbortSignal | null = null;

    try {
      this.clearExternalRefreshTimer(); // cancel any pending debounced fetch
      const {
        viloyat,
        tuman,
        mavsum,
        fermer_nom,
        waterSource,
        canalName,
        minMax,
        yil,
      } = this.state;

      requestKey = JSON.stringify({
        viloyat: viloyat || "",
        tuman: tuman || "",
        mavsum: mavsum || "",
        fermer_nom: fermer_nom || "",
        waterSource: waterSource || "",
        canalName: canalName || "",
        minMax: minMax || "",
        yil: yil || "",
      });

      if (this.cropFetchInFlightKey === requestKey) {
        return;
      }

      const now = Date.now();
      if (
        this.lastCropFetchKey === requestKey &&
        now - this.lastCropFetchAt < 300
      ) {
        return;
      }

      this.cropFetchInFlightKey = requestKey;
      this.lastCropFetchKey = requestKey;
      this.lastCropFetchAt = now;

      if (this.fetchAbortController) this.fetchAbortController.abort();
      this.fetchAbortController = new AbortController();
      const signal = this.fetchAbortController.signal;
      activeSignal = signal;

      this.setState({ loading: true, error: null });

      const resolvedCanalName = canalName
        ? await this.resolveRawCanalName(canalName)
        : "";

      const queryParams = new URLSearchParams();
      if (viloyat) queryParams.append("viloyat", viloyat);
      if (tuman) queryParams.append("tuman", tuman);
      if (mavsum) queryParams.append("mavsum", mavsum);
      if (fermer_nom) queryParams.append("fermer_nom", fermer_nom);
      if (waterSource) queryParams.append("manba_nomi", waterSource);
      if (resolvedCanalName)
        queryParams.append("kanal_nomi", resolvedCanalName);
      // When both min & max are selected, omit the min_max API param so the API
      // returns data for all min_max values (equivalent to OR).  For single
      // selection send the concrete value.
      if (minMax && String(minMax).toLowerCase() !== "both") {
        queryParams.append("min_max", minMax);
      }
      // ✅ YEAR to API
      if (yil && /^\d{4}$/.test(yil)) queryParams.append("yil", yil);

      try {
        let data = await this.fetchCropDistributionData(
          queryParams.toString(),
          {
            viloyat,
            tuman,
            mavsum,
            fermer_nom,
            waterSource,
            canalName: resolvedCanalName,
            minMax,
            yil,
          },
          signal,
        );
        if (signal.aborted) return;

        let rawCrops = data.crop_distribution || [];

        const retryCropFetch = async (
          opts: { dropTuman?: boolean; dropMavsum?: boolean },
          reason: string,
        ) => {
          const retryParams = new URLSearchParams(queryParams.toString());
          if (opts.dropTuman) retryParams.delete("tuman");
          if (opts.dropMavsum) retryParams.delete("mavsum");

          console.log(`[EvapoCropV32] ${reason}`);
          data = await this.fetchCropDistributionData(
            retryParams.toString(),
            {
              viloyat,
              tuman: opts.dropTuman ? "" : tuman,
              mavsum: opts.dropMavsum ? "" : mavsum,
              fermer_nom,
              waterSource,
              canalName: resolvedCanalName,
              minMax,
              yil,
            },
            signal,
          );
          if (signal.aborted) return;
          rawCrops = data.crop_distribution || [];
        };

        if (rawCrops.length === 0 && tuman) {
          await retryCropFetch(
            { dropTuman: true },
            "Empty crop distribution with tuman, retrying without tuman...",
          );
        }

        if (rawCrops.length === 0 && mavsum) {
          await retryCropFetch(
            { dropMavsum: true },
            "Empty crop distribution with mavsum, retrying without mavsum...",
          );
        }

        if (rawCrops.length === 0 && tuman && mavsum) {
          await retryCropFetch(
            { dropTuman: true, dropMavsum: true },
            "Empty crop distribution with tuman+mavsum, retrying without both...",
          );
        }

        // Names that are not actual crop types — exclude from the card list.
        const NON_CROP_NAMES = new Set(
          [
            "bo'z yer",
            "bo`z yer",
            "boz yer",
            "bo'sh yer",
            "bosh yer",
            "bo\u2018z yer",
            "bo\u02bbz yer",
            "bo\u02bcz yer",
          ].map((n) => n.toLowerCase()),
        );

        let crops = rawCrops.filter((c) => {
          if (!c.ekin_turi || c.area_ha <= 0) return false;
          const lower = String(c.ekin_turi)
            .toLowerCase()
            .replace(/[`''\u02bb\u02bc\u02b9\u02bd\u00b4]/g, "'");
          return !NON_CROP_NAMES.has(lower);
        });
        console.log(
          `[EvapoCropV32] fetchCropData: API returned ${rawCrops.length} crops, ${crops.length} after filtering (non-crop names removed)`,
        );

        // Keep crop options sourced from endpoint response only.
        // Do not prune by feature-layer presence to avoid hiding valid API crops.

        const totalArea = crops.reduce((s, c) => s + c.area_ha, 0);
        crops = crops.map((c) => ({
          ...c,
          percentage: totalArea > 0 ? (c.area_ha / totalArea) * 100 : 0,
        }));

        if (!this._isMounted) return;

        let newActiveSlice: number | null = null;
        let newSelectedCrop: string | null = null;
        const previousCrop = this.state.selectedCrop;

        if (previousCrop) {
          const idx = crops.findIndex((c) => c.ekin_turi === previousCrop);
          if (idx !== -1) {
            newActiveSlice = idx;
            newSelectedCrop = previousCrop;
          }
        }

        this.setState(
          {
            cropData: { crops, totalArea },
            loading: false,
            error: null,
            activeSlice: newActiveSlice,
            selectedCrop: newSelectedCrop,
            currentPage: 0,
          },
          () => {
            this.applyCropFilter();
            // If selected crop was invalidated (not found in new data), notify others
            if (previousCrop && !newSelectedCrop) {
              this.notifyCropSelection();
            }
          },
        );
      } catch (fetchError: any) {
        if (fetchError.name === "AbortError") return;
        throw new Error(`Network error: ${fetchError.message}`);
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return; // aborted by a newer fetch, ignore
      if (this._isMounted) {
        this.setState({
          error: `Failed to fetch crop distribution data: ${error.message}`,
          loading: false,
        });
      }
    } finally {
      if (this.fetchAbortController?.signal === activeSignal) {
        this.fetchAbortController = null;
      }
      if (this.cropFetchInFlightKey === requestKey) {
        this.cropFetchInFlightKey = "";
      }
    }
  };

  private isCorsLikeFetchError = (error: any): boolean => {
    const msg = String(error?.message || "").toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("load failed")
    );
  };

  private getCropDistributionApiCandidates = (
    queryString: string,
  ): string[] => {
    const qs = queryString ? `?${queryString}` : "";
    return [
      `https://apiwater.sgm.uzspace.uz/api/v1/crop/distribution${qs}`,
      `https://sgm.uzspace.uz/api/v1/crop/distribution${qs}`,
    ];
  };

  private getCropWaterDistributionApiCandidates = (
    queryString: string,
  ): string[] => {
    const qs = queryString ? `?${queryString}` : "";
    return [
      `https://apiwater.sgm.uzspace.uz/api/v1/crop/water-distribution${qs}`,
      `https://sgm.uzspace.uz/api/v1/crop/water-distribution${qs}`,
    ];
  };

  /**
   * Try crop/water-distribution endpoint as fallback.
   * Maps the response to the same CropDistributionResponse shape.
   */
  private async fetchCropWaterDistributionData(
    queryString: string,
    signal?: AbortSignal,
  ): Promise<CropDistributionResponse> {
    const candidates = this.getCropWaterDistributionApiCandidates(queryString);
    let lastError: Error | null = null;

    for (const url of candidates) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal,
        });
        if (!response.ok) {
          lastError = new Error(`water-distribution HTTP ${response.status}`);
          continue;
        }
        const json = await response.json();
        const items: any[] = json?.water_distribution || [];
        const crop_distribution: CropData[] = items
          .filter(
            (item: any) => item.ekin_turi && Number(item.total_area_ha) > 0,
          )
          .map((item: any) => ({
            ekin_turi: item.ekin_turi,
            area_ha: Number(item.total_area_ha) || 0,
            uw: Number(item.avg_uwt_m3ha) || 0,
          }));
        return { crop_distribution };
      } catch (err: any) {
        if (err?.name === "AbortError") throw err;
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    throw lastError || new Error("crop/water-distribution failed");
  }

  /**
   * Query the feature layer for distinct ekin_turi values that exist under
   * the current region/year filters. Returns a Set of normalised crop names.
   * Used to cross-validate API crops against the actual map data so we never
   * show a crop that has 0 features on the map.
   */
  private async getLayerCropNames(
    signal?: AbortSignal,
  ): Promise<Set<string> | null> {
    const featureLayer = this.state.featureLayer as any;
    if (!featureLayer?.createQuery || !featureLayer?.queryFeatures) return null;

    const cropField = this.findLayerFieldName(["ekin_turi"]);
    if (!cropField) return null;

    const viloyatField = this.findLayerFieldName(["viloyat"]);
    const yilField = this.findLayerFieldName(["yil"]);
    const minMaxField = this.findLayerFieldName(["min_max"]);

    const clauses: string[] = ["1=1"];
    const { viloyat, yil } = this.state;
    if (viloyatField && viloyat) {
      const raw = String(viloyat).trim();
      const withSuffix = /\sviloyati$/i.test(raw) ? raw : `${raw} viloyati`;
      const withoutSuffix = raw.replace(/\sviloyati$/i, "").trim();
      const candidates = Array.from(
        new Set(
          [
            raw,
            withSuffix,
            withoutSuffix,
            ...this.buildQuoteVariants(raw),
            ...this.buildQuoteVariants(withSuffix),
            ...this.buildQuoteVariants(withoutSuffix),
          ].filter(Boolean),
        ),
      );
      const vilWhere = candidates
        .map((v) => `${viloyatField}='${this.escapeArcGIS(v)}'`)
        .join(" OR ");
      clauses.push(`(${vilWhere})`);
    }
    if (yilField && yil && /^\d{4}$/.test(yil)) {
      clauses.push(
        `(${yilField}=${Number(yil)} OR ${yilField}='${this.escapeArcGIS(yil)}')`,
      );
    }

    // When min/max is active, restrict the distinct-crop query to only
    // crops that have min_max polygon data on the map.  This prevents
    // showing crops that exist in the "no-filter" API response but have
    // zero features when the user clicks them with min/max enabled.
    const { minMax } = this.state;
    if (minMaxField && minMax) {
      const mml = String(minMax).toLowerCase();
      if (mml === "both") {
        clauses.push(`(${minMaxField} IN ('Min','Max'))`);
      } else if (mml === "min" || mml === "max") {
        const val = mml === "min" ? "Min" : "Max";
        clauses.push(`(${minMaxField}='${val}')`);
      }
    }

    try {
      const q = featureLayer.createQuery();
      q.where = clauses.join(" AND ");
      q.returnDistinctValues = true;
      q.returnGeometry = false;
      q.outFields = [cropField];
      q.num = 200;

      if (signal?.aborted) return null;
      const res = await featureLayer.queryFeatures(q);
      const features = Array.isArray(res?.features) ? res.features : [];

      const names = new Set<string>();
      for (const f of features) {
        const name = String(f?.attributes?.[cropField] ?? "").trim();
        if (name) names.add(name.toLowerCase());
      }
      console.log(
        `[EvapoCropV32] Feature layer has ${names.size} distinct crops for current region/year`,
        Array.from(names),
      );
      return names;
    } catch (err) {
      console.warn("[EvapoCropV32] Failed to query layer crop names:", err);
      return null;
    }
  }

  /**
   * Known API→layer crop-name aliases.
   * Keys are lowercased API names, values are arrays of layer equivalents.
   */
  private static readonly CROP_ALIAS_MAP: Record<string, string[]> = {
    "qovun-tarvuz": ["qovun", "tarvuz", "qovun-tarvuz"],
    "qovun tarvuz": ["qovun", "tarvuz", "qovun-tarvuz"],
    "yeryong'oq": ["yer yong'oq", "yeryong'oq"],
    "yeryong`oq": ["yer yong'oq", "yer yong`oq"],
    "bo'z yer": ["bo'sh yer", "bo'z yer", "boz yer"],
    "bo`z yer": ["bo'sh yer", "bo`z yer", "boz yer"],
  };

  /**
   * Check if a crop name from the API matches any name in the feature layer.
   * Handles apostrophe/backtick variants, compound names (e.g. Qovun-tarvuz),
   * and spacing differences (e.g. Yeryong'oq → yer yong'oq).
   */
  private cropExistsInLayer(
    apiCropName: string,
    layerCropNames: Set<string>,
  ): boolean {
    // 1. Direct apostrophe-variant matching
    const variants = this.buildQuoteVariants(apiCropName);
    if (variants.some((v) => layerCropNames.has(v.toLowerCase()))) return true;

    // 2. Check alias map (handles known mismatches like Qovun-tarvuz, Yeryong'oq, Bo'z yer)
    const normalized = apiCropName.toLowerCase().replace(/[`''ʻʼʹʽ´]/g, "'");
    for (const [key, aliases] of Object.entries(
      CropDistributionWidget.CROP_ALIAS_MAP,
    )) {
      if (normalized === key) {
        for (const alias of aliases) {
          const aliasVariants = this.buildQuoteVariants(alias);
          if (aliasVariants.some((v) => layerCropNames.has(v.toLowerCase())))
            return true;
        }
      }
    }

    // 3. Compound name splitting: "Qovun-tarvuz" → check "qovun" and "tarvuz" separately
    const parts = apiCropName
      .split(/[-/]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      if (
        parts.some((part) => {
          const partVariants = this.buildQuoteVariants(part);
          return partVariants.some((v) => layerCropNames.has(v.toLowerCase()));
        })
      )
        return true;
    }

    // 4. Space-collapsed matching: "Yeryong'oq" → try "yer yong'oq" by inserting spaces
    //    before uppercase letters or known word boundaries
    const spaceInserted = normalized.replace(/(yer)(yong)/i, "$1 $2");
    if (spaceInserted !== normalized) {
      const spaceVariants = this.buildQuoteVariants(spaceInserted);
      if (spaceVariants.some((v) => layerCropNames.has(v.toLowerCase())))
        return true;
    }

    return false;
  }

  private findLayerFieldName = (candidates: string[]): string | null => {
    const fields = (this.state.featureLayerFields || []).map((f) => String(f));
    for (const candidate of candidates) {
      const found = fields.find(
        (f) => f.toLowerCase() === String(candidate).toLowerCase(),
      );
      if (found) return found;
    }
    return null;
  };

  private async queryCropDistributionFromLayer(
    filters: CropDistributionFilters,
    signal?: AbortSignal,
    allowMinMaxRetry = true,
  ): Promise<CropDistributionResponse> {
    console.log(
      "[EvapoCropV32] Starting layer fallback query with filters:",
      filters,
    );

    const featureLayer = this.state.featureLayer as any;
    if (!featureLayer?.createQuery || !featureLayer?.queryFeatures) {
      const err = "Feature layer not ready for crop distribution fallback";
      console.error("[EvapoCropV32]", err);
      throw new Error(err);
    }

    const cropField = this.findLayerFieldName(["ekin_turi"]);
    if (!cropField) {
      const err = "Field ekin_turi not found for crop fallback";
      console.error("[EvapoCropV32]", err);
      throw new Error(err);
    }

    const areaField = this.findLayerFieldName([
      "area_ha",
      "maydon_ha",
      "ekin_maydon_ha",
      "ekin_maydoni_ha",
      "maydon",
      "shape_area",
      "Shape_Area",
      "AREA",
    ]);
    const uwField = this.findLayerFieldName([
      "uw",
      "uw_m3",
      "uw_m3ha",
      "suv_sarfi",
      "water_usage",
      "water_use",
    ]);

    const viloyatField = this.findLayerFieldName(["viloyat"]);
    const tumanField = this.findLayerFieldName(["tuman"]);
    const mavsumField = this.findLayerFieldName(["mavsum"]);
    const fermerField = this.findLayerFieldName(["fermer_nom"]);
    const manbaField = this.findLayerFieldName(["manba_nomi"]);
    const kanalField = this.findLayerFieldName(["kanal_nomi"]);
    const minMaxField = this.findLayerFieldName([
      "min_max",
      "minmax",
      "min_maxi",
      "minmaxi",
    ]);
    const yilField = this.findLayerFieldName(["yil"]);

    console.log("[EvapoCropV32] Layer fields discovered:", {
      cropField,
      areaField,
      uwField,
      viloyatField,
      tumanField,
      mavsumField,
      fermerField,
      manbaField,
      kanalField,
      minMaxField,
      yilField,
    });

    const clauses: string[] = ["1=1"];
    if (viloyatField && filters.viloyat)
      clauses.push(`${viloyatField}='${this.escapeArcGIS(filters.viloyat)}'`);
    if (tumanField && filters.tuman)
      clauses.push(`${tumanField}='${this.escapeArcGIS(filters.tuman)}'`);
    if (mavsumField && filters.mavsum)
      clauses.push(`${mavsumField}='${this.escapeArcGIS(filters.mavsum)}'`);
    if (fermerField && filters.fermer_nom)
      clauses.push(`${fermerField}='${this.escapeArcGIS(filters.fermer_nom)}'`);
    if (manbaField && filters.waterSource)
      clauses.push(`${manbaField}='${this.escapeArcGIS(filters.waterSource)}'`);
    if (kanalField && filters.canalName)
      clauses.push(`${kanalField}='${this.escapeArcGIS(filters.canalName)}'`);
    if (minMaxField && filters.minMax) {
      const mm = String(filters.minMax).trim().toLowerCase();
      if (mm === "both") {
        clauses.push(`(${minMaxField}='Min' OR ${minMaxField}='Max')`);
      } else {
        // Layer stores 'Min'/'Max' (title-case); event value arrives as 'min'/'max'.
        // Capitalise to avoid a case-mismatch that returns 0 features.
        const minMaxLayerVal =
          String(filters.minMax).charAt(0).toUpperCase() +
          String(filters.minMax).slice(1).toLowerCase();
        clauses.push(`${minMaxField}='${this.escapeArcGIS(minMaxLayerVal)}'`);
      }
    }
    if (yilField && filters.yil && /^\d{4}$/.test(String(filters.yil))) {
      clauses.push(
        `(${yilField}=${Number(filters.yil)} OR ${yilField}='${this.escapeArcGIS(String(filters.yil))}')`,
      );
    }

    console.log(
      "[EvapoCropV32] Constructed WHERE clause:",
      clauses.join(" AND "),
    );

    const q = featureLayer.createQuery();
    q.where = clauses.join(" AND ");
    q.returnGeometry = false;
    q.outFields = [
      cropField,
      ...(areaField ? [areaField] : []),
      ...(uwField ? [uwField] : []),
    ];

    const allFeatures: any[] = [];
    let start = 0;
    const pageSize = 1000;

    while (true) {
      if (signal?.aborted) {
        const abortErr: any = new Error("Aborted");
        abortErr.name = "AbortError";
        throw abortErr;
      }

      q.start = start;
      q.num = pageSize;
      const res = await featureLayer.queryFeatures(q);
      const chunk = Array.isArray(res?.features) ? res.features : [];
      console.log("[EvapoCropV32] Query page:", {
        start,
        chunkSize: chunk.length,
        exceeded: (res as any)?.exceededTransferLimit,
      });
      allFeatures.push(...chunk);

      const exceeded = Boolean((res as any)?.exceededTransferLimit);
      if (!exceeded || chunk.length === 0) break;
      start += chunk.length;
      if (start > 50000) break;
    }

    console.log("[EvapoCropV32] Total features retrieved:", allFeatures.length);

    // Some layers contain crop geometry but do not carry consistent min/max tags.
    // If min/max filtering yields no features, retry once without min/max so the
    // crop widget remains visible instead of showing an empty state.
    if (allFeatures.length === 0 && filters.minMax && allowMinMaxRetry) {
      console.warn(
        "[EvapoCropV32] No features with min/max filter, retrying without min/max",
        {
          minMax: filters.minMax,
          where: clauses.join(" AND "),
        },
      );
      return await this.queryCropDistributionFromLayer(
        { ...filters, minMax: null },
        signal,
        false,
      );
    }

    const grouped = new Map<string, { area_ha: number; uw: number }>();
    for (const feature of allFeatures) {
      const attrs = feature?.attributes || {};
      const cropName = String(attrs?.[cropField] ?? "").trim();
      if (!cropName) continue;

      const areaRaw = areaField ? Number(attrs?.[areaField]) : NaN;
      const uwRaw = uwField ? Number(attrs?.[uwField]) : NaN;
      const area = Number.isFinite(areaRaw) ? areaRaw : 1;
      const uw = Number.isFinite(uwRaw) ? uwRaw : 0;

      const prev = grouped.get(cropName) || { area_ha: 0, uw: 0 };
      prev.area_ha += area;
      prev.uw += uw;
      grouped.set(cropName, prev);
    }

    const crop_distribution: CropData[] = Array.from(grouped.entries())
      .map(([ekin_turi, v]) => ({ ekin_turi, area_ha: v.area_ha, uw: v.uw }))
      .sort((a, b) => b.area_ha - a.area_ha);

    return { crop_distribution };
  }

  private async fetchCropDistributionData(
    queryString: string,
    filters: CropDistributionFilters,
    signal?: AbortSignal,
  ): Promise<CropDistributionResponse> {
    const candidates = this.getCropDistributionApiCandidates(queryString);
    let lastError: Error | null = null;
    console.log("[EvapoCropV32] Attempting crop distribution fetch:", {
      queryString,
      viloyat: filters.viloyat,
      yil: filters.yil,
    });

    for (const url of candidates) {
      try {
        console.log("[EvapoCropV32] Trying API endpoint:", url);
        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal,
        });

        if (!response.ok) {
          lastError = new Error(
            `API request failed with status ${response.status}`,
          );
          console.warn("[EvapoCropV32] API HTTP error:", response.status, url);
          continue;
        }

        console.log("[EvapoCropV32] API success:", url);
        return (await response.json()) as CropDistributionResponse;
      } catch (error: any) {
        if (error?.name === "AbortError") throw error;
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn("[EvapoCropV32] API fetch error:", lastError.message, url);
        if (this.isCorsLikeFetchError(lastError)) {
          console.warn(
            "[EvapoCropV32] CORS-like failure detected, skipping remaining crop/distribution endpoints",
          );
          break;
        }
      }
    }

    // Fallback 1: try crop/water-distribution (works for Qashqadaryo where
    // crop/distribution returns 500).
    console.log(
      "[EvapoCropV32] crop/distribution failed, trying crop/water-distribution",
    );
    try {
      return await this.fetchCropWaterDistributionData(queryString, signal);
    } catch (wdErr: any) {
      if (wdErr?.name === "AbortError") throw wdErr;
      console.warn(
        "[EvapoCropV32] crop/water-distribution also failed:",
        wdErr.message,
      );
    }

    // Fallback 2: compute distribution directly from connected layer.
    console.log(
      "[EvapoCropV32] All API endpoints failed, falling back to layer query",
    );
    try {
      return await this.queryCropDistributionFromLayer(filters, signal);
    } catch (fallbackErr: any) {
      if (fallbackErr?.name === "AbortError") throw fallbackErr;
      const finalError =
        lastError ||
        fallbackErr ||
        new Error("No crop distribution API endpoint responded");
      console.error(
        "[EvapoCropV32] Layer fallback also failed:",
        finalError.message,
      );
      throw finalError;
    }
  }

  // Format percentage
  formatPercentage = (value: number): string => {
    return value.toFixed(1) + "%";
  };

  // Custom tooltip for pie chart
  renderCustomTooltip = (props: any): JSX.Element | null => {
    const { active, payload } = props;
    const { lang } = this.state;

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="crop-donut-tooltip">
          <div className="crop-donut-tooltip-title">
            {translateCropName(lang as any, data.cropType || data.name)}
          </div>
          <div className="crop-donut-tooltip-content">
            <div className="crop-donut-tooltip-row">
              <span className="crop-donut-tooltip-label">Area:</span>
              <span className="crop-donut-tooltip-value">
                {data.value.toLocaleString()} ha
              </span>
            </div>
            <div className="crop-donut-tooltip-row">
              <span className="crop-donut-tooltip-label">Percentage:</span>
              <span className="crop-donut-tooltip-value">
                {this.formatPercentage(data.percentage)}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Custom label for pie chart
  renderCustomLabel = (props: any): JSX.Element | null => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
      name,
      value,
    } = props;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if the segment is big enough (more than 4%)
    if (percent < 0.04) return null;

    const textAnchor = x > cx ? "start" : "end";

    return (
      <g>
        <text
          x={x}
          y={y - 10}
          fill="#000000"
          stroke="#ffffff"
          strokeWidth="0.5"
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{ fontSize: "12px", fontWeight: "bold" }}
        >
          {name}
        </text>
        <text
          x={x}
          y={y + 10}
          fill="#000000"
          stroke="#ffffff"
          strokeWidth="0.5"
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{ fontSize: "12px", fontWeight: "bold" }}
        >
          {this.formatPercentage(percent * 100)}
        </text>
      </g>
    );
  };

  // Get crop icon based on crop name
  getCropIcon = (cropName: string): string => {
    const cropIcons = {
      "Bug'doy": "🌾",
      Paxta: "🌱",
      "Makkajo'xori": "🌽",
      "Bog'lar": "🍇",
      "Bog'": "🍇",
      Mosh: "🫘",
      Sholi: "🌾",
      Beda: "🌿",
      "Aralash ekin": "🌿",
      "Bo'z yer": "🏜️",
      "Baliq hovuz": "🐟",
      "Qovun-tarvuz": "🍉",
      Sabzi: "🥕",
      "Ikkilamchi ekin ekilmagan": "🌾",
      Ikkilamchi: "🌾",
      Vegetatsiyasiz: "🟫",
    };
    return (cropIcons as any)[cropName] || "🌱";
  };

  // Keep card wave color aligned with map renderer crop colors.
  getCropColor = (cropName: string): string => {
    const cropColors: Record<string, string> = {
      "Bug'doy": "#f59e0b", // amber-gold  (xarita: #ffaa00, boyitilgan)
      Paxta: "#a5f3fc", // yengil ko'k (xarita: #ffffff, UI uchun ko'rinadigan)
      "Makkajo'xori": "#fde047", // quyosh sariq (xarita: #f5ef49, yorqin)
      "Bog'": "#4ade80", // yorqin yashil (xarita: #147a12, sochli)
      Bogi: "#4ade80",
      "Bog'lar": "#4ade80",
      Mosh: "#86efac", // nozik yashil (xarita: #7ac48c)
      Sholi: "#38bdf8", // osmon ko'k (xarita: #008bfc, yoqimli)
      Beda: "#4ade80", // zangori-yashil (xarita: #05ff4c, neon emas)
      "Aralash ekin": "#d4b96a", // iliq oltin (xarita: #f0eeaf, kontrast)
      "Bo'z yer": "#94a3b8", // sovuq kulrang (xarita: #868f8d)
      "Ikkilamchi ekin ekilmagan": "#bbf7d0", // yengil nozik yashil
      "Ikkiamchi ekin ekilmagan": "#bbf7d0",
      Ikkilamchi: "#bbf7d0",
      "Baliq hovuz": "#22d3ee", // tiniq moviy (xarita: #adfbff, sochli)
      "Bolig hovuz": "#22d3ee",
      "Qovun-tarvuz": "#e879f9", // pushti-binafsha (xarita: #e695dd, yorqin)
      Vegetatsiyasiz: "#fb7185", // yoqimli marjon qizil (xarita: #fd7f6f)
      Sabzi: "#fb923c", // sabzi to'q sariq-qizg'ish (xarita: #8a6629)
      Umumiy: "#a78bfa", // binafsha-och
    };
    return cropColors[cropName] || "#38bdf8";
  };

  getReadableTextColor = (hexColor: string): string => {
    const normalizedHex = String(hexColor || "").replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) return "#ffffff";

    const r = parseInt(normalizedHex.slice(0, 2), 16);
    const g = parseInt(normalizedHex.slice(2, 4), 16);
    const b = parseInt(normalizedHex.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 165 ? "#0b1e2e" : "#ffffff";
  };

  private buildVerticalWavePath = (
    height: number,
    baseX: number,
    phase: number,
    amp: number,
    segmentCount: number,
    driftX = 0,
  ): string => {
    const safeHeight = Math.max(8, height);
    const waveFreq = (Math.PI * 2) / Math.max(6, segmentCount - 1);
    let d = `M ${baseX + driftX} 0`;
    for (let i = 1; i < segmentCount; i++) {
      const py = (safeHeight * i) / (segmentCount - 1);
      const wobble = Math.sin(i * waveFreq + phase) * amp;
      const px = baseX + driftX + wobble;
      d += ` L ${px} ${py}`;
    }
    return d;
  };

  private renderCropWaveLayer = (
    cropColor: string,
    selected: boolean,
  ): JSX.Element => {
    const width = selected ? 120 : 22;
    const height = 100;
    const baseX = selected
      ? width + 3.5
      : Math.max(11, Math.round(width * 0.62));
    const segmentCount = selected ? 30 : 18;
    const ampMain = selected ? 4.4 : 2.2;
    const ampFine = selected ? 2.5 : 1.3;

    const waveEdgeA = this.buildVerticalWavePath(
      height,
      baseX,
      0,
      ampMain,
      segmentCount,
    );
    const waveEdgeB = this.buildVerticalWavePath(
      height,
      baseX,
      Math.PI / 2,
      ampMain,
      segmentCount,
    );
    const waveEdgeC = this.buildVerticalWavePath(
      height,
      baseX,
      Math.PI,
      ampMain,
      segmentCount,
    );
    const waveEdgeD = this.buildVerticalWavePath(
      height,
      baseX,
      (Math.PI * 3) / 2,
      ampMain,
      segmentCount,
    );

    const foamEdgeA = this.buildVerticalWavePath(
      height,
      baseX,
      Math.PI / 4,
      ampFine,
      segmentCount,
      1,
    );
    const foamEdgeB = this.buildVerticalWavePath(
      height,
      baseX,
      (Math.PI * 3) / 4,
      ampFine,
      segmentCount,
      1,
    );
    const foamEdgeC = this.buildVerticalWavePath(
      height,
      baseX,
      (Math.PI * 5) / 4,
      ampFine,
      segmentCount,
      1,
    );
    const foamEdgeD = this.buildVerticalWavePath(
      height,
      baseX,
      (Math.PI * 7) / 4,
      ampFine,
      segmentCount,
      1,
    );

    const toFillPath = (edgePath: string): string => `${edgePath} H 0 V 0 Z`;

    const fillPathA = toFillPath(waveEdgeA);
    const fillPathB = toFillPath(waveEdgeB);
    const fillPathC = toFillPath(waveEdgeC);
    const fillPathD = toFillPath(waveEdgeD);

    return (
      <div className={`crop-wave-layer${selected ? " selected" : ""}`}>
        <svg
          className="crop-wave-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="presentation"
          aria-hidden="true"
        >
          <path d={fillPathA} fill={cropColor} opacity={0.74}>
            <animate
              attributeName="d"
              values={`${fillPathA};${fillPathB};${fillPathC};${fillPathD};${fillPathA}`}
              dur={selected ? "2.4s" : "2.9s"}
              repeatCount="indefinite"
            />
          </path>
          <path
            d={waveEdgeA}
            fill="none"
            stroke="rgba(239, 250, 255, 0.88)"
            strokeWidth={selected ? 1.3 : 1.05}
            strokeLinecap="round"
          >
            <animate
              attributeName="d"
              values={`${waveEdgeA};${waveEdgeB};${waveEdgeC};${waveEdgeD};${waveEdgeA}`}
              dur={selected ? "2.4s" : "2.9s"}
              repeatCount="indefinite"
            />
          </path>
          <path
            d={foamEdgeA}
            fill="none"
            stroke="rgba(198, 239, 255, 0.62)"
            strokeWidth={selected ? 1.0 : 0.85}
            strokeLinecap="round"
          >
            <animate
              attributeName="d"
              values={`${foamEdgeA};${foamEdgeB};${foamEdgeC};${foamEdgeD};${foamEdgeA}`}
              dur={selected ? "3.2s" : "3.8s"}
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    );
  };

  // Render card view with dynamic responsive sizing
  renderCardView = () => {
    const {
      cropData,
      lang,
      currentPage,
      selectedCrop,
      waterSource,
      canalName,
      minMax,
    } = this.state;
    const { crops } = cropData;

    // Crops are already cross-validated against the feature layer in fetchCropData.
    const baseSorted = [...crops].sort((a, b) => b.area_ha - a.area_ha);

    // When external filters (canal / water-source / min-max) are active and a crop
    // is selected, pin that crop to position 0 so it is always visible at the left.
    // When no external filters are active the crop stays in its natural sort position.
    const hasExternalFilters = !!(waterSource || canalName || minMax);
    let sortedCrops: typeof baseSorted;
    if (hasExternalFilters && selectedCrop) {
      const selIdx = baseSorted.findIndex((c) => c.ekin_turi === selectedCrop);
      if (selIdx > 0) {
        sortedCrops = [
          baseSorted[selIdx],
          ...baseSorted.slice(0, selIdx),
          ...baseSorted.slice(selIdx + 1),
        ];
      } else {
        sortedCrops = baseSorted;
      }
    } else {
      sortedCrops = baseSorted;
    }

    const visibleCount = this.CROP_PAGE_SIZE;
    const maxStartIndex = Math.max(0, sortedCrops.length - visibleCount);
    const safeStartIndex = Math.min(Math.max(currentPage, 0), maxStartIndex);

    // When there are fewer crops than the page size the track should fill the
    // full viewport width (each card stretches equally) instead of keeping
    // the fixed per-card size that leaves empty whitespace on the right.
    const isFilling = sortedCrops.length <= visibleCount;

    if (sortedCrops.length === 0) {
      return (
        <div className="crop-cards-no-data">
          <p>{t(lang as any, "status.noData")}</p>
        </div>
      );
    }

    // Get responsive font sizes
    const sizes = this.getResponsiveFontSizes();
    const {
      waterSize,
      cardPadding,
      elementGap,
      containerGap,
      containerPadding,
    } = sizes;

    // Check if vertical layout is needed
    const isVertical = this.getLayoutClass() === "layout-vertical";

    if (isVertical) {
      return (
        <div className="crop-cards-paginated-wrap">
          <div
            className="crop-cards-container"
            style={{
              gap: `${containerGap}px`,
              padding: `${containerPadding}px`,
              flexDirection: "column",
              overflowY: "auto",
              overflowX: "hidden",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            {sortedCrops.map((crop) => {
              const cropColor = this.getCropColor(crop.ekin_turi);
              const selectedTextColor = this.getReadableTextColor(cropColor);
              const cropCardStyle: React.CSSProperties = {
                flex: "0 0 auto",
                minWidth: 0,
                height: "auto",
                padding: `${cardPadding}px`,
                gap: `${elementGap}px`,
                boxSizing: "border-box",
              };
              (cropCardStyle as any)["--crop-wave-color"] = cropColor;
              (cropCardStyle as any)["--crop-selected-text"] =
                selectedTextColor;

              const waterUsageLabel =
                lang === "ru"
                  ? "Расход воды"
                  : lang === "uz_cyrl"
                    ? "Сув сарфи"
                    : "Suv sarfi";
              return (
                <div
                  key={crop.ekin_turi}
                  className={`crop-card ${
                    this.state.selectedCrop === crop.ekin_turi ? "selected" : ""
                  }`}
                  onClick={() => this.handleCropSelection(crop.ekin_turi)}
                  role="button"
                  aria-pressed={this.state.selectedCrop === crop.ekin_turi}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      this.handleCropSelection(crop.ekin_turi);
                    }
                  }}
                  style={cropCardStyle}
                >
                  {this.renderCropWaveLayer(
                    cropColor,
                    this.state.selectedCrop === crop.ekin_turi,
                  )}
                  <div
                    className="crop-header"
                    style={{ gap: `${Math.max(2, elementGap * 0.75)}px` }}
                  >
                    <span
                      className="crop-name"
                      style={{
                        fontSize: "16px",
                      }}
                    >
                      {translateCropName(
                        this.state.lang as any,
                        crop.ekin_turi,
                      )}
                    </span>
                  </div>
                  <div
                    className="crop-water-usage"
                    style={{ gap: `${Math.max(1, elementGap * 0.5)}px` }}
                  >
                    <div className="crop-water-head">
                      <span
                        className="water-icon"
                        style={{ fontSize: `${waterSize}px` }}
                      >
                        💧
                      </span>
                      <span
                        className="water-label"
                        style={{ fontSize: "12px" }}
                      >
                        {waterUsageLabel}
                      </span>
                    </div>
                  </div>
                  <span className="water-value" style={{ fontSize: "16px" }}>
                    {this.formatNumber(crop.uw)} m³
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Helper: build a single crop card element (shared across fill & slide modes)
    const renderCropCard = (crop: CropData) => {
      const cropColor = this.getCropColor(crop.ekin_turi);
      const selectedTextColor = this.getReadableTextColor(cropColor);
      const isSelected = this.state.selectedCrop === crop.ekin_turi;

      // In fill mode each card grows equally; in slide mode each card is
      // exactly 1/visibleCount of the track width.
      const cardFlex = isFilling
        ? "1 1 0"
        : `0 0 calc((100% - ${(visibleCount - 1) * containerGap}px) / ${visibleCount})`;
      const cardMinWidth = isFilling
        ? "0"
        : `calc((100% - ${(visibleCount - 1) * containerGap}px) / ${visibleCount})`;

      const cropCardStyle: React.CSSProperties = {
        flex: cardFlex,
        minWidth: cardMinWidth,
        height: "100%",
        padding: `${cardPadding}px`,
        gap: `${elementGap}px`,
        boxSizing: "border-box",
      };
      (cropCardStyle as any)["--crop-wave-color"] = cropColor;
      (cropCardStyle as any)["--crop-selected-text"] = selectedTextColor;

      const waterUsageLabel =
        lang === "ru"
          ? "Расход воды"
          : lang === "uz_cyrl"
            ? "Сув сарфи"
            : "Suv sarfi";

      return (
        <div
          key={crop.ekin_turi}
          className={`crop-card ${isSelected ? "selected" : ""}`}
          onClick={() => this.handleCropSelection(crop.ekin_turi)}
          role="button"
          aria-pressed={isSelected}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this.handleCropSelection(crop.ekin_turi);
            }
          }}
          style={cropCardStyle}
        >
          {this.renderCropWaveLayer(cropColor, isSelected)}
          <div
            className="crop-header"
            style={{ gap: `${Math.max(2, elementGap * 0.75)}px` }}
          >
            <span className="crop-name" style={{ fontSize: "16px" }}>
              {translateCropName(this.state.lang as any, crop.ekin_turi)}
            </span>
          </div>
          <div
            className="crop-water-usage"
            style={{ gap: `${Math.max(1, elementGap * 0.5)}px` }}
          >
            <div className="crop-water-head">
              <span
                className="water-icon"
                style={{ fontSize: `${waterSize}px` }}
              >
                💧
              </span>
              <span className="water-label" style={{ fontSize: "12px" }}>
                {waterUsageLabel}
              </span>
            </div>
          </div>
          <span className="water-value" style={{ fontSize: "16px" }}>
            {this.formatNumber(crop.uw)} m³
          </span>
        </div>
      );
    };

    return (
      <div className="crop-cards-paginated-wrap">
        {!isFilling && sortedCrops.length > visibleCount && (
          <Button
            className="crop-pagination-btn crop-pagination-btn-left"
            size="sm"
            type="tertiary"
            aria-label="Previous crops"
            disabled={safeStartIndex <= 0}
            onClick={() =>
              this.setState({
                currentPage: Math.max(0, safeStartIndex - this.CROP_SLIDE_STEP),
              })
            }
          >
            <span aria-hidden="true">&#x2039;</span>
          </Button>
        )}

        <div
          className="crop-cards-viewport"
          style={{ padding: `${containerPadding}px` }}
        >
          <div
            className="crop-cards-track"
            style={{
              gap: `${containerGap}px`,
              // In fill mode there is nothing to translate; the track sits flush.
              transform: isFilling
                ? "translateX(0)"
                : `translateX(calc(-${safeStartIndex} * ((100% - ${(visibleCount - 1) * containerGap}px) / ${visibleCount} + ${containerGap}px)))`,
            }}
          >
            {sortedCrops.map((crop) => renderCropCard(crop))}
          </div>
        </div>

        {!isFilling && sortedCrops.length > visibleCount && (
          <Button
            className="crop-pagination-btn crop-pagination-btn-right"
            size="sm"
            type="tertiary"
            aria-label="Next crops"
            disabled={safeStartIndex >= maxStartIndex}
            onClick={() =>
              this.setState({
                currentPage: Math.min(
                  maxStartIndex,
                  safeStartIndex + this.CROP_SLIDE_STEP,
                ),
              })
            }
          >
            <span aria-hidden="true">&#x203A;</span>
          </Button>
        )}
      </div>
    );
  };

  handleClearSelection = (event: any) => {
    const src = String(event?.detail?.source || "");
    if (src === "EvapoWidget" || src === "LocalizationWidgetV20") {
      this.setState({
        selectedCrop: null,
        activeSlice: null,
      });
    }
  };

  handleExternalDependentReset = (event: any) => {
    if (event?.detail?.source !== "EvapoWidget") return;
    const reason = String(event?.detail?.reason || "");
    if (
      reason !== "viloyatChanged" &&
      reason !== "tumanChanged" &&
      reason !== "fermerChanged"
    )
      return;

    // Only clear dependent state here. Do NOT call fetchCropData() — the
    // waterSupplyFilterChanged event fired by LocalizationWidgetV20 immediately
    // after this will invoke handleFilterChange with the correct new tuman/fermer,
    // which calls fetchCropData() with the proper filter state. Fetching here with
    // stale tuman and then aborting that fetch from handleFilterChange creates a
    // race that leaves cropData empty.
    this.setState({
      selectedCrop: null,
      activeSlice: null,
      waterSource: "",
      canalName: "",
      minMax: null,
      lastMinMaxEventTimestamp: 0,
    });
  };

  // Handle crop selection
  handleCropSelection = (cropName: string) => {
    if (this.state.connectionStatus !== "connected") {
      return;
    }

    // Verify crop exists in the current data (already cross-validated against layer)
    const cropExists = this.state.cropData.crops.some(
      (c) => c.ekin_turi === cropName,
    );
    if (!cropExists) {
      console.warn(
        `[EvapoCropV32] Crop "${cropName}" not in current crop list`,
      );
      return;
    }

    const isCurrentlySelected = this.state.selectedCrop === cropName;
    const newSelectedCrop = isCurrentlySelected ? null : cropName;

    this.setState(
      {
        selectedCrop: newSelectedCrop,
        isHandlingExternalEvent: false,
        error: null,
      },
      () => {
        this.applyCropFilter();
        this.notifyCropSelection();
      },
    );
  };

  zoomToSelectedCrop = async (cropName: string) => {
    const {
      featureLayer,
      activeMapView,
      featureLayerFields,
      yil,
      viloyat,
      tuman,
      mavsum,
      fermer_nom,
      waterSource,
      canalName,
      minMax,
    } = this.state;
    if (!featureLayer || !activeMapView) return;

    // Map crop name if needed (backend name -> map name)
    const mappedCropName = this.CROP_NAME_MAP[cropName] || cropName;

    try {
      const query = featureLayer.createQuery();

      // Build clauses entirely from current state — never inherit featureLayer.definitionExpression
      // because it may contain stale region filters set by other widgets (e.g. Qashqadaryo)
      // that would then override this.state.viloyat and zoom to the wrong location.
      const clauses: string[] = [];

      // Crop can be stored with apostrophe/backtick variants in some layers.
      const cropCandidates = Array.from(
        new Set(
          [mappedCropName, cropName].filter(Boolean).flatMap((value) => {
            const raw = String(value).trim();
            if (!raw) return [];
            const variants = this.buildQuoteVariants(raw);
            if (/^mosh$/i.test(raw)) {
              variants.push("Mosh", "mosh", "Мош", "мош");
            }
            if (/^sholi$/i.test(raw)) {
              variants.push("Sholi", "sholi", "Шоли", "шоли");
            }

            // Layer values can differ from API canonical crop names.
            // For Qovun-tarvuz include common map-side aliases so zoom works.
            const qovunTarvuzNormalized = raw
              .toLowerCase()
              .replace(/`/g, "'")
              .replace(/\s+/g, " ")
              .replace(/-/g, "-");
            if (
              qovunTarvuzNormalized === "qovun-tarvuz" ||
              qovunTarvuzNormalized === "qovun tarvuz"
            ) {
              variants.push(
                "Qovun-tarvuz",
                "Qovun tarvuz",
                "Qovun",
                "Tarvuz",
                "qovun-tarvuz",
                "qovun tarvuz",
                "qovun",
                "tarvuz",
              );
            }
            return variants;
          }),
        ),
      );
      const cropWhere = cropCandidates
        .map((value) => {
          const escaped = this.escapeArcGIS(value);
          return `(ekin_turi='${escaped}' OR UPPER(ekin_turi)='${escaped.toUpperCase()}')`;
        })
        .join(" OR ");
      if (cropWhere) clauses.push(`(${cropWhere})`);

      const hasField = (name: string): boolean =>
        featureLayerFields?.some(
          (f) => String(f).toLowerCase() === name.toLowerCase(),
        );

      if (hasField("viloyat") && viloyat) {
        const rawViloyat = String(viloyat || "").trim();
        const viloyatCandidates = new Set<string>(
          this.buildQuoteVariants(rawViloyat),
        );
        const withSuffix = /\sviloyati$/i.test(rawViloyat)
          ? rawViloyat
          : `${rawViloyat} viloyati`;
        const withoutSuffix = rawViloyat.replace(/\sviloyati$/i, "").trim();
        if (withSuffix) {
          this.buildQuoteVariants(withSuffix).forEach((v) =>
            viloyatCandidates.add(v),
          );
        }
        if (withoutSuffix) {
          this.buildQuoteVariants(withoutSuffix).forEach((v) =>
            viloyatCandidates.add(v),
          );
        }

        const viloyatWhere = Array.from(viloyatCandidates)
          .filter(Boolean)
          .map((v) => `viloyat='${this.escapeArcGIS(v)}'`)
          .join(" OR ");
        clauses.push(`(${viloyatWhere})`);
      }
      if (hasField("tuman") && tuman) {
        const tumanCandidates = this.buildQuoteVariants(tuman);
        const tumanWhere = tumanCandidates
          .map((v) => `tuman='${this.escapeArcGIS(v)}'`)
          .join(" OR ");
        clauses.push(
          `(${tumanWhere || `tuman='${this.escapeArcGIS(tuman)}'`})`,
        );
      }
      if (hasField("mavsum") && mavsum)
        clauses.push(`mavsum='${this.escapeArcGIS(mavsum)}'`);
      if (hasField("fermer_nom") && fermer_nom)
        clauses.push(`fermer_nom='${this.escapeArcGIS(fermer_nom)}'`);
      if (hasField("manba_nomi") && waterSource)
        clauses.push(`manba_nomi='${this.escapeArcGIS(waterSource)}'`);
      if (hasField("kanal_nomi") && canalName) {
        const resolvedCanalName = await this.resolveRawCanalName(canalName);
        const canalCandidates = Array.from(
          new Set(
            [canalName, resolvedCanalName]
              .map((v) => String(v || "").trim())
              .filter(Boolean),
          ),
        );
        const canalWhere = canalCandidates
          .map((value) => `kanal_nomi='${this.escapeArcGIS(value)}'`)
          .join(" OR ");
        if (canalWhere) clauses.push(`(${canalWhere})`);
      }
      if (hasField("min_max") && minMax) {
        const mm = String(minMax || "")
          .trim()
          .toLowerCase();
        if (mm === "both") {
          clauses.push(`(min_max='Min' OR min_max='Max')`);
        } else if (mm === "min" || mm === "max") {
          const title = mm === "min" ? "Min" : "Max";
          const escaped = this.escapeArcGIS(String(minMax));
          clauses.push(
            `(LOWER(min_max)='${mm}' OR min_max='${title}' OR min_max='${escaped}')`,
          );
        } else {
          const escaped = this.escapeArcGIS(String(minMax));
          clauses.push(`min_max='${escaped}'`);
        }
      }

      // ✅ year if provided & field exists
      const hasYil = featureLayerFields?.some((f) => f.toLowerCase() === "yil");
      let yilClause = "";
      if (hasYil && yil && /^\d{4}$/.test(yil)) {
        yilClause = `(yil=${Number(yil)} OR yil='${this.escapeArcGIS(yil)}')`;
        clauses.push(yilClause);
      }

      query.where = clauses.length ? clauses.join(" AND ") : "1=1";

      console.log("[EvapoCrop] Query for zoom:", query.where);

      let result = await featureLayer.queryExtent(query);

      // Fallback: if 0 results with yil, retry without yil (year-layer mode)
      if (result.count === 0 && yilClause && clauses.length > 1) {
        const clausesNoYil = clauses.filter((c) => c !== yilClause);
        query.where = clausesNoYil.join(" AND ");
        console.log("[EvapoCrop] Retrying zoom without yil:", query.where);
        result = await featureLayer.queryExtent(query);
      }

      console.log("[EvapoCrop] Query result:", {
        count: result.count,
        hasCrop: cropName,
      });

      const extent = result?.extent;
      const isValidExtent =
        !!extent &&
        [extent.xmin, extent.ymin, extent.xmax, extent.ymax].every((n: any) =>
          Number.isFinite(Number(n)),
        );

      if (isValidExtent && result.count > 0) {
        await activeMapView.view.goTo(result.extent.expand(1.3), {
          duration: 1000,
        });
      } else {
        console.warn("[EvapoCrop] No features found with query:", query.where);
        // Don't show error, just log warning - filter will still work
        console.log("[EvapoCrop] Zoom failed but filter is active");
      }
    } catch (error: any) {
      // Zoom failure should not block the UI - just log it
      console.warn("[EvapoCrop] Zoom failed (non-critical):", error.message);
    }
  };

  render() {
    const {
      loading,
      error,
      cropData,
      activeSlice,
      showTopN,
      isDarkTheme,
      waterSource,
      canalName,
      mapLoadingStatus,
      connectionStatus,
      mapConnectionAttempts,
      containerWidth,
      containerHeight,
      lang,
    } = this.state;

    const { crops } = cropData;

    const sortedCrops = [...crops].sort((a, b) => b.area_ha - a.area_ha);
    const topCrops = sortedCrops.slice(0, showTopN);

    const themeClass = !isDarkTheme ? "light-theme" : "";
    const sizeClass = this.getSizeClass();
    const layoutClass = this.getLayoutClass();

    const chartData = topCrops.map((crop, index) => ({
      name: translateCropName(lang as any, crop.ekin_turi),
      cropType: crop.ekin_turi,
      value: crop.area_ha,
      percentage: crop.percentage,
    }));

    // Build subtitle based on filters
    let subtitle = "";
    if (waterSource) {
      subtitle = waterSource;
      if (canalName) subtitle += ` → ${canalName}`;
    } else if (canalName) {
      subtitle = canalName;
    }

    // Get appropriate status indicator
    let statusIndicator = "idle";
    if (mapLoadingStatus === "loading") {
      statusIndicator = "loading";
    } else if (
      mapLoadingStatus === "loaded" &&
      connectionStatus === "connecting"
    ) {
      statusIndicator = "connecting";
    } else if (connectionStatus === "connected") {
      statusIndicator = "connected";
    } else if (mapLoadingStatus === "failed" || connectionStatus === "failed") {
      statusIndicator = "failed";
    }

    return (
      <div
        ref={this.containerRef}
        className={`crop-donut-card ${themeClass} ${sizeClass} ${layoutClass}`.trim()}
      >
        {/* Map Layer - hidden in the background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0,
          }}
        >
          <JimuMapViewComponent
            useMapWidgetId={this.props.useMapWidgetIds?.[0]}
            onActiveViewChange={this.onActiveViewChange}
          />
        </div>

        {/* Content Container */}
        <div className="crop-donut-content">
          {/* Header with title */}
          <div className="crop-donut-header">
            <div className="crop-donut-title">
              {subtitle && (
                <span className="crop-donut-subtitle">{` (${subtitle})`}</span>
              )}
            </div>
          </div>

          {/* Map loading status display */}
          {mapLoadingStatus === "loading" ? (
            <div className="crop-donut-loading-container">
              <Loading type={LoadingType.Secondary} />
              <p>{t(lang as any, "status.loading")}</p>
            </div>
          ) : mapLoadingStatus === "loaded" &&
            connectionStatus === "connecting" ? (
            <div className="crop-donut-loading-container">
              <Loading type={LoadingType.Secondary} />
              <p>{t(lang as any, "status.loading")}</p>
            </div>
          ) : connectionStatus === "connected" && loading ? (
            <div className="crop-donut-loading-container">
              <Loading type={LoadingType.Secondary} />
              <p>{t(lang as any, "status.loading")}</p>
            </div>
          ) : mapLoadingStatus === "failed" || connectionStatus === "failed" ? (
            <div className="crop-donut-error">
              <p>{error || t(lang as any, "status.error")}</p>
              <Button
                onClick={this.retryMapConnection}
                type="primary"
                size="sm"
              >
                {t(lang as any, "button.retry")}
              </Button>
            </div>
          ) : error ? (
            <div className="crop-donut-error">
              <p>{error}</p>
              <Button onClick={this.fetchCropData} type="primary" size="sm">
                {t(lang as any, "button.retry")}
              </Button>
            </div>
          ) : connectionStatus === "connected" && crops.length === 0 ? (
            <div className="crop-donut-no-data">
              <h3>{t(lang as any, "evapoCrop.noData")}</h3>
              <p>{t(lang as any, "status.noData")}</p>
              <Button onClick={this.fetchCropData} type="secondary" size="sm">
                {t(lang as any, "button.refresh")}
              </Button>
            </div>
          ) : connectionStatus === "connected" ? (
            this.renderCardView()
          ) : (
            <div className="crop-donut-loading-container">
              <p>{t(lang as any, "status.loading")}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
