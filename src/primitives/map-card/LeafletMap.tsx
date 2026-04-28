import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { PrimitiveProps } from '../../types';
import type { MapCardProps, RoutePoint, MultiRoute } from './MapCard';
import { ROUTE_PALETTE } from './MapCard';

export default function LeafletMap({ props, theme }: PrimitiveProps<MapCardProps>) {
  useEffect(() => {
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);
  const hasMulti = props.multiRoutes && props.multiRoutes.length > 0;
  const center = props.center ?? deriveCenter(props.route);
  const zoom = props.zoom ?? 15;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {hasMulti ? (
        <MultiRouteLayer routes={props.multiRoutes!} accentColor={theme.accentColor} />
      ) : (
        <>
          <SyncView center={[center.lat, center.lng]} zoom={zoom} />
          {props.route && props.route.length > 1 && (
            <SingleRoute route={props.route} color={theme.accentColor} />
          )}
        </>
      )}
    </MapContainer>
  );
}

// ── Multi-route: fetch all roads in parallel, fit bounds to all routes ──────

function MultiRouteLayer({ routes, accentColor }: { routes: MultiRoute[]; accentColor: string }) {
  const map = useMap();
  const [roadRoutes, setRoadRoutes] = useState<(RoutePoint[] | null)[]>(
    () => routes.map(() => null)
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all(routes.map(r => fetchOSRMRoute(r.route))).then(results => {
      if (!cancelled) setRoadRoutes(results);
    });
    return () => { cancelled = true; };
  }, [routes]);

  // Fit map bounds to cover all routes once road routes are loaded
  useEffect(() => {
    const allPoints = roadRoutes
      .flatMap((r, i) => r ?? routes[i].route)
      .map(p => [p.lat, p.lng] as [number, number]);
    if (allPoints.length === 0) return;
    try {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [24, 24], animate: true, duration: 0.8 });
    } catch { /* ignore if bounds invalid */ }
  }, [map, roadRoutes]);

  return (
    <>
      {routes.map((r, i) => {
        const color = r.color ?? ROUTE_PALETTE[i % ROUTE_PALETTE.length];
        const pts = roadRoutes[i] ?? r.route;
        return pts.length > 1 ? (
          <AnimatedPolyline key={i} route={pts} color={color} delay={i * 400} />
        ) : null;
      })}
    </>
  );
}

// ── Single-route: fetch road geometry, sync view ─────────────────────────────

function SingleRoute({ route, color }: { route: RoutePoint[]; color: string }) {
  const [roadRoute, setRoadRoute] = useState<RoutePoint[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOSRMRoute(route).then(pts => { if (!cancelled) setRoadRoute(pts); });
    return () => { cancelled = true; };
  }, [route]);

  const display = roadRoute ?? route;
  return display.length > 1 ? <AnimatedPolyline route={display} color={color} /> : null;
}

function SyncView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [map, center[0], center[1], zoom]);
  return null;
}

// ── Animated polyline draw-on ─────────────────────────────────────────────────

function AnimatedPolyline({ route, color, delay = 0 }: { route: RoutePoint[]; color: string; delay?: number }) {
  const [visible, setVisible] = useState<RoutePoint[]>([]);

  useEffect(() => {
    setVisible([]);
    const step = Math.max(1, Math.floor(route.length / 60));
    let i = 0;
    const start = setTimeout(() => {
      const timer = setInterval(() => {
        i += step;
        setVisible(route.slice(0, i));
        if (i >= route.length) { setVisible(route); clearInterval(timer); }
      }, 16);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(start);
  }, [route, delay]);

  if (visible.length < 2) return null;

  return (
    <Polyline
      positions={visible.map(p => [p.lat, p.lng] as [number, number])}
      color={color}
      weight={4}
      opacity={0.95}
    />
  );
}

// ── OSRM road routing ─────────────────────────────────────────────────────────

async function fetchOSRMRoute(waypoints: RoutePoint[]): Promise<RoutePoint[]> {
  try {
    const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return waypoints;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return waypoints;
    return (data.routes[0].geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => ({ lat, lng })
    );
  } catch {
    return waypoints;
  }
}

function deriveCenter(route?: RoutePoint[]): { lat: number; lng: number } {
  if (!route || route.length === 0) return { lat: 37.5326, lng: 126.9906 };
  return route[Math.floor(route.length / 2)];
}
