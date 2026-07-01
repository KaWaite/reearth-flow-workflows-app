export type WorkflowId = 1 | 2 | 3;

export type JobState = 'idle' | 'submitting' | 'submitted' | 'error';

export interface JobResult {
  jobId: string;
  submittedAt: string;
}

export interface TriggerResponse {
  jobId: string;
}

export interface CsvQualityParams {
  csv_url: string;
  key_column: string;
  output_prefix: string;
}

export interface GeoJsonParams {
  geojson_url: string;
  target_epsg: string;
  category_column: string;
  output_name: string;
}

export interface CsvMergeParams {
  csv_url_1: string;
  csv_url_2: string;
  dedup_key: string;
  output_prefix: string;
}
