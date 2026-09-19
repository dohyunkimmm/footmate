# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Stable Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Stable Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Next Major Candidate · Matchday Companion](https://footmate-black.vercel.app/next)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Stable Release · v3.0.0

**v3.0.0 · Unified App Architecture**

v3.0은 v2.8 Matchday Visual Identity를 Product 회귀 기준으로 유지하면서, 앱 수준 IA · view state · reusable chrome ownership을 `src/v3/`로 분리한 아키텍처 릴리스입니다. Product mode는 검증된 v2.8 375×780 phone/frame/legacy navigation과 39개 화면을 유지하고, Portfolio mode에서만 v3의 4개 primary destination과 app rail/context chrome을 노출합니다.

- stable product/runtime baseline: `cf766cb047b23ef302f06a80429765f45511bdcf` · PR #79
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

## 🧪 Production-verified Candidate · Matchday Companion

PR #83은 기존 v3.0을 안정 회귀 기준으로 유지한 채 `/next`에 다음 Major 후보를 분리해 구현했습니다. **Stable `/demo` v3.0으로 승격된 상태는 아니지만 `/next` 후보 자체의 exact Production verification은 완료했습니다.**

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

### Candidate release evidence

- PR #83 merge SHA: `5215f5c7ea2b2599793b4b78db289f1e181ae28e`
- Production verification closure: PR #84 · runtime-bearing main SHA `a4408623402b266f15fde3e7d2ef1c49e3048b37`
- GitHub Actions `FootMate QA` run #305 · ID `35440699193`: **SUCCESS**
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - stable `/demo` exact v2.8 39-screen visual parity **PASS**
  - guest-first / account login + SSO / sign-up / checkout continuity **PASS**
  - responsive 320 / 375 / 390 / 430 **PASS**
  - Case Study mobile scroll + embedded `/next` **PASS**
  - Production compatibility HTTP/Chromium **PASS**
  - v3 exact Production HTTP/Chromium **PASS**
  - next-major exact Production HTTP/Chromium **PASS**
- exact verified Vercel Production:
  - SHA `a4408623402b266f15fde3e7d2ef1c49e3048b37`
  - deployment `dpl_GfrE1QiCyuabPiySofrmuNRqY3dc`
  - target `production` · state **READY**
  - `/`, `/demo`, `/next` HTTP **200**
- Render backup release point:
  - SHA `a4408623402b266f15fde3e7d2ef1c49e3048b37`
  - deployment `dep-dan78p2jnfac738k44ng`
  - state **LIVE**

Vercel과 Render는 독립적인 배포 경로입니다. 문서-only merge로 moving `main`이 전진하더라도 stable product/runtime baseline `cf766cb...`, Next candidate runtime release point `a440862...`, 마지막 exact verified Vercel Production을 별도로 구분합니다.

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
- Case Study의 제품 가치 → 의사결정 → 검증 근거 중심 스토리

## 🧩 Runtime Structure

### next-major ownership

- `src/next/app.js` — Matchday Companion real/guided/evidence runtime
- `src/next/data.js` — candidate sample/session state
- `src/next/app.css` / `real-app-experience.css` — next-major product/auth visual ownership
- `src/next/case-study.js` / `case-study.css` — redesigned 16-section Case Study content/visual ownership
- `/next` — candidate product route; stable `/demo`와 분리

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

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천·ELO·decision·availability verification은 규칙 기반 로직과 샘플/세션 상태를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 정원/알림 · 운영자 백엔드는 연동하지 않았습니다. Next Major의 SSO 역시 실제 OAuth가 아니라 인터랙티브 UX 검증 범위입니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| Stable v3.0 product/runtime baseline | **cf766cb0 · PR #79 · v3.0.0** |
| Stable Product visual baseline | **v2.8 Matchday · 39 screens · PASS** |
| Next Major implementation | **PR #83 · 5215f5c7** |
| Next Production verification closure | **PR #84 · a4408623** |
| Current release-point QA | **PASS · FootMate QA #305 · ID 35440699193** |
| Regression 36 + v2.4–v3.0 boundaries | **PASS** |
| Browser E2E · axe | **PASS** |
| Responsive 320 / 375 / 390 / 430 / desktop | **PASS** |
| Production compatibility HTTP + Chromium | **PASS** |
| v3 exact Production HTTP + Chromium | **PASS** |
| Next exact Production HTTP + Chromium | **PASS** |
| exact verified Vercel Production | **a4408623 · dpl_GfrE1QiCyuabPiySofrmuNRqY3dc · READY** |
| Render backup release point | **a4408623 · dep-dan78p2jnfac738k44ng · LIVE** |
| Stable v3.0 release gate | **CLOSED** |
| Next candidate exact Production verification | **VERIFIED** |

## 📚 Documentation policy

- `README.md` — 현재 stable 제품 · candidate · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 릴리스 · 검증 baseline · compatibility history
- moving `main`은 docs-only merge로 전진할 수 있으므로 stable product/runtime baseline, candidate runtime release point, exact verified Production SHA를 별도로 유지
- compatibility smoke와 exact Production verification을 구분
- Render와 Vercel은 독립적인 배포 경로로 기록
- temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않음
