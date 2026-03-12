# Agent 7: 재사용 가능한 템플릿 구조 가이드

## 1. 파일 구조

```
template/
├── presentation.css   ← 엔진 스타일 (수정 금지)
├── presentation.js    ← 엔진 스크립트 (수정 금지)
└── index.html         ← ★ 복사해서 사용하는 파일 (슬라이드만 수정)
```

### 각 파일의 역할

| 파일 | 수정 여부 | 역할 |
|---|---|---|
| `presentation.css` | 금지 | 엔진 레이아웃, 전환 효과, 모든 컴포넌트 CSS |
| `presentation.js` | 금지 | 네비게이션, Step 재생, 테마, 접근성 로직 |
| `index.html` | ★ 여기만 수정 | 슬라이드 내용, 제목, 색상 변수 커스터마이즈 |

### 사용법

1. `template/` 폴더 전체 복사
2. `index.html`의 `<title>` 수정
3. `<section class="slide">` 블록을 추가·교체하여 내 슬라이드 구성
4. 색상 커스터마이즈가 필요하면 `index.html`의 `<style>` 주석을 해제하고 CSS 변수 수정

---

## 2. presentation.js 공개 API

```javascript
window.Presentation.next()          // 다음 슬라이드
window.Presentation.prev()          // 이전 슬라이드
window.Presentation.first()         // 첫 번째 슬라이드
window.Presentation.last()          // 마지막 슬라이드
window.Presentation.goTo(n)         // n번 슬라이드 (0-based)
window.Presentation.toggleNotes()   // 발표자 노트 토글
window.Presentation.toggleTheme()   // 다크/라이트 토글
window.Presentation.getState()      // 현재 상태 객체 반환
```

---

## 3. 슬라이드 섹션 기본 구조

```html
<section class="slide [추가클래스]" id="slide-N"
         data-slide-index="N-1" data-transition="fade|slide|zoom"
         role="group" aria-roledescription="슬라이드">
  <div class="slide__content [text-left]">
    <h2>제목</h2>
    <!-- 내용 -->
  </div>

  <!-- 발표자 노트 (N 키, 청중에게 보이지 않음) -->
  <aside class="slide__notes">
    <h3>발표자 노트</h3>
    <ul><li>노트 내용</li></ul>
  </aside>
</section>
```

**규칙:**
- `data-slide-index`는 0부터 시작하는 정수, 순서대로 유지
- `id="slide-N"`은 URL hash 접근용 (선택)
- `data-transition`: `fade`(기본) | `slide` | `zoom`

---

## 4. 슬라이드 유형 17종 레퍼런스

### 01. 타이틀 (Title)
```html
<section class="slide slide--title" data-transition="fade" ...>
  <div class="slide__content">
    <h1>제목 <span class="hl">강조</span></h1>
    <div class="divider"></div>
    <p class="subtitle">부제목</p>
    <div class="slide__tags">
      <span class="tag">태그</span>
    </div>
  </div>
</section>
```

### 02. 목차 (Agenda)
```html
<ul class="agenda-list">
  <li class="agenda-item active">   <!-- 현재 섹션에 active -->
    <span class="agenda-num">01</span> 섹션 제목
  </li>
  <li class="agenda-item">
    <span class="agenda-num">02</span> 섹션 제목
  </li>
</ul>
```

### 03. 섹션 구분 (Section Divider)
```html
<section class="slide slide--section" data-transition="fade" ...>
  <span class="section-bg-num" aria-hidden="true">01</span>
  <div class="slide__content">
    <p class="section-eyebrow">Part 01</p>
    <h2><span class="hl">섹션</span> 제목</h2>
    <p class="subtitle">한 줄 요약</p>
  </div>
</section>
```

### 04. 불릿 리스트 — Step 순차 표시
```html
<ul>
  <li class="step" data-step="1"><strong>항목:</strong> 설명</li>
  <li class="step" data-step="2">항목 2</li>
</ul>
```
- 슬라이드 진입 시 350ms 간격으로 자동 표시
- 이전 슬라이드로 돌아오면 즉시 전체 표시

### 05. 코드 블록
```html
<pre class="code-block"><code>
  <span class="tk-kw">function</span> <span class="tk-fn">name</span>() { ... }
</code></pre>
```

**구문 강조 클래스:**

| 클래스 | 색상 | 용도 |
|---|---|---|
| `.tk-kw` | 보라 | 키워드 (function, const, if) |
| `.tk-fn` | 파랑 | 함수명 |
| `.tk-str` | 초록 | 문자열 |
| `.tk-num` | 오렌지 | 숫자 |
| `.tk-cmt` | 회색 이탤릭 | 주석 |
| `.tk-prop` | 청록 | 속성 |
| `.tk-cls` | 노랑 | 클래스/타입 |

### 06. 카드 그리드
```html
<div class="card-grid">          <!-- 기본 2열 -->
<div class="card-grid col-3">    <!-- 3열 -->
<div class="card-grid col-4">    <!-- 4열 -->

  <div class="card step" data-step="1">
    <strong class="hl">제목</strong>
    <ul><li>항목</li></ul>
  </div>
</div>
```

### 07. 두 컬럼 텍스트
```html
<div class="two-col">
  <div>
    <p class="two-col-header">왼쪽 제목</p>
    <ul>...</ul>
  </div>
  <div>
    <p class="two-col-header">오른쪽 제목</p>
    <ul>...</ul>
  </div>
</div>
```

### 08. 이미지 + 텍스트
```html
<div class="img-text-grid">          <!-- 이미지 왼쪽 -->
<div class="img-text-grid img-right"> <!-- 이미지 오른쪽 -->

  <div class="img-placeholder">       <!-- 실제 이미지로 교체 -->
    <span class="img-icon">🖼️</span>
  </div>
  <div class="text-left">
    <h2>제목</h2>
    <p>설명</p>
  </div>
</div>
```
실제 이미지 사용 시 `img-placeholder` 대신 `<img src="..." alt="...">` 사용.

### 09. 전체 화면 배경 이미지
```html
<!-- 실제 이미지: style="background-image: url('이미지.jpg')" 추가 -->
<section class="slide slide--fullbg slide--fullbg-demo" ...>
  <div class="slide__content">
    <h1>제목</h1>
  </div>
</section>
```
- `slide--fullbg-demo`: 데모용 CSS gradient (실제 이미지 사용 시 삭제)
- `slide--fullbg::before`로 자동 오버레이(어둠) 적용

### 10. 통계 / 큰 숫자 (Stats)
```html
<div class="stats-grid">
  <div class="stat-item step" data-step="1">
    <div class="stat-number">98<span class="stat-unit">%</span></div>
    <div class="stat-label">고객 만족도</div>
  </div>
</div>
```
- `.stat-number.sm`: 좁은 공간(두 컬럼 등)에서 작은 크기

### 11. 인용구 (Quote)
```html
<div class="quote-block">
  <span class="quote-mark" aria-hidden="true">"</span>
  <p class="quote-text">인용 문장</p>
  <cite class="quote-author">출처</cite>
</div>
```

### 12. 비교 (Comparison)
```html
<div class="compare-grid">
  <div class="compare-col con">   <!-- 오렌지 강조 -->
    <p class="compare-header">❌ Before</p>
    <ul>...</ul>
  </div>
  <div class="compare-col pro">   <!-- 파랑 강조 -->
    <p class="compare-header">✅ After</p>
    <ul>...</ul>
  </div>
</div>
```

### 13. 체크리스트 (Checklist)
```html
<ul class="checklist">
  <li class="done"><span class="check-icon">✅</span>완료 항목</li>
  <li><span class="check-icon">☐</span>진행 중</li>
  <li class="na"><span class="check-icon">✗</span>해당 없음</li>
</ul>
```

| 클래스 | 의미 |
|---|---|
| (없음) | 미완료 (☐) |
| `.done` | 완료 (✅) |
| `.na` | 해당 없음, 취소선 (✗) |

### 14. 프로세스 / 흐름 (Process)
```html
<div class="process-steps">
  <div class="process-step step" data-step="1">
    <div class="process-num">1</div>
    <div class="process-label">단계 제목</div>
    <div class="process-desc">설명</div>
  </div>
  <span class="process-arrow step" data-step="2" aria-hidden="true">→</span>
  <div class="process-step step" data-step="3">
    ...
  </div>
</div>
```
- `process-step`과 `process-arrow`를 교대로 배치

### 15. 타임라인 (Timeline)
```html
<ul class="timeline">
  <li class="timeline-item step" data-step="1">
    <span class="timeline-dot filled"></span>  <!-- 완료: filled -->
    <div>
      <div class="timeline-date">2025 Q1</div>
      <div class="timeline-title">이벤트 제목</div>
      <div class="timeline-desc">설명</div>
    </div>
  </li>
</ul>
```
- `.timeline-dot.filled`: 완료된 항목 (채워진 점)
- `.timeline-dot`: 예정된 항목 (빈 점)

### 16. 템플릿 응용 예시 (Custom Composition)
기존 컴포넌트를 자유롭게 조합해서 새 레이아웃을 만드는 방법:

```html
<!-- 예: .two-col + .stat-item.sm + .checklist 조합 -->
<div class="two-col">
  <div>
    <p class="two-col-header">지표</p>
    <div class="stat-item">
      <div class="stat-number sm">87<span class="stat-unit">%</span></div>
      <div class="stat-label">완료율</div>
    </div>
  </div>
  <div>
    <p class="two-col-header">체크리스트</p>
    <ul class="checklist">...</ul>
  </div>
</div>
```

**조합 원칙:**
- `step`/`card`/`stat-item` 등 어떤 컴포넌트든 중첩 가능
- `two-col` 안에 `card-grid` 대신 다른 컴포넌트를 넣을 수 있음
- `.stat-number.sm`처럼 변형 클래스로 크기 조정

### 17. 마무리 / Q&A (Closing)
```html
<section class="slide slide--title slide--closing" ...>
  <div class="slide__content">
    <span class="closing-icon">🙏</span>
    <h1>감사합니다</h1>
    <div class="divider"></div>
    <p class="subtitle">질문이 있으신가요?</p>
    <ul class="contact-list">
      <li>📧 <a href="mailto:...">이메일</a></li>
      <li>🔗 <a href="#">링크</a></li>
    </ul>
  </div>
</section>
```

---

## 5. 공통 유틸리티 클래스

| 클래스 | 역할 |
|---|---|
| `.hl` | 핵심 단어 강조 (`var(--primary)` 색상) |
| `.tag` | 태그 뱃지 |
| `.slide__content.text-left` | 좌측 정렬 슬라이드 |
| `.slide__caption` | 코드 블록 아래 설명 텍스트 |
| `.slide__tags` | 태그 컨테이너 (margin-top 포함) |
| `.step[data-step="N"]` | 자동 순차 표시 요소 |

---

## 6. 색상 커스터마이즈

`index.html`의 `<head>` 안에 `<style>` 태그를 추가해서 CSS 변수를 재정의합니다.

```html
<style>
  :root {
    --slide-bg:    linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
    --slide-color: #f0f0f0;
    --primary:     #60a5fa;   /* 강조색 (hl, 버튼, 진행 바 등) */
    --accent:      #fb923c;   /* 보조 강조색 */
  }
  [data-theme="light"] {
    --slide-bg:    #f4f6f9;
    --slide-color: #1a1a1a;
    --primary:     #0057b7;
  }
</style>
```
