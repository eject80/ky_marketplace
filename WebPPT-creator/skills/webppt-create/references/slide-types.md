# 슬라이드 유형 17종 레퍼런스

## 슬라이드 section 기본 구조

```html
<section class="slide [추가클래스]"
         id="slide-N"
         data-slide-index="N-1"
         data-transition="fade|slide|zoom"
         role="group" aria-roledescription="슬라이드">
  <div class="slide__content [text-left]">
    <!-- 내용 -->
  </div>
  <aside class="slide__notes">
    <h3>발표자 노트</h3>
    <ul><li>노트 내용</li></ul>
  </aside>
</section>
```

- `id="slide-N"` — 1부터 시작
- `data-slide-index="N-1"` — 0부터 시작, 순서 유지 필수
- `data-transition` — `fade`(기본) | `slide` | `zoom`
- `text-left` — 좌측 정렬 (기술·텍스트 중심 슬라이드에 사용)

---

## 01. 타이틀 (Title)

```html
<section class="slide slide--title" id="slide-1"
         data-slide-index="0" data-transition="fade"
         role="group" aria-roledescription="슬라이드">
  <div class="slide__content">
    <h1>제목 <span class="hl">강조</span></h1>
    <div class="divider"></div>
    <p class="subtitle">부제목 또는 발표자 · 날짜</p>
    <div class="slide__tags">
      <span class="tag">태그1</span>
      <span class="tag">태그2</span>
    </div>
  </div>
  <aside class="slide__notes"><h3>발표자 노트</h3><ul><li>노트</li></ul></aside>
</section>
```

## 02. 목차 (Agenda)

```html
<section class="slide" id="slide-N" data-slide-index="N-1"
         data-transition="fade" role="group" aria-roledescription="슬라이드">
  <div class="slide__content">
    <h2>목차 <span class="hl">Agenda</span></h2>
    <ul class="agenda-list">
      <li class="agenda-item active">   <!-- 현재 섹션에만 active -->
        <span class="agenda-num">01</span> 섹션 제목
      </li>
      <li class="agenda-item">
        <span class="agenda-num">02</span> 섹션 제목
      </li>
    </ul>
  </div>
  <aside class="slide__notes"><h3>발표자 노트</h3><ul><li>노트</li></ul></aside>
</section>
```

## 03. 섹션 구분 (Section Divider)

```html
<section class="slide slide--section" id="slide-N" data-slide-index="N-1"
         data-transition="fade" role="group" aria-roledescription="슬라이드">
  <span class="section-bg-num" aria-hidden="true">01</span>
  <div class="slide__content">
    <p class="section-eyebrow">Part 01</p>
    <h2><span class="hl">섹션</span> 제목</h2>
    <p class="subtitle">이 파트에서 다룰 내용 한 줄 요약</p>
  </div>
  <aside class="slide__notes"><h3>발표자 노트</h3><ul><li>노트</li></ul></aside>
</section>
```

## 04. 불릿 리스트 — Step 순차 표시

```html
<section class="slide" id="slide-N" data-slide-index="N-1"
         data-transition="slide" role="group" aria-roledescription="슬라이드">
  <div class="slide__content text-left">
    <h2><span class="hl">핵심</span> 포인트</h2>
    <ul>
      <li class="step" data-step="1"><strong>항목 1:</strong> 설명</li>
      <li class="step" data-step="2"><strong>항목 2:</strong> 설명</li>
      <li class="step" data-step="3"><strong>항목 3:</strong> 설명</li>
    </ul>
  </div>
  <aside class="slide__notes"><h3>발표자 노트</h3><ul><li>노트</li></ul></aside>
</section>
```

슬라이드 진입 시 350ms 간격 자동 표시. 이전으로 돌아오면 즉시 전체 표시.

## 05. 코드 블록

```html
<section class="slide" id="slide-N" data-slide-index="N-1"
         data-transition="slide" role="group" aria-roledescription="슬라이드">
  <div class="slide__content text-left">
    <h2><span class="hl">코드</span> 제목</h2>
    <div class="step" data-step="1">
      <pre class="code-block"><code><span class="tk-kw">function</span> <span class="tk-fn">example</span>() {
  <span class="tk-kw">return</span> <span class="tk-str">"hello"</span>;
}</code></pre>
    </div>
    <p class="step slide__caption" data-step="2">코드 설명 텍스트</p>
  </div>
  <aside class="slide__notes"><h3>발표자 노트</h3><ul><li>노트</li></ul></aside>
</section>
```

**구문 강조 클래스:**

| 클래스 | 색상 | 용도 |
|---|---|---|
| `.tk-kw` | 보라 | 키워드 (function, const, if) |
| `.tk-fn` | 파랑 | 함수명 |
| `.tk-str` | 초록 | 문자열 |
| `.tk-num` | 오렌지 | 숫자 |
| `.tk-cmt` | 회색 이탤릭 | 주석 |
| `.tk-prop` | 청록 | 속성/변수 |
| `.tk-cls` | 노랑 | 클래스/타입명 |

## 06. 카드 그리드

```html
<section class="slide" ...>
  <div class="slide__content">
    <h2>카드 <span class="hl">그리드</span></h2>
    <!-- 기본 2열 / col-3 = 3열 / col-4 = 4열 -->
    <div class="card-grid col-3">
      <div class="card step" data-step="1">
        <strong class="hl">카드 제목</strong>
        <ul><li>항목</li></ul>
      </div>
      <div class="card step" data-step="2">
        <strong class="hl">카드 제목</strong>
        <ul><li>항목</li></ul>
      </div>
    </div>
  </div>
</section>
```

## 07. 두 컬럼 텍스트

```html
<div class="two-col">
  <div>
    <p class="two-col-header">왼쪽 제목</p>
    <ul><li>항목</li></ul>
  </div>
  <div>
    <p class="two-col-header">오른쪽 제목</p>
    <ul><li>항목</li></ul>
  </div>
</div>
```

## 08. 이미지 + 텍스트

```html
<!-- 이미지 왼쪽: img-text-grid  /  오른쪽: img-text-grid img-right -->
<div class="img-text-grid">
  <!-- 실제 이미지: <img src="..." alt="..."> 로 교체 -->
  <div class="img-placeholder">
    <span class="img-icon">🖼️</span>
  </div>
  <div class="text-left">
    <h2>제목</h2>
    <p>설명 텍스트</p>
  </div>
</div>
```

## 09. 전체 화면 배경 이미지

```html
<!-- 실제 이미지 사용 시: style="background-image: url('이미지.jpg')" 추가 -->
<section class="slide slide--fullbg slide--fullbg-demo" ...>
  <div class="slide__content">
    <h1>오버레이 위 제목</h1>
  </div>
</section>
```

- `slide--fullbg-demo`: 데모용 CSS 그라디언트 (실제 이미지 사용 시 삭제)
- `slide--fullbg::before` 자동 어둠 오버레이 적용
- 배경 이미지 URL은 인라인 `style` 예외적으로 허용

## 10. 통계 / 큰 숫자 (Stats)

```html
<div class="stats-grid">
  <div class="stat-item step" data-step="1">
    <div class="stat-number">98<span class="stat-unit">%</span></div>
    <div class="stat-label">고객 만족도</div>
  </div>
  <div class="stat-item step" data-step="2">
    <div class="stat-number sm">1.2<span class="stat-unit">M</span></div>
    <div class="stat-label">월간 사용자</div>
  </div>
</div>
```

- `.stat-number.sm`: 좁은 공간에서 작은 크기

## 11. 인용구 (Quote)

```html
<div class="quote-block">
  <span class="quote-mark" aria-hidden="true">"</span>
  <p class="quote-text">인용 문장</p>
  <cite class="quote-author">— 출처 · 소속</cite>
</div>
```

## 12. 비교 (Comparison)

```html
<div class="compare-grid">
  <div class="compare-col con">   <!-- 오렌지: 문제/이전 -->
    <p class="compare-header">❌ Before</p>
    <ul><li>문제점</li></ul>
  </div>
  <div class="compare-col pro">   <!-- 파랑: 개선/이후 -->
    <p class="compare-header">✅ After</p>
    <ul><li>개선점</li></ul>
  </div>
</div>
```

## 13. 체크리스트 (Checklist)

```html
<ul class="checklist">
  <li class="done"><span class="check-icon">✅</span>완료 항목</li>
  <li><span class="check-icon">☐</span>미완료 항목</li>
  <li class="na"><span class="check-icon">✗</span>해당 없음</li>
</ul>
```

| 클래스 | 의미 |
|---|---|
| (없음) | 미완료 |
| `.done` | 완료 |
| `.na` | 해당 없음, 취소선 |

## 14. 프로세스 / 흐름 (Process)

```html
<div class="process-steps">
  <div class="process-step step" data-step="1">
    <div class="process-num">1</div>
    <div class="process-label">단계 제목</div>
    <div class="process-desc">설명</div>
  </div>
  <span class="process-arrow step" data-step="2" aria-hidden="true">→</span>
  <div class="process-step step" data-step="3">
    <div class="process-num">2</div>
    <div class="process-label">단계 제목</div>
    <div class="process-desc">설명</div>
  </div>
</div>
```

`process-step`과 `process-arrow`를 교대로 배치. 화살표도 `step` 처리.

## 15. 타임라인 (Timeline)

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
  <li class="timeline-item step" data-step="2">
    <span class="timeline-dot"></span>          <!-- 예정: 빈 점 -->
    <div>
      <div class="timeline-date">2025 Q3</div>
      <div class="timeline-title">예정 이벤트</div>
      <div class="timeline-desc">설명</div>
    </div>
  </li>
</ul>
```

## 16. 응용 조합 (Custom Composition)

기존 컴포넌트를 자유롭게 조합:

```html
<!-- 예: two-col + stat.sm + checklist 대시보드 -->
<div class="two-col">
  <div>
    <p class="two-col-header">핵심 지표</p>
    <div class="stat-item">
      <div class="stat-number sm">87<span class="stat-unit">%</span></div>
      <div class="stat-label">완료율</div>
    </div>
  </div>
  <div>
    <p class="two-col-header">체크리스트</p>
    <ul class="checklist">
      <li class="done"><span class="check-icon">✅</span>완료 항목</li>
    </ul>
  </div>
</div>
```

`step` / `card` / `stat-item` 등 어떤 컴포넌트든 중첩 가능.
`.stat-number.sm`처럼 변형 클래스로 크기 조정.

## 17. 마무리 / Q&A (Closing)

```html
<section class="slide slide--title slide--closing" id="slide-N"
         data-slide-index="N-1" data-transition="fade"
         role="group" aria-roledescription="슬라이드">
  <div class="slide__content">
    <span class="closing-icon">🙏</span>
    <h1>감사합니다</h1>
    <div class="divider"></div>
    <p class="subtitle">질문이 있으신가요?</p>
    <ul class="contact-list">
      <li>📧 <a href="mailto:user@example.com">이메일</a></li>
      <li>🔗 <a href="#">링크</a></li>
    </ul>
  </div>
  <aside class="slide__notes"><h3>발표자 노트</h3><ul><li>노트</li></ul></aside>
</section>
```

---

## 공통 유틸리티 클래스

| 클래스 | 역할 |
|---|---|
| `.hl` | 핵심 단어 강조 (`var(--primary)` 색상) |
| `.tag` | 태그 뱃지 |
| `.step[data-step="N"]` | 자동 순차 표시 (어떤 요소에든 적용 가능) |
| `.slide__content.text-left` | 좌측 정렬 슬라이드 |
| `.slide__caption` | 코드 블록 아래 설명 텍스트 |
| `.slide__tags` | 태그 컨테이너 |

## 절대 금지

| ❌ 금지 | ✅ 올바른 방법 |
|---|---|
| 인라인 `style=""` 로 색상/크기 지정 | CSS 클래스 사용 |
| `presentation.css` / `.js` 수정 | `index.html`의 `<style>`에서 CSS 변수만 오버라이드 |
| `grid-template-columns` 인라인 | `.card-grid.col-3` / `.col-4` 클래스 사용 |
| `data-slide-index` 순서 어긋남 | 0부터 순서대로 유지 |
| 배경 이미지 외 인라인 style | `slide--fullbg` + `style="background-image:..."` 만 예외 허용 |
