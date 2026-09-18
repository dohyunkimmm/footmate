# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release · v2.5.0

**v2.5.0 · Decision & Recovery Experience**

v2.5는 v2.4 Core Funnel Experience를 회귀 기준으로 유지하면서, 추천·참가·결제 흐름에 deterministic decision/guardrail layer를 추가해 **다음 행동 → 사전 확인 → 실행 차단 → inline recovery → trace**가 한 흐름에서 이해되는 UI/IX로 고도화한 릴리스입니다.

- product/runtime baseline: `0e7c40c` · PR #63
- exact verified Production SHA: `0e7c40c2d997798dbf71f74fef8f91055cca7abe`
- Release runtime: `2.5.0`
- Storage / schema / Product Hardening event contract: `2.1.0` 호환 유지
- v2.2 / v2.3 / v2.4 runtime alias/event: 호환 유지
- Regression baseline: Product / Portfolio mode · 39 screens · 16-slide Case Study
- Matching / ELO ownership: `src/v2/domain/`
- Decision / Recovery ownership: `src/v2/domain/decision-engine.js`
- v2.5 release gate: **CLOSED**

### v2.5 UI / IX / architecture

- Home: 현재 상태에 맞는 **다음 행동**을 우선 제시
- Filter: 조건 변경에 따른 후보 수·영향을 즉시 안내
- Results: 상위 추천 후보의 매칭률 · ELO · 플레이 조건 · 거리 점수를 같은 기준으로 비교
- Detail / Recommendation Reason: 참가 전 **preflight**와 decision trace 제공
- Payment: 정원 · 추천 적합 · 크레딧 · 중복 참가 상태를 확인하고 실제 차단 조건이면 결제 CTA 비활성화
- Recovery: 정원 마감 → 대기 등록, 저잔액 → 충전, 결제 실패 → 재시도, 조건 불일치 → 다른 후보/필터로 inline recovery
- decision engine: `src/v2/domain/decision-engine.js`
- component ownership: `src/v2/demo/decision-recovery-components.js`
- interaction ownership: `src/v2/ui/decision-recovery-experience.js`
- visual ownership: `src/v2/styles/decision-recovery.css`
- v2.4 core funnel은 compatibility/regr layer로 유지
- legacy `demo-source.html`에 v2.5 component markup이 재유입되지 않도록 CI boundary gate 유지
- 실제 서버 정원/결제/DB/LLM 연동은 하지 않으며 현재 프로토타입 세션 상태 기준으로 decision을 계산

### QA / deployment state

- PR #63 final QA run #186:
  - Regression 36 **PASS**
  - v2.4 component/source boundary **PASS**
  - v2.5 decision/recovery boundary **PASS**
  - Browser E2E + axe · responsive · v2.5 UI/IX gate **PASS**
- exact Production verification main run #187:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**
- exact v2.5 Vercel Production:
  - SHA `0e7c40c2d997798dbf71f74fef8f91055cca7abe`
  - deployment `dpl_4rjLPCjoNVbLAbRB8rjcbqyUYXcj`
  - state **READY**
- Render exact release deployment:
  - SHA `0e7c40c2d997798dbf71f74fef8f91055cca7abe`
  - deployment `dep-dams4bjrjlhs738c7fq0`
  - state **live**

## ✨ Key Features

- 5개 사용자 입력 기반 동적 ELO 계산
- 날짜 · 지역 · 시간대 · 거리 · 경기 방식 · 모집 포지션 기반 후보 eligibility
- ELO · 플레이 조건 · 위치 기반 매칭 점수와 추천 정렬
- 추천 점수 분해, 제외 이유, 필터 완화 fallback, 조건 변경 전/후 비교
- Home → Filter → Results → Detail → Payment core funnel
- 추천 후보 comparison · 참가 전 preflight · decision trace
- Payment · Participation · Match 상태 머신 기반 운영 시뮬레이션
- 결제 실패/재시도 · 중복 신청 차단 · 취소/환불 · 노쇼 · 대기→빈자리 제안→참가 · 경기 취소
- 결제/참가 전 guardrail과 inline recovery
- 경기 결과 ELO 업데이트와 다음 추천 반영
- 브라우저 재진입 시 핵심 진행 상태와 사용자 선택 복원
- AI Agent Workflow 및 데이터 품질 상태(`PASS` · `CHECK` · `SAMPLE`)
- 이벤트 계약과 핵심 퍼널/KPI 관측
- 접근 가능한 Product Validation Inspector
- Case Study의 `Problem → Hypothesis → Design → Validation → Result` 구조

## 🧩 Runtime Structure

### v2.5 ownership

- `src/v2/bootstrap.js` — runtime composition root · release `2.5.0`
- `src/v2/domain/matching-engine.js` — matching domain engine
- `src/v2/domain/elo-engine.js` — ELO domain engine
- `src/v2/domain/decision-engine.js` — deterministic decision / guardrail / trace engine
- `src/v2/state/product-store.js` — persisted product state
- `src/v2/state/scenario-store.js` — domain-derived scenario state
- `src/v2/state/scenario-persistence.js` — canonical scenario persistence
- `src/v2/compat/scenario-persistence-bridge.js` — guarded legacy hydration bridge
- `src/v2/demo/core-funnel-components.js` — v2.4 core funnel compatibility components
- `src/v2/demo/decision-recovery-components.js` — v2.5 decision/recovery components
- `src/v2/ui/scenario-presenter.js` — Filter / Results / Recommendation Reason / Detail presentation
- `src/v2/ui/decision-recovery-experience.js` — v2.5 UI/IX action/recovery orchestration
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation + decision guard adapter
- `src/v2/ui/home-controller.js` / `filter-results-controller.js` / `secondary-controller.js` — product interaction adapters
- `src/v2/ui/product-inspector.js` — Product Validation Inspector UI ownership
- `src/v2/styles/decision-recovery.css` — v2.5 visual ownership
- `src/v2/styles/core-funnel.css` — v2.4 core funnel compatibility visual layer
- `src/v2/styles/experience.css` — Product Experience canonical visual layer
- `src/v2/styles/compatibility-patches.css` / `compatibility-finalize.css` — compatibility visual ownership
- `src/v2/styles/product-inspector.css` — Inspector component styles
- `src/v2/styles/tokens.css` / `app.css` — design token / mode layer

### Compatibility boundary

- `footmate-core.js` — 저수준 score/filter/credit/data-quality core
- `footmate-product-core.js` — 상태 머신·추천 설명·이벤트/KPI core
- `footmate-patches.js` — 일부 기존 DOM/persistence compatibility; matching/ELO는 domain engine에 위임
- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-product-hardening.js` — policy/state/analytics adapter + Inspector UI bridge
- legacy CSS entry files — canonical `src/v2/styles/`를 가리키는 compatibility alias

## 🔭 Next Architecture Candidates

- 큰 `demo-source.html`의 build-time source/component 분리 확대
- `footmate-patches.js`에 남은 DOM/persistence compatibility ownership 추가 축소
- decision trace의 서버 영속 저장/실제 freshness·capacity 확인은 실제 백엔드 연동 단계에서 구현
- required status check key `Regression 36` rename은 repository ruleset + workflow와 함께 수행

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel · Render

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천·ELO·decision은 규칙 기반 로직과 샘플/세션 상태를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 정원/알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| v2.5 product/runtime baseline | **0e7c40c · PR #63 · v2.5.0** |
| PR required QA | **PASS** · run #186 |
| Regression suite | **PASS** · run #187 |
| Browser E2E · Product + Portfolio | **PASS** · run #187 |
| v2.4 + v2.5 architecture/source boundary | **PASS** |
| Matching / ELO domain parity | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| 39-screen product baseline | **PASS** |
| 16-slide Case Study IA | **PASS** |
| exact Vercel Production wait | **PASS** · run #187 |
| Production HTTP + strict Chromium | **PASS** · run #187 |
| exact Vercel Production | **0e7c40c · dpl_4rjLPCjoNVbLAbRB8rjcbqyUYXcj · READY** |
| Render exact release | **0e7c40c · dep-dams4bjrjlhs738c7fq0 · live** |
| v2.5 release gate | **CLOSED** |

Compatibility smoke는 exact Production verification이 아닙니다. Render와 Vercel은 독립적인 배포 경로이며, exact Production 검증은 exact deployment wait + strict HTTP/Chromium gate가 통과한 SHA만 기록합니다.

수동 iPhone Safari / VoiceOver / Android Chrome / TalkBack 검증은 v1.1에서 통과했으며, 대규모 제품 UI 변경 시 다시 수행합니다.

## 📚 Documentation

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 구조 후보

moving `main`은 QA/docs-only merge로 전진할 수 있으므로, 제품/runtime baseline과 exact verified Production SHA를 별도로 유지합니다. 세부 변경과 현재 branch head는 Git commit, Pull Request, GitHub Actions 이력을 source of truth로 사용합니다.
