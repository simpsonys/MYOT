import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '../src/runtime/orchestrator';
import { listWidgets } from '../src/widgets/registry';

// =====================================================================
// /api/gemini
// =====================================================================
// The system prompt is regenerated on EVERY request from the live widget
// registry. Adding a widget → its description, utterances, actions, and
// collaborations all flow into the prompt automatically.
// =====================================================================

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

    const widgets = listWidgets();
    const systemPrompt = buildSystemPrompt(widgets);

    // Dry-run mode: return the generated prompt without calling Gemini.
    // Useful for the Utterance Tester dev tool.
    if (dryRun) {
      res.status(200).json({
        kind: 'dry_run',
        systemPromptPreview: systemPrompt,
        widgetCount: widgets.length,
      });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.6,
        responseMimeType: 'application/json',
      },
    });

    const userPrompt = `
# Current Layout State (JSON)
${JSON.stringify(currentLayout ?? { theme: {}, widgets: [] }, null, 2)}

# Request Mode
${mode === 'recommend' ? 'User wants 3 recommended layouts.' : 'Decide the best response kind (layout / invoke_action / emit_event) based on user intent.'}

# User's Utterance
${userInput}
`;

    const started = Date.now();
    const result = await model.generateContent(userPrompt);
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

    // Attach trace metadata (used by Dev Tools)
    parsed._trace = { durationMs: duration, rawResponse: text };
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({
      kind: 'error',
      message: (e as Error).message || 'Unknown error',
    });
  }
}
