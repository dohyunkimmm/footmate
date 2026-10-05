# FootMate Documentation

현재 제품 설명의 Source of Truth는 repository root `README.md`, 실제 Real App `/app`, Closed Beta `/beta`와 현재 GitHub/Production 상태입니다. 버전 번호는 사용자-facing 제품명으로 쓰지 않고 GitHub release engineering과 검증 이력에서만 관리합니다.

## Current product

- Root `README.md` — 현재 제품 가치, 사용자 여정, AI Agent Workflow, 연동/미연동 경계, release readiness 기준
- Real App `/app` — 현재 사용자 경험
- Closed Beta `/beta` — connected Beta 사용자 경로
- Closed Beta Operator `/beta/operator` — allowlisted + TOTP MFA 운영자 경로
- Guided `/app?mode=guided` — 설명이 포함된 리뷰 흐름
- Evidence `/app?mode=evidence` — 구현·검증 근거 확인용 흐름
- Case Study `/` — 리뷰어용 설명 화면. 명시적인 Case Study 수정 요청은 이 저장소의 `src/case-study`와 생성 bundle에서 반영하고 해당 화면을 QA

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
- [CASE-STUDY-COPY-QA-CORRECTIONS.md](CASE-STUDY-COPY-QA-CORRECTIONS.md) — Case Study copy QA 정정 기록

## Impact-aware QA

GitHub Actions QA는 변경 영향에 맞게 실행한다.

- runtime/product 변경: `Regression 36` + `Browser E2E + axe`를 실행하고, `main` push에서 필요한 `Production Smoke`까지 수행한다.
- UI/UX/layout 변경: 변경된 FootMate surface 자체의 Playwright `toHaveScreenshot()` actual comparison을 추가로 통과해야 하며 baseline 생성만으로 PASS 처리하지 않는다.
- docs/workflow-only 변경: `Change Impact`가 non-runtime으로 분류하면 `Docs-only QA`에서 `git diff --check`와 documentation-facing connected-platform contract를 실행하고 무거운 Regression/Browser E2E/Production Smoke는 skip한다.
- `queued` / `in_progress`는 실패나 stuck을 의미하지 않으며, 실제 failure/cancel/timeout 또는 progress 정지 근거가 있을 때만 이상 상태로 판단한다.

## Final sync-up rule

중요 runtime 변경이나 Production 수동 QA가 최종 확정된 뒤에는 아래 순서로 durable 상태를 닫는다.

`최종 runtime/수동 QA 확정 → README → Release History/Correction → Runbook(절차 변경 시) → Notion 관련 페이지(장기 제품 사실이 바뀐 경우) → Case Study 설명·대표 화면 점검(material change인 경우) → 서로 상충하는 pending/미검증 문구 검색 → QA/merge`

완료 사실이 새로 확정되면 과거 문서의 `별도 확인 대상`, `미검증`, `pending` 같은 표현과 충돌하지 않는지 반드시 다시 검색한다. 제품/배포 사실과 절차 문서가 모두 일치하기 전에는 최종 sync-up 완료로 표현하지 않는다. 과거 Release History 자체를 보존해야 하는 경우에는 `RELEASE-HISTORY-CORRECTIONS.md`에 supersession을 명시해 현재 해석을 분리한다.

Case Study는 Product package release와 version-coupling하지 않는다. FootMate의 작은 visual polish, spacing, density, copy, screenshot baseline 변화만으로는 Case Study sync 사유로 보지 않는다. FootMate의 설명·기능 구조·핵심 flow·성과 근거·대표 화면이 materially 달라지면 Case Study sync 필요 여부를 점검한다. 사용자가 Case Study 수정을 명시적으로 요청한 경우에는 이 저장소의 원본과 생성 bundle을 함께 수정하고, 변경된 `/` 화면의 동작·접근성·모바일 표시를 검증한다.

제품 사실을 업데이트할 때는 사용자-facing 현재 상태와 release engineering 기록을 분리합니다. 일시적인 quota, pending, canceled 같은 운영 상태는 durable 문서에 누적하지 않습니다. QA 파일도 현재 gate에서 사용하는 suite와 필요한 compatibility regression만 유지하고, 과거 release marker에 고정된 snapshot은 current parity를 이관한 뒤 제거합니다.
