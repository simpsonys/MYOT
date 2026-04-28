# AGENTS.md — Myot Cross-Agent Instructions

> Canonical instruction file for all AI agents (Claude, Gemini, Codex, Cline, etc.).
> Do not create agent-specific memory as the source of truth. Point here instead.

---

## Project Overview

**Myot (Make Your Own TV)** — A platform where users describe what they want in natural language, and AI assembles React primitives into widgets in real time on a 12×8 TV canvas. No widgets exist in code; the AI composes them at runtime from atomic "Primitives."

---

## Stack & Runtime

| Layer | Technology |
|---|---|
| UI | React 18, TypeScript, Tailwind CSS, Framer Motion |
| State | Zustand |
| AI Backend | Google Gemini API (`@google/generative-ai`) |
| Build | Vite 5, TypeScript (`tsc -b`) |
| Lint | ESLint |
| Deploy | Vercel (serverless `/api/` functions) |
| Package mgr | **npm** (use `npm`, not pnpm or yarn) |

---

## Setup

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY (and optionally TMDB_API_KEY)
npm run dev                  # dev server at http://localhost:5173
```

---

## Validation Commands

```bash
npm run lint     # ESLint
npm run build    # tsc -b && vite build
```

There is no test suite. Validate manually via the in-app DevTools panel (`Ctrl+K` / `⌘K`).

> **Claude Code note:** Do NOT run `npm run dev` in the terminal (it hangs). Ask the user to start the dev server manually.

---

## Repository Map

```
AGENTS.md               ← this file (read first)
project_map.md          ← architecture & file-lookup guide (read second)
history.md              ← current task snapshot (read third)
GlobalDirectives.md     ← legacy instruction file (keep, do not delete)
src/
  primitives/           ← ✅ safe to add/edit (new atomic UI components)
    _template/          ← copy this when creating a new primitive
    registry.ts         ← register new primitives here (append only)
  runtime/              ← 🔒 framework core (do not edit without lead approval)
  components/           ← 🔒 TV canvas, input, DevTools UI
  store/                ← 🔒 global widget state (tvStore.ts)
  types/index.ts        ← 🔒 core interfaces
api/
  gemini.ts             ← 🔒 Vercel serverless AI proxy
  theme.ts              ← 🔒 Vercel serverless theme handler
  primitives-data.ts    ← primitive metadata for API
AIHistory/              ← archived history snapshots
```

---

## Code Style & Editing Rules

- Prefer surgical edits over full-file rewrites.
- Keep changes strictly additive; do not silently remove existing features.
- If a new feature conflicts with existing logic, **pause and notify the user** before deleting anything.
- Do not add dependencies unless necessary.
- Do not reformat unrelated code.
- Identifiers, commands, APIs, paths, and code must remain in **English**.
- Communicate final responses in **Korean**.

---

## Vibe Decorating Implementation Rule

When asked to "make X widget": do **not** write a new component. Instead, add JSON examples to the `examples` array in the relevant primitive's `index.ts` so the AI learns to assemble it at runtime.

---

## Safety Rules

- Read `project_map.md` and `history.md` before editing any source file.
- Do not scan `node_modules/`, `dist/`, `.vercel/cache/`.
- Do not commit or push unless explicitly requested.
- Do not modify `.env.local` or expose API keys.

---

## Git / Commit Rules

- Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Always update `SuggestedCommit.txt` with the bare commit message string.
- Always update `SuggestedCommitBody.md` with the full body.

---

## Task Memory Rules

- `history.md` is the **current task snapshot** — not an append-only log.
- Keep it concise; overwrite it as the task progresses.
- **Before switching to a materially different task**, archive `history.md` to `AIHistory/YYYYMMDD_HHMM_<task-slug>.md`.
- `AIHistory/` may contain richer logs; `history.md` must remain a short, resumable snapshot.

`history.md` required sections:
```
# Current Task Snapshot
## Current Goal
## Completed Steps
## Pending Steps
## Exact Next Action
## Last Updated
## Current Agent
## Working Branch
## Relevant Files
```

---

## Completion Checklist

Before declaring a task done:

- [ ] Update `history.md`
- [ ] Update `project_map.md` if architecture changed
- [ ] Update `README.md` if user-facing behavior changed
- [ ] Update `SuggestedCommit.txt`
- [ ] Update `SuggestedCommitBody.md`
