import type { TriggerResponse, WorkflowId } from '../types';

const TRIGGER_URLS: Record<WorkflowId, string | undefined> = {
  1: import.meta.env.VITE_FLOW_TRIGGER_URL_1 as string | undefined,
  2: import.meta.env.VITE_FLOW_TRIGGER_URL_2 as string | undefined,
  3: import.meta.env.VITE_FLOW_TRIGGER_URL_3 as string | undefined,
};

const API_KEY = import.meta.env.VITE_FLOW_API_KEY as string | undefined;

export function isWorkflowConfigured(id: WorkflowId): boolean {
  return !!(TRIGGER_URLS[id] && API_KEY);
}

export async function triggerWorkflow(id: WorkflowId, params: object): Promise<TriggerResponse> {
  const url = TRIGGER_URLS[id];
  if (!url || !API_KEY) {
    throw new Error(`Workflow ${id} is not configured. Set VITE_FLOW_TRIGGER_URL_${id} and VITE_FLOW_API_KEY.`);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Trigger failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TriggerResponse>;
}
