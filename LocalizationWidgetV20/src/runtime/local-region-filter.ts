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
    if (!ds || !fieldName) {
      console.warn("[LocalRegionFilter] resolveFieldName: no ds or fieldName");
      return null;
    }
    try {
      const schema = (ds as any)?.getSchema?.();
      const fields = (schema as any)?.fields;
      if (!fields) {
        console.warn("[LocalRegionFilter] resolveFieldName: no schema fields");
        return null;
      }
      const target = fieldName.toLowerCase();
      const availableFields = Object.keys(fields);
      console.log(
        "[LocalRegionFilter] resolveFieldName: looking for",
        fieldName,
        "in fields:",
        availableFields.slice(0, 10).join(", "),
      );
      for (const key of availableFields) {
        if (String(key).toLowerCase() === target) {
          console.log(
            "[LocalRegionFilter] resolveFieldName: FOUND",
            fieldName,
            "→",
            key,
          );
          return key;
        }
      }
      console.warn(
        "[LocalRegionFilter] resolveFieldName: NOT FOUND",
        fieldName,
      );
    } catch (e) {
      console.error("[LocalRegionFilter] resolveFieldName error:", e);
    }
    return null;
  }

  private escapeArcGIS(value: string): string {
    return String(value || "").replace(/'/g, "''");
  }

  private getApostropheVariants(value: string): string[] {
    const raw = String(value ?? "").trim();
    if (!raw) return [];

    const base = raw.replace(/[’`ʻ‘ʼ]/g, "'");
    const variants = [
      base,
      base.replace(/'/g, "’"),
      base.replace(/'/g, "`"),
      base.replace(/'/g, "ʻ"),
      base.replace(/'/g, "‘"),
      base.replace(/'/g, "ʼ"),
    ];

    return this.sortDistinct(variants);
  }

  private getRegionValueVariants(value: string): string[] {
    const raw = String(value ?? "").trim();
    if (!raw) return [];

    const baseVariants = this.getApostropheVariants(raw);
    const expanded = new Set<string>();
    const hasCyrillic = /[\u0400-\u04FF]/.test(raw);
    const latinSuffix = " viloyati";
    const cyrSuffix = " вилояти";

    const push = (candidate: string): void => {
      const clean = String(candidate ?? "").trim();
      if (!clean) return;
      expanded.add(clean);
      this.getApostropheVariants(clean).forEach((variant) =>
        expanded.add(variant),
      );
    };

    baseVariants.forEach((variant) => {
      push(variant);

      const lower = variant.toLowerCase();
      if (hasCyrillic) {
        if (lower.endsWith(cyrSuffix)) {
          push(variant.slice(0, -cyrSuffix.length).trim());
        } else {
          push(`${variant}${cyrSuffix}`);
        }
      } else {
        if (lower.endsWith(latinSuffix)) {
          push(variant.slice(0, -latinSuffix.length).trim());
        } else if (!lower.endsWith(" viloyat")) {
          push(`${variant}${latinSuffix}`);
        }
      }
    });

    return this.sortDistinct(Array.from(expanded));
  }

  private whereTextMatches(
    field: string,
    value: string,
    aliases: string[] = [],
  ): string {
    const variants = this.sortDistinct([
      ...this.getApostropheVariants(value),
      ...aliases,
    ]);
    if (!variants.length) return "";
    if (variants.length === 1)
      return `${field}='${this.escapeArcGIS(variants[0])}'`;
    return `(${variants.map((variant) => `${field}='${this.escapeArcGIS(variant)}'`).join(" OR ")})`;
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

    console.log("[LocalRegionFilter] buildWhereClause called with filters:", {
      viloyat: filters.viloyat,
      tuman: filters.tuman,
      yil: filters.yil,
      dsId: (ds as any)?.id,
    });

    // Helper: resolve field and push if present
    const pushIfHas = (field: string, value: string, forceNumeric = false) => {
      if (!value || !ds) {
        console.log("[LocalRegionFilter] pushIfHas skipped:", {
          field,
          value,
          hasDs: !!ds,
        });
        return;
      }
      const resolved = this.resolveFieldName(ds, field);
      console.log("[LocalRegionFilter] Field resolution:", {
        field,
        value,
        resolved,
      });
      if (resolved) {
        const clause =
          !forceNumeric && field === "viloyat"
            ? this.whereTextMatches(
                resolved,
                value,
                this.getRegionValueVariants(value),
              )
            : this.whereEq(resolved, value, forceNumeric);
        console.log("[LocalRegionFilter] WHERE clause built:", clause);
        c.push(clause);
      } else {
        console.warn(
          "[LocalRegionFilter] Field not found in datasource:",
          field,
        );
      }
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

    const result = c.length ? c.join(" AND ") : "1=1";
    console.log("[LocalRegionFilter] Final WHERE clause:", result);
    return result;
  }

  /**
   * Check if a filter combination has any data.
   * Used for cascading validation: when a filter changes, validate if other filters still have data.
   *
   * @param testFilters - Filters to validate (includes the new/changed filter)
   * @returns true if at least 1 record matches the filter combination, false otherwise
   */
  async checkFilterCombinationExists(
    testFilters: LocalFilterState,
  ): Promise<boolean> {
    const ds = this.getActiveDs(testFilters);
    if (!ds) return false;

    const whereClause = this.buildWhereClause(testFilters);

    try {
      const res = await (ds as any).query({
        where: whereClause,
        returnGeometry: false,
        pageSize: 1,
        returnDistinctValues: false,
      });

      // Return true if at least 1 record exists
      return (res?.records || []).length > 0;
    } catch (error) {
      console.warn("Error validating filter combination:", error);
      return false; // Assume invalid if query fails
    }
  }
}
