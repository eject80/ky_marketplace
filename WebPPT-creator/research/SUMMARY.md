# 웹 프레젠테이션 엔진 리서치 요약

순수 HTML/CSS/JS 슬라이드 프레젠테이션 엔진의 핵심 설계 결정 사항을 정리한 문서입니다.

---

## 추천 아키텍처

### 단일 파일 (프로토타입·빠른 제작용)
```
presentation.html (단일 파일)
├── <head>
│   ├── CSS Variables (테마, 색상, 타이포, 애니메이션)
│   ├── 슬라이드 레이아웃 CSS
│   ├── 전환 효과 CSS (fade, slide, zoom)
│   ├── Step/Build 애니메이션 CSS
│   ├── UI 컴포넌트 CSS (진행바, 노트, 도움말)
│   └── 접근성 CSS (.sr-only, :focus-visible)
├── <body>
│   ├── .presentation (aria role="region")
│   │   └── section.slide × N (role="group")
│   │       ├── .slide__content (청중용 콘텐츠)
│   │       └── aside.slide__notes (발표자 노트)
│   ├── .progress-bar
│   ├── .slide-counter (aria-live="polite")
│   ├── #notes-overlay (동적 생성)
│   ├── #help-overlay
│   └── #slide-status (sr-only, aria-live)
└── <script>
    ├── State 모델
    ├── DOM 초기화
    ├── 전환 엔진 (transitionSlides)
    ├── Step 관리 (next/prev)
    ├── 키보드 이벤트
    ├── 터치 스와이프
    ├── URL Hash 동기화
    ├── 접근성 업데이트
    └── CustomEvent API
```

### 파일 분리 템플릿 (재사용·배포용) ← 권장
```
template/
├── presentation.css   ← 엔진 스타일 (수정 금지)
├── presentation.js    ← 엔진 스크립트 (수정 금지)
└── index.html         ← ★ 이 파일만 수정
    ├── <head>
    │   ├── <link href="presentation.css">
    │   └── <style> (선택: CSS 변수 커스터마이즈)
    ├── <body>
    │   ├── 고정 UI (progress-bar, counter, theme-toggle)
    │   ├── .presentation
    │   │   └── section.slide × N  ← ★ 슬라이드만 작성
    │   └── #help-overlay
    └── <script src="presentation.js">
```

**파일 분리의 장점:**
- `template/` 폴더를 복사하고 `index.html`만 수정하면 새 발표자료 완성
- `presentation.css` / `presentation.js` 업데이트 시 모든 파일에 자동 반영
- 엔진 코드와 콘텐츠가 분리되어 유지보수 용이

---

## 핵심 설계 결정

### 레이아웃

- **absolute positioning** 방식 채택: 슬라이드 겹침 + 전환 최적
- `height: 100dvh` (fallback: `100vh`)
- `aspect-ratio: 16/9` 비율 고정
- `clamp()` 반응형 폰트 스케일링

### 전환 효과

- `transform` + `opacity`만 사용 → GPU 가속 보장
- `isAnimating` 플래그 + `transitionend` + timeout 폴백
- `will-change`는 전환 중에만 임시 적용, 완료 후 `auto`로 해제
- `data-transition` 속성으로 슬라이드별 효과 지정 가능

### Step/Build

- `data-step="N"` 순서형 속성으로 명확한 순서 보장
- **자동 재생 방식** (권장): 슬라이드 진입 시 350ms 간격으로 순차 표시
  - `autoPlaySteps(slide, immediate)` — `immediate=true`면 즉시 전체 표시
  - `next()`/`prev()`는 슬라이드 이동만 담당, step 제어 불포함
- 앞으로 이동 시: 순차 자동 재생 / 뒤로 이동 시: 즉시 전체 표시
- `stepTimers[]`로 진행 중인 타이머 추적 → 슬라이드 이탈 시 `clearStepTimers()`로 취소
- `.step`은 어떤 요소에도 적용 가능: `li`, `div`, `p`, `pre`, `span` 등

### URL Hash

- 외부: `#slide-1` (1-based), 내부: 0-based 인덱스
- `replaceState` 사용 (history 스택 오염 방지)
- `isUpdatingHash` 플래그로 무한 루프 방지

### 접근성

- `aria-hidden="true"` 비활성 슬라이드
- `inert` 속성 (미지원 시 tabindex fallback)
- `aria-live="polite"` 슬라이드 변경 알림
- `tabindex="-1"` + `.focus()` 슬라이드 포커스 이동
- `:focus-visible` 포커스 링 (마우스 클릭 시 숨김)
- `prefers-reduced-motion`: CSS duration 0.01ms + JS 감지

### 테마 전환

- **기본값: 다크 모드** (`--slide-bg: linear-gradient(...)`)
- `<html data-theme="light|dark">` 어트리뷰트로 전환 — `prefers-color-scheme` 미디어 쿼리 미사용
- `D` 키 + 화면 좌하단 🌙/☀️ 버튼으로 토글
- `localStorage`에 저장하여 새로고침 후에도 유지
- 라이트 모드: `--slide-bg: #f4f6f9`, `--primary: #0057b7` 등 전용 변수 오버라이드

### 핵심 단어 강조 (.hl)

- `.hl { color: var(--primary) }` — 제목·본문 공통 클래스
- `var(--primary)` 사용으로 테마 전환 시 자동 색상 변경
- `<span class="hl">단어</span>` 형태로 HTML에 직접 적용

### 코드 하이라이팅

- 기본: CSS 토큰 클래스 (`.token-keyword` 등) + Catppuccin Mocha 팔레트
- 선택: highlight.js CDN (onerror graceful degradation)

---

## 핵심 CSS 패턴

```css
/* 1. CSS Variables 테마 */
:root {
  --slide-bg: #fff; --slide-color: #1a1a1a;
  --primary: #0057b7; --accent: #c55000;
  --duration-normal: 300ms;
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
}

/* 2. 슬라이드 스택 */
.presentation { position: relative; height: 100dvh; overflow: hidden; }
.slide { position: absolute; inset: 0; opacity: 0; pointer-events: none; }
.slide.active { opacity: 1; pointer-events: auto; z-index: 2; }

/* 3. Step 숨김/표시 */
.step { opacity: 0; transform: translateY(16px); transition: ...; }
.step.visible { opacity: 1; transform: translateY(0); }

/* 4. 접근성 */
@media (prefers-reduced-motion: reduce) {
  .slide, .step { transition: none !important; }
}
```

---

## 핵심 JS 패턴

```javascript
// 1. 중앙 goTo 함수
function goTo(index, options = {}) {
  if (state.isAnimating) return false;
  // beforeslidechange 이벤트 (취소 가능)
  // doTransition() → afterSlideChange()
  // ARIA, 진행바, 해시, 포커스, autoPlaySteps 업데이트
}

// 2. next/prev (슬라이드 이동만 — step은 autoPlaySteps가 담당)
function next() { goTo(state.currentSlide + 1); }
function prev() { goTo(state.currentSlide - 1); }

// 2-1. step 자동 재생
function autoPlaySteps(slide, immediate) {
  // 350ms 간격 순차 표시 (immediate=true면 즉시 전체 표시)
}

// 3. 키보드 디스패처
document.addEventListener('keydown', (e) => {
  if (isInputFocused(e.target)) return;
  const action = KEY_MAP[e.key];
  if (action) { e.preventDefault(); executeAction(action); }
});

// 4. 터치 스와이프
// touchstart(passive) → touchmove(수평>수직 시 preventDefault) → touchend
```

---

## 주의사항

| 항목 | 잘못된 방법 | 올바른 방법 |
|---|---|---|
| GPU 가속 | `width`, `top` 애니메이션 | `transform`, `opacity`만 |
| will-change | 항상 `.slide { will-change: transform }` | 전환 중에만 임시 적용 |
| transitionend | 무조건 처리 | `propertyName` 필터링 |
| 터치 이벤트 | touchmove에 passive | touchmove는 passive:false (스크롤 차단 필요) |
| 포커스 | `*:focus { outline: none }` | `:focus-visible` 활용 |
| Hash 업데이트 | `location.hash = ...` | `history.replaceState()` |
| ARIA | 비활성 슬라이드 방치 | `aria-hidden="true"` + `inert` |
| 테마 전환 | `prefers-color-scheme` 미디어 쿼리만 사용 | `data-theme` 어트리뷰트 + localStorage |
| step 자동 재생 | 타이머 누적 (이탈 시 미취소) | `stepTimers[]` 추적 → `clearStepTimers()` |
| 파일 분리 시 수정 | `presentation.css`/`js` 직접 수정 | `index.html`의 `<style>`에서 CSS 변수만 재정의 |
| 카드 그리드 열 수 | 인라인 `grid-template-columns` | `.card-grid.col-3`, `.card-grid.col-4` 클래스 사용 |
| 배경 이미지 | 인라인 CSS로 배경 지정 | `slide--fullbg` + `style="background-image: url(...)"` (이미지 URL은 인라인 허용) |

---

## 리서치 파일 목록

| 파일 | 내용 |
|---|---|
| `01-layout-dom.md` | 슬라이드 레이아웃, HTML 구조, 반응형, CSS 변수 테마 |
| `02-navigation.md` | 키보드, URL Hash, 터치 스와이프, 진행 표시, 전체화면 |
| `03-transitions.md` | fade/slide/zoom CSS, GPU 가속, isAnimating 패턴 |
| `04-build-effects.md` | data-step, speaker notes, 코드 하이라이팅 |
| `05-accessibility.md` | ARIA, 포커스 관리, inert, sr-only, WCAG 대비비 |
| `06-state-api.md` | 상태 모델, 초기화, 핵심 API, CustomEvent, IIFE 패턴 |
| `07-template-guide.md` | 파일 분리 템플릿 구조, 슬라이드 유형 17종 레퍼런스 |
| `08-plugin-skills-spec.md` | Claude Code 공식 플러그인/스킬 스펙 (구조, frontmatter, `${CLAUDE_SKILL_DIR}` 등) |
| `SUMMARY.md` | 이 파일 (통합 요약) |

---

## 예시 파일 / 템플릿

### 단일 파일 예시
- `../sample/presentation.html` — 완전한 단일 HTML 파일
  - 슬라이드 4장 (타이틀, step 빌드, 코드 하이라이팅, 기능 카드)
  - 외부 의존성 없음

### 재사용 가능한 분리 템플릿 ← 권장
- `../template/presentation.css` — 엔진 스타일 (수정 금지)
- `../template/presentation.js` — 엔진 스크립트 + 공개 API (수정 금지)
- `../template/index.html` — 복사해서 사용하는 뼈대 HTML
  - 슬라이드 유형 17종 예시 포함
  - 각 유형에 `★` 주석으로 수정 위치 안내
  - 인라인 스타일 없음, 모든 스타일은 CSS 클래스로 처리
