# FootMate v4.0 — Matchday Companion

FootMate는 **내 수준에 맞는 풋살 경기를 찾고, 왜 잘 맞는지 이해하고, 안심하고 참가해 경기 당일까지 이어지는 경험**을 설계한 인터랙티브 서비스 기획 프로젝트입니다.

## Current release

- Release: **v4.0.0 · Matchday Companion**
- Primary user journey: **Find → Decide → Join → Play → Return**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → v4.0 Real App surface
- Current GitHub main: promoted after PR merge
- Exact Vercel Production verification: **Not yet verified**
- Render backup verification: **Not yet verified**

## Product decisions

v4.0은 화면 수나 기능 수보다 사용자의 결정 비용과 경기 전후 연속성을 우선합니다.

1. **Value before account** — 계정 생성 전에 지역·포지션·레벨을 설정하고 추천 가치를 먼저 확인합니다.
2. **Reason before score** — 추천 카드에서 계산 점수보다 레벨·거리·남은 포지션처럼 결정에 필요한 이유를 먼저 보여줍니다.
3. **Single decision CTA** — 경기 상세에서 정보 우선순위를 정리하고 참가 행동을 하나의 primary CTA로 고정합니다.
4. **State-aware Matchday** — 참가 전에는 추천, 참가 후에는 다가오는 경기, 경기 당일에는 체크인, 경기 후에는 평가와 다음 행동이 홈의 중심이 됩니다.
5. **Real / Guided / Evidence separation** — 실제 사용자 화면과 리뷰어 설명·상태 검증 UI를 분리합니다.

## Implemented scope

- Guest-first preferences → recommendation → detail → sign-in → checkout → confirmation flow
- ID/password sign-in UI, sign-up validation and consent UX
- Kakao · Naver · Apple · Google SSO selection UI
- Selected-match continuity across sign-in and checkout
- Detail return navigation based on entry surface
- Persistent matchday check-in completion state
- Responsive experience at 320 / 375 / 390 / 430px
- Real App / Guided / Evidence mode isolation
- 16-section product-first Case Study

## Prototype boundary

FootMate v4.0은 서비스 기획 검증용 인터랙티브 프로토타입입니다. 현재 추천은 규칙·샘플 데이터·세션 상태로 동작하며 **외부 AI 모델, 회원 DB, 실제 OAuth, 실제 PG 결제, 실시간 수용량, 실시간 알림 backend는 연결하지 않았습니다.** UI에서 제공하는 로그인·결제·운영 상태는 해당 서비스 계약을 검증하기 위한 시뮬레이션 범위입니다.

## Architecture

- `src/v4/` — v4.0 Real App, Case Study, release-hardening ownership
- `src/v2/domain/` — Matching / ELO domain logic의 historical regression reference
- `app.html` — official Real App entry
- `index.html` — official v4.0 Case Study entry
- `tests/e2e/v40-major.spec.cjs` — v4.0 browser / responsive / accessibility / state gate
- `tests/production-v40-smoke.cjs` — exact Production HTTP gate
- `tests/e2e/v40-production.spec.cjs` — exact Production Chromium gate

Pre-v4 구현은 현재 제품·Case Study·문서의 공개 동선에서 제거하고 회귀 이력으로만 취급합니다. GitHub의 과거 commit history는 저장소 특성상 별도 파일 단위 비공개화 대상이 아닙니다.

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

Production verification 전에는 release state를 완료로 기록하지 않습니다.
