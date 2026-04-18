# 팀원 가이드 — Myot Playground

> **너의 임무:** 프리미티브 하나를 만들어. 그게 AI 의 어휘가 돼서, 너와 다른 팀원이 **상상도 못 한 위젯**을 유저 발화 한 마디로 만들어내게 해.

---

## 🎯 먼저 직접 만져봐

문서 읽기 전에 배포된 Myot 을 먼저 써봐. 5분이면 충분해.

1. 팀 리더가 공유한 Vercel URL 접속 (예: `https://myot-....vercel.app`)
2. 하단 입력창에 이런 발화를 **하나씩** 던져보기:
   - `"러닝 경로 위젯 만들어줘"`
   - `"오늘 운세 위젯도 하나 띄워줘"` ← **이게 제일 중요**
   - `"D-Day 카운터 — 내 생일까지 몇일"`
   - `"가족 사진이랑 손녀한테 전화하는 버튼 만들어줘"`
3. ⌘K (Mac) 또는 Ctrl+K (Win) → **Dev Tools** 열기
4. **🧱 Primitives** 탭 → 현재 어휘 10개 확인
5. **🧬 Blueprints** 탭 → AI가 방금 조립한 위젯의 트리 JSON 관찰
6. **🧠 AI Trace** 탭 → AI 가 어떤 결정 (`compose_widget`, `mutate_widget`, `layout`) 을 내렸는지

이거 다 해봤으면, 다음 문장의 의미가 확 와닿을 거야:

> **"운세 위젯이라는 코드는 이 프로젝트에 존재하지 않아. AI 가 10개 조각을 조합해 그 자리에서 만든 거야."**

이게 PPT 의 "말하면 만들어진다" 의 실체야.

---

## 🧱 프리미티브란 뭔가 — 비유 3가지

### 비유 1: 레고 블록
- **위젯 (완성품)** = 레고로 만든 우주선, 성, 비행기
- **프리미티브 (부품)** = 2×2 블록, 플레이트, 바퀴, 창문

우주선을 **미리 만들어 파는** 회사 vs **블록만 파는** 회사(레고). **Myot 은 레고야.**

**너는 새로운 모양의 블록을 디자인하는 사람이야.** 우주선을 만들 필요 없어. 좋은 블록 하나가 우주선, 성, 비행기, 기차에 전부 쓰여.

### 비유 2: 요리 재료
- **위젯 (요리)** = 김치찌개, 파스타, 샐러드
- **프리미티브 (재료)** = 파, 마늘, 간장, 올리브오일

**너는 새로운 재료를 발명하는 사람이야.** 김치찌개 레시피를 외울 필요 없어. 재료가 좋으면 **한 번도 상상 못 한 요리**가 나와.

### 비유 3: 알파벳
- **위젯 (문장)** = "오늘 날씨 좋아"
- **프리미티브 (글자)** = ㅇ, ㅗ, ㄴ, ㅡ, ㄹ

**너는 새로운 글자를 만드는 사람이야.** 26개 알파벳으로 무한한 문장이 가능하듯, 15개 프리미티브로 무한한 위젯이 나와.

---

## 📚 지금 Myot 의 어휘집 (10개)

네 팀이 아직 기여하기 전 상태. 이게 현재 AI 가 쓸 수 있는 어휘 전부야.

| 프리미티브 | 역할 | 이미 가능한 위젯 예 |
|---|---|---|
| **stat-tile** | 큰 숫자 + 라벨 | 러닝 거리, D-Day, 온도 |
| **chat-bubble** | 대화 버블 (감정 tone) | AI 코멘트, 운세 메시지 |
| **choice-list** | 선택 카드 리스트 | 경로 추천, 메뉴 선택 |
| **map-card** | 지도 + 경로 overlay | 러닝 경로, 여행지 |
| **image-frame** | 이미지 (사각/원형) | 가족 사진, 타로 카드 |
| **action-button** | 큰 터치 버튼 | 앱 런처, 영상통화 |
| **progress-ring** | 원형 프로그레스 | 걸음 목표, 점수 |
| **stack** | 세로 컨테이너 | 위젯 골격 |
| **stat-row** | 가로 컨테이너 | 스탯 3개 나란히 |
| **_template** | 복사 시작점 | (실사용 X) |

이 10개로 AI 가 러닝/운세/D-Day/가족/주식/통화/스마트홈 위젯을 이미 만들어내. 네가 만들 건 **이 어휘를 늘리는 것**이야.

---

## 👥 팀 3명의 영역 제안

팀 리더가 참신한 아이디어를 기대하니까 아래는 **참고용**이야. 각자 끌리는 방향 잡되, 역할이 서로 안 겹치면 돼.

### 🅐 "데이터 표현" 영역
**미션:** 정보를 더 풍부하게 시각화하는 프리미티브

후보:
- **sparkline** — 미니 라인차트 (심박수 추이, 주가 등락)
- **heatmap-grid** — GitHub 잔디 (습관 트래커, 활동 기록)
- **gauge** — 반원 계기판 (만족도, 속도, 점수)
- **stat-compare** — 두 값 좌우 비교 (어제 vs 오늘, 나 vs 평균)

이것들이 생기면 가능해지는 위젯:
- 수면 품질 대시보드 · 주식 변동 차트 · 습관 트래커 · 운동 개선 추적

### 🅑 "감정 / 분위기" 영역
**미션:** TV 라는 큰 화면, 오래 켜두는 특성을 살린 감성적 조각

후보:
- **mood-gradient** — 시간/날씨/감정에 따라 변하는 배경
- **parallax-layer** — 움직이는 레이어 (깊이감)
- **typewriter-text** — 한 글자씩 나타나는 텍스트
- **ambient-particle** — 눈/비/꽃잎 파티클
- **flip-digit** — 부드럽게 회전하며 바뀌는 숫자

이것들이 생기면 가능해지는 위젯:
- 시적인 운세 · 앰비언트 날씨 · 플립시계 · 계절 감지 배경

### 🅒 "인터랙션 / 컨텍스트" 영역
**미션:** TV 와 상호작용하거나 외부 맥락을 끌어오는 조각

후보:
- **toggle-list** — 스마트홈 스위치
- **circular-menu** — 리모컨 친화적 방사형 메뉴
- **timeline-strip** — 수평 타임라인 (일정, 가족 이벤트)
- **avatar-ring** — 여러 얼굴 원형 나열
- **countdown-button** — 누르면 카운트다운 후 실행

이것들이 생기면 가능해지는 위젯:
- 스마트홈 통합 제어 · 가족 일정 뷰 · 시니어용 SOS

### 👤 팀 리더
- 팀원 프리미티브의 `examples` 튜닝 검수
- Dev Tools Tester 로 통합 검증
- 시연 시나리오 역설계 ("이 발화로 이 위젯이 나와야 해" → 관련 프리미티브 examples 보강)
- 발표 리드

---

## 🚨 팀원이 빠지기 쉬운 함정 3가지

### 함정 1: "러닝 코치 위젯" 을 만들려고 한다
**❌ 틀렸음.** 러닝 코치 위젯은 AI 가 이미 `stack + stat-row + stat-tile + map-card + chat-bubble` 조합으로 만들어내. 너가 만들 건 그 위젯에 **새로 더해질 작은 조각**이야.

테스트 질문: *"이 프리미티브는 러닝 위젯에만 쓰이는가?"* → 답이 YES 면 다시 설계해.

### 함정 2: 외부 API 붙이려고 한다
**❌ MVP 에서 금지.** Google Calendar, 실제 날씨 API 는 해커톤 시간 다 잡아먹어. props 로 mock 데이터 받는 구조로. 실제 API 는 사후 과제.

### 함정 3: examples 를 대충 쓴다
**❌ 가장 치명적.** 프리미티브 `index.ts` 의 `examples` 배열이 **AI 의 교과서**야. examples 없으면 AI 가 네 프리미티브를 무시해. 최소 2-3개, 서로 다른 유즈케이스, 실제 blueprint JSON 포함.

좋은 examples = 좋은 프리미티브.

---

## 🧠 아키텍처 5분 요약

### 3 레이어

```
TV Canvas (12×8 그리드)
  └─ Widget Blueprint { id, grid, root: PrimitiveNode }   ← AI가 JSON으로 조립
      └─ PrimitiveNode { primitive, props, children[] }    ← 재귀 트리
          └─ 실제 React 컴포넌트 ← 네가 만드는 것
```

### 유저 발화 → 화면까지

```
"오늘 러닝 경로 위젯 만들어줘"
  ↓
AI (kind: compose_widget):
{
  widget: {
    id: "run-today",
    grid: { col: 1, row: 1, colspan: 5, rowspan: 5 },
    root: {
      primitive: "stack",
      children: [
        { primitive: "stat-row", children: [
          { primitive: "stat-tile", props: { value: "5.2", unit: "km", label: "거리", accent: true }},
          { primitive: "stat-tile", props: { value: "28", unit: "min", label: "시간" }},
          { primitive: "stat-tile", props: { value: "5'24\"", unit: "/km", label: "페이스" }}
        ]},
        { primitive: "map-card", props: { caption: "오늘의 경로", seed: "run-today" }},
        { primitive: "chat-bubble", props: { text: "5.2km 완주! 🎉", speaker: "ai", tone: "celebrate" }}
      ]
    }
  }
}
  ↓
런타임이 트리 재귀 렌더 → 화면에 위젯 등장
```

### 기존 위젯 수정

```
"이 위젯에 추천 코스 3개 추가해줘"
  ↓
AI (kind: mutate_widget):
{
  widgetId: "run-today",
  op: {
    type: "append_child",
    parentPath: [],
    node: {
      primitive: "choice-list",
      props: { onPickEvent: "running.routePicked", items: [...] }
    }
  }
}
```

---

## 🧱 프리미티브 작성 규칙

### 3 단계

1. `cp -r src/primitives/_template src/primitives/<내-프리미티브>`
2. `Template.tsx` 를 내 컴포넌트로 교체, `index.ts` 메타데이터 업데이트
3. `src/primitives/registry.ts` 에 import + 등록 한 줄씩 추가

### 프리미티브는 반드시 이래야 한다

- ✅ **재사용 가능** — "러닝 전용" ❌, "숫자 강조 표시" ✅
- ✅ **모든 variation 은 props 로** — 하드코딩 금지
- ✅ **어떤 크기에서도 작동** — 2×2 에 들어가도, 8×4 에 들어가도 OK
- ✅ **theme 존중** — `theme.mode`, `theme.accentColor` 반영
- ✅ **한 가지 일만** — 복잡하면 2개로 나눠
- ✅ **이벤트는 emit** — 인터랙션은 `emit({ type, payload })` 이벤트 버스로
- ❌ **외부 API 직접 호출 금지** — MVP 는 mock
- ❌ **특정 도메인 묶임 금지** — `RunningCoach` ❌, `stat-row` ✅

### examples 가 핵심이다

`index.ts` 의 `examples` 배열은 AI 의 교과서야. 여기 쓴 조합 방식을 AI 가 학습해서 창의적으로 응용해. 예시가 나쁘면 AI 가 네 프리미티브를 무시해.

좋은 예:
```typescript
examples: [
  {
    context: "D-Day 카운터",                  // 언제 쓰면 좋은지
    blueprint: {                              // 실제 조합
      primitive: "stat-tile",
      props: { value: "D-12", label: "아내 생일까지", accent: true }
    },
    rationale: "accent 로 감정적 강조"        // 왜 이렇게 쓰는지 (선택)
  },
  {
    context: "어제 vs 오늘 비교 (좌측)",
    blueprint: {
      primitive: "stat-tile",
      props: { value: "72", unit: "bpm", label: "어제 평균 심박" }
    }
  },
  // ... 최소 2-3개
]
```

나쁜 예:
```typescript
examples: [
  { context: "사용 예", blueprint: { primitive: "stat-tile", props: { value: "X", label: "Y" } } }
]
// → 너무 추상적. AI 가 언제 써야 할지 모름.
```

---

## 🧪 Dev Tools 활용법 (⌘K / Ctrl+K)

### 🧱 Primitives 탭 — 등록 확인
네 프리미티브가 등록됐으면 여기 나와. description, props, examples 가 의도대로 나오는지 확인. **AI 는 이 정보 그대로 받는다.**

### 🧬 Blueprints 탭 — 실시간 트리
발화로 위젯이 만들어지면 AI 가 조립한 트리 JSON 확인 가능. 네 프리미티브가 **어떻게 쓰이는지** 관찰하면서 examples 개선해.

### 🧪 Tester 탭 — 드라이런
발화를 실제 TV 에 적용 안 하고 AI 결정만 확인. 프리미티브 수정 후 검증할 때 필수. "시스템 프롬프트 보기" 로 현재 AI 가 읽는 전체 프롬프트 확인 가능.

### 📡 Events 탭 — 이벤트 버스
choice-list / action-button 눌렀을 때 이벤트 발생 확인. 네 프리미티브가 인터랙티브라면 여기 찍혀야 함.

### 🧠 AI Trace 탭 — 결정 히스토리
어떤 kind 로 응답했는지, 소요 시간 (ms). `compose_widget` vs `mutate_widget` 분기 검증에 유용.

---

## 🎤 바이브코딩 프롬프트 (복붙용)

### 첫 세션: 프로젝트 이해시키기

```
이 프로젝트는 Myot Playground — Hybrid Composable Primitives 아키텍처야.
핵심: 위젯은 코드에 없고, AI 가 프리미티브를 조합해 JSON 블루프린트를 
만들면 런타임이 재귀 렌더링해.

다음 순서로 읽어줘:
1. README.md
2. TEAM_GUIDE.md
3. src/types/index.ts (PrimitiveDefinition, PrimitiveNode, WidgetBlueprint, AIResponse)
4. src/primitives/_template/ 
5. src/primitives/chat-bubble/ (leaf 예시)
6. src/primitives/stack/index.ts (container 예시)
7. src/primitives/registry.ts
8. src/runtime/orchestrator.ts (프롬프트 동적 조립)
9. src/runtime/blueprintRenderer.tsx

읽고 나서:
- "프리미티브" vs "위젯" 차이 한 문단
- "수정 금지" vs "자유" 파일 목록
을 알려주고 내 요청 기다려.
```

### 새 프리미티브 만들기

```
src/primitives/<이름> 프리미티브를 만들어줘.

## 컨셉
<1-2 문장>

## 범용성 체크 (중요!)
이 프리미티브는 아래 최소 3가지 서로 다른 유형의 위젯에 쓰일 수 있어야 함:
1. <유즈케이스 1>
2. <유즈케이스 2>
3. <유즈케이스 3>
만약 3개 안 나오면 이 프리미티브는 너무 좁아. 더 범용화하거나 다른 프리미티브로 분할.

## 요구사항
1. src/primitives/_template, src/primitives/chat-bubble (leaf), 
   src/primitives/stack (container) 먼저 읽기
2. Leaf 인지 Container 인지 결정 (isContainer)
3. 컴포넌트:
   - w-full h-full 로 채우기
   - theme.mode / theme.accentColor 반영
   - 모든 variation 은 props 로
   - 인터랙티브하면 emit({ type, payload })
4. index.ts:
   - description 은 AI 가 "언제 쓸지" 판단 가능하게 구체적으로
   - propsSchema 는 자연어로 설정 가능한 값만
   - examples 최소 2-3개, 서로 다른 유즈케이스
5. src/primitives/registry.ts 에 import + 등록 추가

## 완료 후
- npm run build 통과
- Dev Tools Primitives 탭에서 보이는지
- 이 프리미티브를 활용할 테스트 발화 3개 (서로 다른 유형 위젯)
```

### examples 개선 (AI 가 안 쓸 때)

```
내 프리미티브 src/primitives/<이름> 이 "<발화>" 에 대해 잘 활용 안 됨.

## 기대
이 발화로 이 프리미티브가 쓰여야 함.

## 실제 AI 응답 (Dev Tools Tester)
<JSON 복사>

## 요청
1. description 이 모호한지 점검
2. examples 에 유사 시나리오 1-2개 추가 (기존 건 유지)
3. rationale 로 AI 에게 조합 이유 힌트
```

---

## 🔒 파일 수정 규칙

### ✅ 자유
- `src/primitives/<네 폴더>/**`

### ⚠️ 한 줄씩만
- `src/primitives/registry.ts` — import + 등록

### ❌ 수정 금지 (팀 리더만)
- `src/runtime/**`
- `src/types/index.ts`
- `src/components/**`
- `src/store/**`
- `api/gemini.ts`

이 폴더들은 playground 프레임워크야. 건드리면 다른 팀원 프리미티브도 깨져.

---

## 🏃 해커톤 당일 워크플로우 (3-4시간)

```
00:00-00:30  Sync
  - 각자 만들 프리미티브 최종 확정 (위젯 말고 프리미티브!)
  - 충돌 방지: src/primitives/<본인이름>/ 각자 폴더

00:30-02:30  바이브코딩 (2시간)
  - 본인 브랜치에서 개발
  - Cursor/Claude Code 로 위 "새 프리미티브 만들기" 프롬프트 복붙
  - Dev Tools Tester 즉시 검증
  - examples 여러 개 넣어 AI 학습 강화

02:30-03:00  통합 (30분)
  - PR 머지 or 리더 cherry-pick
  - Primitives 탭에서 전원 등록 확인
  - 다 같이 다양한 발화 실험

03:00-03:30  시연 리허설
03:30-04:00  발표
```

---

## 💬 팀 회의에서 자주 나오는 질문 & 답

**Q: 그래서 내가 '시계 위젯' 만들면 돼?**  
A: 아니. 시계 위젯은 AI 가 stat-tile 로 이미 만들어. 너는 시계라는 **개념**이 아니라 **시계도 만들 수 있는 더 작은 조각** 을 만들어. 예를 들어 `flip-digit` (부드럽게 회전하며 바뀌는 숫자 프리미티브) 를 만들면 시계, 타이머, 카운트다운, 점수판 전부에 쓰여.

**Q: 내 프리미티브가 쓸모있는지 어떻게 알아?**  
A: "이걸로 만들 수 있는 서로 다른 유형 위젯 3개" 가 술술 나오면 OK. 1-2개만 나오면 너무 좁아. 0개면 애초에 프리미티브가 아니라 기능이야.

**Q: 디자인이 안 예쁜데?**  
A: Tailwind + theme.accentColor 만 써도 충분해. 시연에서 중요한 건 "말 한 마디로 위젯이 만들어진다" 는 **순간**이지, UI 퀄리티 대회가 아니야.

**Q: AI 가 내 프리미티브를 안 불러.**  
A: 99% 는 examples 가 부족하거나 description 이 모호해. Dev Tools Tester 로 "시스템 프롬프트 보기" 해봐. 네 프리미티브 섹션이 어떻게 보이는지가 곧 AI 의 이해 수준이야.

**Q: 위젯 만들고 싶은데 어떡해?**  
A: 발화로 만들어. 프리미티브 다 완성한 후 발화 하나로 조립해서 시연. 그게 이 프로젝트의 정신이야.

---

## 🎬 해커톤에서 얻어야 할 것

이 해커톤에서 너의 성취:

1. **"내 프리미티브 하나로 AI 가 상상도 못 한 위젯을 만들어내는 순간"** 의 쾌감
2. **작게 만들고 크게 쓰는** 조립식 설계 감각
3. **examples 로 AI 를 가르치는** 바이브코딩 철학
4. **우승 여부와 무관하게 다음 주에도 바이브코딩 하고 싶어지는 자신감**

우승은 부산물이야. 진짜 목표는 이거야.

화이팅 🚀
