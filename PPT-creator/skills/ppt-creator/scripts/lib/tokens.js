// 단위 변환: cm → inch
const cm = (v) => v / 2.54;

// 디자인 토큰 (색상/타이포/페이지 상수) — scripts/lib/design.js에서 분리
// pptxgenjs 주의: hex 색상에 # 금지, shadow 객체 재사용 금지, 8자리 hex 금지

const COLORS = {
    primary: '1E3A5F',
    accent: '2563EB',
    accentLight: 'EFF6FF',
    accentMid: 'BFDBFE',
    onPrimary: 'FFFFFF',
    onAccent: 'FFFFFF',
    text: '0F172A',
    textSecondary: '475569',
    textMuted: '94A3B8',
    surface: 'FFFFFF',
    surfaceAlt: 'F8FAFC',
    border: 'CBD5E1',
    divider: 'E2E8F0',
};

const FONT_KR = 'Noto Sans KR';
const FONT_EMPHASIS = 'NanumMyeongjo';

const TYPE = {
    slideTitle: { fontFace: FONT_KR, fontSize: 30, bold: true, color: COLORS.primary },
    sectionHeading: { fontFace: FONT_KR, fontSize: 20, bold: true, color: COLORS.primary },
    accent: { fontFace: FONT_KR, fontSize: 16, bold: true, color: COLORS.text },
    subsectionHeading: { fontFace: FONT_KR, fontSize: 16, bold: true, color: COLORS.text },
    bodyLg: { fontFace: FONT_KR, fontSize: 14, color: COLORS.text },
    bodyMd: { fontFace: FONT_KR, fontSize: 12, color: COLORS.text },
    emphasis: { fontFace: FONT_EMPHASIS, fontSize: 16, bold: true, color: COLORS.onPrimary },
    caption: { fontFace: FONT_KR, fontSize: 12, color: COLORS.textSecondary },
    label: { fontFace: FONT_KR, fontSize: 10, bold: true, color: COLORS.onPrimary },
    pageNumber: { fontFace: FONT_KR, fontSize: 8, color: COLORS.textSecondary },
    bulletlist: { fontFace: FONT_KR, fontSize: 12, color: COLORS.text, lineSpacingMultiple: 1.6 },
};

// 슬라이드 크기: 13.333in x 7.5in (16:9, PowerPoint 표준 와이드스크린)
// 주의: defineLayout({width:13.333, height:7.5})으로 직접 정의하면 13.333in이 EMU로
// 변환될 때 12191695가 되어 PowerPoint 표준값(12192000)과 어긋나 파일이 손상된다.
// 반드시 내장 LAYOUT_WIDE(12192000 x 6858000 EMU)를 사용해야 한다.
const PAGE = { w: 13.333333, h: 7.5 };
const MARGIN_X = 0.5;
const HEADER_Y = 0.3;
const HEADER_DIVIDER_Y = 0.62;
const CONTENT_TOP_Y = 0.85;
const BAR_BOTTOM_MARGIN = 0.35;
const KEY_MESSAGE_MAX_CHARS = 52;
const MIN_TABLE_FONT_SIZE = 12;
const MIN_TABLE_ROW_H = 0.42;
const MIN_BODY_FONT_SIZE = 12;

module.exports = {
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
};
