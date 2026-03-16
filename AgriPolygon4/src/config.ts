import { type ImmutableObject } from "seamless-immutable";

export interface Config {
  fieldsToShow?: string[];
  titleField?: string;
  labels?: Record<string, string>;
  settings?: {
    zoomToSelection?: boolean;
    showMapPopup?: boolean;
    showAttachments?: boolean;
  };
  selectedFieldsMap?: any;

  // Chart configuration
  chartEnabled?: boolean;
  chartType?: "bar" | "line";
  chartTitle?: string;
  chartFields?: string[];
  chartColor?: string;
}

export type IMConfig = ImmutableObject<Config>;
