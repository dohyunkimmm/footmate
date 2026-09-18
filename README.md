# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release

**v2.1.0 · Domain Engine**

- Stable product/runtime baseline: `59b5af1`
- Domain Engine extraction baseline: `4393403`
- Mobile Case Study scroll + Interactive Demo visibility fix: `1b1288b` · PR #41
- Initial Case Study loading-copy polish: `54b540d` · PR #42
- 16-slide Case Study consolidation: PR #34
- Case Study runtime index sync: `bba810f` · PR #39
- Last exact verified Production: `3d83a01`
  - Vercel deployment: `dpl_EvQszpwfiNXXUa2zPn4rTAaNd2Mq`
  - state: **READY**
  - GitHub Actions run #134: required Regression check, Browser E2E + axe, Production HTTP smoke, Production Chromium render smoke **PASS**
  - the deployment was READY before Production Smoke started
- Latest production-impacting main baseline: `d134d4b` · PR #44
  - canonical prototype source is now `demo-source.html`
  - duplicate ~354 KB `demo.html` artifact removed
  - legacy `/demo.html` is preserved through `demo-shell.html`
  - PR QA run #140: Regression + Browser E2E/axe **PASS**
  - main run #141: Regression + Browser E2E/axe **PASS**
  - exact Vercel deployment is **PENDING**: `Deployment rate limited — retry in 24 hours`
- QA/operations patch: `4c90dfe` · PR #45
  - rate-limit fallback smoke no longer requires a route that exists only on the pending exact deployment
  - main run #143: Regression + Browser E2E/axe + Production HTTP + Chromium smoke **PASS**
  - Production Smoke ran in compatibility mode against the last exact verified Production

### Next-version status · v2.2 architecture cleanup

The first v2.2 architecture increment is merged to `main`, but it is **not Production-verified yet** and the runtime version remains `2.1.0`.

- complete: remove duplicated `demo.html` source artifact while preserving `/demo.html` compatibility
- complete: guard the canonical source boundary in regression and Production smoke
- pending: exact-SHA Vercel Production for the PR #44 product-impacting baseline
- next: move Product Validation Inspector render ownership from `footmate-product-hardening.js` into `src/v2/ui/`
- next: split the large `demo-source.html` into build-time source/components
- next: reduce remaining DOM/persistence and compatibility CSS ownership

v2.1은 v2.0.0의 제품 동작과 정책을 유지하면서, 매칭·ELO 계산 책임을 legacy compatibility layer에서 명확한 domain engine으로 이동한 안정 릴리스입니다. 현재 회귀 기준은 Product / Portfolio mode, 39개 화면, 16장 Case Study입니다.

### What changed in v2.1

- `src/v2/domain/matching-engine.js` — 매칭 score/rank/derived scenario
- `src/v2/domain/elo-engine.js` — ELO update / tier 계산
- `scenario-store`가 ranked matches · selected scenario · eligible count를 domain engine에서 파생
- `FootMateScenarioAdapter`는 계산 주체가 아니라 render/persistence compatibility adapter로 축소
- Product Validation 추천 설명도 v2.1 scenario store를 우선 사용
- legacy matching/ELO 계산과 새 domain engine 결과 parity를 Playwright로 검증
- Product / Portfolio mode, 39개 화면, 매칭 가중치, eligibility, ELO K-factor, 결제/운영 정책, 저장 상태는 v2.0.0과 호환

### Demo modes

- `/demo` — **Product mode**: 실제 사용자 흐름 중심
- `/demo?mode=portfolio` — **Portfolio mode**: 추천 근거, 운영 정책, 이벤트/KPI 검증

## ✨ Key Features

- 5개 사용자 입력 기반 동적 ELO 계산
- 날짜 · 지역 · 시간대 · 거리 · 경기 방식 · 모집 포지션 기반 후보 eligibility
- ELO · 플레이 조건 · 위치 기반 매칭 점수와 추천 정렬
- 추천 점수 분해, 제외 이유, 필터 완화 fallback, 조건 변경 전/후 비교
- Home 날짜/상태/ELO/거리 필터링
- 선택 경기 → 상세 → 결제 → 참가 상태의 경기 식별자 일관성
- Payment · Participation · Match 상태 머신 기반 운영 시뮬레이션
- 결제 실패/재시도 · 중복 신청 차단 · 취소/환불 · 노쇼 · 대기→빈자리 제안→참가 · 경기 취소
- 경기 결과 ELO 업데이트와 다음 추천 반영
- 브라우저 재진입 시 핵심 진행 상태와 사용자 선택 복원
- AI Agent Workflow 및 데이터 품질 상태(`PASS` · `CHECK` · `SAMPLE`)
- 이벤트 계약과 핵심 퍼널/KPI 관측
- 접근 가능한 Product Validation inspector
- Case Study의 `Problem → Hypothesis → Design → Validation → Result` 구조

## 🧩 Runtime Structure

### v2.1 domain ownership

- `src/v2/bootstrap.js` — runtime composition root
- `src/v2/domain/matching-engine.js` — matching domain engine
- `src/v2/domain/elo-engine.js` — ELO domain engine
- `src/v2/state/product-store.js` — persisted product state
- `src/v2/state/scenario-store.js` — domain-derived scenario state
- `src/v2/ui/home-controller.js` — Home interaction
- `src/v2/ui/filter-results-controller.js` — Filter/Result interaction
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation adapter
- `src/v2/ui/secondary-controller.js` — Evaluation/Favorite/Friend/Chat persistence
- `src/v2/ui/screen-effects.js` — observer 기반 screen effects
- `src/v2/ui/validation-entry.js` — Portfolio validation entry
- `src/v2/styles/tokens.css` / `app.css` — design token / product experience layer

### Compatibility boundary

- `footmate-core.js` — 저수준 score/filter/credit/data-quality core
- `footmate-product-core.js` — 상태 머신·추천 설명·이벤트/KPI core
- `footmate-patches.js` — 기존 DOM render와 persistence 호환; v2.1 부팅 후 matching/ELO 계산은 domain engine에 위임
- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-product-hardening.js` — Operations/Product Validation adapter
- `footmate-experience.css` — visual compatibility layer

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| Regression suite | **PASS** · required-check key는 현재 `Regression 36` |
| Browser E2E · Product + Portfolio | **PASS** |
| Matching domain parity | **PASS** |
| ELO domain parity | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| Representative visual contract | **PASS** |
| Stable v2.1 product/runtime | **59b5af1 · PASS** |
| 16-slide Case Study IA | **PASS** |
| Last exact verified Production | **3d83a01 · dpl_EvQszpwfiNXXUa2zPn4rTAaNd2Mq · READY** |
| Exact Production verification | **run #134 · HTTP + Chromium PASS** |
| v2.2 artifact-boundary merge baseline | **d134d4b · PR #44 · exact Production PENDING** |
| v2.2 PR QA | **run #140 · Regression + Browser E2E/axe PASS** |
| Current main compatibility QA | **4c90dfe · run #143 · Regression + Browser E2E/axe + HTTP + Chromium PASS** |
| Vercel exact deployment for v2.2 | **PENDING · build-rate-limit · retry in 24 hours** |
| Render backup | **미확인 · connector workspace 확인 필요 / public endpoint fetch 불가** |

수동 iPhone Safari / VoiceOver / Android Chrome / TalkBack 검증은 v1.1에서 통과했으며, 대규모 제품 UI 변경 시 다시 수행합니다.

## 📚 Documentation

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 정리 후보

세부 변경은 Git commit, Pull Request, GitHub Actions 이력을 source of truth로 사용합니다.
