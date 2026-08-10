# ky-image-generator

(주)아이비김영 재직자용 이미지 생성 MCP 도구. 텍스트 프롬프트(+참조 이미지)를 받아 Gemini로 이미지를 생성하고, 결과를 Google Drive에 업로드해 파일 ID와 미리보기 링크를 반환한다.

이 플러그인은 스킬 없이 MCP 서버 연결만 제공한다 — 설치하면 `ky-image-generator` MCP 서버가 등록되고, `generate_image` 툴을 대화 중에 바로 호출할 수 있다.

## 사전 준비

(주)아이비김영 재직자만 사용 가능하다. Claude Code, Codex CLI 둘 다 OAuth(사내 이메일 인증)를 쓴다 — 로그인을 트리거하는 방식만 다르다.

## 설치

### Claude Code

```
/plugin marketplace update ky-marketplace
/plugin install ky-image-generator@ky-marketplace
```

별도 사전 설정이 필요 없다. 설치 후 `generate_image` 툴을 처음 호출하면 브라우저가 열리고, 사내 이메일로 받은 인증번호(OTP)를 입력하면 연결된다. 로그인은 15분 access token / 30일 refresh token으로 유지되며, 만료되면 다시 이메일 인증을 거친다.

설치 없이 바로 테스트:

```bash
claude --plugin-dir ./ky-image-generator
```

### Codex CLI

```bash
codex plugin marketplace upgrade ky-marketplace
codex plugin add ky-image-generator@ky-marketplace
```

Codex CLI는 Claude Code와 달리 첫 툴 호출에서 자동으로 로그인 창이 뜨지 않는다 — 설치 후 아래 명령을 직접 한 번 실행해야 한다:

```bash
codex mcp login ky-image-generator
```

브라우저가 열리면 사내 이메일로 받은 인증번호(OTP)를 입력한다. 로그인 세션이 만료되면 같은 명령을 다시 실행한다.

## 사용법

설치 후 대화 중에 원하는 이미지를 설명하면 `generate_image` 툴이 호출된다. 입력 가능한 옵션:

- `prompt` (필수) — 생성할 이미지 설명
- `model` — `gemini-3.1-flash-lite-image` / `gemini-3.1-flash-image`(기본) / `gemini-3-pro-image`
- `aspect_ratio` — `AUTO`(기본) / `1:1` / `2:3` / `3:2` / `3:4` / `4:3` / `9:16` / `16:9` / `21:9`
- `image_size` — `1K`(기본) / `2K` / `4K`
- `image_input_list` — 참조 이미지 URL 또는 data URL (최대 8개)

결과는 Google Drive 파일 ID, 미리보기 링크(`preview`), 뷰 링크(`webViewLink`)를 포함한 형태로 반환된다.

## 문제 해결

- 인증 오류가 나거나 로그인이 안 되면 재직 여부(퇴사자는 로그인해도 차단됨)를 우선 확인한다.
- **Claude Code**: 브라우저 로그인이 안 뜨면 `/mcp`로 재연결해본다.
- **Codex CLI**: "not logged in" 오류가 나면 `codex mcp login ky-image-generator`를 다시 실행한다.
