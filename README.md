# ky-marketplace

**Claude Code 플러그인 마켓플레이스.** PPT·카드뉴스·랜딩페이지 제작처럼 반복되는 작업을 스킬로 자동화한다.

[![License](https://img.shields.io/badge/license-MIT-a6e3a1?style=flat-square)](#license)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-89b4fa?style=flat-square)](https://code.claude.com/docs)

---

## Quick Install

```bash
git clone https://github.com/eject80/ky_marketplace.git
```

Claude Code 대화 안에서:

```
/plugin marketplace add <클론한 경로>/ky_marketplace
```

원하는 플러그인만 골라 설치:

```
/plugin install plugin-creator@ky-marketplace
/plugin install WebPPT-creator@ky-marketplace
/plugin install Supanova-Design-Skill@ky-marketplace
/plugin install card-news-creator@ky-marketplace
/plugin install PPT-creator@ky-marketplace
```

설치 없이 바로 테스트해보고 싶다면:

```bash
claude --plugin-dir ./<plugin-name>
```

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

## 플러그인 관리

```
/plugin                                    # UI로 전체 관리
/plugin uninstall name@ky-marketplace      # 제거
/plugin update name@ky-marketplace         # 업데이트
/plugin marketplace update ky-marketplace  # 마켓플레이스 목록 갱신
```

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
