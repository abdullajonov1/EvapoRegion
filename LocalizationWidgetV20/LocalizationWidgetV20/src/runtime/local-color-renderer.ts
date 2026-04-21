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

/** Brauzer konsoli (widget.tsx `console` shadow qilinmaydi). */
function crLog(phase: string, detail?: Record<string, unknown>): void {
  try {
    (globalThis as any).console?.log?.(
      "[LocalColorRendererEngine]",
      phase,
      detail ?? {},
    );
  } catch {
    /* ignore */
  }
}

function layerDebugInfo(l: __esri.FeatureLayer | null | undefined): Record<
  string,
  unknown
> | null {
  if (!l) return null;
  let defExpr = "";
  try {
    defExpr = String((l as any).definitionExpression ?? "");
  } catch {
    defExpr = "(read error)";
  }
  const names = (l.fields || [])
    .slice(0, 32)
    .map((f) => f?.name)
    .filter(Boolean);
  return {
    id: l.id,
    title: l.title,
    visible: l.visible,
    url: (l as any).url,
    definitionExpressionPreview:
      defExpr.length > 160 ? `${defExpr.slice(0, 160)}…` : defExpr,
    fieldNameSample: names,
  };
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
  /**
   * Feature layers tied to these DS ids are preferred when picking a layer for
   * crop/efficiency render. Set from LocalizationWidget using the same year→DS
   * resolution as applyMapFilters (getDsIdsMatchingYear / getActiveDs), so e.g.
   * 2025 targets the correct FL even when layer titles do not contain "2025".
   */
  private preferredDsIds: string[] | null = null;

  // ── Internal renderer state ──────────────────────────────────────────────
  /** Remember original renderer per layer id (so we can restore on reset). */
  private originalRendererByLayerId: Map<string, __esri.Renderer | null> =
    new Map();
  /** Layers we have modified during current visualization session. */
  private touchedLayerIds: Set<string> = new Set();

  // ── Public API ───────────────────────────────────────────────────────────

  /** Called when JimuMapViewComponent fires onActiveViewChange. */
  setMapView(jimuMapView: JimuMapView | null): void {
    this.jimuMapView = jimuMapView;
    if (!jimuMapView) this.preferredDsIds = null;
    crLog("setMapView", {
      hasView: !!jimuMapView?.view,
      mapTitle: (jimuMapView as any)?.view?.map?.portalItem?.title ?? null,
    });
  }

  /** Keep the current filter year so layer selection is biased correctly. */
  setYear(year: string): void {
    const next = year || "";
    if (next !== this.currentYear) {
      crLog("setYear", { year: next, previous: this.currentYear || null });
    }
    this.currentYear = next;
  }

  /**
   * Called when a DataSource becomes ready.
   * Mirrors onDsCreated in LocalMinMaxEngine.
   */
  onDsCreated(ds: QueriableDataSource, selectedIds: string[]): void {
    if (!ds?.id) return;
    this.dsById[ds.id] = ds;
    this.selectedDsIds = selectedIds;
    const fl = (ds as any)?.layer as __esri.FeatureLayer | undefined;
    crLog("onDsCreated", {
      dsId: ds.id,
      selectedIds,
      dsLayerType: fl?.type ?? null,
      dsLayerId: fl?.id ?? null,
      dsLayerTitle: fl?.title ?? null,
    });
  }

  /** Called when selected data-source IDs change. */
  syncDsSelection(ids: string[]): void {
    this.selectedDsIds = ids;
    crLog("syncDsSelection", { selectedIds: ids });
  }

  /**
   * Restrict layer picking to FeatureLayers bound to these DS ids (same logic
   * as map region filters). Pass null to clear.
   */
  setPreferredDataSourceIds(ids: string[] | null): void {
    this.preferredDsIds = ids?.length ? [...ids] : null;
    crLog("setPreferredDataSourceIds", { ids: this.preferredDsIds });
  }

  /** Returns true if at least one suitable feature layer is available. */
  hasLayer(): boolean {
    return this._pickLayer(null, { log: false }) !== null;
  }

  /**
   * Apply crop-type unique-value renderer.
   * Returns null on success, or a human-readable error string.
   */
  visualizeCropType(): string | null {
    crLog("visualizeCropType → start", {
      currentYear: this.currentYear,
      selectedDsIds: this.selectedDsIds,
    });
    const layer = this._pickLayer("ekin_turi");
    if (!layer) {
      crLog("visualizeCropType → abort", {
        reason: "no layer",
        candidateCount: this._allLayers().length,
      });
      return "Tegishli qatlam (feature layer) topilmadi";
    }

    const field = this._findField(layer, "ekin_turi");
    if (!field) {
      crLog("visualizeCropType → abort", {
        reason: "no ekin_turi field",
        layer: layerDebugInfo(layer),
      });
      return "ekin_turi maydoni topilmadi";
    }

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
    this.touchedLayerIds.add(String(layer.id));
    crLog("visualizeCropType → applied unique-value", {
      field,
      uniqueValueInfoCount: CROP_COLORS.length,
      layer: layerDebugInfo(layer),
    });
    return null;
  }

  /**
   * Apply water-efficiency class-breaks renderer.
   * Returns null on success, or a human-readable error string.
   */
  visualizeWaterEfficiency(): string | null {
    crLog("visualizeWaterEfficiency → start", {
      currentYear: this.currentYear,
      selectedDsIds: this.selectedDsIds,
    });
    const layer = this._pickLayer("eff");
    if (!layer) {
      crLog("visualizeWaterEfficiency → abort", {
        reason: "no layer",
        candidateCount: this._allLayers().length,
      });
      return "Tegishli qatlam (feature layer) topilmadi";
    }

    const field = this._findField(layer, "eff");
    if (!field) {
      crLog("visualizeWaterEfficiency → abort", {
        reason: "no eff field",
        layer: layerDebugInfo(layer),
      });
      return "eff maydoni topilmadi";
    }

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
    this.touchedLayerIds.add(String(layer.id));
    crLog("visualizeWaterEfficiency → applied class-breaks", {
      field,
      layer: layerDebugInfo(layer),
    });
    return null;
  }

  /** Restore the original renderer saved before any visualize* call. */
  resetVisualization(): void {
    const had = this.touchedLayerIds.size > 0;
    crLog("resetVisualization", {
      hadActiveLayer: had,
      touchedLayerCount: this.touchedLayerIds.size,
      storedOriginalCount: this.originalRendererByLayerId.size,
    });
    if (!had) return;

    const all = this._allLayers();
    const byId = new Map<string, __esri.FeatureLayer>();
    for (const l of all) byId.set(String(l.id), l);

    for (const layerId of Array.from(this.touchedLayerIds)) {
      const layer = byId.get(String(layerId));
      if (!layer) continue;
      const orig = this.originalRendererByLayerId.get(String(layerId));
      if (orig !== undefined) {
        try {
          layer.renderer = orig as any;
          this._refresh(layer);
        } catch {}
      }
    }

    this.touchedLayerIds.clear();
    this.originalRendererByLayerId.clear();
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /** Save original renderer per layer (only once). */
  private _saveOriginal(layer: __esri.FeatureLayer): void {
    const id = String(layer?.id ?? "");
    if (!id) return;
    if (this.originalRendererByLayerId.has(id)) return;
    this.originalRendererByLayerId.set(id, (layer as any).renderer ?? null);
  }

  /**
   * Collect every FeatureLayer from:
   *   1. Selected data sources (via `.layer`) — **first**, so _pickLayer matches the
   *      same FeatureLayer(s) LocalizationWidget applies region filters to.
   *   2. The active map view (GroupLayer walk) — only layers not already listed.
   *
   * Previously map layers were enumerated first; any other visible feature layer
   * with a similar field name could "win" and never received definitionExpression,
   * so region filters looked broken while a color renderer was active.
   */
  private _allLayers(): __esri.FeatureLayer[] {
    const ordered: __esri.FeatureLayer[] = [];
    const seen = new Set<__esri.FeatureLayer>();
    const mgr = DataSourceManager.getInstance();

    const push = (l: __esri.FeatureLayer | undefined): void => {
      if (l?.type !== "feature" || seen.has(l)) return;
      seen.add(l);
      ordered.push(l);
    };

    this.selectedDsIds.forEach((id) => {
      const ds = (this.dsById[id] ?? mgr?.getDataSource(id)) as any;
      push(ds?.layer as __esri.FeatureLayer | undefined);
    });

    if (this.jimuMapView?.view?.map) {
      const walk = (col: __esri.Collection<__esri.Layer>): void => {
        col.forEach((l) => {
          if (l.type === "feature") {
            push(l as __esri.FeatureLayer);
          } else if (l.type === "group") {
            const g = l as __esri.GroupLayer;
            if (g.layers) walk(g.layers as __esri.Collection<__esri.Layer>);
          }
        });
      };
      walk(this.jimuMapView.view.map.layers);
    }

    return ordered;
  }

  /** Prefer FLs whose id matches ds.layer for preferredDsIds (from widget / year). */
  private _narrowByPreferredDs(
    all: __esri.FeatureLayer[],
  ): __esri.FeatureLayer[] {
    if (!this.preferredDsIds?.length) return all;

    const mgr = DataSourceManager.getInstance();
    const allowedLayerIds = new Set<string>();

    for (const dsId of this.preferredDsIds) {
      const ds = (this.dsById[dsId] ?? mgr.getDataSource(dsId)) as any;
      const fl = ds?.layer as __esri.FeatureLayer | undefined;
      if (fl?.id != null) allowedLayerIds.add(String(fl.id));
    }

    if (!allowedLayerIds.size) return all;

    const narrowed = all.filter(
      (l) => l?.id != null && allowedLayerIds.has(String(l.id)),
    );

    if (!narrowed.length) {
      crLog("_narrowByPreferredDs: id mismatch, using full list", {
        preferredDsIds: this.preferredDsIds,
        allowedLayerIds: [...allowedLayerIds],
        candidateLayerIds: all.map((l) => String(l?.id ?? "")),
      });
      return all;
    }
    return narrowed;
  }

  /** Title / url / portalItem / definitionExpression contains filter year digits. */
  private _layerMatchesYearHint(l: __esri.FeatureLayer): boolean {
    const yr = this.currentYear;
    if (!yr) return true;
    const y = String(yr).trim();
    if (!y) return true;
    const haystack = [
      l?.title,
      (l as any)?.url,
      (l as any)?.portalItem?.title,
      (l as any)?.definitionExpression,
    ]
      .map((x) => String(x ?? ""))
      .join("\n");
    return haystack.includes(y);
  }

  /**
   * Pick the best matching feature layer.
   *
   * Priority (highest → lowest):
   *   1. Visible + has requiredField + year hint (title/url/defExpr…)
   *   2. Any    + has requiredField + year hint
   *   3. Visible + has requiredField
   *   4. Any    + has requiredField
   *   5. Visible + has any TARGET_FIELD
   *   6. Any    + has any TARGET_FIELD
   *   7. First visible layer
   *   8. First layer
   */
  private _pickLayer(
    requiredField: string | null,
    opts: { log?: boolean } = {},
  ): __esri.FeatureLayer | null {
    const doLog = opts.log !== false;
    const allRaw = this._allLayers();
    const all = this._narrowByPreferredDs(allRaw);
    if (!all.length) {
      if (doLog) {
        crLog("_pickLayer", {
          requiredField,
          currentYear: this.currentYear,
          totalCandidatesRaw: allRaw.length,
          totalCandidates: 0,
          preferredDsIds: this.preferredDsIds,
          picked: null,
        });
      }
      return null;
    }

    const yr = this.currentYear;
    const visible = all.filter((l) => l.visible);

    const hasReq = (l: __esri.FeatureLayer): boolean =>
      !requiredField || !!this._findField(l, requiredField);

    const hasAny = (l: __esri.FeatureLayer): boolean =>
      TARGET_FIELDS.some((f) => !!this._findField(l, f));

    const matchYrHint = (l: __esri.FeatureLayer): boolean =>
      !yr || this._layerMatchesYearHint(l);

    const picked =
      visible.find((l) => hasReq(l) && matchYrHint(l)) ??
      all.find((l) => hasReq(l) && matchYrHint(l)) ??
      visible.find(hasReq) ??
      all.find(hasReq) ??
      visible.find(hasAny) ??
      all.find(hasAny) ??
      visible[0] ??
      all[0] ??
      null;

    const maxList = 14;
    const candidates = all.slice(0, maxList).map((l) => ({
      id: l.id,
      title: l.title,
      visible: l.visible,
      hasRequired: requiredField ? hasReq(l) : null,
      resolvedField: requiredField ? this._findField(l, requiredField) : null,
      yearHint: matchYrHint(l),
    }));

    if (doLog) {
      crLog("_pickLayer", {
        requiredField,
        currentYear: yr,
        preferredDsIds: this.preferredDsIds,
        totalCandidatesRaw: allRaw.length,
        totalCandidates: all.length,
        visibleCount: visible.length,
        listedCandidates: candidates,
        truncated: all.length > maxList,
        picked: layerDebugInfo(picked),
      });
    }

    return picked;
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
      crLog("_refresh", { layerId: layer?.id, ok: true });
    } catch (e) {
      crLog("_refresh", {
        layerId: layer?.id,
        ok: false,
        error: String(e),
      });
    }
  }
}
