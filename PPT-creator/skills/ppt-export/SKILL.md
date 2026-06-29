---
name: ppt-export
description: "PPTX 파일의 각 슬라이드를 PNG 이미지로 내보내기. Windows 전용 (PowerPoint COM 자동화). Python 환경 자동 탐지 (.venv → 글로벌), comtypes 설치 확인 포함."
allowed-tools:
- Read
- Write
- Glob
- Bash
---

# PPT Export Skill

## 목적
PPTX 파일의 슬라이드를 `./ppt/images/` 폴더에 PNG로 내보낸다.
PowerPoint COM 자동화를 사용하므로 **Windows + Microsoft PowerPoint 설치 필수**.

## 트리거
- "PPT 이미지로 변환", "슬라이드 PNG 추출", "이미지 내보내기"
- `/ppt-export`

---

## 실행 절차

### Step 1: Python 환경 탐지

아래 순서대로 시도해 처음 성공하는 것을 사용한다.

```bash
# 1. .venv (Windows + uv/venv)
.venv/Scripts/python.exe --version 2>/dev/null

# 2. .venv (Unix/Mac + uv/venv)
.venv/bin/python --version 2>/dev/null

# 3. python3 글로벌
python3 --version 2>/dev/null

# 4. python 글로벌 fallback
python --version 2>/dev/null
```

성공한 첫 번째 경로를 `<PYTHON>` 변수로 기억한다.

### Step 2: comtypes 확인 및 설치

```bash
<PYTHON> -c "import comtypes; print('ok')"
```

실패하면, **환경에 맞는 방법**으로 설치한다:

| 환경 | 판단 조건 | 설치 명령 |
|------|-----------|-----------|
| uv 프로젝트 | `uv` 사용 가능 + `pyproject.toml` 존재 | `uv add comtypes` |
| uv venv만 | `uv` 사용 가능 + `.venv` 존재, `pyproject.toml` 없음 | `uv pip install comtypes` |
| 일반 pip | uv 미사용 또는 글로벌 Python | `<PYTHON> -m pip install comtypes` |

판단 순서:
1. `uv --version` 실행 가능 여부 확인
2. uv 있음 + `pyproject.toml` 존재 → `uv add comtypes`
3. uv 있음 + `.venv` 존재 → `uv pip install comtypes`
4. 그 외 → `<PYTHON> -m pip install comtypes`

### Step 3: export 스크립트 복사 (이미 있으면 skip)

`./ppt/export_slides_to_image.py` 가 없으면 플러그인에서 복사:

Glob으로 탐색: `**/PPT-creator/skills/ppt-creator/scripts/export_slides_to_image.py`

Read로 읽어 `./ppt/export_slides_to_image.py` 에 Write.

### Step 4: PPTX 파일 확인

Glob으로 `./ppt/*.pptx` 탐색:
- 1개면 바로 사용
- 여러 개면 사용자에게 선택 요청
- 없으면 사용자에게 PPTX 경로 입력 요청

### Step 5: 이미지 출력 디렉토리 준비

```bash
mkdir -p ./ppt/images
```

### Step 6: 실행

```bash
<PYTHON> ./ppt/export_slides_to_image.py "<PPTX_PATH>" "./ppt/images"
```

실행 중 PowerPoint 창이 잠깐 열렸다 닫힐 수 있음 (정상 동작).

### Step 7: 결과 보고

`./ppt/images/` 안의 PNG 파일 목록을 Glob으로 확인해 보고한다.
이미지 확인·수정이 필요하면 `/ppt-review` 스킬 사용 안내.

---

## 주의사항

- **Windows 전용**: PowerPoint COM 자동화는 Windows + Microsoft PowerPoint 필수
- macOS/Linux 환경에서는 이 스킬을 사용할 수 없음 (LibreOffice 등 대안 미지원)
- 내보내기 완료까지 수초~수십 초 소요 (슬라이드 수에 비례)
- 출력 파일명 패턴: PowerPoint 버전에 따라 `Slide1.png`, `슬라이드1.png` 등 다를 수 있음
