import type { Theme, WatchHistoryItem } from '../types';
import { buildCollage } from './imageCollage';

export interface ThemeGenerateResult {
  theme: Theme;
  themeName?: string;
  aiMessage?: string;
  selectedTitle?: string;
  selectedType?: string;
}

type ApiResponse = {
  theme?: Theme;
  themeName?: string;
  aiMessage?: string;
  selectedTitle?: string;
  selectedType?: string;
  posterUrl?: string;
  backdropUrl?: string;
  collageImageUrls?: string[];
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
    // 랜덤 선택: 브라우저에서 수행 (SSR 캐시 영향 없음)
    const pool = watchHistory.slice(0, Math.min(watchHistory.length, 5));
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const others = pool.filter((w) => w !== picked).slice(0, 3);

    const res = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 선택된 항목 먼저 + 콜라주용 추가 항목
      body: JSON.stringify({ prompt, mode: 'content', watchHistory: [picked, ...others] }),
    });
    if (!res.ok) return null;
    const data = await res.json() as ApiResponse;
    if (!data.theme) return null;

    let finalTheme: Theme = { ...data.theme };

    // 이미지 URL이 있으면 브라우저 Canvas로 콜라주 생성
    const imageUrls = data.collageImageUrls ?? (
      [data.backdropUrl, data.posterUrl].filter(Boolean) as string[]
    );

    if (imageUrls.length > 0) {
      try {
        const { url, palette } = await buildCollage(imageUrls);
        finalTheme = { ...finalTheme, backgroundImage: url, palette };
      } catch {
        // 콜라주 실패 시 단일 이미지 폴백
        const fallbackImg = data.backdropUrl ?? data.posterUrl;
        if (fallbackImg) finalTheme = { ...finalTheme, backgroundImage: fallbackImg };
      }
    }

    return {
      theme: finalTheme,
      themeName: data.themeName,
      aiMessage: data.aiMessage,
      selectedTitle: data.selectedTitle,
      selectedType: data.selectedType,
    };
  } catch {
    return null;
  }
}
