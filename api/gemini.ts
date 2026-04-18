import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '../src/runtime/orchestrator';
import { listPrimitives } from '../src/primitives/registry';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenced ? fenced[1].trim() : trimmed;
}

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ kind: 'error', message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        kind: 'error',
        message: 'GEMINI_API_KEY not set. Configure in Vercel → Environment Variables.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { userInput, currentLayout, mode, dryRun } = body;

    if (!userInput || typeof userInput !== 'string') {
      return new Response(JSON.stringify({ kind: 'error', message: 'userInput is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const primitives = listPrimitives();
    const systemPrompt = buildSystemPrompt(primitives);

    if (dryRun) {
      return new Response(
        JSON.stringify({
          kind: 'dry_run',
          systemPromptPreview: systemPrompt,
          primitiveCount: primitives.length,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const targetModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: targetModel,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const userPrompt = `
# Current TV State
${JSON.stringify(currentLayout ?? { theme: {}, widgets: [] }, null, 2)}

# Mode
${mode === 'recommend' ? 'User wants 3 recommended layouts.' : 'Decide the best response kind (compose_widget / mutate_widget / layout / emit_event).'}

# User's Utterance
${userInput}
`;

    const started = Date.now();
    let result;
    
    try {
      result = await model.generateContent(userPrompt);
    } catch (e: any) {
      // 503 High Demand 에러 발생 시 더 안정적인 2.0-flash 모델로 자동 폴백
      if (e.message && e.message.includes('503') && targetModel === 'gemini-2.5-flash') {
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: systemPrompt,
          generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
        });
        result = await fallbackModel.generateContent(userPrompt);
      } else {
        throw e;
      }
    }

    const text = result.response.text();
    const duration = Date.now() - started;
    const jsonText = extractJson(text);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return new Response(
        JSON.stringify({
          kind: 'error',
          message: 'AI returned invalid JSON',
          raw: text,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    parsed._trace = { durationMs: duration, rawResponse: text };
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        kind: 'error',
        message: (e as Error).message || 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
