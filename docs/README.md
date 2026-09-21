# FootMate Documentation

현재 제품 설명의 Source of Truth는 repository root `README.md`, 실제 Case Study `/`, Real App `/app`입니다. 버전 번호는 사용자-facing 제품명으로 쓰지 않고 GitHub release engineering과 검증 이력에서만 관리합니다.

## Current product

- Root `README.md` — 현재 제품 가치, 사용자 여정, AI Agent Workflow, 연동/미연동 경계, release readiness 기준
- Case Study `/` — 16-section product-first narrative
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

## Historical archive

완료된 roadmap·이전 release architecture·과거 운영 문서는 `archive/`에 보존합니다. 현재 runtime 또는 Production 사실의 Source of Truth로 사용하지 않습니다.

- `archive/V4-ARCHITECTURE.md`
- `archive/V4-RELEASE-CHECKLIST.md`
- `archive/V4.1-V5.0-ROADMAP.md`
- `archive/V4.8-ARCHITECTURE.md`
- `archive/V4.9-V5-RELEASE-CANDIDATE.md`
- `archive/V5.0-CONNECTED-MATCHDAY-PLATFORM.md`

제품 사실을 업데이트할 때는 사용자-facing 현재 상태와 release engineering 기록을 분리합니다. 일시적인 quota, pending, canceled 같은 운영 상태는 durable 문서에 누적하지 않습니다. QA 파일도 현재 gate에서 사용하는 suite와 필요한 compatibility regression만 유지하고, 과거 release marker에 고정된 snapshot은 current parity를 이관한 뒤 제거합니다.
