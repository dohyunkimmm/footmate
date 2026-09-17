# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Development

**v2.0.0-beta.2 · Runtime Migration**

- Product/runtime baseline: `84c698b`
- GitHub PR #21 merged to `main`
- QA/CI follow-ups: PR #22, #23 — product behavior change 없음
- GitHub Actions run #79: Regression · Browser E2E + axe · Production HTTP · Production Chromium **PASS**
- Vercel: `84c698b` verified / Production READY

v2 beta2는 beta1에서 만든 ES module 경계를 실제 상태·상호작용의 주 소유자로 확장한 단계입니다.

- Product / Portfolio mode 분리 유지
- `src/v2/state/` product/scenario store 도입
- Home · Filter · Result · Payment · Participation · Evaluation · Favorite · Friend · Chat 상호작용을 v2 controller로 이동
- 핵심 사용자 흐름의 inline event handler 제거
- `goScreen` 재래핑 제거: screen observer 기반 side effect 처리
- `footmate-finalize.js`를 persisted state compatibility bridge로 축소
- 중복 `footmate-persist-extra.js` 제거
- 결제 중복 차감 방지 및 legacy state migration 유지
- canonical design token + 320 / 375 / 390 / 430 px responsive gate
- 대표 화면 visual contract regression 추가
- GitHub Actions Node 24 + product-impact aware Production smoke

### Demo modes

- `/demo` — **Product mode**: 실제 사용자 흐름 중심. 포트폴리오/검증 UI를 제품 화면에서 제거합니다.
- `/demo?mode=portfolio` — **Portfolio mode**: Flow Nav와 Product Validation inspector를 통해 추천 근거, 운영 정책, 이벤트/KPI를 검증합니다.

## ✨ Key Features

- 5개 사용자 입력 기반 동적 ELO 계산
- 날짜 · 지역 · 시간대 · 거리 · 경기 방식 · 모집 포지션 기반 후보 eligibility
- ELO · 플레이 조건 · 위치 기반 매칭 점수와 추천 정렬
- 추천 점수 분해, 제외 이유, 필터 완화 fallback, 조건 변경 전/후 비교
- 홈 날짜/상태/ELO/거리 필터링
- 선택 경기 → 상세 → 결제 → 참가 상태의 경기 식별자 일관성
- Payment · Participation · Match 상태 머신 기반 운영 시뮬레이션
- 결제 실패/재시도 · 중복 신청 차단 · 취소/환불 · 노쇼 · 대기→빈자리 제안→참가 · 경기 취소
- 크레딧 충전 · 결제 · 환불 · 프로필 상태 동기화와 중복 차감 방지
- 경기 결과 ELO 업데이트와 다음 추천 반영
- 브라우저 재진입 시 핵심 진행 상태와 사용자 선택 복원
- AI Agent Workflow 및 데이터 품질 상태(`PASS` · `CHECK` · `SAMPLE`)
- 이벤트 계약과 핵심 퍼널/KPI 관측
- Portfolio mode의 접근 가능한 Product Validation inspector
- Case Study의 `Problem → Hypothesis → Design → Validation → Result` 구조

## 🧩 Runtime Structure

### v2 ownership

- `src/v2/bootstrap.js` — v2 runtime composition root
- `src/v2/core/mode.js` — Product / Portfolio mode
- `src/v2/core/screen-observer.js` — active screen 관찰
- `src/v2/core/storage.js` — versioned UI persistence
- `src/v2/state/product-store.js` — 결제·즐겨찾기·친구·평가·채팅 등 persisted product state
- `src/v2/state/scenario-store.js` — 필터·선택 경기·추천 scenario state
- `src/v2/ui/home-controller.js` — Home day/filter/match interaction
- `src/v2/ui/filter-results-controller.js` — Filter/Result interaction
- `src/v2/ui/payment-controller.js` — Charge/Payment/Participation adapter
- `src/v2/ui/secondary-controller.js` — Evaluation/Favorite/Friend/Chat persistence
- `src/v2/ui/screen-effects.js` — observer 기반 screen side effects
- `src/v2/ui/validation-entry.js` — Portfolio validation entry
- `src/v2/styles/tokens.css` — canonical design tokens
- `src/v2/styles/app.css` — v2 product experience layer

### Compatibility boundary

- `demo.html` / `demo-source.html` — 39-screen prototype source
- `demo-shell.html` — Production `/demo` shell
- `footmate-core.js` — 매칭·ELO·크레딧·데이터 품질 core logic
- `footmate-product-core.js` — 상태 머신·추천 설명·이벤트·KPI logic
- `footmate-patches.js` — 기존 scenario/render logic을 `FootMateScenarioAdapter` 뒤에서 제공
- `footmate-finalize.js` — **state compatibility bridge only**
- `footmate-product-hardening.js` — 운영 예외·추천 설명·Product Validation state machine adapter
- `footmate-v1.1.css` — v2 migration 동안 유지하는 visual compatibility layer

v2 beta2에서는 새 상태와 사용자 interaction의 소유권을 `src/v2/`로 이동했습니다. Matching/ELO의 기존 계산·render 구현 일부는 호환성을 위해 `footmate-patches.js` 뒤에 남아 있으며, 이는 `FootMateScenarioAdapter`를 통해 v2 store와 연결됩니다.

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel

## 👤 Role

기획 · UX/IA · 정책 설계 · 프로토타입 구현 · QA · 배포를 직접 수행했습니다.

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다.

추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용합니다. 운영 상태와 KPI 역시 simulation / 현재 세션 관측이며 실제 결제 · 외부 AI 모델 · DB · 실시간 알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

v2.0.0-beta.2 제품/runtime 기준 SHA는 `84c698b`입니다. 동일 SHA의 Vercel Production 배포는 READY이며, 이후 QA-only CI 보정까지 포함한 GitHub Actions **run #79**에서 현재 Production을 다시 검증했습니다.

| 검증 | 상태 |
| --- | --- |
| Regression 36 | **PASS** |
| Browser E2E · Product + Portfolio mode | **PASS** |
| v2 store / adapter / duplicate-charge gate | **PASS** |
| Critical inline-handler migration gate | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| Responsive 320 / 375 / 390 / 430 px | **PASS** |
| Representative visual contract | **PASS** |
| Production HTTP smoke | **PASS** |
| Production Chromium render smoke | **PASS** |
| Vercel product/runtime baseline | **84c698b · verified · READY** |

수동 iPhone Safari / VoiceOver / Android Chrome / TalkBack 검증은 v1.1에서 통과했으며, 다음 대규모 제품 UI 변경 시 다시 수행합니다.

## 📚 Documentation

현재 문서는 두 곳만 유지합니다.

- `README.md` — 현재 제품 · 구조 · 검증 상태
- `docs/RELEASE-HISTORY.md` — 현재/과거 릴리스 · 검증 baseline · 후속 정리 후보

세부 변경은 Git commit, Pull Request, GitHub Actions 이력을 source of truth로 사용합니다.
