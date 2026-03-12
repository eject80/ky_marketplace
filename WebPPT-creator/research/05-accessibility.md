# Agent 5: 접근성 (ARIA, 포커스 관리)

## 1. ARIA 역할 및 속성

### 프레젠테이션 컨테이너
```html
<div class="presentation"
     role="region"
     aria-label="프레젠테이션"
     aria-roledescription="슬라이드쇼">
```

### 개별 슬라이드
```html
<section class="slide"
         role="group"
         aria-roledescription="슬라이드"
         aria-label="1 / 10"
         aria-hidden="true">   <!-- 비활성 슬라이드 -->
```

```javascript
// 슬라이드 전환 시 ARIA 업데이트
function updateAriaAttributes(index) {
  slides.forEach((slide, i) => {
    const isActive = i === index;
    slide.setAttribute('aria-hidden', !isActive);
    slide.setAttribute('aria-label', `${i + 1} / ${slides.length}`);
  });
}
```

### 진행 상태 알림 (Live Region)
```html
<!-- 슬라이드 변경을 스크린리더에 알림 -->
<div class="sr-only" aria-live="polite" aria-atomic="true" id="slide-status">
  슬라이드 1 / 10
</div>
```

```javascript
function announceSlideChange(index) {
  const status = document.getElementById('slide-status');
  status.textContent = `슬라이드 ${index + 1} / ${slides.length}`;
}
```

---

## 2. 포커스 관리

### 슬라이드 전환 시 포커스 이동

```javascript
function focusSlide(slide) {
  // tabindex="-1": 프로그래밍 포커스 가능, 탭 순서 제외
  slide.setAttribute('tabindex', '-1');
  slide.focus({ preventScroll: true });
}

function goToSlide(index) {
  // ... 전환 완료 후
  focusSlide(slides[index]);
  updateAriaAttributes(index);
  announceSlideChange(index);
}
```

### inert 속성 (비활성 슬라이드 완전 차단)

```html
<!-- inert: 포커스, 클릭, 스크린리더 접근 모두 차단 -->
<section class="slide" inert>...</section>
```

```javascript
// 브라우저 지원 확인 후 사용
const supportsInert = 'inert' in HTMLElement.prototype;

function setSlideActive(slide, isActive) {
  if (supportsInert) {
    slide.inert = !isActive;
  } else {
    // Fallback: aria-hidden + tabindex
    slide.setAttribute('aria-hidden', !isActive);
    if (!isActive) {
      slide.querySelectorAll('a, button, input, [tabindex]').forEach(el => {
        el.setAttribute('tabindex', '-1');
        el.dataset.wasInteractive = 'true';
      });
    } else {
      slide.querySelectorAll('[data-was-interactive]').forEach(el => {
        el.removeAttribute('tabindex');
        delete el.dataset.wasInteractive;
      });
    }
  }
}
```

**inert 브라우저 지원:**
- Chrome 102+, Firefox 112+, Safari 15.5+
- IE/Edge Legacy: 미지원 → tabindex fallback 필요

---

## 3. :focus-visible 스타일링

```css
/* 마우스 클릭 시: 포커스 링 숨김 */
/* 키보드 탐색 시: 포커스 링 표시 */

.slide:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: -3px;
}

button:focus-visible,
a:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* 포커스 링 제거 (접근성 위반 - 사용 금지) */
/* *:focus { outline: none; }  ← 절대 사용 금지 */

/* 올바른 대체 방법 */
*:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 4. .sr-only 패턴

```css
/* 스크린리더만 접근 가능, 시각적으로 숨김 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 포커스 시 표시 (Skip to content 등) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## 5. prefers-reduced-motion 통합 적용

```css
/* 애니메이션 완전 비활성화 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```javascript
// JS에서도 감지
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 동적 감지 (사용자가 런타임 중 설정 변경 시)
window.matchMedia('(prefers-reduced-motion: reduce)')
  .addEventListener('change', (e) => {
    if (e.matches) {
      // 애니메이션 비활성화
      document.documentElement.style.setProperty('--duration-normal', '0ms');
    } else {
      document.documentElement.style.removeProperty('--duration-normal');
    }
  });
```

---

## 6. WCAG 색상 대비 기준

| 레벨 | 일반 텍스트 | 대형 텍스트 (18pt+) | UI 컴포넌트 |
|---|---|---|---|
| AA (최소) | 4.5:1 | 3:1 | 3:1 |
| AAA (향상) | 7:1 | 4.5:1 | - |

### 기본 테마 대비비 설계

```css
:root {
  /* 흰 배경(#fff) 기준 */
  --slide-color: #1a1a1a;      /* 대비비: ~17:1 ✅ */
  --text-secondary: #595959;   /* 대비비: ~7:1 ✅ AA */
  --primary: #0057b7;          /* 대비비: ~5.5:1 ✅ AA */
  --accent: #c55000;           /* 대비비: ~4.6:1 ✅ AA */
}

/* Dark 모드: 어두운 배경(#1a1a1a) 기준 */
@media (prefers-color-scheme: dark) {
  :root {
    --slide-color: #f0f0f0;    /* 대비비: ~16:1 ✅ */
    --text-secondary: #b0b0b0; /* 대비비: ~6.3:1 ✅ AA */
  }
}
```

---

## 7. 키보드 접근성 체크리스트

```javascript
// ✅ 모든 기능을 키보드로 접근 가능
const KEY_MAP = {
  'ArrowRight': 'next',
  'ArrowLeft':  'prev',
  ' ':          'next',   // Space
  'PageDown':   'next',
  'PageUp':     'prev',
  'Home':       'first',
  'End':        'last',
  'f':          'fullscreen',
  'n':          'notes',
  '?':          'help',
  'Escape':     'escape',
};

// ✅ 모달/오버레이 열릴 때: 포커스 트랩
function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });
}

// ✅ 모달 닫힐 때: 이전 포커스 복원
let lastFocusedElement = null;

function openModal(modal) {
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  trapFocus(modal);
  modal.querySelector('button, [href], input')?.focus();
}

function closeModal(modal) {
  modal.hidden = true;
  lastFocusedElement?.focus();
}
```

---

## 8. 접근성 테스트 체크리스트

| 항목 | 확인 방법 |
|---|---|
| 키보드 탐색 | Tab, 화살표 키만으로 전체 기능 사용 |
| 스크린리더 | NVDA/VoiceOver로 슬라이드 내용 읽기 |
| 고대비 모드 | Windows 고대비 / macOS 증가 대비 |
| 확대 200% | 브라우저 텍스트 크기 200% 에서 레이아웃 확인 |
| reduced-motion | OS 설정 or DevTools에서 모션 감소 활성화 |
| 색상 대비 | Chrome DevTools > Accessibility > Contrast |
