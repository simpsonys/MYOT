import type { Theme, WatchHistoryItem } from '../types';

export interface ThemeGenerateResult {
  theme: Theme;
  themeName?: string;
  aiMessage?: string;
  // 컨텐츠 기반 테마일 때 추가 필드
  selectedTitle?: string;
  selectedType?: string;
  posterUrl?: string;
  backdropUrl?: string;
}

type ApiResponse = {
  theme?: Theme;
  themeName?: string;
  aiMessage?: string;
  selectedTitle?: string;
  selectedType?: string;
  posterUrl?: string;
  backdropUrl?: string;
};

export async function generateThemeFromText(prompt: string): Promise<ThemeGenerateResult | null> {
  try {
    const res = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode: 'text' }),
    });
    if (!res.ok) return null;
    const data = await res.json() as ApiResponse;
    if (!data.theme) return null;
    return { theme: data.theme, themeName: data.themeName, aiMessage: data.aiMessage };
  } catch {
    return null;
  }
}

export async function generateThemeFromContent(
  prompt: string,
  watchHistory: WatchHistoryItem[],
): Promise<ThemeGenerateResult | null> {
  try {
    // 랜덤 선택을 브라우저(클라이언트)에서 수행 — SSR 캐시 영향 없음
    const pool = watchHistory.slice(0, Math.min(watchHistory.length, 5));
    const picked = pool[Math.floor(Math.random() * pool.length)];

    const res = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 선택된 1개만 전송
      body: JSON.stringify({ prompt, mode: 'content', watchHistory: [picked] }),
    });
    if (!res.ok) return null;
    const data = await res.json() as ApiResponse;
    if (!data.theme) return null;
    return {
      theme: data.theme,
      themeName: data.themeName,
      aiMessage: data.aiMessage,
      selectedTitle: data.selectedTitle,
      selectedType: data.selectedType,
      posterUrl: data.posterUrl,
      backdropUrl: data.backdropUrl,
    };
  } catch {
    return null;
  }
}
