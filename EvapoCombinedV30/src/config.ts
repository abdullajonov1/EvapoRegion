import { type ImmutableObject } from 'seamless-immutable'

export type ChartType = 'line' | 'bar' | 'pie' | 'area'

export interface Config {
  exampleConfigProperty: string
  chartType?: ChartType
  chartEnabled?: boolean
  metricFields?: ImmutableObject<{ [dataSourceId: string]: string[] }>
}

export type IMConfig = ImmutableObject<Config>
