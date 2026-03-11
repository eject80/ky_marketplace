# gws-skills Gmail 문서 개선 구현 계획

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 실제 테스트에서 발견된 문제들을 SKILL.md 문서에 정확하게 반영한다. 특히 Windows PowerShell + raw `--params` 조합이 현재 gws CLI에서 동작하지 않는다는 사실을 "우회법 제시"가 아니라 "알려진 제한사항"으로 명확히 문서화한다.

**Architecture:** `gws-shared`에 Windows 제한사항 경고를 추가하고, `gws-gmail`에 세 가지 보강(userId 명시 규칙 / helper vs raw 구분 강화 / Raw API 예시 정정)을 한다. 코드 변경 없이 SKILL.md 문서만 수정한다.

**Tech Stack:** Markdown (SKILL.md), YAML front matter

**테스트 결과 요약 (계획 근거):**

| 시도 | 결과 |
|------|------|
| `--params '{\"key\":\"val\"}'` (백슬래시 이스케이프) | ❌ 실패 |
| 히어-스트링 `@' '@` 사용 | ❌ 실패 |
| `--%` stop-parsing | ❌ 실패 |
| 백틱 이스케이프 | ❌ 실패 |
| `cmd /c` 우회 | ❌ 실패 |
| `gws gmail +triage --max 5` (helper command) | ✅ 성공 |
| `format=metadata` 단독 사용 (전체 헤더 반환) | ✅ 성공 |
| `metadataHeaders` JSON 배열 지정 | ❌ headers 필드 자체 소멸 |
| `metadataHeaders` 쉼표 문자열 지정 | ❌ headers 필드 자체 소멸 |

**결론:**

- Windows PowerShell에서 raw `--params` / `--json`은 현재 gws CLI와 호환되지 않는다. 우회법이 없으므로 "제한사항"으로 문서화하고, 대안(helper command 또는 Git Bash/WSL)을 안내한다.
- `metadataHeaders` 파라미터는 JSON 배열도, 쉼표 문자열도 모두 동작하지 않는다. `format=metadata` 단독 사용 후 클라이언트에서 필터링하는 것이 유일한 대안이다.
- `+reply`, `+reply-all`, `+forward` helper 3개가 현재 SKILL.md에 누락되어 있다.

---

## 수정 파일 목록

| 파일 | 변경 유형 | 이유 |
|------|-----------|------|
| `gws-skills/skills/gws-shared/SKILL.md` | 수정 | Windows 제한사항 경고 추가 (전역 적용) |
| `gws-skills/skills/gws-gmail/SKILL.md` | 수정 | userId 명시 규칙 + helper/raw 구분 강화 + Raw API 예시 정정 + 누락 helper 3개 추가 |
| `gws-skills/.claude-plugin/plugin.json` | 수정 | 버전 1.0.1 → 1.0.2 |
| `gws-skills/.claude-plugin/marketplace.json` | 수정 | 버전 1.0.1 → 1.0.2 |

---

## Chunk 1: gws-shared — Windows 제한사항 경고 추가

### Task 1: gws-shared에 Platform Notes 섹션 추가

**Files:**

- Modify: `gws-skills/skills/gws-shared/SKILL.md`

**배경:** Windows PowerShell에서 이스케이프, 히어-스트링, `--%`, `cmd /c` 등 모든 방법을 시도했지만 raw `--params` 전달은 계속 실패했다. 따라서 "이렇게 하면 된다"는 우회법이 아니라, 동작하지 않는다는 사실과 올바른 대안을 명시한다.

- [ ] **Step 1: gws-shared SKILL.md를 열고 `## Security Rules` 바로 위에 `## Platform Notes` 섹션 삽입**

삽입할 내용:

```markdown
## Platform Notes

### Windows PowerShell — 알려진 제한사항

> [!WARNING]
> **Windows PowerShell에서 raw `--params` / `--json` 호출은 현재 gws CLI와 호환되지 않는다.**
>
> 이스케이프(`\"`), 히어-스트링(`@' '@`), `--%` stop-parsing, 백틱, `cmd /c` 우회 등
> 모든 방법이 동일한 JSON 파싱 오류를 반환한다.

**Windows에서 권장하는 대안:**

1. **helper command 사용** (가장 빠름)
   ```powershell
   gws gmail +triage --max 5
   gws calendar +agenda
   ```

   helper command는 `--params`가 필요 없어서 PowerShell에서도 정상 동작한다.

1. **Git Bash 또는 WSL 사용** (raw API가 꼭 필요할 때)

   ```bash
   # Git Bash / WSL bash 안에서
   gws gmail users messages list --params '{"userId":"me","maxResults":5}'
   ```

### bash / zsh (Linux · macOS · Git Bash · WSL)

```bash
gws gmail users getProfile --params '{"userId":"me"}'
```

작은따옴표로 감싸면 이스케이프 없이 전달된다.

```

- [ ] **Step 2: 삽입 결과 확인**

`gws-shared/SKILL.md`를 열어서:
- `## Platform Notes`가 `## Security Rules` 위에 있는지 확인
- `[!WARNING]` callout이 있는지 확인
- helper command와 Git Bash/WSL 두 가지 대안이 모두 있는지 확인

- [ ] **Step 3: Commit**

```bash
git add gws-skills/skills/gws-shared/SKILL.md
git commit -m "docs(gws-shared) :: Windows PowerShell raw params 제한사항 및 대안 추가"
```

---

## Chunk 2: gws-gmail — userId 명시 규칙 + helper/raw 구분 + Raw API 예시 정정

### Task 2: userId 명시 규칙 추가

**Files:**

- Modify: `gws-skills/skills/gws-gmail/SKILL.md`

**배경:** `gws gmail users getProfile` 호출 시 스키마상 `userId`의 기본값이 `me`로 표시되어 있어도, 실제 CLI는 path parameter를 자동 보정하지 않는다. `--params '{"userId":"me"}'`를 생략하면 `Required path parameter userId is missing` 오류가 발생한다.

- [ ] **Step 1: gws-gmail SKILL.md에서 PREREQUISITE 노트 바로 아래에 `## 중요 규칙` 섹션 추가**

```markdown
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

```

- [ ] **Step 2: 확인**

`gws-gmail/SKILL.md`를 열어서 `## 중요 규칙` 섹션이 PREREQUISITE 노트 바로 아래에 있는지 확인한다.

- [ ] **Step 3: Commit**

```bash
git add gws-skills/skills/gws-gmail/SKILL.md
git commit -m "docs(gws-gmail) :: userId 명시 규칙 추가"
```

---

### Task 3: helper command vs raw API command 구분 섹션 강화

**Files:**

- Modify: `gws-skills/skills/gws-gmail/SKILL.md`

**배경:** helper command(`+triage`)는 PowerShell 포함 모든 환경에서 즉시 성공했지만, raw API command는 bash/zsh 환경에서만 안정적으로 동작한다. 이 차이를 문서에 명확히 반영해야 한다.

- [ ] **Step 1: `## Helper Commands` 섹션을 아래 내용으로 교체**

기존:

```markdown
## Helper Commands

| Command | Description |
|---------|-------------|
| [`+send`](../gws-gmail-send/SKILL.md) | Send an email |
| [`+triage`](../gws-gmail-triage/SKILL.md) | Show unread inbox summary (sender, subject, date) |
| [`+watch`](../gws-gmail-watch/SKILL.md) | Watch for new emails and stream them as NDJSON |
```

교체 내용:

```markdown
## 명령어 유형 선택 가이드

### Helper Commands — 모든 플랫폼에서 바로 사용 가능

복잡한 플래그가 필요 없고, Windows PowerShell 포함 모든 환경에서 정상 동작한다.
**가능하면 helper command를 먼저 사용한다.**

| Command | Description |
|---------|-------------|
| [`+send`](../gws-gmail-send/SKILL.md) | 이메일 보내기 |
| [`+triage`](../gws-gmail-triage/SKILL.md) | 수신함 요약 (발신자, 제목, 날짜) |
| [`+watch`](../gws-gmail-watch/SKILL.md) | 새 메일 스트리밍 (NDJSON) |

```bash
# Windows PowerShell / bash / zsh 모두 동작
gws gmail +triage --max 5
gws gmail +triage --query 'from:boss' --format json
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

```

- [ ] **Step 2: 확인**

`gws-gmail/SKILL.md`를 열어서:
- `## 명령어 유형 선택 가이드` 섹션이 있는지 확인
- helper 섹션에 "모든 플랫폼" 언급이 있는지 확인
- raw 섹션에 `[!WARNING]` PowerShell 경고가 있는지 확인

- [ ] **Step 3: Commit**

```bash
git add gws-skills/skills/gws-gmail/SKILL.md
git commit -m "docs(gws-gmail) :: helper vs raw API 구분 강화, PowerShell 제한사항 명시"
```

---

### Task 4: Raw API 예시 섹션 추가 (metadataHeaders 제한사항 포함)

**Files:**

- Modify: `gws-skills/skills/gws-gmail/SKILL.md`

**배경:** 테스트 결과 `metadataHeaders` 파라미터는 JSON 배열과 쉼표 문자열 모두 동작하지 않는다. 두 방식 모두 `payload.headers` 필드 자체가 사라지는 결과가 나왔다. 반면 `format=metadata`를 단독으로 사용하면 전체 헤더가 정상 반환된다. 따라서 `metadataHeaders`를 "사용법 안내" 대신 "알려진 제한사항"으로 문서화하고, `format=metadata` 단독 사용을 권장한다.

- [ ] **Step 1: `## API Resources` 섹션 아래에 `## Raw API 예시 (bash/zsh)` 섹션 추가**

```markdown
## Raw API 예시 (bash/zsh)

> **Windows PowerShell 사용자:** 아래 예시는 bash/zsh 전용이다.
> PowerShell에서는 helper command(`+triage`, `+send` 등)를 사용한다.

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

```

- [ ] **Step 2: 확인**

`gws-gmail/SKILL.md`를 열어서:
- 섹션 제목에 `(bash/zsh)` 명시가 있는지 확인
- `messages.list`, `messages.get`, `getProfile` 예시가 모두 있는지 확인
- `metadataHeaders` 제한사항 callout이 있는지 확인 (`metadataHeaders` 동작 안 함 명시)
- `format=metadata` 단독 사용 권장이 명시됐는지 확인
- PowerShell 예시가 없는지 확인 (없어야 정상)

- [ ] **Step 3: Commit**

```bash
git add gws-skills/skills/gws-gmail/SKILL.md
git commit -m "docs(gws-gmail) :: raw API 예시 추가, metadataHeaders 제한사항 명시 (bash/zsh 전용)"
```

---

### Task 5: 누락된 helper command 3개 추가

**Files:**

- Modify: `gws-skills/skills/gws-gmail/SKILL.md`

**배경:** `gws gmail --help` 실행 결과, `+reply`, `+reply-all`, `+forward` 3개 helper가 존재하지만 현재 SKILL.md의 helper 목록에 없다. 실제 동작이 확인된 명령어이므로 문서에 추가한다.

- [ ] **Step 1: Task 3에서 교체한 `## 명령어 유형 선택 가이드` 섹션의 helper 테이블을 아래로 교체**

기존:

```markdown
| Command | Description |
|---------|-------------|
| [`+send`](../gws-gmail-send/SKILL.md) | 이메일 보내기 |
| [`+triage`](../gws-gmail-triage/SKILL.md) | 수신함 요약 (발신자, 제목, 날짜) |
| [`+watch`](../gws-gmail-watch/SKILL.md) | 새 메일 스트리밍 (NDJSON) |
```

교체 내용:

```markdown
| Command | Description |
|---------|-------------|
| [`+send`](../gws-gmail-send/SKILL.md) | 이메일 보내기 |
| [`+triage`](../gws-gmail-triage/SKILL.md) | 수신함 요약 (발신자, 제목, 날짜) |
| [`+reply`](../gws-gmail-reply/SKILL.md) | 메시지에 답장 (스레딩 자동 처리) |
| [`+reply-all`](../gws-gmail-reply-all/SKILL.md) | 전체 답장 |
| [`+forward`](../gws-gmail-forward/SKILL.md) | 메시지 전달 |
| [`+watch`](../gws-gmail-watch/SKILL.md) | 새 메일 스트리밍 (NDJSON) |
```

- [ ] **Step 2: 확인**

`gws-gmail/SKILL.md`를 열어서:

- helper 테이블에 6개 항목이 모두 있는지 확인
- `+reply`, `+reply-all`, `+forward`가 포함됐는지 확인

- [ ] **Step 3: Commit**

```bash
git add gws-skills/skills/gws-gmail/SKILL.md
git commit -m "docs(gws-gmail) :: 누락 helper +reply, +reply-all, +forward 추가"
```

---

## Chunk 3: 버전 범프

### Task 6: plugin.json 및 marketplace.json 버전 업데이트

**Files:**

- Modify: `gws-skills/.claude-plugin/plugin.json`
- Modify: `gws-skills/.claude-plugin/marketplace.json`

**배경:** SKILL.md 2개 파일이 변경됐으므로 플러그인 버전을 1.0.1 → 1.0.2로 올린다.

- [ ] **Step 1: plugin.json 버전 변경**

`"version": "1.0.1"` → `"version": "1.0.2"`

- [ ] **Step 2: marketplace.json 버전 변경**

`"version": "1.0.1"` → `"version": "1.0.2"`

- [ ] **Step 3: 확인**

두 파일 모두 `1.0.2`인지 확인한다.

- [ ] **Step 4: Commit**

```bash
git add gws-skills/.claude-plugin/plugin.json gws-skills/.claude-plugin/marketplace.json
git commit -m "chore(gws-skills) :: 버전 1.0.1 → 1.0.2"
```

---

## 수정 요약

| 문제 | 기존 계획 | 최종 계획 |
|------|-----------|-----------|
| PowerShell raw `--params` 실패 | 3가지 우회법 제시 | 알려진 제한사항으로 문서화, 대안(helper/Git Bash) 안내 |
| `userId` 기본값 미적용 오류 | 중요 규칙 섹션 추가 | 동일 (변경 없음) |
| helper vs raw 혼동 | 두 경로 구분 | 강화: helper = 모든 플랫폼, raw = bash/zsh 전용으로 명시 |
| `metadataHeaders` 동작 안 함 | 배열/쉼표 형식 제시 | 알려진 제한사항으로 문서화, `format=metadata` 단독 사용 권장 |
| helper 3개 누락 (`+reply` 등) | (미포함) | `+reply`, `+reply-all`, `+forward` helper 테이블에 추가 |
