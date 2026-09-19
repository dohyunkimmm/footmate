# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current Stable Release — v3.0.0 Unified App Architecture

- stable product/runtime baseline: `cf766cb047b23ef302f06a80429765f45511bdcf` · PR #79
- architecture introduction: `50e63eeaa4939f7a397941e7c7a8af408ad4cf92` · PR #74
- Release runtime version: `3.0.0`
- Storage/schema/Product Hardening event contract: `2.1.0` compatibility 유지
- Product visual baseline: v2.8 Matchday Visual Identity
- Product screen baseline: 39 screens
- Portfolio primary destinations: 4 · 탐색 / 추천 / 참가 / 내 정보
- Product / Portfolio visual ownership 분리
- Matching / ELO / decision / payment / persistence semantics: 유지
- stable v3.0 release gate: **CLOSED**

### Stable v3.0 evidence

PR #79 · `cf766cb0`
- v3.0 Product mode의 시각 회귀를 v2.8 exact baseline 기준으로 복구
- Product는 375×780 phone/frame, notch/status bar, legacy tab navigation과 39-screen visual baseline 유지
- Portfolio mode만 v3 app rail/context/four-destination chrome 소유
- full 39-screen structural/pixel/accessibility regression gate 추가

Stable baseline QA:
- PR #79 final run #254: Regression 36 / Browser E2E + axe / 39-screen Product / exact v2.8 visual parity / Portfolio containment **PASS**
- PR #81 final run #260: baseline-sync Regression 36 / Browser E2E + axe / full 39-screen regression **PASS**
- `FootMate Exact Production Baseline` run #2 · ID `35427738247`: strict Production HTTP + Chromium **PASS**

Stable `/demo` product/runtime baseline remains `cf766cb...` even when moving `main` or the isolated `/next` candidate advances.

## Production-verified Candidate — Matchday Companion

Status: **Exact Production verified candidate** · stable `/demo` promotion은 아직 별도 결정

PR #83 · merge SHA `5215f5c7ea2b2599793b4b78db289f1e181ae28e`
- `/next`에 guest-first Matchday Companion 후보를 stable v3.0과 분리해 구현
- `Find → Decide → Join → Play → Return` 사용자 journey
- `Value → Preferences → Recommendation → Detail → Sign in to Join` account gate
- 추천 이유를 레벨 · 거리 · 남은 포지션 중심으로 재구성
- 단일 참가 CTA와 선택 경기/플레이 설정의 Sign in → Checkout → 참가 완료 연속성
- 아이디/비밀번호 로그인, 로그인 상태 유지/아이디 저장, 아이디·비밀번호 찾기, 회원가입 UX
- Kakao · Naver · Apple · Google SSO 선택 UI
- discover → upcoming → matchday → postgame 상태 기반 홈
- Real App / Guided Case Study / Evidence mode 분리
- 16-section Case Study storytelling을 제품 가치와 의사결정 중심으로 재설계

Authentication implementation scope:
- 구현: 로그인/회원가입/SSO 선택 UX, 세션 기반 `signedIn` 상태, 참가 흐름 연속성
- 미연동: 실제 Kakao/Naver/Apple/Google OAuth, 회원 DB, 서버 인증 세션

PR #84 · exact Production verification closure · merge SHA `a4408623402b266f15fde3e7d2ef1c49e3048b37`
- Production compatibility browser smoke를 현재 16-section Case Study contract와 정렬
- `/next` release metadata를 추가해 exact Production HTTP/Chromium 검증 가능하도록 보강
- stable `/demo` v3.0 / v2.8 39-screen Product baseline과 Matching/ELO/decision/payment/persistence semantics 변경 없음

### Candidate QA

GitHub Actions `FootMate QA` run #305 · ID `35440699193` · head SHA `a4408623402b266f15fde3e7d2ef1c49e3048b37`: **SUCCESS**

- Regression 36 **PASS**
- Browser E2E + axe **PASS**
- stable `/demo` exact v2.8 39-screen visual parity **PASS**
- guest-first recommendation / account gate / ID·PW + SSO / sign-up consent / checkout continuity **PASS**
- responsive 320 / 375 / 390 / 430 **PASS**
- Case Study mobile vertical scroll + embedded `/next` interaction **PASS**
- Production compatibility HTTP smoke **PASS**
- v3 exact Production HTTP smoke **PASS**
- next-major exact Production HTTP smoke **PASS**
- Production compatibility Chromium smoke **PASS**
- v3 exact Production Chromium smoke **PASS**
- next-major exact Production Chromium smoke **PASS**

### Deployment / verification

Exact verified Vercel Production:
- SHA: `a4408623402b266f15fde3e7d2ef1c49e3048b37`
- deployment: `dpl_GfrE1QiCyuabPiySofrmuNRqY3dc`
- target: `production`
- state: **READY**
- aliases: `footmate-black.vercel.app`, `footmate-dohyunkimm.vercel.app`, `footmate-git-main-dohyunkimm.vercel.app`
- `/`, `/demo`, `/next`: HTTP **200**
- exact Production compatibility + v3 + next-major HTTP/Chromium: **PASS** · QA run #305

Render backup release point:
- SHA: `a4408623402b266f15fde3e7d2ef1c49e3048b37`
- deployment: `dep-dan78p2jnfac738k44ng`
- state: **LIVE**

Vercel과 Render는 독립적인 배포 경로입니다. docs-only merge 때문에 moving `main`이 전진할 수 있으므로 stable product/runtime baseline `cf766cb...`, Next candidate runtime release point `a440862...`, 마지막 exact verified Vercel Production을 구분해 유지합니다.

## v2.8.0 — Matchday Visual Identity

- Product/runtime baseline: `d8014978cf6a1a5621f09ff098f48ac4821b615b` · PR #71
- Runtime: `2.8.0`
- Exact Vercel Production: `d8014978cf6a1a5621f09ff098f48ac4821b615b` · `dpl_GtHGNwyRuDYWVkuswgVHryTkHtVp` · READY
- Exact Production QA: run #221 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- v2.7 Visual Experience를 회귀 기준으로 sports-specific Matchday visual tokens / identity 추가
- 39 screens / 16-slide Case Study / Matching/ELO/decision/payment/persistence semantics 유지

## v2.7.0 — Visual Experience

- Product/runtime baseline: `c88c9d2` · PR #67
- Runtime: `2.7.0`
- PR QA run #203: Regression / Browser E2E + axe **PASS**
- typography, surfaces, CTA hierarchy, semantic state, responsive/accessibility visual system 정리

## v2.6.0 — Architecture Hardening

- Product/runtime baseline: `eddbaa60` · PR #65
- Exact verified Production SHA: `eddbaa607fcf1db516a1d5ab8ee27eb8dad9ad25`
- Vercel deployment: `dpl_9A1BD9X95NDccjrCMhEPsqXBBkyX`
- Exact Production QA: run #199 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- availability verification / decision trace persistence boundary 추가

## v2.5.0 — Decision & Recovery Experience

- Product/runtime baseline: `0e7c40c` · PR #63
- Exact verified Production SHA: `0e7c40c2d997798dbf71f74fef8f91055cca7abe`
- Vercel deployment: `dpl_4rjLPCjoNVbLAbRB8rjcbqyUYXcj`
- Exact Production QA: run #187 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- 추천 비교 · preflight · Payment guard · inline recovery · decision trace 도입

## v2.4.0 — Core Funnel Experience

- Product/runtime baseline: `21c6ab4` · PR #58
- Exact verified Production SHA: `b38e147` · PR #61
- Vercel deployment: `dpl_GyvevKkNYEgRkJKJrXLuAwekXmCm`
- Exact Production QA: run #182 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- Home → Filter → Results → Detail → Payment core funnel 고도화

## v2.3.0 — Compatibility Boundary Reduction

- Architecture baseline: `bf27784` · PR #52
- Exact verified Production SHA: `aaacbdc` · PR #55
- Vercel deployment: `dpl_86HgVTqT4aK5aCx5vhyYLipaK4W8`
- scenario persistence/presenter와 Product Experience CSS ownership을 `src/v2/`로 이동

## v2.2.0 — Inspector UI Ownership

- Product baseline: `94939d5` · PR #47
- Exact verified Production descendant: `5fbdbf4` · PR #53
- Vercel deployment: `dpl_FnD7dPN9DgMnYQMoEsd5LaUHs5kY`
- Product Validation Inspector UI ownership을 `src/v2/ui/product-inspector.js`로 이동

## v2.1.0 — Domain Engine

- Stable product/runtime baseline: `59b5af1`
- Domain Engine extraction baseline: `4393403`
- Matching / ELO 계산 ownership을 `src/v2/domain/`으로 이동
- Product Hardening event contract `2.1.0`

## v2.0.0 — Product Experience

- Stable source/runtime baseline: `a192ec1`
- Production verification: `9ff82c7`
- Product / Portfolio mode 분리
- product/scenario store 및 UI controller ownership
- 320 / 375 / 390 / 430 responsive + visual contract

## Earlier releases

- v2.0.0-beta.2 · `84c698b` · runtime/controller migration
- v2.0.0-beta.1 · `70102da` · Product Experience Architecture
- v1.1 · `8d501bd` / `ec3f8cf` · responsive/accessibility polish · manual iPhone/Android accessibility QA

## Documentation policy

- Current stable/candidate product and verified deployment state: `README.md`
- Release history / compatibility boundary: 이 문서
- moving `main`은 docs-only merge로 전진할 수 있으므로 stable product/runtime baseline, candidate runtime release point, exact verified Production SHA를 별도로 유지
- compatibility smoke와 exact Production verification을 구분
- Render와 Vercel은 독립적인 배포 경로로 기록
- exact Production이 완료되지 않은 경우 `Not yet verified`로 기록
- temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않음
- 세부 작업 로그는 Git history / PR / Actions를 source of truth로 사용
