# FootMate v4.0 — Matchday Companion

FootMate는 **내 수준에 맞는 풋살 경기를 찾고, 왜 잘 맞는지 이해하고, 안심하고 참가해 경기 당일까지 이어지는 경험**을 설계한 인터랙티브 서비스 기획 프로젝트입니다.

## Current release

- Release: **v4.0.0 · Matchday Companion**
- Primary journey: **Find → Decide → Join → Play → Return**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → v4.0 Real App
- Verified runtime + public-surface baseline: `130231c935958651e9e2e50e1dbda3df3df978f3`
- GitHub Actions: **FootMate QA #327 · run 35449553358 · PASS**
- Exact Vercel Production: `130231c935958651e9e2e50e1dbda3df3df978f3` · `dpl_69iQCJKfXtC3i8ZwWqKvLjJcfdEh` · **READY** · exact HTTP/Chromium smoke PASS
- Render backup: `130231c935958651e9e2e50e1dbda3df3df978f3` · `dep-dan9ujrtqb8s73abvdjg` · **LIVE**

## Product decisions

v4.0은 화면 수보다 사용자의 결정 비용과 경기 전후 연속성을 우선합니다.

1. **Value before account** — 계정 생성 전에 지역·포지션·레벨을 설정하고 추천 가치를 먼저 확인합니다.
2. **Reason before score** — 계산 점수보다 레벨·거리·남은 포지션처럼 결정에 필요한 이유를 먼저 보여줍니다.
3. **Single decision CTA** — 경기 상세의 참가 행동을 하나의 primary CTA로 고정합니다.
4. **State-aware Matchday** — 참가 전 추천, 참가 후 다가오는 경기, 경기 당일 체크인, 경기 후 평가와 다음 행동으로 이어집니다.
5. **Real / Guided / Evidence separation** — 실제 사용자 화면과 리뷰어 설명·검증 UI를 분리합니다.

## Implemented scope

- Guest-first preferences → recommendation → detail → sign-in → checkout → confirmation
- ID/password sign-in UI, sign-up validation and consent UX
- Kakao · Naver · Apple · Google SSO selection UI
- Selected-match continuity across sign-in and checkout
- Entry-aware detail return navigation
- Persistent matchday check-in completion state
- Responsive 320 / 375 / 390 / 430px
- Real App / Guided / Evidence mode isolation
- 16-section product-first Case Study
- Case Study source-level editorial QA: Korean copy, heading/body text flow, mobile overflow, desktop/mobile review screenshots and axe accessibility gate

## Prototype boundary

FootMate v4.0은 서비스 기획 검증용 인터랙티브 프로토타입입니다. 현재 추천은 규칙·샘플 데이터·세션 상태로 동작하며 **외부 AI 모델, 회원 DB, 실제 OAuth, 실제 PG 결제, 실시간 수용량, 실시간 알림 backend는 연결하지 않았습니다.** 로그인·결제·운영 상태는 서비스 계약을 검증하기 위한 시뮬레이션입니다.

## Architecture

- `src/v4/` — 공식 v4.0 Real App, Case Study, release-hardening ownership
- `app.html` — official Real App entry
- `index.html` — official v4.0 Case Study entry
- `tests/e2e/v40-major.spec.cjs` — browser / responsive / accessibility / state gate
- `tests/e2e/v40-case-study-editorial.spec.cjs` — 16-section editorial / overflow / axe gate
- `tests/production-v40-smoke.cjs` — exact Production HTTP gate
- `tests/e2e/v40-production.spec.cjs` — exact Production Chromium gate

현재 public branch는 v4 소스와 v4 QA 계약만 유지합니다. `/demo`와 `/next`는 과거 제품을 노출하지 않고 v4 Real App으로 연결됩니다. GitHub 저장소가 public인 동안 과거 commit history 자체는 GitHub 특성상 공개 이력으로 남습니다.

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

문서-only merge로 `main` SHA가 이동하더라도 위 **verified runtime + public-surface baseline**과 exact Production SHA는 별도로 유지해 제품 검증 기준과 moving `main`을 구분합니다.
