import { defineConfig, loadEnv, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

// ── Helpers ────────────────────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenced ? fenced[1].trim() : trimmed;
}

// ── Dev API plugin ─────────────────────────────────────────────────────
// Intercepts /api/gemini and /api/theme in `npm run dev` so the full
// AI pipeline works without needing `vercel dev`.
// GoogleGenerativeAI is imported dynamically to avoid top-level ESM
// resolution issues in the Vite config loader.

function devApiPlugin(env: Record<string, string>) {
  return {
    name: 'dev-api',
    configureServer(server: ViteDevServer) {
      // /api/gemini — main LLM widget orchestration
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/gemini') || req.method !== 'POST') return next();
        try {
          const body = JSON.parse(await readBody(req) || '{}');
          const { userInput, currentLayout, mode: reqMode, dryRun } = body;

          const { buildSystemPrompt } = await server.ssrLoadModule('/src/runtime/orchestrator.ts') as {
            buildSystemPrompt: (p: unknown[]) => string;
          };
          const { listPrimitives } = await server.ssrLoadModule('/src/primitives/registry.ts') as {
            listPrimitives: () => unknown[];
          };

          const primitives = listPrimitives();
          const systemPrompt = buildSystemPrompt(primitives);

          if (dryRun) {
            return send(res, 200, { kind: 'dry_run', systemPromptPreview: systemPrompt, primitiveCount: primitives.length });
          }

          const apiKey = env.GEMINI_API_KEY;
          if (!apiKey) return send(res, 500, { kind: 'error', message: 'GEMINI_API_KEY not set in .env.local' });

          // Dynamic import avoids top-level ESM resolution issues in vite config
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const modelId = env.GEMINI_MODEL || 'gemini-2.5-flash';
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: modelId,
            systemInstruction: systemPrompt,
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
          });

          const userPrompt = [
            '# Current TV State',
            JSON.stringify(currentLayout ?? { theme: {}, widgets: [] }, null, 2),
            '',
            '# Mode',
            reqMode === 'recommend' ? 'User wants 3 recommended layouts.' : 'Decide the best response kind (compose_widget / mutate_widget / layout / emit_event).',
            '',
            "# User's Utterance",
            userInput,
          ].join('\n');

          const started = Date.now();
          let result;
          try {
            result = await model.generateContent(userPrompt);
          } catch (e: unknown) {
            const msg = (e as Error).message ?? '';
            if (msg.includes('503') && modelId === 'gemini-2.5-flash') {
              const fallback = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                systemInstruction: systemPrompt,
                generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
              });
              result = await fallback.generateContent(userPrompt);
            } else throw e;
          }

          const text = result.response.text();
          const duration = Date.now() - started;

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(extractJson(text));
          } catch {
            return send(res, 200, { kind: 'error', message: 'AI returned invalid JSON', raw: text });
          }
          parsed._trace = { durationMs: duration, rawResponse: text };
          return send(res, 200, parsed);
        } catch (e) {
          return send(res, 500, { kind: 'error', message: (e as Error).message ?? 'Unknown error' });
        }
      });

      // /api/theme — proxy to the actual Vercel handler via ssrLoadModule
      // This ensures TMDB + Gemini Vision logic runs identically in dev.
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/theme') || req.method !== 'POST') return next();
        try {
          // Inject .env.local vars into process.env so the handler finds them
          for (const [k, v] of Object.entries(env)) {
            if (!process.env[k]) process.env[k] = v;
          }
          const bodyStr = await readBody(req);
          const webReq = new Request('http://localhost/api/theme', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: bodyStr,
          });
          const { default: themeHandler } = await server.ssrLoadModule('/api/theme.ts') as {
            default: (r: Request) => Promise<Response>;
          };
          const webRes = await themeHandler(webReq);
          const text = await webRes.text();
          res.writeHead(webRes.status, { 'Content-Type': 'application/json' });
          res.end(text);
        } catch (e) {
          return send(res, 500, { error: (e as Error).message ?? 'Unknown error' });
        }
      });
    },
  };
}

// ── Vite config ────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), devApiPlugin(env)],
    server: { port: 5173 },
    envPrefix: 'VITE_',
  };
});
