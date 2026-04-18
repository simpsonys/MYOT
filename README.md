# Myot — Playground (Composable Primitives Edition)

> **"말하면 만들어진다"** — 자연어로 TV 홈 화면의 위젯이 실시간으로 조립되는 플랫폼.

## 🌟 이 프로젝트의 진짜 차별점

**위젯은 코드에 존재하지 않습니다.**

- 기존 스마트TV: 제조사가 만든 고정 위젯 중 **선택**
- 기존 대시보드 빌더: 미리 만든 위젯을 **배치**
- **Myot**: 유저가 말하면 AI가 프리미티브를 **조합해 위젯을 즉석에서 생성**

유저가 "오늘 운세 위젯 보여줘" 라고 하면, 코드 어디에도 "운세 위젯"은 없지만 AI가 `image-frame` (타로 카드) + `chat-bubble` (운세) + `action-button` (다시 뽑기) 을 조합해 그 자리에서 만들어냅니다.

이게 PPT 에 썼던 "Vibe Decorating" 의 실체입니다.

---

## 🏗 3-레이어 아키텍처

```
┌─────────────────────────────────────────┐
│  TV Canvas (12×8 grid)                  │  ← 화면 전체
├─────────────────────────────────────────┤
│  Widget Blueprints (AI가 즉석에서 생성) │  ← 데이터 트리
├─────────────────────────────────────────┤
│  Primitives (팀원이 만드는 조각들)       │  ← 실제 React 컴포넌트
└─────────────────────────────────────────┘
```

- **Primitive**: 팀원이 만드는 원자 단위 (`stat-tile`, `chat-bubble`, `map-card` 등)
- **Widget Blueprint**: `{ id, grid, root: PrimitiveNode }` — AI가 JSON 으로 조립
- **TV Canvas**: 그리드에 블루프린트들을 배치

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local        # GEMINI_API_KEY 입력
npm install -g vercel
vercel dev                        # http://localhost:3000
```

**⌘K / Ctrl+K** 로 Dev Tools 토글.

## 🛠 Dev Tools (5개 탭)

| Tab | 용도 |
|---|---|
| 🧱 **Primitives** | 등록된 모든 프리미티브 + 작성 예시 |
| 🧬 **Blueprints** | 지금 화면에 있는 위젯의 트리 JSON 실시간 확인 |
| 🧪 **Tester** | 발화를 드라이런 + 시스템 프롬프트 미리보기 |
| 📡 **Events** | 프리미티브 간 이벤트 버스 로그 |
| 🧠 **AI Trace** | AI 결정 히스토리 (kind/duration/대상) |

## 📂 프로젝트 구조

```
src/
├── primitives/                  ← 🟢 팀원 작업 영역
│   ├── _template/               ←   복사 시작점
│   ├── stat-tile/               ←   [LEAF] 큰 숫자 + 라벨
│   ├── chat-bubble/             ←   [LEAF] 감정 tone 챗 버블
│   ├── choice-list/             ←   [LEAF] 선택 카드 리스트
│   ├── map-card/                ←   [LEAF] 지도 + 경로 overlay
│   ├── image-frame/             ←   [LEAF] 이미지 (shape 지원)
│   ├── action-button/           ←   [LEAF] 터치 버튼 + event emit
│   ├── progress-ring/           ←   [LEAF] 원형 프로그레스
│   ├── stack/                   ←   [CONTAINER] 세로 배치
│   ├── stat-row/                ←   [CONTAINER] 가로 스탯 배치
│   └── registry.ts              ←   한 줄 등록
├── runtime/                     ← 🔒 수정 금지 (플레이그라운드 코어)
│   ├── orchestrator.ts          ←   프리미티브 → 시스템 프롬프트
│   ├── blueprintRenderer.tsx    ←   트리 → React 재귀 렌더
│   ├── treeOps.ts               ←   path 기반 트리 mutation
│   ├── aiDispatcher.ts          ←   AI 응답 → 상태 변환
│   └── eventBus.tsx             ←   이벤트 버스 (useBusEvent)
├── components/
│   ├── TVScreen.tsx
│   ├── PromptInput.tsx
│   ├── RecommendationPanel.tsx
│   └── devtools/                ←   5개 Dev Tools 탭
├── store/tvStore.ts             ←   blueprint mutation actions
├── lib/gemini.ts
└── types/index.ts               ← 🔒 수정 금지

api/gemini.ts                    ←   Vercel 서버리스 프록시
```

## 🎯 5가지 AI 응답 kind

| Kind | 언제 | 예시 발화 |
|---|---|---|
| `compose_widget` | 새 위젯 생성 | "운세 위젯 만들어줘" |
| `mutate_widget` | 기존 위젯 내부 변경 | "이 위젯에 추천 코스 3개 추가" |
| `layout` | 전체 레이아웃 리셋 | "처음부터 다시" |
| `recommendations` | 여러 레이아웃 제안 | "추천 3개 보여줘" |
| `emit_event` | 이벤트 브로드캐스트 | "비 온다고 알려줘" |

## 📖 문서

- `TEAM_GUIDE.md` — 팀원 온보딩 + 프리미티브 만들기 철학
- `DEMO_SCRIPT.md` — 해커톤 시연 시나리오
- `CONTINUATION_PROMPTS.md` — Claude Code / Cursor 이어쓰기 프롬프트

## 🚢 Vercel 배포

1. GitHub push → Vercel 연결
2. Environment Variables → `GEMINI_API_KEY` 추가
3. Push 마다 자동 배포
