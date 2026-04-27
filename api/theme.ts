import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

interface WatchHistoryItem {
  title: string;
  titleEn?: string;
  type: string;
  platform?: string;
}

interface ThemeRequestBody {
  prompt: string;
  mode: 'text' | 'content';
  watchHistory?: WatchHistoryItem[];
}

// ── TMDB helpers ───────────────────────────────────────────────────────

async function fetchTmdbImages(
  title: string,
  tmdbApiKey: string,
): Promise<{ posterUrl: string | null; backdropUrl: string | null }> {
  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&language=ko-KR&page=1`;
    const res = await fetch(url);
    if (!res.ok) return { posterUrl: null, backdropUrl: null };
    const data = await res.json() as {
      results?: Array<{
        poster_path?: string;
        backdrop_path?: string;
        media_type?: string;
      }>;
    };
    const item = data.results?.find(
      (r) => r.media_type !== 'person' && (r.poster_path || r.backdrop_path),
    );
    if (!item) return { posterUrl: null, backdropUrl: null };
    return {
      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : null,
    };
  } catch {
    return { posterUrl: null, backdropUrl: null };
  }
}

async function imageUrlToBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return { base64: btoa(binary), mimeType };
  } catch {
    return null;
  }
}

// ── Prompts ────────────────────────────────────────────────────────────

const SCHEMA = `{
  "themeName": "작품명 + 느낌 (예: '사냥개들 — 긴장감 속에서')",
  "theme": {
    "mode": "dark",
    "backgroundColor": "#hex (포스터의 가장 어두운 주요 배경색)",
    "accentColor": "#hex (포스터에서 가장 눈에 띄는 강조색 — 타이틀 컬러, 주요 오브젝트 색)",
    "secondaryAccentColor": "#hex (보조 강조색)",
    "widgetBackground": "#hex (배경보다 10~15% 밝은 위젯 카드 색)",
    "textPrimaryColor": "#hex (가독성 높은 밝은 텍스트 색)",
    "widgetOpacity": 0.88,
    "widgetBorderRadius": 12,
    "fontStyle": "modern"
  },
  "aiMessage": "이 작품의 분위기를 담은 테마 설명 — 감성적인 한국어 1~2문장"
}`;

const GENRE_GUIDE: Record<string, string> = {
  movie:
    '영화 장르별: 액션/스릴러 → widgetBorderRadius 4-6, fontStyle modern | 로맨스 → 20-24, classic | SF → 10-14, modern | 공포 → 2-4, modern | 코미디 → 18-22, modern',
  tv: 'TV 드라마 장르별: 스릴러 → widgetBorderRadius 6-10, modern | 로맨스/멜로 → 18-22, classic | 코미디 → 16-20, modern',
  variety: '예능 → widgetBorderRadius 18-24 (밝고 둥글게), fontStyle modern',
  anime: '애니메이션 → widgetBorderRadius 16-22 (둥글고 생동감), fontStyle modern',
  documentary: '다큐멘터리/교양 → widgetBorderRadius 8-12 (깔끔), fontStyle minimal',
};

function buildContentPrompt(title: string, type: string): string {
  const guide = GENRE_GUIDE[type] ?? 'widgetBorderRadius 8-16, 콘텐츠 분위기에 맞게';
  return `이 이미지는 "${title}" (${type}) 의 포스터입니다.

포스터를 분석해서 TV 홈 화면 테마를 생성하세요:
1. 포스터의 배경색, 강조색, 텍스트 색을 추출하세요
2. 장르와 분위기에 맞게 UI 모서리와 폰트 스타일을 결정하세요
   ${guide}
3. widgetOpacity는 0.85~0.95 사이, 포스터 분위기에 맞게

RAW JSON으로만 응답하세요 (마크다운, 코드펜스 없이):
${SCHEMA}`;
}

function buildTextThemePrompt(prompt: string): string {
  return `당신은 스마트TV 홈 화면 테마 디자이너입니다.
사용자 요청: "${prompt}"

RAW JSON으로만 응답하세요:
${SCHEMA.replace('작품명 + 느낌 (예: \'사냥개들 — 긴장감 속에서\')', '한국어 테마 이름')}`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenced ? fenced[1].trim() : trimmed;
}

// ── Handler ────────────────────────────────────────────────────────────

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json().catch(() => ({}))) as ThemeRequestBody;
  const { prompt, mode, watchHistory } = body;
  const modelId = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(geminiKey);

  try {
    let rawResult: string;
    let selectedTitle: string | undefined;
    let selectedType: string | undefined;
    let posterUrl: string | null = null;
    let backdropUrl: string | null = null;

    if (mode === 'content' && watchHistory && watchHistory.length > 0) {
      // 랜덤 선택은 클라이언트에서 이미 완료 — 첫 번째 항목이 선택된 컨텐츠
      const picked = watchHistory[0];
      selectedTitle = picked.title;
      selectedType = picked.type;

      // ── TMDB 이미지 검색 ───────────────────────────────────────────
      const tmdbKey = process.env.TMDB_API_KEY;
      let posterImg: { base64: string; mimeType: string } | null = null;

      if (tmdbKey) {
        // 영어 제목 우선, 없으면 한국어
        const queries = picked.titleEn
          ? [picked.titleEn, picked.title]
          : [picked.title];

        for (const q of queries) {
          const imgs = await fetchTmdbImages(q, tmdbKey);
          // backdrop 우선 (가로형이라 TV에 잘 맞음), 없으면 poster
          const targetUrl = imgs.backdropUrl ?? imgs.posterUrl;
          if (targetUrl) {
            posterUrl = imgs.posterUrl;
            backdropUrl = imgs.backdropUrl;
            posterImg = await imageUrlToBase64(targetUrl);
            if (posterImg) break;
          }
        }
      }

      // ── Gemini Vision (이미지 있으면) 또는 텍스트 폴백 ──────────────
      const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
      });

      if (posterImg) {
        const result = await model.generateContent([
          { inlineData: { data: posterImg.base64, mimeType: posterImg.mimeType } },
          { text: buildContentPrompt(picked.title, picked.type) },
        ]);
        rawResult = result.response.text();
      } else {
        // 이미지 없으면 텍스트만으로 생성
        const fallbackPrompt = `"${picked.title}" (${picked.type}) 작품의 분위기를 반영한 TV 홈 화면 테마를 만들어주세요.
장르에 맞게 widgetBorderRadius와 fontStyle도 설정해주세요.
${GENRE_GUIDE[picked.type] ?? ''}
RAW JSON으로만 응답:
${SCHEMA}`;
        const result = await model.generateContent(fallbackPrompt);
        rawResult = result.response.text();
      }
    } else {
      // ── 텍스트 기반 테마 ───────────────────────────────────────────
      const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(buildTextThemePrompt(prompt));
      rawResult = result.response.text();
    }

    let parsed: {
      themeName?: string;
      theme?: unknown;
      aiMessage?: string;
    };
    try {
      parsed = JSON.parse(extractJson(rawResult));
    } catch {
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON', raw: rawResult }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        kind: 'generate_theme',
        theme: parsed.theme,
        themeName: parsed.themeName,
        aiMessage: parsed.aiMessage,
        // 컨텐츠 기반일 때 추가 정보 반환
        ...(selectedTitle && {
          selectedTitle,
          selectedType,
          posterUrl,
          backdropUrl,
        }),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
