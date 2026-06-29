---
name: ppt-review
description: "./ppt/images/ 의 슬라이드 이미지를 시각적으로 확인하고 build_*.js 파일을 직접 수정해 PPT 재생성. 이미지 없으면 /ppt-export 먼저 실행 안내."
allowed-tools:
- Read
- Edit
- Glob
- Bash
---

# PPT Review Skill

## 목적
슬라이드 이미지를 시각적으로 확인하고, 사용자 피드백을 반영해
`./ppt/build_*.js` 의 spec을 Edit tool로 직접 수정한 뒤 재실행한다.

## 트리거
- "슬라이드 수정", "PPT 고쳐줘", "이미지 보고 수정"
- `/ppt-review`

---

## 실행 절차

### Step 1: 슬라이드 이미지 확인

Glob으로 `./ppt/images/` 안의 PNG 파일 탐색:
- 패턴 시도 순서: `./ppt/images/*.png` → `./ppt/images/**/*.png`

각 PNG 파일을 Read tool로 읽어 시각적으로 확인한다.

**이미지가 없으면:**
> `./ppt/images/` 안에 슬라이드 이미지가 없습니다. 먼저 `/ppt-export` 스킬을 실행해 PPTX를 PNG로 변환하세요.

### Step 2: 수정 사항 파악

이미지를 보며 각 슬라이드의 현재 상태를 파악한다.
사용자에게 어떤 슬라이드의 무엇을 바꿀지 확인한다:
- 텍스트 수정 (제목, 내용, 캡션 등)
- 슬라이드 추가 또는 삭제
- 레이아웃 변경 (grid 좌표, colSpan, rowSpan)
- 데이터 업데이트 (표, 지표 수치 등)

### Step 3: build 파일 직접 수정

Glob으로 `./ppt/build_*.js` 탐색 → 해당 파일을 Edit tool로 직접 수정한다.

수정 시 주의:
- `validateSpec` / `compileToPptx` 호출 구조는 건드리지 않음
- `spec.slides` 배열의 해당 슬라이드 elements 안에서 값만 수정
- 그리드 규칙 준수: `colStart+colSpan-1 <= 12`, `rowStart+rowSpan-1 <= 24`
- `addKeyMessageBar` 텍스트는 52자 이내

### Step 4: 재실행

```bash
node ./ppt/build_<name>.js
```

에러 없이 `저장 완료:` 메시지가 나오면 성공.

### Step 5: 선택적 재확인

사용자가 결과를 이미지로 다시 확인하고 싶으면 ppt-export 재실행을 안내한다:

```bash
# Python 환경 확인 후 실행 (ppt-export 스킬 참조)
<PYTHON> ./ppt/export_slides_to_image.py "./ppt/<name>.pptx" "./ppt/images"
```

그 후 이미지를 다시 Read해서 수정 결과를 확인한다.
추가 수정이 필요하면 Step 2~5를 반복한다.
