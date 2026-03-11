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

### Raw API Commands

`gws schema`로 파라미터를 확인하고 `--params`를 명시적으로 구성한다.
helper command로 불가능한 세밀한 제어가 필요할 때 사용한다.

```bash
# 1단계: schema 확인 (모든 플랫폼 가능)
gws schema gmail.users.messages.list

# 2단계: 호출 (userId는 반드시 명시)
# bash/zsh
gws gmail users messages list --params '{"userId":"me","maxResults":5}'
# Windows PowerShell — 직접 리터럴 방식
gws gmail users messages list --params '{\"userId\":\"me\",\"maxResults\":5}'
```

> 자세한 플랫폼별 차이는 `gws-shared` → **Platform Notes** 참조.

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

## Raw API 예시

> **플랫폼 참고:** bash/zsh는 작은따옴표 그대로 사용. Windows PowerShell은 `'{\"...\"}'` 직접 리터럴 방식으로 대체한다.

### messages.list — 최근 메일 목록

```bash
gws gmail users messages list \
  --params '{"userId":"me","maxResults":5,"q":"is:unread"}'
```

응답에는 `id`와 `threadId`만 포함된다. 본문은 `messages.get`으로 개별 조회한다.

### messages.get — 메일 상세 조회

```bash
# format=full: 전체 페이로드 (기본값)
gws gmail users messages get \
  --params '{"userId":"me","id":"MESSAGE_ID","format":"full"}'

# format=metadata: 전체 헤더 조회 (권장)
gws gmail users messages get \
  --params '{"userId":"me","id":"MESSAGE_ID","format":"metadata"}'
```

> **metadataHeaders 알려진 제한사항:** `metadataHeaders` 파라미터로 헤더를 필터링하는 기능은
> 현재 gws CLI에서 동작하지 않는다. JSON 배열(`["From","Subject"]`)과 쉼표 문자열
> (`"From,Subject"`) 모두 `payload.headers` 필드 자체가 응답에서 사라지는 결과가 나온다.
>
> **대안:** `format=metadata` 단독 사용으로 전체 헤더를 받은 뒤, 필요한 헤더를 클라이언트
> 측에서 필터링한다.

### getProfile — 내 계정 정보

```bash
gws gmail users getProfile --params '{"userId":"me"}' --format json
```

