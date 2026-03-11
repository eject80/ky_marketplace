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

## 명령어 유형 선택 가이드

### Helper Commands — 모든 플랫폼에서 바로 사용 가능

복잡한 플래그가 필요 없고, Windows PowerShell 포함 모든 환경에서 정상 동작한다.
**가능하면 helper command를 먼저 사용한다.**

| Command | Description |
|---------|-------------|
| [`+send`](../gws-gmail-send/SKILL.md) | 이메일 보내기 |
| [`+triage`](../gws-gmail-triage/SKILL.md) | 수신함 요약 (발신자, 제목, 날짜) |
| `+reply` | 메시지에 답장 (스레딩 자동 처리) |
| `+reply-all` | 전체 답장 |
| `+forward` | 메시지 전달 |
| [`+watch`](../gws-gmail-watch/SKILL.md) | 새 메일 스트리밍 (NDJSON) |

```bash
# Windows PowerShell / bash / zsh 모두 동작
gws gmail +triage --max 5
gws gmail +triage --query 'from:boss' --format json
gws gmail +reply --message-id MESSAGE_ID --body 'Thanks!'
gws gmail +forward --message-id MESSAGE_ID --to someone@example.com
```

### Raw API Commands — bash / zsh 전용

`gws schema`로 파라미터를 확인하고 `--params`를 명시적으로 구성한다.
helper command로 불가능한 세밀한 제어가 필요할 때 사용한다.

> [!WARNING]
> **Windows PowerShell에서는 raw API `--params` 호출이 동작하지 않는다.**
> Git Bash 또는 WSL을 사용하거나, helper command로 대체한다.
> 자세한 내용은 `gws-shared` → **Platform Notes** 참조.

```bash
# 1단계: schema 확인 (모든 플랫폼 가능)
gws schema gmail.users.messages.list

# 2단계: bash/zsh에서 호출 (userId는 반드시 명시)
gws gmail users messages list --params '{"userId":"me","maxResults":5}'
```

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

