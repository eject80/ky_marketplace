---
name: ppt-create
description: "12×24 그리드 기반 PPTX 파일 생성. 사용자가 PPT/프레젠테이션/슬라이드 생성을 요청할 때 사용. pptxgenjs 설치 확인, lib 파일 복사, build JS 파일 생성·실행까지 처리."
allowed-tools:
- Read
- Write
- Edit
- Glob
- Bash
---

# PPT Create Skill

## 목적
사용자 요청을 받아 `./ppt/build_<name>.js` 파일을 생성하고 실행해 PPTX를 만든다.
12×24 그리드 엔진 기반의 선언적 spec을 작성한다.

## 트리거
- "PPT 만들어줘", "프레젠테이션 만들기", "슬라이드 생성"
- `/ppt-create`

---

## 실행 절차

### Step 1: pptxgenjs 확인 및 설치

먼저 `./ppt/` 디렉토리가 있는지 확인하고 없으면 생성한다.

```bash
# pptxgenjs 사용 가능 여부 확인 (프로젝트 루트 또는 ./ppt/ 기준)
node -e "require('pptxgenjs'); console.log('ok');" 2>/dev/null || \
  (cd ppt 2>/dev/null && node -e "require('pptxgenjs'); console.log('ok');" 2>/dev/null) || \
  echo "NOT_FOUND"
```

**NOT_FOUND면:**
1. `./ppt/` 디렉토리 생성 (없으면)
2. `./ppt/package.json` 작성:
   ```json
   { "dependencies": { "pptxgenjs": "^4.0.1" } }
   ```
3. `cd ppt && npm install` 실행

### Step 2: lib 파일 복사 (이미 있으면 skip)

`./ppt/lib/tokens.js` 가 없으면 PPT-creator 플러그인의 lib 디렉토리를 복사한다.

Glob으로 플러그인 위치 탐색: `**/PPT-creator/skills/ppt-creator/scripts/lib/tokens.js`

찾은 경로에서 `./ppt/lib/` 로 3개 파일 복사 (Read → Write):
- `tokens.js`
- `components.js`
- `grid-engine.js`

### Step 3: build 파일 생성

`./ppt/build_<name>.js` 파일을 아래 구조로 생성한다.
`<name>` 은 사용자 요청 주제를 snake_case로 짧게 (예: `quarterly_report`, `onboarding`).

**require 경로 주의**: `./ppt/` 안에서 실행되므로 `./lib/...` 상대 경로 사용.
pptxgenjs는 `./ppt/node_modules/` 에 있으면 그대로, 없으면 프로젝트 루트에서 찾음.

```javascript
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { COLORS, FONT_KR } = require('./lib/tokens');
const {
    newPresentation,
    addKeyMessageBar,
    addSectionCard,
    addBulletList,
    addTable,
    addCallout,
    addSubheading,
    addMetricCard,
    // 필요한 것만 import
} = require('./lib/components');
const { compileToPptx, validateSpec } = require('./lib/grid-engine');

// CLI: node build_name.js [outDir] [filename.pptx]
const [, scriptPath, argDir, argFile] = process.argv;
const outDir = argDir ?? path.dirname(scriptPath);
const outFile = argFile ?? path.basename(scriptPath, '.js') + '.pptx';
const OUTPUT_PATH = path.join(outDir, outFile);

const pptx = newPresentation(PptxGenJS);

const spec = {
    slides: [
        // --- 표지 (titleSlide) ---
        {
            titleSlide: {
                title: '...',
                subtitle: '...',
                tagline: '...',
                footer: '...',
            },
        },
        // --- 본문 슬라이드 ---
        {
            sectionLabel: '섹션명',
            pageText: '02',
            elements: [
                // 슬라이드 제목: row 1~2
                { type: 'text', style: 'title', text: '...', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                // 헤드라인: row 3~4
                { type: 'text', style: 'headline', text: '...', grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 } },
                // 본문 콘텐츠: row 5~19
                // ...
                // 캡션: row 20~21
                { type: 'text', style: 'caption', text: '출처: ...', grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 } },
                // 결론 바: row 22~23
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '핵심 메시지 (52자 이내)'),
                },
            ],
        },
    ],
};

const { errors, warnings: specWarnings } = validateSpec(spec);
if (errors.length) {
    console.error('[validateSpec] 오류:', JSON.stringify(errors, null, 2));
    process.exit(1);
}
if (specWarnings.length) {
    console.warn('[validateSpec] 경고:', JSON.stringify(specWarnings, null, 2));
}

const { warnings } = compileToPptx(pptx, spec);
if (warnings.length) {
    console.warn('[compileToPptx] 경고:', JSON.stringify(warnings, null, 2));
}

pptx.writeFile({ fileName: OUTPUT_PATH })
    .then(() => console.log(`저장 완료: ${OUTPUT_PATH}`))
    .catch((err) => { console.error('저장 실패:', err); process.exit(1); });
```

### Step 4: 실행

```bash
node ./ppt/build_<name>.js
```

성공하면 생성된 PPTX 절대 경로를 보고한다.

---

## 커스터마이징

`./ppt/lib/tokens.js` 가 디자인 전체를 제어한다. 이 파일 하나만 바꾸면 모든 슬라이드에 반영된다.

**색상 변경** — build 파일에서 require 직후 덮어쓴다 (COLORS는 객체라 참조가 공유됨):

```javascript
const { COLORS, FONT_KR } = require('./lib/tokens');
Object.assign(COLORS, {
    primary: '0F172A',  // 메인 컬러 (헤더, 제목)
    accent:  '38BDF8',  // 강조색 (링크, 화살표, 버튼)
});
```

**폰트 변경** — 문자열 primitive라 build 파일에서 덮어쓸 수 없다. `./ppt/lib/tokens.js`를 직접 편집:

```javascript
// tokens.js 안
const FONT_KR = 'NanumGothic';  // 원하는 폰트로 교체
```

> 시스템에 설치된 폰트만 사용 가능. 변경 시 이 프로젝트 모든 build 파일에 영구 적용됨.

사용자가 "다크 테마", "따뜻한 색으로", "폰트 바꿔줘" 등을 요청하면 위 방법으로 처리한다.

---

## 그리드 시스템 핵심 규칙

- 12열 × 24행 (1-indexed, colStart/rowStart 최솟값 = 1)
- `colStart + colSpan - 1 <= 12`, `rowStart + rowSpan - 1 <= 24` (초과 시 에러)
- 헤더(sectionLabel/pageText) 있는 슬라이드: row 1~2=제목, 3~4=헤드라인, 5~19=본문, 20~21=캡션, 22~23=결론 바
- `addKeyMessageBar` 텍스트: **52자 이내 필수** (초과 시 throw)
- pptxgenjs hex 색상에 `#` 금지: `'1E3A5F'` O / `'#1E3A5F'` ✗
- shadow 객체 재사용 금지 (매번 새 객체 생성)
- `metric`/`sectionCard` rowSpan: tag/detail 있으면 **5 이상** 사용

## element type 요약

| type | 주요 props |
|------|-----------|
| `text` | `style`: `title`/`headline`/`body`/`caption`, `text` |
| `bullets` | `points`: string[] |
| `table` | `header`: string[], `rows`: string[][], `colWRatio`?: number[] |
| `metric` | `value`, `label`, `tag`(선택) |
| `sectionCard` | `kicker`, `title`, `detail`, `titleSize`?, `detailSize`? |
| `callout` | `text`, `accent`?: boolean |
| `custom` | `render: (slide, box) => void` |

`custom` type의 `render(slide, box)`:
- `box = { x, y, w, h }` — grid 좌표를 inch로 변환한 결과
- `addKeyMessageBar`, `addSubheading`, `addBulletList`, `addTable`, `addCallout`, `addSectionCard` 등을 box 좌표 기준으로 직접 호출

## 레퍼런스 파일

사용법 상세: Glob `**/PPT-creator/skills/ppt-creator/scripts/grid-layout-manual.js`
실제 예제: Glob `**/PPT-creator/skills/ppt-creator/examples/build_slides_in_grid_layout_example.js`
