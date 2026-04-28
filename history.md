# Current Task Snapshot

## Current Goal
TV 데모를 위한 기능 완성: 지도 통합, 코스 선택 UX, 영상 플레이어 강화, AI 조합 애니메이션

## Completed Steps
- Google Maps → Leaflet(무료) 전환 (`react-leaflet@4` + `leaflet`)
- `LeafletMap.tsx` 신규 생성 (lazy import — Vercel Edge SSR 호환)
- OSRM 공개 API로 도로 추적 경로 렌더링 (`AnimatedPolyline` draw-on 효과)
- `DevTools.ps1` Git-Release를 3개로 분리: 7=버전업, 8=태그생성, 9=Push
- `TVScreen.tsx` AssemblingOverlay 추가 (z-20, 6개 프리미티브 타일 + 펄스)
- AI toast 4500ms 자동 소멸
- `#tv-fullscreen-portal` div 추가 (z-50, TV 영역 내 포털 타겟)
- `orchestrator.ts` few-shot 수정: choice-list → multiRoutes 코스 선택 방식
- `MapCard.tsx` 전면 재작성:
  - `multiRoutes` → fullscreen portal overlay (3가지 색상 경로)
  - 코스 선택 시 `mutateWidgetReplace`로 위젯 트리 즉시 업데이트
  - `findMapCardPath` 트리 탐색 헬퍼
  - `createPortal`을 `#tv-fullscreen-portal`로 지정 (browser-wide 방지)
- 말풍선 z-index 30으로 수정 (assembling overlay z-20보다 위)
- `VideoPlayer.tsx` loop 기능 추가 (🔁 토글, HTML5 video + YouTube 양쪽)
- `VideoPlayer.tsx` YouTube URL 재생 지원:
  - `parseYouTubeId()` (youtube.com / youtu.be)
  - YouTube iframe embed (autoplay + loop + playlist 파라미터)
  - placeholder 화면에 YouTube URL 입력창 추가
  - `key={youtubeId-isLooping}` iframe 리로드 처리

## Pending Steps
- 브라우저에서 YouTube 재생 직접 확인 (tsc ✅, 브라우저 미확인)

## Exact Next Action
사용자가 dev server에서 VideoPlayer에 YouTube URL 붙여넣어 재생 확인

## Last Updated
2026-04-28 (Claude Sonnet 4.6)

## Current Agent
Claude Code (claude-sonnet-4-6)

## Working Branch
ys-AgentSkillAdd

## Relevant Files
- src/primitives/map-card/MapCard.tsx
- src/primitives/map-card/LeafletMap.tsx
- src/primitives/video-player/VideoPlayer.tsx
- src/components/TVScreen.tsx
- src/runtime/orchestrator.ts
- DevTools.ps1
