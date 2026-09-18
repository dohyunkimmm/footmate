# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release · v2.6.0

**v2.6.0 · Architecture Hardening**

v2.6은 v2.5 Decision & Recovery Experience를 회귀 기준으로 유지하면서, legacy source와 신규 runtime ownership을 더 명확히 분리하고 향후 server-backed 검증으로 교체 가능한 경계를 추가한 아키텍처 릴리스입니다. 화면·기능을 새로 늘리는 대신 39-screen Product와 16-slide Case Study의 기존 동작을 보존하면서 테스트 가능성, persistence ownership, backend 교체 가능성을 강화했습니다.

- product/runtime baseline: `eddbaa60` · PR #65
- exact verified Production SHA: `eddbaa607fcf1db516a1d5ab8ee27eb8dad9ad25`
- Release runtime: `2.6.0`
- Storage / schema / Product Hardening event contract: `2.1.0` 호환 유지
- v2.2 / v2.3 / v2.4 / v2.5 runtime alias/event: 호환 유지
- Regression baseline: Product / Portfolio mode · 39 screens · 16-slide Case Study
- Matching / ELO ownership: `src/v2/domain/`
- Decision / Recovery ownership: `src/v2/domain/decision-engine.js`
- Runtime boundary ownership: `src/v2/demo/runtime-boundary.js`
- Availability verification boundary: `src/v2/domain/availability-gateway.js`
- Decision trace persistence: `src/v2/state/decision-trace-persistence.js`
- v2.6 release gate: **CLOSED**

### v2.6 architecture hardening

- `demo-source.html`은 신규 기능 source가 아니라 **39-screen regression fixture**로 역할을 고정
- `footmate-patches.js`에는 v2.6 신규 feature ownership이 유입되지 않도록 boundary gate 추가
- `src/v2/demo/runtime-boundary.js`에서 legacy source 역할과 신규 feature ownership 경계를 명시
- `src/v2/domain/availability-gateway.js`에 async availability verification boundary 추가
  - 현재 verifier는 prototype/session state를 읽으며 `serverVerified: false`
  - 실제 server-side freshness/capacity API로 교체 가능한 adapter 경계만 준비
- `src/v2/state/decision-trace-persistence.js`에서 decision trace의 browser persistence/replay 경계를 분리
- v2.5 comparison · preflight · Payment guard · inline recovery · decision trace UX는 compatibility contract로 유지
- v2.6 runtime에서도 v2.4/v2.5 visual layer가 계속 적용되도록 compatibility selector를 확장해 320px touch target과 기존 UI 동작을 보존
- 실제 서버 정원/결제/DB/LLM 연동은 하지 않으며, 실시간 서버 검증이 연결됐다고 간주하지 않음

### QA / deployment state

- PR #65 final QA run #198:
  - Regression 36 **PASS**
  - v2.4 component/source boundary **PASS**
  - v2.5 decision/recovery boundary **PASS**
  - v2.6 architecture ownership boundary **PASS**
  - Browser E2E + axe · responsive · v2.6 architecture gate **PASS**
- exact Production verification main run #199:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**
- exact v2.6 Vercel Production:
  - SHA `eddbaa607fcf1db516a1d5ab8ee27eb8dad9ad25`
  - deployment `dpl_9A1BD9X95NDccjrCMhEPsqXBBkyX`
  - state **READY**
- Render current live backup at release close-out:
  - SHA `eddbaa607fcf1db516a1d5ab8ee27eb8dad9ad25`
  - deployment `dep-damssl3tqb8s73a1v7vg`
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
- 브라우저 재진입 시 핵심 진행 상태와 사용자 선택·decision trace 복원
- AI Agent Workflow 및 데이터 품질 상태(`PASS` · `CHECK` · `SAMPLE`)
- 이벤트 계약과 핵심 퍼널/KPI 관측
- 접근 가능한 Product Validation Inspector
- Case Study의 `Problem → Hypothesis → Design → Validation → Result` 구조

## 🧩 Runtime Structure

### v2.6 ownership

- `src/v2/bootstrap.js` — runtime composition root · release `2.6.0`
- `src/v2/demo/runtime-boundary.js` — legacy source / 신규 feature ownership contract
- `src/v2/domain/matching-engine.js` — matching domain engine
- `src/v2/domain/elo-engine.js` — ELO domain engine
- `src/v2/domain/decision-engine.js` — deterministic decision / guardrail / trace engine
- `src/v2/domain/availability-gateway.js` — async availability verification boundary; 현재 prototype/session adapter
- `src/v2/state/product-store.js` — persisted product state
- `src/v2/state/scenario-store.js` — domain-derived scenario state
- `src/v2/state/scenario-persistence.js` — canonical scenario persistence
- `src/v2/state/decision-trace-persistence.js` — decision trace persistence / replay boundary
- `src/v2/compat/scenario-persistence-bridge.js` — guarded legacy hydration bridge
- `src/v2/demo/core-funnel-components.js` — v2.4 core funnel compatibility components
- `src/v2/demo/decision-recovery-components.js` — v2.5 decision/recovery compatibility components
- `src/v2/ui/scenario-presenter.js` — Filter / Results / Recommendation Reason / Detail presentation
- `src/v2/ui/decision-recovery-experience.js` — v2.5 UI/IX action/recovery orchestration
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation + decision guard adapter
- `src/v2/ui/home-controller.js` / `filter-results-controller.js` / `secondary-controller.js` — product interaction adapters
- `src/v2/ui/product-inspector.js` — Product Validation Inspector UI ownership
- `src/v2/styles/decision-recovery.css` — v2.5 decision/recovery compatibility visual layer
- `src/v2/styles/core-funnel.css` — v2.4 core funnel compatibility visual layer
- `src/v2/styles/experience.css` — Product Experience canonical visual layer
- `src/v2/styles/compatibility-patches.css` / `compatibility-finalize.css` — compatibility visual ownership
- `src/v2/styles/product-inspector.css` — Inspector component styles
- `src/v2/styles/tokens.css` / `app.css` — design token / mode layer

### Compatibility boundary

- `demo-source.html` — 39-screen regression fixture; 신규 v2.6 feature ownership 없음
- `footmate-core.js` — 저수준 score/filter/credit/data-quality core
- `footmate-product-core.js` — 상태 머신·추천 설명·이벤트/KPI core
- `footmate-patches.js` — 일부 기존 DOM/persistence compatibility; 신규 v2.6 feature ownership 없음
- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-product-hardening.js` — policy/state/analytics adapter + Inspector UI bridge
- legacy CSS entry files — canonical `src/v2/styles/`를 가리키는 compatibility alias

## 🔭 Next Evolution Candidates

- 실제 backend 연동 시 `availability-gateway`의 prototype adapter를 server-side freshness/capacity verifier로 교체
- decision trace를 server-side durable audit/event storage로 확장
- `footmate-patches.js`에 남은 legacy DOM/persistence compatibility ownership 추가 축소
- required status check key `Regression 36` rename은 repository ruleset + workflow와 함께 수행

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel · Render

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천·ELO·decision·availability verification은 규칙 기반 로직과 샘플/세션 상태를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 정원/알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| v2.6 product/runtime baseline | **eddbaa60 · PR #65 · v2.6.0** |
| PR required QA | **PASS** · run #198 |
| Regression suite | **PASS** · run #199 |
| Browser E2E · Product + Portfolio | **PASS** · run #199 |
| v2.4 + v2.5 + v2.6 architecture/source boundary | **PASS** |
| Matching / ELO domain parity | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| 39-screen product baseline | **PASS** |
| 16-slide Case Study IA | **PASS** |
| exact Vercel Production wait | **PASS** · run #199 |
| Production HTTP + strict Chromium | **PASS** · run #199 |
| exact Vercel Production | **eddbaa60 · dpl_9A1BD9X95NDccjrCMhEPsqXBBkyX · READY** |
| Render current live backup at release close-out | **eddbaa60 · dep-damssl3tqb8s73a1v7vg · live** |
| v2.6 release gate | **CLOSED** |

Compatibility smoke는 exact Production verification이 아닙니다. Render와 Vercel은 독립적인 배포 경로이며, exact Production 검증은 exact deployment wait + strict HTTP/Chromium gate가 통과한 SHA만 기록합니다.

수동 iPhone Safari / VoiceOver / Android Chrome / TalkBack 검증은 v1.1에서 통과했으며, 대규모 제품 UI 변경 시 다시 수행합니다.

## 📚 Documentation

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 구조 후보

moving `main`은 QA/docs-only merge로 전진할 수 있으므로, 제품/runtime baseline과 exact verified Production SHA를 별도로 유지합니다. 세부 변경과 현재 branch head는 Git commit, Pull Request, GitHub Actions 이력을 source of truth로 사용합니다.
