# Myot — Playground

> **"너만의 TV를 만드세요"** — 자연어로 TV 홈 화면을 창조하는 Vibe Decorating 플랫폼 MVP.

이 프로젝트는 완성품이 아니라 **playground** 입니다. 코어 프레임워크만 제공하고, 실제 위젯은 팀원들이 해커톤에서 만듭니다. 그래서 이 repo의 가치는 **"얼마나 많은 기능이 있느냐"** 가 아니라 **"팀원이 만든 위젯이 자연어로 어떻게 동작하느냐"** 입니다.

---

## 🎯 핵심 철학

**위젯은 AI에게 스스로를 설명한다.**

각 위젯 폴더는 자신의 `index.ts` 에 다음 4가지를 선언합니다:
- **description** — "나는 이런 역할이야"
- **utterances** — "이런 발화가 들어오면 이렇게 해"
- **actions** — "나를 이런 식으로 조종할 수 있어"
- **collaboratesWith** — "이 위젯이랑 같이 있으면 이렇게 동작해"

런타임에 AI 오케스트레이터가 **모든 위젯의 선언을 긁어모아** 시스템 프롬프트를 조립합니다. 위젯을 추가해도 프롬프트 엔지니어링이 필요 없어요 — 위젯이 곧 프롬프트입니다.

---

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local        # GEMINI_API_KEY 입력 (https://aistudio.google.com/apikey)
npm install -g vercel
vercel dev                        # http://localhost:3000
```

> `npm run dev` 대신 **`vercel dev`** 쓰세요. Gemini 프록시(서버리스 함수) 돌려야 AI 호출됩니다.

**⌘K / Ctrl+K** 로 Dev Tools 토글.

---

## 🧩 Dev Tools (Playground 핵심)

오른쪽 하단 ⚙️ 버튼 또는 ⌘K.

| Tab | 용도 |
|---|---|
| **🔍 Inspector** | 모든 위젯의 AI 계약(description, utterances, actions) 확인 |
| **🧪 Tester** | 발화를 TV에 적용하지 않고 "AI가 어떻게 해석할지" 드라이런. 현재 시스템 프롬프트 미리보기도 가능 |
| **📡 Events** | 위젯 간 이벤트 버스에 흐른 모든 이벤트 로그 |
| **🧠 AI Trace** | AI 가 내린 결정(kind/action/durationMs) 히스토리 |

---

## 📦 프로젝트 구조

```
src/
├── widgets/
│   ├── _template/        # 🟢 복사용 — 최소 위젯 예시
│   ├── example/          # 🟡 모든 패턴 데모 (utterances·actions·events·collaboration)
│   ├── running-coach/    # 🔴 차별화 시그니처 — Living Widget 패턴
│   └── registry.ts       # 한 줄 등록
├── runtime/              # Playground 런타임 (팀원 수정 금지)
│   ├── orchestrator.ts   #   ↳ registry 에서 시스템 프롬프트 동적 생성
│   ├── eventBus.tsx      #   ↳ React Context 이벤트 버스 + useWidgetEvent
│   ├── actionRegistry.ts #   ↳ widgetId.action() 매핑
│   ├── widgetController  #   ↳ 위젯 마운트 시 actions/events 바인딩
│   └── aiDispatcher.ts   #   ↳ 유저 발화 → AI 호출 → 결과 디스패치
├── components/
│   ├── TVScreen.tsx      # 12x8 그리드 캔버스
│   ├── PromptInput.tsx
│   └── devtools/         # 4개 탭 Dev Tools
├── store/tvStore.ts      # Zustand
├── lib/gemini.ts         # 클라이언트
└── types/index.ts        # 위젯 계약 정의

api/gemini.ts             # Vercel 서버리스 (API 키 보호)
```

---

## 🛠 Vercel 배포

1. GitHub 에 push
2. vercel.com → New Project → repo 선택
3. Environment Variables → `GEMINI_API_KEY` 추가
4. Deploy. Push 할 때마다 자동 재배포.

---

## 📖 팀원 가이드

`TEAM_GUIDE.md` — **꼭 읽을 것.** 위젯 만드는 법, 철학, 바이브코딩 프롬프트 포함.
