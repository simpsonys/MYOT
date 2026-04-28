---
name: myot-safe-implementation
description: Implement MYOT changes safely with minimal diffs, behavior preservation, and post-change validation.
---

# Skill: myot-safe-implementation

## Steps

1. Read the relevant files identified in `history.md` before making any changes.
2. Plan the minimal diff required — do not touch unrelated code.
3. Respect modification rules from `project_map.md`:
   - `src/primitives/` — safe to add/edit
   - `src/runtime/`, `src/components/`, `src/store/`, `api/` — restricted; edit only if necessary and with care
4. Make changes surgically (no full-file rewrites unless creating a new file).
5. Do not add unrelated formatting changes.
6. After edits, run validation: `npm run lint` then `npm run build`.
7. If a conflict with existing features is found, **pause and notify the user** before removing anything.

## Report after implementation

- Files changed (with line ranges)
- Validation result (`npm run lint`, `npm run build`)
- Known limitations
- Recommended follow-up
