# CLAUDE.md

이 저장소를 다루는 코딩 에이전트를 위한 안내. 사용자용 설치/사용 안내는 [README.md](README.md) 참고.

## 구조

```
ky_marketplace/                    ← 마켓플레이스 루트 (여기를 등록)
├── .claude-plugin/
│   └── marketplace.json           ← 모든 플러그인 목록 (핵심)
│
├── plugin-creator/                ← 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/plugin-creator/SKILL.md
│
├── WebPPT-creator/                ← 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/webppt-create/SKILL.md
│
├── Supanova-Design-Skill/         ← 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/[output|redesign|soft|taste]/SKILL.md
│
├── card-news-creator/             ← 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/card-news-create/SKILL.md
│
├── PPT-creator/                   ← 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── skills/[ppt-create|ppt-export|ppt-review]/SKILL.md
│
└── README.md
```

개별 플러그인 폴더 안에 `marketplace.json`을 만들면 안 된다 — 루트 `.claude-plugin/marketplace.json`에서만 관리한다.

## `marketplace.json` 구조

```json
{
  "name": "ky-marketplace",
  "owner": { "name": "eject80" },
  "plugins": [
    { "name": "plugin-name", "source": "./plugin-name", "version": "1.0.0" }
  ]
}
```

- `source`는 루트에서 각 플러그인 폴더를 가리키는 **상대 경로**다. 절대 경로는 이식성이 깨지므로 절대 사용하지 않는다.
- **버전 범프 규칙:** 플러그인 버전 변경 시 반드시 두 곳 모두 업데이트
  1. `{plugin}/.claude-plugin/plugin.json` → `version`
  2. 루트 `.claude-plugin/marketplace.json` → 해당 플러그인 항목의 `version` (다른 플러그인 버전은 건드리지 않음)

## `plugin.json` 스펙 규칙

- `name`이 유일한 필수 필드
- `author`는 선택사항. 개인 이메일 대신 GitHub 핸들(`eject80`) 사용
- `repository` 필드는 실제 공개 저장소가 있을 때만 포함 (없으면 반드시 제거)

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
3. 루트 `.claude-plugin/marketplace.json`의 `plugins` 배열에 항목 추가
4. `/plugin marketplace update ky-marketplace` → `/plugin install [name]@ky-marketplace`로 확인

## 플러그인 수정 후 업데이트

1. 소스 파일 수정
2. 해당 플러그인의 `plugin.json` `version` 증가
3. 루트 `marketplace.json`에서 같은 플러그인 항목의 `version` 동기화
4. `/plugin marketplace update ky-marketplace` → `/plugin update [plugin-name]@ky-marketplace`

개발 중 즉시 테스트(설치 없이): `claude --plugin-dir ./[plugin-name]`

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

## 커밋 컨벤션

`말머리 :: 제목` 형식 사용 (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `revert`).
