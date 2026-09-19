# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Current v3 backup · Render](https://footmate-backup.onrender.com)
- [Vercel Production · last exact verified v2.8](https://footmate-black.vercel.app/demo)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release · v3.0.0

**v3.0.0 · Unified App Architecture**

v3.0은 검증된 v2.8 Matchday Visual Identity를 시각 회귀 기준으로 유지하면서, 39개 compatibility route를 4개 primary destination으로 정리하고 app shell / navigation / view state ownership을 분리한 아키텍처 릴리스입니다.

- current product/runtime baseline: `23ff243b750d796561d9b4522972528a17a91fe9` · PR #76 visual baseline regression fix 포함
- v3 architecture release point: `50e63eeaa4939f7a397941e7c7a8af408ad4cf92` · PR #74
- Release runtime: `3.0.0`
- preserved domain/schema baseline: `2.8.0` runtime semantics · schema `2.1.0`
- primary destinations: `탐색 / 추천 / 참가 / 내 정보`
- compatibility product routes: 39 screens
- visual baseline: `v2.8 Matchday`
- Product / Portfolio mode: 유지
- Matching / ELO / decision / payment / persistence semantics: 유지

### v3.0 architecture

- `src/v3/release.js` — v3 release/runtime composition
- `src/v3/app-shell.js` — unified app shell + legacy route mapping
- `src/v3/ia/navigation.js` — 4-primary-destination IA
- `src/v3/state/view-state.js` — domain state와 분리된 navigation/view state
- `src/v3/components/` — app navigation / context / reusable primitives
- `src/v3/styles/app-shell.css` — app-level responsive shell ownership
- `src/v3/styles/components.css` — v3-owned chrome only
- `src/v2/styles/visual-identity.css` — legacy product screen의 v2.8 visual ownership 유지

### Visual baseline regression fix

PR #76에서 v3 shell이 v2.8 product surface의 배경색, typography, card geometry를 덮어쓰던 회귀를 제거했습니다.

- v3 CSS가 `.screen`, `.pcnt`, `.nbar`, `.nbar-title` 등 legacy visual selector를 다시 소유하지 않도록 boundary 고정
- mobile에서는 v2.8 visual canvas + v3 bottom navigation만 유지
- desktop은 1180px 확장형 legacy screen 대신 `104px rail + 약 456px product viewport`로 제한
- v2.8 effective visual baseline, 320px touch/accessibility, desktop bounded scale을 Browser E2E에 추가

## ✅ QA / Deployment

- PR #76 final QA · run #243
  - Regression 36 **PASS**
  - v2.4 → v3.0 ownership / compatibility boundaries **PASS**
  - Browser E2E + axe · responsive · v2.8 visual baseline · v3 app shell **PASS**
- main QA · run #244 on `23ff243b750d796561d9b4522972528a17a91fe9`
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - Production compatibility HTTP smoke **PASS**
  - Production compatibility Chromium smoke **PASS**
  - v3 exact Production HTTP / Chromium: **Not yet verified**
- Render product/runtime release point
  - SHA `23ff243b750d796561d9b4522972528a17a91fe9`
  - deployment `dep-dan0rl2jnfac738f9e20`
  - state **verified live at product release**
- exact v3 Vercel Production: **Not yet verified**
- last exact verified Vercel Production remains v2.8
  - SHA `d8014978cf6a1a5621f09ff098f48ac4821b615b`
  - deployment `dpl_GtHGNwyRuDYWVkuswgVHryTkHtVp`
  - state **READY**

Compatibility smoke와 exact Production verification은 별개입니다. Render와 Vercel도 독립적인 배포 경로로 기록합니다.

## ✨ Key Features

- 5개 사용자 입력 기반 동적 ELO 계산
- 날짜 · 지역 · 시간대 · 거리 · 경기 방식 · 모집 포지션 기반 후보 eligibility
- ELO · 플레이 조건 · 위치 기반 매칭 점수와 추천 정렬
- 추천 점수 분해, 제외 이유, 필터 완화 fallback, 조건 변경 전/후 비교
- Home → Filter → Results → Detail → Payment core funnel
- 추천 후보 comparison · 참가 전 preflight · decision trace
- Payment · Participation · Match 상태 머신 기반 운영 시뮬레이션
- 결제 실패/재시도 · 중복 신청 차단 · 취소/환불 · 대기→빈자리 제안→참가 · 경기 취소
- 결제/참가 전 guardrail과 inline recovery
- 경기 결과 ELO 업데이트와 다음 추천 반영
- 브라우저 재진입 시 핵심 진행 상태와 사용자 선택·decision trace 복원
- 4-destination responsive app navigation
- 접근 가능한 Product Validation Inspector
- Case Study `Problem → Hypothesis → Design → Validation → Result` 구조

## 🧩 Compatibility Boundary

- v3는 app shell / IA / view state를 소유하고 v2.8 domain + visual semantics를 회귀 기준으로 사용합니다.
- `demo-source.html`은 39-screen compatibility fixture입니다.
- Matching/ELO/decision/payment/persistence semantics는 v3에서 재작성하지 않았습니다.
- 실제 backend capacity/freshness API, 외부 결제, DB, LLM은 연결하지 않은 prototype boundary입니다.

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel · Render

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천·ELO·decision·availability verification은 규칙 기반 로직과 샘플/세션 상태를 사용합니다.

## 📚 Documentation policy

- `README.md` — 현재 제품/runtime baseline과 검증 상태
- `docs/RELEASE-HISTORY.md` — 릴리스/compatibility history
- moving `main`은 docs/QA-only merge로 전진할 수 있으므로 product/runtime baseline과 별도로 취급
- exact Production 미검증 상태는 `Not yet verified`로 기록
- temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않음
