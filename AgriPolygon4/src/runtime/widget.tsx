// Polygon Attribute Inspector (AgriPolygon refactor)
// ✅ UPDATED: supports MULTIPLE selected Feature Layers (e.g. yearly layers filtered by another widget)

import Graphic from "esri/Graphic";
import FeatureLayer from "esri/layers/FeatureLayer";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import esriRequest from "esri/request";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import {
  AllWidgetProps,
  DataSourceComponent,
  QueriableDataSource,
  React,
} from "jimu-core";
import {
  getInitialLang,
  getInitialTheme,
  normalizeLang,
  t,
  type LangCode,
} from "./messages";

import "./AgriPolygon.css";

type Config = {
  fieldsToShow?: string[];
  titleField?: string;
  labels?: Record<string, string>;
  settings?: {
    zoomToSelection?: boolean; // default true
    showMapPopup?: boolean; // default false
    showAttachments?: boolean; // default true (when undefined)
  };
  chartEnabled?: boolean;
  chartType?: "bar" | "line";
  chartTitle?: string;
  chartFields?: string[];
  chartColor?: string;
};

type AttachmentItem = {
  id: number;
  name?: string;
  size?: number;
  contentType?: string;
  url?: string; // direct download URL
  previewObjectUrl?: string; // created via URL.createObjectURL for <img> previews
};

interface State {
  currentLang: LangCode;
  isDarkTheme: boolean;

  jimuMapView?: JimuMapView | null;

  /** ✅ MULTI: all resolved layers from settings */
  featureLayers: __esri.FeatureLayer[];
  /** ✅ MULTI: map clicked layer => dsId (best-effort) */
  layerKeyToDsId: Record<string, string>;

  /** ✅ MULTI: store DS schemas per DS id */
  dataSourcesById: Record<string, QueriableDataSource>;

  /** which layer was last clicked (for aliases/field resolving) */
  lastClickedDsId: string | null;
  lastClickedLayerKey: string | null;

  pinToCorner: boolean;

  // attachments UI
  loadingAttachments: boolean;
  attachments: AttachmentItem[];
  attachmentsExpanded: boolean;

  loading: boolean;
  error: string | null;

  selectedAttrs: Record<string, any> | null;
  selectedOID: number | null;
  objectIdField: string | null;

  showPopup: boolean;
  popupPosition: { x: number; y: number } | null;
  clickScreenPoint: { x: number; y: number } | null;

  debugInfo: {
    layerInfo?: any;
    hitTestResults?: any;
    queryResults?: any;
    fieldMapping?: any;
    availableLayers?: any;
  };
}

export default class AgriPolygon extends React.PureComponent<
  AllWidgetProps<Config>,
  State
> {
  private _isMounted = false;
  private themeObserver: MutationObserver | null = null;
  private _clickHandle: IHandleLike | null = null;
  private _popupRef: React.RefObject<HTMLDivElement> = React.createRef();
  private _highlightLayer: __esri.GraphicsLayer | null = null;
  private _highlightGraphic: __esri.Graphic | null = null;

  constructor(props: AllWidgetProps<Config>) {
    super(props);

    this.state = {
      currentLang: getInitialLang(),
      isDarkTheme: this.getResolvedTheme(),

      jimuMapView: null,

      featureLayers: [],
      layerKeyToDsId: {},
      dataSourcesById: {},

      lastClickedDsId: null,
      lastClickedLayerKey: null,

      pinToCorner: false,

      loadingAttachments: false,
      attachments: [],
      attachmentsExpanded: false,

      loading: false,
      error: null,

      selectedAttrs: null,
      selectedOID: null,
      objectIdField: null,

      showPopup: false,
      popupPosition: null,
      clickScreenPoint: null,

      debugInfo: {},
    };
  }

  private getResolvedTheme = (): boolean => {
    const root = document.documentElement;
    const body = document.body;

    try {
      const savedTheme =
        localStorage.getItem("app_theme") ||
        localStorage.getItem("evapo_app_theme");

      if (savedTheme === "light") return false;
      if (savedTheme === "dark") return true;
    } catch {
      // ignore storage access issues
    }

    const isLight =
      root.classList.contains("light-theme") ||
      root.getAttribute("data-theme") === "light" ||
      body.classList.contains("light-theme");

    return getInitialTheme() ?? !isLight;
  };

  componentDidMount(): void {
    this._isMounted = true;
    this.setupThemeObserver();
    const isDarkTheme = this.getResolvedTheme();
    if (isDarkTheme !== this.state.isDarkTheme) {
      this.setState({ isDarkTheme });
    }
    document.addEventListener(
      "themeChanged",
      this.handleThemeChange as EventListener,
    );
    document.addEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );
    document.addEventListener("mousedown", this.handleOutsideClick);
    window.addEventListener("resize", this.repositionPinnedIfNeeded);
    window.addEventListener("scroll", this.repositionPinnedIfNeeded, true);
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    document.removeEventListener(
      "themeChanged",
      this.handleThemeChange as EventListener,
    );
    document.removeEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );
    this.detachMapClick();
    this.cleanupHighlight();
    document.removeEventListener("mousedown", this.handleOutsideClick);
    window.removeEventListener("resize", this.repositionPinnedIfNeeded);
    window.removeEventListener("scroll", this.repositionPinnedIfNeeded, true);
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    this.revokeAllAttachmentUrls();
  }

  private tr = (
    key: string,
    params?: Record<string, string | number>,
  ): string => {
    return t(this.state.currentLang, key, params);
  };

  private setupThemeObserver = (): void => {
    const root = document.documentElement;
    const body = document.body;
    this.themeObserver = new MutationObserver(() => {
      const isDarkTheme = this.getResolvedTheme();
      if (this._isMounted && isDarkTheme !== this.state.isDarkTheme) {
        this.setState({ isDarkTheme });
      }
    });

    this.themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    this.themeObserver.observe(body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  };

  private handleThemeChange = (e: any): void => {
    if (!this._isMounted) return;
    const detail = e?.detail || {};
    let isDarkTheme = this.getResolvedTheme();

    if (typeof detail.isDarkTheme === "boolean") {
      isDarkTheme = detail.isDarkTheme;
    } else if (typeof detail.theme === "string") {
      isDarkTheme = String(detail.theme).toLowerCase() !== "light";
    }

    if (isDarkTheme !== this.state.isDarkTheme) {
      this.setState({ isDarkTheme });
    }
  };

  private handleLanguageChange = (e: any): void => {
    if (!this._isMounted) return;
    const lang = e?.detail?.lang || e?.detail?.language || e?.detail?.code;
    const normalized = normalizeLang(lang);
    if (normalized !== this.state.currentLang) {
      this.setState({ currentLang: normalized });
    }
  };

  /* --- pinned popup helpers --- */
  private calculatePinnedPosition = (
    view: __esri.MapView | __esri.SceneView,
  ): { x: number; y: number } => {
    const mapContainer = view.container as HTMLElement;
    const rect = mapContainer.getBoundingClientRect();
    const margin = 16;
    const popupEl = this._popupRef.current;
    const popupWidth = popupEl?.getBoundingClientRect().width || 320;
    const popupHeight = popupEl?.getBoundingClientRect().height || 300;

    // Position to top-right of map container, accounting for popup size
    let x = rect.left + rect.width - popupWidth - margin;
    let y = rect.top + margin;

    // Clamp to map container bounds
    x = Math.max(
      rect.left + margin,
      Math.min(x, rect.right - popupWidth - margin),
    );
    y = Math.max(
      rect.top + margin,
      Math.min(y, rect.bottom - popupHeight - margin),
    );

    return { x, y };
  };

  private repositionPinnedIfNeeded = () => {
    if (!this._isMounted) return;
    if (!this.state.pinToCorner || !this.state.showPopup) return;
    const view = this.state.jimuMapView?.view;
    if (!view) return;
    const pos = this.calculatePinnedPosition(view);
    this.setState({ popupPosition: pos });
  };

  private togglePinToCorner = () => {
    this.setState((prev) => {
      const next = !prev.pinToCorner;
      const view = this.state.jimuMapView?.view;

      let pos = prev.popupPosition;

      if (next) {
        if (view) pos = this.calculatePinnedPosition(view);
      } else {
        if (view && prev.clickScreenPoint) {
          pos = this.calculatePopupPosition(prev.clickScreenPoint, view);
        } else if (view) {
          const rect = (view.container as HTMLElement).getBoundingClientRect();
          pos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }

      return { pinToCorner: next, popupPosition: pos };
    });
  };

  private handleOutsideClick = (event: MouseEvent) => {
    if (
      this.state.showPopup &&
      this._popupRef.current &&
      !this._popupRef.current.contains(event.target as Node)
    ) {
      const mapContainer = this.state.jimuMapView?.view?.container;
      if (mapContainer && !mapContainer.contains(event.target as Node)) {
        this.closePopup();
      }
    }
  };
  /** ✅ NEW: safely detect whether this layer supports attachments */
  private layerSupportsAttachments(
    layer: __esri.FeatureLayer | FeatureLayer | null | undefined,
  ): boolean {
    if (!layer) return false;

    // Different JSAPI/EB builds expose it slightly differently
    const anyLayer: any = layer as any;

    // Common signals
    if (typeof anyLayer.supportsAttachments === "boolean")
      return anyLayer.supportsAttachments;

    const cap = anyLayer.capabilities;
    const supported =
      cap?.data?.supportsAttachments ??
      cap?.data?.supportsAttachment ??
      cap?.operations?.supportsAttachments ??
      cap?.operations?.supportsAttachment;

    if (typeof supported === "boolean") return supported;

    // Unknown => assume false to avoid ugly warning
    return false;
  }

  /* ---------------- Highlight management ---------------- */

  private setupHighlightLayer = (view: __esri.MapView | __esri.SceneView) => {
    if (!this._highlightLayer) {
      this._highlightLayer = new GraphicsLayer({
        id: "agri-polygon-highlight",
        title: "Selected Polygon Highlight",
      });
      view.map.add(this._highlightLayer);
    }
  };

  private highlightPolygon = (geometry: __esri.Geometry) => {
    if (!this._highlightLayer || !geometry) return;
    this.clearHighlight();

    const highlightSymbol = new SimpleFillSymbol({
      color: [0, 174, 239, 0.2],
      outline: new SimpleLineSymbol({
        color: [0, 174, 239, 1],
        width: 3,
        style: "solid",
      }),
    });

    this._highlightGraphic = new Graphic({
      geometry,
      symbol: highlightSymbol,
    });

    this._highlightLayer.add(this._highlightGraphic);
  };

  private clearHighlight = () => {
    if (this._highlightLayer && this._highlightGraphic) {
      this._highlightLayer.remove(this._highlightGraphic);
      this._highlightGraphic = null;
    }
  };

  private cleanupHighlight = () => {
    if (this._highlightLayer) {
      const view = this.state.jimuMapView?.view;
      if (view && view.map) {
        view.map.remove(this._highlightLayer);
      }
      this._highlightLayer = null;
      this._highlightGraphic = null;
    }
  };

  /* ---------------- Map wiring ---------------- */

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    this.detachMapClick();
    this.cleanupHighlight();

    if (!jimuMapView) {
      this.setState({
        jimuMapView: null,
        featureLayers: [],
        objectIdField: null,
        error: this.tr("error.noMapView"),
        debugInfo: {
          ...this.state.debugInfo,
          layerInfo: this.tr("error.noMapView"),
        },
      });
      return;
    }

    this.setState({ jimuMapView }, async () => {
      const view = jimuMapView.view;
      if (!view) return;

      if (view.ready) {
        this.setupHighlightLayer(view);
        await this.initializeMapConnection(jimuMapView);
        this.repositionPinnedIfNeeded();
      } else {
        const h = view.watch("ready", async (ready) => {
          if (ready) {
            h.remove();
            this.setupHighlightLayer(view);
            await this.initializeMapConnection(jimuMapView);
            this.repositionPinnedIfNeeded();
          }
        });
      }
    });
  };

  private initializeMapConnection = async (jmv: JimuMapView) => {
    const view = jmv?.view;
    if (!view || !view.map) return;

    const useList = (this.props.useDataSources?.asMutable?.() as any[]) || [];
    if (!useList.length) {
      this.setState({
        featureLayers: [],
        objectIdField: null,
        error: this.tr("error.noLayersSelected"),
      });
      return;
    }

    const resolvedLayers: __esri.FeatureLayer[] = [];
    const layerKeyToDsId: Record<string, string> = {};

    for (const useDs of useList) {
      const layer = await this.resolveFeatureLayerForUseDataSource(jmv, useDs);
      if (!layer) continue;

      try {
        await layer.load();
      } catch {}

      resolvedLayers.push(layer);

      // best-effort map for later (url preferred, else id)
      const key = (layer.url || layer.id) as string;
      if (useDs?.dataSourceId) layerKeyToDsId[key] = useDs.dataSourceId;
    }

    if (!resolvedLayers.length) {
      this.setState({
        featureLayers: [],
        objectIdField: null,
        error: this.tr("error.selectedLayersMissing"),
        debugInfo: {
          ...this.state.debugInfo,
          availableLayers: view.map.layers.toArray().map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            url: (l as any).url,
          })),
        },
      });
      return;
    }

    // attach click once we have layers
    this.setState(
      {
        featureLayers: resolvedLayers,
        layerKeyToDsId,
        error: null,
        debugInfo: {
          ...this.state.debugInfo,
          layerInfo: resolvedLayers.map((l) => ({
            id: l.id,
            title: l.title,
            url: l.url,
            objectIdField: l.objectIdField,
          })),
        },
      },
      () => this.attachMapClick(jmv),
    );
  };

  /** ✅ MULTI: resolve a feature layer for a specific selected useDataSource */
  private resolveFeatureLayerForUseDataSource = async (
    jmv: JimuMapView,
    useDs: any,
  ): Promise<__esri.FeatureLayer | null> => {
    try {
      if (!useDs?.dataSourceId) return null;

      // 1) Match by JimuLayerView dataSourceId
      const jlvList: any[] = jmv.getAllJimuLayerViews?.() || [];
      const match = jlvList.find(
        (lv) =>
          lv?.layerDataSourceId === useDs.dataSourceId ||
          lv?.dataSourceId === useDs.dataSourceId,
      );
      if (match?.layer?.type === "feature")
        return match.layer as __esri.FeatureLayer;

      // 2) Match by URL from DataSourceManager
      const dsMgr = (await import("jimu-core")).DataSourceManager.getInstance();
      const ds: any = dsMgr.getDataSource(useDs.dataSourceId);
      const url: string | undefined = ds?.url || ds?.layer?.url;
      if (url) {
        const layers = jmv.view.map.layers.toArray() as any[];
        const cand = layers.find((ly: any) => ly?.url === url);
        if (cand?.type === "feature") return cand as __esri.FeatureLayer;
      }
    } catch (e) {
      console.warn(
        "[AgriPolygon] resolveFeatureLayerForUseDataSource error",
        e,
      );
    }
    return null;
  };
  private clampPopupToMapContainer = (
    pos: { x: number; y: number },
    view: __esri.MapView | __esri.SceneView,
  ) => {
    const popupEl = this._popupRef.current;
    const container = view.container as HTMLElement;
    const rect = container.getBoundingClientRect();

    // Get actual popup dimensions from DOM
    let popupW = 320;
    let popupH = 280;

    if (popupEl) {
      const popupRect = popupEl.getBoundingClientRect();
      if (popupRect.width > 0) {
        popupW = popupRect.width;
      }
      if (popupRect.height > 0) {
        popupH = popupRect.height;
      }
    }

    const margin = 12;
    const mapWidth = rect.width;
    const mapHeight = rect.height;

    // Enforce max width constraint - reasonable limits
    popupW = Math.min(popupW, mapWidth - margin * 2);
    popupW = Math.max(240, popupW);
    // Cap at 400px for responsive layout
    popupW = Math.min(popupW, 400);

    // Map container bounds
    const mapLeft = rect.left;
    const mapTop = rect.top;
    const mapRight = rect.right;
    const mapBottom = rect.bottom;

    // Hard clamp to map container
    const x = Math.max(
      mapLeft + margin,
      Math.min(pos.x, mapRight - popupW - margin),
    );
    const y = Math.max(
      mapTop + margin,
      Math.min(pos.y, mapBottom - popupH - margin),
    );

    return { x, y };
  };

  private attachMapClick(jmv: JimuMapView) {
    this.detachMapClick();
    this._clickHandle = jmv.view.on("click", this.onViewClick);
  }

  private detachMapClick() {
    if (this._clickHandle?.remove) this._clickHandle.remove();
    this._clickHandle = null;
  }

  /* ---------------- Click → hitTest → query full attrs ---------------- */

  private onViewClick = async (ev: __esri.ViewClickEvent) => {
    const view = this.state.jimuMapView?.view;
    const layers = this.state.featureLayers || [];
    if (!view || !layers.length) return;

    const clickScreenPoint = { x: ev.x, y: ev.y };

    try {
      this.setState({
        loading: true,
        error: null,
        clickScreenPoint,
        loadingAttachments: true,
        attachments: [],
        attachmentsExpanded: true,
      });

      // ✅ MULTI hitTest across all selected layers
      const hit = await view.hitTest(ev, { include: layers as any });

      const hitResult = hit?.results?.find((r) => {
        if ("graphic" in r && r.graphic) {
          const lyr: any = r.graphic.layer;
          if (!lyr) return false;
          // layer match by url or id
          return layers.some(
            (L) =>
              (L.url && lyr.url && L.url === lyr.url) ||
              (L.id && lyr.id && L.id === lyr.id),
          );
        }
        return false;
      });

      const g = hitResult && "graphic" in hitResult ? hitResult.graphic : null;

      if (!g) {
        this.setState({
          loading: false,
          selectedAttrs: null,
          selectedOID: null,
          showPopup: false,
          loadingAttachments: false,
          attachments: [],
        });
        this.clearHighlight();
        return;
      }

      // clicked layer (from graphic.layer)
      const clickedLayer = g.layer as __esri.FeatureLayer;
      const layerKey = (clickedLayer?.url || clickedLayer?.id) as string;
      const dsId = this.state.layerKeyToDsId?.[layerKey] || null;

      const oidField =
        clickedLayer.objectIdField ||
        clickedLayer.fields?.find((f: any) => f.type === "oid")?.name ||
        null;

      if (!oidField) {
        this.setState({
          loading: false,
          error: this.tr("error.objectIdFieldMissing"),
          showPopup: false,
          loadingAttachments: false,
          attachments: [],
        });
        this.clearHighlight();
        return;
      }

      const oid = (g as any).attributes?.[oidField];
      if (oid == null) {
        this.setState({
          loading: false,
          error: this.tr("error.objectIdMissing", { field: oidField }),
          showPopup: false,
          loadingAttachments: false,
          attachments: [],
        });
        this.clearHighlight();
        return;
      }

      const outFields = this.getOutFields(clickedLayer as any, oidField);

      const q = clickedLayer.createQuery();
      q.where = `${oidField} = ${Number(oid)}`;
      q.outFields = outFields;
      q.returnGeometry = true;

      const res = await clickedLayer.queryFeatures(q);
      const f = res.features?.[0];
      if (!f) {
        this.setState({
          loading: false,
          error: this.tr("error.featureByObjectIdMissing"),
          showPopup: false,
          loadingAttachments: false,
          attachments: [],
        });
        this.clearHighlight();
        return;
      }

      if (f.geometry) this.highlightPolygon(f.geometry);

      const shouldPin = this.state.pinToCorner;
      const popupPosition = shouldPin
        ? this.calculatePinnedPosition(view)
        : this.calculatePopupPosition(clickScreenPoint, view);

      const zoomTo = this.props.config?.settings?.zoomToSelection !== false;
      if (zoomTo && f.geometry) {
        try {
          await view.goTo({ target: f.geometry }, { duration: 400 });
        } catch {}
      }

      const configuredFields = this.props.config?.fieldsToShow || [];
      const actualFields = Object.keys(f.attributes || {});
      const missingFields = configuredFields.filter(
        (field) => !actualFields.includes(field),
      );
      const fieldsWithData = configuredFields.filter(
        (name) =>
          f.attributes.hasOwnProperty(name) &&
          f.attributes[name] != null &&
          f.attributes[name] !== "",
      );

      const shouldShowPopup =
        configuredFields.length > 0 &&
        (fieldsWithData.length > 0 || missingFields.length > 0);

      this.setState({
        loading: false,

        // ✅ store which layer/ds was clicked (for alias resolving)
        lastClickedDsId: dsId,
        lastClickedLayerKey: layerKey,

        selectedAttrs: f.attributes || {},
        selectedOID: Number(oid),
        objectIdField: oidField,

        showPopup:
          shouldShowPopup ||
          this.props.config?.settings?.showAttachments !== false,
        popupPosition:
          shouldShowPopup ||
          this.props.config?.settings?.showAttachments !== false
            ? popupPosition
            : null,
        error:
          missingFields.length > 0
            ? this.tr("error.configuredFieldMissing", {
                fields: missingFields.join(", "),
              })
            : fieldsWithData.length === 0 && configuredFields.length > 0
              ? this.tr("error.noDataForConfiguredFields")
              : null,
      });

      if (this.props.config?.settings?.showAttachments !== false) {
        await this.loadAttachmentsForOid(clickedLayer as any, Number(oid));
      }

      if (this.state.pinToCorner) setTimeout(this.repositionPinnedIfNeeded, 0);
    } catch (e: any) {
      this.setState({
        loading: false,
        error: this.tr("error.unexpected", {
          message: e?.message || "Unknown error",
        }),
        showPopup: false,
        loadingAttachments: false,
        attachments: [],
      });
      this.clearHighlight();
    }
  };

  /* ---------------- Attachments helpers ---------------- */

  private async fetchAttachmentPreview(url: string): Promise<Blob> {
    const resp = await esriRequest(url, {
      responseType: "blob",
      query: {},
    } as any);
    return resp?.data instanceof Blob ? resp.data : (resp as unknown as Blob);
  }

  private revokeAllAttachmentUrls() {
    try {
      const atts = this.state.attachments || [];
      atts.forEach((a) => {
        if (a.previewObjectUrl) URL.revokeObjectURL(a.previewObjectUrl);
      });
    } catch {}
  }

  private isImageContentType(ct?: string) {
    if (!ct) return false;
    return /^image\//i.test(ct);
  }

  private bytesToSize(n?: number): string {
    if (!n && n !== 0) return "";
    if (n === 0) return "0 B";
    const k = 1024,
      sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(n) / Math.log(k));
    return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  private async loadAttachmentsForOid(layer: FeatureLayer, oid: number) {
    // ✅ If layer doesn’t support attachments -> silently show none (NO warning)
    if (!this.layerSupportsAttachments(layer)) {
      if (!this._isMounted) return;
      this.revokeAllAttachmentUrls();
      this.setState({
        loadingAttachments: false,
        attachments: [],
        attachmentsExpanded: true, // keep area visible if you want "No attachments"
      });
      return;
    }

    try {
      this.revokeAllAttachmentUrls();
      this.setState({ loadingAttachments: true, attachments: [] });

      const result = await layer.queryAttachments({ objectIds: [oid] });
      const list = (result?.[oid] || []) as any[];

      const items: AttachmentItem[] = list.map((att) => ({
        id: att.id,
        name: att.name,
        size: att.size,
        contentType: att.contentType,
        url: att.url,
      }));

      const withPreviews: AttachmentItem[] = [];
      for (const it of items) {
        if (it.url && this.isImageContentType(it.contentType)) {
          try {
            const blob = await this.fetchAttachmentPreview(it.url);
            it.previewObjectUrl = URL.createObjectURL(blob);
          } catch {
            // ignore preview failures
          }
        }
        withPreviews.push(it);
      }

      if (!this._isMounted) return;
      this.setState({
        attachments: withPreviews,
        loadingAttachments: false,
        attachmentsExpanded: true,
      });
    } catch (err: any) {
      // ✅ If server says attachments not supported/enabled -> SILENT (no red warning)
      const msg = String(err?.message || err || "").toLowerCase();
      const isNotSupported =
        msg.includes("doesn't support attachments") ||
        msg.includes("does not support attachments") ||
        msg.includes("attachments are not enabled") ||
        msg.includes("attachments disabled") ||
        (msg.includes("not supported") && msg.includes("attachment"));

      if (!this._isMounted) return;

      if (isNotSupported) {
        this.setState({
          loadingAttachments: false,
          attachments: [],
          attachmentsExpanded: true,
        });
        return;
      }

      // ✅ For real errors (network/token), also keep it silent if you want.
      // If you still want to see real errors somewhere else, log it instead:
      console.warn("[AgriPolygon] Attachment load failed:", err);

      this.setState({
        loadingAttachments: false,
        attachments: [],
        attachmentsExpanded: true,
      });
    }
  }

  /* ---------------- Field alias + formatting ---------------- */

  private isDateField(name: string): boolean {
    // Use the clicked layer if possible
    const clickedLayer = this.getClickedLayer();
    const fld = clickedLayer?.fields?.find((ff: any) => ff.name === name);
    const t = String((fld as any)?.type || "");
    return (
      t === "date" ||
      t === "timestamp-offset" ||
      t === "date-only" ||
      t === "time-only"
    );
  }

  private getClickedLayer(): __esri.FeatureLayer | null {
    const key = this.state.lastClickedLayerKey;
    if (!key) return null;
    return (
      this.state.featureLayers.find((L) => (L.url || L.id) === key) || null
    );
  }

  private resolveFieldName = (key: string): string | null => {
    // Prefer DS schema for the LAST clicked ds (best for alias/jimuName)
    const dsId = this.state.lastClickedDsId;
    const ds: any =
      dsId && this.state.dataSourcesById?.[dsId]
        ? this.state.dataSourcesById[dsId]
        : null;

    try {
      const schema = ds?.getSchema?.();
      const fieldsObj = schema?.fields || {};
      if (fieldsObj[key]?.name) return fieldsObj[key].name;
      for (const k of Object.keys(fieldsObj)) {
        const f = (fieldsObj as any)[k];
        if (f?.name === key || f?.jimuName === key || k === key)
          return f?.name || key;
      }
    } catch {}

    // fallback to clicked layer fields
    const clickedLayer = this.getClickedLayer();
    const lf = clickedLayer?.fields?.find(
      (ff: any) => ff.name === key || ff.alias === key,
    );
    return lf?.name || null;
  };

  private getFieldAlias(name: string): string {
    const custom = this.props.config?.labels?.[name];
    if (custom) return custom;

    const dsId = this.state.lastClickedDsId;
    const ds: any =
      dsId && this.state.dataSourcesById?.[dsId]
        ? this.state.dataSourcesById[dsId]
        : null;

    try {
      const schema = ds?.getSchema?.();
      const fieldsObj = schema?.fields || {};
      const fromKey = fieldsObj[name];
      if (fromKey?.alias || fromKey?.displayName)
        return fromKey.alias || fromKey.displayName;

      const real = this.resolveFieldName(name) || name;
      const viaReal = fieldsObj[real];
      if (viaReal?.alias || viaReal?.displayName)
        return viaReal.alias || viaReal.displayName;
    } catch {}

    const clickedLayer = this.getClickedLayer();
    const layerAlias = clickedLayer?.fields?.find(
      (f: any) => f.name === name,
    )?.alias;
    return layerAlias || name;
  }

  private formatDateSmart(raw: any): string {
    if (raw instanceof Date) return raw.toLocaleString();

    if (typeof raw === "number" && isFinite(raw)) {
      const ms = raw < 1e12 ? raw * 1000 : raw;
      const d = new Date(ms);
      return isNaN(d.getTime())
        ? String(raw)
        : d.toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (/^\d{10,13}$/.test(trimmed))
        return this.formatDateSmart(Number(trimmed));
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    return String(raw);
  }

  private formatValue(name: string, raw: any): string {
    if (raw === null || raw === undefined || raw === "") return "—";

    if (this.isDateField(name)) return this.formatDateSmart(raw);
    if (
      (typeof raw === "number" && raw > 1e9 && raw < 1e14) ||
      (typeof raw === "string" && /^\d{10,13}$/.test(raw))
    ) {
      return this.formatDateSmart(raw);
    }

    if (typeof raw === "number" && isFinite(raw)) return raw.toLocaleString();
    if (Array.isArray(raw)) return raw.join(", ");
    if (typeof raw === "object") return JSON.stringify(raw);
    return String(raw);
  }

  private getOutFields(layer: FeatureLayer, oidField: string): string[] {
    // keep your debugging behavior
    return ["*"];
  }

  /* ---------------- Popup positioning ---------------- */

  private calculatePopupPosition = (
    clickPoint: { x: number; y: number },
    view: __esri.MapView | __esri.SceneView,
  ): { x: number; y: number } => {
    const container = view.container as HTMLElement;
    const rect = container.getBoundingClientRect();

    const margin = 12;
    const mapWidth = rect.width;
    const mapHeight = rect.height;

    // Popup dimensions - use conservative estimates
    // since DOM might not be fully measured yet
    const popupEl = this._popupRef.current;
    let popupW = 320;
    let popupH = 280;

    if (popupEl) {
      const popupRect = popupEl.getBoundingClientRect();
      // Use actual dimensions if available, but don't exceed map width
      if (popupRect.width > 0) {
        popupW = Math.min(popupRect.width, mapWidth - margin * 2);
      }
      if (popupRect.height > 0) {
        popupH = popupRect.height;
      }
    }

    // Enforce maximum width for small maps
    popupW = Math.min(popupW, mapWidth - margin * 2);
    // Minimal width for compact 1-column layout
    popupW = Math.max(240, popupW);
    popupW = Math.min(popupW, 400); // Cap at 400px

    // ✅ EB builds differ:
    // - some give ev.x/ev.y relative to container (0..rect.width)
    // - others give viewport coords (same space as rect.left/top)
    const looksContainerRelative =
      clickPoint.x >= 0 &&
      clickPoint.y >= 0 &&
      clickPoint.x <= rect.width + 2 &&
      clickPoint.y <= rect.height + 2;

    // Convert click to VIEWPORT coords (because popup is position: fixed)
    const viewportClickX = looksContainerRelative
      ? rect.left + clickPoint.x
      : clickPoint.x;
    const viewportClickY = looksContainerRelative
      ? rect.top + clickPoint.y
      : clickPoint.y;

    // Map container boundaries in viewport coords
    const mapLeft = rect.left;
    const mapTop = rect.top;
    const mapRight = rect.right;
    const mapBottom = rect.bottom;

    // Prefer bottom-right of click
    let x = viewportClickX + margin;
    let y = viewportClickY + margin;

    // Flip left if overflowing right edge (CRITICAL!)
    // Check if popup would go outside map's right boundary
    if (x + popupW > mapRight - margin) {
      x = viewportClickX - popupW - margin;
    }

    // Flip up if overflowing bottom edge
    if (y + popupH > mapBottom - margin) {
      y = viewportClickY - popupH - margin;
    }

    // Final hard clamp to map container bounds
    // This is the critical part - ensure popup NEVER exceeds map bounds
    const minX = mapLeft + margin;
    const maxX = mapRight - popupW - margin;
    const minY = mapTop + margin;
    const maxY = mapBottom - popupH - margin;

    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    // FINAL SAFETY NET: Ensure x never exceeds right boundary
    if (x + popupW > mapRight - margin) {
      x = mapRight - popupW - margin;
    }
    // Also ensure x >= left boundary
    if (x < mapLeft + margin) {
      x = mapLeft + margin;
    }

    return { x, y };
  };

  componentDidUpdate(
    prevProps: Readonly<AllWidgetProps<Config>>,
    prevState: Readonly<State>,
  ) {
    // Only for free (non-pinned) popup
    if (!this.state.showPopup || this.state.pinToCorner) return;

    // Re-clamp when:
    // - popup opened
    // - popup position changed
    // - attachments changed (height changes)
    const openedNow = this.state.showPopup && !prevState.showPopup;
    const posChanged =
      this.state.popupPosition?.x !== prevState.popupPosition?.x ||
      this.state.popupPosition?.y !== prevState.popupPosition?.y;

    const attachmentsChanged =
      this.state.loadingAttachments !== prevState.loadingAttachments ||
      (this.state.attachments?.length || 0) !==
        (prevState.attachments?.length || 0);

    if (!this.state.popupPosition) return;
    if (!openedNow && !posChanged && !attachmentsChanged) return;

    const view = this.state.jimuMapView?.view;
    if (!view) return;

    // Wait for DOM to measure correct size, then clamp
    requestAnimationFrame(() => {
      if (!this._isMounted) return;
      if (
        !this.state.popupPosition ||
        this.state.pinToCorner ||
        !this.state.showPopup
      )
        return;

      const clamped = this.clampPopupToMapContainer(
        this.state.popupPosition,
        view,
      );

      if (
        clamped.x !== this.state.popupPosition.x ||
        clamped.y !== this.state.popupPosition.y
      ) {
        this.setState({ popupPosition: clamped });
      }
    });
  }

  private closePopup = () => {
    this.setState({ showPopup: false });
    this.clearHighlight();
    this.revokeAllAttachmentUrls();
    this.setState({
      attachments: [],
      attachmentsExpanded: false,
      loadingAttachments: false,
    });
  };

  /* ---------------- DS hook (instantiates DS) ---------------- */

  onDataSourceCreated = (ds: QueriableDataSource) => {
    if (!ds?.id) return;
    this.setState((prev) => ({
      dataSourcesById: { ...(prev.dataSourcesById || {}), [ds.id]: ds },
    }));
  };

  /* ---------------- Chart rendering ---------------- */

  private renderChart = () => {
    const config = this.props.config;
    if (!config?.chartEnabled) return null;

    const chartFields = config.chartFields || [];
    const chartType = config.chartType || "bar";
    const chartTitle = config.chartTitle || "";
    const chartColor = config.chartColor || "#3b82f6";
    const attrs = this.state.selectedAttrs;

    if (!attrs || chartFields.length === 0) return null;

    // Collect numeric data for chart
    const dataPoints: { label: string; value: number }[] = [];
    for (const fieldName of chartFields) {
      const raw = attrs[fieldName];
      const numVal = typeof raw === "number" ? raw : parseFloat(raw);
      if (!isNaN(numVal)) {
        dataPoints.push({
          label: this.getFieldAlias(fieldName),
          value: numVal,
        });
      }
    }

    if (dataPoints.length === 0) return null;

    const svgWidth = 360;
    const svgHeight = 190;
    const padding = { top: 18, right: 20, bottom: 40, left: 42 };
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    const maxVal = Math.max(...dataPoints.map((d) => d.value), 0.001);
    const minVal = Math.min(...dataPoints.map((d) => d.value), 0);
    const range = maxVal - Math.min(minVal, 0);

    const isDark = this.state.isDarkTheme;
    const textColor = isDark ? "#9cc7dd" : "#3d5755";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const bgColor = isDark ? "rgba(15,40,61,0.72)" : "#e4edec";

    // Y-axis scale (bottom = 0 or minVal if negative)
    const baseY = Math.min(minVal, 0);
    const scaleY = (v: number) => chartH - ((v - baseY) / range) * chartH;

    // Grid lines
    const gridLines = 4;
    const gridStep = range / gridLines;

    return (
      <div>
        {chartTitle && (
          <div className="agri3-chart-title-outside">{chartTitle}</div>
        )}

        <div className="agri3-chart-container" style={{ marginTop: 6 }}>
          <svg
            width="100%"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{
              background: bgColor,
              borderRadius: 8,
              border: `1px solid ${isDark ? "rgba(123,220,255,0.2)" : "rgba(61,87,85,0.2)"}`,
              display: "block",
            }}
          >
            {/* Grid lines & Y labels */}
            {Array.from({ length: gridLines + 1 }).map((_, i) => {
              const val = baseY + gridStep * i;
              const y = padding.top + scaleY(val);
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke={gridColor}
                    strokeWidth={0.7}
                  />
                  <text
                    x={padding.left - 4}
                    y={y + 4}
                    fill={textColor}
                    fontSize={10}
                    textAnchor="end"
                  >
                    {val >= 1000
                      ? `${(val / 1000).toFixed(1)}k`
                      : Number(val.toFixed(1))}
                  </text>
                </g>
              );
            })}

            {/* Bar chart */}
            {chartType === "bar" &&
              (() => {
                const barGap = 4;
                const totalGaps = (dataPoints.length - 1) * barGap;
                const barW = Math.max(
                  8,
                  (chartW - totalGaps) / dataPoints.length,
                );
                return dataPoints.map((d, i) => {
                  const x = padding.left + i * (barW + barGap);
                  const barH = Math.max(
                    1,
                    ((d.value - baseY) / range) * chartH,
                  );
                  const y = padding.top + chartH - barH;
                  return (
                    <g key={`bar-${i}`}>
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        fill={chartColor}
                        rx={3}
                        opacity={0.85}
                      >
                        <title>{`${d.label}: ${d.value.toLocaleString()}`}</title>
                      </rect>
                      {/* Value on top */}
                      <text
                        x={x + barW / 2}
                        y={y - 4}
                        fill={textColor}
                        fontSize={10}
                        textAnchor="middle"
                      >
                        {d.value >= 1000
                          ? `${(d.value / 1000).toFixed(1)}k`
                          : Number(d.value.toFixed(1))}
                      </text>
                      {/* X label */}
                      <text
                        x={x + barW / 2}
                        y={padding.top + chartH + 17}
                        fill={textColor}
                        fontSize={9}
                        textAnchor="middle"
                        transform={`rotate(-20, ${x + barW / 2}, ${padding.top + chartH + 17})`}
                      >
                        {d.label.length > 12
                          ? d.label.slice(0, 11) + "..."
                          : d.label}
                      </text>
                    </g>
                  );
                });
              })()}

            {/* Line chart */}
            {chartType === "line" &&
              (() => {
                const stepX =
                  dataPoints.length > 1
                    ? chartW / (dataPoints.length - 1)
                    : chartW;
                const points = dataPoints.map((d, i) => ({
                  x:
                    padding.left +
                    (dataPoints.length > 1 ? i * stepX : chartW / 2),
                  y: padding.top + scaleY(d.value),
                }));

                const pathD = points
                  .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                  .join(" ");

                // Area fill
                const areaD =
                  pathD +
                  ` L ${points[points.length - 1].x} ${padding.top + chartH}` +
                  ` L ${points[0].x} ${padding.top + chartH} Z`;

                return (
                  <g>
                    <path d={areaD} fill={chartColor} opacity={0.12} />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={chartColor}
                      strokeWidth={2.4}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {points.map((p, i) => (
                      <g key={`pt-${i}`}>
                        <circle cx={p.x} cy={p.y} r={4.2} fill={chartColor}>
                          <title>{`${dataPoints[i].label}: ${dataPoints[i].value.toLocaleString()}`}</title>
                        </circle>
                        {/* Value label */}
                        <text
                          x={p.x}
                          y={p.y - 7}
                          fill={textColor}
                          fontSize={10}
                          textAnchor="middle"
                        >
                          {dataPoints[i].value >= 1000
                            ? `${(dataPoints[i].value / 1000).toFixed(1)}k`
                            : Number(dataPoints[i].value.toFixed(1))}
                        </text>
                        {/* X label */}
                        <text
                          x={p.x}
                          y={padding.top + chartH + 17}
                          fill={textColor}
                          fontSize={9}
                          textAnchor="middle"
                          transform={`rotate(-20, ${p.x}, ${padding.top + chartH + 17})`}
                        >
                          {dataPoints[i].label.length > 12
                            ? dataPoints[i].label.slice(0, 11) + "..."
                            : dataPoints[i].label}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })()}
          </svg>
        </div>
      </div>
    );
  };

  /* ---------------- Popup UI ---------------- */

  private renderPopup = () => {
    const {
      selectedAttrs,
      selectedOID,
      loading,
      error,
      showPopup,
      popupPosition,
      loadingAttachments,
      attachments,
      pinToCorner,
    } = this.state;

    if (!showPopup) return null;

    const fields = (this.props.config?.fieldsToShow || [])
      .map((n) => this.resolveFieldName(n) || n)
      .filter(Boolean);

    const titleField = this.props.config?.titleField || "";
    const title =
      selectedAttrs && titleField && selectedAttrs[titleField]
        ? this.formatValue(titleField, selectedAttrs[titleField])
        : selectedOID != null
          ? this.tr("title.record", { id: selectedOID })
          : this.tr("title.default");

    const view = this.state.jimuMapView?.view;
    const pinnedPos =
      pinToCorner && view ? this.calculatePinnedPosition(view) : null;

    // Calculate responsive max-width based on map container size
    let maxWidth = 360; // Smaller default for compact 1-column layout
    let containerWidth = window.innerWidth;
    let mapRect = {
      left: 0,
      right: window.innerWidth,
      width: window.innerWidth,
    } as any;

    if (view && view.container) {
      mapRect = (view.container as HTMLElement).getBoundingClientRect();
      containerWidth = mapRect.width;
      // Leave 24px margin, prefer smaller width for 1-column cards
      maxWidth = Math.max(240, Math.min(360, containerWidth - 24));
    }

    // For free popups, constrain maxWidth based on left position
    let effectiveMaxWidth = maxWidth;
    if (!pinToCorner && popupPosition) {
      // Calculate available width from popup left edge to map right edge
      const popupLeftRelativeToMap = popupPosition.x - mapRect.left;
      const availableWidth = mapRect.width - popupLeftRelativeToMap - 12;
      // Use the smaller: default maxWidth or actual available space
      effectiveMaxWidth = Math.min(maxWidth, Math.max(240, availableWidth));
    }

    const stylePinned: React.CSSProperties = pinnedPos
      ? {
          left: pinnedPos.x,
          top: pinnedPos.y,
          transform: "none",
          maxWidth: `${maxWidth}px`,
        }
      : {};

    // Apply reasonable maxWidth constraint
    const styleFree: React.CSSProperties = {
      left: popupPosition?.x || "50%",
      top: popupPosition?.y || "50%",
      transform: !popupPosition ? "translate(-50%, -50%)" : "none",
      maxWidth: `${effectiveMaxWidth}px`,
    };

    const popupStyle = pinToCorner ? stylePinned : styleFree;

    const showAttachments =
      this.props.config?.settings?.showAttachments !== false;
    const hasAttachments = (attachments?.length || 0) > 0;

    return (
      <div
        className="agri3-popup-direct"
        style={popupStyle}
        ref={this._popupRef}
      >
        <div className="agri3-popup-header">
          <h2 className="agri3-popup-title">{title}</h2>

          <button
            className={`agri3-popup-pin${pinToCorner ? " active" : ""}`}
            onClick={this.togglePinToCorner}
            title={
              pinToCorner ? this.tr("action.unpin") : this.tr("action.pin")
            }
            aria-pressed={pinToCorner}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 14,
                transform: pinToCorner ? "rotate(-25deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            >
              📌
            </span>
          </button>

          <button className="agri3-popup-close" onClick={this.closePopup} />
        </div>

        <div className="agri3-popup-content">
          {error && (
            <div className="agri3-error-container">
              <div className="agri3-error-icon">⚠</div>
              <div className="agri3-error-title">
                {this.tr("status.warning")}
              </div>
              <div className="agri3-error-message">{error}</div>
            </div>
          )}

          {loading && (
            <div className="agri3-loading-container">
              <div className="agri3-loading-spinner"></div>
              <div className="agri3-loading-text">
                {this.tr("status.loadingFeature")}
              </div>
            </div>
          )}

          {!loading && selectedAttrs && fields.length > 0 && (
            <div className="agri3-field-grid">
              {fields
                .filter(
                  (name) =>
                    selectedAttrs.hasOwnProperty(name) &&
                    selectedAttrs[name] != null &&
                    selectedAttrs[name] !== "",
                )
                .map((name) => (
                  <div className="agri3-field-item" key={name}>
                    <div className="agri3-field-label">
                      {this.getFieldAlias(name)}
                    </div>
                    <div className="agri3-field-value">
                      {this.formatValue(name, selectedAttrs[name])}
                    </div>
                  </div>
                ))}

              {fields.filter(
                (name) =>
                  selectedAttrs.hasOwnProperty(name) &&
                  selectedAttrs[name] != null &&
                  selectedAttrs[name] !== "",
              ).length === 0 && (
                <div className="agri3-status-indicator agri3-status-waiting">
                  <span>📭</span>
                  {this.tr("status.noConfiguredData")}
                </div>
              )}
            </div>
          )}

          {!loading && selectedAttrs && fields.length === 0 && (
            <div className="agri3-status-indicator agri3-status-waiting">
              <span>⚙</span>
              {this.tr("status.noFields")}
            </div>
          )}

          {/* Chart */}
          {!loading && selectedAttrs && this.renderChart()}

          {showAttachments && (
            <div className="agri3-attachments">
              <div className="agri3-attachments-header">
                <div className="agri3-attachments-title">
                  {this.tr("attachments.title")}{" "}
                  {hasAttachments ? `(${attachments.length})` : ""}
                </div>
              </div>

              {loadingAttachments && (
                <div
                  className="agri3-loading-container"
                  style={{ marginTop: 8 }}
                >
                  <div className="agri3-loading-spinner"></div>
                  <div className="agri3-loading-text">
                    {this.tr("status.loadingAttachments")}
                  </div>
                </div>
              )}

              {!loadingAttachments && !hasAttachments && (
                <div
                  className="agri3-status-indicator agri3-status-waiting"
                  style={{ marginTop: 6 }}
                >
                  <span>🗂️</span>
                  {this.tr("status.noAttachments")}
                </div>
              )}

              {!loadingAttachments && hasAttachments && (
                <div className="agri3-attachments-body">
                  <div className="agri3-attachments-images agri3-grid">
                    {attachments
                      .filter((a) => a.previewObjectUrl)
                      .map((a) => (
                        <a
                          key={`img-${a.id}`}
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="agri3-attachment-thumb agri3-card"
                          title={a.name || this.tr("attachment.imageFallback")}
                          download={a.name || undefined}
                        >
                          <img
                            src={a.previewObjectUrl!}
                            alt={a.name || this.tr("attachment.imageFallback")}
                          />
                          <div
                            className="agri3-thumb-caption"
                            title={a.name || ""}
                          >
                            {a.name || this.tr("attachment.imageFallback")}
                          </div>
                        </a>
                      ))}
                  </div>

                  <div className="agri3-attachments-files">
                    {attachments
                      .filter((a) => !a.previewObjectUrl)
                      .map((a) => (
                        <div
                          className="agri3-attachment-file agri3-card"
                          key={`file-${a.id}`}
                        >
                          <div className="agri3-attachment-file-top">
                            <div
                              className="agri3-attachment-file-name"
                              title={a.name || ""}
                            >
                              📎{" "}
                              {a.name ||
                                this.tr("attachment.fileFallback", {
                                  id: a.id,
                                })}
                            </div>
                            <a
                              className="agri3-attachment-download"
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={a.name || undefined}
                            >
                              {this.tr("attachment.download")}
                            </a>
                          </div>
                          <div className="agri3-attachment-file-meta">
                            {(a.contentType || "").split("/").pop() || ""}{" "}
                            {a.size ? `• ${this.bytesToSize(a.size)}` : ""}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !selectedAttrs && !error && (
            <div className="agri3-status-indicator agri3-status-waiting">
              <span>👆</span>
              {this.tr("status.clickPolygon")}
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { useMapWidgetIds, useDataSources } = this.props;
    const themeClass = this.state.isDarkTheme
      ? "agri3-theme-dark"
      : "agri3-theme-light";

    return (
      <div className={`agri3-attr-card ${themeClass}`}>
        {this.renderPopup()}

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0,
          }}
        >
          {/* ✅ MULTI: create DS component for EACH selected DS so we can read schemas/aliases */}
          {useDataSources?.length
            ? (useDataSources as any).map((uds: any) => (
                <DataSourceComponent
                  key={uds?.dataSourceId}
                  useDataSource={uds}
                  onDataSourceCreated={this.onDataSourceCreated}
                />
              ))
            : null}

          {useMapWidgetIds?.length ? (
            <JimuMapViewComponent
              useMapWidgetId={useMapWidgetIds[0]}
              onActiveViewChange={this.onActiveViewChange}
            />
          ) : null}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            width: "8px",
            height: "8px",
            background: this.state.featureLayers?.length
              ? "#10b981"
              : "#94a3b8",
            borderRadius: "50%",
            opacity: 0.6,
            transition: "all 0.3s ease",
            pointerEvents: "none",
          }}
          title={
            this.state.featureLayers?.length
              ? this.tr("status.ready")
              : this.tr("status.loading")
          }
        />
      </div>
    );
  }
}

interface IHandleLike {
  remove: () => void;
}
