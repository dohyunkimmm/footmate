# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 조건에 맞는 후보 추천부터 결제 · 체크인 · 경기 결과 · 평가 · 재참여까지의 흐름을 구현했습니다. 39개 화면을 늘리는 대신 운영 예외 정책, 추천 설명력, 데이터 관측과 검증 증거를 runtime 계층에서 강화했습니다.

## 🔗 Links

- [Live Demo](https://footmate-black.vercel.app/demo)
- [Case Study](https://footmate-black.vercel.app/)

## ✨ Key Features

- 5개 사용자 입력 기반 동적 ELO 계산
- 날짜 · 지역 · 시간대 · 거리 · 경기 방식 · 모집 포지션 기반 후보 eligibility
- ELO · 플레이 조건 · 위치 기반 매칭 점수와 추천 정렬
- 추천 점수를 ELO · 거리 · 시간대 · 포지션 · 경기 방식 · 날짜 · 지역 요인으로 분해하고, 제외 이유 · 필터 완화 fallback · 조건 변경 전/후 비교 제공
- 홈 `어제 / 오늘 / 내일` 및 `모집 중 / 내 ELO ±50 / 5km 이내` 실제 목록 필터링
- 선택 경기 → 상세 → 결제 → 참가 상태의 경기 식별자 일관성
- Payment · Participation · Match 상태 머신 기반 운영 시뮬레이션: 결제 실패/재시도, 중복 신청 차단, 취소/환불, 노쇼, 대기→빈자리 제안→참가, 경기 취소
- 단일 크레딧 잔액 기반 충전 · 결제 · 환불 · 프로필 상태 동기화 및 중복 차감 방지
- `크레딧 부족 시뮬레이션`을 명시적 상태 변경으로 분리해 화면 이동·Deep Link의 저장 상태 부작용 차단
- 경기 결과 ELO 업데이트와 변경된 ELO의 다음 추천 반영
- 브라우저 재진입 시 핵심 진행 상태와 홈 필터 · 크레딧 · 평가 · 경기별 즐겨찾기 · 멤버별 친구 추가 · 사용자 채팅 복원
- 기존 boolean 즐겨찾기·친구 저장값의 ID 기반 상태 migration
- AI Agent Workflow 및 데이터 품질 상태(`PASS` · `CHECK` · `SAMPLE`)
- 이벤트 계약(`name` · `timestamp` · `sessionId` · `version` · `metadata`)과 핵심 퍼널 순서 검증, 추천 클릭률 · 신청 전환율 · 노쇼율 · 재참여 의향 KPI 정의/현재 세션 관측
- 접근 가능한 `제품 검증` 패널에서 운영 상태 전이 · 추천 근거 · 퍼널/KPI를 직접 확인
- 접근성을 고려한 동적 ARIA 상태 동기화와 대표 화면/제품 검증 패널 axe WCAG 2 A/AA 자동 gate
- Production Case Study shell의 description · canonical · Open Graph · Twitter Card 메타데이터 및 `Problem → Hypothesis → Design → Validation → Result` 의사결정 요약

## 🧩 Runtime Structure

승인된 큰 HTML 원본은 그대로 유지하고, Case Study와 Demo 모두 얇은 셸에서 최신 runtime 보정·검증 레이어를 주입합니다.

- `index-source.html` — 승인된 Case Study 원본
- `index.html` / `index-shell.html` / `index-patches.js` — Production `/`에서 원본을 로드하고 4탭 IA, 의사결정 요약, Validation proof를 동기화하는 셸·패치. 공유·검색 크롤러용 핵심 메타데이터는 Production shell에 직접 포함
- `demo.html` / `demo-source.html` — 승인된 프로토타입 원본
- `demo-shell.html` — `/demo`에서 원본 HTML을 같은 문서에 로드하고 runtime 자산을 주입
- `footmate-core.js` — 필터링 · 매칭 점수 · 추천 정렬 · 크레딧 · 데이터 품질의 순수 로직
- `footmate-product-core.js` — Payment/Participation/Match 상태 머신, 추천 설명/비교, 이벤트 계약, 퍼널/KPI 순수 로직
- `footmate-patches.js` / `footmate-patches.css` — 추천 · 경기 · ELO 상태 동기화와 UI 회귀 보정
- `footmate-finalize.js` / `footmate-finalize.css` — 홈 필터 · 크레딧 · ID 기반 persistence · Data Quality 심화 검증 · UI/접근성 runtime 보정
- `footmate-product-hardening.js` / `footmate-product-hardening.css` — 운영 예외 · 추천 설명 · PM/데이터를 연결한 접근 가능한 `제품 검증` 패널
- `footmate-persist-extra.js` — 저장된 사용자 채팅의 안전한 화면 복원
- `playwright.config.cjs` / `tests/e2e/*` — 실제 Chromium E2E · axe 접근성 gate · Production browser smoke
- `tests/production-smoke.cjs` — 배포된 Production HTML·runtime 자산 HTTP smoke와 JSON 증거 기록

`/demo`는 원본을 별도 내부 iframe으로 다시 감싸지 않으므로, Case Study에 임베드될 때 iframe 중첩을 한 단계 줄였습니다.

## 🛠 Tech

HTML · CSS · JavaScript · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel

## 👤 Role

기획 · UX/IA · 정책 설계 · 프로토타입 구현 · QA · 배포를 직접 수행했습니다.

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다.  
추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용합니다. 운영 상태 전이와 KPI 값 역시 기획 검증용 simulation/현재 세션 관측이며 실제 결제 · 외부 AI 모델 · DB · 실시간 알림 · 운영자 백엔드는 연동하지 않았습니다.

P0–P2 강화 범위와 설계 의도는 [Product Hardening 기록](docs/PRODUCT-HARDENING-2026-09-11.md)에 정리했습니다.

## ✅ 검증

검증은 **Node 로직/정책 회귀 → 실제 Chromium E2E → 접근성 → Production smoke**의 서로 다른 레이어로 분리합니다.

### Verification Matrix

| 검증 레이어 | 검증 대상 | 방식 | 실행 조건·환경 | 통과 기준 | 증거 | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| Regression | 로직·상태·정책·추천 설명·이벤트 계약 회귀 36개 | Node Test Runner 자동 | PR / `main` | 36/36 성공 | GitHub Actions `Regression 36` | **PASS** |
| Browser E2E | 핵심 사용자 흐름 5개·39화면 runtime·제품 검증 패널 | Playwright Chromium 자동 | PR / `main` | 5/5 성공 + pageerror·same-origin 4xx/5xx·의미 있는 console error 0 | `browser-e2e-*` Artifact | **PASS** |
| Accessibility | 대표 5화면 + `제품 검증` dialog | axe WCAG 2 A/AA 자동 | PR / `main` | serious/critical 0 | Browser E2E report·Artifact | **PASS** |
| Production HTTP | `/`·`/demo`·`/demo-source`·core/final/product runtime 자산·metadata | Node `fetch` smoke 자동 | `main` + 해당 SHA Vercel success 후 | HTTP·content-type·핵심 marker 전부 성공 | `production-smoke.json` | **PASS** |
| Production Browser | Case Study 의사결정 요약·Demo 렌더·39화면·제품 검증 runtime | Playwright Chromium 자동 | `main` Production 배포 후 | 렌더·runtime·홈 이동 성공 + browser/network error 0 | `production-smoke-*` Artifact | **PASS** |
| Mobile Device | iPhone·Android 핵심 흐름 | 사용자 수동 QA | 실제 모바일 기기 | 핵심 흐름 문제 없음 | 사용자 확인 기록 | **PASS · 사용자 확인** |
| Screen Reader | VoiceOver·TalkBack 발화·포커스·동적 상태 | 사용자 수동 QA | 실제 모바일 기기 | 발화·포커스·동적 알림 문제 없음 | 사용자 확인 기록 | **PASS · 사용자 확인** |
| Real Service Integration | 로그인·위치·결제·DB·알림·외부 AI 모델·운영자 백엔드 | 미구현 / 향후 검증 | 실제 서비스 연동 후 | 서버·외부 서비스 기준 E2E | — | **N/A · 현재 범위 밖** |

자동 PASS와 사용자 수동 PASS는 서로 다른 검증 근거이며, 실서비스 연동 미구현 영역을 자동 QA 완료로 간주하지 않습니다. **P0–P2 최신 구현 자동 QA·Production 검증 기준은 [`a6cb6fe`](https://github.com/dohyunkimmm/footmate/commit/a6cb6fed24fb9d8394515596dbbaa15f7127b3cc)**입니다.

### Evidence Index

| Evidence | 무엇을 증명하는가 | Reference | 보존 |
| --- | --- | --- | --- |
| FootMate QA workflow | 최신 PR/`main` 자동 QA 실행 목록 | [GitHub Actions](https://github.com/dohyunkimmm/footmate/actions/workflows/qa.yml) | 지속 |
| Product Hardening snapshot #32 | `a6cb6fe` `main`에서 P0–P2 포함 Regression·Browser·Production 전체 성공 | [Run 34544859908](https://github.com/dohyunkimmm/footmate/actions/runs/34544859908) | 실행 기록 |
| Regression 36 | 상태 머신·추천 설명·이벤트/KPI 계약을 포함한 Node 회귀 36/36 성공 | [Job](https://github.com/dohyunkimmm/footmate/actions/runs/34544859908/job/103095179741) | 실행 기록 |
| Browser E2E + axe | Chromium E2E 5개·대표 화면/제품 검증 패널 axe gate 성공 | [Job](https://github.com/dohyunkimmm/footmate/actions/runs/34544859908/job/103095179612) | 실행 기록 |
| Browser evidence Artifact | Playwright report·실패 시 trace/screenshot 증거 | [browser-e2e-34544859908](https://github.com/dohyunkimmm/footmate/actions/runs/34544859908/artifacts/10178644752) | 2026-09-25까지 |
| Production Smoke | Vercel SHA 확인·확장 HTTP smoke·Production Chromium·증거 업로드 성공 | [Job](https://github.com/dohyunkimmm/footmate/actions/runs/34544859908/job/103095374700) | 실행 기록 |
| Production evidence Artifact | `production-smoke.json`·Playwright Production report | [production-smoke-34544859908](https://github.com/dohyunkimmm/footmate/actions/runs/34544859908/artifacts/10178663131) | 2026-09-25까지 |
| Vercel Production | `a6cb6fe` 배포 status `success`와 실제 Production 배포 | [Deployment](https://vercel.com/dohyunkimm/footmate/7xMECkRT2U1NDk8vijCAc84VewHM) · [Live](https://footmate-black.vercel.app/) | 배포 이력 |
| QA review record | 검증 설계·자동/수동 QA 구분·결함 해결 이력 | [QA-2026-09-11.md](docs/QA-2026-09-11.md) | 지속 |
| Product hardening record | P0 운영 정책·추천 설명·P1 데이터·P2 전달력 설계 범위 | [PRODUCT-HARDENING-2026-09-11.md](docs/PRODUCT-HARDENING-2026-09-11.md) | 지속 |
| Implementation baseline | P0–P2 product hardening 포함 최신 구현 기준 | [`a6cb6fe`](https://github.com/dohyunkimmm/footmate/commit/a6cb6fed24fb9d8394515596dbbaa15f7127b3cc) | 지속 |

Artifact는 GitHub Actions 보존 정책에 따라 14일 후 만료될 수 있습니다. 장기 추적은 workflow 실행 기록·커밋·QA/Product Hardening 기록을 기준으로 합니다. Evidence snapshot은 해당 시점의 불변 검증 기록이며, 최신 실행 상태는 workflow 페이지에서 확인합니다.

Production QA의 첫 완전 통과 기준은 [`15151a5`](https://github.com/dohyunkimmm/footmate/commit/15151a511c36e9ff21a4b499fbaa30656577a072)이며, 접근성 후속 보정 기준은 [`1a450f2`](https://github.com/dohyunkimmm/footmate/commit/1a450f2f9f5b7c0a676ac26de38ada1a25510dab)입니다. 이후 P0–P2 product hardening을 포함한 [`a6cb6fe`](https://github.com/dohyunkimmm/footmate/commit/a6cb6fed24fb9d8394515596dbbaa15f7127b3cc)에서 `Regression 36`, `Browser E2E + axe`, `Production Smoke`가 다시 모두 성공했습니다. `/demo`는 Vercel Production에서 `demo-shell.html`로 정상 라우팅되며, 승인 원본 `demo.html`과 `demo-source.html`은 수정하지 않았습니다.

`main`은 GitHub Ruleset으로 Pull Request를 강제하며 `Regression 36`과 `Browser E2E + axe`를 required status check로 사용합니다. `Production Smoke`는 `main` push 후 해당 SHA의 Vercel 배포를 대상으로 실행합니다.

### Node 회귀 · 36개

```sh
node --test tests/*.test.cjs
```

- `tests/regression.test.cjs` — 기존 프로토타입 회귀 20개: JavaScript·이벤트 핸들러 문법, Deep Link, 화면 이력, 퀴즈·타이머, 지역·결제·참가 상태, ELO, 한글 IME·키보드 등
- `tests/runtime-patch.test.cjs` — runtime/제품 계약 9개: 하드 필터·추천 정렬/설명·상태 머신·Data Quality·퍼널/이벤트 계약·KPI·홈 필터·크레딧
- `tests/quality-hardening.test.cjs` — 품질 보강 7개: shell/승인 원본 동기화, Production metadata, core/product runtime 문법·loader, 저잔액 무부작용, ID 기반 persistence/migration

### 실제 Chromium E2E + axe

GitHub Actions의 `Browser E2E + axe` job은 Playwright Chromium에서 5개 브라우저 검증을 실행합니다.

- Production-like `/demo` shell과 전체 39개 화면·runtime 부팅
- `FootMateProductCore` / `FootMateProductOps` 로드와 `제품 검증` dialog의 운영 정책·추천 설명·PM/데이터 탭
- `제품 검증` dialog 자체의 axe WCAG 2 A/AA `serious`/`critical` 0건
- 실제 UI를 통한 온보딩 완료
- 소개 화면 종료 후 Deep Link 복원
- 저잔액 화면 이동 무부작용·명시적 시뮬레이션·reload persistence
- `s-splash` · `s-home` · `s-detail` · `s-pay` · `s-profile` 대표 화면 axe `serious`/`critical` 위반 0건

브라우저 `pageerror`, 같은 origin의 HTTP 4xx/5xx, 의미 있는 `console.error`도 실패로 처리합니다. Product Hardening 첫 PR 실행에서 새 PM 패널의 일부 보조 텍스트가 2.97–4.29:1 대비로 axe에 포착됐고, 기준을 낮추지 않고 runtime CSS를 더 진한 색으로 보정한 뒤 동일 gate를 재통과했습니다.

### Production Smoke + 증거 Artifact

`main` push에서는 `Regression 36`과 `Browser E2E + axe` 성공 후 **해당 Git SHA의 Vercel status `success`**를 기다린 다음 실제 `https://footmate-black.vercel.app`을 검사합니다.

- `/`, `/demo`, `/demo-source`, `footmate-core.js`, `footmate-product-core.js`, `footmate-finalize.js`, `footmate-product-hardening.js` HTTP 응답과 핵심 marker
- Production `/` metadata
- 실제 Chromium에서 Case Study `Problem → Hypothesis → Design → Validation → Result` 요약과 Demo 렌더, 39개 화면 runtime, `제품 검증` runtime, 홈 화면 이동

브라우저/Production QA는 GitHub Actions Artifact에 Playwright HTML report, 실패 screenshot·trace·error context, Production smoke JSON을 남기며 보존 기간은 14일입니다.

사용자 확인 기준으로 실제 iPhone·Android 핵심 흐름, VoiceOver/TalkBack 발화·포커스·동적 상태 알림, 전체 39개 화면의 브라우저 Console Error 수동 QA에서 문제 없음을 확인했습니다. 이 수동 QA는 P0–P2 추가 runtime에 대한 새 실기기 재검증으로 자동 승계하지 않으며, 자동 테스트·배포 상태와 실제 서비스 연동 검증과도 구분합니다.

최신 검증 설계와 상태는 [2026-09-11 검토 기록](docs/QA-2026-09-11.md), P0–P2 설계 범위는 [Product Hardening 기록](docs/PRODUCT-HARDENING-2026-09-11.md)을 참고하세요. 이전 [2026-09-10 기록](docs/QA-2026-09-10.md)은 변경 이력으로 유지합니다.
