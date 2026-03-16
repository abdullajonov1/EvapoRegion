import { type ImmutableObject } from "seamless-immutable";

export interface Config {
  enableMinMaxControl: boolean;
  enableColorRendererControl: boolean;
  enableRegionFilterControl: boolean;
  enableLogoutControl: boolean;
  selectionPercentage: number;
  polygonIdField: string;
}

export type IMConfig = ImmutableObject<Config>;
