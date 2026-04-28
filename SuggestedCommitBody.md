# feat: Leaflet 지도·코스선택·YouTube 재생·AI 조합 애니메이션 통합

## What changed

### Map (Google Maps → Leaflet)
- `MapCard.tsx`: Google Maps 제거 → Leaflet + react-leaflet@4 기반 재작성
- `LeafletMap.tsx` 신규: `React.lazy` 로 SSR/Edge 환경 격리 (window 접근 방지)
- OSRM 공개 API (`router.project-osrm.org`) 로 도로 추적 경로 렌더링
- `AnimatedPolyline` draw-on 애니메이션 효과

### Course Selection UX
- `multiRoutes` prop → 풀스크린 코스 비교 지도 오버레이 (3가지 색상)
- `createPortal` 타겟을 `#tv-fullscreen-portal`로 한정 → TV 영역만 덮도록
- 코스 선택 시 `mutateWidgetReplace` 로 위젯 트리 즉시 교체 → 일반 TV 화면 복귀
- `orchestrator.ts` few-shot 수정: AI가 choice-list 대신 multiRoutes 사용하도록

### TV Screen
- `AssemblingOverlay` 추가 (z-20): AI 응답 대기 중 프리미티브 타일 애니메이션
- 사용자 발화 말풍선 z-30으로 조정 (조합 오버레이 위에 표시)
- `#tv-fullscreen-portal` div 추가 (z-50)
- AI 토스트 4500ms 자동 소멸

### Video Player
- HTML5 로컬 영상 + YouTube 양쪽에 🔁 loop 토글 추가
- YouTube URL 지원: `parseYouTubeId()`, iframe embed (autoplay+loop+playlist)
- placeholder 화면에 YouTube URL 입력창 + Enter/버튼 제출

### DevTools
- `DevTools.ps1` Git-Release → 3개 독립 액션: 7=버전업, 8=태그생성, 9=Push

## Dependencies added
- `leaflet`, `react-leaflet@4`, `@types/leaflet`

## Validation
- `tsc -b` — 통과 ✅
- `vite build` — 통과 ✅
