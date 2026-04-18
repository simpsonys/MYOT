# 팀원 가이드 — 프리미티브를 만들어라

> **이 프로젝트의 성공 기준:** 너가 만든 프리미티브가 AI 의 표현력을 확장시켜서, 유저가 상상도 못 한 위젯을 말 한 마디로 만들어내게 하는 것.

---

## ⚠️ 가장 중요한 개념 전환

**기존 "위젯 만들기" 사고방식을 버려.**

- ❌ "나는 '러닝 코치 위젯' 을 만들거야"
- ✅ "나는 어떤 위젯이든 들어갈 수 있는 **프리미티브**를 만들거야"

러닝 코치, 운세 위젯, D-Day, 가족 사진 월, 스마트홈 제어, 독거노인 안전 — 이 **모든 것**은 코드에 없어. AI 가 너가 만든 프리미티브를 조합해 그 자리에서 만들어내.

**너가 만드는 건 AI 의 어휘집이야.** 프리미티브 하나가 수십 개의 위젯을 가능하게 해.

---

## 🧠 아키텍처 5분 요약

### 3 레이어

```
TV Canvas (12×8 그리드)
  └─ Widget Blueprint { id, grid, root: PrimitiveNode }    ← AI가 JSON으로 조립
      └─ PrimitiveNode { primitive, props, children[] }     ← 재귀 트리
          └─ 실제 React 컴포넌트 ← 네가 만드는 것
```

### 유저 발화 처리 흐름

```
유저: "오늘 러닝 경로 위젯 만들어줘"
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
  },
  preserveExisting: true
}
  ↓
런타임: blueprintRenderer 가 트리를 재귀 렌더링 → TV 화면에 즉시 출현
```

### 기존 위젯 내부 수정

```
유저: "이 위젯에 추천 코스 3개 추가해줘"
  ↓
AI (kind: mutate_widget):
{
  widgetId: "run-today",
  op: {
    type: "append_child",
    parentPath: [],       // 루트 stack 의 직계 자식으로
    node: {
      primitive: "choice-list",
      props: {
        onPickEvent: "running.routePicked",
        items: [
          { title: "한강뷰", badge: "+120 kcal", rank: 1 },
          { title: "카페 투어", badge: "+95 kcal", rank: 2 },
          { title: "피톤치드", badge: "+180 kcal", rank: 3, caution: "오르막" }
        ]
      }
    }
  }
}
  ↓
런타임: 기존 블루프린트 트리에 노드 append → 애니메이션으로 자연스럽게 등장
```

---

## 🧱 프리미티브 작성 규칙

### 3 단계

1. `cp -r src/primitives/_template src/primitives/<내-이름>`
2. `Template.tsx` 를 내 컴포넌트로 교체, `index.ts` 메타데이터 업데이트
3. `src/primitives/registry.ts` 에 import + 등록 한 줄씩 추가

### 프리미티브는 반드시 이래야 한다

- ✅ **재사용 가능해야 한다** — "러닝 전용" 이면 안 됨. "숫자 강조 표시" 처럼 범용적이어야 함
- ✅ **props 로 모든 variation 표현** — 하드코딩 금지
- ✅ **어떤 크기에서도 작동** — 2×2 에 들어가도, 8×4 에 들어가도 예뻐야 함
- ✅ **theme 존중** — `theme.mode`, `theme.accentColor` 반영
- ✅ **한 가지 일만 잘 하기** — 복잡하면 2개 프리미티브로 나눠
- ✅ **이벤트는 emit 으로** — 사용자 인터랙션은 `emit({ type, payload })` 로 이벤트 버스에
- ❌ **외부 API 직접 호출 금지** — MVP 는 mock, 실제 API는 props 로 주입
- ❌ **특정 도메인에 묶이지 않기** — `RunningCoach` 가 아니라 `stat-row` 여야 함

### examples 가 핵심이다

`index.ts` 의 `examples` 배열은 **AI 의 교과서**다. 여기서 보여주는 조합 방식을 AI 가 학습한다. 예시가 좋으면 AI 가 이 프리미티브를 창의적으로 쓰게 돼. 예시가 나쁘면 AI 가 이 프리미티브를 무시해버려.

좋은 예시:
```typescript
examples: [
  {
    context: "D-Day 카운터",                 // 언제 쓰면 좋은지
    blueprint: {                             // 실제 조합 예
      primitive: "stat-tile",
      props: { value: "D-12", label: "아내 생일까지", accent: true }
    },
    rationale: "accent 로 감정적 강조"        // 왜 이렇게 쓰는지 (선택)
  }
]
```

예시는 **팀원이 이 프리미티브로 뭘 할 수 있는지 상상하게** 해야 해. 최소 2-3개 넣어.

---

## 🎨 프리미티브 아이디어 촉매

현재 등록된 10개: `stack`, `stat-row`, `stat-tile`, `chat-bubble`, `choice-list`, `map-card`, `image-frame`, `action-button`, `progress-ring`, `_template`

**더 필요한 것들 (영감용):**

### 📊 데이터 표현
- **SparkLine** — 미니 라인차트 (심박수, 주가, 기온 추이)
- **HeatMap** — 7×N 셀 그리드 (습관 트래커, 활동 기록)
- **Gauge** — 반원 게이지 (속도, 점수, 만족도)
- **StatCompare** — 두 스탯 비교 (어제 vs 오늘, 내 기록 vs 평균)

### 🎨 시각적 표현
- **ParallaxLayer** — 스크롤이나 시간에 따라 움직이는 배경
- **WeatherVignette** — 비/눈/햇빛 파티클 효과 레이어
- **GradientMood** — 감정/시간에 따라 변하는 그라디언트 배경
- **AvatarRing** — 여러 얼굴을 원형으로 (가족, 팀원)

### 💬 인터랙션
- **SwipeChoice** — 틴더 스타일 좌우 스와이프
- **CircularMenu** — 리모컨 친화적 방사형 메뉴
- **ToggleList** — 스마트홈 ON/OFF 토글 리스트
- **CountdownButton** — 누르면 카운트다운 후 실행

### 🎭 Delightful
- **ConfettiBurst** — 이벤트 도착 시 1회성 축하 효과 (이벤트 수신)
- **TypewriterText** — 한 글자씩 나타나는 텍스트 (AI 말풍선 강화)
- **LiveClock** — 매초 업데이트되는 시계 (큰 숫자 스타일)
- **MoodMeter** — 감정 슬라이더

### 🌐 Contextual
- **TimelineStrip** — 수평 시간선 (일정, 가족 이벤트)
- **LocationDot** — 지도 위 위치 점 + 애니메이션
- **CommuteStatus** — 가족 구성원의 이동 상태

**한 가지 원칙:** 어떤 프리미티브든 — 누군가 **한 번도 상상하지 못한 위젯** 에 쓰일 수 있어야 해.

---

## 🧪 Dev Tools 활용법

**⌘K → 5개 탭:**

### 🧱 Primitives 탭 (등록 확인)
네가 만든 프리미티브가 등록됐으면 여기 나와. props schema 와 examples 가 제대로 나오는지 확인해. **AI 는 이 정보를 그대로 시스템 프롬프트로 받는다.**

### 🧬 Blueprints 탭 (실시간 트리)
발화로 위젯이 만들어지면 여기서 AI 가 조립한 트리 JSON 을 볼 수 있어. 네 프리미티브가 **어떻게 쓰이는지** 관찰하면서 examples 를 개선해.

### 🧪 Tester 탭 (드라이런)
발화를 테스트하되 **실제 TV 에 적용 안 함**. 시스템 프롬프트 미리보기도 가능. 프리미티브 examples 수정 후 여기서 검증해.

### 📡 Events 탭 (이벤트 로그)
choice-list / action-button 등의 인터랙션이 emit 한 이벤트 로그. 네 프리미티브도 인터랙티브하다면 여기 찍혀야 함.

### 🧠 AI Trace 탭 (AI 의사결정)
어떤 kind 로 응답했는지, 몇 ms 걸렸는지. `compose_widget` 과 `mutate_widget` 의 분기가 제대로 되는지 확인.

---

## 🎤 바이브코딩 프롬프트

### 첫 세션: 프로젝트 이해시키기

```
이 프로젝트는 Myot Playground (Composable Primitives Edition) 야.
핵심: 위젯은 코드에 없고, AI 가 프리미티브를 조합해 JSON 블루프린트를 
만들면 런타임이 이걸 재귀 렌더링해.

다음 순서로 읽어줘:
1. README.md
2. TEAM_GUIDE.md
3. src/types/index.ts (PrimitiveDefinition, PrimitiveNode, WidgetBlueprint, AIResponse)
4. src/primitives/_template/ (최소 예시)
5. src/primitives/chat-bubble/ (leaf 프리미티브 예시)
6. src/primitives/stack/index.ts (container 프리미티브의 example)
7. src/runtime/orchestrator.ts (프롬프트 조립)
8. src/runtime/blueprintRenderer.tsx (트리 렌더)

읽고 나서:
- "프리미티브" 와 "위젯" 의 차이를 한 문단으로 설명
- "수정 금지" 파일 리스트
- "자유롭게 수정" 파일 리스트
```

### 새 프리미티브 만들기

```
src/primitives/<이름> 프리미티브를 만들어줘.

## 컨셉
<이 프리미티브가 뭘 표현하는지 1-2 문장>

## 유즈케이스 (범용성 확인)
이 프리미티브는 아래 최소 3가지 다른 유형의 위젯에 쓰일 수 있어야 함:
- <유즈케이스 1>
- <유즈케이스 2>  
- <유즈케이스 3>

## 요구사항
1. src/primitives/chat-bubble 과 src/primitives/stack/index.ts 를 먼저 읽어
   leaf vs container 패턴을 파악해.
2. src/primitives/_template 를 골격으로 시작.
3. 컴포넌트:
   - w-full h-full 로 컨테이너 채우기
   - theme.mode 와 theme.accentColor 반영
   - props 로 모든 variation 을 표현, 하드코딩 금지
   - 인터랙티브라면 emit({ type, payload }) 로 이벤트 발생
4. index.ts:
   - propsSchema 는 AI 가 자연어로 설정할 수 있는 필드만
   - examples 는 최소 2-3개, 서로 다른 유즈케이스를 보여줄 것
   - isContainer 명확히 설정
5. registry.ts 에 import + 등록 한 줄씩 추가
6. 외부 API 금지, mock 으로

## 완료 후
- npm run build 통과
- Dev Tools Primitives 탭에서 보이는지 확인
- 이 프리미티브를 활용할 수 있는 테스트 발화 3개 제안 (서로 다른 유형의 위젯)
```

### examples 개선하기

```
내 프리미티브 src/primitives/<이름> 의 examples 를 개선해줘.

## 문제
AI 가 이 프리미티브를 <어떤 상황>에 써야 할 때 안 쓰고 있어.
Dev Tools Tester 에서 "<테스트 발화>" 를 해봤더니 <AI 가 한 일>.

## 원하는 것
AI 가 <상황> 에 이 프리미티브를 자연스럽게 선택하도록.

## 수정
- description 이 모호한지 점검
- examples 에 유사 상황을 커버하는 새 예시 1-2개 추가
- 필요하면 rationale 필드로 AI 가 이 예시를 왜 주목해야 하는지 힌트

기존 examples 는 지우지 말고, 추가만.
```

### 위젯 자체 디자인 (optional)

프리미티브만 만들면 되지만, 자신이 상상하는 특정 위젯이 잘 안 만들어지면:

```
"<위젯 이름>" 위젯이 AI 에게서 잘 안 나와.

예상 조합: <프리미티브들>
실제 원하는 발화: "<유저 발화>"

관련 프리미티브들의 examples 를 점검해서, 이 조합이 AI 에게 
자연스럽게 보이도록 하나씩 개선해줘.

참고: 직접 위젯을 코드로 만들면 안 됨. 프리미티브 examples 와 
description 을 통해서만 AI 가 조합하도록 유도해야 함.
```

---

## 🔒 파일 수정 규칙

### ✅ 자유롭게
- `src/primitives/<네 폴더>/**`

### ⚠️ 한 줄씩만 추가
- `src/primitives/registry.ts` — import + 등록

### ❌ 수정 금지 (팀 리더만)
- `src/runtime/**`
- `src/types/index.ts`
- `src/components/**` (devtools 포함)
- `src/store/**`
- `api/gemini.ts`

---

## 🏃 해커톤 당일 워크플로우 (3-4시간)

```
00:00-00:30  Sync
  - 각자 만들 프리미티브 최종 확정 (위젯 말고 프리미티브!)
  - 충돌 방지: src/primitives/<본인이름>/ 각자 폴더
  
00:30-02:30  바이브코딩 (2시간)
  - 본인 브랜치에서 개발
  - Dev Tools Tester 로 즉시 검증
  - examples 여러 개 넣어서 AI 학습 강화

02:30-03:00  통합 (30분)
  - PR 머지 or 리더 cherry-pick
  - Primitives 탭에서 전원 등록 확인
  - 다 같이 다양한 위젯 발화 실험

03:00-03:30  시연 리허설
03:30-04:00  발표
```

---

## 💡 철학

이 해커톤에서 네가 얻어야 할 것:

1. **"내 프리미티브로 AI 가 상상도 못한 위젯을 만드는 걸 봤다"** 는 순간의 쾌감
2. **작게 만들고 크게 쓰는** 조립식 설계 감각
3. **AI 에게 examples 로 가르치는** 바이브코딩 철학

**너의 프리미티브 하나가 수십 개 위젯의 가능성을 열어.**
**이게 Myot 의 진짜 차별화야.**

화이팅.
