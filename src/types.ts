export type WorkflowId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type JobState = 'idle' | 'submitting' | 'submitted' | 'error';

export interface JobResult {
  jobId: string;
  submittedAt: string;
}

export interface TriggerResponse {
  jobId: string;
}

export interface CsvQualityParams {
  csv_path: string;
  key_column: string;
  output_prefix: string;
}

export interface GeoJsonParams {
  geojson_path: string;
  category_column: string;
  output_name: string;
}

export interface CsvMergeParams {
  csv_path_1: string;
  csv_path_2: string;
  dedup_key: string;
  output_prefix: string;
}

export interface ColumnSelectorParams {
  csv_path: string;
  columns_to_remove: string;
  output_name: string;
}

export interface CsvSplitParams {
  csv_path: string;
  category_column: string;
  value_a: string;
  value_b: string;
  output_prefix: string;
}

export interface CsvToJsonParams {
  csv_path: string;
  output_name: string;
}

export interface SpatialFilterParams {
  geojson_path: string;
  min_area_m2: string;
  output_name: string;
}
