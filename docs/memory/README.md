# Memory

This directory stores persistent project memories that affect agent behavior across turns.

## Memories

| Memory                                         | Applies When                                                               | Summary                                                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [Plan Workflow Memory](plan-workflow.md)       | An agent outputs or executes a multi-step plan.                            | Mirror the plan into `docs/todolists`, keep checkboxes synchronized, and close the todolist at handoff.            |
| [README Sync Memory](readme-sync-workflow.md)  | Code, package exports, routes, models, scripts, or workspace rules change. | Update the nearest README, package method/export lists, and relevant architecture docs in the same task.           |
| [Testing Workflow Memory](testing-workflow.md) | A feature, package, app, architecture rule, or test strategy changes.      | Consider unit tests, Vitest Browser Mode UI tests, smoke tests, and targeted affected-test mapping before handoff. |

## Maintenance Rules

- Add a memory only when it affects future agent behavior, not for one-off task notes.
- Link new memories from `AGENTS.md` and root `README.md` when they become global rules.
- Keep memory documents operational: include triggers, required workflow, commands, and completion criteria.
