import { QueriableDataSource } from "jimu-core";

export type LocalMinMaxMode = "min" | "max";

export interface LocalFilterState {
  yil: string;
  viloyat: string;
  tuman: string;
  mavsum: string;
  fermer_nom: string;
}

export interface FetchMinMaxResult {
  ids: string[];
  polygonIdField: string;
  sourceDataSourceId: string;
}

export interface FetchBothResult {
  min: FetchMinMaxResult;
  max: FetchMinMaxResult;
}

export type AdditionalWhereClause = string | string[] | null | undefined;

const POLY_CANDIDATES = [
  "GlobalID",
  "OBJECTID",
  "FID",
  "polygon_id",
  "id",
  "ID",
];

export class LocalMinMaxEngine {
  private dsById: Record<string, QueriableDataSource> = {};
  private yearToDsId: Record<string, string> = {};
  private pct = 10;
  private polyField = "GlobalID";
  private _reqId = 0;
  private _ctrl: AbortController | null = null;

  /** Cancel all pending fetch operations — aborts in-flight HTTP too */
  cancel(): void {
    this._reqId++;
    if (this._ctrl) {
      this._ctrl.abort();
      this._ctrl = null;
    }
  }

  setPct(v: number): void {
    this.pct = Math.max(1, Math.min(50, v || 10));
  }

  setPolyField(f: string): void {
    if (f?.trim()) this.polyField = f.trim();
  }

  onDsCreated(ds: QueriableDataSource, ids: string[]): void {
    if (!ds?.id) return;
    this.dsById[ds.id] = ds;
    this.rebuildYearMap(ids);
  }

  syncDsSelection(ids: string[]): void {
    this.rebuildYearMap(ids);
  }

  /** Fetch only min or only max polygon IDs */
  async fetchSingle(
    mode: LocalMinMaxMode,
    filters: LocalFilterState,
    dsIds: string[],
    additionalWhere?: AdditionalWhereClause,
  ): Promise<FetchMinMaxResult> {
    const reqId = ++this._reqId;
    this._ctrl?.abort();
    this._ctrl = new AbortController();
    const signal = this._ctrl.signal;

    const ds = this.resolveDs(filters, dsIds);
    if (!ds) throw new Error("DS not connected");

    const polyId = this.resolvePolyId(ds);
    const field = "uwt_m3ha";
    const where = this.buildQueryWhere(filters, field, additionalWhere);
    const layer = this.getLayer(ds);

    const count = layer
      ? await this.qCountLayer(layer, where, signal)
      : await this.qCountDs(ds, where, field);
    this.assertReq(reqId);
    if (!count)
      return { ids: [], polygonIdField: polyId, sourceDataSourceId: ds.id };

    const take = Math.max(1, Math.ceil((count * this.pct) / 100));
    const ids = layer
      ? await this.qIdsLayer(layer, polyId, field, where, mode, take, signal)
      : await this.qIdsDs(ds, polyId, field, where, mode, take);
    this.assertReq(reqId);
    return { ids, polygonIdField: polyId, sourceDataSourceId: ds.id };
  }

  /** Fetch both min + max with shared count query + parallel sorted queries */
  async fetchBoth(
    filters: LocalFilterState,
    dsIds: string[],
    additionalWhere?: AdditionalWhereClause,
  ): Promise<FetchBothResult> {
    const reqId = ++this._reqId;
    this._ctrl?.abort();
    this._ctrl = new AbortController();
    const signal = this._ctrl.signal;

    const ds = this.resolveDs(filters, dsIds);
    if (!ds) throw new Error("DS not connected");

    const polyId = this.resolvePolyId(ds);
    const field = "uwt_m3ha";
    const where = this.buildQueryWhere(filters, field, additionalWhere);
    const layer = this.getLayer(ds);

    const count = layer
      ? await this.qCountLayer(layer, where, signal)
      : await this.qCountDs(ds, where, field);
    this.assertReq(reqId);
    if (!count) {
      const e: FetchMinMaxResult = {
        ids: [],
        polygonIdField: polyId,
        sourceDataSourceId: ds.id,
      };
      return { min: e, max: { ...e } };
    }

    const take = Math.max(1, Math.ceil((count * this.pct) / 100));

    // Parallel min + max sorted queries
    const [minIds, maxIds] = layer
      ? await Promise.all([
          this.qIdsLayer(layer, polyId, field, where, "min", take, signal),
          this.qIdsLayer(layer, polyId, field, where, "max", take, signal),
        ])
      : await Promise.all([
          this.qIdsDs(ds, polyId, field, where, "min", take),
          this.qIdsDs(ds, polyId, field, where, "max", take),
        ]);
    this.assertReq(reqId);

    return {
      min: { ids: minIds, polygonIdField: polyId, sourceDataSourceId: ds.id },
      max: { ids: maxIds, polygonIdField: polyId, sourceDataSourceId: ds.id },
    };
  }

  normalizeYear(value: any): string {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    return this.extractYear(value) || this.extractYear(raw) || raw;
  }

  // ── private ──

  private assertReq(id: number): void {
    if (id !== this._reqId) throw new Error("cancelled");
  }

  /** Extract the underlying FeatureLayer from a DataSource (bypasses DS overhead) */
  private getLayer(ds: QueriableDataSource): any | null {
    const a = ds as any;
    const layer = a.layer || a._layer;
    if (
      layer &&
      typeof layer.queryFeatures === "function" &&
      typeof layer.queryFeatureCount === "function" &&
      typeof layer.createQuery === "function"
    ) {
      return layer;
    }
    return null;
  }

  /** Adaptive page size from layer's maxRecordCount */
  private getLayerPageSize(layer: any): number {
    try {
      const max1 = layer?.capabilities?.query?.maxRecordCount;
      const max2 = layer?.serviceDefinition?.maxRecordCount;
      const max3 = layer?.layerDefinition?.maxRecordCount;
      const candidate = Number(max1 || max2 || max3);
      if (Number.isFinite(candidate) && candidate > 0) {
        return Math.max(200, Math.min(candidate, 5000));
      }
    } catch {
      /* ignore */
    }
    return 2000;
  }

  private resolveDs(
    filters: LocalFilterState,
    dsIds: string[],
  ): QueriableDataSource | null {
    const y = this.normalizeYear(filters.yil);
    if (y) {
      const mapped = this.yearToDsId[y];
      if (mapped && this.dsById[mapped]) return this.dsById[mapped];
    }
    for (const id of dsIds) if (this.dsById[id]) return this.dsById[id];
    return null;
  }

  private buildWhere(f: LocalFilterState): string {
    const c: string[] = ["1=1"];
    if (f.viloyat) c.push(`viloyat = '${this.esc(f.viloyat)}'`);
    if (f.tuman) c.push(`tuman = '${this.esc(f.tuman)}'`);
    if (f.mavsum) c.push(this.mavsumClause(f.mavsum));
    if (f.fermer_nom) c.push(`fermer_nom = '${this.esc(f.fermer_nom)}'`);

    const y = this.normalizeYear(f.yil);
    if (y && /^\d{4}$/.test(y)) c.push(`yil = ${y}`);
    return c.join(" AND ");
  }

  private buildQueryWhere(
    filters: LocalFilterState,
    field: string,
    additionalWhere?: AdditionalWhereClause,
  ): string {
    const clauses = [this.buildWhere(filters)];
    const extras = Array.isArray(additionalWhere)
      ? additionalWhere
      : additionalWhere
        ? [additionalWhere]
        : [];

    extras.forEach((clause) => {
      const value = String(clause ?? "").trim();
      if (value && value !== "1=1") clauses.push(value);
    });

    clauses.push(`${field} IS NOT NULL`);
    return clauses.join(" AND ");
  }

  private mavsumClause(raw: string): string {
    const n = String(raw).trim().toLowerCase();
    if (
      n.includes("ikkilamchi") ||
      n.includes("\u0438\u043a\u043a\u0438\u043b\u0430\u043c\u0447\u0438") ||
      n.includes("\u0432\u0442\u043e\u0440\u0438\u0447")
    )
      return "(mavsum = ' Ikkilamchi' OR mavsum = 'Ikkilamchi')";
    if (
      n.includes("birlamchi") ||
      n.includes("\u0431\u0438\u0440\u043b\u0430\u043c\u0447\u0438") ||
      n.includes("\u043f\u0435\u0440\u0432\u0438\u0447")
    )
      return "mavsum = 'Birlamchi va umummavsumiy'";
    return `mavsum = '${this.esc(raw)}'`;
  }

  private esc(v: string): string {
    return String(v || "").replace(/'/g, "''");
  }

  // ── Fast path: direct FeatureLayer queries ──

  private async qCountLayer(
    layer: any,
    where: string,
    signal: AbortSignal,
  ): Promise<number> {
    try {
      const q = layer.createQuery();
      q.where = where;
      const count = await layer.queryFeatureCount(q, { signal });
      return Number.isFinite(count) ? count : 0;
    } catch (e: any) {
      if (e?.name === "AbortError") throw e;
      return 0;
    }
  }

  private async qIdsLayer(
    layer: any,
    polyId: string,
    field: string,
    where: string,
    mode: LocalMinMaxMode,
    take: number,
    signal: AbortSignal,
  ): Promise<string[]> {
    const dir = mode === "min" ? "ASC" : "DESC";
    const pageSize = this.getLayerPageSize(layer);
    const ids: string[] = [];
    let start = 0;

    while (ids.length < take) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const num = Math.min(pageSize, take - ids.length);
      const q = layer.createQuery();
      q.where = where;
      q.outFields = [polyId];
      q.returnGeometry = false;
      q.orderByFields = [`${field} ${dir}`];
      q.start = start;
      q.num = num;

      const res = await layer.queryFeatures(q, { signal });
      const batch = (res?.features || [])
        .map((f: any) => f?.attributes?.[polyId])
        .filter((v: any) => v != null)
        .map((v: any) => String(v));

      if (!batch.length) break;
      ids.push(...batch);
      start += num;
      if (batch.length < num) break;
    }
    return ids.slice(0, take);
  }

  // ── Fallback: DataSource queries ──

  private async qCountDs(
    ds: QueriableDataSource,
    where: string,
    field: string,
  ): Promise<number> {
    try {
      const res = await (ds as any).query({
        where,
        outStatistics: [
          {
            onStatisticField: field,
            outStatisticFieldName: "cnt",
            statisticType: "count",
          },
        ],
        pageSize: 1,
      });
      const val = Number(this.readField(res?.records?.[0], "cnt"));
      return Number.isFinite(val) ? val : 0;
    } catch {
      return 0;
    }
  }

  private async qIdsDs(
    ds: QueriableDataSource,
    polyId: string,
    field: string,
    where: string,
    mode: LocalMinMaxMode,
    take: number,
  ): Promise<string[]> {
    const order = `${field} ${mode === "min" ? "ASC" : "DESC"}`;
    const ids: string[] = [];
    let offset = 0;
    const page = 2000;

    while (ids.length < take) {
      const num = Math.min(page, take - ids.length);
      const res = await (ds as any).query({
        where,
        outFields: [polyId],
        returnGeometry: false,
        orderByFields: [order],
        pageSize: num,
        resultOffset: offset,
      });
      const recs = res?.records || [];
      if (!recs.length) break;
      for (const r of recs) {
        const v = this.readField(r, polyId);
        if (v != null) ids.push(String(v));
        if (ids.length >= take) break;
      }
      offset += recs.length;
      if (recs.length < num) break;
    }
    return ids;
  }

  // ── Shared helpers ──

  private readField(rec: any, name: string): any {
    const d = rec?.getData?.() || rec?.attributes || rec || {};
    if (d[name] !== undefined) return d[name];
    const t = name.toLowerCase();
    for (const k of Object.keys(d)) if (k.toLowerCase() === t) return d[k];
    return undefined;
  }

  private resolvePolyId(ds: QueriableDataSource): string {
    const fields = this.schemaFields(ds);
    const match = (name: string) =>
      fields.find((f) => f.toLowerCase() === name.toLowerCase());
    const cfg = match(this.polyField);
    if (cfg) return cfg;
    for (const c of POLY_CANDIDATES) {
      const f = match(c);
      if (f) return f;
    }
    return fields[0] || this.polyField;
  }

  private schemaFields(ds: QueriableDataSource): string[] {
    const f = (ds as any)?.getSchema?.()?.fields;
    return f ? Object.keys(f) : [];
  }

  private rebuildYearMap(ids: string[]): void {
    this.yearToDsId = {};
    for (const id of ids) {
      const ds: any = this.dsById[id];
      const y =
        this.extractYear(id) ||
        this.extractYear(ds?.getLabel?.()) ||
        this.extractYear(ds?.getDataSourceJson?.()?.label) ||
        this.extractYear(ds?.getDataSourceJson?.()?.sourceLabel) ||
        this.extractYear(ds?.getDataSourceJson?.()?.name);
      if (y && !this.yearToDsId[y]) this.yearToDsId[y] = id;
    }
  }

  private extractYear(v: any): string | null {
    if (v == null) return null;
    if (v instanceof Date) {
      const y = v.getUTCFullYear();
      return y >= 1900 && y <= 2100 ? String(y) : null;
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      const i = Math.trunc(v);
      return i >= 1900 && i <= 2100 ? String(i) : null;
    }
    const s = String(v).trim();
    if (/^(19|20)\d{2}$/.test(s)) return s;
    const m = s.match(/(19|20)\d{2}/);
    if (m) return m[0];
    const ms = Date.parse(s);
    if (!Number.isNaN(ms)) {
      const y = new Date(ms).getUTCFullYear();
      return y >= 1900 && y <= 2100 ? String(y) : null;
    }
    return null;
  }
}
