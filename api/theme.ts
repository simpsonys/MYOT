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

interface PosterImage {
  title: string;
  base64: string;
  mimeType: string;
}

// TMDB에서 포스터 이미지 URL을 검색
async function fetchPosterUrl(title: string, tmdbApiKey: string): Promise<string | null> {
  try {
    // 한국어 타이틀로 먼저 검색
    const koUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&language=ko-KR&page=1`;
    const koRes = await fetch(koUrl);
    if (koRes.ok) {
      const data = await koRes.json() as { results?: Array<{ poster_path?: string; backdrop_path?: string; media_type?: string }> };
      const item = data.results?.find(
        (r) => r.media_type !== 'person' && (r.poster_path || r.backdrop_path)
      );
      if (item) {
        const path = item.poster_path ?? item.backdrop_path;
        if (path) return `https://image.tmdb.org/t/p/w300${path}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// 이미지 URL을 base64 인코딩
async function imageToBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return { base64: btoa(binary), mimeType };
  } catch {
    return null;
  }
}

const THEME_JSON_SCHEMA = `{
  "themeName": "한국어 테마 이름 (예: '사냥개들 느낌')",
  "theme": {
    "mode": "dark" | "light",
    "backgroundColor": "#hex 6자리",
    "accentColor": "#hex 6자리 (배경 대비 눈에 띄는 컬러)",
    "secondaryAccentColor": "#hex 6자리 (보조 강조색)",
    "widgetBackground": "#hex 6자리 (위젯 배경, 약간 투명하게 표현하려면 배경색보다 조금 밝게)",
    "textPrimaryColor": "#hex 6자리",
    "widgetOpacity": 0.6~0.95 사이 숫자,
    "widgetBorderRadius": 8~24 사이 정수,
    "fontStyle": "modern" | "classic" | "minimal"
  },
  "aiMessage": "친근한 한국어로 테마 설명 (1~2문장)"
}`;

function buildTextThemePrompt(prompt: string): string {
  return `당신은 스마트TV 홈 화면 테마 디자이너입니다.
사용자의 요청을 분석해서 어울리는 TV 홈 화면 테마를 생성하세요.

사용자 요청: "${prompt}"

RAW JSON 으로만 응답하세요 (마크다운, 코드펜스 없이):
${THEME_JSON_SCHEMA}

규칙:
- backgroundColor는 TV 화면 전체 배경색
- accentColor는 위젯 테두리, 강조 텍스트에 사용
- widgetBackground는 각 위젯의 카드 배경색 (배경보다 약간 밝게)
- 색상들은 서로 조화롭게 구성
- dark mode가 기본이지만 사용자 요청에 따라 light 가능`;
}

function buildContentThemePrompt(titles: string[]): string {
  return `당신은 스마트TV 홈 화면 테마 디자이너입니다.
첨부된 이미지들은 사용자가 최근에 시청한 TV 프로그램/영화의 포스터입니다: ${titles.join(', ')}

이 이미지들을 분석해서:
1. 각 작품의 주요 색상, 분위기, 시각적 스타일을 파악하세요
2. 이 작품들이 공유하는 전체적인 무드와 색감을 추출하세요
3. 그 느낌을 살린 TV 홈 화면 테마를 생성하세요

RAW JSON 으로만 응답하세요 (마크다운, 코드펜스 없이):
${THEME_JSON_SCHEMA}

규칙:
- 포스터 이미지에서 실제 색상을 추출해서 반영하세요
- themeName은 컨텐츠와 분위기를 담은 한국어 이름으로
- aiMessage에서 어떤 작품들의 어떤 분위기에서 영감을 받았는지 설명하세요`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenced ? fenced[1].trim() : trimmed;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const body = await req.json().catch(() => ({})) as ThemeRequestBody;
  const { prompt, mode, watchHistory } = body;

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const modelId = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    let rawResult: string;

    if (mode === 'content' && watchHistory && watchHistory.length > 0) {
      // 컨텐츠 기반 테마: TMDB 포스터 이미지 → Gemini Vision
      const tmdbApiKey = process.env.TMDB_API_KEY;

      // TMDB API 키가 없으면 텍스트 기반으로 폴백
      if (!tmdbApiKey) {
        const textPrompt = `사용자가 최근에 시청한 컨텐츠: ${watchHistory.map((h) => h.title).join(', ')}
이 컨텐츠들의 분위기를 반영한 TV 홈 화면 테마를 생성하세요.`;
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(buildTextThemePrompt(textPrompt));
        rawResult = result.response.text();
      } else {
        // TMDB에서 상위 3개 타이틀의 포스터 이미지 가져오기
        const topTitles = watchHistory.slice(0, 3);
        const posterResults = await Promise.all(
          topTitles.map(async (item) => {
            const searchTitle = item.titleEn ?? item.title;
            const url = await fetchPosterUrl(searchTitle, tmdbApiKey);
            if (!url) {
              // 영어 타이틀이 있으면 한국어로도 재시도
              if (item.titleEn) {
                const koUrl = await fetchPosterUrl(item.title, tmdbApiKey);
                if (koUrl) {
                  const img = await imageToBase64(koUrl);
                  return img ? { title: item.title, ...img } as PosterImage : null;
                }
              }
              return null;
            }
            const img = await imageToBase64(url);
            return img ? { title: item.title, ...img } as PosterImage : null;
          })
        );

        const validPosters = posterResults.filter((p): p is PosterImage => p !== null);

        if (validPosters.length === 0) {
          // 이미지 로드 실패 시 텍스트 기반으로 폴백
          const fallbackPrompt = `사용자가 최근에 시청한 컨텐츠: ${watchHistory.map((h) => h.title).join(', ')}
이 컨텐츠들의 분위기를 반영한 TV 홈 화면 테마를 생성하세요.`;
          const model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
          });
          const result = await model.generateContent(buildTextThemePrompt(fallbackPrompt));
          rawResult = result.response.text();
        } else {
          // Gemini Vision으로 이미지 분석
          const model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
          });

          const imageParts = validPosters.map((p) => ({
            inlineData: { data: p.base64, mimeType: p.mimeType },
          }));

          const titles = validPosters.map((p) => p.title);
          const result = await model.generateContent([
            ...imageParts,
            { text: buildContentThemePrompt(titles) },
          ]);
          rawResult = result.response.text();
        }
      }
    } else {
      // 텍스트 기반 테마 생성
      const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(buildTextThemePrompt(prompt));
      rawResult = result.response.text();
    }

    const jsonText = extractJson(rawResult);
    let parsed: { themeName?: string; theme?: unknown; aiMessage?: string };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON', raw: rawResult }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        kind: 'generate_theme',
        theme: parsed.theme,
        themeName: parsed.themeName,
        aiMessage: parsed.aiMessage,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
