import { 
    React, 
    DataSourceTypes, 
    Immutable, 
    UseDataSource,
    IMUseDataSource,
    getAppStore,
    DataSource,
    IMFieldSchema,
    ImmutableObject
} from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { DataSourceSelector, FieldSelector } from 'jimu-ui/advanced/data-source-selector';
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components';
import { DataSourceManager } from 'jimu-core';
import { Switch, Radio, Select, Option, Label, Checkbox, TextInput } from 'jimu-ui';
import { ChartType } from '../config';

interface SettingState {
    dss: DataSource[] | null;
    metricFields: ImmutableObject<{ [dataSourceId: string]: string[] }> | null;
    isMultiple: boolean;
    chartEnabled: boolean;
    chartType: ChartType;
}

export default class Setting extends React.PureComponent<
    AllWidgetSettingProps<any>,
    SettingState
> {
    supportedTypes = Immutable([DataSourceTypes.FeatureLayer]);
    dsManager = DataSourceManager.getInstance();
    
    constructor(props) {
        super(props);
        
        // Initialize state from config
        this.state = {
            dss: null,
            metricFields: this.props.config?.metricFields || null,
            isMultiple: true,
            chartEnabled: this.props.config?.chartEnabled !== false, // Default to true if not set
            chartType: this.props.config?.chartType || 'pie' // Default to pie chart
        };
    }
    
    componentDidMount() {
        this.autoDetectMapWidget();
        this.initializeDataSources();
    }
    
    componentDidUpdate(prevProps) {
        if (this.props.useDataSources !== prevProps.useDataSources) {
            this.initializeDataSources();
        }
    }
    
    componentWillUnmount() {
        this.cleanupDataSources();
    }
    
    // Auto-detect map widget if not already set
    autoDetectMapWidget = () => {
        if (!this.props.useMapWidgetIds || this.props.useMapWidgetIds.length === 0) {
            const state = getAppStore().getState();
            const mapWidgets = state.appConfig.widgets;
            
            const mapWidgetId = Object.keys(mapWidgets).find(wid => {
                const widget = mapWidgets[wid];
                return widget.manifest && widget.manifest.name === 'map';
            });
        
            if (mapWidgetId) {
                this.props.onSettingChange({
                    id: this.props.id,
                    useMapWidgetIds: [mapWidgetId]
                });
            }
        }
    }
    
    // Initialize data sources from config
    initializeDataSources = () => {
        if (this.props.useDataSources && this.props.useDataSources.length > 0) {
            this.createDataSources();
        }
    }
    
    // Clean up data sources when component unmounts
    cleanupDataSources = () => {
        if (this.props.useDataSources) {
            this.props.useDataSources.forEach(useDs => {
                if (useDs && useDs.dataSourceId) {
                    this.dsManager.destroyDataSource(useDs.dataSourceId);
                }
            });
        }
    }
    
    // Create data sources from given data source configs
    createDataSources = async (customUseDataSources?: IMUseDataSource[]) => {
        const useDataSourcesToUse = customUseDataSources || this.props.useDataSources;
        if (!useDataSourcesToUse || useDataSourcesToUse.length === 0) {
            this.setState({ dss: null });
            return;
        }
    
        const dataSources: DataSource[] = [];
        
        // Load existing settings or initialize new ones with correct typing
        let existingMetricFields = this.props.config?.metricFields
            ? this.props.config.metricFields
            : Immutable({} as { [dataSourceId: string]: string[] });
    
        // Process each data source
        for (let useDs of useDataSourcesToUse) {
            try {
                const ds = await this.dsManager.createDataSourceByUseDataSource(useDs as IMUseDataSource);
                if (ds && ds.getSchema()) {
                    const fields = ds.getSchema().fields;
                    const fieldNames = Object.keys(fields);
                    
                    // Set default metric fields if none exist
                    if (!existingMetricFields.get(ds.id)) {
                        const defaultMetricFields = this.getDefaultMetricFields(fieldNames);
                        if (defaultMetricFields.length > 0) {
                            existingMetricFields = existingMetricFields.set(ds.id, defaultMetricFields);
                            this.updateConfigFields('metricFields', existingMetricFields);
                        }
                    }
        
                    dataSources.push(ds);
                }
            } catch (err) {
                console.error('Error creating data source:', err);
            }
        }
    
        if (dataSources.length > 0) {
            this.setState({ 
                dss: dataSources,
                metricFields: existingMetricFields
            });
        }
    };
    
    // Get default metric fields based on available fields
    getDefaultMetricFields = (fieldNames: string[]): string[] => {
        // First try to find numeric fields that are commonly used for metrics
        const commonMetricFields = fieldNames.filter(f =>
            ['yld_tot', 'awt_m3ha', 'uwt_m3ha', 'area', 'length', 'population', 
             'count', 'value', 'amount', 'total', 'sum', 'average', 'height', 'width'].includes(f.toLowerCase())
        );
        
        if (commonMetricFields.length > 0) {
            return commonMetricFields;
        }
        
        // If no common metric fields found, return first 3 fields or all if less than 3
        return fieldNames.slice(0, Math.min(3, fieldNames.length));
    }
    
    // Update config with new field settings
    updateConfigFields = (configKey: string, fields: ImmutableObject<{ [dataSourceId: string]: string[] }>) => {
        if (this.props.config) {
            const newConfig = this.props.config.set
                ? this.props.config.set(configKey, fields)
                : Immutable({
                    ...this.props.config,
                    [configKey]: fields
                });
                
            this.props.onSettingChange({
                id: this.props.id,
                config: newConfig
            });
        }
    }
    
    // Toggle chart display
    onChartEnabledChange = (evt) => {
        const chartEnabled = evt.target.checked;
        this.setState({ chartEnabled });
        
        // Update config
        if (this.props.config) {
            const newConfig = this.props.config.set
                ? this.props.config.set('chartEnabled', chartEnabled)
                : Immutable({
                    ...this.props.config,
                    chartEnabled: chartEnabled
                });
                
            this.props.onSettingChange({
                id: this.props.id,
                config: newConfig
            });
        }
    }

    // Handle chart type change
    onChartTypeChange = (evt) => {
        const chartType = evt.target.value as ChartType;
        this.setState({ chartType });
        
        // Update config
        if (this.props.config) {
            const newConfig = this.props.config.set
                ? this.props.config.set('chartType', chartType)
                : Immutable({
                    ...this.props.config,
                    chartType: chartType
                });
                
            this.props.onSettingChange({
                id: this.props.id,
                config: newConfig
            });
        }
    }
    
    // Handle data source selection change
    onDataSourceChange = (useDataSources: UseDataSource[]) => {
        this.props.onSettingChange({
            id: this.props.id,
            useDataSources: useDataSources
        });
    };
    
    // Handle map widget selection change
    onMapWidgetSelected = async (selectedIds: string[]) => {
        this.props.onSettingChange({
            id: this.props.id,
            useMapWidgetIds: selectedIds
        });
    
        await this.autoDetectDataSourcesFromMap(selectedIds);
    };

    // Auto-detect data sources from selected map
    autoDetectDataSourcesFromMap = async (selectedMapIds: string[]) => {
        if (selectedMapIds.length === 0) return;

        const state = getAppStore().getState();
        const mapId = selectedMapIds[0];
        const widget = state.appConfig.widgets[mapId];
    
        // Look for feature layer data sources in the map
        if (widget && widget.useDataSources) {
            const mapDataSources = widget.useDataSources;
            
            // Filter for feature layer data sources
            const featureLayerDs = mapDataSources.filter(ds => 
                ds.dataSourceId && 
                state.appConfig.dataSources[ds.dataSourceId] &&
                state.appConfig.dataSources[ds.dataSourceId].type === 'FEATURE_LAYER'
            );
            
            if (featureLayerDs.length > 0) {
                // Use the first feature layer data source
                const featureLayerDataSource = featureLayerDs[0];
                
                // Convert fields to a regular array if needed
                const fieldsArray = this.extractFields(featureLayerDataSource);
                
                // Create a plain object data source
                const plainUseDs: UseDataSource = {
                    dataSourceId: featureLayerDataSource.dataSourceId,
                    mainDataSourceId: featureLayerDataSource.mainDataSourceId || featureLayerDataSource.dataSourceId,
                    dataViewId: featureLayerDataSource.dataViewId || 'default',
                    rootDataSourceId: featureLayerDataSource.rootDataSourceId || featureLayerDataSource.dataSourceId,
                    fields: fieldsArray
                };
                
                this.props.onSettingChange({
                    id: this.props.id,
                    useDataSources: [plainUseDs]
                });
                
                // Create a new IMUseDataSource to pass to createDataSources
                const imUseDs: IMUseDataSource = Immutable({
                    dataSourceId: plainUseDs.dataSourceId,
                    mainDataSourceId: plainUseDs.mainDataSourceId,
                    dataViewId: plainUseDs.dataViewId,
                    rootDataSourceId: plainUseDs.rootDataSourceId
                });
                
                await this.createDataSources([imUseDs]);
            }
        }
    }
    
    // Extract fields from a data source
    extractFields = (dataSource): string[] => {
        let fieldsArray: string[] = [];
        
        if (dataSource.fields) {
            // Handle different field formats
            if (Array.isArray(dataSource.fields)) {
                fieldsArray = [...dataSource.fields];
            } 
            else if (typeof dataSource.fields === 'object' && dataSource.fields.length >= 0) {
                // Convert array-like object to array
                fieldsArray = [];
                for (let i = 0; i < dataSource.fields.length; i++) {
                    fieldsArray.push(dataSource.fields[i]);
                }
            } 
            else if (typeof dataSource.fields === 'object') {
                fieldsArray = Object.keys(dataSource.fields);
            }
        }
        
        return fieldsArray;
    }
    
    // Handle metric field selection change
    onMetricFieldChange = (selectedFields: IMFieldSchema[], ds: DataSource) => {
        if (!ds) return;
        
        console.log('Metric field selection changed:', selectedFields);
        
        // Get current fields or initialize new ones with the correct type
        let newMetricFields = this.state.metricFields || Immutable({} as { [dataSourceId: string]: string[] });
        
        // Update fields for the data source
        newMetricFields = newMetricFields.set(ds.id, selectedFields.map(f => f.jimuName));
        
        // Update state and config
        this.setState({ metricFields: newMetricFields });
        this.updateConfigFields('metricFields', newMetricFields);
    };
    
    render() {
        const { chartEnabled } = this.state;
        
        return (
            <div className="widget-setting-container">
                {/* Map Widget Selector */}
                <div className="setting-section">
                    <h3 className="setting-label">Select a Map Widget:</h3>
                    <MapWidgetSelector
                        onSelect={this.onMapWidgetSelected}
                        useMapWidgetIds={this.props.useMapWidgetIds}
                    />
                </div>
                
                {/* Data Source Selector */}
                <div className="setting-section">
                    <h3 className="setting-label">Select a Data Source:</h3>
                    <DataSourceSelector
                        mustUseDataSource
                        types={this.supportedTypes}
                        useDataSources={this.props.useDataSources}
                        onChange={this.onDataSourceChange}
                        widgetId={this.props.id}
                    />
                </div>
                
                {/* Chart Settings */}
                <div className="setting-section">
                    <h3 className="setting-label">Chart Settings:</h3>
                    <div className="setting-row">
                        <Label check>
                            <Checkbox
                                checked={chartEnabled}
                                onChange={this.onChartEnabledChange}
                            />
                            Enable attribute chart visualization
                        </Label>
                    </div>
                    <p className="setting-note">
                        When enabled, a chart will be displayed showing the numeric attributes of selected features.
                    </p>
                    
                    {/* Chart Type Selector */}
                    {chartEnabled && (
                        <div className="setting-row" style={{ marginTop: '12px' }}>
                            <Label style={{ display: 'block', marginBottom: '8px' }}>
                                Chart Type:
                            </Label>
                            <Select
                                value={this.state.chartType}
                                onChange={this.onChartTypeChange}
                                style={{ width: '100%' }}
                            >
                                <Option value="line">Line Chart</Option>
                                <Option value="bar">Bar Chart</Option>
                                <Option value="pie">Pie Chart</Option>
                                <Option value="area">Area Chart</Option>
                            </Select>
                            <p className="setting-note" style={{ marginTop: '8px', fontSize: '12px' }}>
                                Select the type of chart to display the data visualization.
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Attribute Fields Selector */}
                {this.props.useDataSources && this.props.useDataSources.length > 0 && (
                    <div className="setting-section">
                        <h3 className="setting-label">Select Attribute Fields:</h3>
                        <p className="setting-note">
                            These fields will appear when hovering over features on the map and will be visualized in the chart.
                        </p>
                        <FieldSelector
                            useDataSources={this.props.useDataSources}
                            onChange={this.onMetricFieldChange}
                            selectedFields={this.state.metricFields}
                            isMultiple={true}
                            isSearchInputHidden={false}
                            isDataSourceDropDownHidden={false}
                        />
                    </div>
                )}
            </div>
        );
    }
}