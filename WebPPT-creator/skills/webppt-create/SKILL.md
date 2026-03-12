---
name: webppt-create
description: "순수 HTML/CSS/JS로 웹 프레젠테이션(슬라이드)을 생성한다. 사용자가 PPT·슬라이드·발표자료·프레젠테이션 제작을 요청할 때 사용한다. 번들러 없이 브라우저에서 바로 실행되는 독립 폴더를 생성한다."
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---

# WebPPT Creator

## 역할

사용자의 요청에 따라 WebPPT 템플릿 기반의 웹 프레젠테이션을 생성한다.
브라우저에서 바로 열 수 있는 독립 폴더(HTML + CSS + JS 3파일)를 만든다.

---

## 참조 문서

- 슬라이드 유형 17종 코드 레퍼런스, 공통 유틸리티 클래스, 절대 금지 사항은 [slide-types.md](references/slide-types.md) 참조
- 17종 슬라이드를 모두 사용한 완성 예시는 [presentation.html](examples/presentation.html) 참조

---

## 워크플로

### 1단계: 요구사항 파악

다음을 사용자에게 확인한다 (없으면 직접 판단):

- **제목** (프레젠테이션 주제)
- **저장 위치** (기본: 현재 디렉토리 하위 새 폴더)
- **슬라이드 수 / 구조** (섹션 구분 필요 여부)
- **언어** (기본: `lang="ko"`)

### 2단계: 폴더 생성 및 엔진 파일 복사

```bash
mkdir -p {출력폴더}
cp "${CLAUDE_SKILL_DIR}/examples/presentation.css" {출력폴더}/presentation.css
cp "${CLAUDE_SKILL_DIR}/examples/presentation.js"  {출력폴더}/presentation.js
```

### 3단계: index.html 작성

아래 뼈대를 기반으로 슬라이드를 작성한다.
슬라이드 유형 선택은 **`references/slide-types.md`** 참조.

---

## index.html 뼈대

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>프레젠테이션 제목</title>

  <!-- 엔진 스타일 (수정 금지) -->
  <link rel="stylesheet" href="presentation.css">

  <!--
    선택: CSS 변수로 색상 커스터마이즈 (필요할 때만 주석 해제)
  <style>
    :root {
      --slide-bg:    linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      --slide-color: #f0f0f0;
      --primary:     #60a5fa;
      --accent:      #fb923c;
    }
    [data-theme="light"] {
      --slide-bg:    #f4f6f9;
      --slide-color: #1a1a1a;
      --primary:     #0057b7;
    }
  </style>
  -->
</head>
<body>

<!-- 고정 UI (수정 금지) -->
<div class="progress-bar-track" aria-hidden="true">
  <div class="progress-bar" id="progress-bar"></div>
</div>
<div class="slide-counter" aria-hidden="true">
  <span id="current-num">1</span> / <span id="total-num"></span>
</div>
<button class="theme-toggle" id="theme-toggle" aria-label="다크/라이트 모드 전환 (D)">🌙</button>
<div class="sr-only" aria-live="polite" aria-atomic="true" id="slide-status"></div>

<!-- ★ 프레젠테이션 영역 — section만 추가/수정 -->
<main class="presentation" role="region" aria-label="프레젠테이션" id="presentation">

  <!-- 슬라이드 section들 여기에 -->

</main>

<!-- 도움말 오버레이 (수정 금지) -->
<div id="help-overlay" class="help-overlay" role="dialog" aria-modal="true"
     aria-label="키보드 단축키 안내" hidden>
  <div class="help-content">
    <h2>키보드 단축키</h2>
    <dl class="help-grid">
      <dt>→ / Space / PageDown</dt><dd>다음 슬라이드</dd>
      <dt>← / PageUp</dt><dd>이전 슬라이드</dd>
      <dt>Home / End</dt><dd>처음 / 마지막</dd>
      <dt>F</dt><dd>전체화면</dd>
      <dt>N</dt><dd>발표자 노트</dd>
      <dt>D</dt><dd>다크/라이트 전환</dd>
      <dt>?</dt><dd>이 도움말</dd>
    </dl>
    <button class="help-close" id="help-close">닫기 (Esc)</button>
  </div>
</div>

<!-- 엔진 스크립트 (수정 금지) -->
<script src="presentation.js"></script>
</body>
</html>
```

---

## 완료 후 안내

```
✅ 생성 완료: {폴더명}/
📁 파일 구조:
  {폴더명}/
  ├── presentation.css  (엔진 스타일 — 수정 금지)
  ├── presentation.js   (엔진 스크립트 — 수정 금지)
  └── index.html        (★ 슬라이드 내용 파일)

🚀 실행 방법: index.html을 브라우저에서 열기

⌨️  키보드 단축키:
  → / Space    다음 슬라이드
  ←            이전 슬라이드
  N            발표자 노트 토글
  D            다크/라이트 전환
  F            전체화면
  ?            단축키 도움말
```
