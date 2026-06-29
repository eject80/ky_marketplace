// Grid 좌표 -> inch 좌표 변환 엔진 (아이디어.md 7~13절 구현)
// 책임: grid->inch 변환, 텍스트 높이 추정, overflow/overlap/out-of-bounds 검증, components.js 헬퍼 호출.
// tokens.js/components.js는 무수정 원본 그대로 두고 이 파일이 그 위에서만 동작한다.

const {
    PAGE,
    TYPE,
    MIN_BODY_FONT_SIZE,
    CONTENT_TOP_Y,
} = require('./tokens');
const {
    addBackground,
    addTitleSlide,
    addHeader,
    addSlideTitle,
    addHeadline,
    addCaption,
    addBodyText,
    addCallout,
    addSectionCard,
    addMetricCard,
    addBulletList,
    addTable,
} = require('./components');

const EPS = 1e-6;

const DEFAULT_LAYOUT = {
    columns: 12,
    rows: 24,
    columnGap: 0.12,
    rowGap: 0.08,
    margin: { top: 0.5, right: 0.6, bottom: 0.5, left: 0.6 },
};

// title/body만 폰트 단계적 축소를 지원한다 — addSlideTitle/addBodyText만 fontSize override를 받을 수 있기 때문.
// addCaption은 fontSize를 받는 파라미터가 없고(opts 자체가 없음, y만 받음), addHeadline도 동일해서
// 이 둘은 폰트를 줄이는 대신 고정 높이(HEADLINE_FIXED_H/CAPTION_FIXED_H) vs box.h 검증만 한다.
const FONT_STEPS = {
    title: [TYPE.slideTitle.fontSize, TYPE.slideTitle.fontSize - 2, TYPE.slideTitle.fontSize - 4],
    body: [TYPE.bodyLg.fontSize, 13, MIN_BODY_FONT_SIZE],
};

// 1. grid -> inch 변환 (순수 함수). 잘못된 grid 범위는 여기서 즉시 에러 (root cause에 가까운 지점에서 막는다).
function gridToInch(layout, grid, pageW, pageH) {
    const { columns, rows, columnGap, rowGap, margin } = layout;
    const { colStart, colSpan, rowStart, rowSpan } = grid;

    if (colStart < 1 || colStart + colSpan - 1 > columns) {
        throw new Error(`grid column out of range: colStart=${colStart} colSpan=${colSpan} columns=${columns}`);
    }
    if (rowStart < 1 || rowStart + rowSpan - 1 > rows) {
        throw new Error(`grid row out of range: rowStart=${rowStart} rowSpan=${rowSpan} rows=${rows}`);
    }

    const contentWidth = pageW - margin.left - margin.right;
    const columnWidth = (contentWidth - columnGap * (columns - 1)) / columns;
    const x = margin.left + (colStart - 1) * (columnWidth + columnGap);
    const w = columnWidth * colSpan + columnGap * (colSpan - 1);

    const contentHeight = pageH - margin.top - margin.bottom;
    const rowHeight = (contentHeight - rowGap * (rows - 1)) / rows;
    const y = margin.top + (rowStart - 1) * (rowHeight + rowGap);
    const h = rowHeight * rowSpan + rowGap * (rowSpan - 1);

    return { x, y, w, h };
}

// 2. 텍스트 높이 추정 (근사 휴리스틱 — 정밀 줄바꿈 시뮬레이션은 하지 않음)
// 한글은 글자가 거의 정사각형이라 글자 너비 ≈ 글꼴 높이 * 0.9로 근사한다.
function estimateTextHeight({ text, fontSizePt, lineSpacingMultiple = 1.2, widthInch }) {
    const charWidthInch = (fontSizePt / 72) * 0.9;
    const charsPerLine = Math.max(1, Math.floor(widthInch / charWidthInch));
    const lineCount = Math.max(1, Math.ceil(text.length / charsPerLine));
    return (fontSizePt / 72) * lineSpacingMultiple * lineCount * 1.1; // 1.1 = 안전여백
}

// 3. overflow 해소: text 타입만 대상. title/body는 font-size 단계 축소 -> rowSpan 1회 확대 -> 경고.
// headline/caption은 폰트를 못 줄이므로 고정 높이 vs box.h만 검증한다.
function resolveOverflow(element, box, layout, pageW, pageH) {
    if (element.type !== 'text') {
        return { box, fontSizeOverride: undefined, warnings: [] };
    }

    const style = element.style ?? 'body';

    if (style === 'headline' || style === 'caption') {
        return { box, fontSizeOverride: undefined, warnings: [] };
    }

    const steps = FONT_STEPS[style] ?? FONT_STEPS.body;
    for (const fontSizePt of steps) {
        const requiredH = estimateTextHeight({ text: element.text, fontSizePt, widthInch: box.w });
        if (requiredH <= box.h) {
            return { box, fontSizeOverride: fontSizePt === steps[0] ? undefined : fontSizePt, warnings: [] };
        }
    }

    // 모든 폰트 단계 소진 -> rowSpan 1회 확대 시도
    const { rowStart, rowSpan } = element.grid;
    if (rowStart + rowSpan - 1 < layout.rows) {
        const expandedBox = gridToInch(layout, { ...element.grid, rowSpan: rowSpan + 1 }, pageW, pageH);
        const smallestStep = steps[steps.length - 1];
        const requiredH = estimateTextHeight({ text: element.text, fontSizePt: smallestStep, widthInch: expandedBox.w });
        if (requiredH <= expandedBox.h) {
            return { box: expandedBox, fontSizeOverride: smallestStep, warnings: [] };
        }
        return {
            box: expandedBox,
            fontSizeOverride: smallestStep,
            warnings: [{ type: 'overflow', style, text: element.text, detail: 'font steps + rowSpan+1 모두 부족' }],
        };
    }

    return {
        box,
        fontSizeOverride: steps[steps.length - 1],
        warnings: [{ type: 'overflow', style, text: element.text, detail: 'font steps 소진, rowSpan 확장 불가(rows 초과)' }],
    };
}

// 4. 레이아웃 전체 검증: out-of-bounds(error) + overlap(warning)
function validateLayout(layout, elementsWithBoxes, pageW, pageH) {
    const errors = [];
    const warnings = [];
    const { margin } = layout;

    for (const { element, box } of elementsWithBoxes) {
        if (
            box.x < margin.left - EPS ||
            box.y < margin.top - EPS ||
            box.x + box.w > pageW - margin.right + EPS ||
            box.y + box.h > pageH - margin.bottom + EPS
        ) {
            errors.push({ type: 'out-of-bounds', element, box });
        }
    }

    const rectsOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    for (let i = 0; i < elementsWithBoxes.length; i++) {
        for (let j = i + 1; j < elementsWithBoxes.length; j++) {
            if (rectsOverlap(elementsWithBoxes[i].box, elementsWithBoxes[j].box)) {
                warnings.push({ type: 'overlap', a: elementsWithBoxes[i].element, b: elementsWithBoxes[j].element });
            }
        }
    }

    return { errors, warnings };
}

// 5. style 문자열 -> helper 이름 매핑 (참고용 조회 테이블, compileToPptx 내부 switch와 1:1 대응)
const STYLE_MAP = {
    text: { title: 'addSlideTitle', headline: 'addHeadline', body: 'addBodyText', caption: 'addCaption' },
    bullets: 'addBulletList',
    table: 'addTable',
    metric: 'addMetricCard',
    sectionCard: 'addSectionCard',
    callout: 'addCallout',
};

function resolveStyle(elementType, styleName) {
    const entry = STYLE_MAP[elementType];
    if (!entry) return null;
    const helperName = typeof entry === 'string' ? entry : entry[styleName ?? 'body'];
    return helperName ? { helperName } : null;
}

function distributeColW(totalW, count, ratios) {
    if (!ratios) return Array.from({ length: count }, () => totalW / count);
    const sum = ratios.reduce((a, b) => a + b, 0);
    return ratios.map((r) => (totalW * r) / sum);
}

// 6. 최종 컴파일: logical spec -> pptxgenjs 호출
function compileToPptx(pptx, spec) {
    const layout = spec.layout ?? DEFAULT_LAYOUT;
    const allWarnings = [];

    for (const slideSpec of spec.slides) {
        const slide = pptx.addSlide();
        addBackground(slide);

        if (slideSpec.titleSlide) {
            addTitleSlide(slide, slideSpec.titleSlide);
            continue;
        }

        const hasHeader = !!(slideSpec.sectionLabel || slideSpec.pageText);
        if (hasHeader) {
            addHeader(slide, slideSpec.sectionLabel ?? null, slideSpec.pageText ?? '');
        }

        // addHeader는 y=0.3~0.62 구간에 고정으로 그려진다. 헤더가 있는 슬라이드는
        // grid 1행이 헤더와 겹치지 않도록 top margin을 CONTENT_TOP_Y로 올려서 계산한다 —
        // 스펙 작성자가 매번 rowStart를 수동으로 밀어줄 필요가 없게 한 곳에서 보정.
        const slideLayout = hasHeader
            ? { ...layout, margin: { ...layout.margin, top: CONTENT_TOP_Y } }
            : layout;

        const boxes = [];

        for (const el of slideSpec.elements) {
            if (el.type === 'custom') {
                const box = gridToInch(slideLayout, el.grid, PAGE.w, PAGE.h);
                el.render(slide, box);
                boxes.push({ element: el, box });
                continue;
            }

            const rawBox = gridToInch(slideLayout, el.grid, PAGE.w, PAGE.h);
            const { box, fontSizeOverride, warnings } = resolveOverflow(el, rawBox, slideLayout, PAGE.w, PAGE.h);
            allWarnings.push(...warnings);
            boxes.push({ element: el, box });

            switch (el.type) {
                case 'text': {
                    const style = el.style ?? 'body';
                    if (style === 'title') addSlideTitle(slide, el.text, { y: box.y, h: box.h });
                    else if (style === 'headline') addHeadline(slide, el.text, box.y, box.h);
                    else if (style === 'caption') addCaption(slide, el.text, box.y, box.h);
                    else addBodyText(slide, el.text, { ...box, fontSize: fontSizeOverride });
                    break;
                }
                case 'bullets':
                    addBulletList(slide, el.points, { ...box, fontSize: fontSizeOverride });
                    break;
                case 'table': {
                    const numRows = el.rows.length + 1; // +1 for header
                    const autoRowH = Math.max(box.h / numRows, 0.28);
                    addTable(slide, el.header, el.rows, {
                        ...box,
                        colW: distributeColW(box.w, el.header.length, el.colWRatio),
                        rowH: autoRowH,
                    });
                    break;
                }
                case 'metric':
                    addMetricCard(slide, { ...box, value: el.value, label: el.label, tag: el.tag });
                    break;
                case 'sectionCard':
                    addSectionCard(slide, {
                        ...box,
                        kicker: el.kicker,
                        title: el.title,
                        detail: el.detail,
                        titleSize: el.titleSize,
                        detailSize: el.detailSize,
                    });
                    break;
                case 'callout':
                    addCallout(slide, el.text, { ...box, accent: el.accent });
                    break;
                default:
                    throw new Error(`Unsupported element.type: ${el.type}`);
            }
        }

        const { errors, warnings } = validateLayout(slideLayout, boxes, PAGE.w, PAGE.h);
        allWarnings.push(...warnings);
        if (errors.length) throw new Error(`Layout errors on slide: ${JSON.stringify(errors)}`);
    }

    if (allWarnings.length) console.warn('[grid-engine] warnings:', allWarnings);
    return { warnings: allWarnings };
}

// spec 전체의 grid 겹침/범위 오류를 빌드 전에 검사한다. PptxGenJS 불필요.
function validateSpec(spec) {
    const layout = spec.layout ?? DEFAULT_LAYOUT;
    const allErrors = [];
    const allWarnings = [];

    spec.slides.forEach((slideSpec, i) => {
        if (slideSpec.titleSlide) return;

        const hasHeader = !!(slideSpec.sectionLabel || slideSpec.pageText);
        const slideLayout = hasHeader
            ? { ...layout, margin: { ...layout.margin, top: CONTENT_TOP_Y } }
            : layout;

        const boxes = [];
        for (const el of slideSpec.elements) {
            try {
                const box = gridToInch(slideLayout, el.grid, PAGE.w, PAGE.h);
                boxes.push({ element: el, box });
            } catch (e) {
                allErrors.push({ slide: i + 1, type: 'grid-range', element: el, message: e.message });
            }
        }

        const { errors, warnings } = validateLayout(slideLayout, boxes, PAGE.w, PAGE.h);
        errors.forEach((e) => allErrors.push({ slide: i + 1, ...e }));
        warnings.forEach((w) => allWarnings.push({ slide: i + 1, ...w }));
    });

    return { errors: allErrors, warnings: allWarnings };
}

module.exports = {
    DEFAULT_LAYOUT,
    gridToInch,
    estimateTextHeight,
    resolveOverflow,
    validateLayout,
    resolveStyle,
    validateSpec,
    compileToPptx,
};
