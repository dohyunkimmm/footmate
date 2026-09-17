# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 추천 → 상세 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현한 서비스 기획 검증용 프로토타입입니다.

## 🔗 Links

- [Live Demo](https://footmate-black.vercel.app/demo)
- [Case Study](https://footmate-black.vercel.app/)
- [Release History](docs/RELEASE-HISTORY.md)

## 🚀 Current Release

**v1.1 · Experience Polish**

- Product/runtime release baseline: `8d501bd`
- Visual polish · UI/UX refinement · responsive refinement
- Case Study / Live Demo synchronized
- 320 / 375 / 390 px automated responsive QA
- iPhone Safari + VoiceOver manual QA PASS
- Android Chrome + TalkBack manual QA PASS
- Vercel Production verified

`8d501bd` is the v1.1 product/runtime release baseline. Later documentation-only commits do not imply a product behavior change.

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
- 접근 가능한 `제품 검증` 패널에서 운영 상태 · 추천 근거 · KPI 확인
- Case Study의 `Problem → Hypothesis → Design → Validation → Result` 구조

## 🎨 v1.1 Experience Polish

v1.1은 기존 39개 화면의 기능·정책을 유지하면서 제품 경험의 일관성을 높이는 업데이트입니다.

- semantic color / surface / border / status token 정리
- Button · Card · Chip · Navigation · status UI 일관성 강화
- Home 경기 카드와 필터 selected state의 scanability 개선
- Match Detail · Payment · Profile의 정보 위계 개선
- ELO · Game Day · 상태 feedback 표현 통일
- 주요 CTA touch target 44px 이상 검증
- focus-visible · reduced-motion · contrast 보정
- Case Study에 동일한 visual/narrative layer 반영

## 🧩 Runtime Structure

현재 v1.1은 기존 승인 원본을 유지하고 얇은 runtime layer를 주입하는 점진적 구조입니다.

- `index-source.html` — Case Study 원본
- `index.html` / `index-shell.html` / `index-patches.js` — Production Case Study shell
- `case-study-v1.1.css` / `index-v1.1.js` — v1.1 Case Study layer
- `demo.html` / `demo-source.html` — 프로토타입 원본
- `demo-shell.html` — Production `/demo` shell
- `footmate-core.js` — 필터 · 매칭 · 추천 · 크레딧 · 데이터 품질 core logic
- `footmate-product-core.js` — 상태 머신 · 추천 설명 · 이벤트 · KPI logic
- `footmate-patches.*` / `footmate-finalize.*` — runtime synchronization / regression fixes
- `footmate-product-hardening.*` — 운영 예외 · 추천 설명 · Product Validation UI
- `footmate-v1.1.css` — v1.1 visual system layer
- `tests/` / `playwright.config.cjs` — Regression · E2E · accessibility · responsive · Production smoke

v2에서는 이 누적 runtime layer를 정리하고 state / business logic / UI / styles의 경계를 더 명확하게 분리하는 방향을 검토합니다.

## 🛠 Tech

HTML · CSS · JavaScript · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel

## 👤 Role

기획 · UX/IA · 정책 설계 · 프로토타입 구현 · QA · 배포를 직접 수행했습니다.

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다.

추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용합니다. 운영 상태와 KPI 역시 simulation / 현재 세션 관측이며 실제 결제 · 외부 AI 모델 · DB · 실시간 알림 · 운영자 백엔드는 연동하지 않았습니다.

## ✅ Verification

| 검증 | 상태 |
| --- | --- |
| Regression 36 | **PASS** |
| Browser E2E | **PASS** |
| axe WCAG 2 A/AA serious / critical | **0 · PASS** |
| 320 / 375 / 390 px responsive gate | **PASS** |
| Production HTTP smoke | **PASS** |
| Production Chromium render smoke | **PASS** |
| iPhone Safari core flow | **PASS · 사용자 확인** |
| VoiceOver | **PASS · 사용자 확인** |
| Android Chrome core flow | **PASS · 사용자 확인** |
| TalkBack | **PASS · 사용자 확인** |
| Real service integration | **N/A · 현재 범위 밖** |

v1.1 release 검증은 GitHub Actions **run #57**과 동일 SHA의 Vercel Production 배포를 기준으로 합니다. 자동 QA와 사용자 수동 QA는 서로 다른 검증 근거로 구분합니다.

## 📚 Documentation

현재 문서는 의도적으로 최소화합니다.

- `README.md` — 현재 제품/구조/검증 상태
- `docs/RELEASE-HISTORY.md` — 릴리스와 과거 검증 baseline 요약

날짜별 QA · hardening · close-out 문서는 필요한 사실을 Release History에 통합한 뒤 working tree에서 제거했습니다. 원문은 Git history에서 복원할 수 있습니다.
