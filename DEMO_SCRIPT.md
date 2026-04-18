# Myot 시연 시나리오

> **"위젯이 코드에 없지만, 말하면 만들어집니다."** 이게 이 시연의 단 하나의 메시지.

---

## 🎯 시연 핵심 메시지

1. **Vibe Decorating** — 위젯을 고르는 게 아니라, 말하면 만들어진다
2. **Primitive Composition** — AI 가 조각을 조립해 유저가 상상한 모든 위젯을 즉석에서 생성
3. **Living Widgets** — 감정에 반응하는 위젯 (단순 정보 표시 X)

---

## 🎬 10분 시연 플로우

### 🎤 오프닝 (30초)

> "스마트폰도, 스마트워치도 홈 화면을 내 맘대로 꾸미는데, 왜 TV는 아직도 제조사가 만든 화면만 봐야 할까요?"
>
> "기존 대시보드 빌더들도 결국 **미리 만들어진 위젯 카탈로그** 에서 드래그-앤-드롭이에요. Myot 은 다릅니다."
>
> "Myot 은 **위젯을 만들어두지 않습니다.** 유저가 말하면 AI 가 그 자리에서 조립해요."

화면: 빈 TV 캔버스.

---

### 🎬 시나리오 1: 말 한 마디로 위젯 탄생 (1분 30초)

**발화:** `"러닝 경로 위젯 만들어줘"`

**기대 AI 응답:** `kind: compose_widget`

위젯 조립 (예시):
```json
{
  "id": "run-today",
  "label": "오늘의 러닝",
  "grid": { "col": 1, "row": 1, "colspan": 5, "rowspan": 6 },
  "root": {
    "primitive": "stack",
    "children": [
      { "primitive": "stat-row", "children": [
        { "primitive": "stat-tile", "props": { "value": "5.2", "unit": "km", "label": "거리", "accent": true }},
        { "primitive": "stat-tile", "props": { "value": "28", "unit": "min", "label": "시간" }},
        { "primitive": "stat-tile", "props": { "value": "5'24\"", "unit": "/km", "label": "페이스" }}
      ]},
      { "primitive": "map-card", "props": { "caption": "오늘의 경로", "seed": "run-today", "distanceKm": 5.2 }},
      { "primitive": "chat-bubble", "props": { "text": "5.2km 완주! 어제보다 +0.3km 🎉", "speaker": "ai", "tone": "celebrate" }}
    ]
  }
}
```

**멘트:**
> "보세요 — 러닝 코치 위젯이 나타났어요. 상단엔 스탯 3개, 중앙엔 지도, 하단엔 AI 코멘트.
>
> 여기서 중요한 건, **이 러닝 위젯이라는 건 코드에 없습니다.** AI 가 제가 등록해둔 5개 프리미티브(`stack`, `stat-row`, `stat-tile`, `map-card`, `chat-bubble`) 를 조합해 즉석에서 만든 거예요."

> **Dev Tools 포인트:** ⌘K → `🧬 Blueprints` 탭 → 방금 만들어진 위젯의 전체 트리 JSON 공개:
> "보시는 이 트리 구조를 AI 가 JSON 으로 만들었고, 런타임이 재귀적으로 렌더했어요. 위젯이 곧 데이터예요."

---

### 🔥 시나리오 2: "한 번도 본 적 없는 위젯" (2분, **최고의 순간**)

**발화:** `"오늘 운세 위젯도 하나 띄워줘"`

**기대 AI 응답:** `kind: compose_widget`, 코드에 전혀 없는 "운세 위젯"이 탄생

예상 조합:
```json
{
  "id": "fortune-today",
  "label": "오늘의 운세",
  "grid": { "col": 7, "row": 1, "colspan": 4, "rowspan": 5 },
  "root": {
    "primitive": "stack",
    "children": [
      { "primitive": "image-frame", "props": { "source": "seed:tarot-star", "caption": "The Star", "shape": "portrait" }},
      { "primitive": "chat-bubble", "props": { "text": "오늘은 새로운 시작에 좋은 날. 미루던 일을 시작해보세요.", "speaker": "ai", "tone": "comfort" }},
      { "primitive": "action-button", "props": { "label": "다른 카드 뽑기", "icon": "🔮", "onTapEvent": "fortune.reroll", "variant": "ghost" }}
    ]
  }
}
```

**멘트 (이 부분을 강조):**
> "잠깐만요 — **저는 '운세 위젯' 을 만든 적이 없습니다.**
>
> 프로젝트 파일 어디에도 '운세 위젯' 이라는 건 없어요. 그런데 AI 가 제 등록된 프리미티브들 — `image-frame`, `chat-bubble`, `action-button` — 을 가져다 운세라는 **새로운 개념의 위젯**을 그 자리에서 만들어냈어요."

> "이게 기존 스마트TV 와의 근본적 차이에요. 제조사가 미리 만든 것 중에 고르는 게 아니라, **유저가 상상한 모든 위젯이 그 순간 태어납니다.**"

> **Dev Tools 포인트:** 
> - `🧠 AI Trace` 탭: `compose_widget` 로 `fortune-today` 생성된 것 확인
> - `🧱 Primitives` 탭: "여기 등록된 10개 프리미티브가 어휘집이에요. AI 가 이걸로 무한한 위젯을 조립해요."

---

### 🎬 시나리오 3: 감정 발화 → 기존 위젯 내부 변경 (2분)

**발화:** `"이 정도면 가뿐한데 더 늘려도 되겠어"`

**기대 AI 응답:** `kind: mutate_widget` with `op: append_child`

AI 가 기존 러닝 위젯에 `choice-list` 를 추가:
```json
{
  "kind": "mutate_widget",
  "widgetId": "run-today",
  "op": {
    "type": "append_child",
    "parentPath": [],
    "node": {
      "primitive": "choice-list",
      "props": {
        "onPickEvent": "running.routePicked",
        "items": [
          { "title": "한강뷰 코스", "subtitle": "벚꽃과 강바람", "badge": "+120 kcal", "rank": 1 },
          { "title": "카페 투어 코스", "subtitle": "유명 커피숍 3곳", "badge": "+95 kcal", "rank": 2 },
          { "title": "피톤치드 코스", "subtitle": "숲길", "badge": "+180 kcal", "rank": 3, "caution": "오르막 있음" }
        ]
      }
    }
  }
}
```

**멘트:**
> "여기서 두 번째 마법. 제가 **'가뿐한데 더 늘려볼까'** 라고 감정적으로 말했어요.
>
> AI 는 이게 새 위젯을 만들라는 게 아니라, **기존 러닝 위젯 안에 선택지를 추가하라** 는 뜻인 걸 이해했어요. 그래서 `mutate_widget` 으로 기존 블루프린트에 `choice-list` 를 append 했죠."

> "결과 → 러닝 위젯 안에 3개 경로 추천 카드가 스무스하게 슬라이드되어 나타나요. 한강뷰, 카페 투어, 피톤치드."

> **Dev Tools 포인트:**  
> - `🧠 AI Trace`: `mutate_widget · run-today.append_child` 배지
> - `🧬 Blueprints`: 해당 위젯 트리에 choice-list 가 추가된 걸 JSON 으로 확인

---

### 🎬 시나리오 4: 인터랙션 이벤트 (1분)

**액션:** 추천된 경로 중 "한강뷰 코스" 카드 **클릭**

**기대 결과:** `choice-list` 의 `onPickEvent: "running.routePicked"` 가 이벤트 버스로 emit

**멘트:**
> "그리고 이 카드들은 클릭 가능해요. `choice-list` 프리미티브가 `onPickEvent` 로 이벤트 버스에 발생시킵니다."

> **Dev Tools 포인트:** `📡 Events` 탭 → `running.routePicked` 이벤트 방금 발생한 것 확인:
> "이 이벤트에 다른 위젯이 반응하게 하려면 `useBusEvent` 로 구독만 하면 돼요. 위젯 간 느슨한 결합(decoupling) 이에요."

---

### 🎬 시나리오 5: 감정 기반 공감 응답 (1분 30초)

**발화:** `"오늘 무리했어, 힘들어"`

**기대 AI 응답:** `kind: mutate_widget` with `op: update_props`

AI 가 러닝 위젯 내부 chat-bubble 의 props 를 업데이트:
```json
{
  "kind": "mutate_widget",
  "widgetId": "run-today",
  "op": {
    "type": "update_props",
    "path": [2],
    "props": {
      "text": "오늘은 푹 쉬세요. 내일 더 잘 달릴 수 있어요",
      "tone": "comfort"
    }
  }
}
```

**멘트:**
> "숫자가 아닌 **감정** 에 반응합니다. **'힘들어'** 라는 발화 하나로, AI 는 러닝 위젯의 chat-bubble 을 찾아 그 props 만 업데이트했어요. 전체를 다시 그리는 게 아니에요."

> "이게 PPT 에 썼던 '감정을 입력으로 받는 Living Widget' 의 실체입니다."

---

### 🎬 시나리오 6: 완전히 다른 도메인 — 가족 연결 (1분)

**발화:** `"할머니 사진이랑 손녀한테 전화하는 버튼 만들어줘"`

**기대 AI 응답:** `kind: compose_widget`, 노년층 타겟 위젯 탄생

예상 조합:
```json
{
  "id": "grandma-care",
  "label": "할머니 전용",
  "grid": { "col": 1, "row": 7, "colspan": 4, "rowspan": 2 },
  "root": {
    "primitive": "stack",
    "children": [
      { "primitive": "image-frame", "props": { "source": "seed:granddaughter", "caption": "손녀 민지", "shape": "circle" }},
      { "primitive": "action-button", "props": { "label": "손녀에게 전화", "icon": "📞", "onTapEvent": "call.start", "eventPayload": { "contact": "granddaughter" }, "variant": "warm" }}
    ]
  }
}
```

**멘트:**
> "도메인을 완전히 바꿔봅니다. 노년층을 위한 위젯 — 큰 얼굴 사진과 원터치 영상통화 버튼.
>
> 같은 10개 프리미티브로, 러닝, 운세, 이제 가족 연결까지. **어휘는 같은데 문장은 무한히 다양해지는** 자연어처럼요."

---

### 🎬 시나리오 7: 테마 변경 (30초)

**발화:** `"블랙 테마, 투명도 50%"`

**기대 AI 응답:** `kind: layout` 또는 `compose_widget with preserveExisting`

**멘트:**
> "기존 위젯들은 그대로 유지하면서 테마만 바뀝니다. 언급되지 않은 건 보존이 원칙이에요."

---

### 🏁 클로징 (1분)

**⌘K → Dev Tools `🧱 Primitives` 탭 활짝 펼치기.**

> "지금까지 보신 모든 위젯 — 러닝, 운세, 가족 전화 — 은 이 10개 프리미티브로 만들어졌어요."

> "해커톤에서 3-4시간 만에 만든 MVP 이지만, 이 아키텍처의 힘은 바로 **확장성** 이에요. 팀원이 새 프리미티브 하나 등록하면, 즉시 수십 가지 새 위젯이 가능해져요."

> "폰엔 앱 스토어가, 워치엔 워치페이스 마켓이 있죠. TV 엔 Myot 레이아웃 마켓이 생길 겁니다. 그리고 그 마켓의 위젯은 **'고르는' 게 아니라 '말하면 만들어지는'** 것이에요."

> "폰이 그랬고, 워치가 그랬듯이 — 이제 TV 차례입니다."

---

## 📋 시연 직전 체크리스트

- [ ] `vercel dev` 실행 중, `http://localhost:3000`
- [ ] `GEMINI_API_KEY` 유효 + 쿼터 남아있음
- [ ] Dev Tools Primitives 탭에서 10개 프리미티브 전원 등록 확인
- [ ] Tester 탭에서 시나리오 7개 발화 모두 드라이런 성공
- [ ] AI Trace, Events, Blueprints 탭 모두 비우기 (깨끗한 시작)
- [ ] 화면 녹화 백업 (AI 실패 대비)
- [ ] 풀스크린 + 발표 환경 폰트 크기 체크

---

## 🚨 트러블슈팅

### AI가 엉뚱한 프리미티브를 조합
- Dev Tools Tester 에서 "시스템 프롬프트 보기" → 해당 프리미티브 description 점검
- 같은 발화 재시도 (temperature 0.7 이라 변동 있음)
- 그래도 안 되면 AI Trace 확인하며 "지금 AI 가 학습 중입니다" 하고 넘기기

### "운세 위젯" 이 조합 안 됨
- image-frame 의 examples 에 타로/운세 시나리오 미리 포함시키기 (이미 포함됨)
- chat-bubble 의 tone 설명에 "mysterious" 같은 것 추가해서 다양성 강화 가능

### mutate_widget 에서 path 가 잘못됨
- AI 가 블루프린트 상태를 정확히 읽었는지 확인 (현재 state 가 system prompt에 주입됨)
- 복잡한 위젯은 path 가 꼬일 수 있음. 이때는 유저에게 `op.type: replace_root` 로 전체 재조립 유도

### API 한도 초과
- CONTINUATION_PROMPTS.md 의 Vertex AI 전환 프롬프트 사용

---

## 🎁 보너스 시연 (여유 있을 때)

**메타 발화:** `"지금 화면 상태 요약해줘"` → AI 가 현재 레이아웃 설명 (emit_event 활용)

**멀티 위젯 조합:** `"주말 아침용 레이아웃 — 날씨, 가족 일정, 커피 루틴"` → AI 가 한 번에 3개 위젯 compose

**자신감 발화:** `"너가 보기에 내 TV에 뭐가 더 있으면 좋을까?"` → AI 가 recommendations 로 3가지 제안

---

**이 시연의 숨은 메시지:**
> Myot 은 **위젯 제조사가 아니라 위젯의 언어를 디자인하는 회사** 입니다.
> 프리미티브가 어휘이고, AI 가 문법이고, 유저의 발화가 새로운 문장이에요.
