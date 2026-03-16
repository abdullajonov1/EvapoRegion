/** @jsx jsx */
import {
  DataSourceTypes,
  Immutable,
  React,
  jsx,
  type UseDataSource,
} from "jimu-core";
import { type AllWidgetSettingProps } from "jimu-for-builder";
import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector";
import { MapWidgetSelector } from "jimu-ui/advanced/setting-components";

export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<any>,
  any
> {
  private readonly supportedTypes = Immutable([DataSourceTypes.FeatureLayer]);

  private toPlainArray<T = any>(val: any): T[] {
    if (!val) return [];
    if (Array.isArray(val)) return val as T[];
    if (typeof val.asMutable === "function")
      return val.asMutable({ deep: true }) as T[];
    if (typeof val.toArray === "function") return val.toArray() as T[];
    return [];
  }

  private ensureConfig = (): any => {
    return this.props.config
      ? this.props.config
      : Immutable({
          enableMinMaxControl: true,
          enableColorRendererControl: true,
          enableRegionFilterControl: true,
          selectionPercentage: 10,
          polygonIdField: "GlobalID",
        });
  };

  private updateConfig = (key: string, value: any): void => {
    const cfg = this.ensureConfig();
    this.props.onSettingChange({
      id: this.props.id,
      config: cfg.set(key, value),
    });
  };

  private onMinMaxToggle = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.updateConfig("enableMinMaxControl", !!evt?.target?.checked);
  };

  private onColorRendererToggle = (
    evt: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    this.updateConfig("enableColorRendererControl", !!evt?.target?.checked);
  };

  private onRegionFilterToggle = (
    evt: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    this.updateConfig("enableRegionFilterControl", !!evt?.target?.checked);
  };

  private onMapWidgetSelected = (useMapWidgetIds: string[]): void => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds,
    });
  };

  private onDataSourceChange = (
    useDataSources: UseDataSource[] | any,
  ): void => {
    const plain = this.toPlainArray<UseDataSource>(useDataSources);
    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: plain,
    });
  };

  render(): React.ReactNode {
    const enabled = this.props.config?.enableMinMaxControl !== false;
    const enabledColorRenderer =
      this.props.config?.enableColorRendererControl !== false;
    const enabledRegionFilter =
      this.props.config?.enableRegionFilterControl !== false;

    return (
      <div style={{ padding: 16 }}>
        <h4 style={{ marginBottom: 10 }}>Content</h4>
        <p style={{ marginBottom: 14, fontSize: 12, color: "#5b6b7a" }}>
          Map va Feature Layer tanlang. Min/Max iconni yoqish/o'chirish ham shu
          yerda.
        </p>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Map widget</div>
          <MapWidgetSelector
            useMapWidgetIds={this.props.useMapWidgetIds}
            onSelect={this.onMapWidgetSelected}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Data source (Feature layer)
          </div>
          <DataSourceSelector
            mustUseDataSource
            types={this.supportedTypes}
            useDataSources={Immutable(
              this.toPlainArray<UseDataSource>(this.props.useDataSources),
            )}
            onChange={this.onDataSourceChange}
            widgetId={this.props.id}
            hideDataView={true}
            isMultiple={true}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={this.onMinMaxToggle}
          />
          <span>Show Min/Max icon</span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <input
            type="checkbox"
            checked={enabledColorRenderer}
            onChange={this.onColorRendererToggle}
          />
          <span>Show Color Renderer</span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <input
            type="checkbox"
            checked={enabledRegionFilter}
            onChange={this.onRegionFilterToggle}
          />
          <span>Show Region Filter</span>
        </label>
      </div>
    );
  }
}
