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
- 경기 결과 ELO 업데이트와 변경된 ELO의 다음 추천 반영
- 브라우저 재진입 시 핵심 진행 상태와 홈 필터 · 크레딧 · 평가 · 즐겨찾기 · 친구 · 사용자 채팅 복원
- AI Agent Workflow 및 데이터 품질 상태(`PASS` · `CHECK` · `SAMPLE`)
- 핵심 퍼널 이벤트의 존재·순서와 결제·참가 연결 키 기반 Data Quality 검사
- 접근성을 고려한 동적 ARIA 상태 동기화

## 🧩 Runtime Structure

승인된 큰 HTML 원본은 그대로 유지하고, Case Study와 Demo 모두 얇은 셸에서 최신 런타임 보정 레이어를 주입합니다.

- `index-source.html` — 승인된 Case Study 원본
- `index.html` / `index-shell.html` / `index-patches.js` — Production `/`에서 원본을 로드하고 실제 4탭 IA와 최신 데이터 품질 설명을 동기화하는 셸·패치
- `demo.html` / `demo-source.html` — 승인된 프로토타입 원본
- `demo-shell.html` — `/demo`에서 원본 HTML을 같은 문서에 로드하고 런타임 자산을 주입
- `footmate-core.js` — 필터링 · 매칭 점수 · 추천 정렬 · 크레딧 · 데이터 품질의 순수 로직
- `footmate-patches.js` / `footmate-patches.css` — 추천 · 경기 · ELO 상태 동기화와 UI 회귀 보정
- `footmate-finalize.js` / `footmate-finalize.css` — 홈 필터 · 크레딧 · 확장 persistence · Data Quality 심화 검증 · UI 명칭 보정
- `footmate-persist-extra.js` — 저장된 사용자 채팅의 안전한 화면 복원

`/demo`는 원본을 별도 내부 iframe으로 다시 감싸지 않으므로, Case Study에 임베드될 때 iframe 중첩을 한 단계 줄였습니다.

## 🛠 Tech

HTML · CSS · JavaScript · Node.js Test Runner · GitHub · Vercel

## 👤 Role

기획 · UX/IA · 정책 설계 · 프로토타입 구현 · QA · 배포를 직접 수행했습니다.

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다.  
추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용하며, 실제 결제 · 외부 AI 모델 · DB · 실시간 알림은 연동하지 않았습니다.

## ✅ 검증

Node.js 20 이상에서 별도 패키지 설치 없이 전체 테스트를 실행합니다.

```sh
node --test tests/*.test.cjs
```

현재 테스트는 두 그룹으로 나뉩니다.

- `tests/regression.test.cjs` — 기존 프로토타입 회귀 20개: JavaScript·이벤트 핸들러 문법, Deep Link, 화면 이력, 퀴즈·타이머, 지역·결제·참가 상태, ELO, 한글 IME·키보드 등
- `tests/runtime-patch.test.cjs` — 런타임 일관성 9개: 실력 단계 값, 현재 ELO carry-forward, 하드 필터, 추천 정렬, Data Quality, 퍼널 이벤트 순서, 상태 연결 키, 홈 필터, 크레딧 증감

자동 테스트와 배포 확인은 실제 브라우저 렌더링, 모바일 실기기, VoiceOver/TalkBack 등 접근성 QA를 완전히 대체하지 않습니다.

검토 범위와 남은 수동 QA는 [2026-09-10 검토 기록](docs/QA-2026-09-09.md)을 참고하세요.
