---
name: card-news-create
description: "컨텍스트를 입력받아 카드뉴스 HTML과 PNG 이미지를 자동 생성한다. 템플릿 자동/수동 선택, 슬라이드 구성, 콘텐츠 삽입, 이미지 변환을 모두 수행한다. 출력: output/YYYY-MM-DD-주제/ 폴더."
allowed-tools:
  - Read
  - Write
  - Bash
  - mcp__plugin_playwright_playwright__browser_resize
  - mcp__plugin_playwright_playwright__browser_navigate
  - mcp__plugin_playwright_playwright__browser_wait_for
  - mcp__plugin_playwright_playwright__browser_take_screenshot
  - mcp__plugin_playwright_playwright__browser_close
---

# card-news-create

컨텍스트(주제, 내용)를 입력받아 카드뉴스 HTML 파일과 PNG 이미지를 자동 생성하는 스킬.

## 경로 정보

- 스킬 폴더: `${CLAUDE_SKILL_DIR}/` (SKILL.md 위치, 설치 경로 자동 해석)
- 템플릿 위치: `${CLAUDE_SKILL_DIR}/template/`
- 예제 이미지: `${CLAUDE_SKILL_DIR}/examples/`
- 출력 위치: `./output/YYYY-MM-DD-{핵심주제}/` (현재 작업 디렉토리 기준)
- HTTP 서버 루트: 현재 작업 디렉토리 (output/ 서빙용)

## 사용 가능한 템플릿 (8개)

| 폴더명 | 선택 기준 | 슬라이드 수 |
|-------|---------|-----------|
| 남색_깔끔_홍보_안내 | 기업/정책 홍보, 신뢰감, 프로페셔널 | 9 |
| 빨강_깔끔_마케팅_콘텐츠_안내 | 마케팅, 캠페인, 강렬한 인상 | 8 |
| 파랑_깔끔_뉴스_홍보 | 뉴스레터, 소식 전달, 짧은 내용 | 5 |
| 파랑_심플_공지사항_안내 | 공지사항, 월간 소식, 친근한 분위기 | 5 |
| 파랑_심플_홍보_안내 | 일반 홍보, 다목적, 안정적 | 9 |
| 파랑_회식_깔끔_표_위주 | 데이터/표 중심, 리포트형 | 4 |
| 회색_파랑_모던_홍보_안내 | 모던, 세련, 스타트업/기술 | 8 |
| 흑백_깔끔_온보딩_안내 | 온보딩, 튜토리얼, 미니멀 가이드 | 7 |

## 슬라이드 타입 및 파일명 규칙

| 타입 | 파일명 접미사 | 설명 |
|------|------------|------|
| 표지 | `-cover` | 필수. 제목, 부제, 배지 |
| 목차 | `-toc` | 3장 이상 시 권장 |
| 핵심 메시지 | `-key-message` | 강조 박스 + 설명 |
| 이미지 설명 | `-image` | 전체 이미지 배경 |
| 비교 정리 | `-comparison` | 좌우/상하 비교 |
| 포인트 정리 | `-points` | 체크리스트형 |
| 표 레이아웃 | `-table` | 데이터 표 |
| 이미지 그리드 | `-image-grid` | N개 이미지 배열 |
| 순서 레이아웃 | `-steps` | STEP 카드 |
| 마무리/CTA | `-closing` | 마지막 슬라이드 권장 |

---

## 실행 절차

### STEP 1 — 컨텍스트 분석

입력된 컨텍스트를 분석한다:
- **주제**: 핵심 주제 한 문장
- **목적**: 홍보 / 안내 / 교육 / 마케팅 / 공지 등
- **대상**: 독자층
- **핵심 메시지**: 전달하고자 하는 핵심 내용
- **주요 항목**: 슬라이드로 표현할 개별 내용들

사용자가 템플릿을 지정하지 않으면 → 목적/분위기에 맞는 템플릿을 자동 선택한다.
선택 기준이 명확하지 않으면 → 후보 2~3개를 사용자에게 제시하고 선택하게 한다.

### STEP 2 — 슬라이드 구성 계획

분석 결과를 바탕으로 슬라이드 목록을 구성한다.

**구성 원칙:**
- cover는 항상 첫 슬라이드 (필수)
- 슬라이드가 3장 이상이면 toc 권장
- closing은 마지막 슬라이드 권장
- 각 슬라이드에 어떤 내용이 들어갈지 미리 배분

**슬라이드 추가/삭제 기준:**
- 내용이 적으면 기존 슬라이드 삭제 (필요 없는 타입 제거)
- 내용이 많으면 같은 타입의 슬라이드 추가 (예: points 슬라이드 2개)
  → 추가 시 기존 파일을 복제해서 번호만 변경

슬라이드 계획표를 아래 형식으로 사용자에게 보여주고, **확인을 받은 후** 다음 단계로 진행한다:

```
슬라이드 구성 계획:
01. cover  — [제목]
02. toc    — [목차 항목 N개]
03. points — [포인트 항목들]
04. table  — [표 내용]
05. closing — [마무리 메시지]

템플릿: {선택된_템플릿명}
출력 폴더: output/{날짜}-{핵심주제}/

진행할까요?
```

### STEP 3 — 출력 폴더 생성 및 템플릿 복사

```bash
# 출력 폴더명 결정 (날짜 + 핵심주제, 영문/한글 혼용 가능, 공백은 하이픈으로)
mkdir -p "./output/{YYYY-MM-DD}-{핵심주제}"

# 템플릿 전체 복사 (HTML, CSS 모두)
cp -r "${CLAUDE_SKILL_DIR}/template/{선택된_템플릿}/." \
      "./output/{YYYY-MM-DD}-{핵심주제}/"
```

### STEP 4 — 불필요한 슬라이드 삭제

계획에 없는 슬라이드 HTML 파일을 삭제한다.
(예: 표가 없는 경우 `slide-XX-table.html` 삭제)

삭제 후 파일명 번호는 그대로 유지한다. index.html의 `slides` 배열만 실제 순서에 맞게 업데이트한다. (파일명 번호 재정렬 불필요)

### STEP 5 — HTML 콘텐츠 삽입

각 슬라이드 HTML 파일을 Read → 실제 콘텐츠로 교체 → Write한다.

**공통 주의사항:**
- 클래스명, 태그 구조, SVG는 변경하지 않는다
- 텍스트 노드와 간단한 속성(href, src 등)만 교체한다
- `<span class="ct-blue">`, `<span class="ct-black">` 등 색상 태그는 원본 패턴 유지

**슬라이드 타입별 변경 포인트:**

**cover:**
- `.cover-badge`, `.cover-script-text`, `.cal-header` 등: 배지/레이블 텍스트
- `.cover-title` 내 각 줄: 제목 (색상 태그 패턴 유지)
- `.cover-url`, `.cover-sub`: 부제 또는 URL

**toc:**
- `.toc-item-title`: 각 챕터 제목
- `.toc-item-desc`: 각 챕터 설명
- 항목 수를 계획에 맞게 `<li>` 추가/삭제

**key-message:**
- `.key-box-text`, `.pin-line`: 강조 문구
- `.key-desc`, `.body-text`: 설명 단락

**points:**
- `.point-label-text`: 포인트 레이블 (짧게, 2줄 이내)
- `.point-desc`: 포인트 설명
- 항목 수를 계획에 맞게 `<li>` 추가/삭제

**table:**
- `thead th`: 열 헤더
- `tbody tr td`: 데이터 행
- `.table-desc`: 표 설명

**steps:**
- `.step-header` 내 번호/레이블
- `.step-desc`: 각 단계 설명
- `.step-keyword`: 단계 키워드

**comparison:**
- `.compare-label`: 비교 항목 레이블
- `.bullet-list li`: 각 항목

**closing:**
- 마무리 제목, 메시지, 연락처 정보

> 템플릿에 `-closing` 파일이 없는 경우, 마지막 슬라이드에 마무리 메시지를 추가하거나 기존 마지막 슬라이드로 closing 역할을 겸하게 한다.

---

**템플릿별 고유 슬라이드 타입** (위 표준 타입 외 추가 유형):

**[빨강_깔끔_마케팅_콘텐츠_안내 전용]**

**text-body (텍스트 중심):**
- `.slide-h1`: 슬라이드 제목
- `.body-text`: 본문 단락

**photo (사진 강조):**
- `.slide-h1`: 슬라이드 제목
- `.photo-caption`: 사진 하단 설명

**two-col (2단 분할):**
- `.slide-h1`: 슬라이드 제목
- `.col-label`: 각 열 소제목 (2개)

**icon-grid (아이콘 그리드):**
- `.icon-keyword`: 아이콘 소제목 (3개)
- `.icon-desc`: 아이콘 설명 (3개)

**[파랑_심플_공지사항_안내 전용]**

**notice-table (공지 목록):**
- `.cal-header`: 상단 월/시즌 레이블 (예: `APRIL NEWSLETTER`)
- `.page-title`: 슬라이드 제목
- `.notice-label`: 각 항목 레이블 (2줄 이내)
- `.notice-content`: 각 항목 내용

**profile (인물 프로필):**
- `.cal-header`: 상단 레이블
- `.page-title`: 슬라이드 제목
- `.profile-ribbon`: 이름/직책 텍스트
- `.profile-desc`: 선발 이유 설명

**[파랑_회식_깔끔_표_위주 전용]**

**info-cards (안내 카드 목록):**
- `.header-title`: 섹션 제목
- `.header-subtitle`: 부제
- `.info-card-title`: 각 카드 항목명 (예: 일시 및 장소, 문의처)
- `.info-card-body`: 각 카드 내용

**row-table (행 위주 표):**
- `.header-title`: 섹션 제목
- `.header-subtitle`: 부제
- `.table-intro-title` / `.table-intro-sub`: 표 안내 문구
- `thead th`: 열 헤더
- `tbody tr td`: 데이터 셀

**grid-table (그리드 일정표):**
- `.header-title`: 섹션 제목
- `.header-subtitle`: 부제
- `.grid-intro-text`: 안내 문구
- `.schedule-cell-header`: 시간대
- `.schedule-venue`: 장소
- `.schedule-prog`: 프로그램명

**[회색_파랑_모던_홍보_안내 전용]**

**section (섹션 구분 페이지):**
- `.section-num`: 섹션 번호 (`01`, `02` …)
- `.section-main-title`: 섹션 제목
- `.section-body-text`: 섹션 설명 (2~4줄)

**image-list (이미지+텍스트 목록):**
- `.page-title` 내 `.t-blue`: 강조 단어
- `.img-list-title`: 각 항목 제목
- `.img-list-desc`: 각 항목 설명 (2~3줄)

**[흑백_깔끔_온보딩_안내 전용]**

**welcome (환영 페이지):**
- `.top-bar-company`: 상단 레이블 (예: `온보딩을 시작하며`)
- `.welcome-pre`: 회사명 (소제목)
- `.welcome-title`: 환영 제목 (2줄, `<br>` 포함)
- `.item-title` / `.item-desc`: 안내 항목 제목/설명 (3쌍)
- `.footer-logo` / `.footer-date`: 하단 회사명/날짜 (모든 슬라이드 공통)

**mission-vision (미션/비전):**
- `.top-bar-company`: 상단 레이블
- `.section-pre`: 회사명
- `.page-title`: 페이지 제목
- `.desc-text`: 전체 설명 문장
- `.mv-label` + `.mv-text`: MISSION / VISION 쌍 (각 1개)
- `.core-pill`: 핵심가치 태그 (여러 개, `<div>` 추가/삭제 가능)

**checklist (체크리스트):**
- `.top-bar-company` / `.top-bar-category`: 상단 레이블 2개
- `.page-title-main` / `.page-title-sub`: 제목 2부분
- `.checklist-col-header`: 열 제목 (3열: `--black` / `--gray` / `--blue` 클래스 유지)
- `.check-text`: 체크 항목 텍스트 (열마다 여러 개)
- `.qa-q` / `.qa-a`: Q&A 텍스트
- `.time-badge`: 연락처 배지 텍스트 (3개)

### STEP 6 — index.html 업데이트

index.html의 `slides` 배열을 실제 생성된 슬라이드 목록으로 수정한다:

```javascript
const slides = [
  { num: '01', name: '표지',   file: 'slide-01-cover.html' },
  { num: '02', name: '목차',   file: 'slide-02-toc.html' },
  // ... 실제 슬라이드만 포함
];
```

### STEP 7 — 결과 보고 및 대기

HTML/CSS 생성이 완료되면 사용자에게 아래 내용을 알리고 **이미지 추출은 하지 않는다:**
- 생성된 폴더 경로
- 생성된 슬라이드 HTML 파일 목록
- "이미지로 추출하려면 '이미지 추출해줘' 라고 말씀해 주세요."

### STEP 8 — 이미지 변환 (사용자 요청 시에만 실행)

사용자가 이미지 추출을 명시적으로 요청할 때만 실행한다.
("이미지 추출해줘", "이미지로 만들어줘", "스크린샷 찍어줘" 등)

**HTTP 서버 시작:**
```bash
python3 -m http.server 18080 &
sleep 1
```

**각 슬라이드 HTML에 대해 순서대로 실행:**
1. `browser_resize(1080, 1440)` — 첫 슬라이드에서 한 번만 설정
2. `browser_navigate("http://localhost:18080/output/{날짜-주제}/slide-NN-type.html")`
3. `browser_wait_for(time: 2)` — 웹폰트 로드 대기
4. `browser_take_screenshot(type: "png", filename: "$(pwd)/output/{날짜-주제}/slide-NN-type.png")`

**서버 종료 (Windows):**
```bash
taskkill //F //IM python3.exe 2>/dev/null; echo "서버 종료"
```

**브라우저 닫기:**
`browser_close`

완료 후 생성된 PNG 파일 목록을 사용자에게 알린다.

---

## 주의사항

- `file://` 프로토콜은 Playwright MCP에서 차단됨 → 반드시 HTTP 서버 경유
- 웹폰트(Pretendard 등)는 CDN 로드 → 인터넷 연결 필요
- 이미지 변환 완료 후 HTTP 서버 반드시 종료
- 슬라이드 번호는 항상 2자리 zero-pad: `01`, `02`, ...
- 추가 슬라이드 생성 시 기존 슬라이드의 CSS 클래스/구조를 그대로 유지

## 사용 예시

```
/card-news-create 우리 팀 4월 온보딩 안내 자료 만들어줘
/card-news-create 신제품 런칭 마케팅 카드뉴스 (빨강 템플릿으로)
/card-news-create [긴 컨텍스트 내용 붙여넣기]
```
