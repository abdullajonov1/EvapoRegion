/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { type AllWidgetSettingProps } from "jimu-for-builder";
import { MapWidgetSelector } from "jimu-ui/advanced/setting-components";
import { Select, Option } from "jimu-ui";

export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<any>,
  any
> {
  onIndicatorSelected = (value: string): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("indicatorType", value),
    });
  };

  onMapWidgetSelected = (useMapWidgetIds: string[]): void => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds,
    });
  };

  render(): React.ReactNode {
    const rawIndicatorType = this.props.config?.indicatorType || "count-area";
    const indicatorType =
      rawIndicatorType === "count" || rawIndicatorType === "area"
        ? "count-area"
        : rawIndicatorType === "yield" || rawIndicatorType === "efficiency"
          ? "yield-efficiency"
          : rawIndicatorType;
    return (
      <div className="widget-setting-evapo-indicators" style={{ padding: 12 }}>
        <h5 style={{ marginBottom: 8 }}>EvapoIndicatorsV20</h5>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
          Select one combined indicator block to display in the widget. Connect
          a map widget to enable Yield and Efficiency values.
        </p>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 13, display: "block" }}>
            Indicator type
          </label>
          <Select
            size="sm"
            value={indicatorType}
            onChange={(evt) => this.onIndicatorSelected(evt?.target?.value)}
          >
            <Option value="count-area">Ekin maydonlari (soni + ga)</Option>
            <Option value="yield-efficiency">Hosildorlik + Samaradorlik</Option>
          </Select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 13 }}>
            Select Map Widget
          </label>
          <MapWidgetSelector
            useMapWidgetIds={this.props.useMapWidgetIds}
            onSelect={this.onMapWidgetSelected}
          />
        </div>
      </div>
    );
  }
}
