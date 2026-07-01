export interface TriggerParams {
  csv_url: string;
  key_column: string;
  output_prefix: string;
}

export interface TriggerResponse {
  jobId: string;
}

export type JobState = 'idle' | 'submitting' | 'submitted' | 'error';

export interface JobResult {
  jobId: string;
  submittedAt: string;
}
