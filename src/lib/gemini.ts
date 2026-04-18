import type { TVLayout } from '../types';

interface GeminiRequestBody {
  userInput: string;
  currentLayout: { theme: unknown; widgets: unknown[] };
  mode: 'edit' | 'recommend';
  dryRun?: boolean;
}

export interface GeminiEnvelope {
  kind: string;
  _trace?: { durationMs: number; rawResponse: string };
  [key: string]: unknown;
}

export interface DryRunResult {
  kind: 'dry_run';
  systemPromptPreview: string;
  widgetCount: number;
}

export async function callGemini(
  body: GeminiRequestBody,
): Promise<GeminiEnvelope | DryRunResult> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { kind: 'error', message: `HTTP ${res.status}: ${text}` } as GeminiEnvelope;
    }
    return (await res.json()) as GeminiEnvelope;
  } catch (e) {
    return { kind: 'error', message: (e as Error).message } as GeminiEnvelope;
  }
}
