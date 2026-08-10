# ky-image-generator

(주)아이비김영 재직자용 이미지 생성 MCP 도구. 텍스트 프롬프트(+참조 이미지)를 받아 Gemini로 이미지를 생성하고, 결과를 Google Drive에 업로드해 파일 ID와 미리보기 링크를 반환한다.

이 플러그인은 스킬 없이 MCP 서버 연결만 제공한다 — 설치하면 `ky-image-generator` MCP 서버가 등록되고, `generate_image` 툴을 대화 중에 바로 호출할 수 있다.

## 사전 준비

- (주)아이비김영 재직자만 사용 가능하다.
- kimyoung.co.kr 관리자 페이지의 "API Key 관리"에서 본인 명의 API 키를 발급받는다.
- 발급받은 키를 환경변수 `KY_IMAGE_GENERATOR_API_KEY`로 설정한다 (플러그인 설치 **전에** 설정해야 한다):

```bash
# macOS / Linux
export KY_IMAGE_GENERATOR_API_KEY="발급받은키"
```

```powershell
# Windows PowerShell
$env:KY_IMAGE_GENERATOR_API_KEY = "발급받은키"
```

키를 계속 쓰려면 셸 프로필(`.zshrc`/`.bashrc`/PowerShell 프로필 등)에 등록해둔다.

## 설치

### Claude Code

```
/plugin marketplace update ky-marketplace
/plugin install ky-image-generator@ky-marketplace
```

설치 없이 바로 테스트:

```bash
claude --plugin-dir ./ky-image-generator
```

### Codex CLI

```bash
codex plugin marketplace upgrade ky-marketplace
codex plugin add ky-image-generator@ky-marketplace
```

## 사용법

설치 후 대화 중에 원하는 이미지를 설명하면 `generate_image` 툴이 호출된다. 입력 가능한 옵션:

- `prompt` (필수) — 생성할 이미지 설명
- `model` — `gemini-3.1-flash-lite-image` / `gemini-3.1-flash-image`(기본) / `gemini-3-pro-image`
- `aspect_ratio` — `AUTO`(기본) / `1:1` / `2:3` / `3:2` / `3:4` / `4:3` / `9:16` / `16:9` / `21:9`
- `image_size` — `1K`(기본) / `2K` / `4K`
- `image_input_list` — 참조 이미지 URL 또는 data URL (최대 8개)

결과는 Google Drive 파일 ID, 미리보기 링크(`preview`), 뷰 링크(`webViewLink`)를 포함한 형태로 반환된다.

## 문제 해결

- 툴 호출 시 인증 오류가 나면 `KY_IMAGE_GENERATOR_API_KEY` 환경변수가 제대로 설정됐는지, 키가 만료되지 않았는지 kimyoung.co.kr 관리자 페이지에서 확인한다.
