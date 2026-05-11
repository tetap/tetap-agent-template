# Plan Workflow Memory

This is a persistent project memory for planning behavior. It applies whenever an agent outputs or executes a multi-step plan in this repository.

## Rule Summary

Every plan must be mirrored into a docs-backed execution plan with checkboxes. Before executing a plan, search for the matching task todolist document. During execution, keep the checklist in sync. After completion, close the todolist.

## Required Workflow

1. Before or when presenting a plan, create or update a task todolist under `docs/todolists`.
2. Use a filename that includes the date and a short task slug, for example `docs/todolists/2026-05-11-plan-memory-workflow.md`.
3. Include an `Execution Plan` section with checkbox items using `- [ ]` and `- [x]`.
4. Before executing plan steps, search existing todolist documents to avoid duplicate task files.
5. As plan steps complete, update the matching todolist checkboxes.
6. If the plan changes, update the todolist in the same turn as the plan update.
7. At handoff, set `Status: Closed`, add a closed date, check completed items, and summarize closure notes.
8. Mention the todolist path in the final response when the task used a plan.

## Todolist Template

```md
# <Task Name> Todolist

Status: Open
Created: YYYY-MM-DD
Task: <Short task description>

## Execution Plan

- [ ] <Step one>
- [ ] <Step two>
- [ ] <Step three>

## Closure Notes

Pending.
```

## Search Command

Use this before executing a planned task:

```sh
find docs/todolists -maxdepth 1 -type f | sort
```

Use `rg` when searching for a related task title or slug:

```sh
rg -n "<task keyword>" docs/todolists
```

## Closure Criteria

A todolist is closed only when all applicable plan items are checked or explicitly marked as intentionally skipped in closure notes, and the validation or handoff result is recorded.
