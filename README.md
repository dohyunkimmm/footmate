# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로 초기 ELO를 계산하고, 경기 조건에 맞는 후보 추천부터 결제 · 체크인 · 경기 결과 · 평가 · 재참여까지의 흐름을 구현했습니다.

## 🔗 Links

- [Live Demo](https://footmate-black.vercel.app/demo)
- [Case Study](https://footmate-black.vercel.app/)

## ✨ Key Features

- 5개 사용자 입력 기반 동적 ELO 계산
- 날짜 · 지역 · 시간대 · 거리 · 경기 방식 · 모집 포지션 기반 후보 eligibility
- ELO · 플레이 조건 · 위치 기반 매칭 점수와 추천 정렬
- 홈 `어제 / 오늘 / 내일` 및 `모집 중 / 내 ELO ±50 / 5km 이내` 실제 목록 필터링
- 추천 이유 및 Best Match 비교
- 선택 경기 → 상세 → 결제 → 참가 상태의 경기 식별자 일관성
- 대기 · 대체 참가 제안의 대상 경기 일반화
- 단일 크레딧 잔액 기반 충전 · 결제 · 프로필 상태 동기화 및 중복 차감 방지
- `크레딧 부족 시뮬레이션`을 명시적 상태 변경으로 분리해 화면 이동·Deep Link의 저장 상태 부작용 차단
- 경기 결과 ELO 업데이트와 변경된 ELO의 다음 추천 반영
- 브라우저 재진입 시 핵심 진행 상태와 홈 필터 · 크레딧 · 평가 · 경기별 즐겨찾기 · 멤버별 친구 추가 · 사용자 채팅 복원
- 기존 boolean 즐겨찾기·친구 저장값의 ID 기반 상태 migration
- AI Agent Workflow 및 데이터 품질 상태(`PASS` · `CHECK` · `SAMPLE`)
- 핵심 퍼널 이벤트의 존재·순서와 결제·참가 연결 키 기반 Data Quality 검사
- 접근성을 고려한 동적 ARIA 상태 동기화와 대표 화면 axe WCAG 2 A/AA 자동 gate
- Production Case Study shell의 description · canonical · Open Graph · Twitter Card 메타데이터 제공

## 🧩 Runtime Structure

승인된 큰 HTML 원본은 그대로 유지하고, Case Study와 Demo 모두 얇은 셸에서 최신 런타임 보정 레이어를 주입합니다.

- `index-source.html` — 승인된 Case Study 원본
- `index.html` / `index-shell.html` / `index-patches.js` — Production `/`에서 원본을 로드하고 실제 4탭 IA와 최신 데이터 품질 설명을 동기화하는 셸·패치. 공유·검색 크롤러를 위한 핵심 메타데이터는 Production shell에 직접 포함
- `demo.html` / `demo-source.html` — 승인된 프로토타입 원본
- `demo-shell.html` — `/demo`에서 원본 HTML을 같은 문서에 로드하고 런타임 자산을 주입
- `footmate-core.js` — 필터링 · 매칭 점수 · 추천 정렬 · 크레딧 · 데이터 품질의 순수 로직
- `footmate-patches.js` / `footmate-patches.css` — 추천 · 경기 · ELO 상태 동기화와 UI 회귀 보정
- `footmate-finalize.js` / `footmate-finalize.css` — 홈 필터 · 크레딧 · ID 기반 확장 persistence · Data Quality 심화 검증 · UI/접근성 런타임 보정
- `footmate-persist-extra.js` — 저장된 사용자 채팅의 안전한 화면 복원
- `playwright.config.cjs` / `tests/e2e/*` — 실제 Chromium E2E · axe 접근성 gate · Production browser smoke
- `tests/production-smoke.cjs` — 배포된 Production HTML·런타임 자산 HTTP smoke와 JSON 증거 기록

`/demo`는 원본을 별도 내부 iframe으로 다시 감싸지 않으므로, Case Study에 임베드될 때 iframe 중첩을 한 단계 줄였습니다.

## 🛠 Tech

HTML · CSS · JavaScript · Node.js Test Runner · Playwright · axe-core · GitHub Actions · GitHub · Vercel

## 👤 Role

기획 · UX/IA · 정책 설계 · 프로토타입 구현 · QA · 배포를 직접 수행했습니다.

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다.  
추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용하며, 실제 결제 · 외부 AI 모델 · DB · 실시간 알림은 연동하지 않았습니다.

## ✅ 검증

검증은 **Node 로직/회귀 → 실제 Chromium E2E → 대표 화면 접근성 → Production smoke**의 서로 다른 레이어로 분리합니다.

### Verification Matrix

| 검증 레이어 | 검증 대상 | 방식 | 실행 조건·환경 | 통과 기준 | 증거 | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| Regression | 로직·상태·회귀 36개 | Node Test Runner 자동 | PR / `main` | 36/36 성공 | GitHub Actions `Regression 36` | **PASS** |
| Browser E2E | 핵심 사용자 흐름 5개·39화면 런타임 | Playwright Chromium 자동 | PR / `main` | 5/5 성공 + pageerror·same-origin 4xx/5xx·의미 있는 console error 0 | `browser-e2e-*` Artifact | **PASS** |
| Accessibility | `s-splash`·`s-home`·`s-detail`·`s-pay`·`s-profile` | axe WCAG 2 A/AA 자동 | PR / `main` | serious/critical 0 | Browser E2E report·Artifact | **PASS** |
| Production HTTP | `/`·`/demo`·`/demo-source`·핵심 runtime 자산·metadata | Node `fetch` smoke 자동 | `main` + 해당 SHA Vercel success 후 | HTTP·content-type·핵심 marker 전부 성공 | `production-smoke.json` | **PASS** |
| Production Browser | 실제 Case Study·Demo 렌더·39화면 부팅 | Playwright Chromium 자동 | `main` Production 배포 후 | 렌더·런타임·홈 이동 성공 + browser/network error 0 | `production-smoke-*` Artifact | **PASS** |
| Mobile Device | iPhone·Android 핵심 흐름 | 사용자 수동 QA | 실제 모바일 기기 | 핵심 흐름 문제 없음 | 사용자 확인 기록 | **PASS · 사용자 확인** |
| Screen Reader | VoiceOver·TalkBack 발화·포커스·동적 상태 | 사용자 수동 QA | 실제 모바일 기기 | 발화·포커스·동적 알림 문제 없음 | 사용자 확인 기록 | **PASS · 사용자 확인** |
| Real Service Integration | 로그인·위치·결제·DB·알림·외부 AI 모델 | 미구현 / 향후 검증 | 실제 서비스 연동 후 | 서버·외부 서비스 기준 E2E | — | **N/A · 현재 범위 밖** |

자동 PASS와 사용자 수동 PASS는 서로 다른 검증 근거이며, 실서비스 연동 미구현 영역을 자동 QA 완료로 간주하지 않습니다. 최신 구현 자동 QA·Production 검증 기준은 [`1a450f2`](https://github.com/dohyunkimmm/footmate/commit/1a450f2f9f5b7c0a676ac26de38ada1a25510dab)입니다.

Production QA의 첫 완전 통과 기준은 커밋 [`15151a5`](https://github.com/dohyunkimmm/footmate/commit/15151a511c36e9ff21a4b499fbaa30656577a072)입니다. 해당 `main` 실행에서 `Regression 36`, `Browser E2E + axe`, `Production Smoke`가 모두 성공했고, Production Smoke 내부의 Vercel SHA 확인 · 실제 Production HTTP 검사 · Production Chromium 렌더 검사 · 증거 Artifact 업로드까지 모두 통과했습니다. `/demo`는 Vercel Production에서 `demo-shell.html`로 정상 라우팅되며, 승인 원본 `demo.html`과 `demo-source.html`은 수정하지 않았습니다. 이후 문서 동기화 `main` 재검증에서 홈 초록 상태 chip 2개의 4.43:1 색 대비가 axe gate에 포착되어, 테스트 기준을 낮추지 않고 `footmate-finalize.css` 런타임 레이어에서 대비 여유를 추가했습니다.

`main`은 GitHub Ruleset으로 Pull Request를 강제하며 `Regression 36`과 `Browser E2E + axe`를 required status check로 사용합니다. `Production Smoke`는 `main` push 후 해당 SHA의 Vercel 배포를 대상으로 실행합니다.

### Node 회귀 · 36개

```sh
node --test tests/*.test.cjs
```

- `tests/regression.test.cjs` — 기존 프로토타입 회귀 20개: JavaScript·이벤트 핸들러 문법, Deep Link, 화면 이력, 퀴즈·타이머, 지역·결제·참가 상태, ELO, 한글 IME·키보드 등
- `tests/runtime-patch.test.cjs` — 런타임 일관성 9개: 실력 단계 값, 현재 ELO carry-forward, 하드 필터, 추천 정렬, Data Quality, 퍼널 이벤트 순서, 상태 연결 키, 홈 필터, 크레딧 증감
- `tests/quality-hardening.test.cjs` — 품질 보강 회귀 7개: Case Study shell 동기화, 승인 Demo 원본 동기화, Production 메타데이터, 런타임 문법, 저잔액 화면 이동 무부작용, ID 기반 persistence, 이전 저장값 migration

### 실제 Chromium E2E + axe

GitHub Actions의 `Browser E2E + axe` job은 Playwright Chromium에서 5개 브라우저 검증을 실행합니다.

- Production-like `/demo` shell과 전체 39개 화면·런타임 부팅
- 실제 UI를 통한 온보딩 완료
- 소개 화면 종료 후 Deep Link 복원
- 저잔액 화면 이동 무부작용·명시적 시뮬레이션·reload persistence
- `s-splash` · `s-home` · `s-detail` · `s-pay` · `s-profile` 대표 화면의 axe WCAG 2 A/AA `serious`/`critical` 위반 0건

브라우저 `pageerror`, 같은 origin의 HTTP 4xx/5xx, 의미 있는 `console.error`도 실패로 처리합니다. axe 도입과 후속 `main` 재검증에서 확인된 로그인·홈 보조 텍스트·홈 초록 상태 chip·팀 상세 포지션의 색 대비 문제는 승인 원본을 수정하지 않고 `footmate-finalize.css` 런타임 레이어에서 보정했습니다.

### Production Smoke + 증거 Artifact

`main` push에서는 `Regression 36`과 `Browser E2E + axe` 성공 후 **해당 Git SHA의 Vercel status `success`**를 기다린 다음 실제 `https://footmate-black.vercel.app`을 검사합니다.

- `/`, `/demo`, `/demo-source`, `footmate-core.js`, `footmate-finalize.js` HTTP 응답과 핵심 marker
- Production `/` metadata
- 실제 Chromium에서 Case Study·Demo 렌더, 39개 화면 런타임 부팅과 홈 화면 이동

브라우저/Production QA는 GitHub Actions Artifact에 Playwright HTML report, 실패 screenshot·trace·error context, Production smoke JSON을 남기며 보존 기간은 14일입니다.

사용자 확인 기준으로 실제 iPhone·Android 핵심 흐름, VoiceOver/TalkBack 발화·포커스·동적 상태 알림, 전체 39개 화면의 브라우저 Console Error 수동 QA에서 문제 없음을 확인했습니다. 자동 테스트·배포 상태와 사용자 수동 QA는 실제 로그인·위치·결제·DB·알림·외부 AI 모델 등 서비스 연동 검증과 구분합니다.

최신 검증 설계와 상태는 [2026-09-11 검토 기록](docs/QA-2026-09-11.md)을 참고하세요. 이전 [2026-09-10 기록](docs/QA-2026-09-10.md)은 변경 이력으로 유지합니다.
