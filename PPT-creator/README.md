# PPT-creator

12×24 그리드 기반 PPTX 생성·이미지 내보내기·슬라이드 수정을 지원하는 Claude Code 플러그인.

## 스킬

| 스킬 | 설명 |
|------|------|
| `ppt-create` | 12×24 그리드 엔진 기반 PPTX 생성. `pptxgenjs` 설치 확인부터 build 스크립트 생성·실행까지 처리 |
| `ppt-export` | PPTX의 각 슬라이드를 PNG 이미지로 내보내기 (Windows 전용, PowerPoint COM 자동화) |
| `ppt-review` | 내보낸 슬라이드 이미지를 확인하고 build 스크립트를 직접 수정해 재생성 |

## 설치

```
# 마켓플레이스에서 설치
/plugin install PPT-creator@ky-marketplace

# 또는 즉시 테스트 (설치 없이)
claude --plugin-dir ./PPT-creator
```

## 요구사항

- Node.js + `pptxgenjs`
- `ppt-export`는 Windows + PowerPoint 필요 (COM 자동화)

## 라이선스

MIT © eject80
