import type { TriggerParams, TriggerResponse } from '../types';

const TRIGGER_URL = import.meta.env.VITE_FLOW_TRIGGER_URL as string | undefined;
const API_KEY = import.meta.env.VITE_FLOW_API_KEY as string | undefined;

export function isMisconfigured(): boolean {
  return !TRIGGER_URL || !API_KEY;
}

export async function triggerWorkflow(params: TriggerParams): Promise<TriggerResponse> {
  if (!TRIGGER_URL || !API_KEY) {
    throw new Error('VITE_FLOW_TRIGGER_URL and VITE_FLOW_API_KEY must be set.');
  }

  const res = await fetch(TRIGGER_URL, {
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
