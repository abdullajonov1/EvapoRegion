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
  t,
  translateCropName,
} from "./messages";

const DEFAULT_INITIAL_YEAR = "2025";

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

  // Add abort controller for fetch operations
  private fetchAbortController: AbortController | null = null;
  private externalRefreshTimer: number | null = null;

  // Connection constants
  MAX_CONNECTION_ATTEMPTS = 3;

  // Define the allowed crops to display
  ALLOWED_CROPS = [
    "Bug'doy",
    "Paxta",
    "Makkajo'xori",
    "Bog'lar",
    "Bog'",
    "Mosh",
    "Sholi",
    "Beda",
  ];

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
    this.setState(
      {
        viloyat: "",
        tuman: "",
        mavsum: "",
        fermer_nom: "",
        waterSource: "",
        canalName: "",
        selectedCrop: null,
        activeSlice: null,
        error: null,
      },
      () => {
        if (this.state.connectionStatus === "connected") {
          this.fetchCropData();
        }
      },
    );
  };

  constructor(props) {
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
      viloyat: "",
      tuman: "",
      mavsum: "",
      fermer_nom: "",
      waterSource: "",
      canalName: "",

      activeSlice: null,
      showTopN: 7, // Show top 7 crops by default
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
  handleMinMaxSelection = (event): void => {
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

    if (this.state.connectionStatus !== "connected") {
      this.setState({
        minMax: minMax,
        lastMinMaxEventTimestamp: timestamp,
      });
      return;
    }

    this.setState(
      {
        minMax: nextMinMax,
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
      this.setState({
        error: `Error initializing map: ${err.message}`,
        mapLoadingStatus: err.message.includes("timeout")
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
      this.setState({
        error: `Error retrieving layer fields: ${err.message}`,
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
    const lang = this.state?.lang || "uz_lat";
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
    const lang = this.state?.lang || "uz_lat";
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

    if (selectedCrop && activeMapView && !this.state.isHandlingExternalEvent) {
      this.zoomToSelectedCrop(selectedCrop);
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

    // Language change listener
    document.addEventListener("languageChanged", this.handleLanguageChange);

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

    // Listen for language changes
    document.addEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );
    document.addEventListener(
      "appLanguageChanged",
      this.handleLanguageChange as EventListener,
    );
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

  // Handle canal selection
  handlecanalselection = async (event): Promise<void> => {
    if (event && event.detail) {
      const { timestamp = 0, source } = event.detail;
      const incomingCanal = String(
        event.detail?.kanal_nomi ?? event.detail?.canalName ?? "",
      ).trim();
      const canalName = await this.resolveRawCanalName(incomingCanal);
      const nextCanalName = String(canalName || "").trim();
      const prevCanalName = String(this.state.canalName || "").trim();
      const currentCrop = this.state.selectedCrop;

      if (
        timestamp <= this.state.lastCanalEventTimestamp ||
        source === "CropDistributionWidget"
      ) {
        return;
      }

      // Ignore unresolved non-empty canal values to avoid dropping active filters.
      if (incomingCanal && !canalName) {
        return;
      }

      if (nextCanalName === prevCanalName) {
        return;
      }

      if (this.state.connectionStatus !== "connected") {
        this.setState({
          canalName: canalName || "",
          lastCanalEventTimestamp: timestamp,
        });
        return;
      }

      this.setState(
        {
          canalName: nextCanalName,
          lastCanalEventTimestamp: timestamp,
          isHandlingExternalEvent: true,
          selectedCrop: currentCrop,
          error: null,
        },
        () => {
          this.scheduleExternalFetch();

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

  // Component update handling
  componentDidUpdate(prevProps, prevState) {
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
  handleMasterStateUpdate = (event) => {
    if (!event?.detail || event.detail.source !== "MasterController") return;

    const m = event.detail;
    const currentCrop = this.state.selectedCrop;

    this.setState(
      {
        viloyat: m.viloyat || "",
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

  handleFilterChange = (event): void => {
    const { detail: filters } = event;
    if (!filters || filters.source === "CropDistributionWidget") return;

    const currentCrop = this.state.selectedCrop;

    const incomingFermer = filters.fermer_nomNom ?? filters.fermer_nom ?? "";

    if (this.state.connectionStatus !== "connected") {
      this.setState({
        viloyat: filters.viloyat || "",
        tuman: filters.tuman || "",
        mavsum: filters.mavsum || "",
        fermer_nom: incomingFermer,
        // ✅ year
        yil: this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR,
        selectedCrop: currentCrop,
        activeSlice: null,
      });
      return;
    }

    // Check if only fermer_nom changed
    const fermerChanged = incomingFermer !== this.state.fermer_nom;
    const otherFiltersChanged =
      filters.viloyat !== this.state.viloyat ||
      filters.tuman !== this.state.tuman ||
      filters.mavsum !== this.state.mavsum ||
      (this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR) !==
        this.state.yil;

    // Fermer-only changes still must refresh API data for correct crop totals.
    const shouldRefetch = fermerChanged || otherFiltersChanged;
    if (!shouldRefetch) return;

    this.setState(
      {
        viloyat: filters.viloyat || "",
        tuman: filters.tuman || "",
        mavsum: filters.mavsum || "",
        fermer_nom: incomingFermer,
        // ✅ year
        yil: this.normalizeYearValue(filters.yil) || DEFAULT_INITIAL_YEAR,
        selectedCrop: currentCrop,
        activeSlice: null,
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

    // Language change listener cleanup
    document.removeEventListener("languageChanged", this.handleLanguageChange);

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
    const currentCrop = this.state.selectedCrop;

    this.setState(
      { yil: incoming, selectedCrop: currentCrop, activeSlice: null },
      () => {
        this.fetchCropData();
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
    const currentCrop = this.state.selectedCrop;

    this.setState(
      { yil: incoming, selectedCrop: currentCrop, activeSlice: null },
      () => {
        this.fetchCropData();
      },
    );
  };

  // Handle water source change
  handleWaterSourceChange = (event): void => {
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

      const viloyat = p.get("viloyat") || "";
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
      this.setState({ error: `Error reading URL parameters: ${err.message}` });
    }
  };

  updateFiltersFromProps = async (filters): Promise<void> => {
    try {
      const currentCrop = this.state.selectedCrop;
      const incomingCanalName = filters.kanal_nomi || "";
      const resolvedCanalName = incomingCanalName
        ? await this.resolveRawCanalName(incomingCanalName)
        : "";

      if (this.state.connectionStatus !== "connected") {
        this.setState({
          viloyat: filters.viloyat || "",
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
        viloyat: filters.viloyat || "",
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
        error: null,
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
      this.setState({ error: `Error updating filters: ${err.message}` });
    }
  };

  // Handle slice click
  handleSliceClick = (data, index): void => {
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

    try {
      if (this.fetchAbortController) this.fetchAbortController.abort();
      this.fetchAbortController = new AbortController();
      const signal = this.fetchAbortController.signal;

      this.setState({ loading: true, error: null });

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
      if (minMax) queryParams.append("min_max", minMax);
      // ✅ YEAR to API
      if (yil && /^\d{4}$/.test(yil)) queryParams.append("yil", yil);

      const apiUrl = `https://sgm.uzspace.uz/api/v1/crop/distribution?${queryParams.toString()}`;

      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          signal,
        });
        if (signal.aborted) return;
        if (!response.ok)
          throw new Error(`API request failed with status ${response.status}`);

        const data: CropDistributionResponse = await response.json();
        if (signal.aborted) return;

        let crops = (data.crop_distribution || []).filter(
          (c) =>
            c.area_ha > 0 &&
            c.ekin_turi &&
            this.ALLOWED_CROPS.includes(c.ekin_turi),
        );

        const totalArea = crops.reduce((s, c) => s + c.area_ha, 0);
        crops = crops.map((c) => ({
          ...c,
          percentage: totalArea > 0 ? (c.area_ha / totalArea) * 100 : 0,
        }));

        if (!this._isMounted) return;

        let newActiveSlice: number | null = null;
        let newSelectedCrop: string | null = null;

        if (this.state.selectedCrop) {
          const idx = crops.findIndex(
            (c) => c.ekin_turi === this.state.selectedCrop,
          );
          if (idx !== -1) {
            newActiveSlice = idx;
            newSelectedCrop = this.state.selectedCrop;
          }
        }

        this.setState(
          {
            cropData: { crops, totalArea },
            loading: false,
            error: null,
            activeSlice: newActiveSlice,
            selectedCrop: newSelectedCrop,
          },
          () => {
            this.applyCropFilter();
            if (this.state.selectedCrop !== newSelectedCrop)
              this.notifyCropSelection();
          },
        );
      } catch (fetchError: any) {
        if (fetchError.name === "AbortError") return;
        throw new Error(`Network error: ${fetchError.message}`);
      }
    } catch (error: any) {
      if (this._isMounted) {
        this.setState({
          error: `Failed to fetch crop distribution data: ${error.message}`,
          loading: false,
        });
      }
    } finally {
      this.fetchAbortController = null;
    }
  };

  // Format percentage
  formatPercentage = (value: number): string => {
    return value.toFixed(1) + "%";
  };

  // Custom tooltip for pie chart
  renderCustomTooltip = (props): JSX.Element | null => {
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
  renderCustomLabel = (props): JSX.Element | null => {
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
    };
    return cropIcons[cropName] || "🌱";
  };

  // Render card view with dynamic responsive sizing
  renderCardView = () => {
    const { cropData, containerWidth, containerHeight, lang } = this.state;
    const { crops } = cropData;

    const sortedCrops = [...crops].sort((a, b) => b.area_ha - a.area_ha);

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
      iconSize,
      nameSize,
      areaValueSize,
      areaUnitSize,
      waterSize,
      cardPadding,
      elementGap,
      containerGap,
      containerPadding,
    } = sizes;

    // Check if vertical layout is needed
    const isVertical = this.getLayoutClass() === "layout-vertical";

    return (
      <div
        className="crop-cards-container"
        style={{
          gap: `${containerGap}px`,
          padding: `${containerPadding}px`,
          flexDirection: isVertical ? "column" : "row",
          overflowY: isVertical ? "auto" : "hidden",
          overflowX: "hidden",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {sortedCrops.map((crop, index) => {
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
              style={{
                flex: isVertical ? "0 0 auto" : "1 1 0",
                minWidth: 0,
                height: isVertical ? "auto" : "100%",
                padding: `${cardPadding}px`,
                gap: `${elementGap}px`,
                boxSizing: "border-box",
              }}
            >
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
                {this.formatNumber(crop.uw || crop.area_ha * 0.5)} m³
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  handleClearSelection = (event) => {
    if (event?.detail?.source === "EvapoWidget") {
      this.setState({
        selectedCrop: null,
        activeSlice: null,
      });
    }
  };

  // Handle crop selection
  handleCropSelection = (cropName: string) => {
    if (this.state.connectionStatus !== "connected") {
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

      const currentExpression = featureLayer.definitionExpression || "";
      const clauses: string[] = [];

      // keep any existing non-ekin_turi clause(s)
      if (currentExpression) {
        currentExpression.split(" AND ").forEach((cl) => {
          if (cl && !/ekin_turi|yil/i.test(cl)) clauses.push(cl);
        });
      }

      // Crop can be stored with apostrophe/backtick variants in some layers.
      const cropCandidates = Array.from(
        new Set(
          [mappedCropName, cropName].filter(Boolean).flatMap((value) => {
            const raw = String(value).trim();
            if (!raw) return [];
            const variants = [
              raw,
              raw.replace(/`/g, "'"),
              raw.replace(/'/g, "`"),
            ];
            if (/^mosh$/i.test(raw)) {
              variants.push("Mosh", "mosh", "Мош", "мош");
            }
            if (/^sholi$/i.test(raw)) {
              variants.push("Sholi", "sholi", "Шоли", "шоли");
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

      if (hasField("viloyat") && viloyat)
        clauses.push(`viloyat='${this.escapeArcGIS(viloyat)}'`);
      if (hasField("tuman") && tuman)
        clauses.push(`tuman='${this.escapeArcGIS(tuman)}'`);
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
        const escaped = this.escapeArcGIS(String(minMax));
        if (mm === "min" || mm === "max") {
          const title = mm === "min" ? "Min" : "Max";
          clauses.push(
            `(LOWER(min_max)='${mm}' OR min_max='${title}' OR min_max='${escaped}')`,
          );
        } else {
          clauses.push(`min_max='${escaped}'`);
        }
      }

      // ✅ year if provided & field exists
      const hasYil = featureLayerFields?.some((f) => f.toLowerCase() === "yil");
      if (hasYil && yil && /^\d{4}$/.test(yil)) {
        clauses.push(`(yil=${Number(yil)} OR yil='${this.escapeArcGIS(yil)}')`);
      }

      query.where = clauses.length ? clauses.join(" AND ") : "1=1";

      console.log("[EvapoCrop] Query for zoom:", query.where);

      const result = await featureLayer.queryExtent(query);
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
