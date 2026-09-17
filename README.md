# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo · Product mode](https://footmate-black.vercel.app/demo)
- [Live Demo · Portfolio mode](https://footmate-black.vercel.app/demo?mode=portfolio)
- [Case Study](https://footmate-black.vercel.app/)
- [Release History](docs/RELEASE-HISTORY.md)
- [v2 Architecture](docs/V2-RELEASE.md)

## 🚀 Current Development

**v2.0.0-beta.1 · Product Experience Architecture**

v2는 v1.1의 39개 화면과 운영 정책을 유지하면서 runtime/UI 경계를 정리하는 구조 전환입니다.

- native ES module 기반 `src/v2/` runtime 도입
- Product mode와 Portfolio mode 분리
- 새 v2 UI 동작은 `goScreen`을 추가 재래핑하지 않고 active screen observer 사용
- versioned UI storage `footmate:v2:ui`
- canonical color / spacing / typography / radius token 도입
- 320 / 375 / 390 / 430 px responsive QA
- GitHub Actions Node 24 runtime 전환
- 기존 Matching / ELO / Payment / Operations logic과 persisted state 호환 유지

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

### v2 boundary

- `src/v2/bootstrap.js` — v2 runtime entry
- `src/v2/core/mode.js` — Product / Portfolio mode
- `src/v2/core/screen-observer.js` — active screen 관찰
- `src/v2/core/storage.js` — versioned UI persistence
- `src/v2/ui/validation-entry.js` — Portfolio validation entry
- `src/v2/styles/tokens.css` — canonical design tokens
- `src/v2/styles/app.css` — v2 product experience layer

### Compatibility layer

- `demo.html` / `demo-source.html` — 39-screen prototype source
- `demo-shell.html` — Production `/demo` shell
- `footmate-core.js` — 필터 · 매칭 · 추천 · 크레딧 · 데이터 품질 core logic
- `footmate-product-core.js` — 상태 머신 · 추천 설명 · 이벤트 · KPI logic
- `footmate-patches.*` / `footmate-finalize.*` — 기존 runtime synchronization / regression layer
- `footmate-product-hardening.*` — 운영 예외 · 추천 설명 · Product Validation
- `footmate-v1.1.css` — v2 migration 동안 유지하는 visual compatibility layer
- `tests/` / `playwright.config.cjs` — Regression · E2E · accessibility · responsive · Production smoke

v2에서는 새 기능부터 `src/v2/` 경계 안에 추가하고, 기존 patch/finalize layer는 기능 단위로 점진적으로 축소합니다.

## 🛠 Tech

HTML · CSS · JavaScript ES Modules · Node.js 24 · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel

## 👤 Role

기획 · UX/IA · 정책 설계 · 프로토타입 구현 · QA · 배포를 직접 수행했습니다.

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다.

추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용합니다. 운영 상태와 KPI 역시 simulation / 현재 세션 관측이며 실제 결제 · 외부 AI 모델 · DB · 실시간 알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

v2 beta PR에서는 다음을 release gate로 사용합니다.

| 검증 | 기준 |
| --- | --- |
| Regression | 36 tests |
| Browser E2E | Product + Portfolio mode |
| axe WCAG 2 A/AA | serious / critical 0 |
| Responsive | 320 / 375 / 390 / 430 px |
| Production HTTP smoke | main merge 후 |
| Production Chromium smoke | main merge 후 |
| Vercel | GitHub main SHA와 동일 |

수동 iPhone Safari / VoiceOver / Android Chrome / TalkBack 검증은 v1.1에서 통과했으며, v2의 제품 UI가 추가로 크게 바뀌는 단계에서 다시 수행합니다.

## 📚 Documentation

- `README.md` — 현재 제품/구조/검증 상태
- `docs/V2-RELEASE.md` — 현재 v2 구조 전환 범위와 release gate
- `docs/RELEASE-HISTORY.md` — 릴리스와 과거 검증 baseline 요약

v2가 안정 릴리스되면 `docs/V2-RELEASE.md`의 핵심 사실을 Release History에 흡수하고 working tree 문서를 다시 최소화합니다.
