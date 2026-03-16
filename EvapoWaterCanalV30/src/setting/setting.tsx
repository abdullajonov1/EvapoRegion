/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { type AllWidgetSettingProps } from "jimu-for-builder";
import { MapWidgetSelector } from "jimu-ui/advanced/setting-components";
import { Select, Option } from "jimu-ui";

export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<any>,
  any
> {
  onViewTypeSelected = (value: string): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("viewType", value),
    });
  };

  onMapWidgetSelected = (useMapWidgetIds: string[]): void => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds,
    });
  };

  render(): React.ReactNode {
    const viewType = this.props.config?.viewType || "waterSource";
    return (
      <div className="widget-setting-evapo-water-canal" style={{ padding: 12 }}>
        <h5 style={{ marginBottom: 8 }}>EvapoWaterCanalV20</h5>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
          Select the view type to display: Water Source chart or Canal chart.
          Connect a map widget to enable data fetching and map interactions.
        </p>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 13, display: "block" }}>
            View type
          </label>
          <Select
            size="sm"
            value={viewType}
            onChange={(evt) => this.onViewTypeSelected(evt?.target?.value)}
          >
            <Option value="waterSource">Water Source</Option>
            <Option value="canal">Canal</Option>
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
