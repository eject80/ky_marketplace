# Agent 1: 슬라이드 레이아웃 & DOM 구조

## 1. 슬라이드 Full-Viewport 레이아웃 CSS 방법 비교

### 최종 권장: **Flexbox + absolute positioning 조합**

#### Flexbox 방식
```css
.presentation {
  display: flex;
  flex-direction: row;
  height: 100dvh;
  width: 100%;
  overflow: hidden;
}
.slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```
**장점:** 의도 명확, 내부 정렬 강력
**단점:** 수평 스크롤 기반, 전환 시 JS 추가 필요

#### Grid 방식 (페이드 전환 최적)
```css
.presentation {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100dvh;
  overflow: hidden;
}
.slide {
  grid-column: 1;
  grid-row: 1;
  display: grid;
  place-items: center;
}
.slide.active { z-index: 10; opacity: 1; }
.slide:not(.active) { opacity: 0; pointer-events: none; }
```
**장점:** 겹침 레이아웃 탁월, 모든 슬라이드 동시 렌더링
**단점:** IE 미지원

#### Absolute Positioning 방식
```css
.presentation { position: relative; height: 100dvh; overflow: hidden; }
.slide {
  position: absolute;
  inset: 0;
  transition: opacity 0.4s ease, transform 0.4s ease;
}
```
**장점:** 완벽한 자유도, 애니메이션 세밀 제어
**단점:** 반응형 복잡, 코드 보일러플레이트 많음

---

## 2. 권장 HTML 구조

```html
<div class="presentation" role="region" aria-label="Presentation">

  <section class="slide" id="slide-1" data-slide-index="0"
           role="group" aria-roledescription="슬라이드"
           data-transition="fade">
    <div class="slide__content">
      <h2>슬라이드 제목</h2>
      <p>콘텐츠</p>
    </div>
    <aside class="slide__notes">발표자 노트</aside>
  </section>

  <section class="slide" id="slide-2" data-slide-index="1"
           data-transition="slide-left">
    <div class="slide__content">
      <h2>Step 슬라이드</h2>
      <ul>
        <li class="step" data-step="1">첫 번째</li>
        <li class="step" data-step="2">두 번째</li>
      </ul>
    </div>
    <aside class="slide__notes">발표자 노트</aside>
  </section>

</div>
```

### Authoring Convention 정리

| 속성/클래스 | 역할 | 예시 |
|---|---|---|
| `section.slide` | 개별 슬라이드 | `<section class="slide">` |
| `id="slide-N"` | URL hash 참조 | `id="slide-1"` |
| `data-slide-index` | JS 인덱스 | `data-slide-index="0"` |
| `data-transition` | 전환 효과 지정 | `data-transition="fade"` |
| `.slide__content` | 메인 콘텐츠 영역 | |
| `aside.slide__notes` | 발표자 노트 | CSS로 숨김 |
| `.step[data-step]` | 빌드 애니메이션 요소 | `data-step="1"` |

---

## 3. 반응형 구현

### 뷰포트 단위 비교

| 단위 | 정의 | 권장 여부 | 주의 |
|---|---|---|---|
| `vh` | Initial viewport | Fallback | iOS Safari 주소표시줄 포함 계산 |
| `dvh` | Dynamic viewport | ✅ 권장 | Chrome 108+, Safari 16+ |
| `svh` | Small viewport | 보수적 | 가장 작은 값 |
| `lvh` | Large viewport | 비권장 | 가장 큰 값, 넘침 가능 |

```css
.presentation {
  height: 100vh;        /* Fallback */
  height: 100dvh;       /* 모던 브라우저 */
}
```

### 16:9 비율 고정

```css
/* 권장: CSS aspect-ratio */
.slide {
  width: 100%;
  aspect-ratio: 16 / 9;
}

/* Fallback (IE용) */
@supports not (aspect-ratio: 16/9) {
  .slide-wrapper { padding-bottom: 56.25%; position: relative; }
  .slide { position: absolute; inset: 0; }
}
```

### 반응형 폰트 스케일링

```css
.slide h1 { font-size: clamp(2rem, 5vw, 4.5rem); }
.slide h2 { font-size: clamp(1.5rem, 3.5vw, 2.5rem); }
.slide p  { font-size: clamp(1rem, 1.5vw, 1.5rem); }
.slide__content { padding: clamp(1rem, 5vw, 4rem); }
```

---

## 4. CSS Custom Properties 테마 설계

### 다크 모드 기본 (권장)

```css
/* 기본값: 다크 모드 */
:root {
  /* 색상 */
  --slide-bg: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  --slide-color: #f0f0f0;
  --primary: #60a5fa;   /* 다크 배경용 밝은 블루 */
  --accent: #fb923c;
  --text-secondary: rgba(255, 255, 255, 0.58);
  --border-color: rgba(255, 255, 255, 0.12);
  --bg-secondary: rgba(255, 255, 255, 0.07);

  /* 타이포그래피 */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;

  /* 레이아웃 */
  --slide-padding: clamp(1.5rem, 5vw, 4rem);

  /* 애니메이션 */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0.01ms;
    --duration-normal: 0.01ms;
    --duration-slow: 0.01ms;
  }
}
```

### data-theme 기반 수동 테마 전환

`prefers-color-scheme` 미디어 쿼리 대신, `<html data-theme="light|dark">` 어트리뷰트로 테마를 제어한다.
사용자가 버튼(`D` 키 또는 화면 버튼)으로 직접 전환하고, `localStorage`로 유지한다.

```css
/* 라이트 모드 오버라이드 */
[data-theme="light"] {
  --slide-bg: #f4f6f9;
  --slide-color: #1a1a1a;
  --primary: #0057b7;
  --accent: #c55000;
  --text-secondary: #595959;
  --border-color: #d8dde6;
  --bg-secondary: #e8ecf2;
}
[data-theme="light"] .slide { background: var(--slide-bg); }
[data-theme="light"] .slide h1,
[data-theme="light"] .slide h2 { color: #1a1a1a; }

/* 타이틀 슬라이드: 라이트 모드에서도 독립적인 그라디언트 */
[data-theme="light"] .slide--title {
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
}
[data-theme="light"] .slide--title h1 { color: #0f172a; }
```

```javascript
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  document.getElementById('theme-toggle').textContent = next === 'light' ? '☀️' : '🌙';
  try { localStorage.setItem('ppt-theme', next); } catch (_) {}
}

function initTheme() {
  let saved = 'dark';
  try { saved = localStorage.getItem('ppt-theme') || 'dark'; } catch (_) {}
  document.documentElement.dataset.theme = saved;
  document.getElementById('theme-toggle').textContent = saved === 'light' ? '☀️' : '🌙';
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}
```

### 핵심 단어 강조 패턴 (.hl)

제목 및 본문에서 핵심 단어를 강조할 때 사용하는 공통 클래스.
`var(--primary)`를 사용하므로 테마 전환 시 자동으로 색상이 변경된다.

```css
.hl {
  color: var(--primary);
  font-style: normal;
}
```

```html
<h2><span class="hl">핵심</span> 설계 원칙</h2>
<li>GPU 가속: <span class="hl">transform + opacity</span>만 애니메이션</li>
```
