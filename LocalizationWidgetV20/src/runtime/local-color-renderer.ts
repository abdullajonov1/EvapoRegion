import { type QueriableDataSource, DataSourceManager } from "jimu-core";
import type { JimuMapView } from "jimu-arcgis";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ColorVisualization = "crop" | "efficiency" | null;

// ── Constants ─────────────────────────────────────────────────────────────────

/** Feature layer field names we recognise when scanning for a suitable layer */
const TARGET_FIELDS = ["AWt_m3ha", "ekin_turi", "eff"];

/** Fully transparent outline — keeps polygon borders clean */
const OUTLINE = {
  color: [0, 0, 0, 0] as [number, number, number, number],
  width: 0,
};

/** Crop type → hex colour mapping (matches EvapoColorRendererV30) */
const CROP_COLORS: Array<{ value: string; hex: string }> = [
  { value: "Bug'doy", hex: "ffaa00" },
  { value: "Paxta", hex: "ffffff" },
  { value: "Makkajo'xori", hex: "f5ef49" },
  { value: "Bog'", hex: "147a12" },
  { value: "Bogi", hex: "147a12" },
  { value: "Mosh", hex: "7ac48c" },
  { value: "Sholi", hex: "008bfc" },
  { value: "Beda", hex: "05ff4c" },
  { value: "Aralash ekin", hex: "f0eeaf" },
  { value: "Bo'z yer", hex: "868f8d" },
  { value: "Ikkilamchi ekin ekilmagan", hex: "cbecc4" },
  { value: "Ikkiamchi ekin ekilmagan", hex: "cbecc4" },
  { value: "Baliq hovuz", hex: "adfbff" },
  { value: "Bolig hovuz", hex: "adfbff" },
  { value: "Qovun-tarvuz", hex: "e695dd" },
  { value: "Vegetatsiyasiz", hex: "fd7f6f" },
  { value: "Sabzi", hex: "8a6629" },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function hexToRgba(hex: string): [number, number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16), 1.0]
    : [170, 170, 170, 1.0];
}

// ── Engine ────────────────────────────────────────────────────────────────────

/**
 * Self-contained colour-renderer engine for LocalizationWidgetV20.
 *
 * Mirrors the LocalMinMaxEngine pattern:
 *   - Widget passes map-view / data-source references via setMapView / onDsCreated.
 *   - Widget calls visualizeCropType / visualizeWaterEfficiency / resetVisualization.
 *   - Engine owns all layer-finding logic and renderer state.
 */
export class LocalColorRendererEngine {
  // ── External references (provided by the widget) ────────────────────────
  private jimuMapView: JimuMapView | null = null;
  private dsById: Record<string, QueriableDataSource> = {};
  private selectedDsIds: string[] = [];
  private currentYear = "";

  // ── Internal renderer state ──────────────────────────────────────────────
  /** Layer we most recently applied a renderer to. */
  private activeLayer: __esri.FeatureLayer | null = null;
  /** Renderer that was on the layer BEFORE we touched it. */
  private originalRenderer: __esri.Renderer | null = null;

  // ── Public API ───────────────────────────────────────────────────────────

  /** Called when JimuMapViewComponent fires onActiveViewChange. */
  setMapView(jimuMapView: JimuMapView | null): void {
    this.jimuMapView = jimuMapView;
  }

  /** Keep the current filter year so layer selection is biased correctly. */
  setYear(year: string): void {
    this.currentYear = year || "";
  }

  /**
   * Called when a DataSource becomes ready.
   * Mirrors onDsCreated in LocalMinMaxEngine.
   */
  onDsCreated(ds: QueriableDataSource, selectedIds: string[]): void {
    if (!ds?.id) return;
    this.dsById[ds.id] = ds;
    this.selectedDsIds = selectedIds;
  }

  /** Called when selected data-source IDs change. */
  syncDsSelection(ids: string[]): void {
    this.selectedDsIds = ids;
  }

  /** Returns true if at least one suitable feature layer is available. */
  hasLayer(): boolean {
    return this._pickLayer(null) !== null;
  }

  /**
   * Apply crop-type unique-value renderer.
   * Returns null on success, or a human-readable error string.
   */
  visualizeCropType(): string | null {
    const layer = this._pickLayer("ekin_turi");
    if (!layer) return "Tegishli qatlam (feature layer) topilmadi";

    const field = this._findField(layer, "ekin_turi");
    if (!field) return "ekin_turi maydoni topilmadi";

    this._saveOriginal(layer);

    layer.renderer = {
      type: "unique-value",
      field,
      defaultSymbol: {
        type: "simple-fill",
        color: hexToRgba("aaaaaa"),
        outline: OUTLINE,
      },
      uniqueValueInfos: CROP_COLORS.map((c) => ({
        value: c.value,
        label: c.value,
        symbol: {
          type: "simple-fill",
          color: hexToRgba(c.hex),
          outline: OUTLINE,
        },
      })),
    } as unknown as __esri.Renderer;

    this._refresh(layer);
    this.activeLayer = layer;
    return null;
  }

  /**
   * Apply water-efficiency class-breaks renderer.
   * Returns null on success, or a human-readable error string.
   */
  visualizeWaterEfficiency(): string | null {
    const layer = this._pickLayer("eff");
    if (!layer) return "Tegishli qatlam (feature layer) topilmadi";

    const field = this._findField(layer, "eff");
    if (!field) return "eff maydoni topilmadi";

    this._saveOriginal(layer);

    layer.renderer = {
      type: "class-breaks",
      field,
      defaultSymbol: {
        type: "simple-fill",
        color: [200, 200, 200, 1.0] as [number, number, number, number],
        outline: OUTLINE,
      },
      classBreakInfos: [
        {
          minValue: 0,
          maxValue: 10,
          label: "< 10 (Juda past)",
          symbol: {
            type: "simple-fill",
            color: [215, 25, 28, 1.0] as [number, number, number, number],
            outline: OUTLINE,
          },
        },
        {
          minValue: 10,
          maxValue: 40,
          label: "10–40 (Past)",
          symbol: {
            type: "simple-fill",
            color: [253, 174, 97, 1.0] as [number, number, number, number],
            outline: OUTLINE,
          },
        },
        {
          minValue: 40,
          maxValue: 70,
          label: "40–70 (O'rtacha)",
          symbol: {
            type: "simple-fill",
            color: [255, 255, 191, 1.0] as [number, number, number, number],
            outline: OUTLINE,
          },
        },
        {
          minValue: 70,
          maxValue: 999_999,
          label: "> 70 (A'lo)",
          symbol: {
            type: "simple-fill",
            color: [26, 152, 80, 1.0] as [number, number, number, number],
            outline: OUTLINE,
          },
        },
      ],
    } as unknown as __esri.Renderer;

    this._refresh(layer);
    this.activeLayer = layer;
    return null;
  }

  /** Restore the original renderer saved before any visualize* call. */
  resetVisualization(): void {
    if (this.activeLayer && this.originalRenderer) {
      this.activeLayer.renderer = this.originalRenderer;
      this._refresh(this.activeLayer);
    }
    this.activeLayer = null;
    this.originalRenderer = null;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /** Save original renderer only on first call, or when we switch to a different layer. */
  private _saveOriginal(layer: __esri.FeatureLayer): void {
    if (!this.originalRenderer || this.activeLayer !== layer) {
      this.originalRenderer = layer.renderer;
    }
  }

  /**
   * Collect every FeatureLayer from:
   *   1. The active map view (walks GroupLayer nesting recursively)
   *   2. The selected data sources (via `.layer` property)
   */
  private _allLayers(): __esri.FeatureLayer[] {
    const seen = new Set<__esri.FeatureLayer>();

    if (this.jimuMapView?.view?.map) {
      const walk = (col: __esri.Collection<__esri.Layer>): void => {
        col.forEach((l) => {
          if (l.type === "feature") {
            seen.add(l as __esri.FeatureLayer);
          } else if (l.type === "group") {
            const g = l as __esri.GroupLayer;
            if (g.layers) walk(g.layers as __esri.Collection<__esri.Layer>);
          }
        });
      };
      walk(this.jimuMapView.view.map.layers);
    }

    const mgr = DataSourceManager.getInstance();
    this.selectedDsIds.forEach((id) => {
      const ds = (this.dsById[id] ?? mgr?.getDataSource(id)) as any;
      const l = ds?.layer as __esri.FeatureLayer | undefined;
      if (l?.type === "feature") seen.add(l);
    });

    return Array.from(seen);
  }

  /**
   * Pick the best matching feature layer.
   *
   * Priority (highest → lowest):
   *   1. Visible + has requiredField + title contains currentYear
   *   2. Any    + has requiredField + title contains currentYear
   *   3. Visible + has requiredField
   *   4. Any    + has requiredField
   *   5. Visible + has any TARGET_FIELD
   *   6. Any    + has any TARGET_FIELD
   *   7. First visible layer
   *   8. First layer
   */
  private _pickLayer(requiredField: string | null): __esri.FeatureLayer | null {
    const all = this._allLayers();
    if (!all.length) return null;

    const yr = this.currentYear;
    const visible = all.filter((l) => l.visible);

    const hasReq = (l: __esri.FeatureLayer): boolean =>
      !requiredField || !!this._findField(l, requiredField);

    const hasAny = (l: __esri.FeatureLayer): boolean =>
      TARGET_FIELDS.some((f) => !!this._findField(l, f));

    const matchYr = (l: __esri.FeatureLayer): boolean =>
      !yr || String(l?.title ?? "").includes(yr);

    return (
      visible.find((l) => hasReq(l) && matchYr(l)) ??
      all.find((l) => hasReq(l) && matchYr(l)) ??
      visible.find(hasReq) ??
      all.find(hasReq) ??
      visible.find(hasAny) ??
      all.find(hasAny) ??
      visible[0] ??
      all[0] ??
      null
    );
  }

  /** Case-insensitive + partial field-name search. */
  private _findField(layer: __esri.FeatureLayer, name: string): string | null {
    if (!layer?.fields) return null;
    const exact = layer.fields.find((f) => f.name === name);
    if (exact) return exact.name;
    const ci = layer.fields.find(
      (f) => f.name.toLowerCase() === name.toLowerCase(),
    );
    if (ci) return ci.name;
    const partial = layer.fields.find(
      (f) =>
        f.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(f.name.toLowerCase()),
    );
    return partial?.name ?? null;
  }

  private _refresh(layer: __esri.FeatureLayer): void {
    try {
      (layer as any).refresh?.();
    } catch {
      // no-op
    }
  }
}
