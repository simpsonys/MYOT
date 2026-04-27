# Myot — 주요 변경 사항 정리

> 초기 커밋(`fc67fed add theme features`) 이후 추가·수정된 내용입니다.  
> 작업 기준일: 2026-04-26

---

## 목차

1. [새 프리미티브 6개 추가](#1-새-프리미티브-6개-추가)
2. [TV 플레이어 시스템](#2-tv-플레이어-시스템)
3. [앱 진입 화면 — 레이아웃 선택기](#3-앱-진입-화면--레이아웃-선택기)
4. [테마 시스템 대폭 개선](#4-테마-시스템-대폭-개선)
5. [TV 화면 렌더링 개선](#5-tv-화면-렌더링-개선)
6. [개발 환경 개선 (vercel dev 불필요)](#6-개발-환경-개선)
7. [수정된 파일 목록](#7-수정된-파일-목록)

---

## 1. 새 프리미티브 6개 추가

> 위치: `src/primitives/<name>/`  
> 모두 `src/primitives/registry.ts`에 등록되어 AI가 즉시 사용 가능

### 1-1. `clock-face` ⏰ 시계

실시간으로 매초 업데이트되는 시계 프리미티브.

| prop | 값 | 설명 |
|---|---|---|
| `style` | `"analog"` \| `"digital"` \| `"minimal"` | 시계 시각화 방식 |
| `showDate` | boolean | 날짜 표시 여부 |
| `showSeconds` | boolean | 초침/초 표시 여부 |

- **analog**: SVG 시계판 + 회전하는 시침·분침·초침
- **digital**: 깜빡이는 콜론(`:`)이 있는 큰 숫자 시계
- **minimal**: 액센트 컬러의 숫자만 표시 (다른 위젯 옆에 배치할 때)

```jsonc
// AI 발화 예시: "왼쪽 상단에 아날로그 시계 놓아줘"
{ "primitive": "clock-face", "props": { "style": "analog", "showDate": true } }
```

---

### 1-2. `text-block` 📝 텍스트 블록

여러 줄 텍스트 표시용. `chat-bubble`이 대화체라면 이건 문서형.

| prop | 값 | 설명 |
|---|---|---|
| `title` | string | 액센트 컬러 소제목 (optional) |
| `body` | string | 본문 (`\n`으로 줄바꿈 가능) |
| `size` | `"sm"` \| `"md"` \| `"lg"` | 폰트 크기 |
| `align` | `"left"` \| `"center"` | 정렬 |

```jsonc
// AI 발화 예시: "오늘의 명언 위젯 만들어줘"
{
  "primitive": "text-block",
  "props": { "title": "오늘의 명언", "body": "\"시작이 반이다.\"", "align": "center" }
}
```

---

### 1-3. `media-bar` 🎵 미디어 플레이어 바

지금 재생 중인 음악·영상·팟캐스트 표시. 재생/일시정지 버튼을 누르면 `media.togglePlay` 이벤트를 버스에 emit.

| prop | 값 | 설명 |
|---|---|---|
| `title` | string | 트랙/에피소드 제목 |
| `subtitle` | string | 아티스트/채널명 |
| `thumbnailSeed` | string | 자동 썸네일 시드 (URL 없을 때) |
| `isPlaying` | boolean | 재생 상태 |
| `progress` | 0..1 | 재생 위치 |
| `mediaType` | `"music"` \| `"video"` \| `"podcast"` | 아이콘 변경 |

---

### 1-4. `gauge-bar` 📏 게이지 바

가로형 진행률 바. `progress-ring`(원형)과 달리 넓은 셀에 어울림.

| prop | 값 | 설명 |
|---|---|---|
| `value` | 0..1 | 채움 비율 |
| `label` | string | 왼쪽 레이블 |
| `valueLabel` | string | 오른쪽 값 텍스트 (기본: 퍼센트) |
| `color` | string | 컬러 오버라이드 |
| `segments` | string[] | 구간 레이블 (e.g. `["낮음","보통","높음"]`) |

```jsonc
// 스택 3개로 배터리 현황
{ "primitive": "gauge-bar", "props": { "value": 0.12, "label": "도어락", "color": "#FF6B6B" } }
```

---

### 1-5. `timeline` 📅 타임라인

시간 순서가 있는 이벤트 목록. 왼쪽 시간, 오른쪽 내용, 연결선.

| prop | 값 | 설명 |
|---|---|---|
| `items` | `{ time, label, done?, accent? }[]` | 항목 배열 |
| `title` | string | 섹션 헤더 |
| `compact` | boolean | 촘촘한 간격 |

- `done: true` → 취소선 + 흐리게
- `accent: true` → 액센트 컬러로 강조 (현재 항목 표시 등)

---

### 1-6. `video-player` 📺 TV 플레이어 *(시스템 위젯)*

> **팀원이 직접 compose할 필요 없음.** 앱 시작 시 자동으로 배치되는 시스템 위젯.

로컬 미디어 파일(MP4, MOV, MKV 등)을 드래그&드롭 또는 클릭으로 재생.

- 마우스 오버 시 재생/일시정지, 탐색바, 파일 교체 컨트롤 표시
- `media.play` / `media.pause` / `media.ended` 이벤트를 버스에 emit

---

## 2. TV 플레이어 시스템

### 2-1. 항상 존재하는 배경 위젯

`id: "main-tv-player"` 위젯은 앱 시작부터 항상 존재하며 레이아웃 리셋 시에도 제거되지 않습니다.

```ts
// src/store/tvStore.ts
export const MAIN_PLAYER_ID = 'main-tv-player';
```

### 2-2. 자동 크기 조절 (`syncPlayerGrid`)

AI가 새 위젯을 오른쪽에 배치하면 TV 플레이어가 자동으로 왼쪽 공간을 채웁니다.

| 상태 | grid 위치 |
|---|---|
| 위젯 없음 (솔로) | `col 2, row 1, colspan 10, rowspan 7` — 사방 배경 노출 |
| 위젯 col 9에 추가 | `col 1, row 1, colspan 8, rowspan 8` |
| 위젯 col 7에 추가 | `col 1, row 1, colspan 6, rowspan 8` |
| 최소 colspan | 5 (하한선) |

```
위젯 추가 전:      위젯 추가 후:
┌────────────┐    ┌────────┬───┐
│            │    │   TV   │위젯│
│  TV Player │    │        │   │
│ (col2~11)  │    │(col1~8)│9~12│
│            │    └────────┴───┘
└────────────┘
```

### 2-3. AI 시스템 프롬프트에 규칙 추가

`src/runtime/orchestrator.ts`에 섹션 추가:

```
# SYSTEM TV PLAYER
- "main-tv-player" 위젯은 절대 삭제·수정하지 말 것
- 새 위젯 배치 기준: 1개 → col 9, colspan 4 / 2개 → 각 rowspan 4 / 3개+ → col 7~8
```

---

## 3. 앱 진입 화면 — 레이아웃 선택기

### 3-1. 진입 플로우 변경

```
이전: 바로 빈 Shell 표시
이후: LayoutSelector → 레이아웃 선택 → Shell (framer-motion 페이드 전환)
```

### 3-2. 3가지 프리셋 레이아웃 (`src/data/presetLayouts.ts`)

| 프리셋 | TV 비율 | 함께 표시되는 위젯 |
|---|---|---|
| 🎬 홈 시어터 | 8/12 좌측 | 디지털 시계 + AI 환영 메시지 |
| 🎞 시네마 와이드 | 12×6 전폭 상단 | 미디어 바 + 빠른 스탯 |
| 📊 스마트 대시보드 | 7/12 좌측 | 아날로그 시계 + 일정 타임라인 + 게이지 바 |

각 프리셋마다 고유한 테마 색상(accentColor, backgroundColor)이 적용됩니다.

### 3-3. 신규 파일

| 파일 | 설명 |
|---|---|
| `src/components/LayoutSelector.tsx` | 선택 화면 UI (카드 호버 애니메이션, 미니 프리뷰) |
| `src/data/presetLayouts.ts` | 3개 프리셋 데이터 정의 |

### 3-4. Store 변경 (`src/store/tvStore.ts`)

```ts
// 추가된 상태
layoutSelected: boolean;      // false면 LayoutSelector 표시

// 추가된 액션
enterApp(layout): void;        // 레이아웃 선택 → Shell 전환
```

---

## 4. 테마 시스템 대폭 개선

### 4-1. Theme 타입 확장 (`src/types/index.ts`)

```ts
export interface Theme {
  // ... 기존 필드 ...
  backgroundImage?: string;  // ← 신규: 배경 이미지 URL
}
```

### 4-2. 컨텐츠 기반 테마 (`api/theme.ts`)

**이전**: 최근 시청 3개를 조합해 색상만 생성  
**이후**: 1개를 선택해 포스터 이미지 기반으로 색상·스타일 통합 생성

```
클라이언트 (themeGenerator.ts)
  └─ watchHistory에서 랜덤 1개 선택   ← 브라우저에서 실행 (서버 캐시 영향 없음)
  └─ /api/theme 에 1개만 전송

서버 (api/theme.ts)
  └─ TMDB에서 backdrop(가로) 또는 poster(세로) 검색
  └─ Gemini Vision으로 이미지 분석
  └─ 장르별 스타일 규칙 적용 →  widgetBorderRadius + fontStyle 결정
  └─ 응답: theme + posterUrl + backdropUrl + selectedTitle
```

**장르별 스타일 자동 결정:**

| 장르 | widgetBorderRadius | fontStyle |
|---|---|---|
| 액션 / 스릴러 | 4 – 6 (날카롭게) | modern |
| 로맨스 / 드라마 | 18 – 24 (부드럽게) | classic |
| SF / 판타지 | 10 – 14 (중간) | modern |
| 공포 | 2 – 4 (각지게) | modern |
| 예능 | 18 – 24 (둥글게) | modern |
| 애니메이션 | 16 – 22 (둥글게) | modern |
| 다큐멘터리 | 8 – 12 (미니멀) | minimal |

### 4-3. 배경 이미지 자동 적용 (`src/runtime/aiDispatcher.ts`)

컨텐츠 기반 테마 적용 시, backdrop(우선) 또는 poster를 `theme.backgroundImage`에 자동 설정:

```ts
const bgImage = result.backdropUrl ?? result.posterUrl ?? undefined;
const themeWithName: Theme = { ...result.theme, backgroundImage: bgImage };
store.applyTheme(themeWithName);
```

---

## 5. TV 화면 렌더링 개선

### 5-1. 배경 이미지 레이어 시스템 (`src/components/TVScreen.tsx`)

`theme.backgroundImage`가 있을 때 3개 레이어로 렌더링:

```
[Layer 0] backgroundColor (항상)
[Layer 1] backgroundImage (있을 때만, framer-motion 1.2초 페이드인)
  ├─ 이미지 자체        blur(4px), opacity 0.90
  ├─ 경량 컬러 블렌드   배경색 25~35% 오버레이
  ├─ radial 비네팅      중앙 선명, 가장자리 자연스럽게 페이드
  └─ 하단 비네팅        하단 28% 페이드아웃
[Layer 2] 위젯 그리드   z-index 1, 투명 배경
```

### 5-2. 위젯 테두리 테마 연동

```ts
// 모든 일반 위젯에 적용
border: `1px solid ${theme.accentColor}35`,
boxShadow: `inset 0 1px 0 ${theme.accentColor}20, 0 4px 24px rgba(0,0,0,0.35)`,
backdropFilter: 'blur(14px)',
// borderRadius는 기존대로 theme.widgetBorderRadius 사용
```

테마 변경 시 `transition: 600ms`로 부드럽게 전환됩니다.

### 5-3. 위젯 배경 투명도

배경 이미지가 있을 때 위젯 배경이 더 투명해져 이미지가 비칩니다:

```ts
background = theme.backgroundImage
  ? 'rgba(10, 14, 26, 0.55)'  // glassmorphism
  : 'rgba(20, 27, 45, 0.75)'  // 기본 불투명도
```

---

## 6. 개발 환경 개선

### 6-1. `vercel dev` 없이 개발 가능

기존에는 AI 기능을 테스트하려면 `vercel dev`가 필요했으나, `vite.config.ts`에 개발용 API 미들웨어를 내장했습니다.

```
이전: npm run dev → /api/* 404 에러 → vercel dev 별도 실행 필요
이후: npm run dev → /api/gemini, /api/theme 모두 동작
```

**구현 방식** (`vite.config.ts`):

```ts
// /api/gemini: ssrLoadModule로 orchestrator + registry 로드 후 직접 Gemini 호출
// /api/theme:  api/theme.ts를 ssrLoadModule로 로드해 Web Request/Response로 프록시
configureServer(server) {
  server.middlewares.use(async (req, res, next) => { ... });
}
```

`.env.local`의 `GEMINI_API_KEY`, `TMDB_API_KEY`를 자동으로 `process.env`에 주입합니다.

### 6-2. `vite.config.js` 충돌 파일 삭제

이전 빌드 아티팩트인 `vite.config.js`, `vite.config.d.ts`가 `vite.config.ts`보다 우선 로드되어 미들웨어가 무시되던 문제를 해결했습니다. 두 파일을 삭제했습니다.

---

## 7. 수정된 파일 목록

### 신규 생성

| 파일 | 분류 | 설명 |
|---|---|---|
| `src/primitives/clock-face/` | 프리미티브 | 실시간 시계 (analog/digital/minimal) |
| `src/primitives/text-block/` | 프리미티브 | 멀티라인 텍스트 표시 |
| `src/primitives/media-bar/` | 프리미티브 | 미디어 플레이어 바 |
| `src/primitives/gauge-bar/` | 프리미티브 | 수평 게이지 바 |
| `src/primitives/timeline/` | 프리미티브 | 타임라인 이벤트 목록 |
| `src/primitives/video-player/` | 프리미티브 | 로컬 파일 TV 플레이어 (시스템) |
| `src/components/LayoutSelector.tsx` | UI | 앱 최초 진입 레이아웃 선택 화면 |
| `src/data/presetLayouts.ts` | 데이터 | 3개 프리셋 레이아웃 정의 |

### 기존 수정

| 파일 | 변경 요약 |
|---|---|
| `src/primitives/registry.ts` | 신규 프리미티브 6개 등록 |
| `src/types/index.ts` | `Theme.backgroundImage` 필드 추가 |
| `src/store/tvStore.ts` | `MAIN_PLAYER_ID`, `syncPlayerGrid`, `layoutSelected`, `enterApp` 추가 / `applyLayout` · `composeWidget` · `clearWidgets` 수정 |
| `src/App.tsx` | `AppRouter`로 LayoutSelector ↔ Shell 전환, 테마 배경색 Shell에 반영 |
| `src/components/TVScreen.tsx` | 배경 이미지 레이어, 위젯 테두리 테마 연동, 솔로 플레이어 힌트 오버레이 |
| `src/runtime/orchestrator.ts` | TV 플레이어 보존 규칙 + 우측 배치 가이드 추가 |
| `src/runtime/aiDispatcher.ts` | 컨텐츠 테마 시 `backgroundImage` 자동 설정 |
| `src/lib/themeGenerator.ts` | `ThemeGenerateResult`에 `posterUrl` · `backdropUrl` · `selectedTitle` 추가, 클라이언트 랜덤 선택 |
| `api/theme.ts` | 단일 컨텐츠 선택, TMDB 이미지 검색, Gemini Vision 분석, 장르별 스타일 룰 |
| `vite.config.ts` | 개발용 `/api/gemini` · `/api/theme` 미들웨어 내장 |

---

## 팀원을 위한 작업 가이드

### 새 프리미티브 추가하기

```bash
# 1. 템플릿 복사
cp -r src/primitives/_template src/primitives/my-primitive

# 2. My-primitive.tsx 구현 (props, theme, emit 활용)
# 3. index.ts에 description과 examples 작성 (AI 학습의 핵심)
# 4. registry.ts에 한 줄 등록
```

> `examples` 배열에 풍부한 예시를 넣을수록 AI가 더 잘 활용합니다.

### 발화 테스트

브라우저에서 `Ctrl+K` → **Tester 탭** → 발화 입력 → `dryRun` 체크 시 실제 AI 호출 없이 시스템 프롬프트 미리보기 가능.

### 환경 변수 (`.env.local`)

```
GEMINI_API_KEY=...    # 필수
GEMINI_MODEL=gemini-2.5-flash  # 선택 (기본값)
TMDB_API_KEY=...      # 컨텐츠 기반 테마에 필요 (없으면 텍스트 폴백)
```
