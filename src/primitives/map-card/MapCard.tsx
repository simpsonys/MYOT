import { useEffect, useRef } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import type { PrimitiveProps } from '../../types';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface MapCardProps {
  caption?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  /** Ordered lat/lng waypoints to draw as a running route polyline */
  route?: RoutePoint[];
  distanceKm?: number;
  /** Fallback seed for mock map when no API key is present */
  seed?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export default function MapCardPrimitive(args: PrimitiveProps<MapCardProps>) {
  const { props, theme } = args;
  if (!API_KEY) {
    return <MockMapCard {...args} />;
  }

  const center = props.center ?? deriveCenter(props.route);
  const zoom = props.zoom ?? 15;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl">
      <APIProvider apiKey={API_KEY}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeId="roadmap"
          colorScheme="DARK"
        >
          {props.route && props.route.length > 1 && (
            <RoutePolyline route={props.route} color={theme.accentColor} />
          )}
        </Map>
      </APIProvider>

      <div className="absolute inset-x-2 bottom-2 flex items-end justify-between pointer-events-none z-10">
        {props.caption && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-black/60 text-white">
            📍 {props.caption}
          </span>
        )}
        {props.distanceKm != null && (
          <span
            className="text-[10px] font-mono px-2 py-1 rounded-full bg-black/60"
            style={{ color: theme.accentColor }}
          >
            {props.distanceKm}km
          </span>
        )}
      </div>
    </div>
  );
}

// Draws a polyline using the Maps JS API Polyline class
function RoutePolyline({ route, color }: { route: RoutePoint[]; color: string }) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    polylineRef.current?.setMap(null);

    // Start with empty path — animate draw-on separately
    const polyline = new google.maps.Polyline({
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.95,
      strokeWeight: 4,
      map,
    });
    polylineRef.current = polyline;

    const full = route;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      try {
        polyline.setPath(full.slice(0, i));
      } catch {
        clearInterval(timer);
      }
      if (i >= full.length) clearInterval(timer);
    }, 30);

    return () => {
      clearInterval(timer);
      polyline.setMap(null);
    };
  }, [map, route, color]);

  return null;
}

// Fallback mock map when VITE_GOOGLE_MAPS_API_KEY is not set
function MockMapCard({ props, theme }: PrimitiveProps<MapCardProps>) {
  const seed = props.seed ?? 'myot-map';
  const bgUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}-map/640/360?blur=1`;
  const points = makeFakePath(seed);

  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-xl"
      style={{
        background: `linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,97,255,0.1)), url(${bgUrl}) center/cover`,
      }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={theme.accentColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.8))' }}
        />
        <circle
          cx={points.split(' ')[0].split(',')[0]}
          cy={points.split(' ')[0].split(',')[1]}
          r="1.5"
          fill="#fff"
        />
      </svg>
      <div className="absolute inset-x-2 bottom-2 flex items-end justify-between">
        {props.caption && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-black/50 text-white">
            📍 {props.caption}
          </span>
        )}
        {props.distanceKm != null && (
          <span
            className="text-[10px] font-mono px-2 py-1 rounded-full bg-black/50"
            style={{ color: theme.accentColor }}
          >
            {props.distanceKm}km
          </span>
        )}
      </div>
    </div>
  );
}

function deriveCenter(route?: RoutePoint[]): { lat: number; lng: number } {
  if (!route || route.length === 0) return { lat: 37.5326, lng: 126.9906 }; // 한강 기본값
  const mid = Math.floor(route.length / 2);
  return route[mid];
}

function makeFakePath(seed: string): string {
  const rng = (i: number) => {
    let h = 0;
    for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k) + i * 7) & 0xffff;
    return (h % 100) / 100;
  };
  const pts: string[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 90 + 5;
    const y = 30 + Math.sin(i * 0.8) * 15 + (rng(i) - 0.5) * 8;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}
