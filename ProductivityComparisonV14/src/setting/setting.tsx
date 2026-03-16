import {
  React,
  Immutable,
  DataSourceTypes,
  UseDataSource,
  IMUseDataSource,
  IMFieldSchema,
  DataSource,
  ImmutableObject,
  getAppStore
} from 'jimu-core'

import { AllWidgetSettingProps } from 'jimu-for-builder'
import { DataSourceSelector, FieldSelector } from 'jimu-ui/advanced/data-source-selector'
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import { DataSourceManager } from 'jimu-core'
import { Label, Checkbox, Alert, Switch, TextInput } from 'jimu-ui'

interface SettingState {
  dss: DataSource[] | null
  filterFields: ImmutableObject<{ [dataSourceId: string]: string[] }> | null
  showAdvancedOptions: boolean
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<any>, SettingState> {
  supportedTypes = Immutable([DataSourceTypes.FeatureLayer])
  dsManager = DataSourceManager.getInstance()

  constructor (props) {
    super(props)
    this.state = {
      dss: null,
      filterFields: this.props.config?.filterFields || null,
      showAdvancedOptions: false
    }
  }

  // ✅ key fix: normalize ImmutableArray -> plain JS array
  private toPlainArray<T = any> (val: any): T[] {
    if (!val) return []
    if (Array.isArray(val)) return val as T[]
    if (typeof val.asMutable === 'function') return val.asMutable({ deep: true }) as T[]
    if (typeof val.toArray === 'function') return val.toArray() as T[]
    return []
  }

  componentDidMount () {
    const waitForAppConfig = () => {
      const state = getAppStore().getState()
      const widgets = state?.appConfig?.widgets
      if (widgets && Object.keys(widgets).length > 0) {
        this.autoDetectMapWidget()
        this.initializeDataSources()
      } else {
        setTimeout(waitForAppConfig, 200)
      }
    }
    waitForAppConfig()
  }

  componentDidUpdate (prevProps) {
    if (this.props.useDataSources && this.props.useDataSources !== prevProps.useDataSources) {
      this.initializeDataSources()
    }
  }

  componentWillUnmount () {
    this.cleanupDataSources()
  }

  autoDetectMapWidget = () => {
    if (!this.props.useMapWidgetIds || this.props.useMapWidgetIds.length === 0) {
      const state = getAppStore().getState()
      const mapWidgets = state.appConfig.widgets
      const mapWidgetId = Object.keys(mapWidgets).find(wid => {
        const widget = mapWidgets[wid]
        return widget.manifest && widget.manifest.name === 'map'
      })
      if (mapWidgetId) {
        this.props.onSettingChange({ id: this.props.id, useMapWidgetIds: [mapWidgetId] })
      }
    }
  }

  initializeDataSources = () => {
    const useDss = this.toPlainArray<UseDataSource>(this.props.useDataSources)
    if (useDss.length > 0) this.createDataSources(useDss)
    else this.setState({ dss: null })
  }

cleanupDataSources = () => {
  // Let Experience Builder own DS lifecycle.
  // Destroying here can take down other widgets using the same DS.
};


  createDataSources = async (useDataSourcesToUse: UseDataSource[]) => {
    if (!useDataSourcesToUse || useDataSourcesToUse.length === 0) {
      this.setState({ dss: null })
      return
    }

    const dataSources: DataSource[] = []

    let existingFilterFields
    if (this.props.config && this.props.config.filterFields) {
      existingFilterFields = typeof (this.props.config.filterFields as any).get === 'function'
        ? this.props.config.filterFields
        : Immutable(this.props.config.filterFields)
    } else {
      existingFilterFields = Immutable({} as { [dataSourceId: string]: string[] })
    }

    for (const useDs of useDataSourcesToUse) {
      try {
        // ✅ ensure IMUseDataSource
        const imUseDs = Immutable(useDs) as IMUseDataSource
        const ds = await this.dsManager.createDataSourceByUseDataSource(imUseDs)

        if (ds && ds.getSchema()) {
          const fields = ds.getSchema().fields
          const fieldNames = Object.keys(fields)

          const dsId = ds.id
          const hasFilterFields = existingFilterFields.get
            ? existingFilterFields.get(dsId)
            : (existingFilterFields as any)[dsId]

          if (!hasFilterFields) {
            const defaultFilterFields = this.getDefaultFilterFields(fieldNames)
            if (defaultFilterFields.length > 0) {
              existingFilterFields = existingFilterFields.set(dsId, defaultFilterFields)
              this.updateConfigFields('filterFields', existingFilterFields)
            }
          }

          dataSources.push(ds)
        }
      } catch (err) {
        console.error('Error creating data source:', err)
      }
    }

    if (dataSources.length > 0) {
      this.setState({ dss: dataSources, filterFields: existingFilterFields })
    } else {
      this.setState({ dss: null, filterFields: existingFilterFields })
    }
  }

  getDefaultFilterFields = (fieldNames: string[]): string[] => {
    const lower = fieldNames.map(f => f.toLowerCase())
    const preferred = ['viloyat', 'tuman', 'mavsum', 'yil', 'fermer_nom']
    const defaults: string[] = []
    preferred.forEach(k => {
      const idx = lower.indexOf(k)
      if (idx >= 0) defaults.push(fieldNames[idx])
    })
    if (defaults.length > 0) return defaults

    return fieldNames.slice(0, 2)
  }

  updateConfigFields = (configKey: string, fields: ImmutableObject<{ [dataSourceId: string]: string[] }>) => {
    if (!this.props.config) return
    const newConfig = (this.props.config as any).set
      ? (this.props.config as any).set(configKey, fields)
      : Immutable({ ...(this.props.config as any), [configKey]: fields })

    this.props.onSettingChange({ id: this.props.id, config: newConfig })
  }
// setting/setting.tsx
onDataSourceChange = async (useDataSources: UseDataSource[] | any) => {
  // 1) normalize anything (Immutable, array-like) -> plain array
  const plain: UseDataSource[] = this.toPlainArray<UseDataSource>(useDataSources);

  // 2) persist to app config as a plain array (WidgetJson.useDataSources expects UseDataSource[])
  this.props.onSettingChange({
    id: this.props.id,
    useDataSources: plain
  });

  // 3) still fine to operate on the plain array internally
  await this.createDataSources(plain);
};



  onMapWidgetSelected = async (selectedIds: string[]) => {
    this.props.onSettingChange({ id: this.props.id, useMapWidgetIds: selectedIds })
    await this.autoDetectDataSourcesFromMap(selectedIds)
  }

  private extractFields = (dataSource: any): string[] => {
    const f = dataSource?.fields
    if (!f) return []
    if (Array.isArray(f)) return [...f]
    if (typeof f.asMutable === 'function') return f.asMutable({ deep: true })
    if (typeof f.toArray === 'function') return f.toArray()
    if (typeof f === 'object') return Object.keys(f)
    return []
  }

  // ✅ UPDATED: auto-detect ALL feature layers, and ALWAYS output plain UseDataSource[]
  autoDetectDataSourcesFromMap = async (selectedMapIds: string[]) => {
    if (selectedMapIds.length === 0) return

    const state = getAppStore().getState()
    const mapId = selectedMapIds[0]
    const widget = state?.appConfig?.widgets?.[mapId]
    if (!widget?.useDataSources) return

    const mapUseDsPlain = this.toPlainArray<any>(widget.useDataSources)

    const featureLayerDs = mapUseDsPlain.filter((ds: any) => {
      const id = ds?.dataSourceId
      const dsJson = id ? state?.appConfig?.dataSources?.[id] : null
      return !!id && !!dsJson && String(dsJson.type).toUpperCase() === 'FEATURE_LAYER'
    })

    if (featureLayerDs.length === 0) return

    const plainUseDs: UseDataSource[] = featureLayerDs.map((f: any) => {
      const fieldsArray = this.extractFields(f)
      const dsId = f.dataSourceId
      return {
        dataSourceId: dsId,
        mainDataSourceId: f.mainDataSourceId || dsId,
        rootDataSourceId: f.rootDataSourceId || dsId,
        dataViewId: f.dataViewId || 'default',
        fields: fieldsArray
      }
    })

    // ✅ this fixes TS2740
    this.props.onSettingChange({ id: this.props.id, useDataSources: plainUseDs })
    await this.createDataSources(plainUseDs)
  }

  onFilterFieldChange = (selectedFields: IMFieldSchema[], ds: DataSource) => {
    if (!ds) return
    let newFields = this.state.filterFields || Immutable({} as { [dataSourceId: string]: string[] })
    newFields = newFields.set(ds.id, selectedFields.map(f => f.jimuName))
    this.setState({ filterFields: newFields })
    this.updateConfigFields('filterFields', newFields)
  }

  toggleAdvancedOptions = () => {
    this.setState(prev => ({ showAdvancedOptions: !prev.showAdvancedOptions }))
  }

  render () {
    const { showAdvancedOptions } = this.state
    const selectedCount = this.toPlainArray<UseDataSource>(this.props.useDataSources).length
    const multiHint = selectedCount > 1

    return (
      <div className="widget-setting-container p-2">
        <div className="setting-section mb-3">
          <Label className="setting-label d-flex">Select a Map Widget:</Label>
          <MapWidgetSelector onSelect={this.onMapWidgetSelected} useMapWidgetIds={this.props.useMapWidgetIds} />
        </div>

        <div className="setting-section mb-3">
          <Label className="setting-label d-flex">Select Data Sources (Year Layers):</Label>
          <p className="setting-note text-muted">
            Select <b>one or many</b> feature layers. If you select many, the widget treats each layer as a separate <b>YIL</b>.
          </p>

          {multiHint ? (
            <Alert type="success" className="w-100 mb-2">
              Multi-layer mode enabled: YIL dropdown will be built from the selected layer names.
            </Alert>
          ) : null}

      <DataSourceSelector
  mustUseDataSource
  types={this.supportedTypes}
  // ✅ guarantee Immutable here
  useDataSources={Immutable(this.toPlainArray<UseDataSource>(this.props.useDataSources))}
  onChange={this.onDataSourceChange}
  widgetId={this.props.id}
  hideDataView={true}
  isMultiple={true}
/>

        </div>

        {selectedCount > 0 && (
          <div className="setting-section mb-3">
            <Label className="setting-label d-flex">Select Filter Fields:</Label>
           <FieldSelector
  // ✅ match the selector’s expectation (Immutable list)
  useDataSources={Immutable(this.toPlainArray<UseDataSource>(this.props.useDataSources))}
  onChange={this.onFilterFieldChange}
  selectedFields={this.state.filterFields}   // your ImmutableObject mapping is correct
  isMultiple={true}
  isSearchInputHidden={false}
  isDataSourceDropDownHidden={false}
  widgetId={this.props.id}
/>

            <div className="setting-hint d-flex align-items-center mt-2">
              <Checkbox disabled={true} checked={true} className="mr-2" />
              <small>Recommended: viloyat, tuman, mavsum, fermer_nom (+ yil only if single-layer mode)</small>
            </div>
          </div>
        )}

        <div className="setting-section border-top pt-3">
          <div className="d-flex justify-content-between align-items-center mb-2" onClick={this.toggleAdvancedOptions} style={{ cursor: 'pointer' }}>
            <Label className="setting-label mb-0">Advanced Options</Label>
            <Switch checked={showAdvancedOptions} onChange={this.toggleAdvancedOptions} />
          </div>

          {showAdvancedOptions && (
            <div className="advanced-options-container pl-2 border-left">
              <div className="mb-3">
                <Label>Default filter field labels</Label>
                <div className="d-flex mb-2">
                  <TextInput
                    placeholder="Viloyat"
                    className="mr-2"
                    defaultValue={this.props.config?.labels?.viloyat || 'Viloyat'}
                    onAcceptValue={(value) => {
                      const labels = this.props.config?.labels || {}
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: (this.props.config as any).set('labels', { ...labels, viloyat: value })
                      })
                    }}
                  />
                  <TextInput
                    placeholder="Tuman"
                    defaultValue={this.props.config?.labels?.tuman || 'Tuman'}
                    onAcceptValue={(value) => {
                      const labels = this.props.config?.labels || {}
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: (this.props.config as any).set('labels', { ...labels, tuman: value })
                      })
                    }}
                  />
                </div>
                <div className="d-flex mb-2">
                  <TextInput
                    placeholder="Mavsum"
                    className="mr-2"
                    defaultValue={this.props.config?.labels?.mavsum || 'Mavsum'}
                    onAcceptValue={(value) => {
                      const labels = this.props.config?.labels || {}
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: (this.props.config as any).set('labels', { ...labels, mavsum: value })
                      })
                    }}
                  />
                  <TextInput
                    placeholder="Yil"
                    className="mr-2"
                    defaultValue={this.props.config?.labels?.yil || 'Yil'}
                    onAcceptValue={(value) => {
                      const labels = this.props.config?.labels || {}
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: (this.props.config as any).set('labels', { ...labels, yil: value })
                      })
                    }}
                  />
                </div>
                <div className="d-flex">
                  <TextInput
                    placeholder="Fermer"
                    defaultValue={this.props.config?.labels?.fermer_nom || 'Fermer'}
                    onAcceptValue={(value) => {
                      const labels = this.props.config?.labels || {}
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: (this.props.config as any).set('labels', { ...labels, fermer_nom: value })
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
