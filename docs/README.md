# FootMate Documentation

현재 제품 설명의 Source of Truth는 repository root `README.md`, 실제 Real App `/app`, Closed Beta `/beta`와 현재 GitHub/Production 상태입니다. 버전 번호는 사용자-facing 제품명으로 쓰지 않고 GitHub release engineering과 검증 이력에서만 관리합니다.

## Current product

- Root `README.md` — 현재 제품 가치, 사용자 여정, AI Agent Workflow, 연동/미연동 경계, release readiness 기준
- Real App `/app` — 현재 사용자 경험
- Closed Beta `/beta` — connected Beta 사용자 경로
- Closed Beta Operator `/beta/operator` — allowlisted + TOTP MFA 운영자 경로
- Guided `/app?mode=guided` — 설명이 포함된 리뷰 흐름
- Evidence `/app?mode=evidence` — 구현·검증 근거 확인용 흐름
- Case Study `/` — 별도 Case Study 프로젝트의 read-only reference surface. FootMate 작업에서 직접 수정·QA·동기화하지 않음

## Current release engineering docs

FootMate에서 현재 직접 유지하는 release/product 문서는 아래 일곱 개입니다.

- `RELEASE-HISTORY.md` — verified durable release history, exact runtime SHA, QA, Vercel/Render verification
- `RELEASE-HISTORY-CORRECTIONS.md` — 이후 검증에서 정정된 범위/승인 기준. 기존 Release History와 충돌하면 더 최신 correction이 현재 기준
- `CASE-STUDY-COPY-QA-CORRECTIONS.md` — Case Study reference copy의 이후 승인 변경. `CASE-STUDY-COPY-QA.md`와 충돌하면 더 최신 correction이 현재 기준
- `BETA-PILOT-RUNBOOK.md` — Closed Beta 실제 운영, transactional email 관측·복구, Pilot QA/정리 기준
- `V5.1.1-AI-RESILIENCE-PATCH.md` — current AI provider/timeout/state/request guard patch contract
- `V5.1-AI-MATCH-ASSISTANT.md` — current AI Match Assistant architecture and acceptance contract
- `README.md` — 이 documentation index와 현재/역사 문서 경계

`CASE-STUDY-COPY-QA.md`와 Case Study 관련 baseline/설명 파일은 현재 FootMate 작업의 수정 대상이 아니라 별도 Case Study 프로젝트 상태를 확인할 때만 사용하는 read-only reference로 취급합니다. 과거 Case Study PR·SHA·QA 이력은 Release History/Corrections에 역사적 근거로 보존할 수 있지만 FootMate의 현재 실행 계약으로 사용하지 않습니다. Case Study reference copy의 이후 승인 변경은 `CASE-STUDY-COPY-QA-CORRECTIONS.md`에서 supersession을 확인합니다.

## Impact-aware QA

GitHub Actions QA는 변경 영향에 맞게 실행한다.

- runtime/product 변경: `Regression 36` + `Browser E2E + axe`를 실행하고, `main` push에서 필요한 `Production Smoke`까지 수행한다.
- UI/UX/layout 변경: 변경된 FootMate surface 자체의 Playwright `toHaveScreenshot()` actual comparison을 추가로 통과해야 하며 baseline 생성만으로 PASS 처리하지 않는다.
- docs/workflow-only 변경: `Change Impact`가 non-runtime으로 분류하면 `Docs-only QA`에서 `git diff --check`와 documentation-facing connected-platform contract를 실행하고 무거운 Regression/Browser E2E/Production Smoke는 skip한다.
- `queued` / `in_progress`는 실패나 stuck을 의미하지 않으며, 실제 failure/cancel/timeout 또는 progress 정지 근거가 있을 때만 이상 상태로 판단한다.

## Final sync-up rule

중요 runtime 변경이나 Production 수동 QA가 최종 확정된 뒤에는 아래 순서로 durable 상태를 닫는다.

`최종 runtime/수동 QA 확정 → README → Release History/Correction → Runbook(절차 변경 시) → Notion 관련 페이지(장기 제품 사실이 바뀐 경우) → Case Study sync 필요 여부 표시(material change인 경우) → 서로 상충하는 pending/미검증 문구 검색 → QA/merge`

완료 사실이 새로 확정되면 과거 문서의 `별도 확인 대상`, `미검증`, `pending` 같은 표현과 충돌하지 않는지 반드시 다시 검색한다. 제품/배포 사실과 절차 문서가 모두 일치하기 전에는 최종 sync-up 완료로 표현하지 않는다. 과거 Release History 자체를 보존해야 하는 경우에는 `RELEASE-HISTORY-CORRECTIONS.md`에 supersession을 명시해 현재 해석을 분리한다.

Case Study는 별도 프로젝트에서 관리한다. FootMate의 작은 visual polish, spacing, density, copy, screenshot baseline 변화만으로는 Case Study sync 사유로 보지 않는다. 반대로 FootMate의 설명·기능 구조·핵심 flow·성과 근거·대표 화면이 materially 달라져 Case Study가 stale해지는 경우에는 Case Study 파일을 이 프로젝트에서 직접 수정하지 않고 `Case Study sync 필요`로 표시한다.

## Historical archive

완료된 roadmap·이전 release architecture·과거 운영 문서는 `archive/`에 보존합니다. 현재 runtime 또는 Production 사실의 Source of Truth로 사용하지 않습니다.

- `archive/V4-ARCHITECTURE.md`
- `archive/V4-RELEASE-CHECKLIST.md`
- `archive/V4.1-V5.0-ROADMAP.md`
- `archive/V4.8-ARCHITECTURE.md`
- `archive/V4.9-V5-RELEASE-CANDIDATE.md`
- `archive/V5.0-CONNECTED-MATCHDAY-PLATFORM.md`

제품 사실을 업데이트할 때는 사용자-facing 현재 상태와 release engineering 기록을 분리합니다. 일시적인 quota, pending, canceled 같은 운영 상태는 durable 문서에 누적하지 않습니다. QA 파일도 현재 gate에서 사용하는 suite와 필요한 compatibility regression만 유지하고, 과거 release marker에 고정된 snapshot은 current parity를 이관한 뒤 제거합니다.

- [서비스 기획 근거](SERVICE-PLANNING-EVIDENCE.md): 역할·목표·우선순위·대안·8개 KPI 측정 설계와 검증 한계
- [과업 기반 사용자 검증 근거](USER-TEST-EVIDENCE.md): 같은 교육과정을 수강한 교육생 6명의 iOS·Android 탐색·가입 과업, 반복 검증 방식과 해석 한계