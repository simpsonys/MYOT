import type { PrimitiveDefinition } from '../../types';
import MapCardPrimitive, { type MapCardProps } from './MapCard';

const definition: PrimitiveDefinition<MapCardProps> = {
  type: 'map-card',
  name: '맵 카드',
  description:
    'Interactive Leaflet map with zoom/pan. Two modes: (1) single route — pass `route:[{lat,lng}]` + `center` + `zoom`; (2) multi-course comparison — pass `multiRoutes:[{route,label,distanceKm}]`, auto-fits bounds and shows a color-coded legend. Use for running routes, course comparison, travel destinations.',
  icon: '🗺️',
  isContainer: false,

  propsSchema: {
    caption: 'Short label badge on map (single-route mode)',
    center: '{ lat, lng } — map center for single-route mode',
    zoom: 'Zoom level 13-16 (single-route mode)',
    route: 'Array of { lat, lng } waypoints — single route polyline',
    distanceKm: 'Distance badge (single-route mode)',
    multiRoutes: 'Array of { route:[{lat,lng}], label:string, distanceKm?:number } — shows multiple color-coded routes, auto-fits map bounds',
  },
  defaultProps: {},

  examples: [
    {
      context: '러닝 위젯 — 한강반포 단일 코스 5.2km',
      blueprint: {
        primitive: 'map-card',
        props: {
          caption: '오늘의 추천 코스',
          distanceKm: 5.2,
          center: { lat: 37.513, lng: 126.994 },
          zoom: 14,
          route: [
            { lat: 37.5165, lng: 126.983 }, { lat: 37.5148, lng: 126.991 },
            { lat: 37.5126, lng: 126.999 }, { lat: 37.5108, lng: 127.010 },
          ],
        },
      },
    },
    {
      context: '전체화면 코스 비교 — 한강 세 코스 동시 표시',
      blueprint: {
        primitive: 'map-card',
        props: {
          multiRoutes: [
            {
              label: '한강 일주 코스', distanceKm: 7.5,
              route: [
                { lat: 37.5165, lng: 126.983 }, { lat: 37.5200, lng: 126.960 },
                { lat: 37.5240, lng: 126.940 }, { lat: 37.5260, lng: 126.920 },
              ],
            },
            {
              label: '남산 순환 코스', distanceKm: 5.0,
              route: [
                { lat: 37.5512, lng: 126.988 }, { lat: 37.5540, lng: 126.995 },
                { lat: 37.5520, lng: 127.005 }, { lat: 37.5490, lng: 127.000 },
              ],
            },
            {
              label: '야경 코스', distanceKm: 4.0,
              route: [
                { lat: 37.5665, lng: 126.978 }, { lat: 37.5640, lng: 126.985 },
                { lat: 37.5610, lng: 126.990 },
              ],
            },
          ],
        },
      },
      rationale: 'Place at colspan:12 rowspan:6 for full-screen. Pair with choice-list below for course selection.',
    },
  ],

  component: MapCardPrimitive,
};

export default definition;
