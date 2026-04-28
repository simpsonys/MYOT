import type { PrimitiveDefinition } from '../../types';
import MapCardPrimitive, { type MapCardProps } from './MapCard';

const definition: PrimitiveDefinition<MapCardProps> = {
  type: 'map-card',
  name: '맵 카드',
  description:
    'An interactive Google Maps area showing a real map with zoom and pan. Use for running routes, travel destinations, hiking trails, commute visualization, delivery tracking. Pass a `route` array of {lat, lng} waypoints to draw the path on the map. Always provide `center` near the route midpoint and `zoom` 14–16 for street-level detail.',
  icon: '🗺️',
  isContainer: false,

  propsSchema: {
    caption: 'Short label shown on map (e.g. "오늘의 러닝 경로")',
    center: '{ lat, lng } — map center, ideally the route midpoint',
    zoom: 'Zoom level: 14=neighborhood, 15=street (default), 16=building',
    route: 'Array of { lat, lng } waypoints tracing the running path',
    distanceKm: 'Total route distance shown as badge',
    seed: 'Fallback seed for mock map (used when no API key)',
  },
  defaultProps: {},

  examples: [
    {
      context: '러닝 위젯 — 한강 반포지구 5.2km 코스',
      blueprint: {
        primitive: 'map-card',
        props: {
          caption: '추천 한강변 코스',
          distanceKm: 5.2,
          center: { lat: 37.5126, lng: 126.9946 },
          zoom: 14,
          route: [
            { lat: 37.5165, lng: 126.9830 },
            { lat: 37.5158, lng: 126.9870 },
            { lat: 37.5148, lng: 126.9910 },
            { lat: 37.5136, lng: 126.9946 },
            { lat: 37.5126, lng: 126.9990 },
            { lat: 37.5118, lng: 127.0030 },
            { lat: 37.5112, lng: 127.0065 },
            { lat: 37.5108, lng: 127.0100 },
          ],
        },
      },
    },
    {
      context: '러닝 위젯 — 여의도 한강공원 3km 루프',
      blueprint: {
        primitive: 'map-card',
        props: {
          caption: '여의도 한강공원 루프',
          distanceKm: 3.0,
          center: { lat: 37.5285, lng: 126.9320 },
          zoom: 15,
          route: [
            { lat: 37.5260, lng: 126.9280 },
            { lat: 37.5272, lng: 126.9310 },
            { lat: 37.5285, lng: 126.9340 },
            { lat: 37.5298, lng: 126.9360 },
            { lat: 37.5310, lng: 126.9340 },
            { lat: 37.5305, lng: 126.9305 },
            { lat: 37.5290, lng: 126.9280 },
            { lat: 37.5260, lng: 126.9280 },
          ],
        },
      },
    },
    {
      context: '다음 여행지 지도 표시 — 속초 해변',
      blueprint: {
        primitive: 'map-card',
        props: {
          caption: '다음 목적지: 속초',
          center: { lat: 38.2070, lng: 128.5918 },
          zoom: 13,
          seed: 'sokcho',
        },
      },
    },
  ],

  component: MapCardPrimitive,
};

export default definition;
