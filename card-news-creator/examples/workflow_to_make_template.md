# 카드뉴스 HTML 템플릿 제작 워크플로우

> **목적**: `examples/` 폴더의 카드뉴스 이미지를 분석해 Playwright 스크린샷용 HTML/CSS 템플릿을 제작한다.  
> **나중에 스킬로 만들 때**: 이 문서의 절차를 그대로 따른다. 입력은 `examples/` 폴더 이름 하나.

---

## 전체 흐름

```
examples/{폴더명}/  →  [분석]  →  template/{폴더명_언더스코어}/
                                    ├── common.css
                                    ├── index.html
                                    └── slide-NN-{type}.html  × N장
```

---

## STEP 1 — 입력 확인

1. `examples/` 안에서 **아직 template이 없는** 폴더를 하나 선택한다.  
   (`template/` 폴더 이름은 공백 → 언더스코어로 변환)
2. 해당 폴더의 이미지를 **모두** Read 도구로 읽는다. (1.png, 2.png, …)
3. 이미지 수 = 최종 슬라이드 수.

---

## STEP 2 — 디자인 분석

이미지를 보고 아래 항목을 파악한다. 기존 템플릿(`남색_깔끔_홍보_안내`)과 비교하면서 **달라지는 것만** 집중적으로 기록한다.

### 2-1. 디자인 토큰

| 항목 | 확인 내용 |
|------|----------|
| 배경 | gradient 방향·색상, 블러 원 색상 |
| 카드 | 배경색, 테두리 색, border-radius |
| 강조색 (primary) | 제목 첫 단어, 레이블 박스, 헤더 배경 |
| 보조색 (secondary) | 표 헤더, 아이콘 배경 등 |
| 제목 폰트 크기 | h2c 기준 |
| 본문 폰트 크기 | 기본 body text 기준 |

### 2-2. 공통 구조 파악

- 클립보드 프레임 유무 / 대체 프레임 형태
- 상단 집게(클립) SVG 색상
- 슬라이드 아이콘 위치·스타일 (우측 상단 고정 vs 다른 위치)
- 제목 스타일 (2컬러 vs 단색, 폰트 크기)

### 2-3. 슬라이드별 레이아웃 분류

각 이미지를 보고 아래 유형 중 하나로 분류한다.

| 유형 키워드 | 파일명 접미사 예시 | 특징 |
|------------|-----------------|------|
| 표지 (cover) | `-cover` | 중앙 정렬, 큰 제목, 부제 |
| 목차 (toc) | `-toc` | 번호 + 항목 리스트 |
| 핵심 메세지 (key-message) | `-key-message` | 강조 박스 + 설명 단락 |
| 이미지 설명 (image) | `-image` | 전체 배경 이미지 + 오버레이 텍스트 |
| 비교 정리 (comparison) | `-comparison` | 좌우 또는 상하 비교 블록 |
| 포인트 정리 (points) | `-points` | 아이콘/체크 + 설명 리스트 |
| 표 레이아웃 (table) | `-table` | 2열 테이블 |
| 이미지 그리드 (image-grid) | `-image-grid` | 이미지 N개 가로 배열 + 캡션 |
| 순서 레이아웃 (steps) | `-steps` | STEP 카드 가로 배열 + 연결선 |
| 마무리/CTA (closing) | `-closing` | QR, 연락처, 마무리 메세지 |

> 위 유형에 없는 레이아웃이 보이면 새 키워드를 만들어 추가한다.

---

## STEP 3 — 파일 구조 결정

```
template/{폴더명_언더스코어}/
├── common.css          ← 공통 CSS + 모든 슬라이드 전용 CSS 통합 (슬라이드용 유일한 CSS 파일)
├── index.html          ← 슬라이드 미리보기 목록 페이지
├── index.css           ← index.html 전용 CSS (미리보기 페이지에만 사용, 슬라이드와 무관)
└── slide-{NN}-{type}.html  ← 슬라이드별 파일 (01부터 시작)
```

파일명 규칙:
- 번호는 2자리 zero-pad: `01`, `02`, …
- 유형명은 영문 소문자 하이픈: `-key-message`, `-image-grid`
- **CSS는 HTML과 반드시 분리한다. `<style>` 태그를 HTML 파일 내부에 절대 작성하지 않는다.**

> **CSS 파일 원칙 (필수)**
> - `common.css` : 공통 스타일 + 모든 슬라이드 전용 스타일을 하나의 파일에 통합
>   - 슬라이드 전용 섹션은 `/* ===== slide-NN-type ===== */` 주석으로 구분
>   - 각 슬라이드 HTML은 `<link rel="stylesheet" href="common.css">` **한 줄만** 작성
> - `index.css` : 미리보기 페이지(`index.html`) 전용 — 슬라이드 HTML에서는 절대 참조하지 않음
> - HTML 파일 내부의 `<style>` 태그 사용 **금지**

---

## STEP 4 — common.css 작성

기존 남색 버전을 복사하지 않는다. **이미지를 먼저 분석한 뒤, 2계층으로 나눠 작성한다.**

### 계층 1 — 유니버설 고정 (모든 폴더 동일, 절대 변경 금지)

```css
@import url('https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/pretendard.css');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { width: 1080px; height: 1440px; overflow: hidden; -webkit-font-smoothing: antialiased; }
body::-webkit-scrollbar { display: none; }
.canvas { position: relative; width: 1080px; height: 1440px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
```

**폰트 역할 분리**:
- **한글 혼용 요소** → `font-family: 'Pretendard', 'Noto Sans KR', sans-serif`
- **영문 전용 요소** (STEP 번호, URL, 영문 뱃지 등) → `font-family: 'Noto Sans KR', 'Pretendard', sans-serif`

font-weight: 제목 `900`, 레이블 `700`, 본문 `400`.

### 계층 2 — 디자인 가변 (이미지 보고 판단 후 작성)

아래 항목은 예제 이미지 분석 결과에 따라 **있으면 작성, 없으면 생략**한다.

| 항목 | 포함 조건 | 작성 내용 |
|------|----------|----------|
| `.canvas` background | 항상 포함 | 이미지 배경색/gradient 그대로 |
| `.bg-blob` (블러 원) | 배경에 흐릿한 원이 보일 때만 | 색상·크기·위치 이미지 기준 |
| `.clipboard-frame` + `.clip-wrapper` | 클립보드 집게 프레임이 보일 때만 | 크기·위치 이미지 기준 |
| `.card` | 항상 포함 | 배경색·테두리·border-radius·padding 이미지 기준 |
| `.card--centered`, `.card--image` 등 modifier | 해당 레이아웃 유형이 있을 때만 | 이미지 기준 |
| `.slide-icon` | 슬라이드 아이콘이 보일 때만 | 위치·투명도 이미지 기준 |
| `.h2c`, `.h-blue`, `.h-black` | 2컬러 제목이 있을 때만 | 색상·폰트 크기 이미지 기준 |
| `.divider-dashed` | 점선 구분선이 있을 때만 | 색상 이미지 기준 |
| 기타 특수 구조 | 이미지에 보이면 | 3단 레이아웃, 상단 박스 등 |

**판단 순서 (이미지 분석 체크리스트)**:
1. 배경이 어두운가, 밝은가?
2. 클립보드 집게 프레임이 있는가?
3. 배경에 흐릿한 블러 원이 있는가?
4. 3단 분할, 상단 강조 박스 등 특수 구조가 있는가?
5. 위 결과에 따라 계층 2 작성

---

## STEP 5 — 슬라이드 HTML 파일 작성

### 공통 뼈대 (모든 슬라이드 동일)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080">
  <title>{슬라이드명}</title>
  <link rel="stylesheet" href="common.css">
  <!-- ⚠️ <style> 태그 사용 금지 — 슬라이드 전용 CSS는 common.css 하단에 섹션 주석으로 추가 -->
</head>
<body>
  <div class="canvas">
    <div class="bg-blob bg-blob--1"></div>
    <div class="bg-blob bg-blob--2"></div>
    <div class="bg-blob bg-blob--3"></div>
    <div class="clipboard-frame">
      <div class="clip-wrapper">
        <!-- 클립 SVG (linearGradient 색상은 폴더마다 교체) -->
        <svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg" width="220" height="80">
          <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="{연한 primary}"/>
            <stop offset="100%" stop-color="{primary}"/>
          </linearGradient></defs>
          <rect x="6" y="46" width="208" height="30" rx="10" fill="url(#cg)"/>
          <path d="M76 46 C76 8 144 8 144 46" fill="none" stroke="url(#cg)" stroke-width="20" stroke-linecap="round"/>
          <rect x="6" y="46" width="208" height="12" rx="10" fill="rgba(255,255,255,0.18)"/>
          <line x1="6" y1="61" x2="214" y2="61" stroke="rgba(0,0,30,0.15)" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="card {modifier}">
        <div class="slide-icon">
          <!-- 슬라이드 대표 아이콘 SVG -->
        </div>
        <!-- 슬라이드 본문 -->
      </div>
    </div>
  </div>
</body>
</html>
```

**card modifier 규칙**:
- 표지 슬라이드: `class="card card--centered"`
- 전체 배경 이미지 슬라이드: `class="card card--image"`
- 그 외 일반 슬라이드: `class="card"` (modifier 없음)

### 슬라이드별 핵심 패턴 (남색 시리즈 기준, 색상만 교체)

**표지 (`cover`)**
```html
<div class="card card--centered">
  <div class="cover-badge">{카테고리 텍스트}</div>
  <h1 class="cover-title">
    <span class="h-blue">{첫째 줄}</span>
    <span class="h-black"> {둘째 줄}</span>
    ...
  </h1>
  <p class="cover-url">{출처 URL 또는 발행처}</p>
</div>
```

**목차 (`toc`)**
```html
<ul class="toc-list">
  <li class="toc-item">
    <span class="toc-num">01</span>
    <span class="toc-text">{항목}</span>
  </li>
  ...
</ul>
```

**핵심 메세지 (`key-message`)**
```html
<h1 class="h2c">...</h1>
<div class="pin-box">
  <div class="pin-line">{강조 텍스트}</div>
</div>
<p class="body-text">{설명 단락}</p>
```

**비교 정리 (`comparison`)**
```html
<div class="compare-wrap">
  <div class="compare-col compare-col--a">
    <div class="compare-label">{항목 A 레이블}</div>
    <ul class="bullet-list">...</ul>
  </div>
  <div class="compare-arrow">→</div>
  <div class="compare-col compare-col--b">...</div>
</div>
```

**포인트 정리 (`points`)**
```html
<ul class="points-list">
  <li class="point-item">
    <div class="point-left-box">
      <!-- 체크 아이콘 + 레이블 -->
    </div>
    <div class="point-desc">{설명}</div>
  </li>
</ul>
```

**표 레이아웃 (`table`)**
```html
<div class="table-wrapper">
  <table class="data-table">
    <thead><tr><th>항목</th><th>내용</th></tr></thead>
    <tbody>
      <tr><td>키워드</td><td>내용</td></tr>
      ...
    </tbody>
  </table>
</div>
```

**순서 레이아웃 (`steps`)**
```html
<div class="steps-container"> <!-- ::before 로 연결선 -->
  <div class="steps-grid">
    <div class="step-card">
      <div class="step-header"><span>STEP</span><span>01</span></div>
      <div class="step-body">
        <!-- 아이콘 + 설명 -->
      </div>
    </div>
    ...
  </div>
</div>
```

---

## STEP 6 — index.html 작성

`남색_깔끔_홍보_안내/index.html`을 그대로 복사 후 아래만 교체한다.

```javascript
// slides 배열만 교체
const slides = [
  { num: '01', name: '표지',   file: 'slide-01-cover.html' },
  { num: '02', name: '목차',   file: 'slide-02-toc.html' },
  // ...
];
```

**반드시 유지해야 할 코드** (버그 수정 포함):

```javascript
function render() {
  const grid = document.getElementById('slidesGrid');
  const colWidth = (grid.clientWidth - 48) / 3;  // gap 24px × 2 = 48
  const previewH = colWidth * (1440 / 1080);
  const scale = colWidth / 1080;
  // ...
}
```

```css
.slide-card { min-width: 0; }  /* Grid 1fr 트랙 overflow 방지 — 절대 삭제 금지 */
```

---

## STEP 7 — 검증

1. `index.html`을 브라우저에서 열어 **3열 그리드**로 슬라이드가 보이는지 확인
2. 슬라이드 카드 클릭 → 새 탭에서 **1080×1440** 전체 크기 미리보기
3. 폰트, 색상, 레이아웃이 예제 이미지(`examples/{폴더}/`)와 유사한지 비교
4. Playwright 스크린샷 테스트 (선택):
   ```python
   page.set_viewport_size({"width": 1080, "height": 1440})
   await page.goto(f"file://{abs_path_to_slide_html}")
   await page.wait_for_load_state("networkidle")
   await asyncio.sleep(1.5)
   await page.screenshot(path="output.png", full_page=False)
   ```

---

## 폴더별 진행 상태

| 예제 폴더 | 슬라이드 수 | 상태 |
|----------|-----------|------|
| 남색 깔끔 홍보 안내 | 9장 | ✅ 완료 |
| 빨강 깔끔 마케팅 콘텐츠 안내 | 8장 | ✅ 완료 |
| 파랑 깔끔 뉴스 홍보 | 5장 | ✅ 완료 |
| 파랑 심플 공지사항 안내 | 5장 | ✅ 완료 |
| 파랑 심플 홍보 안내 | 9장 | ✅ 완료 |
| 파랑 회식 깔끔 표 위주 | 4장 | ✅ 완료 |
| 회색 파랑 모던 홍보 안내 | 8장 | ✅ 완료 |
| 흑백 깔끔 온보딩 안내 | 7장 | ✅ 완료 |

---

## 스킬로 만들 때 입력/출력 명세

```
입력:  examples/ 안의 폴더 이름 (예: "빨강 깔끔 마케팅 콘텐츠 안내")
처리:  STEP 1~6 자동 실행
출력:  template/{폴더명_언더스코어}/ 폴더 + 파일 일체
완료:  위 표에서 해당 폴더 상태를 ✅ 완료로 업데이트
```

### 스킬 실행 순서

1. `examples/{입력폴더}/` 이미지 전체 Read
2. 디자인 토큰 추출 (STEP 2)
3. `common.css` 생성 (기존 남색 버전 기반 + 색상 교체)
4. 슬라이드 HTML 파일 순차 생성 (`slide-01` → `slide-NN`)
5. `index.html` 생성 (slides 배열만 교체)
6. WORKFLOW.md 진행 상태 표 업데이트
