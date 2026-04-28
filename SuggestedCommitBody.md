# feat: add share layout via URL feature

## Changes
- Add `src/utils/shareLayout.ts`: encode/decode layout as base64 URL param, plus `buildShareUrl`, `getSharedLayoutFromUrl`, and `clearShareParam` helpers
- Add "Share link" button to `SavedLayoutsPanel`: one button for the current live screen and one per saved layout item; copies URL to clipboard with a 2-second "✓ Copied!" feedback
- Add `SharedLayoutPrompt` component in `App.tsx`: detects `?share=` on mount, shows a friend's layout preview card (theme colors + widget count) with "Load" / "Dismiss" actions
- No backend or database required — layout JSON is encoded as `btoa(encodeURIComponent(json))` in the query string

## Validation
- `npm run build` (tsc -b && vite build) — passed (17.78 s)
- `npm run lint` — ESLint binary not installed locally; skipped

## Known limitations
- Very large layouts (many widgets with deep primitive trees) may produce URLs exceeding browser limits (~2 000 chars for some older clients); not an issue for typical usage
- No expiry or revocation: anyone with the URL can import the layout indefinitely

## Follow-up
- None
