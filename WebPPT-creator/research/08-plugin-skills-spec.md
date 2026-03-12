# Claude Code Plugin & Skills 공식 스펙

WebPPT-creator 플러그인 제작 과정에서 조사한 Claude Code 공식 스킬 명세.
출처: https://code.claude.com/docs (Skills 문서)

---

## 플러그인 디렉토리 구조

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # 필수: 플러그인 매니페스트
├── commands/                 # 슬래시 커맨드 (.md)
├── agents/                   # 서브에이전트 정의 (.md)
├── skills/                   # 스킬 (하위 디렉토리)
│   └── skill-name/
│       └── SKILL.md         # 스킬마다 필수
├── hooks/
│   └── hooks.json
├── .mcp.json
└── scripts/
```

---

## 스킬 디렉토리 구조

```
skill-name/
├── SKILL.md           # 필수 (스킬 진입점)
├── references/        # 선택 (상세 레퍼런스 문서)
├── examples/          # 선택 (예시 파일)
└── scripts/           # 선택 (실행 가능한 헬퍼 스크립트)
```

`SKILL.md`에서 지원 파일을 이렇게 참조한다:

```markdown
## Additional resources

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

> **Tip:** SKILL.md는 500줄 이하로 유지한다. 상세 레퍼런스는 별도 파일로 분리.

---

## SKILL.md Frontmatter 필드

```yaml
---
name: my-skill                   # 선택. 생략 시 디렉토리명 사용. /slash-command 이름이 됨
description: "설명"              # 권장. Claude가 자동 발동 여부 판단에 사용
argument-hint: "[파일명] [형식]" # 선택. 자동완성 힌트
disable-model-invocation: true   # 선택. true면 Claude 자동 발동 차단 (수동 /name만 가능)
user-invocable: false            # 선택. false면 / 메뉴에서 숨김 (Claude만 자동 발동)
allowed-tools: Read, Write       # 선택. 스킬 활성 시 승인 없이 사용 가능한 툴
model: sonnet                    # 선택. 스킬 실행 시 사용할 모델
context: fork                    # 선택. fork = 격리된 서브에이전트 컨텍스트에서 실행
agent: Explore                   # 선택. context: fork 시 사용할 에이전트 타입
hooks: ...                       # 선택. 스킬 생명주기 훅
---
```

**발동 제어 매트릭스:**

| Frontmatter | 사용자 발동 | Claude 자동 발동 | 컨텍스트 로드 |
|---|---|---|---|
| (기본) | ✅ | ✅ | description 항상 로드, 내용은 발동 시 |
| `disable-model-invocation: true` | ✅ | ❌ | description 미로드 |
| `user-invocable: false` | ❌ | ✅ | description 항상 로드, 내용은 발동 시 |

---

## String Substitution 변수

| 변수 | 설명 |
|---|---|
| `$ARGUMENTS` | 스킬 호출 시 전달된 전체 인자 |
| `$ARGUMENTS[N]` | N번째 인자 (0-based) |
| `$N` | `$ARGUMENTS[N]` 단축형 |
| `${CLAUDE_SESSION_ID}` | 현재 세션 ID |
| `${CLAUDE_SKILL_DIR}` | SKILL.md가 있는 디렉토리 절대 경로 |

**`${CLAUDE_SKILL_DIR}` 활용 예시** (스킬에 번들된 파일 참조):

```bash
cp "${CLAUDE_SKILL_DIR}/examples/presentation.css" {출력폴더}/presentation.css
cp "${CLAUDE_SKILL_DIR}/examples/presentation.js"  {출력폴더}/presentation.js
```

워킹 디렉토리와 무관하게 스킬 내 파일을 정확히 참조할 수 있다.

---

## 스킬 위치별 적용 범위

| 위치 | 경로 | 적용 범위 |
|---|---|---|
| Enterprise | (관리형 설정 참조) | 조직 전체 |
| Personal | `~/.claude/skills/<name>/SKILL.md` | 내 모든 프로젝트 |
| Project | `.claude/skills/<name>/SKILL.md` | 해당 프로젝트 |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | 플러그인이 활성화된 곳 |

동일 이름 충돌 시 우선순위: enterprise > personal > project.
플러그인 스킬은 `plugin-name:skill-name` 네임스페이스를 사용하므로 충돌 없음.

---

## context: fork (서브에이전트 실행)

```yaml
---
name: deep-research
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings
```

- 격리된 컨텍스트에서 실행 → 대화 히스토리 없음
- `agent` 필드: `Explore`, `Plan`, `general-purpose` 또는 커스텀 에이전트
- 결과는 메인 대화로 요약 반환

---

## 동적 컨텍스트 주입 (`!` 명령)

```yaml
---
name: pr-summary
context: fork
agent: Explore
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`

## Your task
Summarize this pull request...
```

- `` !`command` `` 는 Claude가 받기 전에 실행됨 (전처리)
- 실행 결과가 플레이스홀더를 대체
- Claude는 최종 렌더링된 프롬프트만 받음

---

## WebPPT-creator 적용 사항

이 스펙을 바탕으로 적용한 내용:

| 항목 | 적용 결과 |
|---|---|
| 스킬 구조 | `skills/webppt-create/{SKILL.md, references/, examples/}` |
| 엔진 파일 복사 경로 | `${CLAUDE_SKILL_DIR}/examples/` 사용 |
| 지원 파일 참조 | 링크 형식 `[파일명](경로)` 사용 |
| SKILL.md 분량 | 151줄 (500줄 이하 ✅) |
| 자동 발동 | description 기반 Claude 자동 발동 허용 (기본값) |
