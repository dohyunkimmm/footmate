# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release · v2.8.0

**v2.8.0 · Matchday Visual Identity**

v2.8은 검증된 v2.7 Visual Experience를 회귀 기준으로 유지하면서 FootMate에 sports-specific Matchday identity를 부여한 디자인 릴리스입니다. Pitch green + lime visual tokens, Home hero, recommendation ticket, Match Preview, Payment guard, motion/focus hierarchy를 별도 v2 ownership layer로 추가했으며 Matching/ELO, decision engine, payment/state/persistence semantics는 변경하지 않았습니다.

- product/runtime baseline: `d8014978cf6a1a5621f09ff098f48ac4821b615b` · PR #71
- Release runtime: `2.8.0`
- release adapter: `src/v2/v28-release.js`
- visual identity ownership: `src/v2/styles/visual-identity.css`
- visual token ownership: `src/v2/styles/visual-tokens.css`
- visual identity module: `src/v2/ui/visual-identity-experience.js`
- baseline visual experience: v2.7 Visual Experience
- Storage / schema / Product Hardening event contract: `2.1.0` compatibility 유지
- v2.2 / v2.3 / v2.4 / v2.5 / v2.6 / v2.7 runtime compatibility 유지
- Product / Portfolio mode: 유지
- Product screen baseline: 39 screens
- Case Study information architecture: 16 slides
- Matching / ELO / decision / payment / persistence semantics: 유지

### v2.8 visual identity upgrade

- pitch green + lime 기반 Matchday visual tokens와 sports-specific hierarchy 도입
- Home decision hero를 matchday focal surface로 재설계
- Filter selection, Results recommendation ticket/featured state, Detail Match Preview/preflight, Payment guard에 일관된 identity 적용
- dynamic Results/Detail DOM 갱신 뒤에도 v2.8 visual ownership이 유지되도록 identity refresh 경계 보강
- semantic surface, CTA, focus-visible, touch target, reduced-motion contract 유지
- 320 / 375 / 390 / 430 px responsive behavior 보존
- muted/supporting text 대비와 narrow-screen decorative containment를 axe/visual gate 기준으로 보강
- 신규 v2.8 ownership은 `src/v2/`에만 두고 `demo-source.html`과 legacy patch layer는 compatibility source로 유지

### QA / deployment state

- PR #71 final QA run #220:
  - Regression 36 **PASS**
  - v2.4 component/source boundary **PASS**
  - v2.5 decision/recovery boundary **PASS**
  - v2.6 architecture ownership boundary **PASS**
  - v2.7 visual ownership compatibility **PASS**
  - v2.8 visual identity boundary **PASS**
  - Browser E2E + axe · responsive · v2.8 visual gate **PASS**
- main exact verification run #221 on `d8014978cf6a1a5621f09ff098f48ac4821b615b`:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**
- exact verified Vercel Production:
  - SHA `d8014978cf6a1a5621f09ff098f48ac4821b615b`
  - deployment `dpl_GtHGNwyRuDYWVkuswgVHryTkHtVp`
  - state **READY**
- Render exact product backup:
  - SHA `d8014978cf6a1a5621f09ff098f48ac4821b615b`
  - deployment `dep-damungojo6nc7392taug`
  - state **live**

Vercel exact Production verification과 Render backup은 독립적인 배포 경로로 기록합니다.

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

### v2.8 ownership

- `src/v2/bootstrap.js` — v2.7 verified runtime composition baseline / compatibility source
- `src/v2/v28-release.js` — v2.8 release promotion adapter
- `src/v2/ui/visual-identity-experience.js` — v2.8 visual identity DOM ownership / dynamic refresh
- `src/v2/styles/visual-tokens.css` — v2.8 Matchday visual tokens
- `src/v2/styles/visual-identity.css` — v2.8 sports visual identity ownership
- `src/v2/styles/visual-guardrails.css` — narrow-screen/accessibility guardrails
- `src/v2/styles/visual-experience.css` — v2.7 visual compatibility baseline
- `src/v2/demo/runtime-boundary.js` — legacy source / 신규 feature ownership contract
- `src/v2/domain/matching-engine.js` — matching domain engine
- `src/v2/domain/elo-engine.js` — ELO domain engine
- `src/v2/domain/decision-engine.js` — deterministic decision / guardrail / trace engine
- `src/v2/domain/availability-gateway.js` — async availability verification boundary; 현재 prototype/session adapter
- `src/v2/state/scenario-persistence.js` — canonical scenario persistence
- `src/v2/state/decision-trace-persistence.js` — decision trace persistence / replay boundary
- `src/v2/ui/decision-recovery-experience.js` — decision/recovery action orchestration
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation + decision guard adapter

### Compatibility boundary

- `demo-source.html` — 39-screen regression fixture; 신규 v2.8 visual ownership 없음
- `footmate-patches.js` — 일부 기존 DOM/persistence compatibility; 신규 v2.8 ownership 없음
- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-product-hardening.js` — policy/state/analytics adapter + Inspector UI bridge
- v2.8은 visual identity를 고도화하고 Matching/ELO, decision/payment state, persistence 계약은 유지

## 🔭 Next Evolution Candidates

- v3.0에서 v2.8 verified baseline을 회귀 기준으로 IA · component system · architecture를 재설계
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
| v2.8 product/runtime baseline | **d8014978 · PR #71 · v2.8.0** |
| PR required QA | **PASS** · run #220 |
| Main Regression suite | **PASS** · run #221 |
| Main Browser E2E · axe · responsive | **PASS** · run #221 |
| v2.4 + v2.5 + v2.6 + v2.7 + v2.8 ownership/compatibility boundary | **PASS** |
| Matching / ELO / decision / persistence compatibility | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| 39-screen product baseline | **PASS** |
| 16-slide Case Study IA | **PASS** |
| exact Vercel deployment wait | **PASS** · run #221 |
| Production HTTP smoke | **PASS** · run #221 |
| strict Production Chromium render smoke | **PASS** · run #221 |
| exact verified Vercel Production | **d8014978 · dpl_GtHGNwyRuDYWVkuswgVHryTkHtVp · READY** |
| Render exact product backup | **d8014978 · dep-damungojo6nc7392taug · live** |
| v2.8 exact Production release gate | **CLOSED** |

## 📚 Documentation

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 후보

moving `main`은 QA/docs-only merge로 전진할 수 있으므로 product/runtime baseline과 exact verified Production SHA를 별도로 유지합니다. temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않습니다.
