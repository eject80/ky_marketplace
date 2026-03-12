# WebPPT Creator

순수 HTML/CSS/JavaScript만으로 동작하는 웹 기반 슬라이드 프레젠테이션 생성 플러그인.
번들러·빌드 도구 없이 브라우저에서 바로 열 수 있는 독립 폴더를 생성한다.

## 핵심 기능

- **17종 슬라이드 유형** 지원 (타이틀, 목차, 코드 블록, 카드 그리드, 통계, 타임라인 등)
- **Step 자동 재생** — `data-step` 속성으로 350ms 간격 순차 표시
- **다크/라이트 모드** — `D` 키 또는 화면 버튼으로 전환, `localStorage` 유지
- **키보드 + 터치** 네비게이션
- **발표자 노트** — `N` 키로 토글
- **CSS 변수** 기반 테마 커스터마이즈
- **접근성** — ARIA, `inert`, `prefers-reduced-motion` 지원

## 사용법

Claude Code에서 자연어로 요청한다:

```
"Python 비동기 프로그래밍에 대한 발표자료 만들어줘"
"팀 주간 보고 슬라이드 만들어줘. 5장 정도로"
"제품 로드맵 PPT 만들어줘. 영어로."
```

생성된 폴더 구조:

```
my-presentation/
├── presentation.css   ← 엔진 스타일 (수정 금지)
├── presentation.js    ← 엔진 스크립트 (수정 금지)
└── index.html         ← ★ 슬라이드 내용 (여기만 수정)
```

`index.html`을 브라우저에서 열면 즉시 실행된다.

## 폴더 구조

```
WebPPT-creator/
├── .claude-plugin/
│   └── plugin.json          플러그인 매니페스트
├── skills/
│   └── webppt-create/
│       └── SKILL.md         슬라이드 생성 스킬
├── template/
│   ├── presentation.css     엔진 스타일 (수정 금지)
│   ├── presentation.js      엔진 스크립트 (수정 금지)
│   └── index.html           17종 슬라이드 유형 예시 템플릿
├── sample/
│   ├── presentation.css     템플릿에서 복사된 엔진 스타일
│   ├── presentation.js      템플릿에서 복사된 엔진 스크립트
│   └── presentation.html    WebPPT 사용 가이드 (17슬라이드 예시)
└── research/
    ├── SUMMARY.md            설계 결정 요약
    └── 01~07-*.md            상세 리서치 문서
```

## 키보드 단축키

| 키 | 동작 |
|---|---|
| `→` / `Space` / `PageDown` | 다음 슬라이드 |
| `←` / `PageUp` | 이전 슬라이드 |
| `Home` / `End` | 처음 / 마지막 |
| `F` | 전체화면 |
| `N` | 발표자 노트 토글 |
| `D` | 다크/라이트 모드 전환 |
| `?` | 단축키 도움말 |

## JS 공개 API

```javascript
window.Presentation.next()        // 다음 슬라이드
window.Presentation.prev()        // 이전 슬라이드
window.Presentation.goTo(n)       // n번 슬라이드 (0-based)
window.Presentation.toggleNotes() // 발표자 노트 토글
window.Presentation.toggleTheme() // 다크/라이트 전환
window.Presentation.getState()    // 현재 상태 객체 반환
```

## 라이선스

MIT © fasteject
