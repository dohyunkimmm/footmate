# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release · v3.0.0

**v3.0.0 · Unified App Architecture**

v3.0은 v2.8 Matchday Visual Identity를 Product 회귀 기준으로 유지하면서, 앱 수준 IA · view state · reusable chrome ownership을 `src/v3/`로 분리한 아키텍처 릴리스입니다. Product mode는 검증된 v2.8 375×780 phone/frame/legacy navigation과 39개 화면을 유지하고, Portfolio mode에서만 v3의 4개 primary destination과 app rail/context chrome을 노출합니다.

- product/runtime baseline: `cf766cb047b23ef302f06a80429765f45511bdcf` · PR #79
- v3 architecture introduction: `50e63eeaa4939f7a397941e7c7a8af408ad4cf92` · PR #74
- Release runtime: `3.0.0`
- Storage / schema / Product Hardening event contract: `2.1.0` compatibility 유지
- Product visual baseline: **v2.8 Matchday Visual Identity**
- Product screen baseline: **39 screens**
- Portfolio primary destinations: **4** · 탐색 / 추천 / 참가 / 내 정보
- Matching / ELO / decision / payment / persistence semantics: 유지
- Product / Portfolio mode: 분리 유지

### v3.0 architecture

- `src/v3/release.js` — v3.0 release/runtime promotion contract
- `src/v3/app-shell.js` — unified app shell + mode-aware chrome ownership
- `src/v3/ia/navigation.js` — 4-primary-destination IA와 39 legacy route mapping
- `src/v3/state/view-state.js` — `footmate:v3:view` view-state boundary
- `src/v3/components/` — reusable v3 UI primitives
- `src/v3/styles/` — Portfolio-only app shell/component/token ownership
- `src/v2/` — Product visual baseline, domain/state/matching/ELO/decision/payment compatibility ownership 유지

### QA / deployment state

- PR #79 final QA run #254:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - 39-screen structure / horizontal-overflow QA at 320 / 375 / 390 / 430 / 1280 **PASS**
  - exact v2.8 Product visual parity with documented corrections **PASS**
  - Portfolio 39-route containment / accessibility **PASS**
- PR #81 baseline-sync QA run #260:
  - Regression 36 **PASS**
  - Browser E2E + axe · full 39-screen regression **PASS**
- exact Production baseline verification:
  - GitHub Actions `FootMate Exact Production Baseline` run #2 · ID `35427738247`
  - Production HTTP smoke **PASS**
  - strict Production Chromium smoke **PASS**
- exact verified Vercel Production:
  - SHA `cf766cb047b23ef302f06a80429765f45511bdcf`
  - deployment `dpl_51Gki6ZZhy2shP6QH9U1yifT98zG`
  - target `production` · state **READY**
- v3.0 exact Production release gate: **CLOSED**

Vercel exact Production verification과 Render backup은 독립적인 배포 경로입니다. QA/docs-only merge로 moving `main`이 전진해도 product/runtime baseline과 exact verified Production SHA는 별도로 유지하며, Render current-main exact 상태는 deployment source와 Notion current-state에서 추적합니다.

## 🧪 Next Major Candidate · Matchday Companion

PR #83에서는 기존 v3.0을 안정 회귀 기준으로 유지한 채 `/next`에 다음 Major 후보를 분리해 개발합니다. **아직 stable Product 또는 exact verified Production으로 승격된 상태가 아닙니다.**

핵심 사용자 흐름은 화면 수가 아니라 다음 5개 행동으로 재구성합니다.

`Find → Decide → Join → Play → Return`

- Guest-first entry: `Value → Preferences → Recommendation → Detail → Sign in to Join`
- 추천 카드: 매칭 퍼센트보다 레벨 · 거리 · 남은 포지션 등 판단 이유 우선
- 경기 상세: 시간·장소 → 적합 이유 → 자리 → 참가자/시설 → 취소 정책 → 단일 참가 CTA
- Sign in: **아이디/비밀번호 로그인 + Kakao · Naver · Apple · Google SSO UI**와 회원가입 경로
- 선택한 경기와 플레이 설정을 Sign in → Checkout → 참가 확정까지 유지
- Home state: discover → upcoming → matchday → postgame
- Real App / Guided Case Study / Evidence mode 분리
- Case Study: Problem → Persona/JTBD → Product Thesis → Design Decisions → Recovery → System Evidence → Validation → Limits로 재구성

### Authentication scope

Next Major 후보는 로그인·회원가입·SSO 선택 UI와 세션 상태 전환을 구현합니다. **실제 Kakao/Naver/Apple/Google OAuth, 회원 DB, 서버 인증 세션은 연동하지 않았습니다.** 외부 인증 연동 완료로 표현하지 않습니다.

### Candidate QA scope

- 기존 v2.4–v3.0 architecture / regression contract 유지
- stable `/demo`의 exact v2.8 39-screen visual parity 유지
- guest-first recommendation flow
- account login + SSO + sign-up surface
- selected-match continuity through sign in / checkout
- Real App / Guided / Evidence isolation
- responsive 320 / 375 / 390 / 430
- axe serious / critical accessibility gate
- Case Study mobile vertical scroll 및 `/next` live interaction

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
- 39-screen Product mode와 4-destination Portfolio app shell 분리
- 접근 가능한 Product Validation Inspector
- Case Study의 `Problem → Hypothesis → Design → Validation → Result` 구조

## 🧩 Runtime Structure

### v3 ownership

- `src/v3/release.js` — release/runtime contract
- `src/v3/app-shell.js` — app-shell orchestration
- `src/v3/ia/navigation.js` — primary IA / compatibility route mapping
- `src/v3/state/view-state.js` — v3 view-state persistence
- `src/v3/components/` — reusable app components
- `src/v3/styles/app-shell.css` — Portfolio app shell
- `src/v3/styles/components.css` — Portfolio component chrome
- `src/v3/styles/tokens.css` — v3 app-shell tokens

### preserved v2 ownership

- `src/v2/bootstrap.js` — verified v2 runtime composition
- `src/v2/v28-release.js` — v2.8 visual baseline release adapter
- `src/v2/domain/` — matching / ELO / decision / availability boundaries
- `src/v2/state/` — product / scenario / decision-trace persistence
- `src/v2/ui/` — Product controllers, recovery, payment, inspector
- `src/v2/styles/visual-identity.css` / `visual-tokens.css` / `visual-guardrails.css` — Product v2.8 Matchday visual baseline

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel · Render

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천·ELO·decision·availability verification은 규칙 기반 로직과 샘플/세션 상태를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 정원/알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| v3.0 product/runtime baseline | **cf766cb0 · PR #79 · v3.0.0** |
| v3 architecture introduction | **50e63eea · PR #74** |
| PR #79 full-screen QA | **PASS · run #254** |
| PR #81 baseline-sync QA | **PASS · run #260** |
| Regression 36 + v2.4–v3.0 boundaries | **PASS** |
| Browser E2E · axe | **PASS** |
| 39-screen Product regression | **PASS** |
| Product visual baseline | **v2.8 Matchday · PASS** |
| Responsive 320 / 375 / 390 / 430 / desktop | **PASS** |
| Portfolio 4-primary-destination / 39-route containment | **PASS** |
| Production HTTP smoke | **PASS · exact baseline run #2** |
| strict Production Chromium smoke | **PASS · exact baseline run #2** |
| exact verified Vercel Production | **cf766cb0 · dpl_51Gki6ZZhy2shP6QH9U1yifT98zG · READY** |
| v3.0 exact Production release gate | **CLOSED** |

## 📚 Documentation policy

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 릴리스 · 검증 baseline · compatibility history
- moving `main`은 QA/docs-only merge로 전진할 수 있으므로 product/runtime baseline과 exact verified Production SHA를 별도로 유지
- Render current-main exact SHA/deployment/live 상태는 deployment source와 Notion current-state에서 유지
- compatibility smoke와 exact Production verification을 구분
- temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않음
