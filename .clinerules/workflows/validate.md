# Workflow: Validate MYOT Changes

## Validation commands (run in order)

```bash
npm run lint     # ESLint — must pass with no errors
npm run build    # tsc -b && vite build — must complete successfully
```

## Notes

- There is no automated test suite. After build succeeds, validate behavior manually:
  - Start dev server: `npm run dev` (user runs this; Claude Code must not)
  - Open browser at `http://localhost:5173`
  - Open DevTools panel with `Ctrl+K` / `⌘K`
  - Use the **Tester** tab for prompt dry-runs and AI Trace inspection
- Do not invent commands that are not in `package.json` scripts.
- If a command fails, diagnose and fix the root cause; do not bypass with `--no-verify` or similar flags.

## After validation

- Update `history.md` with validation results.
- If build succeeded and all checks pass, proceed to `prepare-commit` workflow.
