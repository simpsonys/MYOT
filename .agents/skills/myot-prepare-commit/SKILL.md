---
name: myot-prepare-commit
description: Prepare a MYOT commit by writing SuggestedCommit.txt and SuggestedCommitBody.md following Conventional Commits, without actually committing.
---

# Skill: myot-prepare-commit

## Steps

1. Confirm validation passed (see `myot-validate`).
2. Write commit subject to `SuggestedCommit.txt`:
   - Plain string, no `git commit -m`, no quotes.
   - Conventional Commits format: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
   - Max 72 characters.
3. Write commit body to `SuggestedCommitBody.md`:
   ```markdown
   ## Changes
   - <bullet>

   ## Validation
   - <commands and results>

   ## Known limitations
   - <limitations or None>

   ## Follow-up
   - <next action or None>
   ```
4. Update `history.md` to reflect task completion.
5. Update `project_map.md` if architecture changed.
6. Update `README.md` if user-facing behavior changed.

## Do NOT commit or push unless explicitly requested.

End response with:
```
[Suggested Commit] git commit -m "<SuggestedCommit.txt contents>"
```
