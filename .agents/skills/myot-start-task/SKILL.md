---
name: myot-start-task
description: Start or resume a MYOT task by reading AGENTS.md, project_map.md, and history.md, archiving history.md when switching tasks, and preparing a concise current task snapshot.
---

# Skill: myot-start-task

## Steps

1. Read `AGENTS.md`.
2. Read `project_map.md`.
3. Read `history.md`.
4. Compare the requested task with the current `history.md` goal.
   - **Materially different task:** archive `history.md` to `AIHistory/YYYYMMDD_HHMM_<task-slug>.md`, then create a fresh snapshot in `history.md`.
   - **Same task / resuming:** update `history.md` with the latest state.
5. Do **not** edit any source files until the scope is confirmed.
6. Identify only the files required for this task (use `project_map.md` as the guide).

## Output

Updated `history.md` with:
- Current Goal
- Completed Steps
- Pending Steps
- Exact Next Action
- Last Updated
- Current Agent
- Working Branch
- Relevant Files
