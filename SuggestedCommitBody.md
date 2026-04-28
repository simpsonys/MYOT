# feat(map-card): integrate Google Maps with zoom and route polyline

## What changed
- `MapCard.tsx`: `@vis.gl/react-google-maps` 기반 실제 인터랙티브 지도로 교체
  - `VITE_GOOGLE_MAPS_API_KEY` 설정 시 실제 Google Maps 렌더링
  - `route: [{lat, lng}]` 배열을 받아 경로를 Polyline으로 그리며 draw-on 애니메이션 적용
  - 기본 줌 인/아웃, 패닝 제스처 지원 (`gestureHandling: "greedy"`)
  - API 키 미설정 시 기존 mock 맵으로 graceful fallback
- `map-card/index.ts`: 한강반포 5.2km 코스, 여의도 3km 루프 실제 좌표 examples 추가
- `src/vite-env.d.ts`: `VITE_GOOGLE_MAPS_API_KEY` 타입 선언 파일 신규 생성
- `tsconfig.json`: `"google.maps"` 타입 추가
- `.env.example`: `VITE_GOOGLE_MAPS_API_KEY` 항목 추가

## Setup required
```
# .env.local
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```
Google Cloud Console → APIs & Services → Maps JavaScript API 활성화 필요

## Dependencies added
- `@vis.gl/react-google-maps` (Google 공식 React wrapper)
- `@types/google.maps` (타입 전용, devDependency)

## Validation
- `tsc -b` — 통과 ✅
- `vite build` — 통과 ✅ (360.95 kB)
