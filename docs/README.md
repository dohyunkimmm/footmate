# FootMate Documentation

현재 제품 설명의 Source of Truth는 repository root `README.md`, 실제 Case Study `/`, Real App `/app`입니다. 버전 번호는 사용자-facing 제품명으로 쓰지 않고 GitHub release engineering과 검증 이력에서만 관리합니다.

## Current product

- Root `README.md` — 현재 제품 가치, 사용자 여정, AI Agent Workflow, 연동/미연동 경계, release readiness 기준
- Case Study `/` — 13-section product-first narrative
- Real App `/app` — 현재 사용자 경험
- Guided `/app?mode=guided` — 설명이 포함된 리뷰 흐름
- Evidence `/app?mode=evidence` — 구현·검증 근거 확인용 흐름

## Current release engineering docs

현재 기준으로 직접 유지하는 문서는 아래 다섯 개입니다.

- `RELEASE-HISTORY.md` — verified durable release history, exact runtime SHA, QA, Vercel/Render verification
- `BETA-PILOT-RUNBOOK.md` — Closed Beta 실제 운영, transactional email 관측·복구, Pilot QA/정리 기준
- `V5.1.1-AI-RESILIENCE-PATCH.md` — current AI provider/timeout/state/request guard patch contract
- `V5.1-AI-MATCH-ASSISTANT.md` — current AI Match Assistant architecture and acceptance contract
- `README.md` — 이 documentation index와 현재/역사 문서 경계

## Impact-aware QA

GitHub Actions QA는 변경 영향에 맞게 실행한다.

- runtime/product 변경: `Regression 36` + `Browser E2E + axe`를 실행하고, `main` push에서 필요한 `Production Smoke`까지 수행한다.
- docs/workflow-only 변경: `Change Impact`가 non-runtime으로 분류하면 `Docs-only QA`에서 `git diff --check`와 documentation-facing connected-platform contract를 실행하고 무거운 Regression/Browser E2E/Production Smoke는 skip한다.
- `queued` / `in_progress`는 실패나 stuck을 의미하지 않으며, 실제 failure/cancel/timeout 또는 progress 정지 근거가 있을 때만 이상 상태로 판단한다.

## Final sync-up rule

중요 runtime 변경이나 Production 수동 QA가 최종 확정된 뒤에는 아래 순서로 durable 상태를 닫는다.

`최종 runtime/수동 QA 확정 → README → Release History → Case Study → Runbook(절차 변경 시) → Notion 관련 페이지 → 서로 상충하는 pending/미검증 문구 검색 → QA/merge`

완료 사실이 새로 확정되면 과거 문서의 `별도 확인 대상`, `미검증`, `pending` 같은 표현과 충돌하지 않는지 반드시 다시 검색한다. 제품/배포 사실과 절차 문서가 모두 일치하기 전에는 최종 sync-up 완료로 표현하지 않는다.

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
