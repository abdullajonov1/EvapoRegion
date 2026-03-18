/** @jsx jsx */
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import { jsx, React, type AllWidgetProps } from "jimu-core";
import { Button, Loading, LoadingType } from "jimu-ui";
import { getInitialLang, getInitialTheme, normalizeLang, t } from "./messages";
import "./water-canal.css";
/* eslint-disable @typescript-eslint/no-explicit-any */
const {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  LabelList,
} = require("recharts") as any;

/* ═══════ TYPES ═══════ */
interface WaterSource {
  manba_nomi: string;
  total_supply_m3: number;
  percentage?: number;
}

interface Canal {
  kanal_nomi: string;
  total_supply_m3: number;
  percentage?: number;
  index?: number;
}

/* ═══════ STATE ═══════ */
interface WaterCanalState {
  lang: string;
  isDarkTheme: boolean;

  // Filters
  viloyat: string;
  tuman: string;
  mavsum: string;
  ekinTuri: string;
  fermerNom: string;
  yil: string;
  minMax: string | null;
  lastMinMaxEventTimestamp: number;

  // Water Source
  sourceData: { sources: WaterSource[]; totalSupply: number };
  selectedSource: string | null;
  selectedSourceSnapshot: WaterSource | null;
  sourceLoading: boolean;
  sourceError: string | null;
  sourceSortOrder: "asc" | "desc";
  sourceDisplayCount: number;

  // Canal
  canalData: { canals: Canal[]; totalVolume: number };
  selectedCanal: string | null;
  selectedCanalSnapshot: Canal | null;
  selectedWaterSource: string;
  canalLoading: boolean;
  canalError: string | null;
  canalSortOrder: "asc" | "desc";
  canalDisplayCount: number;
  lastWaterSourceEventTimestamp: number;
  lastCanalEventTimestamp: number;

  // Map
  activeMapView: JimuMapView | undefined;
  featureLayer: any;
  featureLayerFields: string[];
  connectionStatus: "idle" | "connecting" | "connected" | "failed";
  mapLoadingStatus: "idle" | "loading" | "loaded" | "failed";
  mapConnectionAttempts: number;

  // UI
  containerHeight: number;
  containerWidth: number;
  isCompactMode: boolean;
  isHandlingExternalEvent: boolean;
}

/* ═══════ CONSTANTS ═══════ */
const LIGHT_CHART_BAR_COLOR = "#425c5a";
const DARK_CHART_BAR_COLOR = "#129dde";
const LIGHT_CHART_BAR_BACKGROUND = "rgba(228, 237, 236, 0.9)";
const DARK_CHART_BAR_BACKGROUND = "#293540";
const LIGHT_SELECTED_LABEL_TEXT = "#3d5755";
const DARK_SELECTED_LABEL_TEXT = "#129dde";
const NOVKANT_NAME = "novkant";
const DEFAULT_INITIAL_YEAR = "2025";

const MAX_CONNECTION_ATTEMPTS = 3;

/* ═══════ WIDGET CLASS ═══════ */
export default class EvapoWaterCanalV20 extends React.PureComponent<
  AllWidgetProps<any>,
  WaterCanalState
> {
  private _isMounted = false;
  private _dirTranslationReqId = 0;
  private _dirTranslationCache: Record<
    string,
    { source: Record<string, string>; canal: Record<string, string> }
  > = {};
  private fetchAbortController: AbortController | null = null;
  private externalRefreshTimer: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private containerRef = React.createRef<HTMLDivElement>();
  private _prevDefinitionExpression = "";

  private clearExternalRefreshTimer = (): void => {
    if (this.externalRefreshTimer !== null) {
      window.clearTimeout(this.externalRefreshTimer);
      this.externalRefreshTimer = null;
    }
  };

  private scheduleExternalDataFetch = (): void => {
    this.clearExternalRefreshTimer();
    this.externalRefreshTimer = window.setTimeout(() => {
      if (!this._isMounted) return;
      const viewType = this.props.config?.viewType || "waterSource";
      if (viewType === "waterSource") {
        this.fetchSourcesData();
      } else {
        this.fetchCanalData();
      }
    }, 120);
  };

  constructor(props: AllWidgetProps<any>) {
    super(props);
    // Initialize theme from DOM or default to dark
    const root = document.documentElement;
    const body = document.body;
    const isLight =
      root.classList.contains("light-theme") ||
      root.getAttribute("data-theme") === "light" ||
      body.classList.contains("light-theme");
    const initialIsDarkTheme = (() => {
      try {
        const saved =
          localStorage.getItem("app_theme") ||
          localStorage.getItem("evapo_app_theme");
        if (saved === "light") return false;
        if (saved === "dark") return true;
      } catch {
        // ignore storage errors
      }
      return getInitialTheme() ?? !isLight;
    })();
    this.state = {
      lang: getInitialLang(),
      isDarkTheme: initialIsDarkTheme,
      viloyat: "",
      tuman: "",
      mavsum: "",
      ekinTuri: "",
      fermerNom: "",
      yil: DEFAULT_INITIAL_YEAR,
      minMax: null,
      lastMinMaxEventTimestamp: 0,
      sourceData: { sources: [], totalSupply: 0 },
      selectedSource: null,
      selectedSourceSnapshot: null,
      sourceLoading: false,
      sourceError: null,
      sourceSortOrder: "desc",
      sourceDisplayCount: 7,
      canalData: { canals: [], totalVolume: 0 },
      selectedCanal: null,
      selectedCanalSnapshot: null,
      selectedWaterSource: "",
      canalLoading: false,
      canalError: null,
      canalSortOrder: "desc",
      canalDisplayCount: 10,
      lastWaterSourceEventTimestamp: 0,
      lastCanalEventTimestamp: 0,
      activeMapView: undefined,
      featureLayer: undefined,
      featureLayerFields: [],
      connectionStatus: "idle",
      mapLoadingStatus: "idle",
      mapConnectionAttempts: 0,
      containerHeight: 300,
      containerWidth: 400,
      isCompactMode: false,
      isHandlingExternalEvent: false,
    };
  }

  private isNovkantName = (value?: string | null): boolean => {
    return (
      String(value || "")
        .trim()
        .toLocaleLowerCase() === NOVKANT_NAME
    );
  };

  private getSortedWaterSources = (
    sources: WaterSource[],
    sortOrder: "asc" | "desc",
  ): WaterSource[] => {
    return [...sources].sort((a, b) => {
      const aIsNovkant = this.isNovkantName(a.manba_nomi);
      const bIsNovkant = this.isNovkantName(b.manba_nomi);

      if (aIsNovkant !== bIsNovkant) {
        return aIsNovkant ? 1 : -1;
      }

      return sortOrder === "asc"
        ? a.total_supply_m3 - b.total_supply_m3
        : b.total_supply_m3 - a.total_supply_m3;
    });
  };

  private getSortedCanals = (
    canals: Canal[],
    sortOrder: "asc" | "desc",
  ): Canal[] => {
    return [...canals].sort((a, b) => {
      const aIsNovkant = this.isNovkantName(a.kanal_nomi);
      const bIsNovkant = this.isNovkantName(b.kanal_nomi);

      if (aIsNovkant !== bIsNovkant) {
        return aIsNovkant ? 1 : -1;
      }

      return sortOrder === "asc"
        ? a.total_supply_m3 - b.total_supply_m3
        : b.total_supply_m3 - a.total_supply_m3;
    });
  };

  /* ═══════ LIFECYCLE ═══════ */
  componentDidMount(): void {
    this._isMounted = true;
    this.addEventListeners();
    this.setupResizeObserver();
    this.ensureDirectoryTranslationCache(this.state.lang);
    // Initialize theme from DOM on mount (in case it changed before mount)
    try {
      const savedTheme =
        localStorage.getItem("app_theme") ||
        localStorage.getItem("evapo_app_theme");
      const hasSavedTheme = savedTheme === "light" || savedTheme === "dark";
      if (!hasSavedTheme) return;

      const root = document.documentElement;
      const body = document.body;
      const isLight =
        root.classList.contains("light-theme") ||
        root.getAttribute("data-theme") === "light" ||
        body.classList.contains("light-theme");
      if (this.state.isDarkTheme === isLight) {
        this.setState({ isDarkTheme: !isLight });
      }
    } catch {}
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    this.removeEventListeners();
    this.clearExternalRefreshTimer();
    this.fetchAbortController?.abort();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  componentDidUpdate(prevProps: any, prevState: WaterCanalState): void {
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

    const { mapLoadingStatus, mapConnectionAttempts } = this.state;
    const { useMapWidgetIds } = this.props;
    if (
      (mapLoadingStatus === "failed" || mapLoadingStatus === "idle") &&
      useMapWidgetIds?.length > 0 &&
      !this.state.activeMapView &&
      mapConnectionAttempts !== prevState.mapConnectionAttempts
    ) {
      if (mapConnectionAttempts < MAX_CONNECTION_ATTEMPTS) {
        setTimeout(() => {
          if (this._isMounted) {
            this.setState((prev) => ({
              mapConnectionAttempts: prev.mapConnectionAttempts + 1,
              mapLoadingStatus: "idle" as const,
            }));
          }
        }, 2000);
      } else {
        this.setState({
          mapLoadingStatus: "failed",
          connectionStatus: "failed",
        });
      }
    }
  }

  /* ═══════ RESIZE OBSERVER ═══════ */
  private setupResizeObserver = (): void => {
    if (!this.containerRef.current) {
      requestAnimationFrame(() => this.setupResizeObserver());
      return;
    }
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && this._isMounted) {
        const height = entry.contentRect.height;
        const width = entry.contentRect.width;
        const isCompact = height < 250 || width < 280;
        this.setState({
          containerHeight: height,
          containerWidth: width,
          isCompactMode: isCompact,
        });
      }
    });
    this.resizeObserver.observe(this.containerRef.current);
  };

  private getResponsiveChartProps = (): {
    barSize: number;
    margin: { top: number; right: number; left: number; bottom: number };
    maxBarSize: number;
    fontSize: number;
    valueFontSize: number;
  } => {
    const { containerHeight: h, containerWidth: w, isCompactMode } = this.state;
    const viewType = this.props.config?.viewType || "waterSource";
    const displayCount =
      viewType === "waterSource"
        ? this.state.sourceDisplayCount
        : this.state.canalDisplayCount;

    // Reserve a stable value-label column so bars and values never overlap.
    const valueSpace = Math.max(126, Math.min(w * 0.44, 220));
    const availableHeight = h - 40;
    const spacePerBar = availableHeight / Math.max(displayCount, 1);
    const calculatedBarSize = Math.max(10, Math.min(spacePerBar * 0.68, 90));
    const topMargin = 16;

    if (isCompactMode || h < 180 || w < 220) {
      return {
        barSize: Math.max(14, calculatedBarSize * 1.2),
        margin: { top: topMargin + 6, right: valueSpace, left: 6, bottom: 4 },
        maxBarSize: Math.max(18, calculatedBarSize * 1.4),
        fontSize: 14,
        valueFontSize: 14,
      };
    } else if (h < 280 || w < 320) {
      return {
        barSize: calculatedBarSize * 1.15,
        margin: { top: topMargin + 5, right: valueSpace, left: 8, bottom: 5 },
        maxBarSize: calculatedBarSize * 1.3,
        fontSize: 13,
        valueFontSize: 13,
      };
    } else if (h < 380 || w < 420) {
      return {
        barSize: calculatedBarSize * 1.05,
        margin: { top: topMargin + 4, right: valueSpace, left: 10, bottom: 6 },
        maxBarSize: calculatedBarSize * 1.15,
        fontSize: 12,
        valueFontSize: 12,
      };
    } else if (h < 500 || w < 550) {
      return {
        barSize: calculatedBarSize,
        margin: { top: topMargin + 3, right: valueSpace, left: 12, bottom: 8 },
        maxBarSize: calculatedBarSize * 1.1,
        fontSize: 11,
        valueFontSize: 11,
      };
    } else if (h < 700 || w < 750) {
      return {
        barSize: calculatedBarSize * 0.9,
        margin: { top: topMargin + 2, right: valueSpace, left: 14, bottom: 10 },
        maxBarSize: calculatedBarSize * 1.0,
        fontSize: 10,
        valueFontSize: 10,
      };
    }
    return {
      barSize: calculatedBarSize * 0.85,
      margin: { top: topMargin, right: valueSpace, left: 16, bottom: 12 },
      maxBarSize: calculatedBarSize * 0.95,
      fontSize: 9,
      valueFontSize: 9,
    };
  };

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
    const showEdgeWave = safeWidth > 12;
    const ampMain = Math.max(1.1, Math.min(2.8, safeHeight * 0.16));
    const ampFine = Math.max(0.7, Math.min(1.9, safeHeight * 0.1));
    const segmentCount = Math.max(
      10,
      Math.min(26, Math.round(safeHeight / 2.2)),
    );
    const edgeX = x + safeWidth;
    const clipId = `wc-wave-${index}-${Math.round(y)}`;

    const buildWaveEdge = (phase: number, amp: number, driftX = 0): string => {
      let d = `M ${edgeX + driftX} ${y}`;
      const waveFreq = (Math.PI * 2) / Math.max(6, segmentCount - 1);
      for (let i = 1; i < segmentCount; i++) {
        const py = y + (safeHeight * i) / (segmentCount - 1);
        const wobble = Math.sin(i * waveFreq + phase) * amp;
        const px = edgeX + driftX + wobble;
        d += ` L ${px} ${py}`;
      }
      return d;
    };

    const waveEdgeA = buildWaveEdge(0, ampMain);
    const waveEdgeB = buildWaveEdge(Math.PI / 2, ampMain);
    const waveEdgeC = buildWaveEdge(Math.PI, ampMain);
    const waveEdgeD = buildWaveEdge((Math.PI * 3) / 2, ampMain);

    const foamEdgeA = buildWaveEdge(Math.PI / 4, ampFine, -0.6);
    const foamEdgeB = buildWaveEdge((Math.PI * 3) / 4, ampFine, -0.6);
    const foamEdgeC = buildWaveEdge((Math.PI * 5) / 4, ampFine, -0.6);
    const foamEdgeD = buildWaveEdge((Math.PI * 7) / 4, ampFine, -0.6);

    const toFillPath = (edgePath: string): string =>
      `M ${x} ${y} H ${edgeX}${edgePath.slice(`M ${edgeX} ${y}`.length)} L ${x} ${y + safeHeight} Z`;

    const fillPathA = toFillPath(waveEdgeA);
    const fillPathB = toFillPath(waveEdgeB);
    const fillPathC = toFillPath(waveEdgeC);
    const fillPathD = toFillPath(waveEdgeD);

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
                : `M ${x} ${y} H ${edgeX} V ${y + safeHeight} H ${x} Z`
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
              d={waveEdgeA}
              fill="none"
              stroke="rgba(238, 252, 255, 0.84)"
              strokeWidth={1.1}
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values={`${waveEdgeA};${waveEdgeB};${waveEdgeC};${waveEdgeD};${waveEdgeA}`}
                dur="2.6s"
                repeatCount="indefinite"
              />
            </path>
          )}
          {showEdgeWave && (
            <path
              d={foamEdgeA}
              fill="none"
              stroke="rgba(193, 241, 255, 0.64)"
              strokeWidth={0.9}
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values={`${foamEdgeA};${foamEdgeB};${foamEdgeC};${foamEdgeD};${foamEdgeA}`}
                dur="3.4s"
                repeatCount="indefinite"
              />
            </path>
          )}
        </g>
      </g>
    );
  };

  /* ═══════ EVENT LISTENERS ═══════ */
  private addEventListeners(): void {
    document.addEventListener("languageChanged", this.onLanguageChanged);
    document.addEventListener(
      "themeChanged",
      this.handleThemeChange as EventListener,
    );
    document.addEventListener(
      "themeToggled",
      this.handleThemeChange as EventListener,
    );
    document.addEventListener("waterSupplyFilterChanged", this.onFilterChanged);
    document.addEventListener("cropSelected", this.onCropSelected);
    document.addEventListener(
      "waterSourceSelected",
      this.onWaterSourceSelected,
    );
    document.addEventListener("canalselected", this.onCanalSelected);
    document.addEventListener("minMaxSelected", this.onMinMaxSelected);
    document.addEventListener("yilChanged", this.onYilChanged);
    document.addEventListener("constructionYearChanged", this.onYilChanged);
    document.addEventListener("resetAllWidgets", this.onResetAll, true);
    document.addEventListener("masterStateUpdate", this.onMasterStateUpdate);
    document.addEventListener(
      "clearWaterSourceSelection",
      this.onClearWaterSource,
    );
    document.addEventListener("clearCanalSelection", this.onClearCanal);
    document.addEventListener("clearCropSelection", this.onClearCrop);
    document.addEventListener(
      "regionDependentFiltersReset",
      this.onRegionDependentFiltersReset,
    );
    window.addEventListener("popstate", this.onPopState);
  }

  private removeEventListeners(): void {
    document.removeEventListener("languageChanged", this.onLanguageChanged);
    document.removeEventListener(
      "themeChanged",
      this.handleThemeChange as EventListener,
    );
    document.removeEventListener(
      "themeToggled",
      this.handleThemeChange as EventListener,
    );
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
    document.removeEventListener("constructionYearChanged", this.onYilChanged);
    document.removeEventListener("resetAllWidgets", this.onResetAll, true);
    document.removeEventListener("masterStateUpdate", this.onMasterStateUpdate);
    document.removeEventListener(
      "clearWaterSourceSelection",
      this.onClearWaterSource,
    );
    document.removeEventListener("clearCanalSelection", this.onClearCanal);
    document.removeEventListener("clearCropSelection", this.onClearCrop);
    document.removeEventListener(
      "regionDependentFiltersReset",
      this.onRegionDependentFiltersReset,
    );
    window.removeEventListener("popstate", this.onPopState);
  }

  /* ═══════ EVENT HANDLERS ═══════ */
  private onLanguageChanged = (e: any): void => {
    const raw = e?.detail?.language || e?.detail?.lang || e?.detail?.code || "";
    const lang = normalizeLang(raw);
    if (this._isMounted && lang !== this.state.lang) {
      try {
        localStorage.setItem("app_lang", lang);
        localStorage.setItem("evapo_app_lang", lang);
      } catch {
        // ignore storage errors
      }
      this.setState({ lang }, () => {
        this.ensureDirectoryTranslationCache(lang);
      });
    }
  };

  private handleThemeChange = (event: any): void => {
    if (!this._isMounted) return;
    try {
      const d: any = (event as CustomEvent)?.detail || {};

      if (typeof d.isDarkTheme === "boolean") {
        try {
          const theme = d.isDarkTheme ? "dark" : "light";
          localStorage.setItem("app_theme", theme);
          localStorage.setItem("evapo_app_theme", theme);
        } catch {
          // ignore storage errors
        }
        this.setState({ isDarkTheme: d.isDarkTheme });
        return;
      }

      if (typeof d.theme === "string") {
        const isLight = String(d.theme).toLowerCase() === "light";
        try {
          const theme = isLight ? "light" : "dark";
          localStorage.setItem("app_theme", theme);
          localStorage.setItem("evapo_app_theme", theme);
        } catch {
          // ignore storage errors
        }
        this.setState({ isDarkTheme: !isLight });
        return;
      }

      // Fallback: infer from DOM classes
      const root = document.documentElement;
      const body = document.body;
      const isLight =
        root.classList.contains("light-theme") ||
        root.getAttribute("data-theme") === "light" ||
        body.classList.contains("light-theme");
      try {
        const theme = isLight ? "light" : "dark";
        localStorage.setItem("app_theme", theme);
        localStorage.setItem("evapo_app_theme", theme);
      } catch {
        // ignore storage errors
      }
      this.setState({ isDarkTheme: !isLight });
    } catch {}
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

  private normalizeLookupKey(value: string): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  private getApiLangForDirectories(lang: string): "uz" | "kir" | "ru" {
    if (lang === "ru") return "ru";
    if (lang === "uz_cyrl") return "kir";
    return "uz";
  }

  private async fetchDirectoryList(
    key: "Water source" | "Canal" | "Canals",
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

  private buildTranslationMap(
    base: string[],
    target: string[],
  ): Record<string, string> {
    const out: Record<string, string> = {};
    const n = Math.min(base.length, target.length);
    for (let i = 0; i < n; i++) {
      const from = this.normalizeLookupKey(base[i]);
      const to = String(target[i] ?? "").trim();
      if (from && to) out[from] = to;
    }
    return out;
  }

  private transliterateUzLatinToCyrillic(input: string): string {
    let text = String(input ?? "");
    const normalizedApostrophe = /[‘’`ʻʼʹˈ]/g;
    text = text.replace(normalizedApostrophe, "'");

    const wordPairs: Array<[RegExp, string]> = [
      [/O'/g, "Ў"],
      [/o'/g, "ў"],
      [/G'/g, "Ғ"],
      [/g'/g, "ғ"],
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
  }

  private transliterateUzLatinToRussian(input: string): string {
    let text = String(input ?? "");
    const normalizedApostrophe = /[‘’`ʻʼʹˈ]/g;
    text = text.replace(normalizedApostrophe, "'");

    const wordPairs: Array<[RegExp, string]> = [
      [/O'/g, "У"],
      [/o'/g, "у"],
      [/G'/g, "Г"],
      [/g'/g, "г"],
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
      H: "Х",
      h: "х",
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
      Q: "К",
      q: "к",
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
    };

    return [...text].map((c) => charMap[c] ?? c).join("");
  }

  private async ensureDirectoryTranslationCache(lang: string): Promise<void> {
    if (lang === "uz_lat") return;

    const reqId = ++this._dirTranslationReqId;
    try {
      const [
        uzSources,
        uzCanals,
        targetSources,
        targetCanals,
        targetCanalsAlt,
      ] = await Promise.all([
        this.fetchDirectoryList("Water source", "uz"),
        this.fetchDirectoryList("Canal", "uz"),
        this.fetchDirectoryList(
          "Water source",
          this.getApiLangForDirectories(lang),
        ),
        this.fetchDirectoryList("Canal", this.getApiLangForDirectories(lang)),
        this.fetchDirectoryList("Canals", this.getApiLangForDirectories(lang)),
      ]);

      if (reqId !== this._dirTranslationReqId) return;

      const canalTarget = targetCanals.length ? targetCanals : targetCanalsAlt;

      this._dirTranslationCache[lang] = {
        source: this.buildTranslationMap(uzSources, targetSources),
        canal: this.buildTranslationMap(uzCanals, canalTarget),
      };

      if (this._isMounted) this.forceUpdate();
    } catch {
      // keep fallback behavior
    }
  }

  private getLocalizedName(kind: "source" | "canal", rawValue: string): string {
    const value = String(rawValue ?? "").trim();
    if (!value) return value;

    const lang = this.state.lang;
    if (lang === "uz_lat") return value;

    const normalized = this.normalizeLookupKey(value);
    const translated = this._dirTranslationCache[lang]?.[kind]?.[normalized];
    if (translated) return translated;

    // UI-only fallback: keep backend raw value untouched and localize only on render.
    if (lang === "uz_cyrl") {
      return this.transliterateUzLatinToCyrillic(value);
    }
    if (lang === "ru") return this.transliterateUzLatinToRussian(value);
    return value;
  }

  private resolveRawNameFromList(
    kind: "source" | "canal",
    incomingValue: any,
    rawNames: string[],
  ): string {
    const value = String(incomingValue ?? "").trim();
    if (!value) return "";

    const cleanedRawNames = rawNames
      .map((name) => String(name ?? "").trim())
      .filter(Boolean);

    // Fast path: already a raw value.
    const exact = cleanedRawNames.find((raw) => raw === value);
    if (exact) return exact;

    const normalizedIncoming = this.normalizeLookupKey(value);
    const byNormalizedRaw = cleanedRawNames.find(
      (raw) => this.normalizeLookupKey(raw) === normalizedIncoming,
    );
    if (byNormalizedRaw) return byNormalizedRaw;

    // If event/url brought a localized value, map it back to raw value.
    const byLocalized = cleanedRawNames.find(
      (raw) =>
        this.normalizeLookupKey(this.getLocalizedName(kind, raw)) ===
        normalizedIncoming,
    );
    if (byLocalized) return byLocalized;

    return value;
  }

  private resolveRawName(kind: "source" | "canal", incomingValue: any): string {
    const rawNames =
      kind === "source"
        ? this.state.sourceData.sources.map((s) => s.manba_nomi)
        : this.state.canalData.canals.map((c) => c.kanal_nomi);
    return this.resolveRawNameFromList(kind, incomingValue, rawNames);
  }

  private normalizeMavsumValue(value: any): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  private normalizeMavsumForApi(value: any): string {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    const normalized = this.normalizeMavsumValue(raw);

    const isUmumiy =
      normalized === "umumiy" ||
      normalized === "умумий" ||
      normalized === "общий" ||
      normalized === "mavsum" ||
      normalized === "mavsumiy" ||
      normalized === "umummavsumiy" ||
      normalized === "umum mavsumiy";
    if (isUmumiy) return "";

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

    return raw;
  }

  private onFilterChanged = (e: any): void => {
    const d = e?.detail || {};
    // Only filter out events from this widget itself to prevent loops
    if (d.source === "EvapoWaterCanalV20") return;

    const viewType = this.props.config?.viewType || "waterSource";
    const newState: Partial<WaterCanalState> = {};
    if (d.viloyat !== undefined) newState.viloyat = d.viloyat || "";
    if (d.tuman !== undefined) newState.tuman = d.tuman || "";
    const incomingMavsum = d.mavsumRaw ?? d.mavsum;
    if (incomingMavsum !== undefined)
      newState.mavsum = this.normalizeMavsumForApi(incomingMavsum);
    if (
      d.ekin_turi !== undefined ||
      d.selectedCrop !== undefined ||
      d.cropType !== undefined
    ) {
      newState.ekinTuri = d.ekin_turi ?? d.selectedCrop ?? d.cropType ?? "";
    }
    if (d.fermer_nom !== undefined) newState.fermerNom = d.fermer_nom || "";
    if (d.fermer_nomNom !== undefined)
      newState.fermerNom = d.fermer_nomNom || "";
    if (d.yil !== undefined)
      newState.yil = this.normalizeYearValue(d.yil) || DEFAULT_INITIAL_YEAR;

    // When tuman changes, clear canal and water-source selections so the new
    // district's data is shown without stale filters (fixes async setState race).
    const tumanChanged =
      d.tuman !== undefined && (d.tuman || "") !== this.state.tuman;
    if (tumanChanged) {
      newState.selectedSource = null;
      (newState as any).selectedSourceSnapshot = null;
      newState.selectedWaterSource = "";
      newState.selectedCanal = null;
      (newState as any).selectedCanalSnapshot = null;
      newState.lastCanalEventTimestamp = 0;
      // Tuman changed: dependent filters must return to default state.
      newState.ekinTuri = "";
      newState.minMax = null;
      newState.lastMinMaxEventTimestamp = 0;
    }

    // When fermer_nom changes (and tuman did not change), also clear selections.
    const fermerNomChanged =
      !tumanChanged &&
      d.fermer_nom !== undefined &&
      (d.fermer_nom || "") !== (this.state.fermerNom || "");
    if (fermerNomChanged) {
      newState.selectedSource = null;
      (newState as any).selectedSourceSnapshot = null;
      newState.selectedWaterSource = "";
      newState.selectedCanal = null;
      (newState as any).selectedCanalSnapshot = null;
      newState.lastCanalEventTimestamp = 0;
      // Fermer changed: dependent filters must return to default state.
      newState.ekinTuri = "";
      newState.minMax = null;
      newState.lastMinMaxEventTimestamp = 0;
    }

    // Store filter state even if not connected yet;
    // only fetch when connected (matches original widget pattern).
    if (this.state.connectionStatus !== "connected") {
      this.setState(newState as any);
      return;
    }

    this.setState(newState as any, () => {
      if (viewType === "waterSource") {
        this.fetchSourcesData();
      } else {
        this.fetchCanalData();
      }
    });
  };

  private onCropSelected = (e: any): void => {
    const cropType = e?.detail?.cropType || e?.detail?.ekin_turi || "";
    if (cropType === this.state.ekinTuri) return; // Avoid duplicate fetches

    const viewType = this.props.config?.viewType || "waterSource";
    this.setState({ ekinTuri: cropType }, () => {
      if (viewType === "waterSource") {
        this.fetchSourcesData();
      } else {
        this.fetchCanalData();
      }
    });
  };

  private onWaterSourceSelected = (e: any): void => {
    const d = e?.detail || {};
    // Accept waterSourceSelected globally; skip only own broadcast for this instance.
    if (
      (d.source === "EvapoWaterCanalV20" ||
        d.originSource === "EvapoWaterCanalV20") &&
      d.widgetId === this.props.id
    ) {
      return;
    }

    const viewType = this.props.config?.viewType || "waterSource";
    const sourceName =
      d.sourceSelected || d.manba_nomi || d.manbaNomi || d.waterSource || "";
    const rawTimestamp = Number(d.timestamp);
    const hasTimestamp = Number.isFinite(rawTimestamp) && rawTimestamp > 0;
    const timestamp = hasTimestamp ? rawTimestamp : Date.now();
    const normalizedSourceName = this.resolveRawName("source", sourceName);
    const prevSourceName = String(this.state.selectedWaterSource || "").trim();

    // Both views respond but handle differently
    if (
      timestamp < this.state.lastWaterSourceEventTimestamp ||
      (timestamp === this.state.lastWaterSourceEventTimestamp &&
        normalizedSourceName === prevSourceName)
    )
      return;

    this.setState(
      {
        selectedWaterSource: normalizedSourceName,
        lastWaterSourceEventTimestamp: Math.max(
          this.state.lastWaterSourceEventTimestamp,
          timestamp,
        ),
        selectedCanal: null, // When water source changes, clear any canal selection
        selectedCanalSnapshot: null,
        lastCanalEventTimestamp: 0,
      },
      () => {
        // Propagate canal clear so other widgets/controllers don't keep stale canal filter
        document.dispatchEvent(
          new CustomEvent("canalselected", {
            detail: {
              canalName: null,
              kanal_nomi: "",
              isClear: true,
              suppressZoom: true,
              timestamp: Date.now(),
              source: "EvapoWaterCanalV20",
              originSource: "EvapoWaterCanalV20",
              widgetId: this.props.id,
            },
            bubbles: true,
          }),
        );

        // Canal view fetches canal data for the new water source
        // Water source view ignores this (it only displays sources)
        if (viewType === "canal") {
          this.fetchCanalData();
        }
      },
    );
  };

  private onCanalSelected = (e: any): void => {
    const d = e?.detail || {};
    // Accept canalselected globally; skip only own broadcast for this instance.
    if (
      (d.source === "EvapoWaterCanalV20" ||
        d.originSource === "EvapoWaterCanalV20") &&
      d.widgetId === this.props.id
    ) {
      return;
    }

    const viewType = this.props.config?.viewType || "waterSource";
    if (viewType === "waterSource") {
      // Water-source view should not react to canal selection events.
      return;
    }
    const rawCanalName = d.kanal_nomi ?? d.canalName ?? null;
    const canalName = this.resolveRawName("canal", rawCanalName);
    const rawTimestamp = Number(d.timestamp);
    const hasTimestamp = Number.isFinite(rawTimestamp) && rawTimestamp > 0;
    const timestamp = hasTimestamp ? rawTimestamp : Date.now();
    const prevCanalName = String(this.state.selectedCanal || "").trim();
    const nextCanalName = String(canalName || "").trim();

    if (
      timestamp < this.state.lastCanalEventTimestamp ||
      (timestamp === this.state.lastCanalEventTimestamp &&
        nextCanalName === prevCanalName)
    )
      return;

    if (nextCanalName === prevCanalName) {
      return;
    }

    this.setState(
      {
        lastCanalEventTimestamp: Math.max(
          this.state.lastCanalEventTimestamp,
          timestamp,
        ),
        selectedCanal: canalName || null,
        selectedCanalSnapshot: canalName
          ? this.state.canalData.canals.find(
              (c) => c.kanal_nomi === canalName,
            ) ||
            this.state.selectedCanalSnapshot || {
              kanal_nomi: canalName,
              total_supply_m3: 0,
              percentage: 0,
            }
          : null,
      },
      () => {
        // Canal view keeps local selection state only.
      },
    );
  };

  private onMinMaxSelected = (e: any): void => {
    const d = e?.detail || {};
    if (d.source === "EvapoWaterCanalV20") return;

    const minMax = d.minMax || d.min_max || d.value || null;
    const timestamp = d.timestamp || 0;
    if (timestamp <= this.state.lastMinMaxEventTimestamp) return;

    const prevMinMax = this.state.minMax || null;
    if (minMax === prevMinMax) return;

    this.setState({ minMax, lastMinMaxEventTimestamp: timestamp }, () => {
      this.scheduleExternalDataFetch();
    });
  };

  private onYilChanged = (e: any): void => {
    const d = e?.detail || {};
    if (d.source === "EvapoWaterCanalV20") return;

    const yil =
      this.normalizeYearValue(d.yil || d.year || d.constructionYear || "") ||
      DEFAULT_INITIAL_YEAR;
    if (yil === this.state.yil) return;

    const viewType = this.props.config?.viewType || "waterSource";
    // When year changes, clear selections because data set will change
    this.setState(
      {
        yil,
        selectedSource: null,
        selectedSourceSnapshot: null,
        selectedCanal: null,
        selectedCanalSnapshot: null,
      },
      () => {
        if (viewType === "waterSource") {
          this.fetchSourcesData();
        } else {
          this.fetchCanalData();
        }
      },
    );
  };

  private onResetAll = (): void => {
    this.setState(
      {
        viloyat: "",
        tuman: "",
        mavsum: "",
        ekinTuri: "",
        fermerNom: "",
        yil: DEFAULT_INITIAL_YEAR,
        minMax: null,
        selectedSource: null,
        selectedSourceSnapshot: null,
        selectedCanal: null,
        selectedCanalSnapshot: null,
        selectedWaterSource: "",
        sourceData: { sources: [], totalSupply: 0 },
        canalData: { canals: [], totalVolume: 0 },
        sourceError: null,
        canalError: null,
      },
      () => {
        const viewType = this.props.config?.viewType || "waterSource";
        if (this.state.connectionStatus === "connected") {
          if (viewType === "waterSource") {
            this.fetchSourcesData();
          } else {
            this.fetchCanalData();
          }
        }
      },
    );
  };

  private onMasterStateUpdate = (e: any): void => {
    const d = e?.detail || {};
    if (d.source !== "MasterController") return;
    const viewType = this.props.config?.viewType || "waterSource";
    this.setState(
      {
        viloyat: d.viloyat || "",
        tuman: d.tuman || "",
        mavsum: this.normalizeMavsumForApi(d.mavsumRaw ?? d.mavsum),
        ekinTuri: d.ekin_turi || "",
        fermerNom: d.fermer_nom || "",
        yil: this.normalizeYearValue(d.yil) || DEFAULT_INITIAL_YEAR,
        minMax: d.min_max || null,
        selectedSource: null,
        selectedSourceSnapshot: null,
        selectedCanal: null,
        selectedCanalSnapshot: null,
        selectedWaterSource: d.manba_nomi || "",
      },
      () => {
        if (viewType === "waterSource") {
          this.fetchSourcesData();
        } else {
          this.fetchCanalData();
        }
      },
    );
  };

  private onClearWaterSource = (e: any): void => {
    if (e?.detail?.source === "EvapoWidget") {
      this.setState({
        selectedSource: null,
        selectedSourceSnapshot: null,
        selectedWaterSource: "",
      });
    }
  };

  private onClearCanal = (e: any): void => {
    if (e?.detail?.source === "EvapoWidget") {
      this.setState({ selectedCanal: null, selectedCanalSnapshot: null });
    }
  };

  private onClearCrop = (e: any): void => {
    if (e?.detail?.source === "EvapoWidget") {
      this.setState({ ekinTuri: "" }, () => {
        const viewType = this.props.config?.viewType || "waterSource";
        if (viewType === "waterSource") {
          this.fetchSourcesData();
        } else {
          this.fetchCanalData();
        }
      });
    }
  };

  private onRegionDependentFiltersReset = (e: any): void => {
    if (e?.detail?.source !== "EvapoWidget") return;
    const reason = String(e?.detail?.reason || "");
    if (reason !== "tumanChanged" && reason !== "fermerChanged") return;

    const viewType = this.props.config?.viewType || "waterSource";
    this.setState(
      {
        selectedSource: null,
        selectedSourceSnapshot: null,
        selectedWaterSource: "",
        selectedCanal: null,
        selectedCanalSnapshot: null,
        lastCanalEventTimestamp: 0,
        ekinTuri: "",
        minMax: null,
        lastMinMaxEventTimestamp: 0,
      } as any,
      () => {
        if (viewType === "waterSource") {
          this.fetchSourcesData();
        } else {
          this.fetchCanalData();
        }
      },
    );
  };

  private onPopState = (): void => {
    this.readFiltersFromUrl(false);
  };

  private readFiltersFromUrl(includeSelectionFromUrl = false): void {
    try {
      if (this.state.connectionStatus !== "connected") return;
      const p = new URLSearchParams(window.location.search);
      const viewType = this.props.config?.viewType || "waterSource";
      const waterSourceFromUrl = includeSelectionFromUrl
        ? p.get("water_source") || null
        : null;
      const canalFromUrl = includeSelectionFromUrl
        ? p.get("canal_name") || null
        : null;
      this.setState(
        {
          viloyat: p.get("viloyat") || "",
          tuman: p.get("tuman") || "",
          mavsum: this.normalizeMavsumForApi(p.get("mavsum") || ""),
          ekinTuri: p.get("ekin_turi") || "",
          fermerNom: p.get("fermer_nom") || p.get("fermer_nomNom") || "",
          yil:
            this.normalizeYearValue(p.get("yil") || "") ||
            this.state.yil ||
            DEFAULT_INITIAL_YEAR,
          minMax: p.get("min_max") || null,
          selectedSource: includeSelectionFromUrl ? waterSourceFromUrl : null,
          selectedCanal: includeSelectionFromUrl ? canalFromUrl : null,
          selectedWaterSource: includeSelectionFromUrl
            ? waterSourceFromUrl || ""
            : "",
        },
        () => {
          if (viewType === "waterSource") {
            this.fetchSourcesData();
          } else {
            this.fetchCanalData();
          }
        },
      );
    } catch {
      /* ignore */
    }
  }

  /* ═══════ MAP CONNECTION ═══════ */
  private onActiveViewChange = async (
    jimuMapView: JimuMapView,
  ): Promise<void> => {
    if (!jimuMapView) {
      if (this.state.mapConnectionAttempts === 0) {
        this.setState({ mapLoadingStatus: "failed", mapConnectionAttempts: 1 });
      }
      return;
    }

    // Guard: skip re-initialization if already connected with same view
    if (
      this.state.connectionStatus === "connected" &&
      this.state.activeMapView === jimuMapView
    ) {
      return;
    }

    this.setState({ mapLoadingStatus: "loading" });
    try {
      // Wait for map to be ready
      if (!jimuMapView.view.ready) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("Map load timeout after 30 seconds")),
            30000,
          );
          const h = jimuMapView.view.watch("ready", (isReady: boolean) => {
            if (isReady) {
              clearTimeout(timeout);
              h.remove();
              resolve();
            }
          });
        });
      }

      this.setState({
        mapLoadingStatus: "loaded",
        connectionStatus: "connecting",
      });

      // Connect to feature layer
      const layers = jimuMapView.view.map.layers.toArray();
      const featureLayer = layers.find((l: any) => l.type === "feature");
      if (!featureLayer) throw new Error("No feature layers found in the map.");
      await (featureLayer as any).load();
      const fields = (featureLayer as any).fields.map((f: any) => f.name);

      this.setState({
        activeMapView: jimuMapView,
        featureLayer,
        featureLayerFields: fields,
        connectionStatus: "connected",
        sourceError: null,
        canalError: null,
      });
    } catch (err: any) {
      const errorPrefix = t(this.state.lang, "status.error");
      this.setState({
        sourceError: `${errorPrefix}: ${err?.message}`,
        canalError: `${errorPrefix}: ${err?.message}`,
        mapLoadingStatus: err?.message?.includes("timeout")
          ? "failed"
          : this.state.mapLoadingStatus,
        connectionStatus: "failed",
      });
    }
  };

  private initializeAfterConnection(): void {
    if (
      !this.state.activeMapView ||
      this.state.connectionStatus !== "connected"
    )
      return;

    // If event listeners missed initial broadcasts (mount order race),
    // hydrate core filters from URL once after connection.
    // Keep event-driven state untouched when it already has values.
    const hasAnyCoreFilter = !!(
      this.state.viloyat ||
      this.state.tuman ||
      this.state.mavsum ||
      this.state.ekinTuri ||
      this.state.fermerNom ||
      this.state.yil ||
      this.state.minMax
    );

    if (!hasAnyCoreFilter) {
      this.readFiltersFromUrl(false);
      return;
    }

    const viewType = this.props.config?.viewType || "waterSource";
    if (viewType === "waterSource") {
      this.fetchSourcesData();
    } else {
      this.fetchCanalData();
    }
  }

  private retryMapConnection = (): void => {
    this.setState({
      connectionStatus: "idle",
      mapLoadingStatus: "idle",
      mapConnectionAttempts: 0,
      sourceError: null,
      canalError: null,
    });
  };

  /* ═══════ DATA FETCHING — WATER SOURCE ═══════ */
  private fetchSourcesData = async (): Promise<void> => {
    if (this.state.connectionStatus !== "connected" || !this._isMounted) return;
    this.fetchAbortController?.abort();
    this.fetchAbortController = new AbortController();
    const signal = this.fetchAbortController.signal;

    this.setState({ sourceLoading: true, sourceError: null });

    try {
      const { viloyat, tuman, mavsum, ekinTuri, fermerNom, minMax, yil } =
        this.state;
      const normalizedMavsum = this.normalizeMavsumForApi(mavsum);
      const params = new URLSearchParams();
      if (viloyat) params.append("viloyat", viloyat);
      if (tuman) params.append("tuman", tuman);
      if (normalizedMavsum) params.append("mavsum", normalizedMavsum);
      if (ekinTuri) params.append("ekin_turi", ekinTuri);
      if (fermerNom) params.append("fermer_nom", fermerNom);
      if (minMax) params.append("min_max", minMax);
      if (yil && /^\d{4}$/.test(yil)) params.append("yil", yil);

      const url = `https://sgm.uzspace.uz/api/v1/water/sources?${params.toString()}`;
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal,
      });
      if (signal.aborted) return;
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (signal.aborted) return;

      let sources: WaterSource[] = (data.water_sources || []).filter(
        (s: any) => s.manba_nomi?.trim() && s.total_supply_m3 > 0,
      );
      const totalSupply = sources.reduce(
        (sum, s) => sum + s.total_supply_m3,
        0,
      );
      sources = sources.map((s) => ({
        ...s,
        percentage:
          totalSupply > 0 ? (s.total_supply_m3 / totalSupply) * 100 : 0,
      }));

      let newSelected: string | null = null;
      let newSelectedSnapshot: WaterSource | null =
        this.state.selectedSourceSnapshot;
      const resolvedSelectedSource = this.resolveRawNameFromList(
        "source",
        this.state.selectedSource,
        sources.map((s) => s.manba_nomi),
      );
      if (
        resolvedSelectedSource &&
        sources.some((s) => s.manba_nomi === resolvedSelectedSource)
      ) {
        newSelected = resolvedSelectedSource;
        newSelectedSnapshot =
          sources.find((s) => s.manba_nomi === resolvedSelectedSource) ?? null;
      } else {
        // IMPORTANT: if current selection does not exist in new filtered data,
        // reset to default (do not keep stale selection snapshot).
        newSelected = null;
        newSelectedSnapshot = null;
      }

      if (this._isMounted) {
        const prevSelected = this.state.selectedSource;
        this.setState(
          {
            sourceData: { sources, totalSupply },
            sourceLoading: false,
            sourceError: null,
            selectedSource: newSelected,
            selectedSourceSnapshot: newSelectedSnapshot,
          },
          () => {
            // If selection was cleared because item no longer exists in data,
            // notify other widgets so they don't keep stale source filter.
            if (prevSelected && !newSelected) {
              document.dispatchEvent(
                new CustomEvent("waterSourceSelected", {
                  detail: {
                    sourceSelected: "",
                    timestamp: Date.now(),
                    source: "WaterSourcesWidget",
                    originSource: "EvapoWaterCanalV20",
                    widgetId: this.props.id,
                    autoCleared: true,
                  },
                  bubbles: true,
                }),
              );
            }
          },
        );
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // Reset loading so UI doesn't get stuck in loading state
        if (this._isMounted) this.setState({ sourceLoading: false });
        return;
      }
      if (this._isMounted) {
        const errorPrefix = t(this.state.lang, "status.error");
        this.setState({
          sourceError: `${errorPrefix}: ${err?.message}`,
          sourceLoading: false,
        });
      }
    }
  };

  /* ═══════ DATA FETCHING — CANAL ═══════ */
  private fetchCanalData = async (): Promise<void> => {
    if (this.state.connectionStatus !== "connected" || !this._isMounted) return;
    this.fetchAbortController?.abort();
    this.fetchAbortController = new AbortController();
    const signal = this.fetchAbortController.signal;

    this.setState({ canalLoading: true, canalError: null });

    try {
      const {
        viloyat,
        tuman,
        mavsum,
        ekinTuri,
        fermerNom,
        selectedWaterSource,
        minMax,
        yil,
      } = this.state;

      const normalizedMavsum = this.normalizeMavsumForApi(mavsum);

      const params = new URLSearchParams();
      if (viloyat) params.append("viloyat", viloyat);
      if (tuman) params.append("tuman", tuman);
      if (normalizedMavsum) params.append("mavsum", normalizedMavsum);
      if (ekinTuri) params.append("ekin_turi", ekinTuri);
      if (fermerNom) params.append("fermer_nom", fermerNom);
      if (selectedWaterSource) params.append("manba_nomi", selectedWaterSource);
      if (minMax) params.append("min_max", minMax);
      if (yil && /^\d{4}$/.test(yil)) params.append("yil", yil);

      const url = `https://sgm.uzspace.uz/api/v1/water/canals?${params.toString()}`;
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal,
      });
      if (signal.aborted) return;
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (signal.aborted) return;

      let canals: Canal[] = (data?.canals ?? []).filter(
        (c: any) => c?.kanal_nomi?.trim() && Number(c.total_supply_m3) > 0,
      );
      const totalVolume = canals.reduce(
        (sum, c) => sum + Number(c.total_supply_m3 || 0),
        0,
      );
      canals = canals.map((c) => ({
        ...c,
        percentage:
          totalVolume > 0 ? (Number(c.total_supply_m3) / totalVolume) * 100 : 0,
      }));

      let newSelected: string | null = null;
      let newSelectedSnapshot: Canal | null = this.state.selectedCanalSnapshot;
      const resolvedSelectedCanal = this.resolveRawNameFromList(
        "canal",
        this.state.selectedCanal,
        canals.map((c) => c.kanal_nomi),
      );

      if (
        resolvedSelectedCanal &&
        canals.some((c) => c.kanal_nomi === resolvedSelectedCanal)
      ) {
        newSelected = resolvedSelectedCanal;
        newSelectedSnapshot =
          canals.find((c) => c.kanal_nomi === resolvedSelectedCanal) ?? null;
      } else {
        // IMPORTANT: if current selection does not exist in new filtered data,
        // reset to default (do not keep stale selection snapshot).
        newSelected = null;
        newSelectedSnapshot = null;
      }

      if (this._isMounted) {
        const prevSelected = this.state.selectedCanal;
        this.setState(
          {
            canalData: { canals, totalVolume },
            canalLoading: false,
            canalError: null,
            selectedCanal: newSelected,
            selectedCanalSnapshot: newSelectedSnapshot,
          },
          () => {
            // If selection was cleared because item no longer exists in data,
            // notify other widgets so they don't keep stale canal filter.
            if (prevSelected && !newSelected) {
              document.dispatchEvent(
                new CustomEvent("canalselected", {
                  detail: {
                    canalName: null,
                    kanal_nomi: "",
                    timestamp: Date.now(),
                    source: "CanalDataWidget",
                    originSource: "EvapoWaterCanalV20",
                    widgetId: this.props.id,
                    autoCleared: true,
                  },
                  bubbles: true,
                }),
              );
            }
          },
        );
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // Reset loading so UI doesn't get stuck in loading state
        if (this._isMounted) this.setState({ canalLoading: false });
        return;
      }
      if (this._isMounted) {
        const errorPrefix = t(this.state.lang, "status.error");
        this.setState({
          canalError: `${errorPrefix}: ${err?.message}`,
          canalLoading: false,
        });
      }
    }
  };

  /* ═══════ SELECTION & NOTIFICATION ═══════ */
  private handleSourceClick = (data: any): void => {
    if (this.state.connectionStatus !== "connected" || !data?.manba_nomi)
      return;
    const newSelection =
      data.manba_nomi === this.state.selectedSource ? null : data.manba_nomi;

    const selectedSnapshot = newSelection
      ? this.state.sourceData.sources.find(
          (s) => s.manba_nomi === newSelection,
        ) || {
          manba_nomi: newSelection,
          total_supply_m3: Number(data?.total_supply_m3 || 0),
          percentage: Number(data?.percentage || 0),
        }
      : null;

    this.setState(
      {
        selectedSource: newSelection,
        selectedSourceSnapshot: selectedSnapshot,
      },
      () => {
        const compatibilitySource = "WaterSourcesWidget";
        // Zoom
        if (newSelection)
          this.zoomToFeature("manba_nomi", newSelection, "waterSource");
        // Notify other widgets
        document.dispatchEvent(
          new CustomEvent("waterSourceSelected", {
            detail: {
              sourceSelected: newSelection || "",
              timestamp: Date.now(),
              source: compatibilitySource,
              originSource: "EvapoWaterCanalV20",
              widgetId: this.props.id,
            },
            bubbles: true,
          }),
        );
        this.updateUrl();
      },
    );
  };

  private handleCanalClick = (data: any): void => {
    if (this.state.connectionStatus !== "connected" || !data?.kanal_nomi)
      return;
    const newSelection =
      data.kanal_nomi === this.state.selectedCanal ? null : data.kanal_nomi;

    const selectedSnapshot = newSelection
      ? this.state.canalData.canals.find(
          (c) => c.kanal_nomi === newSelection,
        ) || {
          kanal_nomi: newSelection,
          total_supply_m3: Number(data?.total_supply_m3 || 0),
          percentage: Number(data?.percentage || 0),
        }
      : null;

    this.setState(
      { selectedCanal: newSelection, selectedCanalSnapshot: selectedSnapshot },
      () => {
        const compatibilitySource = "CanalDataWidget";
        // Zoom
        if (newSelection)
          this.zoomToFeature("kanal_nomi", newSelection, "canal");
        // Notify other widgets
        document.dispatchEvent(
          new CustomEvent("canalselected", {
            detail: {
              canalName: newSelection,
              kanal_nomi: newSelection || "",
              timestamp: Date.now(),
              source: compatibilitySource,
              originSource: "EvapoWaterCanalV20",
              widgetId: this.props.id,
            },
            bubbles: true,
          }),
        );
        this.updateUrl();
      },
    );
  };

  private async zoomToFeature(
    fieldName: string,
    value: string,
    priority: string,
  ): Promise<void> {
    const {
      featureLayer,
      featureLayerFields,
      viloyat,
      tuman,
      mavsum,
      ekinTuri,
      fermerNom,
      minMax,
      yil,
    } = this.state;
    if (!featureLayer) return;
    try {
      const query = featureLayer.createQuery();
      const hasField = (name: string): boolean =>
        featureLayerFields.some(
          (f) => String(f).toLowerCase() === name.toLowerCase(),
        );

      const clauses: string[] = [];
      clauses.push(`${fieldName}='${this.escapeArcGIS(value)}'`);

      if (hasField("viloyat") && viloyat)
        clauses.push(`viloyat='${this.escapeArcGIS(viloyat)}'`);
      if (hasField("tuman") && tuman)
        clauses.push(`tuman='${this.escapeArcGIS(tuman)}'`);

      const normalizedMavsum = this.normalizeMavsumForApi(mavsum);
      if (hasField("mavsum") && normalizedMavsum)
        clauses.push(`mavsum='${this.escapeArcGIS(normalizedMavsum)}'`);

      if (hasField("ekin_turi") && ekinTuri)
        clauses.push(`ekin_turi='${this.escapeArcGIS(ekinTuri)}'`);
      if (hasField("fermer_nom") && fermerNom)
        clauses.push(`fermer_nom='${this.escapeArcGIS(fermerNom)}'`);

      if (hasField("min_max") && minMax)
        clauses.push(`min_max='${this.escapeArcGIS(String(minMax))}'`);

      if (hasField("yil") && yil && /^\d{4}$/.test(yil)) {
        clauses.push(`yil=${Number(yil)}`);
      }

      query.where = clauses.join(" AND ");
      const result = await featureLayer.queryExtent(query);
      if (result?.extent) {
        document.dispatchEvent(
          new CustomEvent("zoomRequest", {
            detail: {
              extent: result.extent,
              priority,
              source: "EvapoWaterCanalV20",
              timestamp: Date.now(),
            },
            bubbles: true,
          }),
        );
      }
    } catch (err) {
      console.warn("[EvapoWaterCanalV20] Zoom error:", err);
    }
  }

  private updateUrl(): void {
    const { selectedSource, selectedCanal, minMax } = this.state;
    const viewType = this.props.config?.viewType || "waterSource";
    const params = new URLSearchParams(window.location.search);
    params.delete("water_source");
    params.delete("canal_name");
    if (minMax) params.set("min_max", minMax);
    else params.delete("min_max");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }

  /* ═══════ HELPERS ═══════ */
  private escapeArcGIS(value: string): string {
    return value ? value.replace(/'/g, "''") : "";
  }

  private formatNumber(num: number | null | undefined, decimals = 0): string {
    if (num === null || num === undefined) return "N/A";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /* ═══════ TOOLTIPS ═══════ */
  private renderSourceTooltip = (props: any): React.ReactNode => {
    const { active, payload } = props;
    const { lang } = this.state;
    if (active && payload?.length) {
      const data = payload[0].payload as WaterSource;
      const localizedName = this.getLocalizedName("source", data.manba_nomi);
      return (
        <div className="water-canal-tooltip">
          <div className="water-canal-tooltip-title">{localizedName}</div>
          <div className="water-canal-tooltip-content">
            <div className="water-canal-tooltip-row">
              <span className="water-canal-tooltip-label">
                {t(lang, "evapoCanal.volume")}:
              </span>
              <span className="water-canal-tooltip-value">
                {this.formatNumber(data.total_supply_m3)} m³
              </span>
            </div>
            <div className="water-canal-tooltip-row">
              <span className="water-canal-tooltip-label">
                {t(lang, "evapoCanal.percentage")}:
              </span>
              <span className="water-canal-tooltip-value">
                {(data.percentage || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  private renderCanalTooltip = (props: any): React.ReactNode => {
    const { active, payload } = props;
    const { lang } = this.state;
    if (active && payload?.length) {
      const data = payload[0].payload as Canal;
      const localizedName = this.getLocalizedName("canal", data.kanal_nomi);
      return (
        <div className="water-canal-tooltip">
          <div className="water-canal-tooltip-title">{localizedName}</div>
          <div className="water-canal-tooltip-content">
            <div className="water-canal-tooltip-row">
              <span className="water-canal-tooltip-label">
                {t(lang, "evapoCanal.volume")}:
              </span>
              <span className="water-canal-tooltip-value">
                {this.formatNumber(data.total_supply_m3)} m³
              </span>
            </div>
            <div className="water-canal-tooltip-row">
              <span className="water-canal-tooltip-label">
                {t(lang, "evapoCanal.percentage")}:
              </span>
              <span className="water-canal-tooltip-value">
                {(data.percentage || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  /* ═══════ RENDER ═══════ */
  render(): React.ReactNode {
    const viewType = this.props.config?.viewType || "waterSource";
    const {
      lang,
      isDarkTheme,
      connectionStatus,
      mapLoadingStatus,
      sourceLoading,
      sourceError,
      sourceData,
      selectedSource,
      sourceSortOrder,
      sourceDisplayCount,
      canalLoading,
      canalError,
      canalData,
      selectedCanal,
      canalSortOrder,
      canalDisplayCount,
      selectedWaterSource,
    } = this.state;
    const chartBarColor = isDarkTheme
      ? DARK_CHART_BAR_COLOR
      : LIGHT_CHART_BAR_COLOR;
    const chartBarBackgroundColor = isDarkTheme
      ? DARK_CHART_BAR_BACKGROUND
      : LIGHT_CHART_BAR_BACKGROUND;
    const selectedLabelTextColor = isDarkTheme
      ? DARK_SELECTED_LABEL_TEXT
      : LIGHT_SELECTED_LABEL_TEXT;

    // ─── Connection states ───
    const renderConnectionState = (): React.ReactNode => {
      if (mapLoadingStatus === "loading") {
        return (
          <div className="water-canal-loading-container">
            <Loading type={LoadingType.Secondary} />
            <p>{t(lang, "status.loading")}</p>
          </div>
        );
      }
      if (mapLoadingStatus === "loaded" && connectionStatus === "connecting") {
        return (
          <div className="water-canal-loading-container">
            <Loading type={LoadingType.Secondary} />
            <p>{t(lang, "status.loading")}</p>
          </div>
        );
      }
      if (mapLoadingStatus === "failed" || connectionStatus === "failed") {
        return (
          <div className="water-canal-error">
            <p>{t(lang, "status.error")}</p>
            <Button onClick={this.retryMapConnection} type="primary" size="sm">
              {t(lang, "button.retry")}
            </Button>
          </div>
        );
      }
      if (connectionStatus !== "connected") {
        return (
          <div className="water-canal-loading-container">
            <p>{t(lang, "status.loading")}</p>
          </div>
        );
      }
      return null;
    };

    const connState = renderConnectionState();
    if (connState) {
      return (
        <div className="water-canal-card">
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
              opacity: 0,
              pointerEvents: "auto",
            }}
          >
            <JimuMapViewComponent
              useMapWidgetId={this.props.useMapWidgetIds?.[0]}
              onActiveViewChange={this.onActiveViewChange}
            />
          </div>
          <div className="water-canal-content">{connState}</div>
        </div>
      );
    }

    /* ─── WATER SOURCE VIEW ─── */
    if (viewType === "waterSource") {
      const { sources } = sourceData;
      const sorted = this.getSortedWaterSources(sources, sourceSortOrder);
      const selectedSourceName = selectedSource || "";
      const sourceDisplayOrdered = selectedSourceName
        ? (() => {
            const selectedEntry = sorted.find(
              (s) => s.manba_nomi === selectedSourceName,
            );
            const pinnedEntry =
              selectedEntry ||
              (this.state.selectedSourceSnapshot?.manba_nomi ===
              selectedSourceName
                ? this.state.selectedSourceSnapshot
                : {
                    manba_nomi: selectedSourceName,
                    total_supply_m3: 0,
                    percentage: 0,
                  });

            if (!pinnedEntry) return sorted;

            const rest = sorted.filter(
              (s) => s.manba_nomi !== selectedSourceName,
            );
            return [pinnedEntry, ...rest];
          })()
        : sorted;

      const limited = sourceDisplayOrdered.slice(0, sourceDisplayCount);
      const waterMax = Math.max(
        ...limited.map((s) => s.total_supply_m3 || 0),
        1,
      );
      const sourceChartData = limited.map((s) => ({
        ...s,
        normalizedFill: (s.total_supply_m3 / waterMax) * 100,
      }));
      const chartProps = this.getResponsiveChartProps();

      return (
        <div className="water-canal-card">
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
              opacity: 0,
              pointerEvents: "auto",
            }}
          >
            <JimuMapViewComponent
              useMapWidgetId={this.props.useMapWidgetIds?.[0]}
              onActiveViewChange={this.onActiveViewChange}
            />
          </div>
          <div className="water-canal-content">
            <div className="water-canal-header">
              <div className="water-canal-header-title">
                {t(lang, "evapoWaterSource.title")}
              </div>
              <div className="water-canal-header-controls">
                <div className="water-canal-sort-buttons">
                  <button
                    className={`water-canal-sort-button ${sourceSortOrder === "desc" ? "active" : ""}`}
                    onClick={() => this.setState({ sourceSortOrder: "desc" })}
                    title={t(lang, "button.sort")}
                  >
                    ↓
                  </button>
                  <button
                    className={`water-canal-sort-button ${sourceSortOrder === "asc" ? "active" : ""}`}
                    onClick={() => this.setState({ sourceSortOrder: "asc" })}
                    title={t(lang, "button.sort")}
                  >
                    ↑
                  </button>
                </div>
                <select
                  className="water-canal-display-count"
                  value={sourceDisplayCount}
                  onChange={(e) =>
                    this.setState({
                      sourceDisplayCount: parseInt(e.target.value, 10),
                    })
                  }
                >
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>
            </div>

            {sourceLoading ? (
              <div className="water-canal-loading-container">
                <Loading type={LoadingType.Secondary} />
                <p>{t(lang, "status.loading")}</p>
              </div>
            ) : sourceError ? (
              <div className="water-canal-error">
                <p>{sourceError}</p>
                <Button
                  onClick={this.fetchSourcesData}
                  type="primary"
                  size="sm"
                >
                  {t(lang, "button.retry")}
                </Button>
              </div>
            ) : sources.length === 0 ? (
              <div className="water-canal-no-data">
                <h3>{t(lang, "status.noData")}</h3>
                <p>{t(lang, "evapoWaterSource.noData")}</p>
                <Button
                  onClick={this.fetchSourcesData}
                  type="secondary"
                  size="sm"
                >
                  {t(lang, "button.refresh")}
                </Button>
              </div>
            ) : (
              <div
                ref={this.containerRef}
                className={`water-canal-chart-container ${selectedSource ? "has-selection" : ""} ${this.state.isCompactMode ? "compact" : ""}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sourceChartData}
                    layout="vertical"
                    margin={chartProps.margin}
                    barSize={chartProps.barSize}
                    barGap={5}
                    maxBarSize={chartProps.maxBarSize}
                  >
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={false}
                      domain={[0, 100]}
                      height={0}
                    />
                    <YAxis
                      type="category"
                      dataKey="manba_nomi"
                      axisLine={false}
                      tickLine={false}
                      tick={false}
                      width={0}
                    />
                    <Tooltip
                      content={this.renderSourceTooltip}
                      cursor={false}
                    />
                    <Bar
                      dataKey="normalizedFill"
                      onClick={this.handleSourceClick}
                      onMouseDown={(e: any) => e?.preventDefault?.()}
                      activeBar={false}
                      animationDuration={700}
                      animationEasing="ease-out"
                      animationBegin={60}
                      background={{
                        fill: chartBarBackgroundColor,
                        radius: [0, 6, 6, 0],
                      }}
                      shape={this.renderWaveBarShape}
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            selectedSource === entry.manba_nomi
                              ? "#ffffff"
                              : chartBarColor
                          }
                          opacity={
                            selectedSource === null
                              ? 0.95
                              : selectedSource === entry.manba_nomi
                                ? 1
                                : 0.28
                          }
                          cursor="pointer"
                          stroke="none"
                          strokeWidth={0}
                        />
                      ))}
                      {/* Name label above bar */}
                      <LabelList
                        content={(props: any) => {
                          const { x = 0, y = 0, index = 0, height = 0 } = props;
                          const nameFontSize = 12;
                          const item = sourceChartData[index];
                          if (!item) return null;
                          const isSelected = selectedSource === item.manba_nomi;
                          const name = this.getLocalizedName(
                            "source",
                            item.manba_nomi,
                          );
                          const barHeight = height || chartProps.barSize;
                          const containerWidth =
                            this.containerRef.current?.clientWidth || 300;
                          const maxTextWidth = Math.max(
                            80,
                            containerWidth - chartProps.margin.right - 20,
                          );
                          const charWidth = nameFontSize * 0.55;
                          const maxChars = Math.floor(maxTextWidth / charWidth);
                          const shown =
                            name.length > maxChars
                              ? name.slice(0, Math.max(8, maxChars - 1)) + "..."
                              : name;
                          const textY = y + barHeight / 2 + 0.5;
                          const textX = x + 6;
                          return (
                            <g pointerEvents="none">
                              <text
                                className="water-bar-name-text"
                                x={textX}
                                y={textY}
                                textAnchor="start"
                                dominantBaseline="middle"
                                fontSize={nameFontSize}
                                fontWeight={isSelected ? 700 : 500}
                                fill={
                                  isSelected
                                    ? selectedLabelTextColor
                                    : "#ffffff"
                                }
                              >
                                <tspan
                                  className={`water-bar-name-tspan ${isSelected ? "selected" : ""}`}
                                  fill={
                                    isSelected
                                      ? selectedLabelTextColor
                                      : "#ffffff"
                                  }
                                >
                                  {shown}
                                </tspan>
                                <title>{name}</title>
                              </text>
                            </g>
                          );
                        }}
                      />
                      {/* Value label right-aligned */}
                      <LabelList
                        dataKey="total_supply_m3"
                        content={(props: any) => {
                          const { y = 0, index = 0, height = 0 } = props;
                          const item = sourceChartData[index];
                          if (!item) return null;
                          const isSelected = selectedSource === item.manba_nomi;
                          const barHeight = height || chartProps.barSize;
                          const containerWidth =
                            this.containerRef.current?.clientWidth || 300;
                          const labelX = containerWidth - 8;
                          const labelY = y + barHeight / 2;
                          const valueText = `${this.formatNumber(item.total_supply_m3)} m³`;
                          return (
                            <g pointerEvents="none">
                              <text
                                className={`water-bar-value-text ${isSelected ? "selected" : ""}`}
                                x={labelX}
                                y={labelY}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize={chartProps.valueFontSize}
                                fontWeight={isSelected ? 700 : 500}
                                fill={
                                  isSelected
                                    ? selectedLabelTextColor
                                    : "#ffffff"
                                }
                                style={{
                                  paintOrder: "stroke",
                                  stroke: isSelected
                                    ? "rgba(255,255,255,0)"
                                    : "rgba(0,0,0,0.3)",
                                  strokeWidth: isSelected ? 0 : 0.3,
                                }}
                              >
                                {valueText}
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      );
    }

    /* ─── CANAL VIEW ─── */
    const { canals } = canalData;
    const canalSorted = this.getSortedCanals(canals, canalSortOrder);
    const isMinMaxActive = !!(
      this.state.minMax && String(this.state.minMax).trim()
    );
    const selectedCanalName = selectedCanal || "";

    const canalDisplayOrdered = selectedCanalName
      ? (() => {
          const selectedEntry = canalSorted.find(
            (c) => c.kanal_nomi === selectedCanalName,
          );
          const pinnedEntry =
            selectedEntry ||
            (this.state.selectedCanalSnapshot?.kanal_nomi === selectedCanalName
              ? this.state.selectedCanalSnapshot
              : {
                  kanal_nomi: selectedCanalName,
                  total_supply_m3: 0,
                  percentage: 0,
                });

          if (!pinnedEntry) return canalSorted;

          const rest = canalSorted.filter(
            (c) => c.kanal_nomi !== selectedCanalName,
          );
          return [pinnedEntry, ...rest];
        })()
      : canalSorted;

    const canalLimited = canalDisplayOrdered
      .slice(0, canalDisplayCount)
      .map((c, i) => ({
        ...c,
        index: i + 1,
      }));
    const canalMax = Math.max(
      ...canalLimited.map((c) => c.total_supply_m3 || 0),
      1,
    );
    const canalChartData = canalLimited.map((c) => ({
      ...c,
      normalizedFill: (c.total_supply_m3 / canalMax) * 100,
    }));
    const chartProps = this.getResponsiveChartProps();

    return (
      <div className="water-canal-card">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            opacity: 0,
            pointerEvents: "auto",
          }}
        >
          <JimuMapViewComponent
            useMapWidgetId={this.props.useMapWidgetIds?.[0]}
            onActiveViewChange={this.onActiveViewChange}
          />
        </div>
        <div className="water-canal-content">
          <div className="water-canal-header">
            <div className="water-canal-header-title">
              {t(lang, "evapoCanal.header")}
            </div>
            <div className="water-canal-header-controls">
              <div className="water-canal-sort-buttons">
                <button
                  className={`water-canal-sort-button ${canalSortOrder === "desc" ? "active" : ""}`}
                  onClick={() => this.setState({ canalSortOrder: "desc" })}
                  title={t(lang, "button.sort")}
                >
                  ↓
                </button>
                <button
                  className={`water-canal-sort-button ${canalSortOrder === "asc" ? "active" : ""}`}
                  onClick={() => this.setState({ canalSortOrder: "asc" })}
                  title={t(lang, "button.sort")}
                >
                  ↑
                </button>
              </div>
              <select
                className="water-canal-display-count"
                value={canalDisplayCount}
                onChange={(e) =>
                  this.setState({
                    canalDisplayCount: parseInt(e.target.value, 10),
                  })
                }
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {canalLoading ? (
            <div className="water-canal-loading-container">
              <Loading type={LoadingType.Secondary} />
              <p>{t(lang, "status.loading")}</p>
            </div>
          ) : canalError ? (
            <div className="water-canal-error">
              <p>{canalError}</p>
              <Button onClick={this.fetchCanalData} type="primary" size="sm">
                {t(lang, "button.retry")}
              </Button>
            </div>
          ) : canals.length === 0 ? (
            <div className="water-canal-no-data">
              <h3>{t(lang, "status.noData")}</h3>
              <p>{t(lang, "evapoCanal.noData")}</p>
              <Button onClick={this.fetchCanalData} type="secondary" size="sm">
                {t(lang, "button.refresh")}
              </Button>
            </div>
          ) : (
            <div
              ref={this.containerRef}
              className={`water-canal-chart-container ${selectedCanal ? "has-selection" : ""} ${this.state.isCompactMode ? "compact" : ""}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={canalChartData}
                  layout="vertical"
                  margin={chartProps.margin}
                  barSize={chartProps.barSize}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                    height={0}
                  />
                  <YAxis
                    dataKey="index"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                    width={0}
                  />
                  <Tooltip content={this.renderCanalTooltip} cursor={false} />
                  <Bar
                    dataKey="normalizedFill"
                    onClick={this.handleCanalClick}
                    onMouseDown={(e: any) => e?.preventDefault?.()}
                    activeBar={false}
                    animationDuration={700}
                    animationEasing="ease-out"
                    animationBegin={60}
                    background={{
                      fill: chartBarBackgroundColor,
                      radius: [0, 6, 6, 0],
                    }}
                    shape={this.renderWaveBarShape}
                  >
                    {canalChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          selectedCanal === entry.kanal_nomi
                            ? "#ffffff"
                            : chartBarColor
                        }
                        opacity={
                          selectedCanal === null
                            ? 0.92
                            : selectedCanal === entry.kanal_nomi
                              ? 1
                              : 0.34
                        }
                        cursor="pointer"
                        stroke="none"
                        strokeWidth={0}
                      />
                    ))}
                    {/* Name label above bar */}
                    <LabelList
                      content={(props: any) => {
                        const { x = 0, y = 0, index = 0, height = 0 } = props;
                        const nameFontSize = 12;
                        const item = canalChartData[index];
                        if (!item) return null;
                        const isSelected = selectedCanal === item.kanal_nomi;
                        const name = this.getLocalizedName(
                          "canal",
                          item.kanal_nomi,
                        );
                        const barHeight = height || chartProps.barSize;
                        const containerWidth =
                          this.containerRef.current?.clientWidth || 300;
                        const maxTextWidth = Math.max(
                          80,
                          containerWidth - chartProps.margin.right - 20,
                        );
                        const charWidth = nameFontSize * 0.55;
                        const maxChars = Math.floor(maxTextWidth / charWidth);
                        const shown =
                          name.length > maxChars
                            ? name.slice(0, Math.max(8, maxChars - 1)) + "..."
                            : name;
                        const textY = y + barHeight / 2 + 0.5;
                        const textX = x + 6;
                        return (
                          <g pointerEvents="none">
                            <text
                              className="water-bar-name-text"
                              x={textX}
                              y={textY}
                              textAnchor="start"
                              dominantBaseline="middle"
                              fontSize={nameFontSize}
                              fontWeight={isSelected ? 700 : 500}
                              fill={
                                isSelected ? selectedLabelTextColor : "#ffffff"
                              }
                            >
                              <tspan
                                className={`water-bar-name-tspan ${isSelected ? "selected" : ""}`}
                                fill={
                                  isSelected
                                    ? selectedLabelTextColor
                                    : "#ffffff"
                                }
                              >
                                {shown}
                              </tspan>
                              <title>{name}</title>
                            </text>
                          </g>
                        );
                      }}
                    />
                    {/* Value label right-aligned */}
                    <LabelList
                      dataKey="total_supply_m3"
                      content={(props: any) => {
                        const { y = 0, index = 0, height = 0 } = props;
                        const item = canalChartData[index];
                        if (!item) return null;
                        const isSelected = selectedCanal === item.kanal_nomi;
                        const barHeight = height || chartProps.barSize;
                        const containerWidth =
                          this.containerRef.current?.clientWidth || 300;
                        const labelX = containerWidth - 8;
                        const labelY = y + barHeight / 2;
                        const valueText = `${this.formatNumber(item.total_supply_m3, 0)} m³`;
                        return (
                          <g pointerEvents="none">
                            <text
                              className={`water-bar-value-text ${isSelected ? "selected" : ""}`}
                              x={labelX}
                              y={labelY}
                              textAnchor="end"
                              dominantBaseline="middle"
                              fontSize={chartProps.valueFontSize}
                              fontWeight={isSelected ? 700 : 500}
                              fill={
                                isSelected ? selectedLabelTextColor : "#ffffff"
                              }
                              style={{
                                paintOrder: "stroke",
                                stroke: isSelected
                                  ? "rgba(255,255,255,0)"
                                  : "rgba(0,0,0,0.3)",
                                strokeWidth: isSelected ? 0 : 0.3,
                              }}
                            >
                              {valueText}
                            </text>
                          </g>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  }
}
