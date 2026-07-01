import type { TriggerResponse, WorkflowId } from '../types';

// Trim to guard against env vars saved with surrounding quotes or whitespace
function clean(val: string | undefined): string | undefined {
  return val?.trim().replace(/^["']|["']$/g, '') || undefined;
}

const TRIGGER_URLS: Record<WorkflowId, string | undefined> = {
  1: clean(import.meta.env.VITE_FLOW_TRIGGER_URL_1),
  2: clean(import.meta.env.VITE_FLOW_TRIGGER_URL_2),
  3: clean(import.meta.env.VITE_FLOW_TRIGGER_URL_3),
};

const API_KEY = clean(import.meta.env.VITE_FLOW_API_KEY);

export function isWorkflowConfigured(id: WorkflowId): boolean {
  return !!(TRIGGER_URLS[id] && API_KEY);
}

export async function triggerWorkflow(id: WorkflowId, params: object): Promise<TriggerResponse> {
  const url = TRIGGER_URLS[id];
  if (!url || !API_KEY) {
    throw new Error(`Workflow ${id} is not configured. Set VITE_FLOW_TRIGGER_URL_${id} and VITE_FLOW_API_KEY.`);
  }

  // Validate URL before fetch so the error message is readable
  try {
    new URL(url);
  } catch {
    throw new Error(`VITE_FLOW_TRIGGER_URL_${id} is not a valid URL: "${url}"`);
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

  return res.json() as Promise<TriggerResponse>;
}
