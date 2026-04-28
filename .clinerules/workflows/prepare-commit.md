# Workflow: Prepare a MYOT Commit

## Steps

1. Confirm all validation steps in `validate.md` have passed.
2. Write the commit subject to `SuggestedCommit.txt`:
   - Plain string only (no `git commit -m`, no quotes).
   - Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
   - Max 72 characters.
3. Write the full commit body to `SuggestedCommitBody.md`:
   ```markdown
   ## Changes
   - <bullet>

   ## Validation
   - <commands run and results>

   ## Known limitations
   - <limitations or None>

   ## Follow-up
   - <next recommended action or None>
   ```
4. Update `history.md` to reflect task completion.
5. Update `project_map.md` if architecture changed.
6. Update `README.md` if user-facing behavior changed.

## Do NOT

- Do not run `git commit` or `git push` unless the user explicitly requests it.
- End your response with exactly:
  ```
  [Suggested Commit] git commit -m "<contents of SuggestedCommit.txt>"
  ```
