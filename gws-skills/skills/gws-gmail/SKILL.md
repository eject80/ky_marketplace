---
name: gws-gmail
version: 1.0.0
description: "Gmail: Send, read, and manage email."
metadata:
  openclaw:
    category: "productivity"
    requires:
      bins: ["gws"]
    cliHelp: "gws gmail --help"
---

# gmail (v1)

> **PREREQUISITE:** Read `../gws-shared/SKILL.md` for auth, global flags, and security rules. If missing, run `gws generate-skills` to create it.

```bash
gws gmail <resource> <method> [flags]
```

## 중요 규칙

### userId는 항상 명시할 것

raw API 명령에서 `userId` 경로 파라미터는 스키마상 기본값(`me`)이 있더라도
CLI가 자동으로 채워주지 않는다. **항상 `--params`에 `"userId":"me"`를 포함시켜야 한다.**

```bash
# ❌ 실패 — userId 누락
gws gmail users getProfile --format json
# Error: Required path parameter userId is missing. Provide it via --params

# ✅ 성공 — userId 명시
gws gmail users getProfile --params '{"userId":"me"}' --format json
```

이 규칙은 아래 모든 raw API 메서드에 적용된다:
- `users getProfile`
- `users messages list`
- `users messages get`
- `users messages send`
- `users threads list`
- `users labels list`
- 기타 `users` 하위 리소스 전체

## Helper Commands

| Command | Description |
|---------|-------------|
| [`+send`](../gws-gmail-send/SKILL.md) | Send an email |
| [`+triage`](../gws-gmail-triage/SKILL.md) | Show unread inbox summary (sender, subject, date) |
| [`+watch`](../gws-gmail-watch/SKILL.md) | Watch for new emails and stream them as NDJSON |

## API Resources

### users

  - `getProfile` — Gets the current user's Gmail profile.
  - `stop` — Stop receiving push notifications for the given user mailbox.
  - `watch` — Set up or update a push notification watch on the given user mailbox.
  - `drafts` — Operations on the 'drafts' resource
  - `history` — Operations on the 'history' resource
  - `labels` — Operations on the 'labels' resource
  - `messages` — Operations on the 'messages' resource
  - `settings` — Operations on the 'settings' resource
  - `threads` — Operations on the 'threads' resource

## Discovering Commands

Before calling any API method, inspect it:

```bash
# Browse resources and methods
gws gmail --help

# Inspect a method's required params, types, and defaults
gws schema gmail.<resource>.<method>
```

Use `gws schema` output to build your `--params` and `--json` flags.

