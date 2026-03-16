import {
  DataSource,
  DataSourceManager,
  DataSourceTypes,
  IMFieldSchema,
  IMUseDataSource,
  Immutable,
  ImmutableArray,
  ImmutableObject,
  React,
  UseDataSource,
  getAppStore,
} from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { Label, Option, Select, Switch, TextInput } from "jimu-ui";
import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector";
import { MapWidgetSelector } from "jimu-ui/advanced/setting-components";
import { ColorPicker } from "jimu-ui/basic/color-picker";

type FieldsMap = ImmutableObject<{
  [dsId: string]: ImmutableArray<IMFieldSchema>;
}>;

type FieldInfo = {
  name: string;
  alias: string;
  type: string;
};

type Config = {
  fieldsToShow?: string[];
  titleField?: string;
  labels?: Record<string, string>;
  settings?: {
    zoomToSelection?: boolean;
    showMapPopup?: boolean;
    showAttachments?: boolean;
  };
  selectedFieldsMap?: FieldsMap;
  chartEnabled?: boolean;
  chartType?: "bar" | "line";
  chartTitle?: string;
  chartFields?: string[];
  chartColor?: string;
};

interface State {
  dss: DataSource[] | null;
  selectedFieldsMap: FieldsMap;
  titleField: string;
  zoomToSelection: boolean;
  showMapPopup: boolean;
  allFields: FieldInfo[];
  fieldsDropdownOpen: boolean;
  chartFieldsDropdownOpen: boolean;
}

export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<Config>,
  State
> {
  supported = Immutable([DataSourceTypes.FeatureLayer]);
  dsMgr = DataSourceManager.getInstance();
  fieldsDropdownRef = React.createRef<HTMLDivElement>();
  chartFieldsDropdownRef = React.createRef<HTMLDivElement>();

  constructor(props: AllWidgetSettingProps<Config>) {
    super(props);

    const emptyMap = Immutable({}) as FieldsMap;
    const incoming = (props.config?.selectedFieldsMap ?? emptyMap) as FieldsMap;

    this.state = {
      dss: null,
      selectedFieldsMap: incoming,
      titleField: props.config?.titleField || "",
      zoomToSelection: props.config?.settings?.zoomToSelection !== false,
      showMapPopup: !!props.config?.settings?.showMapPopup,
      allFields: [],
      fieldsDropdownOpen: false,
      chartFieldsDropdownOpen: false,
    };
  }

  componentDidMount(): void {
    this.autoDetectMapWidget();
    this.initializeDataSources();
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentDidUpdate(prev: Readonly<AllWidgetSettingProps<Config>>): void {
    if (prev.useDataSources !== this.props.useDataSources) {
      this.initializeDataSources();
    }
  }

  componentWillUnmount(): void {
    this.cleanupDataSources();
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  private handleClickOutside = (e: MouseEvent) => {
    if (
      this.fieldsDropdownRef.current &&
      !this.fieldsDropdownRef.current.contains(e.target as Node)
    ) {
      this.setState({ fieldsDropdownOpen: false });
    }
    if (
      this.chartFieldsDropdownRef.current &&
      !this.chartFieldsDropdownRef.current.contains(e.target as Node)
    ) {
      this.setState({ chartFieldsDropdownOpen: false });
    }
  };

  private onAttachmentsToggle = (e: any) => {
    const val = !!e?.target?.checked;
    this.updateConfig({
      settings: {
        ...(this.props.config?.settings || {}),
        showAttachments: val,
      },
    });
  };

  /* ---------------- Map auto-detect ---------------- */

  private autoDetectMapWidget = () => {
    if (
      !this.props.useMapWidgetIds ||
      this.props.useMapWidgetIds.length === 0
    ) {
      const state = getAppStore().getState();
      const mapWidgets = state.appConfig.widgets;
      const mapWidgetId = Object.keys(mapWidgets).find(
        (id) => mapWidgets[id]?.manifest?.name === "map",
      );
      if (mapWidgetId) {
        this.props.onSettingChange({
          id: this.props.id,
          useMapWidgetIds: [mapWidgetId],
        });
      }
    }
  };

  /* ---------------- DS lifecycle ---------------- */

  private initializeDataSources = async () => {
    if (this.props.useDataSources?.length) {
      await this.createDataSources(
        this.props.useDataSources.asMutable() as IMUseDataSource[],
      );
    } else {
      this.setState({ dss: null, allFields: [] });
    }
  };

  private cleanupDataSources = () => {
    this.props.useDataSources?.forEach((uds) => {
      if (uds?.dataSourceId) this.dsMgr.destroyDataSource(uds.dataSourceId);
    });
  };

  private createDataSources = async (useList: IMUseDataSource[]) => {
    const dsArr: DataSource[] = [];
    for (const uds of useList) {
      try {
        const ds = await this.dsMgr.createDataSourceByUseDataSource(uds);
        if (ds) dsArr.push(ds);
      } catch (e) {
        console.warn("[Setting] create DS error:", e);
      }
    }
    this.setState({ dss: dsArr }, () => this.extractFieldsFromDs());
  };

  private extractFieldsFromDs = () => {
    const dss = this.state.dss;
    if (!dss || dss.length === 0) {
      this.setState({ allFields: [] });
      return;
    }
    const ds = dss[0] as any;
    const schema = ds?.getSchema?.();
    const fieldsObj = schema?.fields || {};
    const fields: FieldInfo[] = Object.keys(fieldsObj).map((key) => {
      const f = fieldsObj[key];
      return {
        name: f?.name || f?.jimuName || key,
        alias: f?.alias || f?.displayName || f?.name || key,
        type: f?.type || f?.esriType || "unknown",
      };
    });
    this.setState({ allFields: fields });
  };

  /* ---------------- Helpers ---------------- */

  private updateConfig = (patch: Partial<Config>) => {
    const merged: any = { ...(this.props.config || {}), ...patch };
    this.props.onSettingChange({ id: this.props.id, config: merged });
  };

  private getAllDsIds(): string[] {
    const list =
      (this.props.useDataSources?.asMutable?.() as IMUseDataSource[]) || [];
    return list.map((x) => x?.dataSourceId).filter(Boolean) as string[];
  }

  /* ---------------- Handlers ---------------- */

  private onMapSelected = (ids: string[]) => {
    this.props.onSettingChange({ id: this.props.id, useMapWidgetIds: ids });
  };

  private onDataSourceChange = (useDataSources: UseDataSource[]) => {
    this.props.onSettingChange({ id: this.props.id, useDataSources });
  };

  private toggleField = (fieldName: string) => {
    const current = this.props.config?.fieldsToShow || [];
    let next: string[];
    if (current.includes(fieldName)) {
      next = current.filter((f) => f !== fieldName);
    } else {
      next = [...current, fieldName];
    }

    const allDsIds = this.getAllDsIds();
    const allFields = this.state.allFields;
    const picked = allFields.filter((f) => next.includes(f.name));
    const imArr = Immutable(picked) as any;
    let nextMap: any = this.state.selectedFieldsMap || Immutable({});
    for (const dsId of allDsIds) {
      nextMap = nextMap.set(dsId, imArr);
    }

    this.setState({ selectedFieldsMap: nextMap as FieldsMap });
    this.updateConfig({
      fieldsToShow: next,
      selectedFieldsMap: nextMap as FieldsMap,
    });
  };

  private toggleChartField = (fieldName: string) => {
    const current = this.props.config?.chartFields || [];
    let next: string[];
    if (current.includes(fieldName)) {
      next = current.filter((f) => f !== fieldName);
    } else {
      next = [...current, fieldName];
    }
    this.updateConfig({ chartFields: next });
  };

  private onChartEnabledToggle = (e: any) => {
    this.updateConfig({ chartEnabled: !!e?.target?.checked });
  };

  private onChartTypeChange = (e: any) => {
    this.updateConfig({ chartType: e?.target?.value as "bar" | "line" });
  };

  private onChartTitleChange = (val: string) => {
    this.updateConfig({ chartTitle: val });
  };

  private onChartColorChange = (color: string) => {
    this.updateConfig({ chartColor: color });
  };

  private onZoomToggle = (e: any) => {
    const val = !!e?.target?.checked;
    this.setState({ zoomToSelection: val });
    this.updateConfig({
      settings: {
        ...(this.props.config?.settings || {}),
        zoomToSelection: val,
      },
    });
  };

  private onPopupToggle = (e: any) => {
    const val = !!e?.target?.checked;
    this.setState({ showMapPopup: val });
    this.updateConfig({
      settings: { ...(this.props.config?.settings || {}), showMapPopup: val },
    });
  };

  /* ---------------- Render helpers ---------------- */

  private renderMultiSelect = (
    selectedItems: string[],
    onToggle: (name: string) => void,
    isOpen: boolean,
    onToggleOpen: () => void,
    dropdownRef: React.RefObject<HTMLDivElement>,
    placeholder: string,
  ) => {
    const { allFields } = this.state;
    const selectedLabels = selectedItems
      .map((name) => {
        const f = allFields.find((ff) => ff.name === name);
        return f?.alias || name;
      })
      .join(", ");

    return (
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <div
          onClick={onToggleOpen}
          style={{
            padding: "6px 10px",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 4,
            cursor: "pointer",
            background: "rgba(255,255,255,0.06)",
            color: selectedItems.length > 0 ? "#e9f8ff" : "#9cc7dd",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 32,
            userSelect: "none",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {selectedItems.length > 0
              ? `${selectedItems.length} tanlangan: ${selectedLabels}`
              : placeholder}
          </span>
          <span
            style={{
              marginLeft: 8,
              transition: "transform 0.2s",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              fontSize: 10,
            }}
          >
            ▼
          </span>
        </div>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 9999,
              background: "#0d2f49",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              maxHeight: 220,
              overflowY: "auto",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              marginTop: 2,
            }}
          >
            {allFields.length === 0 && (
              <div
                style={{ padding: "8px 12px", color: "#9cc7dd", fontSize: 12 }}
              >
                Maydonlar topilmadi
              </div>
            )}
            {allFields.map((f) => {
              const isSelected = selectedItems.includes(f.name);
              return (
                <div
                  key={f.name}
                  onClick={() => onToggle(f.name)}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: isSelected
                      ? "rgba(0,174,239,0.15)"
                      : "transparent",
                    transition: "background 0.15s",
                    fontSize: 13,
                    color: "#e9f8ff",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = isSelected
                      ? "rgba(0,174,239,0.22)"
                      : "rgba(255,255,255,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isSelected
                      ? "rgba(0,174,239,0.15)"
                      : "transparent")
                  }
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      border: isSelected
                        ? "2px solid #00aeef"
                        : "2px solid rgba(255,255,255,0.3)",
                      background: isSelected ? "#00aeef" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </span>
                  <span style={{ flex: 1 }}>{f.alias}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#6ba3c0",
                      textTransform: "uppercase",
                    }}
                  >
                    {f.type === "esriFieldTypeString" || f.type === "string"
                      ? "ABC"
                      : f.type === "esriFieldTypeDouble" ||
                          f.type === "esriFieldTypeSingle" ||
                          f.type === "esriFieldTypeInteger" ||
                          f.type === "esriFieldTypeSmallInteger" ||
                          f.type === "number"
                        ? "123"
                        : f.type === "esriFieldTypeDate" || f.type === "date"
                          ? "📅"
                          : f.type === "esriFieldTypeOID" || f.type === "oid"
                            ? "OID"
                            : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ---------------- Render ---------------- */

  render() {
    const { useMapWidgetIds, useDataSources, id, config } = this.props;
    const dsConnected = !!(useDataSources && useDataSources.length > 0);
    const fieldsToShow = config?.fieldsToShow || [];
    const chartEnabled = !!config?.chartEnabled;
    const chartType = config?.chartType || "bar";
    const chartTitle = config?.chartTitle || "";
    const chartFields = config?.chartFields || [];
    const chartColor = config?.chartColor || "#3b82f6";

    return (
      <div style={{ padding: 16 }}>
        {/* 1) Map widget */}
        <section style={{ marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 8px" }}>Map Widget</h4>
          <MapWidgetSelector
            autoSelect
            onSelect={this.onMapSelected}
            useMapWidgetIds={useMapWidgetIds}
          />
        </section>

        {/* 2) Feature layer data source */}
        <section style={{ marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 8px" }}>Feature Layers</h4>
          <p style={{ margin: "0 0 8px", color: "#666", fontSize: 12 }}>
            Polygon qatlamlarini tanlang (masalan, yillik qatlamlar).
          </p>
          <DataSourceSelector
            mustUseDataSource
            types={this.supported}
            useDataSources={useDataSources}
            onChange={this.onDataSourceChange}
            widgetId={id}
            isMultiple
          />
        </section>

        {/* 3) Fields to display - multi-select dropdown */}
        {dsConnected && (
          <section style={{ marginBottom: 20 }}>
            <h4 style={{ margin: "0 0 8px" }}>Maydonlar (Fields to Display)</h4>
            <p style={{ margin: "0 0 8px", color: "#666", fontSize: 12 }}>
              Polygon bosilganda ko'rsatiladigan atributlarni tanlang.
            </p>
            {this.renderMultiSelect(
              fieldsToShow,
              this.toggleField,
              this.state.fieldsDropdownOpen,
              () =>
                this.setState((s) => ({
                  fieldsDropdownOpen: !s.fieldsDropdownOpen,
                  chartFieldsDropdownOpen: false,
                })),
              this.fieldsDropdownRef,
              "Maydonlarni tanlang...",
            )}
          </section>
        )}

        {/* 4) Chart section */}
        {dsConnected && (
          <section
            style={{
              marginBottom: 20,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: chartEnabled ? 14 : 0,
              }}
            >
              <h4 style={{ margin: 0 }}>📊 Chart</h4>
              <Switch
                checked={chartEnabled}
                onChange={this.onChartEnabledToggle}
              />
            </div>

            {chartEnabled && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Chart type */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      color: "#9cc7dd",
                    }}
                  >
                    Chart turi
                  </label>
                  <Select
                    size="sm"
                    value={chartType}
                    onChange={this.onChartTypeChange}
                    style={{ width: "100%" }}
                  >
                    <Option value="bar">📊 Bar Chart</Option>
                    <Option value="line">📈 Line Chart</Option>
                  </Select>
                </div>

                {/* Chart title */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      color: "#9cc7dd",
                    }}
                  >
                    Chart sarlavhasi
                  </label>
                  <TextInput
                    size="sm"
                    placeholder="Chart nomini yozing..."
                    value={chartTitle}
                    onChange={(e) => this.onChartTitleChange(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Chart fields */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      color: "#9cc7dd",
                    }}
                  >
                    Chart maydonlari
                  </label>
                  {this.renderMultiSelect(
                    chartFields,
                    this.toggleChartField,
                    this.state.chartFieldsDropdownOpen,
                    () =>
                      this.setState((s) => ({
                        chartFieldsDropdownOpen: !s.chartFieldsDropdownOpen,
                        fieldsDropdownOpen: false,
                      })),
                    this.chartFieldsDropdownRef,
                    "Chart uchun maydonlarni tanlang...",
                  )}
                </div>

                {/* Chart color */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      color: "#9cc7dd",
                    }}
                  >
                    Chart rangi
                  </label>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ColorPicker
                      color={chartColor}
                      onChange={this.onChartColorChange}
                    />
                    <span style={{ fontSize: 12, color: "#9cc7dd" }}>
                      {chartColor}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5) Behaviors */}
        <section style={{ marginBottom: 10 }}>
          <h4 style={{ margin: "0 0 8px" }}>Behavior</h4>
          <div style={{ display: "grid", gap: 10 }}>
            <Label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Switch
                checked={this.state.zoomToSelection}
                onChange={this.onZoomToggle}
              />
              Zoom to selection
            </Label>
            <Label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Switch
                checked={this.state.showMapPopup}
                onChange={this.onPopupToggle}
              />
              Also open map popup
            </Label>
            <Label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Switch
                checked={this.props.config?.settings?.showAttachments !== false}
                onChange={this.onAttachmentsToggle}
              />
              Include attachments (Photos & Files)
            </Label>
          </div>
        </section>
      </div>
    );
  }
}
