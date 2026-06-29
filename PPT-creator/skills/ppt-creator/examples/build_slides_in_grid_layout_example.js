const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { COLORS, FONT_KR } = require('./lib/tokens');

// CLI: node build_slides_grid.js [출력폴더] [파일명.pptx]
// 인수 없으면 스크립트와 같은 디렉터리에 같은 이름(확장자만 .pptx)으로 저장
const [, scriptPath, argDir, argFile] = process.argv;
const outDir = argDir ?? path.dirname(scriptPath);
const outFile = argFile ?? path.basename(scriptPath, '.js') + '.pptx';
const OUTPUT_PATH = path.join(outDir, outFile);
const {
    newPresentation,
    addKeyMessageBar,
    renderDecisionCard,
    addSubheading,
    addColumnNote,
    addDDItem,
    addSectionCard,
    addCallout,
    addBulletList,
    addTable,
} = require('./lib/components');
const { compileToPptx, validateSpec } = require('./lib/grid-engine');

const pptx = newPresentation(PptxGenJS);

const spec = {
    slides: [
        // ────────────────────────────────────────────────────────────
        // 슬라이드 1 — 표지 (full-bleed, grid 엔진 대상 아님)
        // ────────────────────────────────────────────────────────────
        {
            titleSlide: {
                title: 'Project Monarch',
                subtitle: '마킹PT 인수 타당성 검토',
                tagline: '사업성 검토 / 경쟁사 비교 / 내부 BM(비즈니스 모델) 의견',
                footer: '2026년 6월   |   대외비 — 외부 유출 금지',
            },
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 2 — 목차
        // ────────────────────────────────────────────────────────────
        {
            pageText: '02',
            elements: [
                { type: 'text', style: 'title', text: '목차', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },

                { type: 'callout', text: 'Q1.  마킹PT는 매력적인 사업인가', grid: { colStart: 1, colSpan: 6, rowStart: 4, rowSpan: 2 } },
                { type: 'callout', text: 'Q2.  희망 매각가 40~50억원은 타당한가', grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 2 } },
                { type: 'callout', text: 'Q3.  인수 vs 직접 구축, 어느 쪽이 유리한가', grid: { colStart: 1, colSpan: 6, rowStart: 8, rowSpan: 2 } },

                {
                    type: 'sectionCard',
                    kicker: 'A  |  3-4',
                    title: 'Executive Summary',
                    detail: '결론 및 Go / No-Go 기준',
                    grid: { colStart: 1, colSpan: 3, rowStart: 10, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: 'B  |  5-7',
                    title: '사업 개요',
                    detail: '사업 모델, 퍼널, 채널',
                    grid: { colStart: 4, colSpan: 3, rowStart: 10, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: 'C  |  8-11',
                    title: '재무 분석',
                    detail: '실적, EBITDA, Valuation',
                    grid: { colStart: 7, colSpan: 3, rowStart: 10, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: 'D  |  12-14',
                    title: '사업 매력',
                    detail: '왜 괜찮아 보이는가',
                    grid: { colStart: 10, colSpan: 3, rowStart: 10, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: 'E  |  15-17',
                    title: '경쟁 구도',
                    detail: '경쟁사는 어디에 있는가',
                    grid: { colStart: 1, colSpan: 3, rowStart: 15, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: 'F  |  18-20',
                    title: '인수 리스크',
                    detail: '반드시 확인해야 할 것',
                    grid: { colStart: 4, colSpan: 3, rowStart: 15, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: 'G  |  21-24',
                    title: '내부 BM 가능성',
                    detail: '직접 구축 가능성',
                    grid: { colStart: 7, colSpan: 3, rowStart: 15, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: 'H  |  25-28',
                    title: '운영 및 협상',
                    detail: '가격, 조건, 실행 방향',
                    grid: { colStart: 10, colSpan: 3, rowStart: 15, rowSpan: 5 },
                },

                {
                    type: 'sectionCard',
                    kicker: 'Appendix A',
                    title: 'DD 체크리스트',
                    detail: '12개 핵심 확인 항목',
                    grid: { colStart: 1, colSpan: 6, rowStart: 20, rowSpan: 5 },
                },
                {
                    type: 'sectionCard',
                    kicker: 'Appendix B',
                    title: '운영 인사이트',
                    detail: '마킹PT에서 배울 것들',
                    grid: { colStart: 7, colSpan: 6, rowStart: 20, rowSpan: 5 },
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 3 — Executive Summary
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'A. Executive Summary',
            pageText: '03',
            elements: [
                { type: 'text', style: 'title', text: '마킹PT 인수 타당성 — 핵심 결론', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },

                { type: 'metric', value: '13.0억원', label: '2025 매출', tag: '재무제표 확인', grid: { colStart: 1, colSpan: 3, rowStart: 4, rowSpan: 3 } },
                { type: 'metric', value: '29.8%', label: '2025 영업이익률', tag: '재무제표 확인', grid: { colStart: 4, colSpan: 3, rowStart: 4, rowSpan: 3 } },
                { type: 'metric', value: '40~50억원', label: '회사 희망 매각가', tag: '회사 주장', grid: { colStart: 7, colSpan: 3, rowStart: 4, rowSpan: 3 } },
                {
                    type: 'metric',
                    value: '27~30억원',
                    label: '협상 출발 권고',
                    tag: '내부 검토 의견',
                    grid: { colStart: 10, colSpan: 3, rowStart: 4, rowSpan: 3 },
                },

                {
                    type: 'table',
                    header: ['구분', '핵심 판단', '확인 필요'],
                    colWRatio: [2, 7, 3],
                    rows: [
                        [
                            '사업 평가',
                            '고졸 공기업 취업 특화, 합격 후기 기반 신뢰 마케팅, 2025년 매출 13억원·영업이익률 29.8%',
                            '대표자 없이도 합격 후기 루프 유지 가능 여부',
                        ],
                        [
                            '가격 의견',
                            '회사 희망가 40~50억원은 미검증 프리미엄 포함. 중립 기준 적정 EV(기업가치) 27~32억원',
                            '인수자 귀속 수익력, 현금 포함 여부, 적용 배수',
                        ],
                        ['권고 행동', 'Top 5 DD 자료 확인 후 가격 범위 재판단. 검증 양호 시 32~35억원까지 검토', '대표 부재 KPI, 전환율, 잔존율, 합격자 원장'],
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 8, rowSpan: 8 },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: '수치 출처: 재무제표·Q&A·온라인 채널 실사 혼합. 세부 검증 상태는 본문 슬라이드별 표시.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 16, rowSpan: 2 },
                },

                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '40~50억원은 DD 전 수용 곤란'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 4 — Go / No-Go 판단 기준
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'A. Executive Summary',
            pageText: '04',
            elements: [
                { type: 'text', style: 'title', text: '인수 결정을 위한 Go / No-Go 기준', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 3 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '판단 기준: "좋은 사업인가"가 아니라 "30억원 이상을 지급해도 되는 법인 자산인가"',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 3 },
                },

                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 3, rowStart: 7, rowSpan: 8 },
                    render: (slide, box) =>
                        renderDecisionCard(slide, box, {
                            title: 'Go',
                            condition: '27~32억원 + Top 5 DD 통과',
                            action: '인수 우선 검토\n인수인계·경업금지·핵심 인력 승계 필수',
                            accent: true,
                        }),
                },
                {
                    type: 'custom',
                    grid: { colStart: 4, colSpan: 3, rowStart: 7, rowSpan: 8 },
                    render: (slide, box) =>
                        renderDecisionCard(slide, box, {
                            title: 'Conditional Go',
                            condition: '32~35억원 + 일부 수치 미검증',
                            action: '가격 조정 조항 또는 Earn-out 재제안',
                        }),
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 3, rowStart: 7, rowSpan: 8 },
                    render: (slide, box) =>
                        renderDecisionCard(slide, box, {
                            title: 'Hold / Build',
                            condition: '35~40억원 또는 핵심 KPI 미확인',
                            action: '직접 구축·전략적 제휴 병행 검토',
                        }),
                },
                {
                    type: 'custom',
                    grid: { colStart: 10, colSpan: 3, rowStart: 7, rowSpan: 8 },
                    render: (slide, box) =>
                        renderDecisionCard(slide, box, {
                            title: 'No-Go',
                            condition: '대표 의존도 높음 또는 40억원 이상 고수',
                            action: '인수 중단, 내부 구축 또는 다른 매물 탐색',
                            dim: true,
                        }),
                },

                {
                    type: 'bullets',
                    points: [
                        '가격보다 DD 통과 여부 우선',
                        '27억원이라도 대표 부재 KPI 악화 시 인수 타당성 약화',
                        '32~35억원은 전환율·잔존율·대표 독립성 일부 확인 시 검토 가능',
                        '회사 측 Earn-out 거부 시 가격 조정 근거로 활용',
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 16, rowSpan: 5 },
                },

                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '프리미엄은 법인 자산성 확인 후 지급'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 5 — 사업 한 줄 정의
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'B. 마킹PT란 무엇인가',
            pageText: '05',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '마킹PT: 고졸 공기업 취업 특화 원격 교육 사업',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },

                {
                    type: 'table',
                    header: ['항목', '내용', '검증 상태'],
                    colWRatio: [1.3, 4.0, 1.4],
                    rows: [
                        ['법인명', '주식회사 마킹 (MA-King Corp.)', '회사 주장'],
                        ['설립', '2023년 8월 22일', '재무제표 확인'],
                        ['대표자', '황재하, 심민서 (2인 체제)', '회사 주장'],
                        ['사업 형태', '온라인 VOD(주문형 비디오) + 실물 교재 월정기 배송', '회사 주장'],
                        ['오피스', '서울 가산동 70평', '회사 주장'],
                        ['운영 방식', 'LMS(학습 관리 시스템)·클라우드 기반 원격 운영', '회사 주장 / DD 필요'],
                    ],
                    grid: { colStart: 1, colSpan: 7, rowStart: 4, rowSpan: 9 },
                },

                {
                    type: 'sectionCard',
                    kicker: '핵심 상품',
                    title: '공기업반',
                    detail: 'NCS 29만원/월, 정규 37만원/월 | 반복 매출 중심',
                    grid: { colStart: 8, colSpan: 5, rowStart: 4, rowSpan: 4 },
                },
                {
                    type: 'sectionCard',
                    kicker: '프로젝트형',
                    title: '대기업·면접반',
                    detail: '시즌별 고단가',
                    titleSize: 12,
                    grid: { colStart: 8, colSpan: 2, rowStart: 8, rowSpan: 4 },
                },
                {
                    type: 'sectionCard',
                    kicker: '입시 시즌',
                    title: '마이스터고 입학반',
                    detail: '비수기 방어',
                    titleSize: 12,
                    grid: { colStart: 10, colSpan: 3, rowStart: 8, rowSpan: 4 },
                },

                {
                    type: 'custom',
                    grid: { colStart: 8, colSpan: 5, rowStart: 12, rowSpan: 1 },
                    render: (slide, box) => slide.addText('운영 구조 요약', { ...box, fontFace: FONT_KR, fontSize: 12, bold: true, color: COLORS.primary }),
                },
                {
                    type: 'bullets',
                    points: [
                        '콘텐츠: 전자칠판 스튜디오 촬영 VOD',
                        '교재: 매달 20일 중철 제본 모의고사·교재 배송',
                        '관리: LMS 자동화 + 프리랜서 코치 병행',
                        '조직: 정규직 7명 + 프리랜서·계약직 18명 (회사 주장)',
                    ],
                    grid: { colStart: 8, colSpan: 5, rowStart: 13, rowSpan: 4 },
                },

                {
                    type: 'text',
                    style: 'caption',
                    text: '원격 운영 가능성, LMS 소유권, 외주 계약 조건은 DD 확인 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 18, rowSpan: 2 },
                },

                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '고졸 공기업 취업 전문 원격 학원'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 6 — 고객 흐름 (퍼널)
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'B. 마킹PT란 무엇인가',
            pageText: '06',
            elements: [
                { type: 'text', style: 'title', text: '수강생 유입·전환·유지 구조', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '회사 측 핵심 주장: CAC 18만원으로 LTV 176만원 확보. 단, 산식과 채널별 전환 데이터 확인 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 4 },
                    render: (slide, box) => {
                        const stages = [
                            ['유입', '추천 / 학교·교사 / 블로그·검색 / 인스타·광고'],
                            ['관심', '무료자료 다운로드 → 회원가입 → CRM 메시지'],
                            ['전환', '상담 신청 → 반 선택 → 유료 결제'],
                            ['유지·확장', '교재 월정기 배송 → 카페 학습 인증 → 재등록·추가 구매'],
                        ];
                        const gap = 0.14;
                        const cW = (box.w - gap * 3) / 4;
                        stages.forEach(([title, detail], i) => {
                            const x = box.x + i * (cW + gap);
                            addSectionCard(slide, { x, y: box.y, w: cW, h: box.h, kicker: `STEP ${i + 1}`, title, detail, titleSize: 13, detailSize: 10 });
                            if (i < 3)
                                slide.addText('▶', {
                                    x: x + cW - 0.02,
                                    y: box.y + box.h / 2 - 0.175,
                                    w: gap + 0.04,
                                    h: 0.35,
                                    align: 'center',
                                    fontFace: FONT_KR,
                                    fontSize: 13,
                                    bold: true,
                                    color: COLORS.accent,
                                });
                        });
                    },
                },
                {
                    type: 'table',
                    header: ['지표', '수치', '검증 상태'],
                    rows: [
                        ['월평균 수강생', '361명 (2025.05~2026.03, 11개월 기준)', '회사 주장 / DD 필요'],
                        ['2026년 3월 수강생', '423명', '회사 주장'],
                        ['평균 수강 기간', '5.3개월', '회사 주장'],
                        ['LTV / CAC / 배율', '176만원 / 18만원 / 9.8배', '회사 주장 / DD 필요'],
                    ],
                    colWRatio: [1.9, 3.6, 1.6],
                    grid: { colStart: 1, colSpan: 8, rowStart: 11, rowSpan: 8 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 9, colSpan: 4, rowStart: 11, rowSpan: 8 },
                    render: (slide, box) => {
                        addSubheading(slide, 'DD 확인 포인트', { x: box.x, y: box.y, w: box.w });
                        addBulletList(
                            slide,
                            [
                                'LTV 산식: 객단가·할인·환불·상품 믹스 반영 여부',
                                'CAC 산식: 광고비 외 인건비 포함 여부',
                                '채널별 리드→상담→결제 전환율',
                                '코호트 기준 2·3·6개월 잔존율',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: box.h - 0.35, fontSize: 11.5 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: 'LTV/CAC 및 평균 수강 기간은 회사 제시 수치. 원자료 확인 전까지 투자 판단 근거로 단독 사용 곤란.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'LTV/CAC 9.8배는 회사 주장, 산식 검증 필요'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 7 — 상품·채널 에코시스템
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'B. 마킹PT란 무엇인가',
            pageText: '07',
            elements: [
                { type: 'text', style: 'title', text: '온라인 채널 자산과 전환 데이터 확인 과제', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '채널 존재감은 확인. 매출 기여도는 미확인. 인수 프리미엄의 핵심은 팔로워 수가 아니라 결제 전환율.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 4 },
                    render: (slide, box) => {
                        const stages = [
                            ['블로그', '채용공고·합격 수기\nSEO 유입'],
                            ['홈페이지', '무료자료→회원가입\n→상담→결제'],
                            ['인스타그램', '합격 후기·\n브랜드 신뢰 형성'],
                            ['네이버 카페', '출석체크·학습인증·\n커뮤니티 Lock-in'],
                            ['LMS+교재배송', '학습 관리·\n월정기 브랜드 접점'],
                        ];
                        const gap = 0.1;
                        const cW = (box.w - gap * 4) / 5;
                        stages.forEach(([title, detail], i) => {
                            addSectionCard(slide, {
                                x: box.x + i * (cW + gap),
                                y: box.y,
                                w: cW,
                                h: box.h,
                                kicker: `${i + 1}`,
                                title,
                                detail,
                                titleSize: 12,
                                detailSize: 9.5,
                            });
                        });
                    },
                },
                {
                    type: 'table',
                    header: ['채널', '확인된 자산', '추가 확인'],
                    rows: [
                        ['홈페이지', '고졸 전문 포지셔닝, 무료자료→상담 퍼널', '상담 신청률, 결제 전환율'],
                        ['인스타그램', '팔로워 5,820명, 합격자 후기 콘텐츠', '도달률, DM 전환, 링크 클릭 기여'],
                        ['블로그', '누적 방문 103,687명, 게시글 218개', '검색 유입의 결제 전환율'],
                        ['네이버 카페', '회원 2,987명, 전체글 3,842개', '유료 수강생 비중, 활성도·잔존율 기여'],
                        ['LMS', '법인 소유 주장, 외주 개발사 유지보수', '소스코드 귀속, 외주 계약서'],
                    ],
                    colWRatio: [1.7, 5.43, 4.7],
                    grid: { colStart: 1, colSpan: 12, rowStart: 11, rowSpan: 8 },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '채널 지표는 2026-06-16 온라인 실사 관찰치. 결제 전환율 및 IP 귀속은 DD 필요. (마케팅 표기 / DD 필요)',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '채널 존재는 확인, 매출 기여는 미확인'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 8 — 3개년 성장 그래프
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'C. 재무 분석',
            pageText: '08',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '3개년 실적: 2025년 매출 13억원, 영업이익률 29.8%',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '2024년 투자 이후 2025년 매출 성장과 이익률 회복 동시 확인. 단, 2023년은 부분기 기준.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['구분', '1기 (2023.08~12)', '2기 (2024년)', '3기 (2025년)', '성장률 (24→25)'],
                    rows: [
                        ['매출액', '0.35억원', '5.26억원', '12.96억원', '+146%'],
                        ['판관비', '0.25억원', '4.88억원', '9.10억원', '+87%'],
                        ['영업이익', '0.10억원', '0.38억원', '3.86억원', '+908%'],
                        ['당기순이익', '0.09억원', '0.35억원', '3.47억원', '+878%'],
                        ['영업이익률', '28.8%', '7.3%', '29.8%', '—'],
                    ],
                    colWRatio: [2.4, 2.43, 2.43, 2.43, 2.63],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 7 },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '재무제표 확인 — 2024·2025년 결산 재무제표 기준',
                    grid: { colStart: 1, colSpan: 12, rowStart: 14, rowSpan: 1 },
                },
                {
                    type: 'table',
                    header: ['연도', '해석', '주의'],
                    rows: [
                        ['2023', '창업 직후 초기 매출·이익 발생', '4.3개월 부분기'],
                        ['2024', '매출 성장, 이익률 7.3%로 하락', '사무실 확장·인력 채용 투자 영향'],
                        ['2025', '매출 +146%, 영업이익률 29.8% 회복', '성장 지속성은 2026년 데이터 확인 필요'],
                    ],
                    colWRatio: [1.0, 3.6, 3.4],
                    grid: { colStart: 1, colSpan: 8, rowStart: 16, rowSpan: 5 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 9, colSpan: 4, rowStart: 16, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '비용 구조 참고', { x: box.x, y: box.y, w: box.w, fontSize: 12.5 });
                        addBulletList(
                            slide,
                            [
                                '운반비 +1,208%, 도서인쇄비 +309%',
                                '매출원가 0원이나 교재 제작·배송비는 실질 변동비',
                                '매출 성장 시 변동비·인력비 동반 증가 가능',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: box.h - 0.35, fontSize: 10.5 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '2025년 수강료 인상 후 수강생 증가 여부는 회사 주장. 상품별 순매출·수강생 원장 확인 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '2025년 매출 +146%, 영업이익률 29.8% 회복'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 9 — 조정 EBITDA 폭포수
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'C. 재무 분석',
            pageText: '09',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '조정 EBITDA: 회사 제시 6.43억 vs 인수자 귀속 수익력',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '회사 제시 6.43억원은 SDE(오너 재량 이익) 성격. 가격 산정에는 인수자 귀속 수익력 재산정 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['항목', '금액', '인수 후 해석'],
                    rows: [
                        ['재무제표 영업이익 (2025년)', '+3.86억원', '재무제표 확인'],
                        ['+ 대표자 2인 급여 add-back', '+1.80억원', '대체 운영 인력 필요'],
                        ['+ 차량 리스료 2대 add-back', '+0.21억원', '일부 비용 발생 가능'],
                        ['+ 경영진 주거비 2채 add-back', '+0.26억원', '법인 비용화 가능성 낮음'],
                        ['+ 대표자 2인 식비 add-back', '+0.36억원', '복리후생 일부 유지 가능'],
                        ['- 팀장급 대체 인건비 차감', '-0.50억원', '회사 측 선반영'],
                        ['= 회사 제시 조정 EBITDA', '6.43억원', 'SDE 성격'],
                    ],
                    colWRatio: [3.5, 1.6, 2.1],
                    grid: { colStart: 1, colSpan: 7, rowStart: 6, rowSpan: 10 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 8, colSpan: 5, rowStart: 6, rowSpan: 13 },
                    render: (slide, box) => {
                        addSubheading(slide, '인수자 관점 재산정', { x: box.x, y: box.y, w: box.w, fontSize: 12.5 });
                        addTable(
                            slide,
                            ['시나리오', '가정', '귀속 수익력'],
                            [
                                ['낙관', '대체 인건비 0.50억 인정', '6.43억원'],
                                ['중립(권고)', '대표 역할 대체비용 반영', '4.9~5.4억원'],
                                ['보수', '대표 이탈 매출 감소 가능성', '4.2~4.8억원'],
                            ],
                            { x: box.x, y: box.y + 0.32, w: box.w, colW: [1.3, 2.28, 1.4], rowH: 0.4, fontSize: 9.8, boldCols: [0] },
                        );
                        addCallout(slide, '수익력 1억원 차이 × 5~6배 = 협상가 5~6억원 차이', {
                            x: box.x,
                            y: box.y + 2.02,
                            w: box.w,
                            h: 0.45,
                            fontSize: 11.5,
                            bold: true,
                        });
                        addSubheading(slide, '핵심 쟁점', { x: box.x, y: box.y + 2.57, w: box.w, fontSize: 12.5 });
                        addBulletList(
                            slide,
                            ['대표자 급여 add-back 전액 인정 불가', '대표 2인 실제 수행 역할 확인 필요', '대체 인건비 범위는 내부 검토 가정'],
                            { x: box.x, y: box.y + 2.87, w: box.w, h: 0.95, fontSize: 10.5 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '회사 제시 조정 EBITDA는 Pre-DD Q&A 기준. 재무제표·관리회계 영업이익 차이 원인 확인 필요. (회사 주장 / DD 필요)',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '조정 EBITDA 6.43억은 SDE, 재산정 필요'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 10 — Valuation 시나리오
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'C. 재무 분석',
            pageText: '10',
            elements: [
                { type: 'text', style: 'title', text: '적정 EV 시나리오: 중립 기준 27~32억원', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '중립 기준 협상 출발점 27~32억원. 40~50억원은 전환율·잔존율·대표 독립성 검증 이후에만 논의 가능.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['시나리오', '주요 가정', '조정 수익력', '적용 배수', '적정 EV'],
                    rows: [
                        ['보수', '대표 의존 리스크 큼, 데이터 미검증', '4.2~4.8억원', '4.5~5.5배', '20~25억원'],
                        ['중립(권고)', '핵심 리스크 잔존, 데이터 일부 확인', '4.9~5.4억원', '5~6배', '27~32억원'],
                        ['낙관', '전환율·잔존율·대표 독립성 모두 검증', '5.4~6.0억원', '6~7배', '35~40억원'],
                        ['회사 희망가', '회사 제시 SDE 6.43억원 기준', '6.43억원', '6.2~7.8배', '40~50억원'],
                    ],
                    colWRatio: [1.9, 4.0, 2.0, 1.8, 2.633],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 6 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 13, rowSpan: 7 },
                    render: (slide, box) => {
                        addSubheading(slide, '배수 적용 기준', { x: box.x, y: box.y, w: box.w, fontSize: 12.5 });
                        addBulletList(slide, ['5~6배: 내부 검토 기준 기본 범위', '6배 이상: 데이터 검증 후 제한적으로 인정', '독점 프리미엄: 현 단계 불인정'], {
                            x: box.x,
                            y: box.y + 0.35,
                            w: box.w,
                            h: 0.85,
                            fontSize: 11,
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 13, rowSpan: 7 },
                    render: (slide, box) => {
                        addSubheading(slide, '희망가 40~50억원 수용 조건', { x: box.x, y: box.y, w: box.w, fontSize: 12.5 });
                        addBulletList(
                            slide,
                            ['대표자 부재 기간 신규 결제 전환율 유지', '채널별 리드→상담→결제 전환율 제공', '합격자 원장·코호트 잔존율 확인'],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.85, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '배수 범위는 공개 거래 사례가 아닌 내부 검토 의견. 최종 가격 판단 전 외부 벤치마크 확인 필요. (내부 검토 의견 / DD 필요)',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '협상 출발점 27~32억원, 50억은 검증 후 논의'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 11 — 재무상태표 스냅샷
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'C. 재무 분석',
            pageText: '11',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '재무상태표: 현금 3.1억원, 사실상 무차입 구조',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '재무 건전성은 긍정적. 단, 현금 포함 여부가 실질 EV를 최대 3억원가량 변경.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['항목', '2024.12.31', '2025.12.31', '해석'],
                    rows: [
                        ['현금·예금', '0.17억원', '3.12억원', '매출 성장의 현금 축적'],
                        ['매출채권', '0.01억원', '0.01억원', '사실상 없음'],
                        ['임차보증금', '0.45억원', '0.60억원', '가산동 오피스 보증금'],
                        ['자산총계', '0.71억원', '4.04억원', ''],
                        ['유동부채', '0.26억원', '0.91억원', '미지급세금 증가'],
                        ['외부 차입금', '0', '0.02억원', '사실상 무차입'],
                        ['자본총계', '0.46억원', '3.13억원', '이익잉여금 축적'],
                    ],
                    colWRatio: [1.8, 1.7, 1.7, 2.2],
                    grid: { colStart: 1, colSpan: 7, rowStart: 6, rowSpan: 12 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 8, colSpan: 5, rowStart: 6, rowSpan: 13 },
                    render: (slide, box) => {
                        addSubheading(slide, '거래 구조별 EV 해석', { x: box.x, y: box.y, w: box.w, fontSize: 12.5 });
                        addTable(
                            slide,
                            ['거래 구조', '해석'],
                            [
                                ['현금 포함 거래', '보유 현금도 함께 인수, 협상가=EV 성격'],
                                ['Cash-free 기준', '실질 EV = 협상가 - 순현금'],
                                ['현금 처리 미확정', '가격 비교 왜곡 가능, 계약 전 필수 확인'],
                            ],
                            { x: box.x, y: box.y + 0.32, w: box.w, colW: [1.5, 3.28], rowH: 0.42, fontSize: 10, boldCols: [0] },
                        );
                        addSubheading(slide, 'DD 확인 포인트', { x: box.x, y: box.y + 2.1, w: box.w, fontSize: 12.5 });
                        addBulletList(
                            slide,
                            [
                                '2025년 말 현금 3.12억원의 현재 잔액',
                                '매각가에 현금 포함 여부',
                                '미지급세금 납부 여부',
                                '2025년 배당 1.2억원 반영 후 거래 시점 현금',
                            ],
                            { x: box.x, y: box.y + 2.45, w: box.w, h: 0.85, fontSize: 10.5 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: 'Cash-free/debt-free 기준 미확정. 구주 100% 매각 구조에서 현금 귀속 조건 확인 필요. (재무제표 확인 / DD 필요)',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '현금 3.1억 귀속 여부, 실질 EV 최대 3억 변동'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 12 — 사업 매력 포인트 3가지
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'D. 사업 매력 포인트',
            pageText: '12',
            elements: [
                { type: 'text', style: 'title', text: '마킹PT가 매력적으로 보이는 이유', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '합격 후기, 반복 결제, 낮은 고객 획득 비용이 결합된 틈새 교육 BM. 단, 세 가지 모두 원자료 검증 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 8 },
                    render: (slide, box) => {
                        const points = [
                            ['① 합격 후기 루프', '합격자 배출 → 후기 콘텐츠화 → 신뢰 → 결제 → 합격자 배출', '합격자 원장, 중복 제거 기준, 후기 동의·증빙'],
                            ['② 반복 결제 구조', '공기업반 매출 70%+, 평균 수강 5.3개월, 월정기 결제', '상품별 매출, 환불, 코호트 잔존율'],
                            ['③ 낮은 CAC', '2025년까지 낮은 광고비로 매출 성장 주장', '채널별 CAC, 상담·결제 전환율, 광고비 외 인건비'],
                        ];
                        const gap = 0.16;
                        const cW = (box.w - gap * 2) / 3;
                        const cardH = box.h * 0.65;
                        points.forEach(([title, detail, check], i) => {
                            const x = box.x + i * (cW + gap);
                            addSectionCard(slide, { x, y: box.y, w: cW, h: cardH, kicker: '매력 포인트', title, detail, titleSize: 13, detailSize: 10.5 });
                            slide.addText(`확인 필요: ${check}`, {
                                x,
                                y: box.y + cardH + 0.06,
                                w: cW,
                                h: 0.45,
                                fontFace: FONT_KR,
                                fontSize: 9.5,
                                color: COLORS.textSecondary,
                                fit: 'shrink',
                            });
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 15, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '합격 후기 루프 구조', { x: box.x, y: box.y, w: box.w, fontSize: 13 });
                        addCallout(slide, '합격자 배출 → 후기 콘텐츠화 → 신뢰 형성 → 상담·결제 전환 → 다음 합격자 배출', {
                            x: box.x,
                            y: box.y + 0.35,
                            w: box.w,
                            h: 0.95,
                            fontSize: 11.5,
                            bold: true,
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 15, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '투자 판단상 의미', { x: box.x, y: box.y, w: box.w, fontSize: 13 });
                        addBulletList(
                            slide,
                            [
                                '매력 인정 조건: 루프가 실제 전환율로 연결된다는 데이터 확인',
                                '리스크: 루프 핵심 단계가 대표자 개인 역량에 의존할 가능성',
                                '가격 반영 기준: 합격자 수가 아닌 실적의 증빙·법인 자산화 여부',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.95, fontSize: 10.8 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '합격 실적, LTV/CAC, 광고비 수치는 회사 측 주장 또는 마케팅 표기. 가격 근거 사용 전 원자료 확인 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '매력 포인트 3가지 모두 원자료 검증 필요'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 13 — 고졸 특화 포지셔닝의 의미
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'D. 사업 매력 포인트',
            pageText: '13',
            elements: [
                { type: 'text', style: 'title', text: '"고졸 전문" 포지셔닝의 마케팅 가치', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '대형 취업 교육업체의 넓은 메시지와 달리, 마킹PT는 "고졸 전문"만 반복. 특정 고객군에는 강한 신뢰 신호.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 6 },
                    render: (slide, box) => {
                        addSubheading(slide, '포지셔닝 우위', { x: box.x, y: box.y, w: box.w, fontSize: 13 });
                        addBulletList(
                            slide,
                            [
                                '타겟 명확: 마이스터고·특성화고 재학생 및 졸업생',
                                '메시지 일관: 홈페이지·블로그·인스타그램 모두 고졸 전문 강조',
                                '신뢰 구조: "나와 같은 배경의 합격 사례" 중심',
                                '경쟁 회피: 대형 취업 교육업체의 대졸·일반 취업 메시지와 차별화',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 1.5, fontSize: 11.5 },
                        );
                    },
                },
                {
                    type: 'table',
                    header: ['출처', '필기 합격', '최종 합격', '검증 상태'],
                    rows: [
                        ['인스타그램', '900명+', '420명+', '마케팅 표기'],
                        ['홈페이지', '800건+', '400건+', '마케팅 표기'],
                        ['블로그', '750명+', '400명+', '마케팅 표기'],
                        ['Q&A 개요 문서', '—', '300명+', '회사 주장'],
                    ],
                    colWRatio: [1.9, 1.35, 1.35, 1.4],
                    grid: { colStart: 1, colSpan: 6, rowStart: 13, rowSpan: 6 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 13 },
                    render: (slide, box) => {
                        addSubheading(slide, '포지셔닝 맵 (고졸 특화도 × 관리형)', { x: box.x, y: box.y, w: box.w, fontSize: 13 });
                        addSectionCard(slide, {
                            x: box.x,
                            y: box.y + 0.35,
                            w: box.w,
                            h: 1.95,
                            kicker: '고졸 특화도 높음 · 좁지만 깊음',
                            title: '마킹PT',
                            detail: '대비 — 해커스잡·취업동스쿨(단순 VOD, 낮은 특화도), KG내일취업코칭·오프라인학원(높은 관리형, 낮은 특화도)',
                            titleSize: 16,
                            detailSize: 10.5,
                        });
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '채널별 수치 불일치는 업데이트 시점·산정 기준 차이 가능. 포지셔닝 맵은 온라인 실사·네이버 검색 기반 분석.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '독점이 아닌 "좁고 선명한 메시지"의 가치'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 14 — 수강생 성장 추이
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'D. 사업 매력 포인트',
            pageText: '14',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '월별 수강생 추이: 비수기 저점 294명, 2026년 3월 423명',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '비수기에도 일정 수강생 기반 유지. 2026년 3월 역대 최고치 달성 주장. 단, 카운팅·잔존율 확인 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 4, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        const halfW = box.w / 2 - 0.05;
                        addTable(
                            slide,
                            ['월', '수강생'],
                            [
                                ['2025-05', '339명'],
                                ['2025-06', '364명'],
                                ['2025-07', '375명'],
                                ['2025-08', '400명 ★'],
                                ['2025-09', '398명'],
                                ['2025-10', '388명'],
                            ],
                            { x: box.x, y: box.y, w: halfW, colW: [0.95, halfW - 0.95], rowH: 0.32, fontSize: 8.5, headerFontSize: 9, boldCols: [0] },
                        );
                        addTable(
                            slide,
                            ['월', '수강생'],
                            [
                                ['2025-11', '322명'],
                                ['2025-12', '294명 ▼'],
                                ['2026-01', '330명'],
                                ['2026-02', '335명'],
                                ['2026-03', '423명 ★'],
                            ],
                            {
                                x: box.x + halfW + 0.1,
                                y: box.y,
                                w: halfW,
                                colW: [0.95, halfW - 0.95],
                                rowH: 0.32,
                                fontSize: 8.5,
                                headerFontSize: 9,
                                boldCols: [0],
                            },
                        );
                        addColumnNote(slide, '11개월 평균: 361명 (회사 주장 / DD 필요)', { x: box.x, y: box.y + 7 * 0.32 + 0.1, w: box.w });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 5, colSpan: 8, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addSubheading(slide, '구간별 해석', { x: box.x, y: box.y, w: box.w, fontSize: 13 });
                        addTable(
                            slide,
                            ['구간', '의미', '확인 필요'],
                            [
                                ['2025.08 고점', '하반기 준비 수요 유입 가능성', '신규/재등록 분리'],
                                ['2025.12 저점', '합격자 이탈·신규 유입 감소 가능성', '환불, 이탈 사유'],
                                ['2026.03 최고치', '시즌 효과 + 광고 집행 효과 가능성', '광고 유입이 리드인지 결제자인지 구분'],
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, colW: [1.7, 3.13, 2.6], rowH: 0.42, fontSize: 10.5, boldCols: [0] },
                        );
                        const halfW = box.w / 2 - 0.05;
                        addSubheading(slide, '이 데이터로 말할 수 있는 것', { x: box.x, y: box.y + 2.15, w: halfW, fontSize: 11.5 });
                        addBulletList(slide, ['월별 수강생 변동성 존재', '저점 294명 수준의 기저 기반', '2026년 3월 성장 신호 가능성'], {
                            x: box.x,
                            y: box.y + 2.5,
                            w: halfW,
                            h: 0.85,
                            fontSize: 10.5,
                        });
                        addSubheading(slide, '데이터만으로 말하기 어려운 것', { x: box.x + halfW + 0.1, y: box.y + 2.15, w: halfW, fontSize: 11.5 });
                        addBulletList(slide, ['코호트별 잔존율', '순매출 기준 유지율', '신규 결제 전환율', '대표 부재 기간과의 인과관계'], {
                            x: box.x + halfW + 0.1,
                            y: box.y + 2.5,
                            w: halfW,
                            h: 0.85,
                            fontSize: 10.5,
                        });
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '월별 수강생 자료는 회사 제공. 등록 기준, 결제 기준, 환불 반영 여부 확인 필요. (회사 주장 / DD 필요)',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '2026년 3월 423명 최고치, 잔존율 확인 필요'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 15 — 경쟁 지형도 (2×2 매트릭스)
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'E. 경쟁 구도',
            pageText: '15',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '경쟁 지형도: 동일 포맷 경쟁자 희소, 고객 대체재 다수',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '마킹PT의 우위는 독점이 아닌 특화 포지셔닝. 관리형+고졸특화 결합은 희소하나 대체재는 존재.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 5, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        const qW = box.w / 2 - 0.1;
                        const qH = box.h / 2 - 0.1;
                        const gap = 0.2;
                        const quadrants = [
                            ['에듀피디', '고졸 공무원 중심\n단순 VOD, 관리형 약함'],
                            ['마킹PT', '고졸 특화 + 관리형 결합\n동일 포맷 경쟁자 미확인'],
                            ['취업동스쿨 / 해커스잡', 'NCS 전반 대상\n저비용 VOD 위주'],
                            ['KG내일취업코칭 / 오프라인 NCS학원', '고졸 특화도 낮음\n대면·고비용 관리형'],
                        ];
                        quadrants.forEach(([title, detail], i) => {
                            const col = i % 2;
                            const row = Math.floor(i / 2);
                            addSectionCard(slide, {
                                x: box.x + col * (qW + gap),
                                y: box.y + row * (qH + gap),
                                w: qW,
                                h: qH,
                                kicker: i === 1 ? '마킹PT 포지션' : `경쟁 대상 ${i + 1}`,
                                title,
                                detail,
                                titleSize: 13,
                                detailSize: 10,
                            });
                        });
                        addColumnNote(slide, '세로: 고졸 특화도 (위 높음) · 가로: 관리형 구조 (오른쪽 강함)', {
                            x: box.x,
                            y: box.y + 2 * (qH + gap) + 0.02,
                            w: box.w,
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 6, colSpan: 7, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addTable(
                            slide,
                            ['구분', '해당 업체/채널', '위협도', '해석'],
                            [
                                ['동일 포맷', '명확한 업체 미확인', '낮음', '고졸 NCS 전용 관리형 인강 희소'],
                                ['부분 직접 경쟁', '취업동스쿨·해커스잡·KG내일취업코칭', '중간', 'NCS·공기업 강의 일부 제공'],
                                ['무료·저가 대체재', '공취모·독취사·고시넷·유튜브', '중간~높음', '수험생의 실제 선택지'],
                                ['인접 시장', '에듀피디·시대에듀', '중간', '고졸 공무원 등 대체 진로'],
                                ['잠재 진입자', '해커스·에듀윌·시대에듀 등 대형사', '중간', '기존 인프라로 고졸 패키지 진입 가능'],
                            ],
                            { x: box.x, y: box.y, w: box.w, colW: [1.35, 2.13, 0.95, box.w - 4.43], rowH: 0.42, fontSize: 10, boldCols: [0] },
                        );
                        addBulletList(
                            slide,
                            [
                                '인정 가능: 좁은 세그먼트 내 선명한 포지셔닝',
                                '인정 곤란: 독점 프리미엄',
                                'DD 질문: 특화 포지셔닝이 실제 결제 전환으로 연결되는가',
                            ],
                            { x: box.x, y: box.y + 2.7, w: box.w, h: 0.8, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '경쟁사 현황은 2026-06-16 네이버 검색·홈페이지 실사 기준. 시점·광고·개인화에 따라 변동 가능. (DD 필요)',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '경쟁 우위는 좁은 포지셔닝, 독점 아님'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 16 — 주요 경쟁사·대체재 비교표
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'E. 경쟁 구도',
            pageText: '16',
            elements: [
                { type: 'text', style: 'title', text: '마킹PT vs 주요 경쟁사·대체재 비교', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '월 29~37만원 프리미엄 유지 조건: 관리형 운영, 합격 후기, 커뮤니티 Lock-in의 실질 가치 증명.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['비교 항목', '마킹PT', '취업동스쿨', '해커스잡', '오프라인 NCS학원', '공취모/독취사'],
                    rows: [
                        ['주 타겟', '고졸·마이스터고·특성화고', 'NCS 준비생 전반', '공기업·대기업 전반', '공기업 준비생', '취업 준비생 전반'],
                        ['고졸 특화도', '높음', '일부 포함', '확인 필요', '일부 가능', '해당 없음'],
                        ['NCS 집중도', '높음', '높음', '높음', '높음', '정보 탐색 중심'],
                        ['관리형 구조', '교재+카페+LMS', 'VOD 위주', '패키지 가능', '대면 관리', '무료 커뮤니티'],
                        ['가격대', '월 29~37만원', '저가 단과', '패키지형', '상담형 고가', '무료'],
                        ['합격 후기 활용', '핵심 마케팅', '제한적', '강함', '지역별 편차', '커뮤니티 후기'],
                        ['잠재 위협', '가격 프리미엄 방어', '저가 경쟁', '고졸 패키지 진입', '대면 관리 흡수', '무료 정보 대체'],
                    ],
                    colWRatio: [1.8, 2.0, 1.9, 1.8, 2.1, 2.73],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 11 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 18, rowSpan: 4 },
                    render: (slide, box) => {
                        addSubheading(slide, '경쟁사별 위협 대응 포인트', { x: box.x, y: box.y, w: box.w });
                        addBulletList(
                            slide,
                            [
                                '취업동스쿨: 저가 단과 대체 → 고졸 특화 관리·교재·커뮤니티 가치',
                                '해커스잡: 대형 브랜드 고졸 패키지 진입 → 합격후기·학교추천 선점',
                                '오프라인학원: 대면관리 흡수 → 원격 운영·월정기 배송 편의성',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.6, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 18, rowSpan: 4 },
                    render: (slide, box) => {
                        addBulletList(
                            slide,
                            ['공취모/독취사: 무료 정보 대체 → 탐색 후 유료 전환 퍼널 필요', '학교 취업지도: 무료 대체재/추천 채널 → 협력 채널화 필요'],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.6, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '프리미엄 방어는 관리형·후기·커뮤니티 자산화'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 17 — 경쟁 리스크 3가지
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'E. 경쟁 구도',
            pageText: '17',
            elements: [
                { type: 'text', style: 'title', text: '경쟁 리스크 3가지', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '포지셔닝 우위는 존재. 다만 대형사 진입, 채용 정책 변화, 저가 대체재 압력에는 취약.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['리스크', '가능성', '영향도', '대응 방향'],
                    rows: [
                        ['대형 교육업체의 고졸 패키지 진입', '중간', '높음', '합격후기 자산 공식화, 학교 B2B 관계 강화'],
                        ['공기업 고졸 채용 정책 변화', '중간', '높음', '대기업반·마이스터고 입학반 등 다변화'],
                        ['저가·무료 대체재 이탈', '중간', '중간', '관리형 가치, 합격률, 후기 증빙 지속 노출'],
                    ],
                    colWRatio: [3.0, 1.3, 1.3, 6.73],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 5 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 12, rowSpan: 7 },
                    render: (slide, box) => {
                        addSubheading(slide, '세부 리스크', { x: box.x, y: box.y, w: box.w });
                        addBulletList(
                            slide,
                            [
                                '대형사 진입: NCS 강의·광고 채널·강사 풀 보유',
                                '정책 변화: 공공기관 고졸 채용 규모 변동 시 매출 기반 흔들림',
                                '저가 대체재: 교재 독학·무료 커뮤니티·유튜브와 가격 비교 노출',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.95, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 12, rowSpan: 7 },
                    render: (slide, box) => {
                        addSubheading(slide, '가격 프리미엄 방어 조건', { x: box.x, y: box.y, w: box.w });
                        addBulletList(
                            slide,
                            [
                                '합격 실적 원장 및 증빙 확보',
                                '고졸 특화 콘텐츠 품질 유지',
                                '학교 추천 경로의 법인 자산화',
                                '커뮤니티 Lock-in과 재등록률 데이터 확보',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.95, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '경쟁 대응의 핵심: 광고 확대보다 합격 후기·학교 관계·커뮤니티의 법인 자산화.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '대응 핵심은 광고가 아닌 자산의 법인화'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 18 — 우선순위 인수 리스크 5가지
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'F. 인수 리스크',
            pageText: '18',
            elements: [
                { type: 'text', style: 'title', text: '인수 전 확인해야 할 Top 5 리스크', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '가격과 계약 조건 결정 전, 회사 주장과 원자료 검증 항목을 분리할 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['순위', '리스크', '왜 중요한가', '필요 자료'],
                    rows: [
                        [
                            '★★★',
                            '대표자 이탈 시 사업 유지 가능성',
                            '합격후기 루프·상담전환·학교네트워크의 개인 의존도 미확인',
                            '부재기간 신규결제·상담전환율·환불률',
                        ],
                        ['★★★', '조정 EBITDA 과대평가', '회사 제시 6.43억원은 SDE 성격. 인수자 귀속 수익력 재산정 필요', '대체 인건비, 비용 정상화 산출'],
                        ['★★', '합격 실적 신뢰성', '채널별 합격자 수 불일치. 신뢰 마케팅 자산 가치 불확실', '합격자 원장, 중복 제거 기준, 증빙'],
                        ['★★', '채널별 전환 데이터 부재', '방문·팔로워·회원 수의 매출 기여도 미확인', '채널별 리드→상담→결제 전환율'],
                        ['★★', '현금 포함 거래 조건 미확정', '2025년 말 현금 3.12억원의 거래가 반영 여부 미확정', 'Cash-free/debt-free 기준'],
                    ],
                    colWRatio: [0.8, 2.6, 5.0, 3.93],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 9 },
                },
                {
                    type: 'bullets',
                    points: [
                        'Top 5 중 하나라도 부정적이면 가격 조정 또는 계약 조건 강화 필요',
                        'Top 5가 모두 양호해야 32억원 이상 검토 가능',
                        '자료 제공 지연·거부 자체도 리스크 신호',
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 16, rowSpan: 4 },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: 'DD는 확인 절차가 아니라 가격 협상과 계약 조건을 정하는 핵심 근거.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'DD는 가격협상의 핵심 근거'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 19 — 대표자 의존도 상세
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'F. 인수 리스크',
            pageText: '19',
            elements: [
                { type: 'text', style: 'title', text: '대표가 빠져도 이 사업은 유지되는가', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '대표 부재 3개월 테스트는 긍정 신호. 신규 고객 획득까지 포함한 독립 운영인지는 미확인.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['역할 영역', '현재 수행 주체 추정', '대체 난이도', '확인 자료'],
                    rows: [
                        ['콘텐츠 기획·검수', '대표자 또는 팀 공동', '중간', '콘텐츠 승인 프로세스, SOP'],
                        ['합격자 인터뷰·후기 콘텐츠화', '대표자 직접 가능성', '높음', '후기 제작 프로세스, 동의서'],
                        ['상담 과정의 설득 톤', '대표자 또는 상담 인력', '중간~높음', '상담 스크립트, 전환율'],
                        ['학교 교사 추천 네트워크', '대표자 개인 관계 가능성', '높음', '학교별 추천 경로, 담당자'],
                        ['수강료 인상·상품 기획', '대표자', '중간', '가격 변경 이력, 상품 기획 문서'],
                        ['프리랜서 품질 관리', '대표자·운영팀', '중간', '계약서, 검수 기준'],
                    ],
                    colWRatio: [2.3, 2.9, 1.7, 5.43],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 10 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '대표 부재 테스트 확인 질문', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(
                            slide,
                            [
                                '부재 기간(2025.12~2026.02) 신규 결제 전환율 유지 여부',
                                '상담 응대 주체: 대표자 직접 관여 여부',
                                '환불률·이탈률 변화, 2026.03 최고치의 원인',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.65, fontSize: 10.8 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, 'DD 요청 항목', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(
                            slide,
                            [
                                '대표자 2인 업무 범위·의사결정 권한, 인수인계·기술고문 계약 범위',
                                '부재 기간 월별 신규결제·상담전환·환불률, 학교 추천 관계의 법인 귀속',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.65, fontSize: 10.8 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '대표 부재 검증 전 독립운영 단정 금지'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 20 — Buy vs Build 비교
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'F. 인수 리스크',
            pageText: '20',
            elements: [
                { type: 'text', style: 'title', text: '인수 vs 직접 구축: 무엇을 사는가', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '인수 대상의 본질: 플랫폼이 아니라 합격 후기, 채널, 운영 인력, 학교·추천 유입 가능성.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['비교 항목', '인수 (마킹PT)', '직접 구축'],
                    rows: [
                        ['초기 투자', '27~50억원 협상 범위', '별도 사업계획 산정 필요'],
                        ['신뢰 자산', '합격후기·채널·카페·교재 체계 즉시 확보', '첫 합격 사례 확보 전까지 전환율 낮을 가능성'],
                        ['운영 인력', '정규직 7명+프리랜서 18명 승계 가능', '신규 채용·교육·검수 체계 필요'],
                        ['브랜드·포지셔닝', '고졸 전문 메시지 누적', '처음부터 구축 필요'],
                        ['주요 리스크', '가격 과다, 대표자 의존도, IP 이전 미확인', '초기 합격자 확보 실패, 세그먼트 오판'],
                        ['판단 기준', '가격·DD 결과 양호 시 유리', '희망가 유지 또는 DD 부정적일 때 대안'],
                    ],
                    colWRatio: [2.3, 5.0, 5.03],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 10 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '직접 구축의 핵심 장벽', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(
                            slide,
                            [
                                '시스템 복제보다 첫 합격자 확보가 핵심',
                                '합격자 부재 시 후기·신뢰·전환 루프 시작 곤란',
                                '채용/시험 사이클 1회 이상 통과 필요 가능성',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.65, fontSize: 10.8 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '현 시점 판단', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(
                            slide,
                            [
                                '27~32억원 합의 + Top5 DD 통과 → 인수 우선 검토',
                                '32~35억원 + 일부 불확실 → 조건부 인수(Earn-out)',
                                '35억원 이상 → 직접 구축·제휴 등 대안 비교',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.65, fontSize: 10.8 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '직접구축 비용=첫 합격자 확보까지 시행착오'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 21 — 마킹PT BM 핵심 원리: 플라이휠
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'G. 내부 BM 가능성',
            pageText: '21',
            elements: [
                { type: 'text', style: 'title', text: '마킹PT식 BM의 핵심: 합격 후기 플라이휠', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '저비용 성장의 핵심 후보: 기술·플랫폼이 아닌 합격 후기 기반 자기강화 루프.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        const steps = [
                            ['① 합격자 배출', '필기·최종 합격자 배출'],
                            ['② 후기 콘텐츠화', '인스타·블로그·카페·홈페이지 게시'],
                            ['③ 신규 수험생 신뢰 획득', '"나와 같은 배경의 사람이 합격"'],
                            ['④ 상담·유료 결제 전환', '월 29~37만원 구독'],
                            ['⑤ 수강생 관리 → 다음 합격자', '교재 배송·카페 코칭·LMS 과제 관리'],
                        ];
                        const sH = 0.6;
                        const gap = 0.06;
                        steps.forEach(([title, detail], i) => {
                            addSectionCard(slide, {
                                x: box.x,
                                y: box.y + i * (sH + gap),
                                w: box.w,
                                h: sH,
                                kicker: `STEP ${i + 1}`,
                                title,
                                detail,
                                titleSize: 11.5,
                                detailSize: 9.5,
                            });
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addTable(
                            slide,
                            ['조건', '마킹PT 현황', '유지 과제'],
                            [
                                ['명확한 합격 결과', '합격후기 420명+ (마케팅 표기)', '원장·증빙·동의서 확보'],
                                ['수개월의 준비 기간', '평균 수강 5.3개월 (회사 주장)', '코호트 잔존율 관리'],
                                ['대형 업체의 약한 틈새', '고졸 특화 포지셔닝', '경쟁사 진입 전 자산 공식화'],
                                ['지불 의사', '월 29~37만원 수강료', '가격 프리미엄 가치 증명'],
                            ],
                            { x: box.x, y: box.y, w: box.w, colW: [1.7, 2.5, 1.78], rowH: 0.42, fontSize: 10, boldCols: [0] },
                        );
                        addSubheading(slide, '핵심 리스크', { x: box.x, y: box.y + 2.25, w: box.w, fontSize: 12 });
                        addBulletList(
                            slide,
                            [
                                '후기 제작 방식이 대표자 개인 감각에 의존할 가능성',
                                '학교 추천 네트워크가 개인 관계일 가능성',
                                '상담 전환의 핵심 메시지가 문서화되지 않았을 가능성',
                            ],
                            { x: box.x, y: box.y + 2.6, w: box.w, h: 0.9, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '내부 BM 적용 가능성은 "플라이휠의 법인 자산화 여부" 확인 후 판단.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '관건은 플라이휠의 법인 자산화 여부'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 22 — 내부 직접 구축 시나리오
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'G. 내부 BM 가능성',
            pageText: '22',
            elements: [
                { type: 'text', style: 'title', text: '마킹PT 없이 0에서 시작할 때 필요한 것', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '직접 구축의 핵심 과제: 플랫폼 구축보다 첫 합격자·신뢰 자산 확보.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['영역', '필요한 작업', '불확실성'],
                    rows: [
                        ['세그먼트 선정', '시장 규모, 경쟁 강도, 지불 의사 확인', '타겟 오판 시 회수 곤란'],
                        ['콘텐츠 전문성', '강사·전문가 섭외, 교재·VOD 제작', '합격률을 만들 노하우 필요'],
                        ['초기 수강생 모집', '할인·무료체험·추천 기반 모집', '합격 전 전환율 낮을 수 있음'],
                        ['집중 관리', '소수 수강생 밀착 관리, 상담·코칭 체계', '인건비·운영 시행착오 발생'],
                        ['후기 자산화', '첫 합격자 인터뷰, SNS·블로그·카페 게시', '첫 합격 사례 확보 여부'],
                        ['운영 SOP', '상담, 콘텐츠 검수, 수강 관리 문서화', '대표자 암묵지 대체 필요'],
                    ],
                    colWRatio: [1.8, 6.5, 4.03],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 10 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '단계별 관점', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(
                            slide,
                            [
                                '1단계: 세그먼트·강사·콘텐츠 초안 확보',
                                '2단계: 초기 수강생 집중 관리, 첫 합격 사례 확인',
                                '3단계: 후기·추천 루프 형성',
                                '4단계: 규모화(CAC·잔존율 안정화)',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.85, fontSize: 10.5 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '수치 사용 원칙', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(
                            slide,
                            ['구축 기간·비용은 별도 사업계획 필요', '채용/시험 사이클에 따라 첫 성과 시점 변동', 'PPT 본문에서 특정 개월 수·투자액 단정 지양'],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.85, fontSize: 10.5 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '직접구축은 첫 합격자 전 실패리스크 반영 필수'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 23 — 유사 BM 적용 가능 분야
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'G. 내부 BM 가능성',
            pageText: '23',
            elements: [
                { type: 'text', style: 'title', text: '마킹PT식 플라이휠 적용 가능 후보', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '적용 조건: 시험 존재 여부가 아니라, 기존 강자가 약한 틈새에서 합격 사례를 만들 수 있는가.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['분야', '시장 성격', '경쟁 강도', '지불 의사', '종합 판단'],
                    rows: [
                        ['마이스터고·직업계고 입시', '학부모 결제 가능, 입학 결과 명확', '낮음~중간', '높음 가능성', '우선 검토'],
                        ['소방공무원 고졸·경채', '합격 결과 명확, 기존 학원 존재', '중간', '중간', '검토 가능'],
                        ['군 부사관 기술·특기', '특화 수요 가능', '낮음~중간', '낮음~중간', '제한 검토'],
                        ['경찰 고졸 특채', '시장 규모 제한 가능성', '중간', '중간', '보수적 검토'],
                        ['대졸 NCS 특정 직군', '시장은 크나 경쟁 강함', '높음', '중간', '비우선'],
                        ['산업기사급 자격증', '시장은 크나 가격 경쟁 심함', '높음', '낮음~중간', '비추천'],
                    ],
                    colWRatio: [2.3, 3.7, 1.6, 1.6, 3.13],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 10 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '우선 후보: 마이스터고·직업계고 입시', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(
                            slide,
                            ['마킹PT 고객군과 인접, 학부모 결제 가능성', '입학 결과 기반 후기 구조 가능', '시장 규모·지역성·입시 제도 추가 확인 필요'],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.65, fontSize: 10.8 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, 'BM 적용 조건', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(slide, ['명확한 합격 결과 + 수개월 이상 준비 기간', '기존 강자의 약한 틈새 + 지불 의사 + 후기 공개 가능성'], {
                            x: box.x,
                            y: box.y + 0.35,
                            w: box.w,
                            h: 0.65,
                            fontSize: 10.8,
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '후보 평가는 선별용 내부검토, 우선순위 재조정 필요'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 24 — 내부 구축 vs 인수 최종 판단 기준
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'G. 내부 BM 가능성',
            pageText: '24',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '언제 인수가 맞고, 언제 직접 구축이 맞는가',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '가격과 DD 결과가 좋으면 인수 우선. 희망가 유지·자산 이전성 낮으면 직접 구축·제휴 검토.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['판단 기준', '인수 유리', '직접 구축 유리'],
                    rows: [
                        ['속도', '기존 매출·채널 즉시 확보 필요', '장기 실험 가능'],
                        ['자금', '인수 자금 여유', '인수 리스크 회피 필요'],
                        ['내부 역량', '교육·콘텐츠 인력 부족', '콘텐츠·교육 전문가 확보 가능'],
                        ['가격', '27~32억원 합의 가능', '40억원 이상 희망가 유지'],
                        ['DD 결과', '대표 독립성·합격실적·전환율 양호', '핵심 자산이 대표 개인에 귀속'],
                        ['확장 의도', '마킹PT 기반 인접 분야 확장', '특정 분야를 처음부터 설계'],
                    ],
                    colWRatio: [1.8, 5.2, 5.33],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 10 },
                },
                {
                    type: 'bullets',
                    points: [
                        '27~32억원 + Top5 DD 양호 → 인수 우선 검토',
                        '32~35억원 + 일부 미검증 → 조건부 검토(가격조정·Earn-out)',
                        '35~40억원 → 직접 구축·제휴·마이스터고 대안 비교',
                        '40억원 이상 고수 → 인수 중단 또는 장기 대안 전환',
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 17, rowSpan: 5 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '기준은 "만들 수 있는가"가 아닌 시간을 사는 합리성'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 25 — 인수 후 100일 가치 제고 레버
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'H. 인수 후 운영 및 협상 방향',
            pageText: '25',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '인수 후 첫 100일: 개인 역량을 법인 운영 지표로 전환',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '첫 100일 목표: 매출 확대보다 데이터·SOP·권리 이전 체계 구축.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['레버', '현재 상태', '100일 과제', '기대 효과'],
                    rows: [
                        ['채널 전환 측정', '방문·팔로워 중심', '리드→상담→결제 추적표 구축', '유효 채널·CAC 확인'],
                        ['합격 후기 자산화', '채널별 수치 불일치', '원장·동의서·증빙·후기 템플릿 정리', '신뢰 마케팅 법인화'],
                        ['학교 B2B 경로 확인', '비공식 추천 중심 추정', '학교별 추천 경로 파악, 특강 테스트', '낮은 CAC 가능성 검증'],
                        ['커뮤니티 Lock-in', '카페 운영 중', '멘토링·기수문화·인증 이벤트 구조화', '재등록·구전 유입 강화'],
                        ['소액 광고 실험', '3월 광고 성과 주장', '월별 ROAS 테스트', '유료 광고 확장성 판단'],
                    ],
                    colWRatio: [1.8, 3.0, 3.83, 3.7],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 9 },
                },
                {
                    type: 'bullets',
                    points: [
                        '매출 확대보다 측정 체계 우선',
                        '대표자 개인 관계를 법인 관계로 전환',
                        '합격 실적을 마케팅 문구가 아닌 원장·증빙 DB로 관리',
                        '광고 확대 전 채널별 전환율 확인, SOP 없는 업무부터 문서화',
                    ],
                    grid: { colStart: 1, colSpan: 12, rowStart: 16, rowSpan: 5 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '100일 KPI는 매출증가보다 대표의존도 축소'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 26 — 가격 협상 전략
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'H. 인수 후 운영 및 협상 방향',
            pageText: '26',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '가격 협상 전략: 27~30억원 출발, DD 결과에 따라 상향',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '27~30억원에서 시작. 40~50억원은 현 자료 기준 수용 곤란.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 10 },
                    render: (slide, box) => {
                        const steps = [
                            ['협상 출발점', '27~30억원'],
                            ['상향 검토', '32~35억원 (Top5 DD 양호 시)'],
                            ['최대 검토', '35~40억원 (대표독립성·전환율 모두 검증)'],
                        ];
                        steps.forEach(([title, detail], i) => {
                            addSectionCard(slide, {
                                x: box.x,
                                y: box.y + i * 0.68,
                                w: box.w,
                                h: 0.6,
                                kicker: `단계 ${i + 1}`,
                                title,
                                detail,
                                titleSize: 13,
                                detailSize: 10,
                            });
                        });
                        addCallout(slide, '희망 매각가 40~50억원: 현 자료 기준 수용 곤란', {
                            x: box.x,
                            y: box.y + 2.1,
                            w: box.w,
                            h: 0.5,
                            fontSize: 11.5,
                            bold: true,
                        });
                    },
                },
                {
                    type: 'table',
                    header: ['근거', '내용', '검증 상태'],
                    rows: [
                        ['기준 수익력', '회사 제시 6.43억 아닌 인수자 귀속 4.9~5.4억 기준', 'DD 필요'],
                        ['적용 배수', '정상화 수익력 5~6배를 내부 검토 기준으로 사용', '내부 검토'],
                        ['독점 프리미엄', '동일 포맷 희소하나 대체재 다수. 현 단계 불인정', '내부 검토'],
                        ['현금 처리', '순현금 약 3.10억원 포함 여부 확인 필요', 'DD 필요'],
                        ['상향 조건', '전환율·잔존율·합격원장·대표 독립성 확인', 'DD 필요'],
                    ],
                    colWRatio: [1.5, 3.28, 1.2],
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 9 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '협상 시나리오별 대응', { x: box.x, y: box.y, w: box.w, fontSize: 12 });
                        addBulletList(
                            slide,
                            [
                                '"EBITDA 6.43억 기준 40억" → 인수자 귀속 수익력 재산정 후 27~32억 제시',
                                '"성장성 반영 45억" → 기본가 낮추고 실적연동 추가지급 구조 제안',
                                '"Earn-out 거부" → 현금 포함 여부·DD 결과로 기본가 재산정',
                                '"40억 이하 불가" → 직접 구축·제휴·다른 매물 검토로 전환',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.85, fontSize: 10.5 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '가격은 데이터 확인 시에만 단계적으로 상향'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 27 — 계약 조건 체크리스트
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'H. 인수 후 운영 및 협상 방향',
            pageText: '27',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '계약 조건 체크리스트: 가격 외 필수 확보 조건',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '가격만큼 중요한 조건: 인수인계, 경업금지, IP 이전, 현금 처리, 핵심 인력 승계.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['조건 항목', '권장 협상안', '현재 상태'],
                    rows: [
                        ['인수인계 기간', '기술고문 계약. 상담SOP·학교네트워크·콘텐츠 기준 인계범위 명시', '1년 미만 수용의사 (회사 주장)'],
                        ['경업금지', '고졸 공기업·대기업 취업교육 영역 중심. 기간·범위 법률검토 필요', '수용 의사 (회사 주장)'],
                        ['핵심 인력 승계', '정규직 7명 중 콘텐츠·운영 핵심 인력 유지 조건', '현황 확인 필요'],
                        ['IP 이전', '상표·LMS·교재·VOD·SNS·카페·도메인 법인 귀속 확인', '법인귀속 주장 (DD 필요)'],
                        ['현금 처리', 'Cash-free 기준 또는 현금 포함 밸류 재산정', '미정 (DD 필요)'],
                        ['Earn-out', '대표 측 거부 의사. KPI 연동 조건부 재제안 검토', '거부 의사 (회사 주장)'],
                        ['합격 실적 보증', '합격자 원장·증빙 기준 진술 및 보장 조항 검토', '추가 협의 필요'],
                        ['우발채무', '소송·세무조사·미납세금·체불 여부 확인', 'DD 필요'],
                    ],
                    colWRatio: [1.9, 7.43, 3.0],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 12 },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '인수인계는 업무별 산출물 기준 필요, IP는 명의·계약서·원본파일 확인 우선. 조건 협상 실패 시 가격 인하 효과도 희석.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 20, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 22, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'IP·인수인계 조건은 가격만큼 중요'),
                },
            ],
        },

        // ────────────────────────────────────────────────────────────
        // 슬라이드 28 — DD(실사) 우선순위 Top 5
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'H. 인수 후 운영 및 협상 방향',
            pageText: '28',
            elements: [
                { type: 'text', style: 'title', text: '최종 판단 전 확인할 DD Top 5', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: 'Top 5 자료 없이는 최종 가격 결정 보류. 자료 부재 자체도 리스크 신호.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['순위', '항목', '요청 자료', '확인 목적'],
                    rows: [
                        ['1', '대표자 부재 기간 상세 KPI', '2025.12~2026.02 신규결제·상담전환율·환불률·이탈률', '대표 독립성 검증'],
                        ['2', '인수자 귀속 수익력 재산정', '대체 인건비 역할별 분리, 비용 정상화', '협상가 기준 분모 확정'],
                        ['3', '채널별 고객 획득 데이터', '추천·학교·검색·광고별 리드·상담·결제·CAC', '유효 채널 확인'],
                        ['4', '코호트 잔존율', '가입월별 2·3·6·12개월 잔존율, 이탈 사유', '월구독 안정성 검증'],
                        ['5', '합격자 원장', '연도·기업별 합격자, 중복 제거 기준, 증빙', '신뢰 자산 실재성 확인'],
                    ],
                    colWRatio: [0.7, 2.6, 5.5, 3.53],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 8 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 15, rowSpan: 6 },
                    render: (slide, box) => {
                        addSubheading(slide, '추가 확인 항목 (6~12)', { x: box.x, y: box.y, w: box.w, fontSize: 11.5 });
                        addBulletList(
                            slide,
                            [
                                '현금 포함 거래 조건(Cash-free 기준 정의)',
                                'IP 법인 귀속 확인(상표·LMS·SNS·카페·도메인)',
                                '핵심 인력 유지 가능성',
                                '공기업 고졸 채용 시장 추이',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 1.0, fontSize: 10.5 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 15, rowSpan: 6 },
                    render: (slide, box) => {
                        addBulletList(slide, ['재무제표 vs 관리회계 차이 원인', '프리랜서·강사 계약 조건', '우발채무·소송·세무조사 여부'], {
                            x: box.x,
                            y: box.y + 0.35,
                            w: box.w,
                            h: 1.0,
                            fontSize: 10.5,
                        });
                    },
                },
                {
                    type: 'callout',
                    text: 'Top5 모두 양호→32~35억 진행 / 1~2개 부정→27~30억 조정 / 3개 이상 부정→협상 중단',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '자료 없으면 결정하지 않음'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // Appendix A — DD 체크리스트
        // ════════════════════════════════════════════════════════════

        // ────────────────────────────────────────────────────────────
        // A-1 — 섹션 인트로 + 12항목 우선순위 표
        // ────────────────────────────────────────────────────────────
        {
            sectionLabel: 'Appendix A — DD 체크리스트',
            pageText: 'A-1',
            elements: [
                { type: 'text', style: 'title', text: 'DD(실사) 체크리스트 전체 12항목', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '본문 슬라이드 28의 Top5를 확장한 전체 요청 목록. 최종 가격·계약조건·인수 중단 여부에 직접 반영.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 10 },
                    render: (slide, box) => {
                        addTable(
                            slide,
                            ['#', '항목', '우선도'],
                            [
                                ['1', '대표자 부재 기간 상세 KPI', '★★★'],
                                ['2', '인수자 귀속 수익력 재산정', '★★★'],
                                ['3', '채널별 고객 획득 데이터', '★★'],
                                ['4', '코호트 잔존율', '★★'],
                                ['5', '합격자 원장', '★★'],
                                ['6', 'Cash-free 거래 조건 확인', '-'],
                            ],
                            { x: box.x, y: box.y, w: box.w, colW: [0.5, 4.2, 1.3], rowH: 0.42, fontSize: 10, boldCols: [0] },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 10 },
                    render: (slide, box) => {
                        addTable(
                            slide,
                            ['#', '항목', '우선도'],
                            [
                                ['7', 'IP(지식재산권) 법인 귀속 확인', '-'],
                                ['8', '핵심 인력 유지 가능성', '-'],
                                ['9', '공기업 고졸 채용 시장 추이', '-'],
                                ['10', '재무제표 vs 관리회계 차이 원인', '-'],
                                ['11', '프리랜서·강사 계약 조건', '-'],
                                ['12', '우발채무·소송·세무조사 여부', '-'],
                            ],
                            { x: box.x, y: box.y, w: box.w, colW: [0.5, 4.18, 1.3], rowH: 0.42, fontSize: 10, boldCols: [0] },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '사용 원칙', { x: box.x, y: box.y, w: box.w, fontSize: 12 });
                        addBulletList(
                            slide,
                            [
                                '자료 부재: 가격 인하 또는 조건 강화 사유',
                                '회사 주장 수치: 원자료 확인 전까지 투자 판단 근거로 단독 사용 금지',
                                '계약 관련 항목: 법률 검토 및 진술·보장 조항 반영 필요',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.95, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 17, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '본문 연결', { x: box.x, y: box.y, w: box.w, fontSize: 12 });
                        addBulletList(
                            slide,
                            ['#1·#2는 본문 슬라이드 28 Top5 1·2위와 동일', '#3~#5는 본문 Top5 3~5위 확장판', '#6~#12는 계약 조건·가격 결정 보조 근거'],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.95, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '12항목 자료 없이는 최종 가격 결정 보류'),
                },
            ],
        },

        // A-2 — DD #1, #2
        {
            sectionLabel: 'Appendix A — DD 체크리스트',
            pageText: 'A-2',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '최우선 2건: 대표자 의존도 · 수익력 재산정',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '두 항목 모두 협상가 산정의 핵심 변수. 자료 미확보 시 가격 협상 자체가 보류 대상.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            title: 'DD #1 — 대표자 부재 기간 상세 KPI ★★★',
                            rows: [
                                ['확인 목적', '대표자 부재 중 신규 고객 획득·상담·수강 관리 유지 여부'],
                                ['요청 자료', '25.12~26.02 월별 신규결제·재등록·상담신청·전환율·환불률'],
                                ['추가 자료', '대표 2인 중단 업무 범위, 부재중 의사결정·검수 관여 여부'],
                                ['판단 포인트', '부재 전후 신규결제·상담전환·환불률 변화 여부'],
                                ['가격/계약 영향', '의존도 높을 시 가격 하향, 인수인계·경업금지 강화'],
                            ],
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            col1: 1.5,
                            title: 'DD #2 — 인수자 귀속 수익력 재산정 ★★★',
                            rows: [
                                ['확인 목적', '협상가 산정 분모인 정상화 수익력 확정'],
                                ['요청 자료', '대표 2인 실제 업무·소요시간, 대체인력, 개인성격 비용 목록'],
                                ['재무 확인', '영업이익 3.86억(재무제표) vs 4.28억(관리회계) 차이 원인'],
                                ['판단 포인트', '대표 급여 add-back 전액 인정 여부, 대체인건비 타당성'],
                                ['가격/계약 영향', '회사 제시 6.43억이 아닌 인수자 귀속 수익력 기준 재산정'],
                            ],
                        });
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '0.5억·1.0~1.5억 등 기존 시나리오 금액은 내부 검토 가정. 업무분장·대표 잔류 조건 확인 후 재산정 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '두 항목 미확보 시 가격 협상 보류'),
                },
            ],
        },

        // A-3 — DD #3, #4
        {
            sectionLabel: 'Appendix A — DD 체크리스트',
            pageText: 'A-3',
            elements: [
                { type: 'text', style: 'title', text: '채널별 고객 획득 데이터 · 코호트 잔존율', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '채널 자산 프리미엄과 반복 매출 프리미엄을 뒷받침하는 핵심 데이터.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            title: 'DD #3 — 채널별 고객 획득 데이터 ★★',
                            rows: [
                                ['확인 목적', '추천·학교·블로그·인스타·광고 등 채널의 실제 매출 기여 확인'],
                                ['요청 자료', '채널별 월별 리드수, 상담신청·결제·전환율, 첫결제액·재등록률'],
                                ['비용 자료', '채널별 광고비·콘텐츠제작비·상담인건비, CAC 산식'],
                                ['판단 포인트', '무료·추천 유입 비중, 유료 광고 확장 시 CAC 유지 가능성'],
                                ['가격/계약 영향', '전환 데이터 미흡 시 채널 자산 프리미엄 축소'],
                            ],
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            col1: 1.5,
                            title: 'DD #4 — 코호트 잔존율 ★★',
                            rows: [
                                ['확인 목적', '월구독 구조 실제 안정성 및 LTV 176만원 주장 검증'],
                                ['요청 자료', '가입월별 2·3·6·12개월 잔존율'],
                                ['추가 자료', '상품별 평균 수강기간, 이탈·환불 사유, 재등록률'],
                                ['판단 포인트', '회사 제시 평균 수강기간 5.3개월과 코호트 데이터 정합성'],
                                ['가격/계약 영향', '잔존율 취약 시 반복 매출 프리미엄 축소'],
                            ],
                        });
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '2026.03 메타광고 신규 100명+이 리드인지 결제인지 구분 필요. 평균 수강기간만으로 안정성 판단 금지.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '채널·잔존 데이터 없이 프리미엄 인정 불가'),
                },
            ],
        },

        // A-4 — DD #5, #6
        {
            sectionLabel: 'Appendix A — DD 체크리스트',
            pageText: 'A-4',
            elements: [
                { type: 'text', style: 'title', text: '합격자 원장 · Cash-free 거래 조건', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '신뢰 마케팅 자산의 실재성과 실질 EV(기업가치) 확정에 직결되는 항목.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            title: 'DD #5 — 합격자 원장 ★★',
                            rows: [
                                ['확인 목적', '신뢰 마케팅의 핵심 자산 실재성 확인'],
                                ['요청 자료', '2023~2026년 연도·기업·직렬별 필기·최종합격자 원장'],
                                ['기준 확인', '중복 제거 기준, 유료 수강생 기준 여부, 무료 이용자 포함 여부'],
                                ['증빙 확인', '합격 통지서, 인터뷰 동의서, 후기 활용 동의서'],
                                ['가격/계약 영향', '원장·증빙 부실 시 합격 후기 자산 가치 하향'],
                            ],
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            col1: 1.5,
                            title: 'DD #6 — Cash-free 거래 조건 확인',
                            rows: [
                                ['확인 목적', '실질 EV(기업가치) 확정'],
                                ['요청 자료', '매각가 40~50억의 현금 포함 여부, 계약 기준일 현금·예금 잔액'],
                                ['추가 자료', '주임종단기채무 외 차입금, 보증채무, 우발부채'],
                                ['판단 포인트', '현금 포함 거래인지 Cash-free 기준인지 명확화'],
                                ['가격/계약 영향', '순현금 약 3.10억의 귀속 조건에 따라 실질 가격 변경'],
                            ],
                        });
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '증빙 없는 합격자 수는 마케팅 표기로만 취급. 현금 처리 조건 미확정 시 희망가와 EV 비교가 왜곡됨.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '원장·현금조건 미확정 시 가치 산정 불가'),
                },
            ],
        },

        // A-5 — DD #7 (IP 법인 귀속, 전폭 표)
        {
            sectionLabel: 'Appendix A — DD 체크리스트',
            pageText: 'A-5',
            elements: [
                { type: 'text', style: 'title', text: 'DD #7 — IP(지식재산권) 법인 귀속 확인', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '"법인 소유" 주장보다 계약서·명의·접근 권한 확인이 우선. 자산별로 이전 가능성이 다름.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['자산', '확인 방법', '계약 영향'],
                    rows: [
                        ['상표권', '상표등록증·출원 현황 원본 확인', '미귀속 시 이전 조건 선행'],
                        ['LMS 소스코드', '외주 개발 계약서, 소스코드 귀속 조항, 접근 권한', '유지보수·소유권 조건 명시'],
                        ['교재·VOD 저작권', '프리랜서·강사 계약서의 업무상 저작물 귀속 조항', '저작권 보증 조항 필요'],
                        ['SNS 계정', '인스타그램·유튜브·카카오채널 명의 및 관리자 권한', '계정 이전 절차 명시'],
                        ['네이버 카페·블로그', '법인 명의 여부, 개인 명의 시 이전 가능성', '이전 불가 시 가치 차감'],
                        ['홈페이지 도메인', '도메인 등록 명의, 갱신 권한', '계약 전 명의 정리'],
                        ['수강생 DB', '개인정보 처리 동의, 보관 방식, 개인정보보호법 준수', '개인정보 이전·동의 검토'],
                    ],
                    colWRatio: [2.0, 5.83, 4.5],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 11 },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '법률 검토 및 진술·보장 조항 반영 필요. 7개 자산 모두 명의·계약서 원본 확인 전까지 법인 귀속 미확정.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 18, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, 'IP 7종, 명의·계약서 확인 전까지 미확정'),
                },
            ],
        },

        // A-6 — DD #8, #9
        {
            sectionLabel: 'Appendix A — DD 체크리스트',
            pageText: 'A-6',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '핵심 인력 유지 · 공기업 고졸 채용 시장 추이',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '운영 연속성(인력)과 매출 기반 시장(채용 정책)의 지속 가능성을 함께 점검.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            title: 'DD #8 — 핵심 인력 유지 가능성',
                            rows: [
                                ['확인 목적', '인수 후 운영 연속성 확보'],
                                ['요청 자료', '정규직 7명 업무·계약기간·연봉·처우, 프리랜서 18명 계약조건'],
                                ['추가 자료', '핵심 인력 이탈 가능성, 대표자 측근 여부, 인수 후 처우 계획'],
                                ['판단 포인트', '콘텐츠 R&D, 상담, 운영 담당자의 이탈 리스크'],
                                ['가격/계약 영향', '핵심 인력 유지 조건을 선행조건·가격조정 조건으로 반영'],
                            ],
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            col1: 1.5,
                            title: 'DD #9 — 공기업 고졸 채용 시장 추이 ★★',
                            rows: [
                                ['확인 목적', '매출 기반 시장의 지속 가능성 확인'],
                                ['확인 자료', '최근 5년 주요 공기업별 고졸 채용 인원 추이'],
                                ['대상 기업', '한수원·한전·코레일·발전5사 등 합격 실적 빈출 기업'],
                                ['정책 확인', '정부 능력중심채용 정책 방향, 고졸 채용 확대·축소 기조'],
                                ['가격/계약 영향', '시장 축소 리스크 확인 시 성장 프리미엄 축소'],
                            ],
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '인력·시장 리스크는 가격 프리미엄에 직결'),
                },
            ],
        },

        // A-7 — DD #10, #11
        {
            sectionLabel: 'Appendix A — DD 체크리스트',
            pageText: 'A-7',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '재무제표 vs 관리회계 차이 · 프리랜서 계약 조건',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '신뢰할 수 있는 재무 기준 확정과 콘텐츠 제작 인력의 IP·이탈 리스크 점검.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            title: 'DD #10 — 재무제표 vs 관리회계 차이 원인',
                            rows: [
                                ['확인 목적', '신뢰할 수 있는 재무 기준 확정'],
                                ['확인 자료', '영업이익 3.86억(재무제표) vs 4.28억(관리회계) 차이 내역'],
                                ['추가 확인', '세무조정, 결산조정, 계정 분류 차이, 가결산 여부'],
                                ['판단 포인트', 'Valuation 기준 수익력 산정에 사용할 기준값 확정'],
                                ['가격/계약 영향', '기준 수익력 불확실 시 가격 보수화'],
                            ],
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            col1: 1.5,
                            title: 'DD #11 — 프리랜서·강사 계약 조건',
                            rows: [
                                ['확인 목적', '콘텐츠 품질 유지 및 IP 이전 리스크 확인'],
                                ['요청 자료', 'NCS/전공 문제 제작 프리랜서 13명 계약서'],
                                ['추가 자료', '면접교육 프리랜서 5명, 과목강사 4명 계약조건·재계약 의향'],
                                ['계약 확인', '업무상 저작물 귀속 조항, 경업금지·비밀유지 조항'],
                                ['가격/계약 영향', '계약 부실 시 IP 보증·인력 유지 조건 강화'],
                            ],
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '재무 기준과 핵심 제작인력 계약 동시 확인'),
                },
            ],
        },

        // A-8 — DD #12 + Appendix A 결론
        {
            sectionLabel: 'Appendix A — DD 체크리스트',
            pageText: 'A-8',
            elements: [
                { type: 'text', style: 'title', text: '우발채무 점검 · Appendix A 결론', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '12항목은 본문 Top5의 확장판. 자료 제공 지연·거부 자체도 리스크 신호로 취급.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addDDItem(slide, {
                            x: box.x,
                            y: box.y,
                            w: box.w,
                            title: 'DD #12 — 우발채무·소송·세무조사 여부',
                            rows: [
                                ['확인 목적', '인수 후 예상치 못한 부채 발생 방지'],
                                ['요청 자료', '민사·형사 소송, 세무조사, 임금체불, 퇴직금 미지급 여부'],
                                ['추가 자료', '교재 외주·콘텐츠 제작 분쟁, 소비자 민원·환불 분쟁 이력'],
                                ['판단 포인트', '인수 후 법률·세무 리스크 발생 가능성'],
                                ['가격/계약 영향', '진술 및 보장, 손해배상, 에스크로 등 계약 보호장치 검토'],
                            ],
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addSubheading(slide, 'Appendix A 결론', { x: box.x, y: box.y, w: box.w, fontSize: 12.5 });
                        addBulletList(
                            slide,
                            [
                                '12항목 모두 본문 Top5와 직간접 연결',
                                '자료 부재: 가격 인하 또는 조건 강화 사유로 취급',
                                '회사 주장 수치는 원자료 확인 전까지 단독 판단 근거로 사용 금지',
                                '계약 관련 항목(IP·인력·우발채무)은 법률 검토 및 진술·보장 조항 반영',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 1.7, fontSize: 11 },
                        );
                        addCallout(slide, '12항목 미확보 시 최종 가격·계약 조건 결정을 보류', {
                            x: box.x,
                            y: box.y + 2.2,
                            w: box.w,
                            h: 0.55,
                            fontSize: 11.5,
                            bold: true,
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '자료 제공 지연·거부도 리스크 신호로 취급'),
                },
            ],
        },

        // ════════════════════════════════════════════════════════════
        // Appendix B — 운영 인사이트
        // ════════════════════════════════════════════════════════════

        // B-1 — 섹션 인트로
        {
            sectionLabel: 'Appendix B — 운영 인사이트',
            pageText: 'B-1',
            elements: [
                { type: 'text', style: 'title', text: '마킹PT에서 배울 것들: 운영 인사이트', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '인수 여부와 무관하게 벤치마킹 가능한 운영 방식. 직접 구축 또는 인수 후 운영 개선에 활용.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 7 },
                    render: (slide, box) => {
                        const cards = [
                            ['B-2. 교재 배송 = 브랜드 접점', '월 1회 반복되는 실물 접점을 패키징·타이밍·개인화로 구전 유입에 활용'],
                            ['B-3. 합격 후기 = 콘텐츠 자산', '인터뷰→카드뉴스→블로그→카페→홈페이지로 이어지는 표준화 프로세스'],
                            ['B-4. 저비용 구전 유입 3구조', '학교 추천 · 합격자 기수 문화 · 또래 관찰 효과의 작동 원리와 적용 조건'],
                        ];
                        const cW = (box.w - 0.3) / 3;
                        cards.forEach(([title, detail], i) => {
                            addSectionCard(slide, {
                                x: box.x + i * (cW + 0.15),
                                y: box.y,
                                w: cW,
                                h: box.h,
                                kicker: `INSIGHT ${i + 1}`,
                                title,
                                detail,
                                titleSize: 12.5,
                                detailSize: 10,
                            });
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 14, rowSpan: 7 },
                    render: (slide, box) => {
                        addSubheading(slide, '작성 원칙', { x: box.x, y: box.y, w: box.w, fontSize: 12.5 });
                        addBulletList(
                            slide,
                            [
                                '관찰 사실과 추정 효과 분리',
                                '"무비용", "자동 성장", "CAC 없음" 등 과장 표현 배제',
                                '실제 효과는 전환율·추천 경로·재등록률 데이터로 검증 필요',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.95, fontSize: 11.5 },
                        );
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '참조: wiki/사업성_검토.md 섹션 7, wiki/내부_BM_의견.md 섹션 4',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '인수 여부와 무관하게 벤치마킹 가능'),
                },
            ],
        },

        // B-2 — 교재 배송을 브랜드 접점으로
        {
            sectionLabel: 'Appendix B — 운영 인사이트',
            pageText: 'B-2',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '교재 배송을 "브랜드 접점"으로 만드는 경험 설계',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '월 1회 반복되는 실물 접점. 패키징·타이밍·개인화가 좋으면 비광고성 구전 유입에 기여 가능.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['구분', '내용'],
                    rows: [
                        ['관찰 사실', '매달 20일 중철 제본 모의고사·교재 정기 배송'],
                        ['관찰 사실', '온라인 강의 외 실물 접점 제공'],
                        ['추정 효과', '"준비 중인 사람" 정체성 신호 제공 가능'],
                        ['확인 필요', '교재 배송이 실제 추천·재등록·만족도에 미치는 영향'],
                    ],
                    colWRatio: [1.5, 4.5],
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 6 },
                },
                {
                    type: 'table',
                    header: ['요소', '현재 방식', '개선·확장 아이디어'],
                    rows: [
                        ['포장', '중철 제본, 정기 발송', '선물형 패키징, 합격선배 메시지카드'],
                        ['타이밍', '매달 20일 정기', '예측 가능한 도착 루틴'],
                        ['개인화', '직렬별 구성', '이름·목표기업·직렬별 맞춤 구성'],
                        ['인증 유도', '별도 장치 확인 필요', '카페·인스타 인증 이벤트'],
                    ],
                    colWRatio: [1.1, 2.0, 2.9],
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 6 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 13, rowSpan: 5 },
                    render: (slide, box) => {
                        addSubheading(slide, '직접 구축 적용 시 주의', { x: box.x, y: box.y, w: box.w, fontSize: 12 });
                        addBulletList(
                            slide,
                            [
                                '물류비, 제작비, 운영 인건비 반영 필요',
                                '초기부터 전면 도입보다 소규모 테스트 권장',
                                '추천 유입 효과는 설문·추천코드·상담로그로 확인 필요',
                            ],
                            { x: box.x, y: box.y + 0.35, w: box.w, h: 0.85, fontSize: 11 },
                        );
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '실물 접점은 비용 반영한 소규모 테스트부터'),
                },
            ],
        },

        // B-3 — 합격 후기를 콘텐츠 자산으로
        {
            sectionLabel: 'Appendix B — 운영 인사이트',
            pageText: 'B-3',
            elements: [
                {
                    type: 'text',
                    style: 'title',
                    text: '합격 후기를 "콘텐츠 자산"으로 만드는 방법',
                    grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'headline',
                    text: '합격자는 가장 강한 신뢰 자산. 후기 생산·동의·배포 프로세스 표준화로 유료광고 외 채널 확보.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        const steps = ['① 합격 확인', '② 동의 확보', '③ 콘텐츠 제작', '④ 채널 배포', '⑤ 커뮤니티화'];
                        const stepH = 0.7;
                        const stepGap = 0.05;
                        steps.forEach((title, i) => {
                            addSectionCard(slide, {
                                x: box.x,
                                y: box.y + i * (stepH + stepGap),
                                w: box.w,
                                h: stepH,
                                kicker: `STEP ${i + 1}`,
                                title,
                                detail: '',
                                titleSize: 12,
                                detailSize: 9.5,
                            });
                        });
                    },
                },
                {
                    type: 'custom',
                    grid: { colStart: 7, colSpan: 6, rowStart: 6, rowSpan: 14 },
                    render: (slide, box) => {
                        addTable(
                            slide,
                            ['단계', '핵심 작업', '확인 필요'],
                            [
                                ['합격 확인', '필기/최종 합격 구분, 기업·직렬 기록', '합격 통지 증빙'],
                                ['동의 확보', '얼굴·이름·학교·기업 공개 범위 확인', '후기 활용 동의서'],
                                ['콘텐츠 제작', '카드뉴스, 블로그 수기, 카페 게시', '템플릿·톤앤매너'],
                                ['채널 배포', '인스타, 블로그, 카페, 홈페이지 동시 활용', '채널별 전환 기여'],
                                ['커뮤니티화', '합격자 멘토링, 기수 관리', '재등록·추천 효과'],
                            ],
                            { x: box.x, y: box.y, w: box.w, colW: [1.3, 3.0, 1.68], rowH: 0.42, fontSize: 9.3, boldCols: [0] },
                        );
                        addSubheading(slide, '벤치마킹 포인트', { x: box.x, y: box.y + 2.75, w: box.w, fontSize: 11.5 });
                        addBulletList(slide, ['합격기업·준비기간·공부방법 템플릿화', '합격자 원장과 마케팅 콘텐츠 기준 통일'], {
                            x: box.x,
                            y: box.y + 3.1,
                            w: box.w,
                            h: 0.5,
                            fontSize: 10,
                        });
                    },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '합격 실적 증빙 없이는 마케팅 표기로만 취급. 개인정보·초상권·후기 활용 동의 필수.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '후기 자산화는 증빙·동의 체계가 전제'),
                },
            ],
        },

        // B-4 — 저비용 구전 유입의 3가지 구조
        {
            sectionLabel: 'Appendix B — 운영 인사이트',
            pageText: 'B-4',
            elements: [
                { type: 'text', style: 'title', text: '저비용 구전 유입의 3가지 구조', grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 2 } },
                {
                    type: 'text',
                    style: 'headline',
                    text: '합격자·교재·커뮤니티가 유료 광고 외 유입 경로로 작동할 가능성. "광고비 없음"이 아닌 "유료 광고 외 구조".',
                    grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
                },
                {
                    type: 'table',
                    header: ['구조', '작동 원리', '시작 조건', '확인 필요'],
                    rows: [
                        ['학교 추천 채널', '교사가 학생에게 추천', '합격실적 축적, 학교관계 형성', '학교별 추천경로·학생수'],
                        ['합격자 기수 문화', '합격 선배가 후배에게 추천', '합격자 커뮤니티 관리', '추천유입 추적, 멘토링 참여율'],
                        ['또래 관찰 효과', '친구가 교재·인증을 보고 관심', '눈에 띄는 교재, 인증이벤트', '상담 시 유입경로 설문'],
                    ],
                    colWRatio: [2.0, 3.5, 3.43, 3.4],
                    grid: { colStart: 1, colSpan: 12, rowStart: 6, rowSpan: 5 },
                },
                {
                    type: 'table',
                    header: ['구조', '적용 아이디어', '주의'],
                    rows: [
                        ['학교 추천', '합격자 발생 학교에 성과 공유, 특강·설명회 제안', '관계관리 비용 반영 필요'],
                        ['합격자 기수 문화', '합격자 멘토링, 기수별 커뮤니티, 추천 프로그램', '개인정보·혜택 조건 명확화'],
                        ['또래 관찰 효과', '교재 패키징, 공부 인증 이벤트, 카페·인스타 연동', '이벤트 비용과 전환율 확인'],
                    ],
                    colWRatio: [2.0, 7.13, 3.2],
                    grid: { colStart: 1, colSpan: 12, rowStart: 12, rowSpan: 5 },
                },
                {
                    type: 'callout',
                    text: '공통 전제: 첫 합격자·신뢰 사례 확보, 합격자 원장·후기 동의 체계, 추천 유입 측정(설문·추천코드·상담로그) 필요',
                    grid: { colStart: 1, colSpan: 12, rowStart: 18, rowSpan: 2 },
                },
                {
                    type: 'text',
                    style: 'caption',
                    text: '최종 인사이트: 저비용 성장은 광고비 절감만으로 설명 어려움 — 합격자·교재·커뮤니티의 기여를 데이터로 확인 필요.',
                    grid: { colStart: 1, colSpan: 12, rowStart: 21, rowSpan: 2 },
                },
                {
                    type: 'custom',
                    grid: { colStart: 1, colSpan: 12, rowStart: 23, rowSpan: 2 },
                    render: (slide) => addKeyMessageBar(slide, '저비용 성장은 데이터로 검증할 구조'),
                },
            ],
        },
    ],
};

const { errors, warnings } = validateSpec(spec);
if (warnings.length) console.warn('[spec] 겹침 감지:', JSON.stringify(warnings, null, 2));
if (errors.length) {
    console.error('[spec] 오류 — 빌드 중단:', JSON.stringify(errors, null, 2));
    process.exit(1);
}

compileToPptx(pptx, spec);

pptx.writeFile({ fileName: OUTPUT_PATH })
    .then(() => console.log('생성 완료:', OUTPUT_PATH))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
