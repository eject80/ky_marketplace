---
name: gws-index
version: 1.0.1
description: "Google Workspace Skills index — entry point for selective skill loading."
metadata:
  openclaw:
    category: "productivity"
    requires:
      bins: ["gws"]
---

# gws-skills — Index

Use this skill as the entry point when you need to work with Google Workspace via the `gws` CLI.

## Skill Groups

Load only the groups relevant to the current task. Do NOT load all groups at once.

### Core (always load when using gws)
- `skills/gws-shared` — Auth, global flags, security rules **(load first)**
- `skills/gws-gmail` + helpers (`gws-gmail-send`, `gws-gmail-triage`, `gws-gmail-watch`)
- `skills/gws-calendar` + helpers (`gws-calendar-agenda`, `gws-calendar-insert`)
- `skills/gws-drive` + helpers (`gws-drive-upload`)
- `skills/gws-docs` + helpers (`gws-docs-write`)
- `skills/gws-sheets` + helpers (`gws-sheets-append`, `gws-sheets-read`)
- `skills/gws-slides`
- `skills/gws-chat` + helpers (`gws-chat-send`)
- `skills/gws-meet`
- `skills/gws-forms`
- `skills/gws-keep`
- `skills/gws-people`
- `skills/gws-tasks`
- `skills/gws-classroom`
- `skills/gws-admin-reports`
- `skills/gws-events` + helpers (`gws-events-renew`, `gws-events-subscribe`)

### Model Armor (load when content safety screening is needed)
- `skills/gws-modelarmor`
- `skills/gws-modelarmor-sanitize-prompt`
- `skills/gws-modelarmor-sanitize-response`
- `skills/gws-modelarmor-create-template`

### Workflows (load when running cross-service productivity workflows)
- `skills/gws-workflow`
- `skills/gws-workflow-standup-report`
- `skills/gws-workflow-meeting-prep`
- `skills/gws-workflow-weekly-digest`
- `skills/gws-workflow-email-to-task`
- `skills/gws-workflow-file-announce`

### Recipes (load only the specific recipe needed)
> Located in `skills/`. Load individual recipes on demand.
> Each recipe lists its required core skills in `requires.skills`.

- `recipe-find-free-time` — Find available meeting slots across calendars
- `recipe-schedule-recurring-event` — Create recurring calendar events
- `recipe-block-focus-time` — Block focus time on calendar
- `recipe-batch-invite-to-event` — Batch-invite attendees from a list
- `recipe-reschedule-meeting` — Reschedule an existing meeting
- `recipe-plan-weekly-schedule` — Plan the week from calendar + tasks
- `recipe-find-large-files` — Find large files in Drive
- `recipe-bulk-download-folder` — Download an entire Drive folder
- `recipe-organize-drive-folder` — Organize files in a Drive folder
- `recipe-share-folder-with-team` — Share a Drive folder with team members
- `recipe-email-drive-link` — Email a Drive file link to recipients
- `recipe-watch-drive-changes` — Watch for Drive file changes
- `recipe-create-doc-from-template` — Create a Doc from a template
- `recipe-draft-email-from-doc` — Draft an email based on a Doc
- `recipe-share-doc-and-notify` — Share a Doc and notify recipients
- `recipe-save-email-to-doc` — Save an email thread to a Doc
- `recipe-save-email-attachments` — Save email attachments to Drive
- `recipe-label-and-archive-emails` — Label and archive emails in bulk
- `recipe-forward-labeled-emails` — Forward emails by label
- `recipe-create-gmail-filter` — Create a Gmail filter rule
- `recipe-create-vacation-responder` — Set up Gmail vacation auto-reply
- `recipe-backup-sheet-as-csv` — Export a Sheet tab as CSV
- `recipe-compare-sheet-tabs` — Compare two Sheet tabs
- `recipe-copy-sheet-for-new-month` — Copy a Sheet tab for a new month
- `recipe-create-events-from-sheet` — Create calendar events from Sheet rows
- `recipe-generate-report-from-sheet` — Generate a report Doc from Sheet data
- `recipe-sync-contacts-to-sheet` — Sync Google Contacts to a Sheet
- `recipe-create-expense-tracker` — Create an expense tracker Sheet
- `recipe-log-deal-update` — Log a deal update to a Sheet
- `recipe-create-presentation` — Create a Slides presentation
- `recipe-share-event-materials` — Share meeting materials before an event
- `recipe-review-meet-participants` — Review Meet call participants
- `recipe-create-meet-space` — Create a Meet space
- `recipe-send-team-announcement` — Send a team announcement via Chat
- `recipe-create-feedback-form` — Create a Google Form for feedback
- `recipe-collect-form-responses` — Collect and summarize Form responses
- `recipe-create-task-list` — Create a structured task list
- `recipe-review-overdue-tasks` — Review and triage overdue tasks
- `recipe-create-shared-drive` — Create a Shared Drive
- `recipe-create-classroom-course` — Create a Classroom course
- `recipe-post-mortem-setup` — Set up a post-mortem Doc + calendar event

### Personas (load when acting as a specific role)
> Located in `skills/`. Load the persona that matches the user's role.

- `persona-exec-assistant` — Executive assistant (Gmail + Calendar + Drive + Chat)
- `persona-project-manager` — Project manager (Tasks + Calendar + Sheets + Drive)
- `persona-it-admin` — IT administrator (Admin Reports + People + Drive)
- `persona-hr-coordinator` — HR coordinator (Forms + Sheets + Gmail + Calendar)
- `persona-sales-ops` — Sales operations (Sheets + Gmail + Drive)
- `persona-researcher` — Researcher (Drive + Docs + Sheets)
- `persona-team-lead` — Team lead (Calendar + Chat + Tasks + Meet)
- `persona-customer-support` — Customer support (Gmail + Forms + Sheets)
- `persona-content-creator` — Content creator (Docs + Slides + Drive + Gmail)
- `persona-event-coordinator` — Event coordinator (Calendar + Forms + Chat + Gmail)

## How to Use

1. Always load `gws-shared` first
2. Load only the core skills for the services you need
3. Load a recipe **or** persona if the task is high-level
4. Do NOT load recipes and personas simultaneously unless explicitly needed
