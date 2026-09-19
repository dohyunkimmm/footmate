# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release · v2.7.0

**v2.7.0 · Visual Experience**

v2.7은 검증된 v2.6 Architecture Hardening을 회귀 기준으로 유지하면서 Home → Filter → Results → Detail/Reason → Payment 핵심 퍼널과 decision/recovery UI의 시각 위계, 카드, CTA, 상태 표현, 모바일 밀도와 접근성을 하나의 visual system으로 정리한 디자인 릴리스입니다. Matching/ELO, decision engine, payment/state/persistence semantics는 변경하지 않았습니다.

- product/runtime baseline: `c88c9d2` · PR #67
- Release runtime: `2.7.0`
- visual ownership: `src/v2/styles/visual-experience.css`
- baseline architecture: v2.6 Architecture Hardening
- Storage / schema / Product Hardening event contract: `2.1.0` 호환 유지
- v2.2 / v2.3 / v2.4 / v2.5 / v2.6 runtime alias/event: 호환 유지
- Product / Portfolio mode: 유지
- Product screen baseline: 39 screens
- Case Study information architecture: 16 slides
- v2.7 exact Vercel Production verification: **Not yet verified**

### v2.7 visual upgrade

- typography, spacing, surface, radius, shadow를 하나의 v2.7 token hierarchy로 정리
- Home · Filter impact · Results comparison · Detail/Recommendation Reason preflight · Payment guard의 정보 우선순위 재정비
- ready / recovery / blocked / success 상태를 색상만이 아니라 surface · border · label hierarchy로 구분
- primary / secondary CTA 우선순위를 명확하게 정리하고 핵심 action의 touch target 보존
- decision trace와 비교 metric의 가독성 개선
- 320 / 375 / 390 / 430 px responsive/mobile behavior와 reduced-motion compatibility 유지
- 보조 텍스트 대비를 WCAG 2 A/AA serious/critical axe gate 기준으로 보강
- 신규 visual ownership은 `src/v2/styles/visual-experience.css`에 두고 legacy source에 신규 v2.7 visual ownership을 추가하지 않음

### QA / deployment state

- PR #67 final QA run #203:
  - Regression 36 **PASS**
  - v2.4 component/source boundary **PASS**
  - v2.5 decision/recovery boundary **PASS**
  - v2.6 architecture ownership boundary **PASS**
  - v2.7 visual ownership boundary **PASS**
  - Browser E2E + axe · responsive · v2.7 visual gate **PASS**
- main run #204 on `c88c9d2`:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - Production compatibility HTTP smoke **PASS**
  - Production compatibility Chromium render smoke **PASS**
  - exact v2.7 Vercel Production verification: **Not yet verified**
- Render v2.7 exact live backup:
  - SHA `c88c9d2d302e632e2187fc092c273d18c514bb48`
  - deployment `dep-damthpijnfac738cuqt0`
  - state **live**
- last exact verified Vercel Production remains v2.6:
  - SHA `eddbaa607fcf1db516a1d5ab8ee27eb8dad9ad25`
  - deployment `dpl_9A1BD9X95NDccjrCMhEPsqXBBkyX`
  - exact verification run #199 **PASS**

Compatibility smoke는 exact Production verification으로 간주하지 않습니다. Render와 Vercel은 독립적인 배포 경로입니다.

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

### v2.7 ownership

- `src/v2/bootstrap.js` — runtime composition root · release `2.7.0`
- `src/v2/styles/visual-experience.css` — v2.7 visual system ownership
- `src/v2/demo/runtime-boundary.js` — legacy source / 신규 feature ownership contract
- `src/v2/domain/matching-engine.js` — matching domain engine
- `src/v2/domain/elo-engine.js` — ELO domain engine
- `src/v2/domain/decision-engine.js` — deterministic decision / guardrail / trace engine
- `src/v2/domain/availability-gateway.js` — async availability verification boundary; 현재 prototype/session adapter
- `src/v2/state/scenario-persistence.js` — canonical scenario persistence
- `src/v2/state/decision-trace-persistence.js` — decision trace persistence / replay boundary
- `src/v2/demo/core-funnel-components.js` — v2.4 core funnel compatibility components
- `src/v2/demo/decision-recovery-components.js` — v2.5 decision/recovery compatibility components
- `src/v2/ui/scenario-presenter.js` — Filter / Results / Recommendation Reason / Detail presentation
- `src/v2/ui/decision-recovery-experience.js` — decision/recovery action orchestration
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation + decision guard adapter
- `src/v2/styles/decision-recovery.css` / `core-funnel.css` / `experience.css` — compatibility visual layers below v2.7

### Compatibility boundary

- `demo-source.html` — 39-screen regression fixture; 신규 v2.6/v2.7 feature ownership 없음
- `footmate-patches.js` — 일부 기존 DOM/persistence compatibility; 신규 v2.6/v2.7 feature ownership 없음
- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-product-hardening.js` — policy/state/analytics adapter + Inspector UI bridge
- v2.7은 시각 계층만 고도화하고 Matching/ELO, decision/payment state, persistence 계약은 유지

## 🔭 Next Evolution Candidates

- v2.7 exact Vercel Production verification 완료 후 release gate close-out
- 실제 backend 연동 시 `availability-gateway`의 prototype adapter를 server-side freshness/capacity verifier로 교체
- decision trace를 server-side durable audit/event storage로 확장
- `footmate-patches.js`에 남은 legacy DOM/persistence compatibility ownership 추가 축소

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel · Render

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천·ELO·decision·availability verification은 규칙 기반 로직과 샘플/세션 상태를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 정원/알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| v2.7 product/runtime baseline | **c88c9d2 · PR #67 · v2.7.0** |
| PR required QA | **PASS** · run #203 |
| Regression suite | **PASS** · run #204 |
| Browser E2E · Product + Portfolio | **PASS** · run #204 |
| v2.4 + v2.5 + v2.6 + v2.7 source/ownership boundary | **PASS** |
| Matching / ELO / decision / persistence compatibility | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| 39-screen product baseline | **PASS** |
| 16-slide Case Study IA | **PASS** |
| v2.7 Production compatibility HTTP + Chromium | **PASS** · run #204 |
| v2.7 exact Vercel Production | **Not yet verified** |
| last exact verified Vercel Production | **v2.6 · eddbaa60 · dpl_9A1BD9X95NDccjrCMhEPsqXBBkyX** |
| Render v2.7 exact live backup | **c88c9d2 · dep-damthpijnfac738cuqt0 · live** |
| v2.7 exact Production release gate | **Not yet verified** |

## 📚 Documentation

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 후보

moving `main`은 QA/docs-only merge로 전진할 수 있으므로 product/runtime baseline과 exact verified Production SHA를 별도로 유지합니다. temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않습니다.
