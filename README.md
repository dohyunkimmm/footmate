# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Main · v2.2.0

**v2.2.0 · Inspector UI Ownership**

현재 `main`의 v2.2 코드는 완료된 릴리스 후보 상태입니다. Vercel Hobby build-rate-limit 때문에 exact-SHA Production 검증은 아직 닫히지 않았지만, quota와 독립된 Render backup은 `main` auto-deploy 경로로 `live` 상태를 유지합니다. 문서 sync 직전 검증 baseline `b3125bf`는 당시 current main과 exact 일치했습니다.

- v2.2 product baseline: `94939d5` · PR #47
- Release runtime: `2.2.0`
- Storage / schema / Product Hardening event contract: `2.1.0` 호환 유지
- Regression baseline: Product / Portfolio mode · 39 screens · 16-slide Case Study
- PR #44 · `d134d4b`
  - canonical prototype source를 `demo-source.html`로 단일화
  - 중복 ~354 KB `demo.html` artifact 제거
  - `/demo.html` legacy compatibility route 유지
- PR #45 · `4c90dfe`
  - Vercel rate-limit 시 Production smoke가 마지막 exact Production을 호환 모드로 검증하도록 정리
- PR #47 · `94939d5`
  - Product Validation Inspector DOM/render/focus/keyboard ownership을 `src/v2/ui/product-inspector.js`로 이동
  - Inspector component styles를 `src/v2/styles/product-inspector.css`로 이동
  - `footmate-product-hardening.js`를 policy/state/analytics adapter + UI bridge로 축소
  - 중복 Inspector launcher bridge 제거
  - Case Study release badge/note를 v2.2 UI Ownership 기준으로 동기화
  - exact Production strict browser smoke에 v2.2 runtime/Inspector ownership assertion 추가
- PR #47 QA run #146: Regression + Browser E2E/axe **PASS**
- v2.2 product-baseline main run #147: Regression + Browser E2E/axe + Production HTTP + Chromium smoke **PASS**
  - Production Smoke는 Vercel rate-limit 때문에 마지막 exact verified Production을 대상으로 compatibility mode로 실행

### Production release gate

- Last exact verified Vercel Production: `3d83a01`
  - Vercel deployment: `dpl_EvQszpwfiNXXUa2zPn4rTAaNd2Mq`
  - state: **READY**
  - GitHub Actions run #134: required Regression check, Browser E2E + axe, Production HTTP smoke, Production Chromium render smoke **PASS**
- v2.2 production-impacting baseline awaiting exact Vercel Production: `94939d5`
- Current Vercel status: **PENDING** — latest attempts are quota-limited/canceled; last READY Production remains `3d83a01`
- Render backup verification baseline:
  - service: `footmate-backup`
  - URL: `https://footmate-backup.onrender.com`
  - verified SHA: `b3125bf28ba8d1a44201950c55b11c841b77b383`
  - deployment: `dep-damd0h6gekts73e6hlm0`
  - state at verification: **live**
  - branch: `main` · auto-deploy enabled
  - 당시 GitHub current main과 exact 일치했으며 Vercel quota와 독립된 백업 배포 경로로 사용
- v2.2를 Vercel Production-verified release로 닫기 위한 남은 조건:
  - `94939d5` product tree를 포함한 현재 main descendant가 Vercel Production에 READY
  - strict Production HTTP smoke PASS
  - strict Production Chromium render smoke PASS
  - Product/Portfolio + v2.2 Inspector ownership assertion PASS

### v2.3 architecture backlog

v2.2에서 release scope를 넘기지 않기 위해 아래 항목은 다음 구조 고도화로 이관합니다.

- `footmate-patches.js`에 남은 DOM render/persistence ownership 추가 분리
- 큰 `demo-source.html` markup의 build-time source/component 분리
- compatibility CSS 추가 축소
- required status check key `Regression 36` rename은 repository ruleset과 workflow를 함께 변경

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

### v2.2 ownership

- `src/v2/bootstrap.js` — runtime composition root · release `2.2.0`
- `src/v2/domain/matching-engine.js` — matching domain engine
- `src/v2/domain/elo-engine.js` — ELO domain engine
- `src/v2/state/product-store.js` — persisted product state
- `src/v2/state/scenario-store.js` — domain-derived scenario state
- `src/v2/ui/home-controller.js` — Home interaction
- `src/v2/ui/filter-results-controller.js` — Filter/Result interaction
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation adapter
- `src/v2/ui/secondary-controller.js` — Evaluation/Favorite/Friend/Chat persistence
- `src/v2/ui/screen-effects.js` — observer 기반 screen effects
- `src/v2/ui/product-inspector.js` — Product Validation Inspector UI ownership
- `src/v2/ui/validation-entry.js` — Portfolio validation entry
- `src/v2/styles/product-inspector.css` — Inspector component styles
- `src/v2/styles/tokens.css` / `app.css` — design token / product experience layer

### Compatibility boundary

- `footmate-core.js` — 저수준 score/filter/credit/data-quality core
- `footmate-product-core.js` — 상태 머신·추천 설명·이벤트/KPI core
- `footmate-patches.js` — 기존 DOM render와 persistence 호환; matching/ELO 계산은 domain engine에 위임
- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-product-hardening.js` — policy/state/analytics adapter + v2.2 Inspector UI bridge
- `footmate-product-hardening.css` — v2.2 Inspector stylesheet compatibility alias
- `footmate-experience.css` — visual compatibility layer

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel · Render

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| v2.2 product baseline | **94939d5 · v2.2.0** |
| Regression suite | **PASS** · required-check key는 현재 `Regression 36` |
| Browser E2E · Product + Portfolio | **PASS** |
| Matching domain parity | **PASS** |
| ELO domain parity | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| Representative visual contract | **PASS** |
| 39-screen product baseline | **PASS** |
| 16-slide Case Study IA | **PASS** |
| v2.2 Inspector ownership | **PR #47 · run #146 PASS** |
| v2.2 product-baseline QA | **run #147 · Regression + Browser E2E/axe + HTTP + Chromium PASS** |
| Last exact verified Vercel Production | **3d83a01 · dpl_EvQszpwfiNXXUa2zPn4rTAaNd2Mq · READY** |
| Last exact Vercel Production verification | **run #134 · HTTP + Chromium PASS** |
| v2.2 exact Vercel Production | **PENDING · Hobby quota / latest attempts canceled** |
| Render backup | **LIVE verified baseline · b3125bf · dep-damd0h6gekts73e6hlm0 · main auto-deploy** |

Render 항목은 service/deploy control plane 기준 검증입니다. 별도 strict HTTP/Chromium Production smoke는 Vercel release gate와 구분합니다.

수동 iPhone Safari / VoiceOver / Android Chrome / TalkBack 검증은 v1.1에서 통과했으며, 대규모 제품 UI 변경 시 다시 수행합니다.

## 📚 Documentation

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 정리 후보

세부 변경은 Git commit, Pull Request, GitHub Actions 이력을 source of truth로 사용합니다.
