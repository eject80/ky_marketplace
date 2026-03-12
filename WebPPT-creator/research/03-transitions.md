# Agent 3: 슬라이드 전환 애니메이션

## 1. CSS Transition vs Animation vs Web Animations API

| 기법 | 사용 시나리오 | 장점 | 단점 |
|---|---|---|---|
| **CSS Transition** | 슬라이드 전환 (fade/slide) | 간단, GPU 가속, 브라우저 지원 완벽 | 초기↔최종 상태만, 복잡한 다단계 불가 |
| **CSS @keyframes** | 복합 효과, 무한 반복 | 세밀한 제어, 자동 시작 | 동적 생성 어려움 |
| **Web Animations API** | 드래그, 실시간 제어 | JavaScript 완전 제어 | Safari 부분 지원 |

**슬라이드 엔진 권장:** CSS Transition 기본 + 필요 시 Web Animations API

---

## 2. 핵심 전환 효과 구현

### Fade 전환
```css
.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--duration-normal) ease-in-out;
  z-index: 1;
  pointer-events: none;
}
.slide.active {
  opacity: 1;
  z-index: 2;
  pointer-events: auto;
}
.slide.exit { opacity: 0; z-index: 1; }
```

### Slide (좌우 이동) 전환
```css
.slide {
  position: absolute;
  inset: 0;
  transform: translateX(100%);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.5s ease-in-out;
  opacity: 0;
}
.slide.active {
  transform: translateX(0);
  opacity: 1;
  z-index: 2;
}
.slide.prev {
  transform: translateX(-100%);
  opacity: 0;
}
```

### Zoom 전환
```css
.slide {
  position: absolute;
  inset: 0;
  transform: scale(0.85);
  opacity: 0;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.6s ease-in-out;
}
.slide.active {
  transform: scale(1);
  opacity: 1;
  z-index: 2;
}
.slide.exit {
  transform: scale(0.7);
  opacity: 0;
}
```

### data-transition 속성으로 전환 타입 지정
```css
/* 슬라이드별 전환 타입 지정 */
.slide[data-transition="fade"].active    { opacity: 1; transform: none; }
.slide[data-transition="slide"].active  { transform: translateX(0); }
.slide[data-transition="zoom"].active   { transform: scale(1); opacity: 1; }
```

---

## 3. 동시 표시 구조 (Out + In 레이어)

```
시간 흐름:
t=0   Outgoing: z-index=2 (위), Incoming: z-index=1 (아래)
t=150 Outgoing: 서서히 사라짐, Incoming: 서서히 나타남
t=300 Outgoing: 정리, Incoming: z-index=2로 승격
```

```javascript
function transitionSlides(fromSlide, toSlide, direction = 'next') {
  // z-index: 나가는 슬라이드를 위에 배치
  fromSlide.style.zIndex = 2;
  toSlide.style.zIndex = 1;

  fromSlide.classList.remove('active');
  fromSlide.classList.add(direction === 'next' ? 'prev' : 'next');

  toSlide.classList.remove('prev', 'next');
  toSlide.classList.add('active');
}
```

---

## 4. GPU 가속 최적화

### 애니메이션 가능 속성 선택

| 속성 | 비용 | GPU 가속 | 권장 |
|---|---|---|---|
| `transform` | 매우 낮음 | ✅ | ✅ 사용 |
| `opacity` | 매우 낮음 | ✅ | ✅ 사용 |
| `filter` | 낮음 | ✅ | 주의 |
| `width/height` | 높음 (Reflow) | ❌ | ❌ 금지 |
| `top/left` | 높음 (Reflow) | ❌ | ❌ 금지 |
| `background-color` | 중간 (Repaint) | ❌ | ❌ 피하기 |

### `will-change` 사용 지침

```javascript
// ✅ 올바른 사용: 필요한 순간에만 적용
function prepareTransition(slide) {
  slide.style.willChange = 'transform, opacity';
}

function cleanupTransition(slide) {
  slide.style.willChange = 'auto'; // 완료 후 즉시 해제
}
```

```css
/* ❌ 금지: 항상 활성화 */
.slide { will-change: transform; } /* 메모리 낭비 */

/* ✅ 선택적 적용 */
.slide.active,
.slide.prev,
.slide.next { will-change: transform, opacity; }
```

---

## 5. 애니메이션 잠금 (isAnimating 패턴)

### 완전한 잠금 구현

```javascript
let isAnimating = false;

function goToSlide(index) {
  if (isAnimating) return false;
  if (index === currentIndex) return false;
  if (index < 0 || index >= totalSlides) return false;

  isAnimating = true;
  disableButtons();

  const fromSlide = slides[currentIndex];
  const toSlide = slides[index];

  // 전환 실행
  doTransition(fromSlide, toSlide, index > currentIndex ? 'next' : 'prev');

  // 타임아웃 폴백 (transitionend 실패 대비)
  const timeout = setTimeout(() => {
    completeTransition();
  }, TRANSITION_DURATION + 50);

  // transitionend 이벤트
  toSlide.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'opacity' && e.propertyName !== 'transform') return;
    clearTimeout(timeout);
    completeTransition();
  }, { once: true });

  currentIndex = index;
  return true;
}

function completeTransition() {
  isAnimating = false;
  enableButtons();
  // z-index 정리
  slides.forEach((s, i) => {
    s.style.zIndex = i === currentIndex ? 2 : 1;
  });
}
```

### 핵심: transitionend 중복 발생 해결

```javascript
// CSS에 여러 transition 속성이 있으면 각각 transitionend 발생
// propertyName 필터로 첫 번째만 처리
slide.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'opacity') {   // 특정 속성만 감지
    completeTransition();
  }
}, { once: true });
```

---

## 6. prefers-reduced-motion 대응

```css
/* CSS 레벨: 완전 비활성화 */
@media (prefers-reduced-motion: reduce) {
  .slide { transition: none !important; }
  .step  { transition: none !important; }
}

/* 또는: 대체 효과 (빠른 페이드) */
@media (prefers-reduced-motion: reduce) {
  .slide { transition: opacity 0.1s ease; }
  .step  { transition: opacity 0.1s ease; }
}
```

```javascript
// JS 레벨: 애니메이션 duration을 0으로 설정
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function goToSlide(index) {
  const animate = !prefersReducedMotion;
  // animate=false 이면 transitionDuration=0 적용
}

// 동적 감지
window.matchMedia('(prefers-reduced-motion: reduce)')
  .addEventListener('change', (e) => {
    // 런타임 중 사용자가 설정 변경 시 대응
  });
```

---

## 7. 전환 효과 선택 기준

| 시나리오 | 권장 전환 | 이유 |
|---|---|---|
| 기술 문서, 차분한 발표 | fade | 집중 방해 없음 |
| 스토리텔링, 흐름 강조 | slide | 방향성 표현 |
| 임팩트 강조 | zoom | 시선 집중 |
| reduced-motion 활성 | instant cut (none) | 접근성 |
