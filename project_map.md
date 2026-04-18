# 🗺️ Myot Project Architecture & AI Workflow Map

이 문서는 Myot(Make Your Own TV) 프로젝트의 전체 구조와 핵심 로직 흐름, 그리고 AI 에이전트가 지켜야 할 수정 규칙을 정의합니다. 모든 작업을 시작하기 전 가장 먼저 이 문서를 참조하세요.

## 🏗️ Core Architecture (3-Layer)

Myot은 **"위젯이 코드에 존재하지 않고, AI가 실시간으로 조립하는"** 플랫폼입니다.

1. **Primitives (팀원 작업 영역):** 위젯을 구성하는 최소 단위의 React 컴포넌트 (`chat-bubble`, `stat-tile` 등)
2. **Widget Blueprints:** AI가 발화를 분석하여 Primitives를 조합해 만든 JSON 트리 데이터
3. **TV Canvas (Runtime):** 생성된 Blueprint 트리를 재귀적으로 렌더링하는 12x8 그리드 화면

---

## 📂 Directory Structure & Modification Rules

### 🟢 자유롭게 수정 및 생성 가능한 영역 (프리미티브)
- `src/primitives/` : 새로운 UI 조각(Primitive)을 추가하는 곳.
  - `_template/` : 새 프리미티브 생성 시 복사할 템플릿
  - `<primitive-name>/index.ts` : **(가장 중요)** AI가 해당 조각을 언제 써야 할지 학습하는 `description`과 `examples` 교과서 역할.
  - `registry.ts` : 새 프리미티브를 등록하는 파일 (1줄씩만 추가 가능)

### 🔒 수정 금지 영역 (Playground Core - 리더 외 접근 금지)
- `src/runtime/` : 프레임워크 코어 (프롬프트 동적 조립, 트리 렌더러 등)
- `src/types/index.ts` : 코어 인터페이스 및 타입 정의
- `src/components/` : TV 화면, 프롬프트 입력창, DevTools UI
- `src/store/` : 위젯 상태 및 레이아웃 전역 관리
- `api/gemini.ts` : Vercel 서버리스 프록시 API

---

## 🔄 Core Logic Flow

1. **User Input:** 사용자가 자연어로 프롬프트 입력 (`src/components/PromptInput.tsx`)
2. **Orchestration:** `src/runtime/orchestrator.ts`가 등록된 모든 Primitive의 metadata(index.ts)를 모아 System Prompt를 동적으로 구성
3. **AI Generation:** `api/gemini.ts` 호출 후 5가지 Kind 중 하나로 응답 (`compose_widget`, `mutate_widget`, `layout`, `recommendations`, `emit_event`)
4. **State Dispatch:** `src/runtime/aiDispatcher.ts`가 AI의 JSON 응답을 파싱하여 `src/store/tvStore.ts`의 상태(Blueprint) 업데이트
5. **Recursive Render:** `src/runtime/blueprintRenderer.tsx`가 변경된 Blueprint 트리를 순회하며 React 컴포넌트로 화면에 렌더링

---

## 🤖 AI Agent Guidelines

1. **Vibe Decorating 구현 원칙:** 
   - "X 위젯을 만들어줘"라는 요청이 오면, 특정 위젯 컴포넌트를 코드로 짜는 것이 **아닙니다**.
   - **기존에 존재하는 Primitive들의 `examples` 배열에 해당 위젯을 조립할 수 있는 JSON 예시를 추가**하여 AI가 런타임에 알아서 조립하게 만들어야 합니다.

2. **History Logging (필수):**
   - 작업을 시작, 일시 정지, 완료할 때 반드시 프로젝트 루트의 `history.md`에 현재 목표, 진행 상황, 다음 할 일을 기록하세요.

3. **Testing & DevTools:**
   - `DevTools.bat`의 메뉴 2번(`npm run dev`)을 통해 서버를 띄운 후, `⌘K / Ctrl+K`로 브라우저에서 DevTools를 열어 동작을 확인하세요.
   - ` Tester` 탭을 활용해 프롬프트 드라이런 및 AI Trace를 확인하며 코드를 수정하세요.