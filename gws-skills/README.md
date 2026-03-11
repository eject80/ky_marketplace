# gws-skills

Google Workspace CLI (`gws`) skills for Claude Code.

Covers Gmail, Calendar, Drive, Sheets, Docs, Slides, Chat, Meet, Forms, Tasks, Keep, People, Classroom, Admin Reports, Model Armor, cross-service Workflows, task Recipes, and role-based Personas.

## Installation

```bash
claude plugin install gws-skills
```

## Requirements

- [`gws`](https://github.com/googleworkspace/cli) binary on `$PATH`
- Authenticated via `gws auth login` or `GOOGLE_APPLICATION_CREDENTIALS`

## Skill Groups

| Group | Skills | Description |
|-------|--------|-------------|
| **core** | 28 | Individual GWS service APIs |
| **modelarmor** | 4 | Content safety screening |
| **workflows** | 6 | Cross-service productivity workflows |
| **recipes** | 41 | Step-by-step task recipes |
| **personas** | 10 | Role-based assistant behaviors |

## Selective Loading

This plugin installs **core**, **modelarmor**, and **workflow** skills automatically.

**Recipes** and **Personas** are available on demand — ask Claude to load the specific skill you need:

> "Load the `recipe-find-free-time` skill and help me schedule a meeting."

> "Use the `persona-exec-assistant` persona for this session."

Or use the index skill as your entry point:

> "Read `gws-index` and help me manage my Gmail inbox."

## Quick Start

```
Read the gws-index skill and help me triage my inbox.
```

```
Use the recipe-find-free-time skill to schedule a 1-hour meeting with alice@example.com next week.
```

```
Act as persona-project-manager and give me a status update on this week's tasks.
```

## License

Apache-2.0
