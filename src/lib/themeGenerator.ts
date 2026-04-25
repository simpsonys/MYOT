import type { Theme, WatchHistoryItem } from '../types';

interface ThemeGenerateResult {
  theme: Theme;
  themeName?: string;
  aiMessage?: string;
}

export async function generateThemeFromText(prompt: string): Promise<ThemeGenerateResult | null> {
  try {
    const res = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode: 'text' }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { theme?: Theme; themeName?: string; aiMessage?: string };
    if (!data.theme) return null;
    return { theme: data.theme as Theme, themeName: data.themeName, aiMessage: data.aiMessage };
  } catch {
    return null;
  }
}

export async function generateThemeFromContent(
  prompt: string,
  watchHistory: WatchHistoryItem[],
): Promise<ThemeGenerateResult | null> {
  try {
    const res = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode: 'content', watchHistory }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { theme?: Theme; themeName?: string; aiMessage?: string };
    if (!data.theme) return null;
    return { theme: data.theme as Theme, themeName: data.themeName, aiMessage: data.aiMessage };
  } catch {
    return null;
  }
}
