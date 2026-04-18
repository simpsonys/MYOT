import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '../src/runtime/orchestrator';
import { listPrimitives } from '../src/primitives/registry';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenced ? fenced[1].trim() : trimmed;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ kind: 'error', message: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      kind: 'error',
      message: 'GEMINI_API_KEY not set. Configure in Vercel → Environment Variables.',
    });
    return;
  }

  try {
    const { userInput, currentLayout, mode, dryRun } = req.body ?? {};
    if (!userInput || typeof userInput !== 'string') {
      res.status(400).json({ kind: 'error', message: 'userInput is required' });
      return;
    }

    const primitives = listPrimitives();
    const systemPrompt = buildSystemPrompt(primitives);

    if (dryRun) {
      res.status(200).json({
        kind: 'dry_run',
        systemPromptPreview: systemPrompt,
        primitiveCount: primitives.length,
      });
      return;
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
      res.status(200).json({
        kind: 'error',
        message: 'AI returned invalid JSON',
        raw: text,
      });
      return;
    }

    parsed._trace = { durationMs: duration, rawResponse: text };
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({
      kind: 'error',
      message: (e as Error).message || 'Unknown error',
    });
  }
}
