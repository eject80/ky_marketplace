/**
 * WebPPT Engine — presentation.js  (수정하지 마세요)
 * 이 파일은 프레젠테이션 엔진입니다.
 *
 * 공개 API: window.Presentation
 *   .next()          — 다음 슬라이드
 *   .prev()          — 이전 슬라이드
 *   .first()         — 첫 번째 슬라이드
 *   .last()          — 마지막 슬라이드
 *   .goTo(n)         — n번 슬라이드로 이동 (0-based)
 *   .toggleNotes()   — 발표자 노트 토글
 *   .toggleTheme()   — 다크/라이트 모드 전환
 *   .getState()      — 현재 상태 객체 반환
 *
 * CustomEvent (container에서 발생):
 *   beforeslidechange  — { from, to }  cancelable
 *   slidechanged       — { current, total }
 *   stepchange         — { slide, step }
 */
(function(global) {
  'use strict';

  /* ===== 상태 모델 ===== */
  const state = {
    currentSlide: 0,
    totalSlides: 0,
    currentStep: 0,
    totalSteps: 0,
    isAnimating: false,
    isNotesVisible: false,
    isHelpVisible: false,
  };

  /* ===== DOM 참조 ===== */
  let container, slides;

  /* ===== 키맵 ===== */
  const KEY_MAP = {
    'ArrowRight': 'next',
    'ArrowLeft':  'prev',
    ' ':          'next',
    'PageDown':   'next',
    'PageUp':     'prev',
    'Home':       'first',
    'End':        'last',
    'f':          'fullscreen',
    'F':          'fullscreen',
    'n':          'notes',
    'N':          'notes',
    'd':          'theme',
    'D':          'theme',
    '?':          'help',
    'Escape':     'escape',
  };

  /* ===== Step 헬퍼 ===== */
  let stepTimers = [];

  function clearStepTimers() {
    stepTimers.forEach(clearTimeout);
    stepTimers = [];
  }

  function resetSteps(slide) {
    clearStepTimers();
    slide.querySelectorAll('.step.visible').forEach(s => s.classList.remove('visible'));
  }

  function countSteps(slide) {
    return slide.querySelectorAll('.step').length;
  }

  /**
   * 슬라이드 진입 시 .step 요소를 순서대로 자동 표시.
   * @param {Element} slide
   * @param {boolean} immediate - true이면 딜레이 없이 전체 즉시 표시
   */
  function autoPlaySteps(slide, immediate) {
    const steps = [...slide.querySelectorAll('.step')].sort((a, b) =>
      parseInt(a.dataset.step || 0) - parseInt(b.dataset.step || 0)
    );
    if (steps.length === 0) return;

    const STEP_DELAY = 350; // step 간 간격 (ms)

    steps.forEach((step, i) => {
      if (immediate) {
        step.classList.add('visible');
      } else {
        const t = setTimeout(() => {
          step.classList.add('visible');
          state.currentStep = i + 1;
          container.dispatchEvent(new CustomEvent('stepchange', {
            detail: { slide: state.currentSlide, step: state.currentStep },
            bubbles: true,
          }));
        }, (i + 1) * STEP_DELAY);
        stepTimers.push(t);
      }
    });

    if (immediate) state.currentStep = steps.length;
  }

  /* ===== 전환 효과 ===== */
  function doTransition(fromSlide, toSlide, direction, onComplete) {
    const dur = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--duration-normal')) || 300;

    if (dur <= 1) {
      fromSlide.classList.remove('active', 'from-left', 'exit-left', 'exit-right');
      toSlide.classList.remove('from-left', 'exit-left', 'exit-right');
      toSlide.classList.add('active');
      onComplete();
      return;
    }

    fromSlide.style.zIndex = 3;
    fromSlide.classList.add(direction === 'next' ? 'exit-left' : 'exit-right');
    fromSlide.classList.remove('active');

    if (direction === 'prev') toSlide.classList.add('from-left');
    toSlide.style.zIndex = 2;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toSlide.classList.add('active');
        toSlide.classList.remove('from-left');
      });
    });

    const cleanup = () => {
      fromSlide.style.zIndex = '';
      toSlide.style.zIndex = '';
      fromSlide.classList.remove('exit-left', 'exit-right', 'from-left');
      onComplete();
    };

    const timeout = setTimeout(cleanup, dur + 100);
    toSlide.addEventListener('transitionend', function handler(e) {
      if (e.propertyName !== 'opacity' && e.propertyName !== 'transform') return;
      clearTimeout(timeout);
      toSlide.removeEventListener('transitionend', handler);
      cleanup();
    });
  }

  /* ===== ARIA & UI 업데이트 ===== */
  function updateAriaAttributes(index) {
    slides.forEach((slide, i) => {
      const isActive = i === index;
      slide.setAttribute('aria-hidden', String(!isActive));
      if ('inert' in HTMLElement.prototype) slide.inert = !isActive;
    });
  }

  function updateProgress(index) {
    const root = document.documentElement;
    root.style.setProperty('--current-slide', index + 1);
    root.style.setProperty('--total-slides', state.totalSlides);
    const cur = document.getElementById('current-num');
    if (cur) cur.textContent = index + 1;
  }

  function announceSlideChange(index) {
    const el = document.getElementById('slide-status');
    if (el) el.textContent = `슬라이드 ${index + 1} / ${state.totalSlides}`;
  }

  function focusSlide(slide) {
    if (!slide.hasAttribute('tabindex')) slide.setAttribute('tabindex', '-1');
    slide.focus({ preventScroll: true });
  }

  /* ===== URL Hash ===== */
  let isUpdatingHash = false;

  function parseHash(hash) {
    hash = hash || location.hash;
    const id = hash.replace('#', '');
    if (!id) return 0;
    const m = id.match(/^slide-(\d+)$/);
    if (m) return Math.max(0, Math.min(parseInt(m[1]) - 1, state.totalSlides - 1));
    const n = parseInt(id);
    if (!isNaN(n)) return Math.max(0, Math.min(n - 1, state.totalSlides - 1));
    return 0;
  }

  function updateHash(index) {
    isUpdatingHash = true;
    history.replaceState({ slide: index }, '', '#slide-' + (index + 1));
    setTimeout(() => { isUpdatingHash = false; }, 0);
  }

  /* ===== 핵심 goTo ===== */
  function goTo(index, options) {
    options = options || {};
    const animate = options.animate !== false;
    const doUpdateHash = options.updateHash !== false;

    if (state.isAnimating) return false;
    if (index < 0 || index >= state.totalSlides) return false;
    if (index === state.currentSlide && animate) return false;

    const before = new CustomEvent('beforeslidechange', {
      cancelable: true,
      detail: { from: state.currentSlide, to: index },
      bubbles: true,
    });
    if (!container.dispatchEvent(before)) return false;

    const fromSlide = slides[state.currentSlide];
    const toSlide = slides[index];
    const direction = index >= state.currentSlide ? 'next' : 'prev';

    if (fromSlide !== toSlide) resetSteps(fromSlide);
    state.currentStep = 0;
    state.totalSteps = countSteps(toSlide);
    state.currentSlide = index;

    function afterChange() {
      updateAriaAttributes(index);
      updateProgress(index);
      announceSlideChange(index);
      if (doUpdateHash) updateHash(index);
      focusSlide(toSlide);
      autoPlaySteps(toSlide, direction === 'prev');

      const overlay = document.getElementById('notes-overlay');
      if (overlay && !overlay.hidden) {
        const notes = toSlide.querySelector('.slide__notes');
        overlay.innerHTML = notes ? notes.innerHTML : '';
      }

      container.dispatchEvent(new CustomEvent('slidechanged', {
        detail: { current: index, total: state.totalSlides },
        bubbles: true,
      }));
    }

    if (animate && fromSlide !== toSlide) {
      state.isAnimating = true;
      doTransition(fromSlide, toSlide, direction, () => {
        state.isAnimating = false;
        afterChange();
      });
    } else {
      fromSlide.classList.remove('active');
      toSlide.classList.add('active');
      afterChange();
    }

    return true;
  }

  /* ===== next / prev ===== */
  function next() { goTo(state.currentSlide + 1); }
  function prev() { goTo(state.currentSlide - 1); }
  function first() { goTo(0); }
  function last()  { goTo(state.totalSlides - 1); }

  /* ===== 발표자 노트 토글 ===== */
  function toggleNotes() {
    state.isNotesVisible = !state.isNotesVisible;
    const slide = slides[state.currentSlide];
    const notes = slide.querySelector('.slide__notes');

    let overlay = document.getElementById('notes-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'notes-overlay';
      overlay.className = 'notes-overlay';
      overlay.setAttribute('role', 'complementary');
      overlay.setAttribute('aria-label', '발표자 노트');
      overlay.addEventListener('click', () => { state.isNotesVisible = false; overlay.hidden = true; });
      document.body.appendChild(overlay);
    }

    if (state.isNotesVisible && notes) {
      overlay.innerHTML = notes.innerHTML;
      overlay.hidden = false;
    } else {
      overlay.hidden = true;
    }
  }

  /* ===== 전체화면 ===== */
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function() {});
    } else {
      var el = document.documentElement;
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el).catch(function() {});
    }
  }

  /* ===== 도움말 ===== */
  function toggleHelp() {
    state.isHelpVisible = !state.isHelpVisible;
    const overlay = document.getElementById('help-overlay');
    if (!overlay) return;
    overlay.hidden = !state.isHelpVisible;
    if (state.isHelpVisible) {
      const btn = document.getElementById('help-close');
      if (btn) btn.focus();
    }
  }

  function closeOverlays() {
    if (state.isHelpVisible) toggleHelp();
    if (state.isNotesVisible) toggleNotes();
  }

  /* ===== 테마 토글 ===== */
  function toggleTheme() {
    const isDark = document.documentElement.dataset.theme !== 'light';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = next === 'light' ? '☀️' : '🌙';
    try { localStorage.setItem('ppt-theme', next); } catch (_) {}
  }

  function initTheme() {
    let saved = 'dark';
    try { saved = localStorage.getItem('ppt-theme') || 'dark'; } catch (_) {}
    document.documentElement.dataset.theme = saved;
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = saved === 'light' ? '☀️' : '🌙';
      btn.addEventListener('click', toggleTheme);
    }
  }

  /* ===== executeAction ===== */
  function executeAction(action) {
    const map = {
      next: next, prev: prev, first: first, last: last,
      fullscreen: toggleFullscreen,
      notes: toggleNotes,
      theme: toggleTheme,
      help: toggleHelp,
      escape: closeOverlays,
    };
    if (map[action]) map[action]();
  }

  /* ===== 키보드 이벤트 ===== */
  function isInputFocused(el) {
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
      || el.contentEditable === 'true';
  }

  function registerKeyboard() {
    document.addEventListener('keydown', function(e) {
      if (isInputFocused(e.target)) return;
      const action = KEY_MAP[e.key];
      if (!action) return;
      e.preventDefault();
      executeAction(action);
    });
  }

  /* ===== 터치 스와이프 ===== */
  function registerTouch(el) {
    let startX = 0, startY = 0, swiping = false;
    const THRESHOLD = 50;

    el.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swiping = false;
    }, { passive: true });

    el.addEventListener('touchmove', function(e) {
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > 10 && dx > dy * 2) {
        swiping = true;
        e.preventDefault();
      }
    }, { passive: false });

    el.addEventListener('touchend', function(e) {
      if (!swiping) return;
      const delta = startX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > THRESHOLD) {
        delta > 0 ? next() : prev();
      }
      swiping = false;
    }, { passive: true });
  }

  /* ===== Hash 이벤트 ===== */
  function registerHashChange() {
    window.addEventListener('hashchange', function() {
      if (isUpdatingHash) return;
      goTo(parseHash(location.hash), { animate: true, updateHash: false });
    });
  }

  /* ===== 도움말 버튼 ===== */
  function registerHelpClose() {
    const closeBtn = document.getElementById('help-close');
    const helpOverlay = document.getElementById('help-overlay');
    if (closeBtn) closeBtn.addEventListener('click', toggleHelp);
    if (helpOverlay) helpOverlay.addEventListener('click', function(e) {
      if (e.target === e.currentTarget) toggleHelp();
    });
  }

  /* ===== 초기화 ===== */
  function init() {
    container = document.getElementById('presentation');
    if (!container) { console.error('[WebPPT] id="presentation" 요소를 찾을 수 없습니다.'); return; }

    slides = [...container.querySelectorAll('.slide')];
    state.totalSlides = slides.length;

    slides.forEach(function(slide) {
      slide.setAttribute('aria-hidden', 'true');
      if ('inert' in HTMLElement.prototype) slide.inert = true;
    });

    const totalEl = document.getElementById('total-num');
    if (totalEl) totalEl.textContent = state.totalSlides;
    document.documentElement.style.setProperty('--total-slides', state.totalSlides);

    registerKeyboard();
    registerTouch(container);
    registerHashChange();
    registerHelpClose();
    initTheme();

    const initial = parseHash(location.hash);
    goTo(initial, { animate: false });
  }

  document.addEventListener('DOMContentLoaded', init);

  /* ===== 공개 API ===== */
  global.Presentation = {
    next: next,
    prev: prev,
    first: first,
    last: last,
    goTo: goTo,
    toggleNotes: toggleNotes,
    toggleTheme: toggleTheme,
    getState: function() { return Object.assign({}, state); },
  };

})(window);
