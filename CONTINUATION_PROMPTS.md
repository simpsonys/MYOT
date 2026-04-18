# 이어서 작업하기 — 바이브코딩 프롬프트 모음

다른 AI 도구(Claude Code / Cursor / Gemini Code Assist / Vertex AI)로 이 프로젝트를 이어갈 때 쓰는 프롬프트들. **복붙용.**

> 모든 프롬프트는 `myot/` 프로젝트 루트에서 AI 도구를 연 상태에서 사용.

---

## 🎯 프롬프트 0: 첫 세션 — 프로젝트 이해시키기

**언제:** 새 AI 도구에 처음 프로젝트를 로드할 때, 작업 전에 반드시 먼저.

```
이 프로젝트는 Myot Playground 야.
자연어로 TV 홈 화면을 만드는 해커톤 MVP 이고,
"Self-describing widgets" 라는 독특한 아키텍처를 써.

각 위젯은 자기 자신을 AI 에게 설명해:
  - description, utterances (few-shot), actions, collaboratesWith, listensFor

AI 오케스트레이터는 런타임에 widget registry 를 스캔해서
시스템 프롬프트를 동적으로 조립해. 새 위젯을 추가해도 프롬프트 엔지니어링 없음.

다음을 순서대로 읽어줘:
1. README.md
2. TEAM_GUIDE.md
3. src/types/index.ts (WidgetDefinition 인터페이스 — 핵심 계약)
4. src/runtime/orchestrator.ts (프롬프트 동적 조립)
5. src/runtime/eventBus.tsx (위젯 간 통신)
6. src/runtime/aiDispatcher.ts (AI 응답 → 런타임 디스패치)
7. src/widgets/example/ (모든 패턴 데모)
8. src/widgets/running-coach/ (Living Widget 레퍼런스)

다 읽으면:
- 이 playground 가 기존 "AI 로 UI 생성" 프로젝트와 어떻게 다른지 한 문단으로
- "수정 금지" 인 파일 리스트
- "자유롭게 수정 가능" 한 파일 리스트
를 각각 알려줘.

그 다음 내 요청을 기다려.
```

---

## 🧩 프롬프트 1: 새 위젯 만들기 (가장 자주 쓸 것)

**언제:** 팀원이 본인 위젯 처음 만들 때. 이것만 잘 써도 위젯 하나 뚝딱.

```
src/widgets/<위젯-이름> 위젯을 만들어줘.

## 컨셉
<한두 문장으로 이 위젯이 뭐 하는 건지>

## 유저 시나리오
<실제 유저가 이 위젯에게 말할 법한 발화 3-5 개>

## 데이터
외부 API 는 쓰지 말고 mock 으로. 샘플 데이터 예시:
<데이터 예시>

## 요구사항
1. 먼저 src/widgets/example/index.ts 와 src/widgets/running-coach/index.ts 를
   읽어서 패턴을 파악해.
2. src/widgets/_template/ 를 골격으로 시작.
3. 컴포넌트:
   - w-full h-full 로 그리드 셀 채우기
   - theme.mode 에 따라 다크/라이트 대응
   - theme.accentColor 를 하이라이트에 사용
   - style.background, style.opacity, style.borderRadius 존중
4. 위젯 정의 (index.ts):
   - utterances 는 natural sentence 로 5-8 개 (formal command 아님)
   - 최소 2개의 actions 선언 (AI가 자연어로 조종 가능하게)
   - 최소 1개의 collaboratesWith 선언
   - 관련 있으면 listensFor 로 이벤트 구독
5. src/widgets/registry.ts 에 import 1줄 + 등록 1줄 추가.

## 완료 후
1. `npm run build` 통과 확인
2. 이 위젯을 테스트할 발화 3개 제안
3. Inspector 탭에 어떻게 보일지 간단히 설명
```

---

## 🎨 프롬프트 2: utterance 튜닝 (AI가 내 위젯을 안 부를 때)

**언제:** 위젯은 만들었는데 AI 가 발화를 엉뚱하게 해석할 때.

```
내 위젯 src/widgets/<이름> 의 utterances 가 제대로 작동 안 해.

## 문제 상황
유저가 "<실제 유저가 말할 발화>" 라고 했는데
AI 응답 kind 는 <실제 결과 kind> 였고, <실제 결과 설명>

## 기대 동작
kind 는 <기대 kind>, action 은 <기대 action>,
결과는 <기대 결과>

## 요청
1. src/widgets/<이름>/index.ts 의 description 과 utterances 를 다시 봐.
2. description 이 모호하거나 너무 일반적이면 더 구체적으로 수정.
3. 이 문제 케이스를 명확히 처리할 utterance 예시를 1-2개 추가.
   기존 utterance 는 지우지 말고.
4. 수정 후 Dev Tools Tester 로 드라이런 해볼 수 있는 테스트 발화 3개 제안.
```

---

## 🔧 프롬프트 3: action 디버깅

**언제:** AI 가 action 을 호출했는데 위젯이 반응 안 할 때.

```
AI 가 <위젯 이름>.<action 이름> 을 호출했는데 예상대로 동작 안 해.

## AI Trace 로그
<Dev Tools → AI Trace 에서 복사>

## 기대 동작
<어떻게 되어야 하는지>

## 확인 순서로 디버깅해줘
1. src/widgets/<이름>/index.ts 에서 해당 action 의 handler 로직 점검
2. ctx.updateConfig 호출이 맞는 필드에 대한 것인지 (config schema 와 일치)
3. ctx.emit 으로 이벤트 발생시킬 때 type 네이밍이 listensFor 와 일치하는지
4. 컴포넌트에서 useWidgetEvent 로 받는 쪽이 있다면 type 이 정확히 일치하는지
5. 필요하면 action handler 에 console.log 추가해서 호출 경로 추적

발견된 문제와 수정안을 diff 로 보여줘.
```

---

## 📡 프롬프트 4: 위젯 간 이벤트 협업 추가

**언제:** "내 위젯이 다른 위젯에 반응하게 하고 싶어" 라는 상황.

```
src/widgets/<내-위젯> 이 src/widgets/<다른-위젯> 의 상태 변화에 반응하게 만들어줘.

## 협업 시나리오
<다른-위젯> 이 <어떤 상황> 일 때,
<내-위젯> 이 <어떻게 반응>.

예: weather 가 비로 바뀌면 running-coach 가 "실내 추천" 표시

## 구현 순서
1. <다른-위젯>/index.ts 의 action 또는 utterance 에
   `ctx.emit({ type: '<이벤트명>', ... })` 추가.
2. <내-위젯>/index.ts 의 listensFor 에 '<이벤트명>' 추가.
3. <내-위젯> 의 컴포넌트에서 useWidgetEvent('<이벤트명>', handler) 사용해
   로컬 상태 업데이트 또는 UI 변경.
4. <내-위젯>/index.ts 의 collaboratesWith 에 선언 추가 (AI 가 맥락 이해하도록).

src/runtime/eventBus.tsx 와 src/widgets/running-coach/RunningCoach.tsx 의
useWidgetEvent 사용 패턴을 참고해.

최소 변경으로 구현하고 완료 후 npm run build.
```

---

## 🧪 프롬프트 5: 시연 직전 스모크 테스트

**언제:** 해커톤 발표 10-15분 전. 모든 시나리오가 실제로 동작하는지 최종 확인.

```
DEMO_SCRIPT.md 의 시연 시나리오를 자동으로 검증하는 스크립트를 만들어줘.

## 스펙
파일: scripts/smoke-test.mjs

아래 발화를 순서대로 http://localhost:3000/api/gemini 에 POST:

1. "추천 레이아웃 3개 보여줘" → kind: 'recommendations', layouts.length >= 2
2. "러닝 경로 보여줘" → kind: 'layout', widgets contains running-coach
3. "이 정도면 가뿐한데 더 늘려도 되겠어" → kind: 'invoke_action', actionName: 'suggestLongerRoute'
4. "첫번째 코스로 갈래" → kind: 'invoke_action', actionName: 'pickRoute'
5. "오늘 무리했어, 힘들어" → kind: 'invoke_action', actionName: 'recommendRecovery'
6. "블랙 테마, 투명도 50%로" → kind: 'layout', theme.widgetOpacity === 0.5

각 테스트:
- 요청 전송 전 currentLayout 상태를 누적 관리 (3번부터는 running-coach 가 화면에 있어야 함)
- 응답이 예상 kind/field 인지 확인
- 통과: ✅ 녹색, 실패: ❌ 빨강 + 실제 응답 덤프
- 전부 통과하면 exit 0, 하나라도 실패 exit 1

외부 의존성 없이 node 내장 fetch 만 사용.
package.json scripts 에 "test:smoke": "node scripts/smoke-test.mjs" 추가.

만들고 바로 한 번 실행해서 결과 보여줘.
```

---

## 🌐 프롬프트 6: Gemini → Vertex AI 전환 (API 한도 대비)

**언제:** 해커톤 당일 Gemini 무료 쿼터가 고갈될 조짐이 보일 때.

```
api/gemini.ts 를 Vertex AI 로 포팅 가능한 형태로 리팩토링해줘.

## 요구사항
1. api/gemini.ts 의 Gemini 호출 부분을 src/lib/aiProvider.ts 로 추출
2. 두 가지 provider 지원:
   - GeminiAIStudioProvider (현재, @google/generative-ai)
   - VertexAIProvider (@google-cloud/vertexai)
3. 환경변수로 선택:
   - AI_PROVIDER=gemini (기본) 또는 AI_PROVIDER=vertex
   - vertex 선택 시 필요 env: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION,
     GOOGLE_APPLICATION_CREDENTIALS_JSON (서비스 계정 JSON 을 문자열로)
4. 둘 다 동일한 인터페이스:
   async generate(systemPrompt: string, userPrompt: string): Promise<string>
5. api/gemini.ts 는 provider 를 환경변수로 선택만 하고 나머지 로직 유지.

완료 후:
- package.json 에 @google-cloud/vertexai 추가
- .env.example 에 Vertex AI 변수들 추가
- README.md 에 "API Provider 전환" 섹션 추가 (2-3 문단)
```

---

## 🎤 프롬프트 7: Web Speech API 로 음성 입력 추가

**언제:** 시연 임팩트를 위해 마이크 입력을 추가하고 싶을 때 (선택).

```
src/components/PromptInput.tsx 에 음성 입력 기능을 추가해줘.

## 요구사항
- Web Speech API (window.SpeechRecognition 또는 webkitSpeechRecognition) 사용
- 외부 라이브러리 금지
- 입력창 오른쪽 "보내기" 버튼 옆에 🎤 버튼 추가
- 클릭 시 ko-KR 인식 시작, 결과가 input value 에 들어가고 자동 submit
- 인식 중에는 🎤 버튼이 빨갛게 pulse 애니메이션
- 브라우저 미지원 시 버튼 비활성화 + title="이 브라우저는 음성 인식 미지원"
- 에러 핸들링 (onerror) 포함, 에러 시 toast 또는 aiMessage 로 표시

기존 submit 로직 건드리지 말고 병렬로 추가.
TypeScript 타입은 window 확장으로 처리 (global.d.ts 파일).
```

---

## 🔄 프롬프트 8: 충돌 방지 — 그리드 오버랩 자동 해결

**언제:** AI 가 위젯을 겹치게 배치하는 문제가 자주 발생할 때.

```
src/store/tvStore.ts 의 applyLayout 을 개선해줘.

## 요구사항
1. pure 함수 resolveOverlaps(widgets: WidgetInstance[]): WidgetInstance[] 를
   src/runtime/gridResolver.ts 로 분리
2. 로직:
   - 12x8 그리드에서 각 위젯의 (col, row, colspan, rowspan) 이 점유하는 셀 계산
   - 겹치는 위젯 발견 시:
     a. 먼저 추가된 위젯은 유지
     b. 나중 위젯을 빈 공간으로 이동 (top-left first-fit)
     c. 빈 공간이 부족하면 rowspan 우선 축소, 다음 colspan 축소
     d. minSize 미만이 되면 해당 위젯 드롭 + console.warn
3. applyLayout 내부에서 resolveOverlaps 호출
4. 테스트 3개 (vitest 설치 불필요, node:test 로):
   - 겹침 없는 레이아웃 → 그대로
   - 겹침 있는 레이아웃 → 후자 위젯 이동
   - 공간 부족 → 마지막 위젯 드롭 + 경고

완료 후 테스트 실행:
node --test src/runtime/gridResolver.test.mjs
```

---

## 🚢 프롬프트 9: GitHub Actions CI

**언제:** 팀 여러 명이 PR 을 올릴 때 품질 게이트를 세우고 싶을 때.

```
아래 파일들을 생성해줘:

1. .github/workflows/ci.yml
   - Node 20, PR/push on main
   - npm ci → npm run build 검증
   - (선택) npm run test:smoke (서버리스 함수가 로컬에서 돌 수 있으면)

2. .github/pull_request_template.md
   - 요약 / 추가/수정 위젯 / 테스트 발화 목록 / 체크리스트
   - 체크리스트 항목: npm run build 통과, Dev Tools Inspector 에 노출 확인,
     최소 1개 utterance Tester 드라이런 성공, registry.ts 충돌 없음

3. CONTRIBUTING.md
   - 브랜치 전략: feature/<name>-widget
   - 커밋 컨벤션: feat(widget): ..., fix(orchestrator): ...
   - "이 파일은 수정 금지" 목록 (runtime/**, types, components/**)

팀원 주니어도 따라할 수 있을 정도로 구체적으로.
```

---

## 💡 프롬프트 10: 위젯 아이디어 브레인스토밍 도우미

**언제:** 팀원이 "뭐 만들지 모르겠어" 할 때.

```
내 성향과 경험을 바탕으로 참신한 TV 위젯 아이디어 5개를 제안해줘.

## 내 정보
- 직업/배경: <예: 모바일 앱 개발자, 3년차>
- 취미/관심사: <예: 러닝, 커피, 오래된 영화>
- TV 시청 습관: <예: 주로 넷플릭스, 주말에 드라마 몰아보기>
- 가족 구성: <예: 미혼, 고양이 1마리>

## 요구사항
1. TEAM_GUIDE.md 의 "아이디어 촉매" 섹션을 먼저 읽어줘.
   그 목록에 있는 아이디어는 제외하고 새로운 것만.
2. 각 아이디어마다:
   - 이름 (감각적으로)
   - 한 줄 컨셉
   - 3개의 예시 utterance
   - 1개의 핵심 action (이름 + 동작)
   - 다른 위젯과의 collaboration 1개
   - "이게 왜 참신한가?" 한 문단
3. 5개 중 최소 2개는 "TV 라는 화면의 특성" 을 적극 활용하는 것
   (크다, 거실에 있다, 가족이 함께 본다, 오래 켜둔다 등)
4. 뻔하지 않은 것 — 시계, 날씨, 주식, 뉴스, 포토 앨범 같은 건 금지.

내가 이 중 하나를 골라 "이걸로 갈래" 라고 하면
프롬프트 1 로 이어서 구현 시작.
```

---

## 🎁 보너스: 자주 쓰는 Claude Code 원라이너

```bash
# 새 위젯 스캐폴딩
claude "src/widgets/<이름> 위젯을 example 패턴 참고해서 만들어줘: <컨셉>"

# 빌드 에러 해결
claude "npm run build 돌리고 에러 있으면 최소 변경으로 고쳐줘"

# utterance 추가
claude "src/widgets/<이름> 의 utterance 에 '<새 발화>' 케이스 추가해줘. intent 는 <kind>"

# 특정 발화 튜닝
claude "발화 '<X>' 가 현재 <잘못된 kind> 로 해석돼. 의도는 <올바른 kind>. utterances/description 수정"

# 커밋 + 푸시
claude "현재 변경사항 커밋 (메시지는 내용 기반으로) 후 feature/<브랜치명> 으로 push"
```

---

## 🧘 바이브코딩 베스트 프랙티스 (팀원 공유)

1. **AI 에게 맥락부터 주기** — 새 기능 요청 전에 관련 파일 3-5개 읽게 하기
2. **패턴을 지목하기** — "X 처럼" 보다 "src/widgets/X 를 참고해서"
3. **항상 빌드 검증** — 요청 끝에 "npm run build 통과시켜줘" 습관
4. **변경 범위 제한** — "다른 파일 건드리지 말고" 명시
5. **한 번에 하나** — 위젯 추가 + 테마 + API 를 한 번에 요청 X
6. **롤백 준비** — 큰 변경 전 항상 git commit 먼저
7. **Dev Tools 적극 활용** — Tester 로 드라이런, Inspector 로 등록 확인, Events 로 버스 추적
8. **AI 응답이 이상하면 utterance 탓** — 프롬프트 수정보다 위젯의 utterance 예시 추가가 먼저

---

바이브코딩은 **컨텍스트를 얼마나 잘 주느냐** 의 싸움이야.
이 프롬프트들을 베이스로 각자 스타일을 쌓아가. 파이팅.
