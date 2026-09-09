# ⚽ FootMate

**AI 기반 풋살 매칭 서비스 기획 · 인터랙티브 프로토타입**

포지션, 경기 빈도, 실력, 지역, 시간대 입력을 기반으로  
초기 ELO와 개인화 추천 점수를 계산하고,  
추천 → 결제 → 체크인 → 경기 결과 → 평가 → 재참여까지의 흐름을 구현했습니다.

## 🔗 Links

- [Live Demo](https://footmate-black.vercel.app/demo)
- [Case Study](https://footmate-black.vercel.app/)

## ✨ Key Features

- 5개 사용자 입력 기반 동적 ELO 계산
- 날짜 · 지역 · 시간대 · 거리 · 경기 방식 · 모집 포지션을 반영한 후보 필터링
- ELO · 플레이 조건 · 위치 기반 매칭 점수 및 조건 적합도 기반 추천 정렬
- 추천 이유 및 Best Match 비교
- 선택 경기 → 상세 → 결제 → 참가 상태의 일관된 연결
- 결제 · 체크인 · 노쇼 · 대기 · 대체 참가 흐름
- 경기 결과에 따른 ELO 업데이트와 변경된 ELO의 다음 추천 반영
- 브라우저 내 상태 유지 및 재진입 시 핵심 진행 상태 복원
- AI Agent Workflow 및 데이터 품질 상태(`PASS` · `CHECK` · `SAMPLE`)
- 접근성을 고려한 동적 ARIA 상태 동기화

## 🧩 Runtime Structure

승인된 프로토타입 UI 원본은 유지하고, 추천·경기 상태·ELO 일관성 로직을 별도 런타임 레이어로 분리했습니다.

- `demo-source.html` — 승인된 프로토타입 원본
- `demo-shell.html` — `/demo`에서 원본과 런타임 보정 레이어를 로드하는 셸
- `footmate-core.js` — 필터링·매칭 점수·추천 정렬·데이터 품질 판정의 순수 로직
- `footmate-patches.js` / `footmate-patches.css` — 화면 상태 동기화와 UI 회귀 보정

## 🛠 Tech

HTML · CSS · JavaScript · Node.js Test Runner · GitHub · Vercel

## 👤 Role

기획 · UX/IA · 정책 설계 · 프로토타입 구현 · QA · 배포를 직접 수행했습니다.

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다.  
추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용하며,  
실제 결제 · 외부 AI 모델 · DB · 실시간 알림은 연동하지 않았습니다.

## ✅ 검증

Node.js 20 이상에서 별도 패키지 설치 없이 전체 회귀 테스트를 실행합니다.

```sh
node --test tests/*.test.cjs
```

현재 테스트는 기존 프로토타입 회귀 검증과 런타임 일관성 검증으로 나뉩니다.

- `tests/regression.test.cjs` — HTML 내부 JavaScript·이벤트 핸들러 문법, Deep Link, 퀴즈·타이머·지역·결제 상태, 한글 입력, 키보드 이벤트 등 기존 흐름 검증
- `tests/runtime-patch.test.cjs` — 실력 단계 값 분리, 현재 ELO carry-forward, 필터 eligibility, 추천 정렬, 데이터 품질 상태 판정 검증

자동 테스트는 DOM 대역과 순수 로직 검증을 사용하므로 실제 브라우저 렌더링, 모바일 실기기, VoiceOver/TalkBack 등 접근성 QA를 완전히 대체하지 않습니다.

검토 범위와 남은 개선 사항은 [2026-09-09 검토 기록](docs/QA-2026-09-09.md)을 참고하세요.
