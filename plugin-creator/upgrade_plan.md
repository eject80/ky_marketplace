# plugin-creator 업그레이드 계획

작성일: 2026-03-11
현재 버전: 2.1.0
참고 문서: <https://code.claude.com/docs/ko/plugins> / <https://code.claude.com/docs/ko/plugins-reference>
이후 버전: 2.2.0 (Phase 1), 2.3.0 (Phase 2), 2.4.0 (Phase 3), 3.0.0 (Phase 4)
(반드시 단계별로 to_do_list.md를 만들어 업그레이드 진행할 것)

---

## 현재 상태 분석

### plugin-creator SKILL.md가 현재 지원하는 것

| 항목 | 상태 |
|-----|------|
| `plugin.json` 템플릿 | ✅ |
| `marketplace.json` 템플릿 (단독/묶음 패턴) | ✅ |
| `skills/[name]/SKILL.md` 템플릿 | ✅ |
| `commands/[name].md` 템플릿 | ✅ (기본) |
| `agents/[name].md` 템플릿 | ✅ (기본) |
| `hooks/hooks.json` 템플릿 | ✅ (기본) |
| `LICENSE` 템플릿 | ✅ |
| Skills flat 구조 규칙 | ✅ |
| 설치 명령어 안내 | ✅ |

### 공식 스펙 대비 누락된 것

#### 누락된 파일 유형 (공식 문서 확인됨)

| 항목 | 설명 | 우선순위 |
|-----|------|---------|
| `.mcp.json` | MCP 서버 구성 파일 | 높음 |
| `.lsp.json` | LSP 서버 구성 파일 | 낮음 (특수 용도) |
| `settings.json` (플러그인 루트) | 플러그인 활성화 시 기본 agent 설정 | 중간 |
| `CHANGELOG.md` | 버전 기록 파일 | 낮음 |
| `scripts/` 디렉토리 | hooks/MCP에서 실행할 스크립트 보관 | 중간 |

#### 기존 템플릿에서 불완전한 것

| 항목 | 현재 상태 | 필요한 것 |
|-----|---------|---------|
| `$ARGUMENTS` | 미언급 | skills/commands에서 사용자 인수 전달 방법 |
| `${CLAUDE_PLUGIN_ROOT}` | 미언급 | hooks/MCP 경로 참조 시 필수 환경변수 |
| hooks `type` | `command`만 있음 | `prompt`, `agent` 타입도 추가 |
| SKILL.md frontmatter | 기본만 있음 | `allowed-tools`, `disable-model-invocation` 옵션 완전화 |
| agents frontmatter | 기본만 있음 | `allowed-tools`, `model` 등 옵션 추가 |
| `reference.md` | 미언급 | SKILL.md 보조 파일 패턴 |
| commands vs skills 차이 | 미언급 | `commands/`는 레거시, `skills/`가 권장임을 명시 |

#### 디버깅/검증 가이드 부재

| 항목 | 필요 이유 |
|-----|---------|
| `claude plugin validate` 명령어 | JSON 구문 오류 사전 확인 |
| `claude --debug` 디버깅 방법 | 플러그인 로딩 문제 진단 |
| 일반적인 오류 메시지 해석 | 삽질 방지 |

---

## 업그레이드 계획

### Phase 1 — 누락 파일 템플릿 추가 (→ v2.2.0)

**목표**: 공식 스펙의 모든 파일 유형을 SKILL.md에서 생성 가능하게 한다.

추가할 템플릿:

**`.mcp.json`**

```json
{
  "mcpServers": {
    "plugin-서비스명": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/server-binary",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DATA_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    }
  }
}
```

**`settings.json` (플러그인 루트)**

```json
{
  "agent": "agent-name"
}
```

→ 플러그인 활성화 시 `agents/` 안의 특정 agent를 기본으로 실행

**`scripts/` 디렉토리 패턴**

- hooks에서 `"command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"` 형태로 참조
- 스크립트에 반드시 실행 권한 필요 (`chmod +x`)

**Validation Checklist 추가**

- `.mcp.json` 사용 시 `${CLAUDE_PLUGIN_ROOT}` 경로 사용 확인
- `hooks/` 스크립트 실행 권한 확인
- `settings.json`의 agent 이름이 `agents/` 폴더에 실제 존재하는지 확인

---

### Phase 2 — 기존 템플릿 개선 (→ v2.3.0)

**목표**: 현재 있는 템플릿들을 공식 스펙 수준으로 완전화한다.

#### `$ARGUMENTS` 패턴 추가

skills와 commands에서 사용자 인수 전달:

```markdown
# SKILL.md 예시
---
name: greet
description: 사용자에게 인사. 이름을 인수로 받는다.
---

"$ARGUMENTS"라는 이름으로 따뜻하게 인사하라.
```

호출: `/plugin-name:greet Alex`

#### `${CLAUDE_PLUGIN_ROOT}` 환경변수 명시

hooks와 MCP에서 경로 참조 시 필수. 절대경로 하드코딩 금지:

```json
{
  "hooks": {
    "PostToolUse": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
      }]
    }]
  }
}
```

#### hooks `type` 확장

현재 `command`만 있음. 추가:

```json
// type: prompt — LLM으로 평가
{ "type": "prompt", "prompt": "다음 변경사항을 검토하라: $ARGUMENTS" }

// type: agent — agent 검증자 실행
{ "type": "agent", "agent": "security-reviewer" }
```

#### SKILL.md frontmatter 완전화

```yaml
---
name: skill-name
description: "설명"
allowed-tools:
  - Read
  - Write
  - Bash
disable-model-invocation: true   # LLM 호출 없이 실행 (단순 안내용)
---
```

#### agents frontmatter 완전화

```markdown
---
name: agent-name
description: 이 에이전트의 역할과 언제 사용하는지
model: claude-opus-4-6           # 선택: 특정 모델 지정
allowed-tools:
  - Read
  - Write
  - Bash
---
```

#### `reference.md` 보조 파일 패턴

SKILL.md와 같은 폴더에 추가 참조 파일 배치 가능:

```
skills/
  my-skill/
    SKILL.md         ← 메인
    reference.md     ← Claude가 참조하는 추가 문서
    scripts/         ← 스크립트 (선택)
```

#### commands vs skills 차이 명시

| | `commands/` | `skills/` |
|---|---|---|
| 형태 | 단일 `.md` 파일 | `[name]/SKILL.md` 폴더 구조 |
| 상태 | 레거시 | 권장 (현재 표준) |
| 보조 파일 | 불가 | `reference.md`, `scripts/` 가능 |

→ **새 플러그인에는 항상 `skills/` 사용**

---

### Phase 3 — 디버깅/검증 가이드 추가 (→ v2.4.0)

**목표**: 생성 후 문제 진단을 SKILL.md 안에서 안내한다.

추가할 내용:

#### 검증 명령어

```bash
# JSON 구문 검증
claude plugin validate

# 디버그 모드로 로드 (플러그인 로딩 상세 로그)
claude --plugin-dir ./plugin-name --debug
```

#### 자주 발생하는 오류와 해결책

| 오류 | 원인 | 해결 |
|-----|------|------|
| 컴포넌트(commands/agents/hooks)가 안 보임 | `.claude-plugin/` 안에 폴더 넣음 | 플러그인 루트로 이동 |
| Skill이 로드 안 됨 | 중첩 폴더 구조 | flat 구조로 변경 |
| Hook 스크립트 실행 안 됨 | 실행 권한 없음 | `chmod +x ./scripts/script.sh` |
| MCP 서버 경로 오류 | 절대경로 사용 | `${CLAUDE_PLUGIN_ROOT}` 사용 |
| 업데이트 후 반영 안 됨 | version 미증가 | `plugin.json` version 증가 필수 |

---

### Phase 4 — 복합 플러그인 예시 추가 (→ v3.0.0)

**목표**: 여러 컴포넌트가 조합된 실전 예시를 SKILL.md에 추가한다.

추가할 예시:

1. **skills + hooks 조합** — 코드 작성 후 자동 포맷팅
2. **agents + settings.json** — 플러그인 활성화 시 특정 agent 기본 실행
3. **skills + .mcp.json** — 외부 API 연동이 필요한 skill

---

## 버전 로드맵

| 버전 | 주요 변경 | 작업량 |
|-----|---------|------|
| 2.1.0 | 현재 (단독/묶음 패턴, 버전 독립화) | — |
| 2.2.0 | Phase 1: `.mcp.json`, `settings.json`, `scripts/` 템플릿 추가 | 소 |
| 2.3.0 | Phase 2: `$ARGUMENTS`, `${CLAUDE_PLUGIN_ROOT}`, hooks 확장, frontmatter 완전화 | 중 |
| 2.4.0 | Phase 3: 디버깅/검증 가이드, 오류 해결 테이블 | 소 |
| 3.0.0 | Phase 4: 복합 플러그인 예시, 전체 구조 재검토 | 대 |

---

## 작업 방법

각 Phase 작업 시:

1. Claude Code에서 `plugin-creator` skill이 활성화된 상태로 대화 시작
2. "plugin-creator SKILL.md를 v2.2.0으로 업그레이드해줘. Phase 1 항목 적용" 식으로 요청
3. 수정 완료 후 `plugin.json`과 루트 `marketplace.json`의 version 증가
4. `/plugin marketplace update ky-marketplace` → `/plugin update plugin-creator@ky-marketplace`

---

## 참고: 공식 플러그인 구조 전체

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json
├── commands/            ← 레거시 slash commands (.md 파일)
├── skills/              ← 권장 slash commands (폴더/SKILL.md)
│   └── [name]/
│       ├── SKILL.md
│       ├── reference.md (선택)
│       └── scripts/ (선택)
├── agents/              ← subagent 정의 (.md 파일)
├── hooks/
│   └── hooks.json
├── scripts/             ← hooks/MCP에서 실행하는 스크립트
├── settings.json        ← 플러그인 기본 설정 (agent 지정)
├── .mcp.json            ← MCP 서버 구성
├── .lsp.json            ← LSP 서버 구성 (특수 용도)
├── README.md
├── CHANGELOG.md
└── LICENSE
```
