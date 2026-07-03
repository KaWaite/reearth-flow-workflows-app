import type { TriggerResponse, WorkflowId } from '../types';

// Trim to guard against env vars saved with surrounding quotes or whitespace
function clean(val: string | undefined): string | undefined {
  return val?.trim().replace(/^["']|["']$/g, '') || undefined;
}

const TRIGGER_URLS: Record<WorkflowId, string | undefined> = {
  1: clean(import.meta.env.VITE_FLOW_URL_CSV_QUALITY),
  2: clean(import.meta.env.VITE_FLOW_URL_GEOJSON),
  3: clean(import.meta.env.VITE_FLOW_URL_CSV_MERGE),
  4: clean(import.meta.env.VITE_FLOW_URL_COL_SELECT),
  5: clean(import.meta.env.VITE_FLOW_URL_CSV_SPLIT),
  6: clean(import.meta.env.VITE_FLOW_URL_CSV_JSON),
  7: clean(import.meta.env.VITE_FLOW_URL_SPATIAL_FILTER),
};

export const TRIGGER_VAR_NAMES: Record<WorkflowId, string> = {
  1: 'FLOW_URL_CSV_QUALITY',
  2: 'FLOW_URL_GEOJSON',
  3: 'FLOW_URL_CSV_MERGE',
  4: 'FLOW_URL_COL_SELECT',
  5: 'FLOW_URL_CSV_SPLIT',
  6: 'FLOW_URL_CSV_JSON',
  7: 'FLOW_URL_SPATIAL_FILTER',
};

const API_KEY = clean(import.meta.env.VITE_FLOW_API_KEY);

export function isWorkflowConfigured(id: WorkflowId): boolean {
  return !!(TRIGGER_URLS[id] && API_KEY);
}

export async function triggerWorkflow(id: WorkflowId, params: object): Promise<TriggerResponse> {
  const url = TRIGGER_URLS[id];
  if (!url || !API_KEY) {
    throw new Error(`Workflow ${id} is not configured. Set VITE_${TRIGGER_VAR_NAMES[id]} and VITE_FLOW_API_KEY.`);
  }

  // Validate URL before fetch so the error message is readable
  try {
    new URL(url);
  } catch {
    throw new Error(`VITE_${TRIGGER_VAR_NAMES[id]} is not a valid URL: "${url}"`);
  }

  // In dev the Vite proxy strips CORS by forwarding same-origin to api.flow.reearth.io
  const fetchUrl =
    import.meta.env.DEV && url.includes('api.flow.reearth.io')
      ? '/flow-api' + new URL(url).pathname
      : url;

  const res = await fetch(fetchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ with: params }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Trigger failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { runId?: string; jobId?: string };
  const jobId = data.runId ?? data.jobId;
  if (!jobId) throw new Error('Trigger response missing runId/jobId');
  return { jobId };
}
