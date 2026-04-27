## Changes
- Add provider-neutral `AGENTS.md` as the canonical cross-agent instruction file.
- Add `CLAUDE.md` (thin `@AGENTS.md` wrapper) and `GEMINI.md` (thin Gemini wrapper).
- Add `.clineignore` and `.clinerules/` (00-myot.md + 3 workflow files) for Cline.
- Add 4 MYOT skills for each agent provider: `.cline/skills/`, `.codex/skills/`, `.claude/skills/` (myot-start-task, myot-safe-implementation, myot-validate, myot-prepare-commit).
- Update `project_map.md` with cross-agent workflow file table.
- Add `history.md` current task snapshot and `SuggestedCommitBody.md`.

## Validation
- `npm run lint` — not run (no source code changed; lint applies to src/ files only)
- `npm run build` — not run (no source code changed)
- No source files were modified; only agent instruction/workflow/skill files were added.

## Known limitations
- No automated tests exist in this project; manual DevTools validation is required for source changes.
- Codex skill invocation syntax may differ by Codex version; verify `.codex/skills/` discovery when first using Codex on this repo.

## Follow-up
- Test that `CLAUDE.md` `@AGENTS.md` import is recognized by the Claude Code harness.
- Consider adding a `CODEX.md` thin wrapper if Codex CLI supports a project-level instruction file.
