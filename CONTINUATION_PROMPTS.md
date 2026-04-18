# 이어서 작업하기 — 바이브코딩 프롬프트 모음

Claude Code / Cursor / Gemini Code Assist / Vertex AI 로 이 프로젝트를 이어갈 때 쓰는 프롬프트. **myot/ 프로젝트 루트에서 AI 도구를 연 상태**에서 사용.

---

## 🎯 프롬프트 0: 첫 세션 — 프로젝트 이해시키기

```
이 프로젝트는 Myot Playground — Hybrid Composable Primitives 아키텍처야.

핵심 개념:
  - 위젯은 코드에 존재하지 않아
  - 유저 발화 → AI 가 프리미티브를 조합해 JSON 블루프린트 생성
  - 런타임(BlueprintRenderer)이 트리를 재귀 렌더링
  - 팀원은 "위젯" 이 아닌 "프리미티브" 를 만듦 → AI 의 표현력 확장

다음을 순서대로 읽어줘:
1. README.md (전체 개요)
2. TEAM_GUIDE.md (프리미티브 철학)
3. src/types/index.ts (핵심 계약 — PrimitiveDefinition, PrimitiveNode, WidgetBlueprint, AIResponse)
4. src/primitives/_template/ (최소 프리미티브)
5. src/primitives/chat-bubble/ (leaf 프리미티브 예시)
6. src/primitives/stack/index.ts (container 프리미티브의 composition example)
7. src/primitives/registry.ts (등록 시스템)
8. src/runtime/orchestrator.ts (AI 프롬프트 동적 조립)
9. src/runtime/blueprintRenderer.tsx (트리 → React)
10. src/runtime/treeOps.ts (path 기반 트리 mutation)
11. src/runtime/aiDispatcher.ts (응답 → 상태 변환)

다 읽으면:
- "프리미티브" vs "위젯" 의 차이 한 문단으로
- AI 의 5가지 응답 kind 와 각각 언제 쓰는지
- "수정 금지" 파일 목록 vs "자유" 파일 목록
을 알려주고 내 요청을 기다려줘.
```

---

## 🧱 프롬프트 1: 새 프리미티브 만들기 (가장 자주)

```
src/primitives/<프리미티브-이름> 를 만들어줘.

## 컨셉
<1-2 문장>

## 범용성 체크
이 프리미티브는 아래 최소 3가지 서로 다른 유형의 위젯에 쓰일 수 있어야 함:
1. <유즈케이스 1>
2. <유즈케이스 2>
3. <유즈케이스 3>
→ 만약 이 리스트가 3개 안 나오면 이 프리미티브는 너무 좁은 거야. 
   더 범용화하거나 다른 프리미티브로 분할해줘.

## 요구사항
1. src/primitives/_template, src/primitives/chat-bubble (leaf), 
   src/primitives/stack (container) 를 먼저 읽고 패턴 파악.
2. Leaf 인지 Container 인지 결정 (isContainer 필드).
3. 컴포넌트:
   - w-full h-full 로 컨테이너 채우기
   - theme.mode / theme.accentColor 반영
   - 모든 variation 을 props 로 (하드코딩 금지)
   - 인터랙티브하면 emit({ type, payload }) 사용
4. index.ts:
   - description 은 AI 가 "언제 써야 하는지" 판단할 수 있게 명확히
   - propsSchema 는 AI가 자연어로 설정 가능한 값만
   - examples 최소 2-3개, 각각 서로 다른 위젯 유즈케이스
5. src/primitives/registry.ts 에 import + 등록 한 줄씩.

## 완료 후
- npm run build 통과
- 이 프리미티브를 활용할 테스트 발화 3개 제안 (서로 다른 유형 위젯)
- Dev Tools Tester 에서 이 발화들이 실제 잘 나오는지 조언
```

---

## 🎨 프롬프트 2: examples 개선 (AI 가 내 프리미티브를 안 쓸 때)

```
내 프리미티브 src/primitives/<이름> 이 AI 에게서 충분히 활용 안 되고 있어.

## 기대했던 시나리오
유저가 "<발화>" 라고 하면 이 프리미티브가 쓰여야 해.

## 실제 AI 응답 (Dev Tools Tester 결과)
<결과 JSON 복사>

## 진단 요청
1. description 이 너무 일반적이거나 모호한지
2. examples 에 해당 시나리오와 유사한 compose 예시가 없는지
3. 유사 기능 프리미티브(chat-bubble, stat-tile 등) 와 역할이 겹치는지

## 수정
- description 을 더 구체적으로 (언제 쓰는지 구체적 상황 포함)
- examples 에 새 예시 1-2개 추가 (기존 건 유지)
- 필요하면 rationale 필드로 AI 에게 조합 이유 힌트
```

---

## 🧬 프롬프트 3: 특정 위젯 패턴을 AI 가 잘 만들게 유도

```
"<위젯 컨셉>" 를 유저가 발화했을 때 AI 가 잘 조합하게 만들고 싶어.

예상 조합:
  <프리미티브 A> → <역할>
  <프리미티브 B> → <역할>
  <프리미티브 C> → <역할>

## 요청
1. 위 프리미티브들의 examples 를 점검
2. 없으면, 이 위젯 시나리오를 커버하는 examples 를 각 프리미티브에 추가
3. 직접 위젯 코드를 만들면 안 됨 — 프리미티브 examples 를 통해서만 AI 가 조합하도록
4. 완료 후 Dev Tools Tester 에서 "<발화>" 가 실제 이 조합을 내놓는지 검증

시스템 프롬프트에 주입되는 buildPrimitiveCatalog() 결과도 
src/runtime/orchestrator.ts 에서 확인해줘.
```

---

## 🧪 프롬프트 4: mutate_widget 디버깅

```
유저 발화 "<발화>" 에 대해 AI 가 mutate_widget 을 해야 하는데 다르게 반응해.

## 기대
- kind: mutate_widget
- widgetId: <기존 위젯 id>
- op.type: <append_child | replace_node | update_props | remove_node | replace_root>
- <구체적 기대 동작>

## 실제 AI 응답 (AI Trace 탭)
<응답 JSON>

## 확인 순서
1. 현재 TV 상태에 해당 widgetId 가 존재하는지 (AI 는 state 를 system prompt로 받음)
2. orchestrator 의 few-shot 예시에 이 종류의 mutation 이 충분히 있는지
3. 없으면 src/runtime/orchestrator.ts 의 FEW-SHOT EXAMPLES 섹션에 케이스 추가
4. 필요하면 관련 프리미티브 examples 에도 rationale 로 "modification 지원" 명시

수정 최소화, 빌드 검증 필수.
```

---

## 📡 프롬프트 5: 프리미티브 간 이벤트 상호작용

```
src/primitives/<프리미티브 A> 가 emit 하는 이벤트에 
src/primitives/<프리미티브 B> 가 반응하게 만들어줘.

## 시나리오
<프리미티브 A> 에서 <언제> 이벤트 "<type>" 발생
→ <프리미티브 B> 가 <어떻게 반응>

## 구현
1. <A> 의 컴포넌트에서 emit({ type: '<type>', payload: {...} })
2. <B> 의 컴포넌트에서 useBusEvent('<type>', handler) 로 구독
3. <B> 의 내부 state 로 반응 (props 는 불변이므로 useState)
4. <A>/<B> 양쪽 index.ts 의 examples 에 이 상호작용 시나리오 추가

src/runtime/eventBus.tsx 의 useBusEvent hook 사용법 참고.

## 주의
프리미티브는 서로 직접 참조하지 않음 — 이벤트 버스로만 느슨하게 결합.
```

---

## 🎬 프롬프트 6: 시연 직전 스모크 테스트

```
DEMO_SCRIPT.md 의 시나리오를 자동 검증하는 스크립트를 만들어줘.

## 스펙
파일: scripts/smoke-test.mjs

아래 발화를 순서대로 http://localhost:3000/api/gemini 에 POST,
currentLayout 은 누적 관리:

1. "러닝 경로 위젯 만들어줘" → kind: compose_widget, widget.label 존재
2. "오늘 운세 위젯도 하나 띄워줘" → kind: compose_widget, widgets 2개
3. "이 정도면 가뿐한데 더 늘려도 되겠어" → kind: mutate_widget, op.type 이 append_child 또는 replace_node
4. "오늘 무리했어 힘들어" → kind: mutate_widget
5. "블랙 테마, 투명도 50%로" → theme.widgetOpacity === 0.5 (layout 또는 compose_widget with preserveExisting)
6. "추천 레이아웃 3개" → kind: recommendations, layouts.length === 3

각 테스트:
- 예상 조건 통과 시 ✅, 실패 시 ❌ + 실제 응답 덤프
- 전부 통과 exit 0, 하나라도 실패 exit 1

node 내장 fetch 만 사용, 외부 의존성 금지.
package.json scripts 에 "test:smoke": "node scripts/smoke-test.mjs" 추가.

만들고 바로 한 번 실행해서 결과 보여줘.
```

---

## 🌐 프롬프트 7: Vertex AI 전환 (API 한도 대비)

```
api/gemini.ts 를 Gemini AI Studio + Vertex AI 둘 다 지원하도록 리팩토링해줘.

## 요구사항
1. src/lib/aiProvider.ts 생성:
   - interface AIProvider { generate(systemPrompt, userPrompt): Promise<string> }
   - GeminiStudioProvider (현재 @google/generative-ai)
   - VertexAIProvider (@google-cloud/vertexai)
2. 환경변수 AI_PROVIDER=gemini (기본) | vertex
3. Vertex 설정 env:
   - GOOGLE_CLOUD_PROJECT
   - GOOGLE_CLOUD_LOCATION (default us-central1)
   - GOOGLE_APPLICATION_CREDENTIALS_JSON (service account JSON as string)
4. api/gemini.ts 는 provider 를 선택만 하고 나머지 로직 유지

완료 후:
- package.json 에 @google-cloud/vertexai 추가
- .env.example 업데이트
- README.md 에 "Provider 전환" 섹션 추가
```

---

## 🎤 프롬프트 8: Web Speech API 음성 입력 (선택)

```
src/components/PromptInput.tsx 에 음성 입력을 추가해줘.

## 요구사항
- Web Speech API (window.SpeechRecognition / webkitSpeechRecognition)
- 외부 라이브러리 금지
- 입력창 오른쪽에 🎤 버튼 (만들기 버튼 옆)
- 클릭 시 ko-KR 인식, 결과 → input value + 자동 submit
- 인식 중 빨갛게 pulse 애니메이션
- 미지원 브라우저면 버튼 비활성화 + tooltip
- 에러 시 aiMessage 로 표시

기존 submit 로직 건드리지 말고 병렬로 추가.
TypeScript 타입은 src/global.d.ts 에서 확장.
```

---

## 🔄 프롬프트 9: 그리드 충돌 자동 해결

```
AI 가 compose_widget 으로 새 위젯을 만들 때 기존 위젯과 겹치는 경우가 있어.

## 요청
src/runtime/gridResolver.ts 생성:
- pure function resolveOverlaps(widgets: WidgetBlueprint[]): WidgetBlueprint[]
- 12x8 그리드에서 각 widget.grid 영역 계산
- 겹침 발견 시:
  a. 먼저 추가된 위젯 유지
  b. 나중 위젯을 빈 공간으로 이동 (top-left first-fit)
  c. 공간 부족하면 rowspan 축소 → colspan 축소
  d. 최소 크기(w>=2, h>=2) 미만 되면 해당 위젯 드롭 + console.warn

src/store/tvStore.ts 의 composeWidget 과 applyLayout 에서 
이 함수 호출하도록 통합.

node:test 로 테스트 3개 (겹침 없음 / 있음 / 공간 부족).
```

---

## 💡 프롬프트 10: 프리미티브 아이디어 브레인스토밍

```
TEAM_GUIDE.md 의 "프리미티브 아이디어 촉매" 섹션을 먼저 읽어줘.
거기 목록에 없는 참신한 프리미티브 5개를 내 컨텍스트에 맞춰 제안해줘.

## 내 컨텍스트
- 역할: <개발자 / 디자이너 / 기획자>
- 관심사: <...>
- TV 사용 습관: <...>
- 가족 구성: <...>

## 각 아이디어마다
1. 이름 (감각적으로)
2. 한 줄 컨셉
3. leaf vs container
4. propsSchema 초안 (3-5개 필드)
5. examples 2개 (서로 다른 유즈케이스)
6. "이 프리미티브가 가능하게 할 창의적 위젯 3가지"
7. "왜 참신한가" 한 문단

## 조건
- 기존 10개 프리미티브와 기능 중복 금지
- 5개 중 최소 2개는 "TV 라는 화면의 특성" (크다, 거실, 가족, 오래 켜둠)을 활용
- 뻔한 것 금지 (clock, weather, stock 스타일은 이미 stat-tile 로 커버 가능)

마음에 드는 것을 내가 고르면 프롬프트 1 로 구현 시작.
```

---

## ⚡ 자주 쓰는 Claude Code 원라이너

```bash
# 새 프리미티브 스캐폴딩
claude "src/primitives/<이름> 프리미티브를 chat-bubble 참고해서 만들어줘: <컨셉>"

# examples 추가
claude "src/primitives/<이름>/index.ts 의 examples 에 '<유즈케이스>' 케이스 추가"

# 빌드 에러 해결
claude "npm run build 돌리고 에러 최소 변경으로 고쳐"

# 특정 발화 안 먹힐 때
claude "'<발화>' 가 AI 에게 <kind> 로 해석되게 관련 프리미티브 examples 보강"

# 커밋 + 푸시
claude "변경사항 커밋 후 feature/<브랜치> push"
```

---

## 🧘 바이브코딩 베스트 프랙티스

1. **맥락 먼저** — 새 요청 전 관련 파일 3-5개 읽히기
2. **패턴 지목** — "X 처럼" 이 아니라 "src/primitives/X 를 참고해서"
3. **빌드 검증 습관** — 요청 끝에 "npm run build 통과시켜줘"
4. **변경 범위 제한** — "다른 파일 건드리지 마"
5. **Dev Tools 활용** — Tester 드라이런 → Primitives 등록 확인 → Events 이벤트 추적 → AI Trace 결정 분석
6. **examples 가 최고의 프롬프팅** — 프롬프트 엔지니어링보다 프리미티브 examples 풍부하게
7. **한 번에 하나** — 프리미티브 추가 + examples 변경 + 스타일 튜닝 한 번에 요청 X
8. **롤백 준비** — 큰 변경 전 git commit

---

바이브코딩은 **AI에게 컨텍스트를 얼마나 잘 주느냐** 의 싸움이야. 
이 아키텍처에서는 **프리미티브 examples 가 그 컨텍스트**야.

화이팅.
