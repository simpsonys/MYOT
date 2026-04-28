import type { SavedLayout, Theme, WidgetBlueprint } from '../types';

type LayoutPayload = { theme: Theme; widgets: WidgetBlueprint[] };

export function encodeLayout(layout: LayoutPayload): string {
  const json = JSON.stringify({ theme: layout.theme, widgets: layout.widgets });
  return btoa(encodeURIComponent(json));
}

export function decodeLayout(encoded: string): LayoutPayload | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json) as Partial<LayoutPayload>;
    if (!parsed.theme || !Array.isArray(parsed.widgets)) return null;
    return { theme: parsed.theme, widgets: parsed.widgets };
  } catch {
    return null;
  }
}

export function buildShareUrl(layout: LayoutPayload): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('share', encodeLayout(layout));
  return url.toString();
}

export function getSharedLayoutFromUrl(): (LayoutPayload & { name?: string }) | null {
  const params = new URLSearchParams(window.location.search);
  const share = params.get('share');
  if (!share) return null;
  return decodeLayout(share);
}

export function clearShareParam(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('share');
  window.history.replaceState({}, '', url.toString());
}

export function layoutToSaved(
  layout: LayoutPayload,
  name: string,
): SavedLayout {
  return {
    id: `shared-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    savedAt: Date.now(),
    theme: layout.theme,
    widgets: layout.widgets,
  };
}
