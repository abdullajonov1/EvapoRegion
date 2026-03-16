import { type QueriableDataSource } from "jimu-core";
import { type LocalFilterState } from "./local-min-max";

export type RegionFilterKey =
  | "yil"
  | "viloyat"
  | "tuman"
  | "mavsum"
  | "fermer_nom";

/**
 * Region filter engine that mirrors Evapo-RegionV31's exact filter logic:
 *
 * - Year options: queried from distinct `yil` field per DS, or inferred from label
 * - Viloyat options: depend on {} (year-layer) or {yil} (single-DS) — NO external filters
 * - Tuman options: depend on {viloyat} — NO external filters
 * - Mavsum options: depend on {} (year-layer) or {yil} (single-DS) — NO external filters
 *
 * This matches Evapo-RegionV31's `fetchDependentFilters()` behavior exactly.
 */
export class LocalRegionFilterEngine {
  private dsById: Record<string, QueriableDataSource> = {};
  private selectedDsIds: string[] = [];
  private yearToDsId: Record<string, string> = {};

  onDsCreated(ds: QueriableDataSource, ids: string[]): void {
    if (!ds?.id) return;
    this.dsById[ds.id] = ds;
    this.selectedDsIds = [...ids];
  }

  syncDsSelection(ids: string[]): void {
    this.selectedDsIds = [...ids];
  }

  /** Get the year→DS mapping (needed by widget for activeDataSourceId) */
  getYearToDsId(): Record<string, string> {
    return { ...this.yearToDsId };
  }

  /** Get the DS URL for a given DS ID (used for URL-based layer matching) */
  getDsUrl(dsId: string): string {
    const ds: any = this.dsById[dsId];
    if (!ds) return "";
    try {
      return ds.getDataSourceJson?.()?.url || ds.url || "";
    } catch {
      return "";
    }
  }

  /** Check if we have multiple DS (year-layer mode) */
  isYearLayerMode(): boolean {
    return this.selectedDsIds.length > 1;
  }

  /** Get the active DS for a given set of filters (same as Evapo-RegionV31 getActiveQueryDataSource) */
  getActiveDs(filters: LocalFilterState): QueriableDataSource | null {
    if (this.isYearLayerMode()) {
      if (!filters.yil) return null;
      const yearDsId = this.yearToDsId[filters.yil] || "";
      return yearDsId ? this.dsById[yearDsId] || null : null;
    }
    const firstId = this.selectedDsIds[0];
    return firstId ? this.dsById[firstId] || null : null;
  }

  /** Check if a field is numeric (from cached field types) */
  isNumericField(fieldName: string): boolean {
    const t = this.getFieldType(fieldName);
    return (
      t === "esriFieldTypeInteger" ||
      t === "esriFieldTypeSmallInteger" ||
      t === "esriFieldTypeDouble" ||
      t === "esriFieldTypeSingle"
    );
  }

  /**
   * Build year options — same as Evapo-RegionV31's rebuildYearMapFromSelectedDataSources().
   * For each DS: query distinct yil → map year→dsId. Fallback: infer from DS label.
   */
  async getYearOptions(): Promise<string[]> {
    const yearToDsId: Record<string, string> = {};
    const years: string[] = [];
    const seen = new Set<string>();

    for (const dsId of this.selectedDsIds) {
      const ds = this.dsById[dsId];
      if (!ds) continue;

      // 1) Preferred: distinct yil values if the field exists
      if (this.hasField(ds, "yil")) {
        const queriedYears = await this.queryYearsFromDs(ds);
        if (queriedYears.length > 0) {
          for (const year of queriedYears) {
            if (!yearToDsId[year]) yearToDsId[year] = dsId;
            if (!seen.has(year)) {
              years.push(year);
              seen.add(year);
            }
          }
          continue;
        }
      }

      // 2) Fallback: infer year from DS label/url
      const inferred = this.inferYearFromText(this.getDsLabel(ds));
      if (inferred) {
        if (!yearToDsId[inferred]) yearToDsId[inferred] = dsId;
        if (!seen.has(inferred)) {
          years.push(inferred);
          seen.add(inferred);
        }
      } else {
        // 3) Last resort: synthetic bucket
        const synthetic = `Layer-${years.length + 1}`;
        if (!yearToDsId[synthetic]) yearToDsId[synthetic] = dsId;
        if (!seen.has(synthetic)) {
          years.push(synthetic);
          seen.add(synthetic);
        }
      }
    }

    this.yearToDsId = yearToDsId;
    return this.sortDistinct(years);
  }

  /**
   * Fetch dependent filter options — mirrors Evapo-RegionV31's fetchDependentFilters().
   *
   * @param field - The field to get distinct values for (e.g., "viloyat", "tuman", "mavsum")
   * @param filterObj - Filter constraints: e.g., {} for viloyat, {viloyat} for tuman
   * @param filters - Current filter state (used to resolve active DS)
   */
  async fetchDependentFilters(
    field: string,
    filterObj: Record<string, string>,
    filters: LocalFilterState,
  ): Promise<string[]> {
    const ds = this.getActiveDs(filters);
    if (!ds) return [];

    // Guard: target field must exist on DS
    if (!this.hasField(ds, field)) return [];

    const parts: string[] = [];

    // Build WHERE from filterObj — only include fields that DS actually has
    for (const [k, v] of Object.entries(filterObj)) {
      if (!v || !this.hasField(ds, k)) continue;
      const realK = this.resolveFieldName(ds, k) || k;

      // In year-layer mode, skip yil (DS is already per-year)
      if (this.isYearLayerMode() && realK.toLowerCase() === "yil") continue;

      if (realK.toLowerCase() === "mavsum") {
        const mavsumValues = this.getMavsumGroupedValues(v);
        if (mavsumValues.length > 1) {
          const mavsumClauses = mavsumValues
            .map((value) => this.whereEq(realK, value))
            .filter(Boolean);
          if (mavsumClauses.length > 0) {
            parts.push(`(${mavsumClauses.join(" OR ")})`);
          }
        } else if (mavsumValues.length === 1) {
          const single = this.whereEq(realK, mavsumValues[0]);
          if (single) parts.push(single);
        }
        continue;
      }

      parts.push(this.whereEq(realK, v, realK.toLowerCase() === "yil"));
    }

    const whereClause = parts.length ? parts.join(" AND ") : "1=1";
    const realField = this.resolveFieldName(ds, field) || field;

    try {
      const res = await (ds as any).query({
        where: whereClause,
        outFields: [realField],
        returnDistinctValues: true,
        pageSize: 1000,
      });

      const values = (res?.records || [])
        .map((record: any) => {
          const data = record?.getData?.();
          if (!data) return null;
          // Case-insensitive field lookup in record data
          if (data[realField] !== undefined) return data[realField];
          const target = realField.toLowerCase();
          for (const rk of Object.keys(data)) {
            if (rk.toLowerCase() === target) return data[rk];
          }
          return null;
        })
        .filter((v: any) => v !== null && v !== undefined && v !== "")
        .map((v: any) => String(v).trim())
        .filter(Boolean);

      return this.sortDistinct(values);
    } catch {
      return [];
    }
  }

  // ---- PRIVATE HELPERS ----

  private hasField(ds: QueriableDataSource | null, name: string): boolean {
    if (!ds || !name) return false;
    try {
      const schema = (ds as any)?.getSchema?.();
      const fields = (schema as any)?.fields;
      if (!fields) return false;
      const target = name.toLowerCase();
      for (const key of Object.keys(fields)) {
        if (String(key).toLowerCase() === target) return true;
      }
    } catch {}
    return false;
  }

  private getFieldType(fieldName: string): string {
    const target = String(fieldName || "").toLowerCase();
    if (!target) return "";

    const orderedIds = [
      ...this.selectedDsIds,
      ...Object.keys(this.dsById).filter(
        (id) => !this.selectedDsIds.includes(id),
      ),
    ];

    for (const dsId of orderedIds) {
      const ds = this.dsById[dsId];
      if (!ds) continue;
      try {
        const fields = (ds as any)?.getSchema?.()?.fields;
        if (!fields) continue;
        for (const key of Object.keys(fields)) {
          if (String(key).toLowerCase() !== target) continue;
          const field = fields[key];
          return String(field?.type || field?.esriType || "");
        }
      } catch {}
    }

    return "";
  }

  private async queryYearsFromDs(ds: QueriableDataSource): Promise<string[]> {
    const yearField = this.resolveFieldName(ds, "yil");
    if (!yearField) return [];

    try {
      const res = await (ds as any).query({
        where: "1=1",
        outFields: [yearField],
        pageSize: 1000,
        returnDistinctValues: true,
        returnGeometry: false,
      });

      return (res?.records || [])
        .map((record: any) =>
          this.normalizeYear(record?.getData?.()?.[yearField]),
        )
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  normalizeYear(value: unknown): string {
    return String(value ?? "")
      .trim()
      .replace(/[^\d]/g, "");
  }

  private inferYearFromText(value: string): string | null {
    const match = String(value || "").match(/(19|20)\d{2}/);
    return match ? match[0] : null;
  }

  private getDsLabel(ds: QueriableDataSource): string {
    const anyDs = ds as any;
    return String(
      anyDs?.getLabel?.() ||
        anyDs?.getDataSourceJson?.()?.label ||
        anyDs?.getDataSourceJson?.()?.sourceLabel ||
        anyDs?.getDataSourceJson?.()?.name ||
        anyDs?.getDataSourceJson?.()?.url ||
        ds?.id ||
        "",
    );
  }

  resolveFieldName(
    ds: QueriableDataSource | null,
    fieldName: string,
  ): string | null {
    if (!ds || !fieldName) return null;
    try {
      const schema = (ds as any)?.getSchema?.();
      const fields = (schema as any)?.fields;
      if (!fields) return null;
      const target = fieldName.toLowerCase();
      for (const key of Object.keys(fields)) {
        if (String(key).toLowerCase() === target) return key;
      }
    } catch {}
    return null;
  }

  private escapeArcGIS(value: string): string {
    return String(value || "").replace(/'/g, "''");
  }

  whereEq(field: string, value: string, forceNumeric = false): string {
    if (value === "" || value == null) return "";
    const numeric = forceNumeric || this.isNumericField(field);
    if (numeric) {
      const digits = this.normalizeYear(value);
      if (digits === "" || isNaN(Number(digits))) return "";
      return `${field}=${Number(digits)}`;
    }
    return `${field}='${this.escapeArcGIS(String(value))}'`;
  }

  private normalizeMavsumValue(value: string): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  private getMavsumGroupedValues(selectedValue: string): string[] {
    const selected = String(selectedValue ?? "").trim();
    if (!selected) return [];

    const normalized = this.normalizeMavsumValue(selected);
    const expandedValues = [selected];

    const isIkkilamchi =
      normalized.includes("ikkilamchi") ||
      normalized.includes("иккиламчи") ||
      normalized.includes("вторич");
    if (isIkkilamchi) {
      expandedValues.push(" Ikkilamchi", "Ikkilamchi");
    }

    const isBirlamchi =
      normalized.includes("birlamchi") ||
      normalized.includes("бирламчи") ||
      normalized.includes("первич");
    if (isBirlamchi) {
      expandedValues.push("Birlamchi va umummavsumiy");
    }

    const unique = this.sortDistinct(expandedValues);
    return unique.length ? unique : [selected];
  }

  private sortDistinct(values: string[]): string[] {
    const unique = Array.from(
      new Set(values.map((v) => String(v).trim()).filter(Boolean)),
    );
    const numeric = unique.filter((v) => /^(19|20)\d{2}$/.test(v));
    const nonNumeric = unique.filter((v) => !/^(19|20)\d{2}$/.test(v));

    numeric.sort((a, b) => Number(b) - Number(a));
    nonNumeric.sort((a, b) =>
      a.localeCompare(b, "uz", {
        sensitivity: "base",
        ignorePunctuation: true,
        numeric: true,
      }),
    );

    return [...numeric, ...nonNumeric];
  }

  /**
   * Build a WHERE clause from current filters — mirrors Evapo-RegionV31's buildWhereClause().
   * Used to apply definition filter on the map layer view.
   */
  buildWhereClause(filters: LocalFilterState): string {
    const c: string[] = [];
    const ds = this.getActiveDs(filters);

    // Helper: resolve field and push if present
    const pushIfHas = (field: string, value: string, forceNumeric = false) => {
      if (!value || !ds) return;
      const resolved = this.resolveFieldName(ds, field);
      if (resolved) c.push(this.whereEq(resolved, value, forceNumeric));
    };

    // Single-DS mode: include yil
    if (!this.isYearLayerMode() && filters.yil) {
      pushIfHas("yil", filters.yil, true);
    }

    pushIfHas("viloyat", filters.viloyat);
    pushIfHas("tuman", filters.tuman);
    if (filters.mavsum && ds) {
      const resolved = this.resolveFieldName(ds, "mavsum");
      if (resolved) {
        const mavsumValues = this.getMavsumGroupedValues(filters.mavsum);
        if (mavsumValues.length > 1) {
          const mavsumClauses = mavsumValues
            .map((value) => this.whereEq(resolved, value))
            .filter(Boolean);
          if (mavsumClauses.length > 0) {
            c.push(`(${mavsumClauses.join(" OR ")})`);
          }
        } else if (mavsumValues.length === 1) {
          const single = this.whereEq(resolved, mavsumValues[0]);
          if (single) c.push(single);
        }
      }
    }
    pushIfHas("fermer_nom", filters.fermer_nom);

    return c.length ? c.join(" AND ") : "1=1";
  }
}
