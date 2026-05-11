# Todolists

This directory stores docs-backed execution plans for agent tasks.

## Purpose

Todolists make agent plans auditable. Any multi-step task must have a matching markdown file here with checkbox progress and closure notes.

## Rules

- Search this directory before creating a new task file.
- Use a filename with date and short slug, for example `2026-05-11-docs-architecture-refresh.md`.
- Include `Status`, `Created`, `Task`, `Execution Plan`, and `Closure Notes`.
- Use `- [ ]` and `- [x]` checkboxes for every plan item.
- Keep checkboxes synchronized with the active plan.
- Close the file at handoff with `Status: Closed`, `Closed: YYYY-MM-DD`, and validation notes.

## Template

```md
# <Task Name> Todolist

Status: Open
Created: YYYY-MM-DD
Task: <Short task description>

## Execution Plan

- [ ] <Step one>
- [ ] <Step two>

## Closure Notes

Pending.
```

See [Plan Workflow Memory](../memory/plan-workflow.md) for the full workflow.
