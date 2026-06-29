/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           grid-layout-manual.js — 사용법 레퍼런스 슬라이드         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 이 파일을 실행하면 사용법 PPTX가 만들어진다.
 * 실행:  node scirpts/grid-layout-manual.js
 * 출력:  scirpts/grid-layout-manual.pptx  (인수로 경로 변경 가능)
 *
 * ─── 전체 아키텍처 ────────────────────────────────────────────────
 *
 *  tokens.js      디자인 토큰 (색상, 폰트, 페이지 크기 상수)
 *      ↓
 *  components.js  pptxgenjs 래퍼 함수들 (addTable, addBulletList 등)
 *      ↓
 *  grid-engine.js grid → inch 변환, 검증, compileToPptx 진입점
 *      ↓
 *  build_*.js     슬라이드 spec 선언 → compileToPptx 호출 → pptx 저장
 *
 * ─── 빠른 요약 ────────────────────────────────────────────────────
 *
 *  1. spec = { slides: [ ...slideSpec ] }
 *  2. 각 slideSpec: { sectionLabel?, pageText?, elements: [...] }
 *  3. 각 element:  { type, grid: { colStart, colSpan, rowStart, rowSpan }, ...props }
 *  4. validateSpec(spec)   → 빌드 전 grid 오류 검사 (에러 발생 시 throw)
 *  5. compileToPptx(pptx, spec) → pptxgenjs 호출
 *  6. pptx.writeFile(OUTPUT_PATH) → 파일 저장
 */

'use strict';

const path = require('path');
const PptxGenJS = require('pptxgenjs');

// ── 토큰: 색상/폰트 상수. 이 값들을 직접 문자열로 쓰지 말고 여기서 가져와라.
const { COLORS, FONT_KR, TYPE } = require('./lib/tokens');

// ── 컴포넌트: pptxgenjs를 직접 호출하는 헬퍼들.
//   compileToPptx가 처리하지 않는 것들(addKeyMessageBar 등)은
//   반드시 custom type의 render() 안에서 직접 호출해야 한다.
const {
    newPresentation,
    addKeyMessageBar, // ← custom render 안에서만 호출 가능
    addSubheading, // ← custom render 안에서만 호출 가능
    addColumnNote, // ← custom render 안에서만 호출 가능
    addBulletList, // ← custom render 안에서만 호출 가능 (또는 type:'bullets')
    addTable, // ← custom render 안에서만 호출 가능 (또는 type:'table')
    addCallout, // ← custom render 안에서만 호출 가능 (또는 type:'callout')
    addSectionCard, // ← custom render 안에서만 호출 가능 (또는 type:'sectionCard')
    addStepsRow, // ← 신규: 가로 스텝 카드 + 화살표
    renderDecisionCard, // ← custom render 안에서만 호출 가능
} = require('./lib/components');

// ── 그리드 엔진
const { compileToPptx, validateSpec } = require('./lib/grid-engine');

// ── CLI 인수: node manual.js [출력폴더] [파일명.pptx]
const [, scriptPath, argDir, argFile] = process.argv;
const outDir = argDir ?? path.dirname(scriptPath);
const outFile = argFile ?? path.basename(scriptPath, '.js') + '.pptx';
const OUTPUT_PATH = path.join(outDir, outFile);

const pptx = newPresentation(PptxGenJS);

// ════════════════════════════════════════════════════════════════════
// spec 선언 시작
// ════════════════════════════════════════════════════════════════════

const spec = {
    // layout을 생략하면 DEFAULT_LAYOUT이 적용된다:
    //   columns: 12, rows: 24
    //   columnGap: 0.12in, rowGap: 0.08in
    //   margin: { top:0.5, right:0.6, bottom:0.5, left:0.6 }
    //
    // 커스텀 layout이 필요하면:
    //   layout: { columns: 12, rows: 24, columnGap: 0.12, rowGap: 0.08,
    //             margin: { top:0.5, right:0.6, bottom:0.5, left:0.6 } }

    slides: [
        // ════════════════════════════════════════════════════════════
        // 슬라이드 1 — titleSlide (full-bleed 표지)
        // ════════════════════════════════════════════════════════════
        //
        // titleSlide 는 grid 엔진을 우회한다. 페이지 전체를 고정 좌표로 직접 그린다.
        // elements 배열 없음. titleSlide 키만 있으면 된다.
        //
        // 필드:
        //   title    — 소제목 (파란색 강조 텍스트)
        //   subtitle — 대제목 (큰 네이비 텍스트)
        //   tagline  — 부제/설명 한 줄 (회색)
        //   footer   — 하단 메타 정보 (날짜, 기밀 표시 등)
        {
            titleSlide: {
                title: 'Grid Layout System',
                subtitle: '사용법 레퍼런스',
                tagline: 'tokens · components · grid-engine — 이 파일만 읽으면 바로 쓸 수 있다',
                footer: '2026  |  내부 참고용',
            },
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 2 — 그리드 시스템 이해
        // ════════════════════════════════════════════════════════════
        //
        // ┌─ slideSpec 필드 ─────────────────────────────────────────┐
        // │  sectionLabel : 좌상단 네이비 pill 텍스트 (섹션 이름)       │
        // │  pageText     : 우상단 페이지 번호 텍스트                   │
        // │  elements     : 콘텐츠 배열 (아래에서 설명)                 │
        // └──────────────────────────────────────────────────────────┘
        //
        // sectionLabel 또는 pageText 가 있으면 헤더가 그려진다.
        // 헤더가 있으면 grid의 top margin이 자동으로 CONTENT_TOP_Y(0.85in)로
        // 올라간다 — 직접 rowStart를 밀 필요 없다.
        //
        // ┌─ grid 좌표 체계 ─────────────────────────────────────────┐
        // │  colStart: 1~12, rowStart: 1~24 (1-indexed)              │
        // │  colSpan/rowSpan: 점유할 칸 수 (최소 1)                   │
        // │  colStart + colSpan - 1 <= 12 (초과하면 에러)              │
        // │  rowStart + rowSpan - 1 <= 24 (초과하면 에러)              │
        // │                                                           │
        // │  col 12칸 = 페이지 너비 전체 (마진 제외)                   │
        // │  row 24칸 = 페이지 높이 전체 (마진 제외, 헤더 고려 후)       │
        // │                                                           │
        // │  관례: 헤더 있는 슬라이드에서는                             │
        // │    row  1~2  → 슬라이드 제목 (type:'text', style:'title') │
        // │    row  3~4  → 헤드라인 (type:'text', style:'headline')  │
        // │    row  5~21 → 본문 콘텐츠                                │
        // │    row 20~21 → caption (출처·주의 텍스트)                  │
        // │    row 22~23 → addKeyMessageBar (네이비 결론 바)           │
        // └──────────────────────────────────────────────────────────┘
        {
            sectionLabel: '01. 그리드 시스템',
            pageText: '02',
            elements: [
                // type:'text', style:'title' — 슬라이드 제목
                // col 1~12 전체, row 1~2
                {
                    type: 'text',
                    style: 'title',
                    text: '그리드 시스템: 12열 × 24행',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },

                // 좌: 설명 텍스트
                {
                    type: 'text',
                    style: 'body',
                    text: '슬라이드 콘텐츠 영역을 12열 × 24행으로 나눈다.\n각 element는 colStart / colSpan / rowStart / rowSpan으로 위치를 잡는다.\n실제 inch 좌표 계산은 grid-engine이 자동으로 처리한다.',
                    grid: { colStart: 1, colSpan: 7, rowStart: 4, rowSpan: 5 },
                },

                // 우: 핵심 수치 metric 카드 3개
                {
                    type: 'metric',
                    value: '12열',
                    label: '가로 분할 단위',
                    tag: '콘텐츠 영역 기준',
                    grid: { colStart: 8, colSpan: 2, rowStart: 4, rowSpan: 5 },
                },
                {
                    type: 'metric',
                    value: '24행',
                    label: '세로 분할 단위',
                    tag: '헤더 포함 자동 보정',
                    grid: { colStart: 10, colSpan: 3, rowStart: 4, rowSpan: 5 },
                },

                // 그리드 구역 안내 표
                {
                    type: 'table',
                    header: ['구역', '관례 row', '용도'],
                    colWRatio: [2, 2, 8],
                    rows: [
                        ['제목', 'row  1~ 2', 'type:text, style:title'],
                        ['헤드라인', 'row  3~ 4', 'type:text, style:headline'],
                        ['본문', 'row  5~19', '표/불릿/메트릭/카드 등 자유 배치'],
                        ['캡션', 'row 20~21', 'type:text, style:caption (출처·주의)'],
                        ['결론 바', 'row 22~23', 'custom → addKeyMessageBar()'],
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 10, rowSpan: 9 },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: '헤더(sectionLabel/pageText)가 있으면 top margin이 CONTENT_TOP_Y(0.85in)로 자동 조정된다. rowStart를 직접 밀 필요 없음.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },

                // addKeyMessageBar — custom type으로만 사용 가능
                // grid 좌표를 받지만 실제로는 y 위치만 의미가 있다.
                // render(slide) — box 인수는 무시해도 됨 (내부에서 고정 좌표 사용)
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '그리드는 선언적이다 — 좌표 계산은 엔진이 한다'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 3 — text 4가지 스타일
        // ════════════════════════════════════════════════════════════
        //
        // type: 'text' 는 style 필드로 렌더러를 선택한다.
        //
        //  style: 'title'    → addSlideTitle     (30pt bold, 네이비)
        //  style: 'headline' → addHeadline        (16pt bold, 액센트 블루)
        //  style: 'body'     → addBodyText        (14pt, 자동 overflow 폰트 축소)
        //  style: 'caption'  → addCaption         (12pt, 회색)
        //
        // ⚠ title / headline / caption 은 폰트를 축소하지 않는다.
        //   텍스트가 넘치면 경고만 출력되고 잘린다.
        //   body 만 fontSize를 30→28→26pt 순으로 단계 축소한 뒤 rowSpan+1 확장 시도.
        {
            sectionLabel: '02. text 스타일',
            pageText: '03',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: 'text 4가지 스타일 비교',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },

                // headline — 슬라이드의 핵심 주장 한 줄
                // 결론/판단을 담는다. 의문문·평서문 모두 가능.
                {
                    type: 'text',
                    style: 'headline',
                    text: '이것이 headline 스타일이다 — 슬라이드 핵심 메시지를 여기에 쓴다.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },

                // 각 스타일 시각적 비교 — style:'title'은 text 길이를 짧게 유지해야 overflow 경고가 없다
                {
                    type: 'text',
                    style: 'title',
                    text: 'style: title — 30pt bold, 네이비',
                    grid: { colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: 'style: headline — 16pt bold, 액센트 블루 (핵심 주장 한 줄)',
                    grid: { colStart: 1, colSpan: 12, rowStart: 10, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'body',
                    text: 'style: body — 14pt, 검정. overflow 시 폰트 자동 축소(14→13→12pt). rowSpan이 부족하면 +1 확장까지 시도한다. title/headline/caption과 달리 유일하게 overflow를 처리하는 스타일.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 12, rowSpan: 3 },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: 'style: caption — 12pt, 회색. 출처·주의사항·보충 설명. 슬라이드 하단 row 20~21에 관례적으로 배치.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 15, rowSpan: 2 },
                },

                // ── 주의 ───────────────────────────────────────────
                // style 생략 시 'body'로 폴백된다.
                // text 필드가 비어 있어도 에러는 없지만 경고가 나올 수 있다.

                {
                    type: 'text',
                    style: 'caption',
                    text: '⚠ title/headline/caption은 폰트 자동 축소가 없다. 텍스트가 칸보다 길면 잘린다. body만 overflow를 처리한다.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'body만 overflow를 처리한다 — 나머지는 칸에 맞게 써라'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 4 — bullets + table
        // ════════════════════════════════════════════════════════════
        {
            sectionLabel: '03. bullets & table',
            pageText: '04',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: 'bullets와 table: 목록과 표',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },

                // ── type: 'bullets' ────────────────────────────────
                // points 배열 → 불릿 목록
                // fontSize는 grid-engine이 overflow 시 자동 축소
                {
                    type: 'bullets',
                    points: [
                        'points 배열에 문자열을 넣으면 불릿 목록이 된다',
                        '불릿 기호는 ● (U+25CF) 고정',
                        'fontSize는 overflow 시 자동 축소 (body와 동일)',
                        '줄 간격 기본값: 1.6배 (TYPE.bulletlist.lineSpacingMultiple)',
                    ],
                    grid: { colStart: 1, colSpan: 6, rowStart: 4, rowSpan: 6 },
                },

                // ── type: 'table' ───────────────────────────────────
                // header : 헤더 행 (네이비 배경, 흰 글씨)
                // rows   : 본문 행 배열 (짝수/홀수 교차 배색)
                // colWRatio : 열 너비 비율 (생략 시 균등 분할)
                //
                // ⚠ colWRatio 합계가 정확하지 않아도 된다 — 비율만 맞으면 된다.
                //   [1, 2, 1] 이면 25% / 50% / 25%
                {
                    type: 'table',
                    header: ['필드', '타입', '설명'],
                    colWRatio: [2, 2, 6],
                    rows: [
                        ['header', 'string[]', '헤더 행. 네이비 배경 자동 적용.'],
                        ['rows', 'string[][]', '본문 행. 짝수/홀수 교차 배색.'],
                        ['colWRatio', 'number[]?', '열 너비 비율. 생략 시 균등.'],
                        ['grid', 'GridPos', 'colStart/colSpan/rowStart/rowSpan'],
                    ],
                    grid: { colStart: 7, colSpan: 6, rowStart: 4, rowSpan: 7 },
                },

                // colWRatio 예시 — 3열을 1:3:2 비율로
                {
                    type: 'table',
                    header: ['구분', '내용', '비고'],
                    colWRatio: [1, 3, 2], // 1:3:2 비율
                    rows: [
                        ['A', 'colWRatio: [1,3,2] → 16.7% / 50% / 33.3%', '비율 합계는 무관'],
                        ['B', '생략하면 균등 → 33.3% / 33.3% / 33.3%', '3열이면 각 1/3'],
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 11, rowSpan: 5 },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: 'table의 행 높이는 박스 높이 ÷ 행 수로 자동 계산된다 (최소 0.28in). 행이 많으면 칸을 늘려라.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'colWRatio는 비율이다 — 합계 맞출 필요 없다'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 5 — metric + sectionCard + callout
        // ════════════════════════════════════════════════════════════
        {
            sectionLabel: '04. metric · sectionCard · callout',
            pageText: '05',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '카드형 컴포넌트 3종',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },

                // ── type: 'metric' ──────────────────────────────────
                // 연한 파란 배경 카드. 숫자/지표 하이라이트용.
                // value: 큰 텍스트 (21pt bold, 파란색)
                // label: value 아래 작은 설명 (12pt)
                // tag  : label 아래 더 작은 부가 정보 (9pt, 회색) — 선택적
                //
                // ┌─ rowSpan 최솟값 (metric) ─────────────────────────────────────┐
                // │  addMetricCard는 내부 요소를 고정 y 좌표로 배치한다:            │
                // │    value  → y+0.12, h=0.44  (하단: y+0.56)                    │
                // │    label  → y+0.61, h=0.28  (하단: y+0.89)                    │
                // │    tag    → y+0.90, h=0.22  (하단: y+1.12)  ← tag 있을 때     │
                // │                                                                │
                // │  헤더 있는 슬라이드 기준:                                      │
                // │    rowSpan:4 → h ≈ 0.96in                                     │
                // │      tag 없음: label 하단(0.89) < 0.96 → 표시됨               │
                // │      tag 있음: tag 하단(1.12) > 0.96 → tag가 카드 밖으로 밀림  │
                // │    rowSpan:5 → h ≈ 1.22in                                     │
                // │      tag 있음: tag 하단(1.12) < 1.22 → 정상 표시              │
                // │                                                                │
                // │  결론: tag를 쓴다면 rowSpan 5 이상 필수.                       │
                // │        tag 없이 value+label만 쓴다면 rowSpan 4도 가능.         │
                // └────────────────────────────────────────────────────────────────┘
                {
                    type: 'metric',
                    value: '42%',
                    label: 'metric 카드',
                    tag: 'tag는 선택적',
                    grid: { colStart: 1, colSpan: 3, rowStart: 4, rowSpan: 5 },
                },
                {
                    type: 'metric',
                    value: '1,234',
                    label: '숫자 강조용',
                    grid: { colStart: 4, colSpan: 3, rowStart: 4, rowSpan: 5 },
                },

                // ── type: 'sectionCard' ─────────────────────────────
                // 둥근 모서리 카드. 섹션 구분 / 항목 설명용.
                // kicker: 작은 파란 레이블 (상단, 12pt bold)
                // title:  굵은 본문 제목 (12pt bold, 기본)
                // detail: 설명 텍스트 (12pt, 회색)
                // titleSize / detailSize: 폰트 크기 조정 (선택적)
                //
                // ┌─ rowSpan 최솟값 (sectionCard) ────────────────────────────────┐
                // │  addSectionCard는 내부 요소를 고정 y 좌표로 배치한다:           │
                // │    kicker → y+0.12, h=0.22  (하단: y+0.34)                    │
                // │    title  → y+0.39, h=0.34  (하단: y+0.73)                    │
                // │    detail → y+0.78, h = max(카드높이 - 0.90, 0.20)            │
                // │                                                                │
                // │  헤더 있는 슬라이드 기준:                                      │
                // │    rowSpan:4 → h ≈ 0.96in                                     │
                // │      detail 높이 = max(0.96 - 0.90, 0.20) = max(0.06, 0.20)  │
                // │                 = 0.20in (강제 최솟값)                         │
                // │      → 글자가 2줄 이상이면 잘림. 한 줄짜리라도 매우 빡빡함.    │
                // │    rowSpan:5 → h ≈ 1.22in                                     │
                // │      detail 높이 = max(1.22 - 0.90, 0.20) = 0.32in            │
                // │      → 2줄 내외 정상 표시.                                     │
                // │                                                                │
                // │  결론: detail 텍스트가 한 줄 이상이면 rowSpan 5 이상 사용.     │
                // └────────────────────────────────────────────────────────────────┘
                {
                    type: 'sectionCard',
                    kicker: 'sectionCard',
                    title: '섹션·항목 구분 카드',
                    detail: 'kicker + title + detail 3단 구조',
                    grid: { colStart: 7, colSpan: 3, rowStart: 4, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: '크기 조정 가능',
                    title: 'titleSize: 14',
                    detail: 'detailSize: 9.5',
                    titleSize: 14,
                    detailSize: 9.5,
                    grid: { colStart: 10, colSpan: 3, rowStart: 4, rowSpan: 5 },
                },

                // ── type: 'callout' ─────────────────────────────────
                // 연한 파란 배경 둥근 박스. 강조 문구용.
                // text:   표시할 텍스트
                // accent: true → 진한 파란 배경 + 흰 글씨 (기본: 연한 파란 배경)
                {
                    type: 'callout',
                    text: 'callout — 연한 파란 배경 강조 박스. accent: false(기본)',
                    grid: { colStart: 1, colSpan: 6, rowStart: 10, rowSpan: 2 },
                },
                {
                    type: 'callout',
                    text: 'callout — accent: true → 진한 파란 배경 + 흰 글씨',
                    accent: true,
                    grid: { colStart: 7, colSpan: 6, rowStart: 10, rowSpan: 2 },
                },

                {
                    type: 'table',
                    header: ['타입', '용도', '주요 필드'],
                    colWRatio: [2, 4, 6],
                    rows: [
                        ['metric', '수치 KPI 강조', 'value, label, tag(선택)'],
                        ['sectionCard', '섹션·항목 설명 카드', 'kicker, title, detail, titleSize, detailSize'],
                        ['callout', '인라인 강조 박스', 'text, accent(기본 false)'],
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 13, rowSpan: 5 },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: 'metric/sectionCard/callout 모두 compileToPptx의 switch 안에 있어 spec에서 직접 선언 가능.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'metric/sectionCard/callout — 모두 spec에서 직접 선언'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 6 — custom type 기본
        // ════════════════════════════════════════════════════════════
        //
        // type: 'custom' 은 compileToPptx switch 밖에 있다.
        // render(slide, box) 콜백에서 원하는 모든 pptxgenjs 호출이 가능하다.
        //
        // box: { x, y, w, h } — grid 좌표를 inch로 변환한 결과.
        //   → box 안에서 자유롭게 배치하면 된다.
        //   → box.x / box.y 기준으로 상대 좌표를 더하거나, box.w / box.h 로 비율 계산.
        //
        // ⚠ custom은 overlap / out-of-bounds 검증을 통과하지만
        //   내부 콘텐츠가 box를 벗어나는지는 엔진이 알 수 없다.
        //   box.x + box.w 를 넘어가지 않도록 직접 관리해야 한다.
        {
            sectionLabel: '05. custom type',
            pageText: '06',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: 'custom type: render 콜백으로 자유 배치',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: 'compileToPptx가 처리 못하는 모든 것은 custom으로 해결한다.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },

                // custom 예 1: box를 그대로 활용해 callout 그리기
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 7, rowSpan: 3 },
                    render: (slide, box) => {
                        // box = { x, y, w, h } — grid 변환 결과
                        addCallout(slide, 'addCallout을 custom 안에서 직접 호출', { ...box });
                    },
                },

                // custom 예 2: box 안에서 addSubheading + addBulletList 조합
                // 이 패턴은 가장 자주 쓰인다.
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 7, rowSpan: 7 },
                    render: (slide, box) => {
                        // addSubheading: 네이비 굵은 소제목
                        addSubheading(slide, 'addSubheading + addBulletList 조합', {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                        });
                        // addBulletList: box.y + 0.35 아래부터 시작 (소제목 높이 확보)
                        addBulletList(
                            slide,
                            [
                                'addSubheading(slide, text, { x, y, w, fontSize? })',
                                'addBulletList(slide, points, { x, y, w, h, fontSize? })',
                                '두 번째 줄 y = box.y + 0.35 를 관례로 사용',
                                'addColumnNote(slide, text, { x, y, w }) — 표 아래 회색 주석',
                            ],
                            {
                                x: box.x,
                                y: box.y + 0.35, // 소제목 아래
                                w: box.w,
                                h: box.h - 0.35,
                                fontSize: 11,
                            },
                        );
                    },
                },

                // custom 예 3: box 좌표를 활용해 pptxgenjs 직접 호출 (col 1-6, row 11-13)
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 11, rowSpan: 3 },
                    render: (slide, box) => {
                        // box 좌표를 활용해 pptxgenjs 직접 호출도 가능
                        slide.addText('직접 pptxgenjs 호출 예시 (slide.addText)', {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            h: box.h,
                            fontFace: FONT_KR,
                            fontSize: 12,
                            color: COLORS.textSecondary,
                            align: 'center',
                            valign: 'middle',
                        });
                    },
                },

                {
                    type: 'table',
                    header: ['패턴', '코드'],
                    colWRatio: [3, 9],
                    rows: [
                        ['box 전체 사용', 'render: (slide, box) => addCallout(slide, text, { ...box })'],
                        ['subh + bullets', 'addSubheading(...); addBulletList(..., { y: box.y+0.35 })'],
                        ['box 안 분할', 'const half = box.w/2; addTable(..., {x:box.x, w:half}); ...'],
                        ['결론 바', 'render: (slide) => addKeyMessageBar(slide, text)'],
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 15, rowSpan: 5 },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: '⚠ custom의 render 안에서 grid-engine을 호출하지 마라 — box는 이미 계산된 결과다.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'custom = 자유도 최대 — box 범위만 지켜라'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 7 — custom 고급: box 분할 패턴
        // ════════════════════════════════════════════════════════════
        {
            sectionLabel: '06. custom 고급 패턴',
            pageText: '07',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: 'custom 고급: box 분할과 직접 호출',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: 'custom 안에서 box.w / box.h 를 쪼개면 하나의 grid 셀 안에 복합 레이아웃을 넣을 수 있다.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },

                // box를 좌우로 반씩 나누는 패턴
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 7, rowSpan: 10 },
                    render: (slide, box) => {
                        addSubheading(slide, '좌우 분할 패턴', { x: box.x, y: box.y, w: box.w });

                        const halfW = box.w / 2 - 0.05;
                        const leftX = box.x;
                        const rightX = box.x + halfW + 0.1;
                        const contentY = box.y + 0.35;
                        const contentH = box.h - 0.35;

                        // 좌측 테이블
                        addTable(
                            slide,
                            ['항목', '값'],
                            [
                                ['A', '100'],
                                ['B', '200'],
                                ['C', '300'],
                            ],
                            {
                                x: leftX,
                                y: contentY,
                                w: halfW,
                                colW: [0.7, halfW - 0.7],
                                rowH: 0.38,
                                fontSize: 10,
                            },
                        );

                        // 우측 텍스트
                        addSubheading(slide, '우측 소제목', { x: rightX, y: contentY, w: halfW, fontSize: 11 });
                        addBulletList(slide, ['항목 1', '항목 2', '항목 3'], {
                            x: rightX,
                            y: contentY + 0.32,
                            w: halfW,
                            h: contentH - 0.32,
                            fontSize: 10.5,
                        });
                    },
                },

                // addColumnNote — 표 아래 작은 회색 주석
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 7, rowSpan: 10 },
                    render: (slide, box) => {
                        addSubheading(slide, 'addColumnNote 예시', { x: box.x, y: box.y, w: box.w });

                        addTable(
                            slide,
                            ['구분', '내용'],
                            [
                                ['row 1', '내용 A'],
                                ['row 2', '내용 B'],
                            ],
                            {
                                x: box.x,
                                y: box.y + 0.35,
                                w: box.w,
                                colW: [1.4, box.w - 1.4],
                                rowH: 0.4,
                                fontSize: 10.5,
                            },
                        );

                        // addColumnNote: 표 아래 회색 9.5pt 주석 (출처 표기 등)
                        // y = box.y + 소제목 + 표 전체 높이 + 약간의 여백
                        const tableBottom = box.y + 0.35 + (2 + 1) * 0.4 + 0.1;
                        addColumnNote(slide, '출처: 내부 자료 / ★ = 검증 완료', {
                            x: box.x,
                            y: tableBottom,
                            w: box.w,
                        });
                    },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: 'box 분할 시 gap(0.1~0.15in) 을 빼야 칸이 겹치지 않는다. const half = box.w / 2 - 0.05 패턴 권장.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'box 분할 = box.w/2 - gap, y는 직접 쌓아라'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 8 — addStepsRow + renderDecisionCard
        // ════════════════════════════════════════════════════════════
        {
            sectionLabel: '07. addStepsRow & renderDecisionCard',
            pageText: '08',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '신규 컴포넌트 2종 시연',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },

                // addStepsRow — steps 배열을 균등 폭으로 나눠 sectionCard + ▶ 화살표 생성
                // custom render 안에서 호출한다.
                // opts: { titleSize, detailSize, arrowColor }
                //
                // ┌─ rowSpan 최솟값 ──────────────────────────────────────────────┐
                // │  sectionCard 내부는 kicker / title / detail 3단이다.           │
                // │    kicker  → y+0.12~0.38 (12pt 라벨)                          │
                // │    title   → y+0.39~0.73 (굵은 제목)                          │
                // │    detail  → y+0.78 이후 (나머지)                             │
                // │  세 영역이 모두 표시되려면 카드 높이 최소 ~1.2in 필요.          │
                // │                                                                │
                // │  헤더 있는 슬라이드 기준 행 높이 계산:                         │
                // │    rowHeight ≈ 0.180in,  rowGap = 0.08in                       │
                // │    rowSpan:4 → h = 4×0.180 + 3×0.08 = 0.96in  ← detail 잘림  │
                // │    rowSpan:5 → h = 5×0.180 + 4×0.08 = 1.22in  ← 여유 있음    │
                // │                                                                │
                // │  결론: addStepsRow(와 sectionCard)는 rowSpan 5 이상으로 써라.  │
                // │  헤더 없는 슬라이드는 rowHeight가 조금 커서 4로도 가능하다.    │
                // └────────────────────────────────────────────────────────────────┘
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 5 },
                    render: (slide, box) =>
                        addStepsRow(
                            slide,
                            [
                                { kicker: 'STEP 1', title: '발굴', detail: '니즈 파악 / 리드 생성' },
                                { kicker: 'STEP 2', title: '검토', detail: '타당성 분석' },
                                { kicker: 'STEP 3', title: '실행', detail: 'DD / 계약 / 서명' },
                                { kicker: 'STEP 4', title: '완료', detail: '인수인계 / 안정화' },
                            ],
                            box,
                            { titleSize: 14 },
                        ),
                },

                // renderDecisionCard — 의사결정 프레임 (Go/No-Go 유형)
                // accent: true → 파란 배경 강조
                // dim   : true → 회색 배경 (기각 옵션)
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 3, rowStart: 9, rowSpan: 8 },
                    render: (slide, box) =>
                        renderDecisionCard(slide, box, {
                            title: 'Go',
                            condition: '조건 A + 조건 B 충족',
                            action: '즉시 진행\n세부 실행 계획 수립',
                            accent: true, // 파란 배경
                        }),
                },
                {
                    type: 'custom',
                    grid: { colStart: 4, colSpan: 3, rowStart: 9, rowSpan: 8 },
                    render: (slide, box) =>
                        renderDecisionCard(slide, box, {
                            title: 'Conditional',
                            condition: '조건 A만 충족',
                            action: '조건부 진행\nEarn-out 조항 추가',
                            // accent/dim 없음 → 기본 스타일 (surfaceAlt 배경)
                        }),
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 3, rowStart: 9, rowSpan: 8 },
                    render: (slide, box) =>
                        renderDecisionCard(slide, box, {
                            title: 'Hold',
                            condition: '데이터 불충분',
                            action: '추가 자료 요청 후 재판단',
                        }),
                },
                {
                    type: 'custom',
                    grid: { colStart: 10, colSpan: 3, rowStart: 9, rowSpan: 8 },
                    render: (slide, box) =>
                        renderDecisionCard(slide, box, {
                            title: 'No-Go',
                            condition: '핵심 조건 미충족',
                            action: '협상 중단 / 대안 탐색',
                            dim: true, // 회색 배경 (기각)
                        }),
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: 'addStepsRow: lib/components.js에 신규 추가된 헬퍼. renderDecisionCard: 4분면 의사결정 레이아웃용.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'addStepsRow · renderDecisionCard — render() 안에서만'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 9 — 디자인 토큰 참조
        // ════════════════════════════════════════════════════════════
        //
        // 색상이나 폰트를 직접 문자열로 쓰지 말고 tokens.js에서 가져와라.
        // pptxgenjs 제약:
        //   ① hex 색상에 # 금지  →  'FFFFFF' O  /  '#FFFFFF' ✗
        //   ② shadow 객체 재사용 금지  →  매번 새 객체 생성
        //   ③ 8자리 hex (투명도 포함) 금지  →  6자리만 사용
        {
            sectionLabel: '08. 디자인 토큰',
            pageText: '09',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '디자인 토큰: COLORS · TYPE · 상수',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },

                {
                    type: 'table',
                    header: ['토큰', '값 (hex)', '용도'],
                    colWRatio: [2.5, 2, 7.5],
                    rows: [
                        ['COLORS.primary', '1E3A5F', '헤더·제목·중요 배경 — 네이비'],
                        ['COLORS.accent', '2563EB', '링크·강조·화살표 — 블루'],
                        ['COLORS.accentLight', 'EFF6FF', 'callout·metric 배경 — 연파랑'],
                        ['COLORS.text', '0F172A', '기본 본문 색'],
                        ['COLORS.textSecondary', '475569', 'caption·부연 설명'],
                        ['COLORS.textMuted', '94A3B8', '페이지번호 등 최소 강조'],
                        ['COLORS.surface', 'FFFFFF', '배경 (흰색)'],
                        ['COLORS.surfaceAlt', 'F8FAFC', '교차 배색 (홀수 행 배경)'],
                        ['COLORS.divider', 'E2E8F0', '구분선·테두리'],
                    ],
                    grid: { colStart: 1, colSpan: 7, rowStart: 4, rowSpan: 12 },
                },

                {
                    type: 'table',
                    header: ['TYPE 키', '폰트/크기', '용도'],
                    colWRatio: [2.5, 2.5, 5],
                    rows: [
                        ['slideTitle', 'NotoSansKR 30pt bold', 'type:text style:title'],
                        ['sectionHeading', 'NotoSansKR 20pt bold', '섹션 제목'],
                        ['accent', 'NotoSansKR 16pt bold', 'callout / headline'],
                        ['bodyLg', 'NotoSansKR 14pt', 'type:text style:body'],
                        ['bodyMd', 'NotoSansKR 12pt', ''],
                        ['emphasis', 'NanumMyeongjo 16pt bold', 'addKeyMessageBar'],
                        ['caption', 'NotoSansKR 12pt gray', 'type:text style:caption'],
                        ['bulletlist', 'NotoSansKR 12pt', 'type:bullets'],
                    ],
                    grid: { colStart: 8, colSpan: 5, rowStart: 4, rowSpan: 11 },
                },

                {
                    type: 'callout',
                    text: '⚠ pptxgenjs: hex에 # 붙이지 마라. shadow 객체 재사용 금지. 8자리 hex 사용 금지.',
                    accent: true,
                    grid: { colStart: 8, colSpan: 5, rowStart: 16, rowSpan: 2 },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: 'FONT_KR = "Noto Sans KR", FONT_EMPHASIS = "NanumMyeongjo". 시스템에 설치되어 있어야 렌더링된다.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '색상·폰트는 tokens.js에서 — 직접 문자열 금지'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // 슬라이드 10 — ❌ 하면 안 되는 것들
        // ════════════════════════════════════════════════════════════
        {
            sectionLabel: '09. 하면 안 되는 것들',
            pageText: '10',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '흔한 실수 모음: 이렇게 하면 안 된다',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '대부분은 실행은 되지만 PPT가 깨지거나 경고가 쌓인다. 미리 알아두자.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },

                {
                    type: 'table',
                    header: ['❌ 잘못된 사용', '✅ 올바른 사용', '이유'],
                    colWRatio: [4, 4, 4],
                    rows: [
                        ["color: '#1E3A5F'", "color: '1E3A5F'", 'pptxgenjs는 # 없는 hex만 허용. # 붙이면 파일 손상.'],
                        ['const shadow = {...}; ... shadow; ... shadow', '매번 새 객체: { blur:3, ... }', 'shadow 객체 참조 재사용 시 PPT 깨짐.'],
                        ["color: 'FFFFFF80'  // 8자리", "color: 'FFFFFF'    // 6자리", '8자리 hex(투명도 포함)는 pptxgenjs가 처리 못함.'],
                        ['pptx.defineLayout({ w:13.333, h:7.5 })', "pptx.layout = 'LAYOUT_WIDE'", '직접 정의 시 EMU 값 어긋남. 반드시 LAYOUT_WIDE 사용.'],
                        [
                            "addKeyMessageBar(slide, '이 텍스트가 52자를 넘기면 에러가 발생합니다 — 52자를 넘기면 throw')",
                            '52자 이하로 줄일 것',
                            'KEY_MESSAGE_MAX_CHARS=52. 초과 시 throw.',
                        ],
                        ['colStart: 1, colSpan: 13  // 12 초과', 'colStart: 1, colSpan: 12', 'grid 범위 초과 시 compileToPptx에서 throw.'],
                        ['render: (slide) => { ... } // compileToPptx 없이', 'compileToPptx(pptx, spec) 후 writeFile', 'spec만 선언하면 아무것도 안 그려진다.'],
                        [
                            'validateSpec 생략 후 바로 compile',
                            'validateSpec(spec) → 에러 확인 → compileToPptx',
                            'validateSpec은 빌드 전 grid 오류 조기 발견용.',
                        ],
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 13 },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: '참고: addKeyMessageBar 텍스트가 34자 이하면 barH=0.46, 35~52자면 barH=0.58로 자동 조정.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '경고 0건 · 에러 0건이 목표'),
                },
            ],
        },
    ], // slides 끝
}; // spec 끝

// ════════════════════════════════════════════════════════════════════
// 빌드 & 저장
// ════════════════════════════════════════════════════════════════════

// 1. 빌드 전 grid 오류 검사 (선택이지만 강력히 권장)
//    validateSpec은 compileToPptx보다 훨씬 빠르고 에러 메시지가 명확하다.
const { errors, warnings: specWarnings } = validateSpec(spec);
if (errors.length) {
    console.error('[validateSpec] 오류:', JSON.stringify(errors, null, 2));
    process.exit(1);
}
if (specWarnings.length) {
    console.warn('[validateSpec] 경고:', JSON.stringify(specWarnings, null, 2));
}

// 2. pptxgenjs 호출 및 렌더링
const { warnings } = compileToPptx(pptx, spec);
if (warnings.length) {
    console.warn('[compileToPptx] 경고:', JSON.stringify(warnings, null, 2));
}

// 3. 파일 저장
pptx.writeFile({ fileName: OUTPUT_PATH })
    .then(() => {
        console.log(`저장 완료: ${OUTPUT_PATH}`);
    })
    .catch((err) => {
        console.error('저장 실패:', err);
        process.exit(1);
    });
