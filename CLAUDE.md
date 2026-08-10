# CLAUDE.md

이 저장소를 다루는 코딩 에이전트를 위한 안내. 사용자용 설치/사용 안내는 [README.md](README.md) 참고.

## 구조

```
ky_marketplace/                    ← 마켓플레이스 루트 (여기를 등록)
├── .claude-plugin/
│   └── marketplace.json           ← Claude Code용 플러그인 목록 (핵심)
├── .agents/plugins/
│   └── marketplace.json           ← Codex CLI용 플러그인 목록 (스키마가 달라 별도 파일)
│
├── plugin-creator/                ← 플러그인
│   ├── .claude-plugin/plugin.json
│   ├── .codex-plugin/plugin.json
│   └── skills/plugin-creator/SKILL.md
│
├── WebPPT-creator/                ← 플러그인
│   ├── .claude-plugin/plugin.json
│   ├── .codex-plugin/plugin.json
│   └── skills/webppt-create/SKILL.md
│
├── Supanova-Design-Skill/         ← 플러그인
│   ├── .claude-plugin/plugin.json
│   ├── .codex-plugin/plugin.json
│   └── skills/[output|redesign|soft|taste]/SKILL.md
│
├── card-news-creator/             ← 플러그인
│   ├── .claude-plugin/plugin.json
│   ├── .codex-plugin/plugin.json
│   └── skills/card-news-create/SKILL.md
│
├── PPT-creator/                   ← 플러그인
│   ├── .claude-plugin/plugin.json
│   ├── .codex-plugin/plugin.json
│   └── skills/[ppt-create|ppt-export|ppt-review]/SKILL.md
│
├── ky-image-generator/            ← 플러그인 (skills 없이 원격 MCP 서버만 연결)
│   ├── .claude-plugin/plugin.json  (mcpServers → "./.mcp.json" 경로 참조)
│   ├── .mcp.json
│   └── .codex-plugin/plugin.json   (mcpServers 인라인 객체, 별도 파일 없음 — 이유는 "삽질 기록" 참고)
│
└── README.md
```

개별 플러그인 폴더 안에 `marketplace.json`을 만들면 안 된다 — Claude Code는 루트 `.claude-plugin/marketplace.json`, Codex는 루트 `.agents/plugins/marketplace.json`에서만 관리한다.

## `marketplace.json` 구조 — Claude Code / Codex CLI 스키마가 다르다

Claude Code (`.claude-plugin/marketplace.json`) — `source`는 **문자열**:

```json
{
  "name": "ky-marketplace",
  "owner": { "name": "eject80" },
  "plugins": [
    { "name": "plugin-name", "source": "./plugin-name", "version": "1.0.0" }
  ]
}
```

Codex CLI (`.agents/plugins/marketplace.json`) — `source`는 **태그된 객체**, `policy`/`category` 필수:

```json
{
  "name": "ky-marketplace",
  "interface": { "displayName": "ky-marketplace" },
  "plugins": [
    {
      "name": "plugin-name",
      "description": "설명",
      "source": { "source": "local", "path": "./plugin-name" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Productivity"
    }
  ]
}
```

Codex는 `.claude-plugin/marketplace.json` 경로 자체는 인식하지만 `source`가 문자열이라 파싱이 안 맞아서 별도 파일이 필요하다 (직접 검증 완료 — `codex plugin marketplace add .` 후 `.claude-plugin/marketplace.json`만 있을 땐 플러그인이 하나도 안 뜨고, `.agents/plugins/marketplace.json`을 추가하니 5개 다 인식됨).

- `source`(Claude)/`source.path`(Codex)는 루트에서 각 플러그인 폴더를 가리키는 **상대 경로**다. 절대 경로는 이식성이 깨지므로 절대 사용하지 않는다.
- **버전 범프 규칙:** 플러그인 버전 변경 시 반드시 세 곳 모두 업데이트
  1. `{plugin}/.claude-plugin/plugin.json` → `version`
  2. `{plugin}/.codex-plugin/plugin.json` → `version`
  3. 루트 `.claude-plugin/marketplace.json`과 `.agents/plugins/marketplace.json` → 해당 플러그인 항목의 `version` (다른 플러그인 버전은 건드리지 않음)

## `plugin.json` 스펙 규칙

- `name`이 유일한 필수 필드
- `author`는 선택사항. 개인 이메일 대신 GitHub 핸들(`eject80`) 사용
- `repository` 필드는 실제 공개 저장소가 있을 때만 포함 (없으면 반드시 제거)
- `skills` 필드는 생략 — Claude Code, Codex 둘 다 명시 안 하면 플러그인 루트의 `skills/` 폴더를 기본값으로 스캔한다. `hooks`/`apps`/`mcpServers`도 실제로 쓸 게 없으면 넣지 않는다. MCP 서버를 감싸는 플러그인(예: `ky-image-generator`)은 skills 없이 `mcpServers`만 있어도 된다 — 정확한 스키마(Claude는 파일 참조/인라인 다 되고, Codex는 인라인만 동작)는 아래 "삽질 기록" 참고

`.claude-plugin/plugin.json`과 `.codex-plugin/plugin.json`은 필드가 거의 같아서 사실상 같은 내용으로 두 곳에 만들면 된다:

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "설명",
  "author": { "name": "eject80" },
  "license": "MIT",
  "keywords": ["tag1", "tag2"]
}
```

## Skills 디렉토리 구조

`skills/[skill-name]/SKILL.md` **flat 구조만 인식**한다. 중간에 카테고리 폴더를 끼우면 로드되지 않는다.

```
✅ 올바른 구조:
skills/
  webppt-create/SKILL.md
  card-news-create/SKILL.md

❌ 인식 안 되는 구조:
skills/
  core/webppt-create/SKILL.md
```

카테고리가 필요하면 폴더 대신 **이름 접두사**를 사용한다.

## 새 플러그인 추가하기

1. `plugin-creator`로 스캐폴딩: `"[이름]이라는 [유형] 플러그인 만들어줘. [설명]"` → `.claude-plugin/plugin.json`, `skills/[name]/SKILL.md`, `README.md`, `LICENSE` 자동 생성
2. 생성된 폴더를 저장소 루트에 배치
3. `plugin-creator`는 Codex 쪽은 모르므로, `{plugin}/.codex-plugin/plugin.json`을 `.claude-plugin/plugin.json`과 거의 동일한 내용으로 수동 추가
4. 루트 `.claude-plugin/marketplace.json`과 `.agents/plugins/marketplace.json` 양쪽의 `plugins` 배열에 항목 추가 (스키마 차이는 위 섹션 참고)
5. `/plugin marketplace update ky-marketplace` → `/plugin install [name]@ky-marketplace`, `codex plugin marketplace upgrade ky-marketplace` → `codex plugin add [name]@ky-marketplace`로 양쪽 확인

**원격 MCP 서버만 감싸는 플러그인(스킬 없음)**은 위 스캐폴딩 플로우를 쓰지 않는다 — `plugin-creator`는 항상 `skills/[name]/SKILL.md`를 만들기 때문. 대신 기존 플러그인 폴더 구조를 그대로 본떠 `.claude-plugin/plugin.json`·`.mcp.json`·`.codex-plugin/plugin.json`을 수동으로 작성한다 (`ky-image-generator`가 예시, mcpServers 스키마는 "삽질 기록" 참고). 루트 두 `marketplace.json`과 README 반영은 위 4번과 동일.

## 플러그인 수정 후 업데이트

1. 소스 파일 수정
2. 해당 플러그인의 `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` `version` 둘 다 증가
3. 루트의 두 `marketplace.json`에서 같은 플러그인 항목의 `version` 동기화
4. `/plugin marketplace update ky-marketplace` → `/plugin update [plugin-name]@ky-marketplace`

개발 중 즉시 테스트(설치 없이): `claude --plugin-dir ./[plugin-name]`, Codex는 `codex plugin marketplace add .` (로컬 경로)로 임시 등록 후 `codex plugin add [name]@ky-marketplace`

## 삽질 기록 (실패와 교훈)

### ❌ 각 플러그인을 별도 마켓플레이스로 등록

플러그인마다 `extraKnownMarketplaces`에 따로 등록했더니 Claude Code에서는 동작해도 다른 프로그램에서는 인식하지 못했다.
→ 저장소 루트 자체를 마켓플레이스로 만들고 루트 `marketplace.json`에서 `source: "./plugin-name"`으로 전부 참조하는 방식으로 통일.

### ❌ Skills 중첩 폴더 구조 사용

`skills/core/gws-gmail/SKILL.md`처럼 카테고리 폴더를 끼웠더니 파일은 있어도 Claude Code가 스킬을 인식하지 못했다.
→ flat 구조 유지, 카테고리는 이름 접두사로 구분.

### ❌ `marketplace.json`에 `repository` 필드 추가

`plugin.json` 템플릿을 그대로 복사하면서 `repository` 필드가 포함됐고, 존재하지 않는 저장소로 연결을 시도해 오류가 났다.
→ 공개 저장소가 실제로 있을 때만 `repository` 필드를 넣는다.

### ❌ Claude Code용 `marketplace.json`을 Codex CLI에도 그대로 쓰려고 함

Codex CLI가 `.claude-plugin/marketplace.json` 경로 자체는 인식하길래 그대로 될 줄 알았는데, `source` 필드가 Claude Code는 문자열, Codex는 `{"source": "local", "path": "..."}` 형태의 태그된 객체라 스키마가 안 맞아 플러그인이 하나도 안 떴다 (`codex plugin list --marketplace ky-marketplace --json` → `available: []`).
→ Codex 전용 `.agents/plugins/marketplace.json`을 별도로 만들고, 플러그인 폴더마다 `.codex-plugin/plugin.json`도 나란히 둔다. `skills/` 폴더 컨벤션은 둘이 같아서 SKILL.md는 공유해도 된다.

### ❌ Codex `plugin.json`의 `mcpServers`를 파일 경로 문자열로 참조

Claude Code 문서(`mcp.json`)를 따라 `"mcpServers": "./mcp.json"`처럼 별도 파일을 경로로 참조했더니, `codex plugin add`는 에러 없이 "성공"했고 `codex plugin list`에도 플러그인이 정상적으로 뜨지만 **`codex mcp list`에는 해당 MCP 서버가 전혀 등록되지 않았다** (조용히 무시됨 — 설치 실패 메시지조차 없어서 알아채기 어려움).
→ Codex는 `plugin.json`의 `mcpServers`에 **인라인 객체**를 직접 넣어야 실제로 등록된다 (`codex mcp list`로 확인 완료). 원격 서버 필드는 `url` + `bearer_token_env_var`(토큰이 담긴 환경변수 이름) + 필요시 `http_headers`. Claude Code는 인라인/파일 경로 둘 다 되지만(`mcp.md` 공식 문서 확인), Codex는 **인라인만** 검증됨 — 두 호스트가 같은 필드명(`mcpServers`)을 쓰면서도 값 형태 지원 범위가 다르므로, 새 원격 MCP 플러그인을 만들 때마다 양쪽 다 실제 CLI(`codex mcp list` / `claude plugin details <name>`)로 등록 여부를 반드시 확인한다.

Claude Code 쪽 검증된 스키마 (`.mcp.json`, 인라인도 가능):
```json
{
  "mcpServers": {
    "server-name": {
      "type": "http",
      "url": "https://example.com/mcp",
      "headers": { "Authorization": "Bearer ${MY_API_KEY}" }
    }
  }
}
```

원격 서버가 OAuth(동적 클라이언트 등록)를 지원하면 `headers` 없이 `url`만 넣는다 — 401을 받으면 Claude Code가 알아서 OAuth discovery부터 시작한다.

Codex 쪽 검증된 스키마 (`.codex-plugin/plugin.json`에 인라인, **파일 참조 금지**):
```json
{
  "mcpServers": {
    "server-name": {
      "url": "https://example.com/mcp",
      "bearer_token_env_var": "MY_API_KEY"
    }
  }
}
```

원격 서버가 OAuth를 지원하면 `bearer_token_env_var`를 **아예 넣지 않는다** — 넣는 순간 OAuth가 영구적으로 꺼진다. 이유는 아래 "삽질 기록" 참고.

### ❌ Codex `bearer_token_env_var`를 OAuth 지원 서버에도 습관적으로 넣음

`ky-image-generator`는 OAuth(이메일 OTP)와 API 키를 둘 다 지원하는 서버인데, `.codex-plugin/plugin.json`에 `bearer_token_env_var`를 넣어놨더니 Codex CLI(0.146.0)가 이 서버를 OAuth 로그인 후보에서 아예 제외했다 (Codex 소스 `codex-mcp/src/mcp/auth.rs`의 `oauth_login_candidate()`: `if bearer_token_env_var.is_some() { return None; }`). Claude Code 쪽도 같은 이유로 `.mcp.json`에 고정 `headers`를 넣어서 OAuth를 못 타게 막고 있었다 — 두 호스트에서 동일한 패턴의 실수.
→ 서버가 OAuth를 지원하면 두 호스트 모두 헤더/토큰 필드를 넣지 말고 `url`만 등록한다. Codex는 Claude Code와 달리 401에서 자동으로 OAuth를 시작하지 않으므로, 설치 후 `codex mcp login <server-name>`을 사용자가 직접 한 번 실행해야 브라우저 로그인이 뜬다 (Claude Code는 첫 툴 호출 시 자동).

### ❌ ChatGPT Desktop은 마켓플레이스를 지원 안 한다고 단정

처음엔 "ChatGPT는 개별 MCP 커넥터(Developer mode)만 되고 마켓플레이스 개념이 없다"고 README에 적었는데, exa로 다시 조사하니 틀렸다. ChatGPT 데스크톱 앱(Codex 통합 앱, 2026년 기준)은 자체 "Plugins" 기능이 있고, 그 안에서 우리 마켓플레이스를 그대로 읽는다 — `$REPO_ROOT/.agents/plugins/marketplace.json`(Codex CLI용으로 이미 만든 파일)과 `$REPO_ROOT/.claude-plugin/marketplace.json`(Claude Code용, "레거시 호환"으로 인식) 둘 다 지원 대상이다. 즉 저장소를 전혀 안 고쳐도 ChatGPT Desktop에서 마켓플레이스로 추가할 수 있었다. computer-use로 실제 앱을 열어 확인: 플러그인 → **추가** 드롭다운 → **마켓플레이스 추가** → 출처에 `owner/repo` 입력 → 설치까지 실제로 됨.
→ "이 호스트는 X를 지원 안 한다"는 판단은 공식 문서/실기기 확인 없이 내리지 않는다. Plugins 기능은 ChatGPT의 **Codex 모드** 또는 **ChatGPT + Work 모드**에서만 보인다는 점, 유료 플랜(Plus 이상)이 필요하다는 점도 실제로 뜨는 화면과 공식 문서로 교차 확인한 내용이다.

## 커밋 컨벤션

`말머리 :: 제목` 형식 사용 (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `revert`).
