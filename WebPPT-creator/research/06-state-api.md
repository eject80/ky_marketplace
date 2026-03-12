# Agent 6: 상태 관리 & JavaScript API 설계

## 1. 전체 State 모델

```javascript
const state = {
  // 슬라이드 상태
  currentSlide: 0,          // 0-based 인덱스
  totalSlides: 0,           // 전체 슬라이드 수

  // Step/Build 상태
  currentStep: 0,           // 현재 슬라이드에서 표시된 step 수
  totalSteps: 0,            // 현재 슬라이드의 전체 step 수

  // UI 상태
  isAnimating: false,       // 전환 중 입력 잠금
  isFullscreen: false,      // 전체화면 여부
  isNotesVisible: false,    // 발표자 노트 표시 여부
  isHelpVisible: false,     // 도움말 오버레이 표시 여부

  // 설정
  transitionDuration: 300,  // ms (prefers-reduced-motion 시 0)
  theme: 'default',         // 테마 이름
};
```

---

## 2. 초기화 패턴

```javascript
function init() {
  // DOM 수집
  const container = document.querySelector('.presentation');
  const slideElements = [...container.querySelectorAll('.slide')];

  state.totalSlides = slideElements.length;

  // prefers-reduced-motion 반영
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    state.transitionDuration = 0;
  }

  // 각 슬라이드 초기화
  slideElements.forEach((slide, i) => {
    slide.dataset.slideIndex = i;
    slide.setAttribute('aria-hidden', 'true');
    if (typeof slide.inert !== 'undefined') slide.inert = true;
  });

  // URL hash에서 초기 슬라이드 결정
  const initialIndex = parseHash(location.hash);
  goTo(initialIndex, { animate: false });

  // 이벤트 리스너 등록
  registerKeyboard();
  registerTouch(container);
  registerHashChange();
}

document.addEventListener('DOMContentLoaded', init);
```

---

## 3. 핵심 API 함수

### goTo (중앙 함수)
```javascript
function goTo(index, options = {}) {
  const { animate = true, updateHash: shouldUpdateHash = true } = options;

  if (state.isAnimating) return false;
  if (index < 0 || index >= state.totalSlides) return false;

  // beforeslidechange 이벤트 (취소 가능)
  const before = new CustomEvent('beforeslidechange', {
    cancelable: true,
    detail: { from: state.currentSlide, to: index },
  });
  if (!container.dispatchEvent(before)) return false; // 취소됨

  const fromSlide = slides[state.currentSlide];
  const toSlide = slides[index];
  const direction = index > state.currentSlide ? 'next' : 'prev';

  // Step 초기화
  resetSteps(fromSlide);
  state.currentStep = 0;
  state.totalSteps = countSteps(toSlide);

  // 전환 실행
  if (animate && state.transitionDuration > 0) {
    state.isAnimating = true;
    doTransition(fromSlide, toSlide, direction, () => {
      state.isAnimating = false;
      afterSlideChange(index, shouldUpdateHash);
    });
  } else {
    // 즉시 전환
    fromSlide.classList.remove('active');
    toSlide.classList.add('active');
    afterSlideChange(index, shouldUpdateHash);
  }

  state.currentSlide = index;
  return true;
}

function afterSlideChange(index, direction, shouldUpdateHash) {
  updateAriaAttributes(index);
  updateProgress(index);
  announceSlideChange(index);
  if (shouldUpdateHash) updateHash(index);
  focusSlide(slides[index]);

  // step 자동 재생: 앞으로 → 순차, 뒤로 → 즉시 전체 표시
  autoPlaySteps(slides[index], direction === 'prev');

  // slidechanged 이벤트 (완료, 취소 불가)
  container.dispatchEvent(new CustomEvent('slidechanged', {
    detail: { current: index, total: state.totalSlides },
  }));
}
```

### next / prev (단순화)

step 제어는 `autoPlaySteps()`가 담당하므로 `next`/`prev`는 슬라이드 이동만 한다.

```javascript
function next() { goTo(state.currentSlide + 1); }
function prev() { goTo(state.currentSlide - 1); }
function first() { goTo(0); }
function last()  { goTo(state.totalSlides - 1); }
```

### toggleNotes / toggleFullscreen / toggleTheme
```javascript
function toggleNotes() {
  state.isNotesVisible = !state.isNotesVisible;
  const slide = slides[state.currentSlide];
  const notes = slide.querySelector('.slide__notes');

  if (!notes) return;

  let overlay = document.getElementById('notes-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'notes-overlay';
    overlay.className = 'notes-overlay';
    overlay.setAttribute('role', 'complementary');
    overlay.setAttribute('aria-label', '발표자 노트');
    overlay.addEventListener('click', () => toggleNotes());
    document.body.appendChild(overlay);
  }

  if (state.isNotesVisible) {
    overlay.innerHTML = notes.innerHTML;
    overlay.hidden = false;
  } else {
    overlay.hidden = true;
  }
}

async function toggleFullscreen() {
  state.isFullscreen = !state.isFullscreen;

  if (document.fullscreenElement) {
    await document.exitFullscreen().catch(() => {});
  } else {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) await req.call(el).catch(() => {});
  }
}

// 다크/라이트 테마 전환 (D 키 또는 화면 버튼)
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

---

## 4. CustomEvent 기반 플러그인 API

### 이벤트 목록

| 이벤트명 | cancelable | detail 내용 | 발생 시점 |
|---|---|---|---|
| `beforeslidechange` | ✅ | `{ from, to }` | 슬라이드 전환 직전 |
| `slidechanged` | ❌ | `{ current, total }` | 전환 완료 후 |
| `stepchange` | ❌ | `{ slide, step }` | step 표시/숨김 시 |

### 플러그인 훅 예시

```javascript
// 전환 취소 플러그인
container.addEventListener('beforeslidechange', (e) => {
  if (someCondition) {
    e.preventDefault(); // 전환 취소
  }
});

// 슬라이드 변경 감지 플러그인
container.addEventListener('slidechanged', (e) => {
  console.log(`슬라이드 ${e.detail.current + 1} / ${e.detail.total}`);
  // 외부 시스템에 통지 등
});

// Step 변경 감지
container.addEventListener('stepchange', (e) => {
  console.log(`슬라이드 ${e.detail.slide}, step ${e.detail.step}`);
});
```

---

## 5. IIFE 모듈 패턴

```javascript
(function(global) {
  'use strict';

  // private 스코프
  let slides = [];
  let container = null;
  const state = { /* ... */ };

  // private 함수들
  function init() { /* ... */ }
  function goTo(index, options) { /* ... */ }
  function next() { /* ... */ }
  function prev() { /* ... */ }

  // public API 노출
  global.Presentation = {
    init,
    goTo,
    next,
    prev,
    first,
    last,
    toggleNotes,
    toggleFullscreen,
    getState: () => ({ ...state }), // 불변 복사본 반환
  };
})(window);
```

---

## 6. executeAction 디스패처

```javascript
function executeAction(action) {
  const actions = {
    'next':       next,
    'prev':       prev,
    'first':      first,
    'last':       last,
    'fullscreen': toggleFullscreen,
    'notes':      toggleNotes,
    'help':       toggleHelp,
    'escape':     closeOverlays,
  };

  const fn = actions[action];
  if (fn) fn();
}

// 키보드, 버튼 모두 이 함수로 통합
document.addEventListener('keydown', (e) => {
  if (isInputFocused(e.target)) return;
  const action = KEY_MAP[e.key];
  if (!action) return;
  e.preventDefault();
  executeAction(action);
});
```

---

## 7. 상태 직렬화 / 복원

```javascript
// 현재 상태를 URL에 저장 (hash 기반)
function saveState() {
  const hash = `#slide-${state.currentSlide + 1}`;
  history.replaceState(
    { slide: state.currentSlide, step: state.currentStep },
    '',
    hash
  );
}

// History API popstate로 뒤로가기 지원
window.addEventListener('popstate', (e) => {
  if (e.state?.slide !== undefined) {
    goTo(e.state.slide, { animate: false, updateHash: false });
  }
});
```
