# Agent 4: 콘텐츠 빌드 효과 & Speaker Notes

## 1. step/build 애니메이션 HTML 규칙

### 권장: 순서형 `data-step` 속성

```html
<section class="slide">
  <h2>주제</h2>
  <ul>
    <li class="step" data-step="1">첫 번째 포인트</li>
    <li class="step" data-step="2">두 번째 포인트</li>
    <li class="step" data-step="3">세 번째 포인트</li>
  </ul>

  <!-- 코드 블록 자체가 step인 경우 -->
  <div class="step" data-step="4">
    <pre class="code-block"><code>// 코드 예시</code></pre>
  </div>
</section>
```

### data-step 설계 원칙

| 방식 | 예시 | 특징 |
|---|---|---|
| 순서형 (권장) | `data-step="1"` | 명확한 순서, 점프 가능 |
| Boolean형 | `class="fragment"` | 간결하나 순서 불명확 |

**슬라이드 진입 시 정책:** 전체 숨김 → next 입력마다 순차 표시

---

## 2. CSS 구현

```css
/* 기본: 숨김 상태 */
.step {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

/* 표시 상태 */
.step.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 강조 효과 변형 */
.step[data-step-style="zoom"] {
  transform: scale(0.8);
}
.step[data-step-style="zoom"].visible {
  transform: scale(1);
}

/* Reduced Motion 대응 */
@media (prefers-reduced-motion: reduce) {
  .step { transition: opacity 0.1s ease; transform: none; }
  .step.visible { transform: none; }
}
```

---

## 3. Step 자동 재생 정책 (권장)

슬라이드 진입 시 step을 키보드 없이 자동으로 순차 재생한다.
`next()`/`prev()`는 슬라이드 간 이동만 담당하고, step 제어는 `autoPlaySteps()`가 맡는다.

```javascript
let stepTimers = [];

function clearStepTimers() {
  stepTimers.forEach(clearTimeout);
  stepTimers = [];
}

function resetSteps(slide) {
  clearStepTimers(); // 진행 중인 타이머도 취소
  slide.querySelectorAll('.step.visible').forEach(s => s.classList.remove('visible'));
}

// 슬라이드 진입 시 자동 재생
// immediate=true: 딜레이 없이 전체 즉시 표시 (이전 슬라이드로 돌아올 때)
const STEP_DELAY = 350; // ms

function autoPlaySteps(slide, immediate) {
  const steps = [...slide.querySelectorAll('.step')].sort((a, b) =>
    parseInt(a.dataset.step || 0) - parseInt(b.dataset.step || 0)
  );
  if (steps.length === 0) return;

  steps.forEach((step, i) => {
    if (immediate) {
      step.classList.add('visible');
    } else {
      const t = setTimeout(() => {
        step.classList.add('visible');
        state.currentStep = i + 1;
      }, (i + 1) * STEP_DELAY);
      stepTimers.push(t);
    }
  });

  if (immediate) state.currentStep = steps.length;
}

// next/prev는 슬라이드 이동만 담당
function next() { goTo(state.currentSlide + 1); }
function prev() { goTo(state.currentSlide - 1); }
```

### afterChange에서 호출

```javascript
function afterChange(index, direction) {
  // ...
  // 앞으로 이동: 순차 자동 재생 / 뒤로 이동: 즉시 전체 표시
  autoPlaySteps(slides[index], direction === 'prev');
}
```

### 설계 의도

| 방식 | 키보드 조작 | 발표 흐름 |
|---|---|---|
| 수동 (이전 방식) | step마다 키 입력 필요 | 발표자가 직접 타이밍 제어 |
| **자동 (권장)** | 슬라이드 전환만 제어 | 진입 즉시 내용이 흘러나옴 |

> 수동 방식이 필요하면 `autoPlaySteps()` 호출을 제거하고 `next()`에 step 로직을 복원한다.

---

## 4. 코드 블록 하이라이팅

### 순수 CSS 기본 방식 (외부 의존성 없음)

```css
.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1.5rem;
  border-radius: 8px;
  font-family: var(--font-family-mono);
  font-size: clamp(0.75rem, 1.2vw, 1rem);
  overflow-x: auto;
  text-align: left;
}

/* 토큰 색상 (Dracula 테마) */
.token-keyword  { color: #ff79c6; }
.token-string   { color: #f1fa8c; }
.token-function { color: #50fa7b; }
.token-comment  { color: #6272a4; font-style: italic; }
.token-number   { color: #bd93f9; }
.token-property { color: #8be9fd; }
```

### CDN 선택 기능 (graceful degradation)

```html
<!-- highlight.js CDN (선택 기능) -->
<link id="hljs-css" rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
<script id="hljs-script"
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
        onload="initHighlighting()" onerror="onHljsError()"></script>
```

```javascript
function initHighlighting() {
  document.querySelectorAll('pre code').forEach(el => {
    hljs.highlightElement(el);
  });
}

function onHljsError() {
  console.warn('highlight.js CDN 실패 - 기본 CSS 스타일로 fallback');
  // 이미 CSS 토큰 클래스가 적용되어 있으므로 기본 표시됨
}
```

### 특정 줄 강조 (`data-highlight-lines`)

```html
<pre class="code-block" data-highlight-lines="2,3">
<code class="code-line">function greet() {</code>
<code class="code-line">  const name = "World";</code>
<code class="code-line">  return "Hello, " + name;</code>
<code class="code-line">}</code>
</pre>
```

```css
.code-line.highlight {
  background: rgba(255, 200, 0, 0.2);
  border-left: 3px solid #ffc107;
  padding-left: 0.5rem;
}
```

```javascript
function applyLineHighlights() {
  document.querySelectorAll('[data-highlight-lines]').forEach(pre => {
    const lines = pre.dataset.highlightLines.split(',').map(Number);
    pre.querySelectorAll('.code-line').forEach((line, i) => {
      if (lines.includes(i + 1)) line.classList.add('highlight');
    });
  });
}
```

---

## 5. Speaker Notes 구조

### HTML 마크업

```html
<section class="slide">
  <div class="slide__content">
    <!-- 청중에게 보이는 콘텐츠 -->
  </div>
  <aside class="slide__notes" role="doc-notes">
    <h3>발표자 노트</h3>
    <ul>
      <li>핵심 포인트 1</li>
      <li>예상 질문 처리 방법</li>
      <li>시간 배분: 약 2분</li>
    </ul>
  </aside>
</section>
```

### CSS 숨김 방법 비교

| 방법 | 레이아웃 | 스크린리더 | 권장 |
|---|---|---|---|
| `display: none` | 제거 | 안 읽힘 | ✅ 기본 |
| `visibility: hidden` | 유지 | 안 읽힘 | 레이아웃 유지 필요 시 |
| `.sr-only` clip | 제거 | 읽힘 | 접근성 유지 필요 시 |

```css
/* 기본: 숨김 */
.slide__notes { display: none; }

/* N 키 토글 시 오버레이 표시 */
.notes-overlay {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: rgba(0, 0, 0, 0.92);
  color: #e0e0e0;
  padding: 1.5rem;
  max-height: 40vh;
  overflow-y: auto;
  border-top: 3px solid #ffc107;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### N 키 노트 토글

```javascript
function toggleNotesOverlay() {
  const slide = slides[currentSlideIndex];
  const notes = slide.querySelector('.slide__notes');
  if (!notes) return;

  let overlay = document.getElementById('notes-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'notes-overlay';
    overlay.className = 'notes-overlay';
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }

  if (overlay.hidden) {
    overlay.innerHTML = notes.innerHTML;
    overlay.hidden = false;
  } else {
    overlay.hidden = true;
  }
}
```

### Presenter Mode (window.open + postMessage)

```javascript
let presenterWindow = null;

function openPresenterMode() {
  presenterWindow = window.open(
    '/presenter.html', 'presenter',
    'width=800,height=600'
  );

  document.addEventListener('slidechange', (e) => {
    presenterWindow?.postMessage({
      type: 'slidechange',
      data: {
        current: e.detail.to + 1,
        total: totalSlides,
        notes: getCurrentNotes(),
      }
    }, window.location.origin);
  });
}
```

---

## 6. Step 상태 모델

```javascript
const state = {
  currentSlide: 0,
  currentStep: 0,      // 표시된 step 수
  totalSteps: 0,       // 현재 슬라이드의 전체 step 수
  isAnimating: false,
};

// step 관련 헬퍼
function getHiddenSteps(slide) {
  return [...slide.querySelectorAll('.step')].filter(s => !s.classList.contains('visible'));
}

function getVisibleSteps(slide) {
  return [...slide.querySelectorAll('.step')].filter(s => s.classList.contains('visible'));
}

function countSteps(slide) {
  return slide.querySelectorAll('.step').length;
}
```
