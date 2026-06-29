// 재사용 컴포넌트 헬퍼 — scripts/lib/design.js에서 분리
const {
    cm,
    COLORS,
    TYPE,
    FONT_KR,
    FONT_EMPHASIS,
    PAGE,
    MARGIN_X,
    HEADER_Y,
    HEADER_DIVIDER_Y,
    CONTENT_TOP_Y,
    BAR_BOTTOM_MARGIN,
    KEY_MESSAGE_MAX_CHARS,
    MIN_TABLE_FONT_SIZE,
    MIN_TABLE_ROW_H,
    MIN_BODY_FONT_SIZE,
} = require('./tokens');

function newPresentation(pptxgenjs) {
    const pptx = new pptxgenjs();
    pptx.layout = 'LAYOUT_WIDE'; // 12192000 x 6858000 EMU — PowerPoint 표준값. 직접 정의하지 않는다.
    return pptx;
}

function addBackground(slide) {
    slide.background = { color: COLORS.surface };
}

// 표지(title slide) — 아이디어.md가 명시한 predefined template 중 하나. 여백을 무시하는
// full-bleed 레이아웃이라 grid 엔진 대상이 아니고, 슬라이드 전체에 고정 위치로 그린다.
function addTitleSlide(slide, { title, subtitle, tagline, footer }) {
    slide.addShape('rect', { x: 0, y: 0, w: PAGE.w, h: 0.12, fill: { color: COLORS.primary }, line: { type: 'none' } });
    slide.addText(title, {
        x: 0,
        y: 2.5,
        w: PAGE.w,
        h: 0.6,
        align: 'center',
        fontFace: FONT_EMPHASIS,
        fontSize: 22,
        bold: true,
        color: COLORS.accent,
    });
    slide.addText(subtitle, {
        x: 0,
        y: 3.1,
        w: PAGE.w,
        h: 0.9,
        align: 'center',
        fontFace: FONT_KR,
        fontSize: 40,
        bold: true,
        color: COLORS.primary,
    });
    slide.addText(tagline, {
        x: 0,
        y: 4.05,
        w: PAGE.w,
        h: 0.4,
        align: 'center',
        fontFace: FONT_KR,
        fontSize: 16,
        color: COLORS.textSecondary,
    });
    slide.addText(footer, {
        x: 0,
        y: 6.6,
        w: PAGE.w,
        h: 0.35,
        align: 'center',
        fontFace: FONT_KR,
        fontSize: 12,
        color: COLORS.textMuted,
    });
}

// 상단 고정 헤더 영역: 섹션 라벨(좌, navy pill) + 페이지 번호(우) + 구분선
function addHeader(slide, sectionLabel, pageText) {
    if (sectionLabel) {
        const labelWidth = 0.3 + sectionLabel.length * 0.135;
        slide.addShape('rect', {
            x: MARGIN_X,
            y: HEADER_Y,
            w: labelWidth,
            h: 0.26,
            fill: { color: COLORS.primary },
            line: { type: 'none' },
        });
        slide.addText(sectionLabel, {
            x: MARGIN_X,
            y: HEADER_Y,
            w: labelWidth,
            h: 0.26,
            align: 'center',
            valign: 'middle',
            wrap: false,
            ...TYPE.label,
        });
    }

    slide.addText(pageText, {
        x: PAGE.w - MARGIN_X - 1.2,
        y: HEADER_Y,
        w: 1.2,
        h: 0.26,
        align: 'right',
        valign: 'middle',
        ...TYPE.pageNumber,
    });

    slide.addShape('line', {
        x: MARGIN_X,
        y: HEADER_DIVIDER_Y,
        w: PAGE.w - MARGIN_X * 2,
        h: 0,
        line: { color: COLORS.divider, width: 1 },
    });
}

function addSlideTitle(slide, text, opts = {}) {
    slide.addText(text, {
        x: MARGIN_X,
        y: opts.y ?? CONTENT_TOP_Y,
        w: PAGE.w - MARGIN_X * 2,
        h: opts.h ?? 0.65,
        align: 'left',
        valign: 'top',
        ...TYPE.slideTitle,
        ...opts.override,
    });
}

// 슬라이드 하단 고정 네이비 바 — 슬라이드 전체 결론 한 문장
// 재발 방지: 이 바는 본문 대체용이 아니다. 긴 문장은 본문 카드로 올리고 여기에는 결론만 남긴다.
function addKeyMessageBar(slide, text) {
    if (text.length > KEY_MESSAGE_MAX_CHARS) {
        throw new Error(`Key message is too long (${text.length} chars). Keep it under ${KEY_MESSAGE_MAX_CHARS}: ${text}`);
    }
    const barH = text.length > 34 ? 0.58 : 0.46;
    const y = PAGE.h - BAR_BOTTOM_MARGIN - barH;
    slide.addShape('rect', {
        x: MARGIN_X,
        y,
        w: PAGE.w - MARGIN_X * 2,
        h: barH,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
    });
    slide.addText(text, {
        x: MARGIN_X + 0.25,
        y,
        w: PAGE.w - MARGIN_X * 2 - 0.5,
        h: barH,
        align: 'center',
        valign: 'middle',
        ...TYPE.emphasis,
    });
    return y; // 본문 콘텐츠가 이 y값 이전에서 끝나야 함
}

// 헤드라인(제목 바로 아래, 슬라이드 핵심 주장 한 줄) — navy 바가 아닌 강조 텍스트
function addHeadline(slide, text, y, h = 0.45) {
    slide.addText(text, {
        x: MARGIN_X,
        y,
        w: PAGE.w - MARGIN_X * 2,
        h,
        align: 'left',
        valign: 'top',
        bold: true,
        color: COLORS.accent,
        ...TYPE.accent,
    });
}

function addCaption(slide, text, y, h = 0.3) {
    slide.addText(text, {
        x: MARGIN_X,
        y,
        w: PAGE.w - MARGIN_X * 2,
        h,
        align: 'left',
        valign: 'top',
        ...TYPE.caption,
    });
}

function addBodyText(slide, text, opts) {
    const fontSize = Math.max(opts.fontSize ?? TYPE.bodyLg.fontSize, MIN_BODY_FONT_SIZE);
    slide.addText(text, {
        x: opts.x,
        y: opts.y,
        w: opts.w,
        h: opts.h,
        align: opts.align ?? 'left',
        valign: opts.valign ?? 'top',
        fontFace: FONT_KR,
        fontSize,
        color: opts.color ?? COLORS.text,
        bold: !!opts.bold,
        breakLine: false,
        lineSpacingMultiple: opts.lineSpacingMultiple ?? 1.5,
    });
}

// callout 박스 (연한 블루 배경)
function addCallout(slide, text, opts) {
    slide.addShape('roundRect', {
        x: opts.x,
        y: opts.y,
        w: opts.w,
        h: opts.h,
        fill: { color: opts.accent ? COLORS.accent : COLORS.accentLight },
        line: { type: 'none' },
        rectRadius: 0.06,
    });
    slide.addText(text, {
        x: opts.x + 0.15,
        y: opts.y,
        w: opts.w - 0.3,
        h: opts.h,
        align: opts.align ?? 'left',
        valign: 'middle',
        ...TYPE.accent,
        fontSize: opts.fontSize ?? TYPE.accent.fontSize,
        color: opts.accent ? COLORS.onAccent : TYPE.accent.color,
        bold: opts.bold ?? TYPE.accent.bold,
    });
}

function addSectionCard(slide, opts) {
    slide.addShape('roundRect', {
        x: opts.x,
        y: opts.y,
        w: opts.w,
        h: opts.h,
        fill: { color: COLORS.surfaceAlt },
        line: { color: COLORS.divider, width: 0.8 },
        rectRadius: 0.04,
    });
    slide.addText(opts.kicker, {
        x: opts.x + 0.18,
        y: opts.y + 0.12,
        w: opts.w - 0.36,
        h: 0.22,
        fontFace: FONT_KR,
        fontSize: MIN_BODY_FONT_SIZE,
        bold: true,
        color: COLORS.accent,
    });
    slide.addText(opts.title, {
        x: opts.x + 0.18,
        y: opts.y + 0.39,
        w: opts.w - 0.36,
        h: 0.34,
        fontFace: FONT_KR,
        fontSize: opts.titleSize ?? MIN_BODY_FONT_SIZE,
        bold: true,
        color: COLORS.text,
    });
    slide.addText(opts.detail, {
        x: opts.x + 0.18,
        y: opts.y + 0.78,
        w: opts.w - 0.36,
        h: Math.max(opts.h - 0.9, 0.2),
        fontFace: FONT_KR,
        fontSize: opts.detailSize ?? 12,
        color: COLORS.textSecondary,
    });
}

function addMetricCard(slide, opts) {
    slide.addShape('roundRect', {
        x: opts.x,
        y: opts.y,
        w: opts.w,
        h: opts.h,
        fill: { color: COLORS.accentLight },
        line: { type: 'none' },
        rectRadius: 0.05,
    });
    slide.addText(opts.value, {
        x: opts.x + 0.1,
        y: opts.y + 0.12,
        w: opts.w - 0.2,
        h: 0.44,
        align: 'center',
        fontFace: FONT_KR,
        fontSize: opts.valueSize ?? 21,
        bold: true,
        color: COLORS.accent,
    });
    slide.addText(opts.label, {
        x: opts.x + 0.12,
        y: opts.y + 0.61,
        w: opts.w - 0.24,
        h: 0.28,
        align: 'center',
        fontFace: FONT_KR,
        fontSize: 12,
        color: COLORS.text,
    });
    if (opts.tag) {
        slide.addText(opts.tag, {
            x: opts.x + 0.12,
            y: opts.y + 0.9,
            w: opts.w - 0.24,
            h: 0.22,
            align: 'center',
            fontFace: FONT_KR,
            fontSize: 9,
            color: COLORS.textSecondary,
        });
    }
}

function addBulletList(slide, points, opts) {
    const fontSize = opts.fontSize ?? TYPE.bulletlist.fontSize;
    const lineSpacingMultiple = opts.lineSpacingMultiple ?? TYPE.bulletlist.lineSpacingMultiple ?? 1.5;

    // 대략적인 줄 높이 계산
    const lineHeightPt = fontSize * lineSpacingMultiple;
    const lineHeightIn = lineHeightPt / 72;

    // bullet 항목 수만큼 높이 계산 + 약간의 패딩
    const estimatedH = opts.h ?? points.length * lineHeightIn + 0.1 + cm(0.5);

    slide.addText(
        points.map((p) => ({ text: p, options: { bullet: { code: '25CF' }, breakLine: true } })),
        {
            x: opts.x,
            y: opts.y,
            w: opts.w,
            h: estimatedH,
            valign: 'top',
            margin: 0,
            ...TYPE.bulletlist,
            fontSize,
            color: opts.color ?? TYPE.bulletlist.color,
            bold: opts.bold ?? TYPE.bulletlist.bold,
            lineSpacingMultiple,
        },
    );
}

// 표: header 첫 행 navy/white, 본문 행은 surface / surface-alt 교차 배색
function addTable(slide, header, rows, opts) {
    const colW = opts.colW;
    const fontSize = Math.max(opts.fontSize ?? MIN_TABLE_FONT_SIZE, MIN_TABLE_FONT_SIZE);
    const rowH = opts.rowH ?? MIN_TABLE_ROW_H;
    const headerFontSize = Math.max(opts.headerFontSize ?? MIN_TABLE_FONT_SIZE, MIN_TABLE_FONT_SIZE);
    const headerRow = header.map((h) => ({
        text: h,
        options: {
            fill: { color: COLORS.primary },
            color: COLORS.onPrimary,
            fontFace: FONT_KR,
            fontSize: headerFontSize,
            bold: true,
            align: 'center',
            valign: 'middle',
            margin: opts.margin ?? 0.07,
        },
    }));
    const bodyRows = rows.map((row, i) =>
        row.map((cell, ci) => ({
            text: cell,
            options: {
                fill: { color: i % 2 === 0 ? COLORS.surface : COLORS.surfaceAlt },
                color: COLORS.text,
                fontFace: FONT_KR,
                fontSize,
                bold: !!(opts.boldCols && opts.boldCols.includes(ci)),
                align: opts.align?.[ci] ?? 'left',
                valign: 'middle',
                margin: opts.margin ?? 0.07,
            },
        })),
    );

    slide.addTable([headerRow, ...bodyRows], {
        x: opts.x,
        y: opts.y,
        w: opts.w,
        colW,
        rowH,
        border: { type: 'solid', color: COLORS.divider, pt: 0.75 },
        autoPage: false,
    });
}

// 네이비 볼드 소제목 — 슬라이드 내 섹션 구분용
function addSubheading(slide, text, opts) {
    slide.addText(text, {
        x: opts.x,
        y: opts.y,
        w: opts.w,
        h: opts.h ?? 0.28,
        fontFace: FONT_KR,
        fontSize: opts.fontSize ?? 12.5,
        bold: true,
        color: COLORS.primary,
    });
}

// 작은 회색 주석 텍스트 — 표 아래 출처·조건 표기용
function addColumnNote(slide, text, opts) {
    slide.addText(text, {
        x: opts.x,
        y: opts.y,
        w: opts.w,
        h: opts.h ?? 0.3,
        fontFace: FONT_KR,
        fontSize: 9.5,
        color: COLORS.textSecondary,
        fit: 'shrink',
    });
}

// DD 체크리스트 항목: 소제목 + 2열 표. 다음 콘텐츠 시작 y 반환.
function addDDItem(slide, opts) {
    addSubheading(slide, opts.title, { x: opts.x, y: opts.y, w: opts.w, fontSize: 11.5 });
    addTable(slide, ['구분', '내용'], opts.rows, {
        x: opts.x,
        y: opts.y + 0.32,
        w: opts.w,
        colW: [opts.col1 ?? 1.6, opts.w - (opts.col1 ?? 1.6)],
        rowH: 0.42,
        fontSize: 9.8,
        boldCols: [0],
    });
    return opts.y + 0.32 + (opts.rows.length + 1) * 0.42 + 0.08;
}

// 가로 스텝 카드 — steps 배열을 균등 폭으로 나눠 sectionCard + ▶ 화살표를 그린다.
// steps: [{ kicker, title, detail }]
// opts.titleSize, opts.detailSize, opts.arrowColor 모두 선택적.
// ⚠ sectionCard는 kicker/title/detail 3단 구조라 최소 높이 ~1.2in 필요.
//   헤더 있는 슬라이드에서 rowSpan 4(≈0.96in)면 detail이 잘린다 → rowSpan 5(≈1.22in) 이상 사용.
function addStepsRow(slide, steps, box, opts = {}) {
    const gap = 0.14;
    const arrowGap = gap;
    const totalArrowW = arrowGap * (steps.length - 1);
    const cardW = (box.w - totalArrowW) / steps.length;
    const arrowColor = opts.arrowColor ?? COLORS.accent;

    steps.forEach(({ kicker, title, detail }, i) => {
        const x = box.x + i * (cardW + arrowGap);
        addSectionCard(slide, {
            x,
            y: box.y,
            w: cardW,
            h: box.h,
            kicker: kicker ?? `STEP ${i + 1}`,
            title,
            detail,
            titleSize: opts.titleSize ?? 13,
            detailSize: opts.detailSize ?? 10,
        });
        if (i < steps.length - 1) {
            slide.addText('▶', {
                x: x + cardW - 0.02,
                y: box.y + box.h / 2 - 0.175,
                w: arrowGap + 0.04,
                h: 0.35,
                align: 'center',
                fontFace: FONT_KR,
                fontSize: 13,
                bold: true,
                color: arrowColor,
            });
        }
    });
}

function renderDecisionCard(slide, box, { title, condition, action, accent, dim }) {
    slide.addShape('roundRect', {
        x: box.x,
        y: box.y,
        w: box.w,
        h: box.h,
        fill: { color: accent ? COLORS.accentLight : COLORS.surfaceAlt },
        line: { color: dim ? COLORS.border : COLORS.divider, width: 0.8 },
        rectRadius: 0.05,
    });
    slide.addShape('rect', {
        x: box.x,
        y: box.y,
        w: box.w,
        h: 0.44,
        fill: { color: dim ? COLORS.textSecondary : COLORS.primary },
        line: { type: 'none' },
    });
    slide.addText(title, {
        x: box.x + 0.14,
        y: box.y + 0.09,
        w: box.w - 0.28,
        h: 0.22,
        align: 'center',
        fontFace: FONT_KR,
        fontSize: 12,
        bold: true,
        color: COLORS.onPrimary,
        fit: 'shrink',
    });
    slide.addText(condition, {
        x: box.x + 0.18,
        y: box.y + 0.72,
        w: box.w - 0.36,
        h: 0.54,
        fontFace: FONT_KR,
        fontSize: 12,
        bold: true,
        color: COLORS.text,
    });
    slide.addText(action, {
        x: box.x + 0.18,
        y: box.y + 1.42,
        w: box.w - 0.36,
        h: box.h - 1.5,
        fontFace: FONT_KR,
        fontSize: 12,
        color: COLORS.textSecondary,
    });
}

module.exports = {
    newPresentation,
    addBackground,
    addTitleSlide,
    addHeader,
    addSlideTitle,
    addKeyMessageBar,
    addHeadline,
    addCaption,
    addBodyText,
    addCallout,
    addSectionCard,
    addMetricCard,
    addBulletList,
    addTable,
    addSubheading,
    addColumnNote,
    addDDItem,
    addStepsRow,
    renderDecisionCard,
};
