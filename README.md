# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Backup deployment · Render](https://footmate-backup.onrender.com)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release · v2.4.0

**v2.4.0 · Core Funnel Experience**

v2.4는 v2.3의 안정 동작을 회귀 기준으로 유지하면서 Home → Filter → Results → Detail → Payment를 하나의 명확한 의사결정 흐름으로 재설계하고, 새 UI ownership을 `src/v2/` component/presenter/style 경계로 이동한 UX·구조 고도화 릴리스입니다.

- architecture baseline: `9afd19e` · PR #57
- product/runtime baseline: `21c6ab4` · PR #58
- exact verified Production descendant: `b38e147` · PR #61
- Release runtime: `2.4.0`
- Storage / schema / Product Hardening event contract: `2.1.0` 호환 유지
- v2.2 / v2.3 runtime alias/event: 호환 유지
- Regression baseline: Product / Portfolio mode · 39 screens · 16-slide Case Study
- Matching / ELO ownership: `src/v2/domain/`
- v2.4 release gate: **CLOSED**

### v2.4 experience / architecture

- Home → Filter → Results → Detail → Payment 진행 단계를 하나의 core funnel로 연결
- 조건 요약, 추천 비교, 추천 근거, 상태 피드백, 복구 행동, 결제 단계 안내 추가
- 320px 포함 모바일 CTA/터치 타깃 및 접근성 대비 강화
- 새 funnel markup ownership: `src/v2/demo/core-funnel-components.js`
- core funnel styles ownership: `src/v2/styles/core-funnel.css`
- Detail presentation ownership을 `src/v2/ui/scenario-presenter.js`로 확장
- legacy `demo-source.html`에 v2.4 markup이 다시 유입되지 않도록 CI boundary gate 추가
- v2.3 canonical scenario persistence와 `2.1.0` storage/schema/event compatibility 유지
- compatibility Production smoke와 exact Production verification을 테스트 계약에서 분리

### QA / deployment state

- PR #57 run #173: Regression 36 + Browser E2E/axe **PASS**
- PR #58 run #175: checkout completion contrast hotfix · Regression 36 + Browser E2E/axe **PASS**
- QA contract sync main run #178:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - compatibility Production HTTP smoke **PASS**
  - compatibility Production Chromium render smoke **PASS**
- exact Production verification main run #182:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**
- exact v2.4 Vercel Production:
  - SHA `b38e14765a169715d4309036aeb8eb07663e304e`
  - deployment `dpl_GyvevKkNYEgRkJKJrXLuAwekXmCm`
  - state **READY**
- Render exact release deployment:
  - SHA `b38e14765a169715d4309036aeb8eb07663e304e`
  - deployment `dep-damk034s728c73c5ood0`
  - state **live**

## ✨ Key Features

- 5개 사용자 입력 기반 동적 ELO 계산
- 날짜 · 지역 · 시간대 · 거리 · 경기 방식 · 모집 포지션 기반 후보 eligibility
- ELO · 플레이 조건 · 위치 기반 매칭 점수와 추천 정렬
- 추천 점수 분해, 제외 이유, 필터 완화 fallback, 조건 변경 전/후 비교
- Home → Filter → Results → Detail → Payment 핵심 funnel 안내
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

### v2.4 ownership

- `src/v2/bootstrap.js` — runtime composition root · release `2.4.0`
- `src/v2/domain/matching-engine.js` — matching domain engine
- `src/v2/domain/elo-engine.js` — ELO domain engine
- `src/v2/state/product-store.js` — persisted product state
- `src/v2/state/scenario-store.js` — domain-derived scenario state
- `src/v2/state/scenario-persistence.js` — canonical scenario persistence
- `src/v2/compat/scenario-persistence-bridge.js` — guarded legacy hydration bridge
- `src/v2/demo/core-funnel-components.js` — v2.4 core funnel component markup
- `src/v2/ui/scenario-presenter.js` — Filter / Results / Recommendation Reason / Detail presentation
- `src/v2/ui/home-controller.js` — Home interaction
- `src/v2/ui/filter-results-controller.js` — Filter/Result interaction adapter
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation adapter
- `src/v2/ui/secondary-controller.js` — Evaluation/Favorite/Friend/Chat persistence
- `src/v2/ui/product-inspector.js` — Product Validation Inspector UI ownership
- `src/v2/styles/core-funnel.css` — v2.4 core funnel visual ownership
- `src/v2/styles/experience.css` — Product Experience canonical visual layer
- `src/v2/styles/compatibility-patches.css` / `compatibility-finalize.css` — compatibility visual ownership
- `src/v2/styles/product-inspector.css` — Inspector component styles
- `src/v2/styles/tokens.css` / `app.css` — design token / mode layer

### Compatibility boundary

- `footmate-core.js` — 저수준 score/filter/credit/data-quality core
- `footmate-product-core.js` — 상태 머신·추천 설명·이벤트/KPI core
- `footmate-patches.js` — 일부 기존 DOM/persistence compatibility; matching/ELO는 domain engine에 위임
- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-product-hardening.js` — policy/state/analytics adapter + Inspector UI bridge
- legacy CSS entry files — canonical `src/v2/styles/`를 가리키는 compatibility alias

## 🔭 Next Architecture Candidates

- 큰 `demo-source.html`의 build-time source/component 분리 확대
- `footmate-patches.js`에 남은 DOM/persistence compatibility ownership 추가 축소
- required status check key `Regression 36` rename은 repository ruleset + workflow와 함께 수행

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel · Render

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다. 추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용하며 실제 결제 · 외부 AI 모델 · DB · 실시간 알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| v2.4 architecture baseline | **9afd19e · PR #57 · v2.4.0** |
| v2.4 product/runtime baseline | **21c6ab4 · PR #58** |
| exact verified Production descendant | **b38e147 · PR #61** |
| Regression suite | **PASS** · run #182 |
| Browser E2E · Product + Portfolio | **PASS** · run #182 |
| Matching / ELO domain parity | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| Representative visual contract | **PASS** |
| 39-screen product baseline | **PASS** |
| 16-slide Case Study IA | **PASS** |
| exact Vercel Production wait | **PASS** · run #182 |
| Production HTTP + strict Chromium | **PASS** · run #182 |
| exact Vercel Production | **b38e147 · dpl_GyvevKkNYEgRkJKJrXLuAwekXmCm · READY** |
| Render exact release | **b38e147 · dep-damk034s728c73c5ood0 · live** |
| v2.4 release gate | **CLOSED** |

Compatibility smoke는 exact Production verification이 아닙니다. Render와 Vercel은 독립적인 배포 경로이며, exact Production 검증은 exact deployment wait + strict HTTP/Chromium gate가 통과한 SHA만 기록합니다.

수동 iPhone Safari / VoiceOver / Android Chrome / TalkBack 검증은 v1.1에서 통과했으며, 대규모 제품 UI 변경 시 다시 수행합니다.

## 📚 Documentation

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 구조 후보

moving `main`은 QA/docs-only merge로 전진할 수 있으므로, 제품/runtime baseline과 exact verified Production SHA를 별도로 유지합니다. 세부 변경과 현재 branch head는 Git commit, Pull Request, GitHub Actions 이력을 source of truth로 사용합니다.
