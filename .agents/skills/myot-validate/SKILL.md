---
name: myot-validate
description: Run MYOT project validation commands (lint and build) and report results.
---

# Skill: myot-validate

## Commands

```bash
npm run lint     # ESLint
npm run build    # tsc -b && vite build
```

## Notes

- Use only commands defined in `package.json` scripts. Do not invent commands.
- There is no automated test suite.
- Manual verification: `npm run dev` → open `http://localhost:5173` → `Ctrl+K` DevTools → Tester tab.
- Codex: do not run `npm run dev` in the terminal; ask the user to start it manually.

## Output

Report:
- Command run
- Exit status
- Error output (if any)
- Whether validation passed or failed
