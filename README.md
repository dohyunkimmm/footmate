# FootMate v5.1.0 — AI Match Assistant

FootMate는 **내 수준에 맞는 풋살 경기를 자연어로 찾고, 추천 이유를 확인한 뒤 참가·결제·경기 당일 운영·경기 후 피드백까지 이어지는 경험**을 검증하는 인터랙티브 서비스 기획 프로젝트입니다.

v5.1은 v5.0의 recommendation / participation / matchday / return domain ownership과 connected-capable architecture를 유지하면서 **실제 Vercel AI Gateway inference를 사용하는 AI Match Assistant**를 추가했습니다. AI는 사용자의 자연어 요청을 검색 조건으로 해석하고, 실제 경기 후보·순위·추천 이유는 기존 deterministic recommendation engine이 계속 소유합니다.

## Current release

- Release: **v5.1.0 · AI Match Assistant**
- Primary journey: **Find → Decide → Join → Play → Return**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → current Real App
- Product/runtime baseline: `7d0ee9307ba952e386c97b14c185fa24ebb38ed1`
- Feature PR: **#118**
- Production fixes: **#119 · #120 · #121**
- Post-merge QA: **FootMate QA #435 · run 35504620675 · PASS**
- Exact Vercel Production: `7d0ee9307ba952e386c97b14c185fa24ebb38ed1` · `dpl_4FChZeQLWWgPdcUBdG6uSZVExQrV` · **READY**
- Exact Production gates: **HTTP PASS · AI inference PASS · Chromium PASS**
- Render backup: `7d0ee9307ba952e386c97b14c185fa24ebb38ed1` · `dep-danr55p7lnhs73edu80g` · **LIVE** at verification time
- Architecture contract: `docs/V5.1-AI-MATCH-ASSISTANT.md`

## Product decisions

1. **AI interprets, deterministic engine ranks** — AI는 자연어를 조건으로 변환하고 실제 경기 후보·순위·추천 이유는 기존 recommendation engine이 결정합니다.
2. **Reason before score** — 내부 적합도는 정렬에 사용하되 생활권·레벨·포지션처럼 사용자가 판단할 수 있는 이유를 먼저 보여줍니다.
3. **Graceful fallback** — AI Gateway provider가 실패하면 server-side provider fallback을 시도하고, 최종 실패 시 browser rules fallback으로 전환합니다.
4. **HITL for irreversible actions** — AI는 경기 탐색을 돕지만 참가와 결제를 자동 실행하지 않습니다.
5. **Recoverable participation** — `checkout → pending → success | failure | canceled` 상태와 retry·status check·reload recovery를 유지합니다.
6. **State-aware Matchday** — 참가 후 `upcoming → matchday → checked-in`과 late·update·cancel recovery를 분리합니다.
7. **Cross-domain consistency** — 선택 경기 → 참가 성공 → 경기 당일 체크인 → Return의 match identity와 상태 전이를 guardrail로 검증합니다.
8. **Connected only when verified** — 실제 Production inference와 exact deployment 검증을 통과한 기능만 connected capability로 표현합니다.

## AI Agent Workflow

`Context → Plan → Tools → Guardrail → Observe`

- **Context** — 현재 region / position / level browser state와 사용자의 자연어 요청
- **Plan** — 지역·포지션·레벨·최대 가격·최대 이동 시간·시작 시간 조건으로 구조화
- **Tools** — Vercel AI Gateway + 기존 deterministic recommendation ranking + sample match catalog
- **Guardrail** — AI가 경기 ID·가격·잔여 자리·주소·순위를 생성하지 못하도록 allowlist/range validation 적용, join/payment는 HITL 유지
- **Observe** — `connected-ai` / `rules-fallback`, 실제 사용 model, 마지막 검색 조건을 추적

## Implemented scope

- 자연어 경기 탐색 → structured constraints
- AI connected response + provider fallback + browser rules fallback
- region / position / level / price / distance / time 조건 해석
- 기존 deterministic recommendation을 실제 ranking Source of Truth로 유지
- AI 추천 결과에서 경기 상세로 연결
- guest-first recommendation → discovery → decision → sign-in → checkout → Matchday → Return
- browser persistence와 기존 session schema v2 compatibility 유지
- recommendation / participation / matchday / return domain contracts 및 cross-domain consistency validation
- auth / payment / capacity / notification provider registry는 기존 mock boundary 유지
- 16-section Case Study에 AI Agent Workflow / provider boundary / Production verification 반영
- responsive 320 / 375 / 390 / 430px, Browser E2E + axe, recovery regression, exact Production HTTP/AI/Chromium gates

## Production / integration boundary

현재 Production에서 **AI Match Assistant의 실제 Vercel AI Gateway inference가 검증되었습니다.** server-side `/api/ai-match-assistant`가 자연어를 구조화된 검색 조건으로 변환하고, 결과 경기의 사실·순위는 browser runtime의 현재 sample records와 deterministic recommendation engine을 사용합니다.

- AI Gateway: **connected and exact Production inference verified**
- primary model: `openai/gpt-5.4-mini`
- provider fallback model: `inclusionai/ling-3.0-flash-vl-free`
- auth: Vercel deployment OIDC 또는 configured AI Gateway credential
- auth / payment / capacity / notification: **deterministic mock**
- match catalog / capacity / participant composition: **sample records**
- persistence: **browser local state**
- member DB / cross-device sync / real OAuth / real PG / realtime capacity backend / actual notification delivery / external analytics: **미연동**

## Architecture

- `api/ai-match-assistant.js` — Vercel AI Gateway boundary, OIDC, structured constraint extraction, provider fallback, validation
- `src/v5/ai-match-assistant.js` — AI assistant UI/application bridge, deterministic ranking handoff, browser fallback/state
- `src/v5/ai-match-assistant.css` — AI assistant responsive/accessibility presentation
- `src/v5/domain/recommendation.js` — recommendation ownership and normalization
- `src/v5/domain/participation.js` — participation state ownership
- `src/v5/domain/matchday.js` — matchday state ownership
- `src/v5/domain/return.js` — postgame return ownership
- `src/v5/domain/journey.js` — Find → Decide → Join → Play → Return consistency guardrail
- `src/v5/infrastructure/providers.js` — auth/payment/capacity/notification provider registry
- `docs/V5.1-AI-MATCH-ASSISTANT.md` — AI architecture, fallback, HITL and acceptance contract
- `tests/contracts/v5.1-ai-assistant.contract.cjs` — AI provider/guardrail contract
- `tests/e2e/v5.1-ai-assistant.spec.cjs` — AI connected/fallback/responsive/axe gates
- `tests/production-v5.1-ai.cjs` — exact Production AI inference gate
- `tests/production-v5.1-smoke.cjs`, `tests/e2e/v5.1-production.spec.cjs` — exact Production HTTP/Chromium gates
- `src/v4/` — verified compatibility runtime, persistence, event and UX layer

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

문서-only merge로 `main` SHA가 이동하더라도 **product/runtime baseline과 exact verified Production SHA `7d0ee9307ba952e386c97b14c185fa24ebb38ed1`**은 별도로 유지합니다.
