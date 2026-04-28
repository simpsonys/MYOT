# Workflow: Start or Resume a MYOT Task

## Steps

1. Read `AGENTS.md` (project rules and structure).
2. Read `project_map.md` (architecture — determines which files to touch).
3. Read `history.md` (current task snapshot).
4. Compare the requested task with the current `history.md` goal.
   - If materially different: archive `history.md` to `AIHistory/YYYYMMDD_HHMM_<task-slug>.md`, then create a fresh snapshot.
   - If resuming the same task: update `history.md` with the current state.
5. Do **not** edit source files until the scope is clear and confirmed.
6. Identify the minimum set of files needed (refer to `project_map.md`).

## history.md format

```markdown
# Current Task Snapshot

## Current Goal
<one sentence>

## Completed Steps
- <step>

## Pending Steps
- <step>

## Exact Next Action
<specific next action>

## Last Updated
<YYYY-MM-DD HH:MM>

## Current Agent
<agent/model/tool name>

## Working Branch
<branch>

## Relevant Files
- <file path>
```
