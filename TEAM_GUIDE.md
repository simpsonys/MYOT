# 팀원 가이드

> **이 프로젝트의 성공 기준은 "우승" 이 아니라 "너가 바이브코딩으로 뭔가를 만들어냈다는 성취감" 이야.**

---

## ⚠️ 먼저 읽을 것: "뻔한 거 만들지 마"

이 playground 를 만든 이유는, 리더가 정해준 위젯(시계, 날씨, 주식)을 네가 복사하게 하려는 게 아니야. 정확히 그 반대야.

- **너가 생각하는 "왜 이런 게 TV 에 없지?" 를 만들어.**
- **너만 만들 수 있는, 네 경험이 녹은 위젯을 만들어.**
- Clock, Weather, Stock 같은 **"당연히 있어야 할 것 같은 위젯"을 만들면 너의 창의성을 낭비한 거야.**

아래 "아이디어 촉매" 섹션에 영감이 필요할 때 볼 wild card 들을 넣어뒀어.

---

## 🏗 위젯 아키텍처 5분 요약

모든 위젯 = **self-describing 계약 + React 컴포넌트**.

```typescript
// src/widgets/your-widget/index.ts
export default {
  type: 'your-widget',
  description: '...',          // AI 가 "언제 쓸지" 판단
  
  utterances: [                // AI 가 "무엇을 할지" 학습 (few-shot)
    { user: '유저가 이렇게 말하면', intent: 'create', ... },
    { user: '이 발화는', intent: 'invoke_action', action: 'myAction' }
  ],
  
  actions: {                   // AI 가 이름으로 호출 가능
    myAction: {
      description: '...',
      handler: (ctx, params) => {
        ctx.updateConfig({ ... });    // 내 상태 변경
        ctx.emit({ type: 'my.event', ... });  // 이벤트 방출 → 다른 위젯이 반응
        ctx.speak('사용자에게 메시지');
      }
    }
  },
  
  collaboratesWith: [          // 다른 위젯과 어떻게 협업할지
    { withType: 'weather', when: '비가 오면', behavior: '실내 변형으로 전환' }
  ],
  
  listensFor: ['weather.changed'],  // 이벤트 버스 구독
  
  component: YourComponent
}
```

컴포넌트 안에서 이벤트 수신:
```typescript
useWidgetEvent('weather.changed', (e) => {
  // 반응하기
});
```

### 📚 참고 순서

1. **`src/widgets/_template/`** — 최소 골격 (5분 안에 이해)
2. **`src/widgets/example/`** — 모든 패턴 (utterances · actions · events · collaboration)
3. **`src/widgets/running-coach/`** — 실전 레퍼런스, 차별화 시그니처

이 세 개가 네 교과서야.

---

## 🧪 Playground Dev Tools 활용법

**⌘K / Ctrl+K** 로 열어. 4개 탭:

1. **Inspector** — 네 위젯이 등록되면 여기 나와. AI 계약이 의도대로 나오는지 확인.
2. **Tester** — 네 위젯이 반응할 발화를 **실제 TV 에 적용 안 하고** 드라이런. 튜닝 필수.
3. **Events** — `ctx.emit()` 이 제대로 발생하는지 로그로 확인.
4. **AI Trace** — AI 가 어떤 결정(`layout` vs `invoke_action`)을 했는지 보면서 utterance 보강.

**개발 루프:**
```
utterance/action 추가 → Tester 에서 드라이런 → 결과가 invoke_action 이 맞는지 확인 
→ 맞으면 → 실제 발화로 TV 확인 → Events 탭에서 이벤트 흐름 확인
```

---

## 🔥 아이디어 촉매 (뻔한 걸 피하기 위한)

**PPT에 남아있는 공식 시나리오 (Running Coach 외에도):**
- 세대 연결 위젯 (가족 사진 월)
- Mood Sync (조명 + TV + 오디오 통합)
- Digital Legacy (가족 타임라인)
- Emergency Widget

하지만 팀원들은 **위의 것들을 만들 필요 없어.** 그건 차별화가 아니라 "아이디어 채점된 것들" 이야.

**진짜 차별화 후보 (자극용 wild card):**

### 🎨 Weirdly Personal
- **"Procrastination Monitor"** — 유저가 같은 OTT 앱만 3일째 틀면 화면에 "너 요즘 XX만 보더라" 도발
- **"Yesterday's You"** — 어제의 시청 패턴을 오늘 화면 구석에 유령처럼 반투명 표시
- **"모닝 컨디션 미터"** — 스마트워치 수면 데이터 기반, 컨디션 따라 TV 자체가 조용해짐
- **"부부 싸움 감지기"** — 둘 다 TV 앞에 앉았는데 10분째 아무도 말 안 하면 무드 조명 + 좋아하는 드라마 추천

### 🪞 Reflective / Observational
- **"TV가 나를 놀리는 위젯"** — 리모컨 조작 패턴 학습해서 "또 그 채널?" 이라고 코멘트
- **"진짜 나이 측정기"** — 네가 반응하는 OTT 카테고리로 정신연령 추정
- **"시청 편식 경보"** — 같은 장르만 2주째 보면 반대 장르 위젯이 등장

### 🌐 Contextual / Ambient
- **"창밖 날씨 미러링"** — Google Maps street view + 실제 날씨 합성해서 "지금 창밖은 이럴 거야" 렌더
- **"음악의 색"** — Spotify 현재곡의 분위기를 전체 배경 그라디언트로 실시간 반영
- **"가족 동선 위젯"** — 가족 위치 데이터로 "아빠가 퇴근 중, 도착 17분 뒤" 표시

### 🤖 Meta / AI-native
- **"프롬프트 히스토리 위젯"** — 오늘 유저가 한 발화 top 5 + AI 코멘트
- **"내 위젯이 서로 대화함"** — 위젯 간 이벤트 버스를 시각화, 위젯들이 서로 메시지 주고받는 걸 애니메이션으로
- **"TV 라이브러리안"** — 모든 위젯의 현재 상태를 요약해서 "네 TV는 지금 이런 상태야" 라고 말하는 메타 위젯

### 🎭 Playful / Delightful
- **"오늘의 운세 by TV"** — 시청 패턴 + 날씨 + 시간대로 운세 생성
- **"리모컨 실종 추적기"** — 마지막으로 썼을 때의 앱 기록으로 "너 아마 소파 밑..." 추측
- **"TV가 박수쳐주는 순간"** — 유저가 특정 달성(운동 완료, 기록 단축) 시 전체 화면 불꽃놀이

이 목록은 자극용이야. **진짜 너의 아이디어는 여기 없어야 해.**

---

## 🎬 해커톤 당일 워크플로우 (3-4시간)

```
00:00-00:30  Morning sync
  - 각자 당일 만들 위젯 최종 결정
  - 충돌 방지: 서로 다른 폴더에서만 작업 (src/widgets/<본인이름>/)

00:30-02:30  바이브코딩 (2시간)
  - Cursor or Claude Code 열고 본인 브랜치에서 시작
  - Dev Tools 의 Tester 로 utterance 튜닝하면서 개발
  - registry.ts 에 등록 2줄만 추가

02:30-03:00  통합 (30분)
  - PR 머지 or 리더가 cherry-pick
  - Inspector 탭에서 모든 위젯 등록 확인
  - AI Trace 로 각 위젯 발화 테스트

03:00-03:30  시연 리허설 (30분)
  - 시나리오 순서 연습
  - utterance 가 안 먹히면 Tester 로 보강

03:30-04:00  발표
```

---

## 🤝 파일 수정 규칙 (충돌 방지)

### ✅ 자유롭게 작업
- `src/widgets/<네 폴더>/**` — 본인 폴더

### ⚠️ 한 줄만 추가
- `src/widgets/registry.ts` — 본인 위젯 import 1줄 + 등록 1줄

### ❌ 당일 수정 금지 (리더만)
- `src/runtime/**`
- `src/types/index.ts`
- `api/gemini.ts`
- `src/components/**`
- `src/store/**`

이 폴더들은 playground 프레임워크야. 팀원이 수정하면 다른 팀원의 위젯도 깨질 수 있어.

---

## 🎯 바이브코딩 프롬프트 (복붙용)

### 첫 세션: 프로젝트 이해

```
이 프로젝트는 Myot Playground 야. 자연어로 TV 홈 화면을 만드는 시스템이고,
각 위젯이 self-describing 계약(utterances/actions/events/collaboration)을 
가지고 있어. AI 오케스트레이터가 registry 에서 이 선언들을 긁어모아 
시스템 프롬프트를 동적으로 조립해.

다음 순서로 읽어줘:
1. README.md
2. TEAM_GUIDE.md  
3. src/types/index.ts (WidgetDefinition 인터페이스)
4. src/widgets/_template/ (최소 예시)
5. src/widgets/example/ (모든 패턴)
6. src/widgets/running-coach/ (차별화 레퍼런스)
7. src/runtime/orchestrator.ts (어떻게 프롬프트가 조립되는지)

읽고 나서 "이 playground 의 unique value" 를 한 문단으로 요약해줘.
그 다음 내 요청을 기다려.
```

### 새 위젯 만들기

```
src/widgets/<위젯이름> 위젯을 만들고 싶어.

이 위젯의 컨셉: <한국어로 설명>
이유 / 유저 시나리오: <왜 이 위젯이 필요한지>

요구사항:
- src/widgets/example/ 를 먼저 읽어서 모든 패턴을 파악해
- 그 다음 src/widgets/_template/ 에서 시작 골격 복사
- 컴포넌트는 w-full h-full, theme 기반 다크/라이트 대응
- utterances 는 내 유저가 실제로 할 법한 한국어 발화 5-8개
  (formal command 아닌 natural sentence)
- action 최소 2개 이상 선언 (이 위젯이 AI에게 "이런 식으로 조종 가능해" 라고 알려주기 위해)
- 최소 1개의 collaboratesWith 선언 (다른 위젯과의 관계)
- 가능하면 listensFor 로 이벤트 구독 (위젯간 유기적 상호작용)
- registry.ts 에 import 1줄 + 등록 1줄 추가
- 외부 API 금지, 필요하면 mock

완료 후:
1. npm run build 통과시켜줘
2. Dev Tools Inspector 에서 이 위젯의 계약을 보여줄 JSON 텍스트로 출력해줘
3. 이 위젯을 자극할 테스트 발화 3개 제안해줘
```

### utterance 튜닝 (AI 가 내 위젯을 안 부를 때)

```
내 위젯 src/widgets/<이름> 의 utterances 를 개선하고 싶어.

문제 상황: 유저가 "<문제 발화>" 라고 했는데 AI 가 <엉뚱한 행동>.
기대 동작: <무엇을 했어야 하는지>.

src/widgets/<이름>/index.ts 의 utterances 와 description 을 다시 보고,
이 케이스를 명확히 처리할 utterance 예시를 1-2개 추가해줘.
기존 utterance 는 지우지 말고.
description 이 부정확하면 그것도 수정.
```

---

## 💡 자주 막히는 지점

**"내 위젯이 AI 결과에 안 나와"**  
→ registry.ts 등록 확인 → Inspector 탭에서 보이는지 → 안 보이면 import 에러

**"AI 가 다른 위젯을 호출함"**  
→ Tester 에서 "시스템 프롬프트 보기" → 내 위젯 description 이 너무 모호한지 확인 → utterance 예시 추가

**"action 을 호출했는데 에러"**  
→ AI Trace 에서 parsed.widgetId 확인 → 위젯이 실제 TV 에 있는지 → 없으면 AI 가 먼저 생성해야 함  
→ utterance 에 `when: "위젯이 화면에 있을 때"` 추가

**"이벤트가 안 발생/안 받힘"**  
→ Events 탭에서 emit 되는지 확인 → 안 되면 action handler 가 ctx.emit 호출하는지  
→ 받는 쪽은 useWidgetEvent 를 컴포넌트 안에서 호출해야 함 (index.ts 아님)

---

## 🏆 마지막 말

이 해커톤에서 네가 얻어야 할 것:
1. **"자연어로 내 위젯이 동작하는 걸 봤다"** 는 순간의 감동
2. **"AI 에게 선언적으로 가르치는"** 바이브코딩 감각
3. **너의 위젯이 너의 개성을 담고 있다는 확신**

우승은 부산물이야. **너가 다음 주에도 바이브코딩을 계속 하고 싶어지게 하는 것** 이 진짜 목표야.

화이팅.
