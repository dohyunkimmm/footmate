# FootMate Documentation

현재 제품 설명의 Source of Truth는 repository root `README.md`, Interactive Demo `/demo`(Release App `/app`과 동일한 체험 런타임), Closed Beta `/beta`와 현재 GitHub/Production 상태입니다. 버전 번호는 사용자-facing 제품명으로 쓰지 않고 GitHub release engineering과 검증 이력에서만 관리합니다.

## Current product

- Root `README.md` — 현재 제품 가치, 사용자 여정, AI Agent Workflow, 연동/미연동 경계, release readiness 기준
- Interactive Demo `/demo` — AI 추천·경기 탐색·참가 흐름을 체험하는 경로. 경기 데이터는 샘플이며 실제 경기 참가·결제 없음
- Real App `/app` — Interactive Demo와 동일한 체험 런타임의 개발·QA용 Release App 경로
- Closed Beta `/beta` — 실제 서버에 연결된 계정·경기·참가 상태를 사용하는 무료 베타 서비스. 실제 결제 없음
- Closed Beta Operator `/beta/operator` — allowlisted + TOTP MFA 운영자 경로
- Guided `/app?mode=guided` — 설명이 포함된 리뷰 흐름
- Evidence `/app?mode=evidence` — 구현·검증 근거 확인용 흐름
- Case Study `/` — 리뷰어용 9단계 설명 화면. 01에서 Interactive Demo와 Closed Beta를 구분해 안내한다. 현재 `src/case-study/nine-sections.{js,css}`에서 직접 로드하며 해당 E2E·접근성·수동 시각 QA로 검증한다. 이전 13단계 생성 bundle은 현재 페이지에 연결되지 않는다.

## Current release engineering docs

FootMate에서 현재 직접 유지하는 release/product 문서는 아래와 같습니다.

- [RELEASE-HISTORY.md](RELEASE-HISTORY.md) — verified durable release history, exact runtime SHA, QA, Vercel/Render verification
- [RELEASE-HISTORY-CORRECTIONS.md](RELEASE-HISTORY-CORRECTIONS.md) — 이후 검증에서 정정된 범위/승인 기준. 기존 Release History와 충돌하면 더 최신 correction이 현재 기준
- [RELEASE-APP.md](RELEASE-APP.md) — current Release App v6 IA, state ownership, free Join, MY lifecycle, provider boundary와 QA contract
- [BETA-PILOT-RUNBOOK.md](BETA-PILOT-RUNBOOK.md) — Closed Beta 실제 운영, transactional email 관측·복구, Pilot QA/정리 기준
- [BETA-MEASUREMENT-READINESS.md](BETA-MEASUREMENT-READINESS.md) — Validation Metric을 실제 Beta Measured Result로 전환하기 위한 계측·표본·판정 기준

## Evidence docs

- [SERVICE-PLANNING-EVIDENCE.md](SERVICE-PLANNING-EVIDENCE.md) — 역할·목표·우선순위·대안·8개 KPI 측정 설계와 검증 한계
- [USER-TEST-EVIDENCE.md](USER-TEST-EVIDENCE.md) — 같은 교육과정을 수강한 교육생 6명의 iOS·Android 탐색·가입 과업, 반복 검증 방식과 해석 한계
- [CASE-STUDY-NINE-STAGES.md](CASE-STUDY-NINE-STAGES.md) — 현재 9단계 구성, 화면·근거 구분과 이동 검증 기준
- [CASE-STUDY-TYPOGRAPHY-QA.md](CASE-STUDY-TYPOGRAPHY-QA.md) — 현재 9단계 글자 크기·행 정렬·대체 폰트·텍스트 확대 QA
- [CASE-STUDY-VISUAL-QA.md](CASE-STUDY-VISUAL-QA.md) — 현재 9단계 시각 위계·이미지 확대·모바일 근거 읽기 QA
- [CASE-STUDY-COPY-QA-CORRECTIONS.md](CASE-STUDY-COPY-QA-CORRECTIONS.md) — 과거 13단계 Case Study copy QA 정정 이력(현재 9단계 acceptance 아님)

## Historical Case Study references

- [CASE-STUDY-5.2-COMPOSITION.md](CASE-STUDY-5.2-COMPOSITION.md) — 이전 13단계 페이지 구성·로컬 검증 기록. 현재 9단계의 표시·QA 기준으로 사용하지 않는다.
- [RELEASE-HISTORY-CORRECTIONS.md](RELEASE-HISTORY-CORRECTIONS.md)의 이전 Case Study 항목 역시 당시 승인 사실로만 해석한다. 현재 기준은 위 9단계 문서와 `RELEASE-HISTORY.md`의 최신 9단계 Case Study 검증 기록을 우선한다.

## Impact-aware QA

GitHub Actions QA는 변경 영향에 맞게 실행한다.

- runtime/product 변경: `Regression 36` + `Browser E2E + axe`를 실행하고, `main` push에서 필요한 `Production Smoke`까지 수행한다.
- UI/UX/layout 변경: 승인된 픽셀 기준을 보유한 Product 화면은 Playwright `toHaveScreenshot()`으로 실제 화면과 비교하고, baseline 생성만으로 PASS 처리하지 않는다. 현재 9단계 Case Study는 전용 E2E·geometry·axe와 캡처 수동 검토로 검증하며, 캡처만으로 픽셀 baseline 통과를 주장하지 않는다.
- docs/workflow-only 변경: `Change Impact`가 non-runtime으로 분류하면 `Docs-only QA`에서 `git diff --check`와 documentation-facing connected-platform contract를 실행하고 무거운 Regression/Browser E2E/Production Smoke는 skip한다.
- `queued` / `in_progress`는 실패나 stuck을 의미하지 않으며, 실제 failure/cancel/timeout 또는 progress 정지 근거가 있을 때만 이상 상태로 판단한다.

## Final sync-up rule

중요 runtime 변경이나 Production 수동 QA가 최종 확정된 뒤에는 아래 순서로 durable 상태를 닫는다.

`최종 runtime/수동 QA 확정 → README → Release History/Correction → Runbook(절차 변경 시) → Notion 관련 페이지(장기 제품 사실이 바뀐 경우) → Case Study 설명·대표 화면 점검(material change인 경우) → 서로 상충하는 pending/미검증 문구 검색 → QA/merge`

완료 사실이 새로 확정되면 과거 문서의 `별도 확인 대상`, `미검증`, `pending` 같은 표현과 충돌하지 않는지 반드시 다시 검색한다. 제품/배포 사실과 절차 문서가 모두 일치하기 전에는 최종 sync-up 완료로 표현하지 않는다. 과거 Release History 자체를 보존해야 하는 경우에는 `RELEASE-HISTORY-CORRECTIONS.md`에 supersession을 명시해 현재 해석을 분리한다.

Case Study는 Product package release와 version-coupling하지 않는다. FootMate의 작은 visual polish, spacing, density, copy, screenshot baseline 변화만으로는 Case Study sync 사유로 보지 않는다. FootMate의 설명·기능 구조·핵심 flow·성과 근거·대표 화면이 materially 달라지면 Case Study sync 필요 여부를 점검한다. 사용자가 Case Study 수정을 명시적으로 요청한 경우에는 현재 9단계 원본(`src/case-study/nine-sections.js`, `nine-sections.css`)을 수정하고, 변경된 `/` 화면의 동작·접근성·모바일 표시를 검증한다. 과거 13단계 생성 bundle은 현재 `/`에서 로드하지 않으며, 기존 CI 의존성을 정리하기 전에는 별도 변경 대상으로 취급한다.

제품 사실을 업데이트할 때는 사용자-facing 현재 상태와 release engineering 기록을 분리합니다. 일시적인 quota, pending, canceled 같은 운영 상태는 durable 문서에 누적하지 않습니다. QA 파일도 현재 gate에서 사용하는 suite와 필요한 compatibility regression만 유지하고, 과거 release marker에 고정된 snapshot은 current parity를 이관한 뒤 제거합니다.
