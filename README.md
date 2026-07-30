# ky-marketplace

**Claude Code 플러그인 마켓플레이스.** PPT·카드뉴스·랜딩페이지 제작처럼 반복되는 작업을 스킬로 자동화한다.

[![License](https://img.shields.io/badge/license-MIT-a6e3a1?style=flat-square)](#license)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-89b4fa?style=flat-square)](https://code.claude.com/docs)

---

## Install

### Claude Code 플러그인 마켓플레이스로 설치 (권장)

clone 없이 바로 등록:

```
/plugin marketplace add eject80/ky_marketplace
```

원하는 플러그인만 골라 설치:

```
/plugin install plugin-creator@ky-marketplace
/plugin install WebPPT-creator@ky-marketplace
/plugin install Supanova-Design-Skill@ky-marketplace
/plugin install card-news-creator@ky-marketplace
/plugin install PPT-creator@ky-marketplace
```

> `marketplace add`와 `install`은 같은 프롬프트에 이어 보내지 말고, 별도 프롬프트로 나눠 보낼 것 — 한 번에 보내면 설치가 안 될 수 있다.

### 로컬 clone으로 설치 (오프라인 사용, 직접 수정 시)

```bash
git clone https://github.com/eject80/ky_marketplace.git
```

```
/plugin marketplace add <클론한 경로>/ky_marketplace
```

설치 없이 바로 테스트해보고 싶다면:

```bash
claude --plugin-dir ./<plugin-name>
```

### 설치 전 확인

대부분의 플러그인은 추가 요구사항이 없다. 다음 두 개만 예외:

| 플러그인 | 요구사항 |
|---------|---------|
| `PPT-creator` | Node.js (`ppt-create`가 `pptxgenjs` 사용) · Windows + PowerPoint (`ppt-export`의 COM 자동화, Windows 전용) |
| `card-news-creator` | Playwright MCP (HTML → PNG 변환 시) · 인터넷 연결 (Pretendard 웹폰트 CDN) |

요구사항이 없으면 스킬 자체는 그냥 동작하지 않고 조용히 실패하니, 위 표에 해당하는 플러그인만 설치 전에 준비하면 된다.

---

## 포함된 플러그인

| 플러그인 | 설명 | 주요 스킬 |
|---------|------|----------|
| [`plugin-creator`](plugin-creator) | 새 Claude Code 플러그인을 올바른 구조로 스캐폴딩 | `plugin-creator` |
| [`WebPPT-creator`](WebPPT-creator) | 순수 HTML/CSS/JS 웹 슬라이드 프레젠테이션 생성 (번들러 불필요) | `webppt-create` |
| [`Supanova-Design-Skill`](Supanova-Design-Skill) | 프리미엄 한국어 랜딩페이지 디자인 시스템 | `output` · `redesign` · `soft` · `taste` |
| [`card-news-creator`](card-news-creator) | 컨텍스트 입력 → 카드뉴스 HTML + PNG 자동 생성 (템플릿 8종) | `card-news-create` |
| [`PPT-creator`](PPT-creator) | 12×24 그리드 기반 PPTX 생성·이미지 내보내기·슬라이드 수정 | `ppt-create` · `ppt-export` · `ppt-review` |

각 플러그인의 자세한 사용법은 폴더별 README를 참고.

---

## Uninstall

| 명령 | 설명 |
|------|------|
| `/plugin uninstall <name>@ky-marketplace` | 플러그인 제거 |
| `/plugin marketplace remove ky-marketplace` | 마켓플레이스 자체 제거 |

전체 관리 UI는 `/plugin`, 업데이트는 `/plugin update <name>@ky-marketplace` · `/plugin marketplace update ky-marketplace`.

---

## 새 플러그인 추가하기

`plugin-creator`가 설치된 대화에서 요청 한 줄이면 충분:

```
"obsidian-tools라는 skills 플러그인 만들어줘. Obsidian 노트 관리 자동화"
```

마켓플레이스 구조, `marketplace.json` 관리 규칙, 버전 범프 절차 등 유지보수 관련 내용은 [CLAUDE.md](CLAUDE.md) 참고.

---

## License

각 플러그인은 자체 `LICENSE` 파일을 갖는다 (전부 MIT). 마켓플레이스 저장소 자체에는 별도 라이선스가 없다.
