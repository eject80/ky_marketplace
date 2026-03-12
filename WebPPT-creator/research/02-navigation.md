# Agent 2: 키보드 & 마우스 네비게이션

## 1. 키보드 이벤트 처리

```javascript
const KEY_MAP = {
  'ArrowRight': 'next',
  'ArrowLeft':  'prev',
  ' ':          'next',   // Space
  'PageDown':   'next',
  'PageUp':     'prev',
  'Home':       'first',
  'End':        'last',
  'f':          'fullscreen',
  'F':          'fullscreen',
  'n':          'notes',
  '?':          'help',
  'Escape':     'escape',
};

document.addEventListener('keydown', (e) => {
  // 입력 필드 무시
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  if (e.target.contentEditable === 'true') return;

  const action = KEY_MAP[e.key];
  if (!action) return;

  e.preventDefault();
  executeAction(action);
});

function isInputFocused(el) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
    || el.contentEditable === 'true';
}
```

**keydown 선택 이유:** 즉시 반응, 낮은 지연시간

---

## 2. URL Hash 동기화

### 설계 결정
- **내부:** 0-based index
- **URL hash:** 1-based (`#slide-1`, `#slide-2`, ...)

```javascript
// Hash → 슬라이드 인덱스
function parseHash(hash = location.hash) {
  const id = hash.replace('#', '');
  if (!id) return 0;

  // "#slide-3" 형식
  const prefixed = id.match(/^slide-(\d+)$/);
  if (prefixed) return Math.max(0, parseInt(prefixed[1]) - 1);

  // "#5" 순수 숫자
  const num = parseInt(id);
  if (!isNaN(num)) return Math.max(0, num - 1);

  // ID로 검색
  const el = document.getElementById(id);
  if (el) return slides.indexOf(el);

  return 0;
}

// 슬라이드 인덱스 → Hash 업데이트
let isUpdatingHash = false;

function updateHash(index) {
  isUpdatingHash = true;
  history.replaceState(
    { slide: index },
    `Slide ${index + 1}`,
    `#slide-${index + 1}`
  );
  setTimeout(() => { isUpdatingHash = false; }, 0);
}

// Hash 변경 감지 (무한 루프 방지)
window.addEventListener('hashchange', () => {
  if (isUpdatingHash) return;
  const index = parseHash(location.hash);
  goTo(index, { updateHash: false });
});

// 페이지 로드 시 복원
window.addEventListener('DOMContentLoaded', () => {
  const index = parseHash(location.hash);
  goTo(index, { animate: false, updateHash: false });
});
```

### pushState vs replaceState

| 상황 | 메서드 | 이유 |
|---|---|---|
| 사용자 키/클릭 네비게이션 | `replaceState` | History 스택 오염 방지 |
| "뒤로가기로 슬라이드 이동" 원할 때 | `pushState` | History 스택 추가 |

---

## 3. 터치/스와이프 제스처

```javascript
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;
const SWIPE_THRESHOLD = 50; // px

// touchstart: passive (preventDefault 안 씀)
container.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isSwiping = false;
}, { passive: true });

// touchmove: 수평 스와이프 감지 시 스크롤 차단
container.addEventListener('touchmove', (e) => {
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);

  if (dx > 10 && dx > dy * 2) {
    isSwiping = true;
    e.preventDefault(); // 스크롤 차단
  }
}, { passive: false });

// touchend: 스와이프 완료 처리
container.addEventListener('touchend', (e) => {
  if (!isSwiping) return;
  const deltaX = touchStartX - e.changedTouches[0].clientX;

  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
    deltaX > 0 ? next() : prev();
  }
  isSwiping = false;
}, { passive: true });
```

**핵심:** 수평 이동량이 수직의 2배 이상일 때만 스와이프로 인식

---

## 4. 진행 표시

### CSS 변수 기반 진행 바
```css
:root { --current-slide: 0; --total-slides: 10; }

.progress-bar {
  width: calc(var(--current-slide) / var(--total-slides) * 100%);
  transition: width var(--duration-normal) var(--easing-out);
  height: 4px;
  background: var(--accent);
}
```

```javascript
function updateProgress(index) {
  document.documentElement.style.setProperty('--current-slide', index + 1);
  document.documentElement.style.setProperty('--total-slides', totalSlides);
}
```

### 슬라이드 번호
```html
<div class="slide-counter" aria-live="polite" aria-atomic="true">
  <span id="current-slide">1</span> / <span id="total-slides">10</span>
</div>
```

---

## 5. 전체화면 API

```javascript
async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) await req.call(el).catch(console.error);
  }
}

document.addEventListener('fullscreenchange', () => {
  const isFs = !!document.fullscreenElement;
  document.body.classList.toggle('fullscreen-mode', isFs);
});
```

### iOS Safari 제한
- `requestFullscreen()` 미지원 (iOS 16.4 이전)
- 대안: `viewport-fit=cover` + `env(safe-area-inset-*)` 활용

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
.presentation {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

---

## 6. 도움말 오버레이 (? 키)

```html
<div id="help-overlay" class="help-overlay hidden" role="dialog" aria-modal="true"
     aria-label="키보드 단축키">
  <div class="help-content">
    <h2>키보드 단축키</h2>
    <dl>
      <dt><kbd>→</kbd> / <kbd>Space</kbd></dt><dd>다음 슬라이드</dd>
      <dt><kbd>←</kbd></dt><dd>이전 슬라이드</dd>
      <dt><kbd>Home</kbd> / <kbd>End</kbd></dt><dd>처음 / 마지막</dd>
      <dt><kbd>F</kbd></dt><dd>전체화면</dd>
      <dt><kbd>N</kbd></dt><dd>발표자 노트</dd>
      <dt><kbd>?</kbd></dt><dd>이 도움말</dd>
    </dl>
    <button onclick="this.closest('.help-overlay').classList.add('hidden')">닫기</button>
  </div>
</div>
```

```css
.help-overlay.hidden { display: none; }
.help-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.85);
  display: grid; place-items: center;
  z-index: 9999;
}
.help-content {
  background: white; padding: 2rem;
  border-radius: 8px; max-width: 480px;
}
kbd {
  background: #f0f0f0; border: 1px solid #ccc;
  border-radius: 3px; padding: 2px 6px;
  font-family: monospace;
}
```
