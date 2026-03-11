# plugin-creator

Claude Code 플러그인을 올바른 구조로 자동 생성해주는 skill 플러그인.

## 기능

- `plugin.json`, `marketplace.json` 자동 생성
- Skills / Commands / Agents / Hooks / MCP 구조 지원
- 공식 스펙에 맞는 파일 구조 검증
- 로컬 설치 및 업데이트 가이드 제공

## 설치

```bash
# 마켓플레이스 등록 (절대 경로 사용)
/plugin marketplace add /절대/경로/plugin-creator

# 설치
/plugin install plugin-creator@plugin-creator
```

## 사용법

Claude Code 대화에서 다음과 같이 말하면 자동으로 활성화됩니다:

- "플러그인 만들어줘"
- "새 플러그인 생성해줘"
- "scaffold plugin"
- "플러그인 템플릿"

## 업데이트

```bash
/plugin marketplace update plugin-creator
/plugin update plugin-creator@plugin-creator
```

## 라이선스

MIT
