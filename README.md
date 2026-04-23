# Local Plugin Marketplace

fasteject의 Claude Code 플러그인 로컬 마켓플레이스.
이 디렉토리 자체가 하나의 마켓플레이스(`local-marketplace`)이며, 하위 폴더가 각 플러그인이다.

---

## 목차

1. [구조](#구조)
2. [포함된 플러그인](#포함된-플러그인)
3. [최초 설정](#최초-설정)
4. [새 플러그인 추가하기](#새-플러그인-추가하기)
5. [유지보수](#유지보수)
6. [플러그인 스펙 규칙](#플러그인-스펙-규칙)
7. [삽질 기록 (실패와 교훈)](#삽질-기록)

---

## 구조

```
local_plugin_marketplace/          ← 마켓플레이스 루트 (여기를 등록)
├── .claude-plugin/
│   └── marketplace.json           ← 모든 플러그인 목록 (핵심)
│
├── gws-skills/                    ← 플러그인 1
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/[name]/SKILL.md
│
├── plugin-creator/                ← 플러그인 2
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/plugin-creator/SKILL.md
│
├── WebPPT-creator/                ← 플러그인 3
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/webppt-create/SKILL.md
│
├── Supanova-Design-Skill/         ← 플러그인 4
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/[output|redesign|soft|taste]/SKILL.md
│
├── card-news-creator/             ← 플러그인 5
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/card-news-create/SKILL.md
│
└── README.md
```

### 루트 `marketplace.json` 구조

```json
{
  "name": "local-marketplace",
  "owner": { "name": "fasteject", "email": "fasteject@gmail.com" },
  "plugins": [
    { "name": "gws-skills",            "source": "./gws-skills",            "version": "1.0.5" },
    { "name": "plugin-creator",        "source": "./plugin-creator",        "version": "2.1.0" },
    { "name": "WebPPT-creator",        "source": "./WebPPT-creator",        "version": "1.0.2" },
    { "name": "Supanova-Design-Skill", "source": "./Supanova-Design-Skill", "version": "1.0.0" },
    { "name": "card-news-creator",     "source": "./card-news-creator",     "version": "1.0.0" }
  ]
}
```

`source`는 루트에서 각 플러그인 폴더를 가리키는 **상대 경로**다.
절대 경로는 이식성이 깨지므로 절대 사용하지 않는다.

---

## 포함된 플러그인

| 플러그인 | 버전 | 라이선스 | 설명 |
|---------|------|---------|------|
| `gws-skills` | 1.0.5 | Apache-2.0 | Google Workspace 작업 자동화 (Gmail, Calendar, Drive, Sheets, Meet 등) |
| `plugin-creator` | 2.1.0 | MIT | 새 플러그인 스캐폴딩 자동화 |
| `WebPPT-creator` | 1.0.2 | MIT | 순수 HTML/CSS/JS 웹 슬라이드 프레젠테이션 생성 |
| `Supanova-Design-Skill` | 1.0.0 | MIT | 프리미엄 한국어 랜딩페이지 디자인 시스템 (4개 스킬) |
| `card-news-creator` | 1.0.0 | MIT | 컨텍스트 기반 카드뉴스 HTML + PNG 자동 생성 |

### gws-skills 스킬 카테고리

- `gws-*` — 서비스별 핵심 기능 (gmail, calendar, drive, sheets, chat, meet, forms, keep, tasks, slides, people, modelarmor 등)
- `recipe-*` — 복합 작업 레시피 30개 이상 (예: `recipe-find-free-time`, `recipe-post-mortem-setup`)
- `persona-*` — 역할별 워크플로우 (exec-assistant, project-manager, team-lead, researcher 등)
- `gws-workflow-*` — 크로스 서비스 워크플로우

### WebPPT-creator 스킬

- `webppt-create` — 브라우저에서 바로 실행되는 독립 HTML 슬라이드 폴더 생성. 번들러 없이 동작.

### Supanova-Design-Skill 스킬 카테고리

- `output-skill` — 완전한 HTML 생성 강제 (플레이스홀더·스켈레톤 금지)
- `redesign-skill` — 기존 랜딩페이지를 프리미엄 품질로 업그레이드
- `soft-skill` — 랜딩페이지 폰트·간격·그림자·애니메이션 디자인 기준 정의
- `taste-skill` — 프리미엄 전환 최적화 랜딩페이지 생성 엔진 (Tailwind CDN)

### card-news-creator 스킬

- `card-news-create` — 컨텍스트 입력 → 템플릿 자동/수동 선택 → 슬라이드 구성 → HTML + PNG 출력 (`output/YYYY-MM-DD-주제/` 폴더)

---

## 최초 설정

### 1. 마켓플레이스 등록 (최초 1회)

Claude Code 대화 안에서:

```
/plugin marketplace add D:/Python_Project/local_plugin_marketplace
```

또는 `/plugin` UI에서 Add marketplace → 경로 입력.

### 2. 플러그인 설치

```
/plugin install gws-skills@local-marketplace
/plugin install plugin-creator@local-marketplace
/plugin install WebPPT-creator@local-marketplace
/plugin install Supanova-Design-Skill@local-marketplace
/plugin install card-news-creator@local-marketplace
```

### 3. 확인

`~/.claude/settings.json`에 다음이 생겨야 정상:

```json
"enabledPlugins": {
  "gws-skills@local-marketplace": true,
  "plugin-creator@local-marketplace": true,
  "WebPPT-creator@local-marketplace": true,
  "Supanova-Design-Skill@local-marketplace": true,
  "card-news-creator@local-marketplace": true
},
"extraKnownMarketplaces": {
  "local-marketplace": {
    "source": {
      "source": "directory",
      "path": "D:\\Python_Project\\local_plugin_marketplace"
    },
    "autoUpdate": true
  }
}
```

---

## 새 플러그인 추가하기

### Step 1. plugin-creator로 스캐폴딩

`plugin-creator` 플러그인이 설치된 Claude Code 대화에서:

```
"[이름]이라는 [유형] 플러그인 만들어줘. [설명]"
```

예시:

```
"obsidian-tools라는 skills 플러그인 만들어줘. Obsidian 노트 관리 자동화"
```

plugin-creator가 자동 생성하는 파일:

- `.claude-plugin/plugin.json`
- `skills/[name]/SKILL.md`
- `README.md`, `LICENSE`

### Step 2. 폴더를 이 디렉토리에 배치

```
local_plugin_marketplace/
└── obsidian-tools/          ← 여기에 넣는다
    ├── .claude-plugin/
    │   └── plugin.json
    └── skills/...
```

### Step 3. 루트 `marketplace.json` 업데이트

`.claude-plugin/marketplace.json`의 `plugins` 배열에 추가:

```json
{
  "name": "obsidian-tools",
  "source": "./obsidian-tools",
  "description": "Obsidian 노트 관리 자동화",
  "version": "1.0.0",
  "author": { "name": "fasteject", "email": "fasteject@gmail.com" }
}
```

### Step 4. 마켓플레이스 갱신 및 설치

```
/plugin marketplace update local-marketplace
/plugin install obsidian-tools@local-marketplace
```

---

## 유지보수

### 플러그인 내용 수정 후 업데이트

1. 소스 파일 수정
2. 해당 플러그인의 `plugin.json` `version` 증가 (예: `1.0.0` → `1.0.1`)
3. 루트 `.claude-plugin/marketplace.json`에서 **그 플러그인 항목의** `version`을 같은 값으로 업데이트 (다른 플러그인 버전은 건드리지 않음)
4. Claude Code에서:

```
/plugin marketplace update local-marketplace
/plugin update [plugin-name]@local-marketplace
```

### 개발 중 즉시 테스트 (설치 없이)

```bash
claude --plugin-dir ./[plugin-name]
```

### 전체 플러그인 관리 명령어

```
/plugin                                        # UI로 전체 관리
/plugin install name@local-marketplace         # 설치
/plugin uninstall name@local-marketplace       # 제거
/plugin enable name@local-marketplace          # 활성화
/plugin disable name@local-marketplace         # 비활성화
/plugin update name@local-marketplace          # 업데이트
/plugin marketplace add <path>                 # 마켓플레이스 등록
/plugin marketplace update local-marketplace   # 마켓플레이스 목록 갱신
/plugin marketplace remove local-marketplace   # 마켓플레이스 제거
```

---

## 플러그인 스펙 규칙

### `plugin.json`

- `name` 이 유일한 필수 필드
- 각 플러그인의 버전은 독립적이며, 루트 `marketplace.json`의 **해당 플러그인 항목** `version`과 일치해야 함
- `repository` 필드는 실제 공개 저장소가 있을 때만 포함 (없으면 반드시 제거)

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "설명",
  "author": { "name": "fasteject", "email": "fasteject@gmail.com" },
  "license": "MIT",
  "keywords": ["tag1", "tag2"]
}
```

### `marketplace.json`

**묶음 배포** (루트에 위치, `source: "./plugin-name"`)

이 마켓플레이스처럼 루트 하나가 여러 플러그인을 관리할 때.
루트 `.claude-plugin/marketplace.json`에 해당.

```json
{
  "name": "local-marketplace",
  "plugins": [
    { "name": "plugin-one", "source": "./plugin-one", "version": "1.0.0" },
    { "name": "plugin-two", "source": "./plugin-two", "version": "1.0.0" }
  ]
}
```

### Skills 디렉토리 구조

`skills/[skill-name]/SKILL.md` **flat 구조만 인식**한다.
중간에 카테고리 폴더를 끼우면 로드되지 않는다.

```
✅ 올바른 구조:
skills/
  gws-gmail/SKILL.md
  recipe-find-free-time/SKILL.md
  persona-exec-assistant/SKILL.md

❌ 인식 안 되는 구조:
skills/
  core/gws-gmail/SKILL.md
  recipes/recipe-find-free-time/SKILL.md
```

카테고리가 필요하면 폴더 대신 **이름 접두사**를 사용한다: `gws-`, `recipe-`, `persona-`, `workflow-`

---

## 삽질 기록

실패와 교훈을 기록해 같은 실수를 반복하지 않는다.

---

### ❌ 실패 1: 각 플러그인을 별도 마켓플레이스로 등록

**상황:** 처음에 `gws-skills`와 `plugin-creator`를 각각 별도 마켓플레이스로 등록했다.

```json
// settings.json (잘못된 방식)
"extraKnownMarketplaces": {
  "plugin-creator": { "source": { "source": "directory", "path": "...\\plugin-creator" } },
  "gws-skills":     { "source": { "source": "directory", "path": "...\\gws-skills" } }
}
```

**증상:** Claude Code에서는 동작하지만, 다른 프로그램(AI 클라이언트 등)에서는 플러그인을 인식하지 못함.

**원인:** 각 플러그인이 독립 마켓플레이스로 파편화되어 있어 통합 관리가 안 됨.

**해결:** `local_plugin_marketplace` 루트 자체를 마켓플레이스로 만들고, 루트 `.claude-plugin/marketplace.json`에서 모든 플러그인을 `source: "./plugin-name"` 형태로 참조.

```json
// settings.json (올바른 방식)
"extraKnownMarketplaces": {
  "local-marketplace": { "source": { "source": "directory", "path": "...\\local_plugin_marketplace" } }
}
```

---

### ❌ 실패 2: Skills 중첩 폴더 구조 사용

**상황:** 스킬이 많아지자 카테고리별로 폴더를 나누려 했다.

```
skills/
  core/gws-gmail/SKILL.md      ← 로드 안 됨
  recipes/recipe-xxx/SKILL.md  ← 로드 안 됨
```

**증상:** 파일은 존재하지만 Claude Code가 스킬을 인식하지 못함.

**해결:** 중첩 폴더 제거, flat 구조 유지. 카테고리는 폴더가 아닌 **이름 접두사**로 구분.

---

### ❌ 실패 3: `marketplace.json`에 `repository` 필드 추가

**상황:** plugin.json 템플릿을 그대로 복사하면서 `repository` 필드가 포함됨.

**증상:** 마켓플레이스 등록 시 존재하지 않는 GitHub 저장소로 연결 시도 → 오류.

**해결:** 공개 저장소가 실제로 없으면 `repository` 필드를 아예 삭제한다.

---

### ✅ 성공: 마켓플레이스 단일화 이후

- `settings.json`에 마켓플레이스 항목이 하나(`local-marketplace`)로 정리됨
- 플러그인 식별자가 `plugin-creator@plugin-creator` → `plugin-creator@local-marketplace`로 명확해짐
- 새 플러그인 추가 시 루트 `marketplace.json` 한 곳만 수정하면 됨

---

## 작성자

- **name**: fasteject
- **email**: <fasteject@gmail.com>
