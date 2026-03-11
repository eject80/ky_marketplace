---
description: Creates Claude Code plugins with correct structure, validation, and marketplace integration. Use when user wants to create a plugin, scaffold a new plugin, or set up a plugin marketplace.
allowed-tools:
- Write
- Read
- Grep
- Glob
- Bash
name: plugin-creator
license: MIT
---

# Plugin Creator

## Purpose
Scaffolds production-ready Claude Code plugins with complete directory structure, required files, and proper formatting — based on the official Claude Code plugin spec.

## Trigger Keywords
- "create plugin" / "new plugin" / "make plugin"
- "plugin from template" / "scaffold plugin" / "generate plugin"
- "plugin marketplace" / "publish plugin"

---

## Concepts: Plugin vs Standalone

| | Standalone (`.claude/`) | Plugin |
|---|---|---|
| **목적** | 개인/단일 프로젝트 | 팀 공유, 마켓플레이스 배포 |
| **위치** | 프로젝트 `.claude/` 폴더 | 독립 디렉토리 |
| **배포** | 직접 사용 | 마켓플레이스로 설치 |
| **버전 관리** | 없음 | `version` 필드로 관리 |

---

## Plugin Creation Process

### Step 1: Gather Requirements
사용자에게 다음을 확인한다:
1. **플러그인 이름** (kebab-case, 예: `my-plugin`)
2. **플러그인 유형**: skills / commands / agents / hooks / MCP / 복합
3. **설명** (한두 문장)
4. **키워드** (검색용 태그, 3-5개)
5. **작성자 이름** (email, url은 선택사항)
6. **라이선스** (기본값: MIT)

### Step 2: Create Directory Structure

**패턴 A — 단독 배포** (플러그인 하나가 독립 마켓플레이스):
```
[plugin-name]/
├── .claude-plugin/
│   ├── plugin.json          ← 플러그인 매니페스트
│   └── marketplace.json     ← source: "./" (자기 참조)
├── skills/
│   └── [skill-name]/
│       └── SKILL.md
├── README.md
└── LICENSE
```

**패턴 B — 묶음 배포** (상위 마켓플레이스가 여러 플러그인 관리):
```
[marketplace-root]/
├── .claude-plugin/
│   └── marketplace.json     ← 모든 플러그인 목록, source: "./plugin-name"
├── [plugin-name]/
│   ├── .claude-plugin/
│   │   └── plugin.json      ← marketplace.json 없어도 됨
│   ├── skills/
│   │   └── [skill-name]/
│   │       └── SKILL.md
│   ├── README.md
│   └── LICENSE
└── [another-plugin]/
    └── ...
```

> 두 패턴을 혼합할 수도 있다: 개별 플러그인에도 `marketplace.json`을 두면 단독/묶음 모두 지원.

### Step 3: Generate Files (see templates below)

### Step 4: Validate
생성 후 아래 체크리스트를 반드시 확인한다.

### Step 5: Report & Guide
설치 방법과 다음 단계를 안내한다.

---

## File Templates

### plugin.json (`.claude-plugin/plugin.json`)

`name` 만 필수. 나머지는 선택사항이지만 배포 시 권장한다.

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "플러그인 설명",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin-name",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"]
}
```

> ⚠️ `repository` 필드는 실제 공개 GitHub 저장소가 있을 때만 포함한다.
> 로컬 전용 플러그인에는 제거한다.

**컴포넌트 경로 커스터마이징** (기본 디렉토리명과 다를 때만 필요):
```json
{
  "name": "plugin-name",
  "skills": "./custom-skills-dir/",
  "commands": "./custom-commands-dir/",
  "agents": "./custom-agents-dir/",
  "hooks": "./config/hooks.json",
  "mcpServers": "./.mcp.json",
  "lspServers": "./.lsp.json"
}
```

---

### marketplace.json (`.claude-plugin/marketplace.json`)

로컬 설치(`/plugin marketplace add`)에 필요하다. 패턴에 따라 구조가 다르다.

**패턴 A — 단독 배포** (`source: "./"`, 플러그인 폴더에 위치):
```json
{
  "name": "plugin-name",
  "owner": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./",
      "description": "플러그인 설명",
      "version": "1.0.0"
    }
  ]
}
```

**패턴 B — 묶음 배포** (`source: "./plugin-name"`, 상위 루트에 위치):
```json
{
  "name": "local-marketplace",
  "owner": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "plugins": [
    {
      "name": "plugin-one",
      "source": "./plugin-one",
      "description": "첫 번째 플러그인",
      "version": "1.0.0"
    },
    {
      "name": "plugin-two",
      "source": "./plugin-two",
      "description": "두 번째 플러그인",
      "version": "2.0.0"
    }
  ]
}
```

> ⚠️ 각 플러그인의 버전은 독립적이다. `plugins[].version`은 해당 플러그인 `plugin.json`의 `version`과 일치시킨다. 다른 플러그인의 버전은 건드리지 않는다.

---

### SKILL.md (`skills/[skill-name]/SKILL.md`)

```markdown
---
name: skill-name
description: "무엇을 하는지 AND 언제 사용하는지 명확히 기술"
---

# Skill Name

[Claude에게 주는 지시사항]
```

**선택적 frontmatter 필드:**
```yaml
---
name: skill-name
description: "설명"
allowed-tools:
  - Read
  - Write
  - Bash
disable-model-invocation: true   # LLM 호출 없이 실행
---
```

---

### Command Template (`commands/[command-name].md`)

```markdown
---
name: command-name
description: 이 명령이 하는 일
---

# Command Title

Instructions for Claude...

$ARGUMENTS 로 사용자 인자 참조 가능.
```

---

### Agent Template (`agents/[agent-name].md`)

```markdown
---
name: agent-name
description: 이 에이전트의 역할과 언제 사용하는지
allowed-tools:
  - Read
  - Write
  - Bash
---

# Agent Name

[에이전트 동작 지시사항]
```

---

### Hooks Template (`hooks/hooks.json`)

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
        }
      ]
    }
  ]
}
```

**사용 가능한 Hook 이벤트:**
- `PreToolUse` / `PostToolUse` / `PostToolUseFailure`
- `PermissionRequest`
- `UserPromptSubmit`
- `Notification`
- `Stop`
- `SubagentStart` / `SubagentStop`
- `SessionStart` / `SessionEnd`
- `TaskCompleted`
- `PreCompact`

---

### LICENSE (MIT 기본값)

```
MIT License

Copyright (c) [YEAR] [Author Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Skills Directory Structure (CRITICAL)

Claude Code는 `skills/[skill-name]/SKILL.md` 형태만 인식한다.
중간에 카테고리 폴더를 끼우면 스킬이 로드되지 않는다.

✅ **올바른 구조:**
```
skills/
  gws-gmail/
    SKILL.md
  gws-calendar/
    SKILL.md
  recipe-find-free-time/
    SKILL.md
```

❌ **작동 안 되는 구조:**
```
skills/
  core/
    gws-gmail/
      SKILL.md
  recipes/
    recipe-find-free-time/
      SKILL.md
```

스킬이 많아 카테고리가 필요하면 **이름 접두사**를 사용한다:
- `gws-gmail`, `gws-calendar` (서비스 접두사)
- `recipe-find-free-time`, `recipe-send-email` (기능 접두사)
- `persona-exec-assistant`, `persona-researcher` (페르소나 접두사)

---

## Plugin Source Types (marketplace.json)

마켓플레이스에서 플러그인 소스를 다양하게 지정할 수 있다.

**로컬 경로:**
```json
{ "source": "./" }
{ "source": "./plugins/my-plugin" }
```

**GitHub:**
```json
{
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo",
    "ref": "v1.0.0",
    "sha": "a1b2c3d4..."
  }
}
```

**Git URL:**
```json
{
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git",
    "ref": "main"
  }
}
```

**npm 패키지:**
```json
{
  "source": {
    "source": "npm",
    "package": "@acme/claude-plugin",
    "version": "2.1.0"
  }
}
```

**pip 패키지:**
```json
{
  "source": {
    "source": "pip",
    "package": "acme-claude-plugin",
    "version": "2.1.0"
  }
}
```

---

## Installation & Testing Guide

플러그인 생성 후 반드시 다음 안내를 제공한다.

### 1. 개발 중 즉시 테스트 (설치 불필요)
```bash
claude --plugin-dir ./plugin-name
```
플래그를 붙일 때마다 해당 플러그인만 임시 로드. 영구 설치 없이 빠르게 확인 가능.

### 2. 로컬 마켓플레이스 등록 + 영구 설치

**패턴 A — 단독 배포** (플러그인 폴더를 마켓플레이스로 등록):
```
/plugin marketplace add /절대/경로/plugin-name
/plugin install plugin-name@plugin-name
```

**패턴 B — 묶음 배포** (상위 루트를 마켓플레이스로 등록):
```
/plugin marketplace add /절대/경로/marketplace-root
/plugin install plugin-one@local-marketplace
/plugin install plugin-two@local-marketplace
```

또는 CLI에서:
```bash
claude plugin install plugin-name@marketplace-name --scope user
```

**설치 범위:**
| 범위 | 설정 위치 | 사용 사례 |
|------|---------|--------|
| `user` (기본) | `~/.claude/settings.json` | 모든 프로젝트에서 사용 |
| `project` | `.claude/settings.json` | 팀과 공유 (git에 커밋) |
| `local` | `.claude/settings.json.local` | 프로젝트별, git 제외 |

### 3. 업데이트 배포

1. 소스 파일 수정
2. `plugin.json`과 `marketplace.json`의 `version` 동시 업그레이드 (예: `1.0.0` → `1.0.1`)
3. Claude Code에서:
   ```
   /plugin marketplace update plugin-name
   /plugin update plugin-name@plugin-name
   ```

### 4. 플러그인 관리 명령어
```
/plugin                                   # UI로 관리
/plugin install plugin-name@marketplace   # 설치
/plugin uninstall plugin-name@marketplace # 제거
/plugin enable plugin-name@marketplace    # 활성화
/plugin disable plugin-name@marketplace   # 비활성화
/plugin update plugin-name@marketplace    # 업데이트
/plugin marketplace add <path|url|repo>   # 마켓플레이스 등록
/plugin marketplace update <name>         # 마켓플레이스 목록 갱신
/plugin marketplace remove <name>         # 마켓플레이스 제거
```

---

## Validation Checklist

생성 완료 후 반드시 확인:

- ✅ `.claude-plugin/plugin.json` 존재하고 JSON 문법 유효
- ✅ `.claude-plugin/plugin.json` `name` 필드 존재 (유일한 필수 필드)
- ✅ `marketplace.json` JSON 문법 유효
- ✅ `marketplace.json`에서 해당 플러그인 항목의 `version`이 그 `plugin.json`의 `version`과 일치 (플러그인마다 독립적으로 관리)
- ✅ `marketplace.json` `plugins[].source`: 단독 배포 시 `"./"`, 묶음 배포 시 `"./plugin-name"`
- ✅ `plugin.json`에 `repository` 미포함 (공개 저장소 없을 때)
- ✅ Skills는 `skills/[name]/SKILL.md` flat 구조 (중첩 금지)
- ✅ 모든 `SKILL.md` 파일명 대문자
- ✅ `README.md` 존재
- ✅ `LICENSE` 존재

---

## Output Format

완료 시 다음 형식으로 보고:
```
✅ 생성 완료: plugin-name
📁 위치: /path/to/plugin-name/
📝 생성 파일: N개
🔍 검증: PASSED

다음 단계:
1. 테스트: claude --plugin-dir ./plugin-name
2. 마켓플레이스 등록: /plugin marketplace add /절대/경로/plugin-name
3. 설치: /plugin install plugin-name@plugin-name
```

---

## Example Walkthrough

**사용자:** "gws-tools라는 Skills 플러그인 만들어줘. 작성자는 홍길동, 이메일은 hong@example.com"

**실행 순서:**

1. 아래 파일 생성:
   ```
   gws-tools/
   ├── .claude-plugin/
   │   ├── plugin.json
   │   └── marketplace.json
   ├── skills/
   │   └── gws-example/
   │       └── SKILL.md
   ├── README.md
   └── LICENSE
   ```

2. `plugin.json`:
   ```json
   {
     "name": "gws-tools",
     "version": "1.0.0",
     "description": "Google Workspace tools for Claude Code",
     "author": {
       "name": "홍길동",
       "email": "hong@example.com"
     },
     "license": "MIT",
     "keywords": ["google-workspace", "productivity"]
   }
   ```

3. `marketplace.json`:
   ```json
   {
     "name": "gws-tools",
     "owner": {
       "name": "홍길동",
       "email": "hong@example.com"
     },
     "plugins": [
       {
         "name": "gws-tools",
         "source": "./",
         "description": "Google Workspace tools for Claude Code",
         "version": "1.0.0"
       }
     ]
   }
   ```

4. 검증 체크리스트 실행
5. 설치 방법 안내

---

## Common Mistakes to Avoid

1. ❌ `marketplace.json`에 절대 경로 사용 (`source: "/absolute/path"`)
   → 다른 컴퓨터에서 작동 안 함. 단독 배포는 `"./"`, 묶음 배포는 `"./plugin-name"` 사용.

2. ❌ `plugin.json`과 `marketplace.json` 해당 플러그인 항목의 `version` 불일치
   → 수정한 플러그인의 `plugin.json`과 `marketplace.json` 해당 항목을 같은 값으로 맞춘다. 다른 플러그인 버전은 건드리지 않는다.

3. ❌ Skills를 `skills/category/skill-name/SKILL.md` 처럼 중첩
   → `skills/skill-name/SKILL.md` flat 구조만 인식.

4. ❌ 없는 GitHub 저장소를 `repository` 필드에 추가
   → 공개 저장소가 실제로 있을 때만 추가.

5. ❌ `SKILL.md` 파일명 소문자로 저장 (`skill.md`)
   → 반드시 대문자 `SKILL.md`.
