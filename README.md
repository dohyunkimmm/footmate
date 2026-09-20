# FootMate v5.1.1 — AI Match Assistant Resilience Patch

FootMate는 **내 수준에 맞는 풋살 경기를 자연어로 찾고, 추천 이유를 확인한 뒤 참가·결제·경기 당일 운영·경기 후 피드백까지 이어지는 경험**을 검증하는 인터랙티브 서비스 기획 프로젝트입니다.

v5.1.1은 v5.1 AI Match Assistant의 사용자 흐름과 deterministic recommendation ownership을 유지하면서 **AI provider 안정성, bounded timeout, reload state consistency, 요청 비용 보호, 제품 사실 정확성**을 보강한 verified patch입니다. AI는 검색 조건만 해석하고 실제 경기 후보·순위·추천 이유는 기존 recommendation engine이 계속 소유합니다.

## Current release

- Release: **v5.1.1 · AI Match Assistant Resilience Patch**
- Primary journey: **Find → Decide → Join → Play → Return**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → current Real App
- Product/runtime baseline: **`2417cf83c48c8326a1c54069fd81c97931d1e93f`**
- Version sync PR: **#125**
- Hotfix implementation PRs: **#123 · #124**
- Post-merge QA: **FootMate QA #443 · run `35508056753` · PASS**
- Regression 36: **PASS**
- Browser E2E + axe: **PASS**
- Exact Vercel Production: **`dpl_2FcWRe6d2aecf6fu2SGdY6H2Fyrr` · SHA `2417cf83c48c8326a1c54069fd81c97931d1e93f` · READY**
- Exact Production HTTP smoke: **PASS**
- Exact Production AI inference: **PASS · `inclusionai/ling-3.0-flash-vl-free` · `fallbackUsed=false`**
- Exact Production Chromium smoke: **PASS · 2/2**
- Vercel runtime warning/error/fatal logs at verification time: **none observed**
- Render backup: **`dep-dans7u7lk1mc73fjst2g` · SHA `2417cf83c48c8326a1c54069fd81c97931d1e93f` · LIVE**
- Patch contract: `docs/V5.1.1-AI-RESILIENCE-PATCH.md`
- Historical AI architecture contract: `docs/V5.1-AI-MATCH-ASSISTANT.md`

## Patch scope

1. **Stable AI primary path** — 이전 Production에서 primary가 403 후 fallback으로 동작하던 경로를 정리하고, 실제 Production에서 검증한 `inclusionai/ling-3.0-flash-vl-free`를 기본 primary로 사용합니다. `inclusionai/ling-3.0-flash-fin-free`는 한 번의 provider fallback candidate로 둡니다.
2. **Bounded recovery** — server-side Gateway 요청은 provider당 3초로 제한하고 browser 요청은 7초 후 abort하여 rules fallback으로 복구합니다. Vercel Function `maxDuration`은 10초로 제한합니다.
3. **Request abuse guard** — POST는 same-origin / Fetch Metadata / JSON content-type 검사를 통과해야 하며 IP + instance window rate guard와 explicit 429 `Retry-After`를 적용합니다.
4. **Reload State Consistency** — 기존 `footmate:v5.1:ai` storage key를 compatibility boundary로 유지하면서 저장된 `connected-ai` / `rules-fallback` mode를 reload 후 runtime과 UI에 함께 복원합니다.
5. **Product fact correction** — 현재 recommendation이 사용하지 않는 ELO 설명을 제거하고, 지원하지 않는 날짜 intent인 “오늘”을 AI 검색 예시에서 제거합니다.

## Product decisions

- **AI interprets, deterministic engine ranks** — AI는 자연어를 조건으로 변환하고 실제 경기 후보·순위·추천 이유는 기존 recommendation engine이 결정합니다.
- **Graceful fallback** — primary provider → one bounded provider fallback → browser rules fallback 순서로 복구합니다.
- **HITL for irreversible actions** — AI는 경기 탐색을 돕지만 참가와 결제를 자동 실행하지 않습니다.
- **Compatibility first** — recommendation / participation / matchday / return domain ownership, browser persistence, session schema, 16-section Case Study IA를 유지합니다.

## AI Agent Workflow

`Context → Plan → Tools → Guardrail → Observe`

- **Context** — 현재 region / position / level browser state와 사용자의 자연어 요청
- **Plan** — 지역·포지션·레벨·최대 가격·최대 이동 시간·시작 시간 조건으로 구조화
- **Tools** — Vercel AI Gateway + 기존 deterministic recommendation ranking + sample match catalog
- **Guardrail** — AI가 경기 ID·가격·잔여 자리·주소·순위·날짜를 생성하지 못하도록 allowlist/range validation 적용, join/payment는 HITL 유지
- **Observe** — `connected-ai` / `rules-fallback`, 실제 사용 model, `fallbackUsed`, 마지막 검색 조건을 추적

## Production / integration boundary

v5.1.1의 connected AI path는 exact Vercel Production에서 검증됐습니다. 다만 실제 경기 데이터와 다른 provider boundary는 아래와 같이 구분합니다.

- AI Gateway: **connected + exact Production verified**
- primary model: `inclusionai/ling-3.0-flash-vl-free`
- provider fallback candidate: `inclusionai/ling-3.0-flash-fin-free`
- reasoning: constraint extraction은 `reasoning.effort = none`
- auth: Vercel deployment OIDC 또는 configured AI Gateway credential
- auth / payment / capacity / notification: **deterministic mock**
- match catalog / capacity / participant composition: **sample records**
- persistence: **browser local state**
- member DB / cross-device sync / real OAuth / real PG / realtime capacity backend / actual notification delivery / external analytics: **미연동**
- Render는 static backup / alternate deployment이며 Vercel serverless AI inference parity를 의미하지 않습니다.

## Architecture

- `api/ai-match-assistant.js` — AI Gateway, OIDC, provider fallback, request/time/cost guardrails
- `src/v5/ai-match-assistant.js` — AI UI/application bridge, browser timeout/fallback, reload mode restoration
- `src/v5/domain/journey.js` — Find → Decide → Join → Play → Return consistency guardrail
- `src/v5/infrastructure/providers.js` — auth/payment/capacity/notification provider registry
- `src/v4/recommendation.js` — deterministic ranking Source of Truth
- `src/v4/data.js` — current sample match records and user-visible recommendation reasons
- `tests/contracts/v5.1-ai-assistant.contract.cjs` — AI request/provider/guardrail contract
- `tests/e2e/v5.1-ai-assistant.spec.cjs` — AI connected/fallback/timeout/reload/responsive/axe gates
- `tests/production-v5.1-ai.cjs` — exact Production primary-model + no-fallback inference gate

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

Docs-only merge로 이후 `main` SHA가 이동하더라도 v5.1.1 product/runtime baseline과 exact verified Production SHA는 `2417cf83c48c8326a1c54069fd81c97931d1e93f`로 별도 유지합니다.
