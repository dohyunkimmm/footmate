# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release · v2.3.0

**v2.3.0 · Compatibility Boundary Reduction**

v2.3은 v2.2의 안정 동작을 회귀 기준으로 유지하면서 Product Experience CSS, scenario persistence, Filter/Results/Recommendation Reason presentation의 canonical ownership을 `src/v2/`로 이동한 구조 고도화 릴리스입니다.

- v2.3 architecture baseline: `bf27784` · PR #52
- exact verified Production SHA: `aaacbdc` · PR #55
- Release runtime: `2.3.0`
- Storage / schema / Product Hardening event contract: `2.1.0` 호환 유지
- v2.2 runtime alias/event: 호환 유지
- Regression baseline: Product / Portfolio mode · 39 screens · 16-slide Case Study
- Matching / ELO ownership: `src/v2/domain/`
- Product Validation Inspector ownership: `src/v2/ui/product-inspector.js`

### v2.3 architecture

- Product Experience, runtime patch/finalize CSS를 `src/v2/styles/` canonical ownership으로 이동
- legacy CSS 파일은 compatibility alias로 유지
- canonical scenario persistence `footmate:v2:scenario` 도입
- legacy runtime state를 덮어쓰지 않는 guarded hydration bridge 도입
- Filter / Results / Recommendation Reason 렌더링을 `src/v2/ui/scenario-presenter.js`로 이동
- `FootMateV23` + `footmate:v2.3:ready`를 정식 release contract로 노출
- `FootMateV22` + `footmate:v2.2:ready`는 compatibility contract로 유지
- Case Study release badge/note를 v2.3 Compatibility Boundary 기준으로 동기화

### QA / Production verification

- PR #52 QA run #163: Regression 36 + Browser E2E/axe **PASS**
- PR #55 QA run #167: Regression 36 + Browser E2E/axe **PASS**
- exact Production verification main `aaacbdc` · run #168:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - strict Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**
  - v2.3 release metadata / canonical scenario ownership / v2.2 compatibility assertions **PASS**
- Vercel Production:
  - SHA: `aaacbdc5edccdc7dd89404e6fde439f36e1df091`
  - deployment: `dpl_86HgVTqT4aK5aCx5vhyYLipaK4W8`
  - state: **READY**
- Render backup:
  - service: `footmate-backup`
  - SHA: `aaacbdc5edccdc7dd89404e6fde439f36e1df091`
  - deployment: `dep-damil8h7lnhs73ccu1r0`
  - state: **live**
- v2.3 Production release gate: **CLOSED**

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
- 접근 가능한 Product Validation Inspector
- Case Study의 `Problem → Hypothesis → Design → Validation → Result` 구조

## 🧩 Runtime Structure

### v2.3 ownership

- `src/v2/bootstrap.js` — runtime composition root · release `2.3.0`
- `src/v2/domain/matching-engine.js` — matching domain engine
- `src/v2/domain/elo-engine.js` — ELO domain engine
- `src/v2/state/product-store.js` — persisted product state
- `src/v2/state/scenario-store.js` — domain-derived scenario state
- `src/v2/state/scenario-persistence.js` — canonical scenario persistence
- `src/v2/compat/scenario-persistence-bridge.js` — guarded legacy hydration bridge
- `src/v2/ui/scenario-presenter.js` — Filter / Results / Recommendation Reason presentation
- `src/v2/ui/home-controller.js` — Home interaction
- `src/v2/ui/filter-results-controller.js` — Filter/Result interaction adapter
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation adapter
- `src/v2/ui/secondary-controller.js` — Evaluation/Favorite/Friend/Chat persistence
- `src/v2/ui/product-inspector.js` — Product Validation Inspector UI ownership
- `src/v2/ui/screen-effects.js` — observer 기반 screen effects
- `src/v2/ui/validation-entry.js` — Portfolio validation entry
- `src/v2/styles/experience.css` — Product Experience canonical visual layer
- `src/v2/styles/compatibility-patches.css` / `compatibility-finalize.css` — compatibility visual ownership
- `src/v2/styles/product-inspector.css` — Inspector component styles
- `src/v2/styles/tokens.css` / `app.css` — design token / mode layer

### Compatibility boundary

- `footmate-core.js` — 저수준 score/filter/credit/data-quality core
- `footmate-product-core.js` — 상태 머신·추천 설명·이벤트/KPI core
- `footmate-patches.js` — 일부 기존 DOM render/persistence compatibility; matching/ELO는 domain engine에 위임
- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-product-hardening.js` — policy/state/analytics adapter + Inspector UI bridge
- legacy CSS entry files — canonical `src/v2/styles/`를 가리키는 compatibility alias

## 🔭 Next Architecture Candidates

- 큰 `demo-source.html` markup의 build-time source/component 분리
- `footmate-patches.js`에 남은 DOM/persistence compatibility ownership 추가 축소
- required status check key `Regression 36` rename은 repository ruleset + workflow와 함께 수행

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel · Render

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| v2.3 architecture baseline | **bf27784 · PR #52 · v2.3.0** |
| exact verified Production SHA | **aaacbdc · PR #55** |
| Regression suite | **PASS** · required-check key `Regression 36` |
| Browser E2E · Product + Portfolio | **PASS** |
| Matching / ELO domain parity | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| Representative visual contract | **PASS** |
| 39-screen product baseline | **PASS** |
| 16-slide Case Study IA | **PASS** |
| v2.3 exact Vercel Production | **aaacbdc · dpl_86HgVTqT4aK5aCx5vhyYLipaK4W8 · READY** |
| v2.3 exact Production verification | **run #168 · strict HTTP + Chromium PASS** |
| Render backup | **aaacbdc · dep-damil8h7lnhs73ccu1r0 · live** |

Render는 Vercel과 독립적인 배포 경로입니다. exact Vercel Production verification은 GitHub Actions의 exact deployment wait + strict HTTP/Chromium gate로 판단합니다.

수동 iPhone Safari / VoiceOver / Android Chrome / TalkBack 검증은 v1.1에서 통과했으며, 대규모 제품 UI 변경 시 다시 수행합니다.

## 📚 Documentation

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 구조 후보

moving `main`은 문서-only merge로 전진할 수 있으므로, 제품/runtime baseline과 exact verified Production SHA는 별도로 유지합니다. 세부 변경과 현재 branch head는 Git commit, Pull Request, GitHub Actions 이력을 source of truth로 사용합니다.
