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
- ELO · 플레이 조건 · 위치 기반 매칭 점수
- 추천 이유 및 Best Match 비교
- 결제 · 체크인 · 노쇼 · 대기 · 대체 참가 흐름
- 경기 결과에 따른 ELO 업데이트
- AI Agent Workflow 및 데이터 품질 게이트
- 접근성을 고려한 동적 ARIA 상태 동기화

## 🛠 Tech

HTML · CSS · JavaScript · Vercel

## 👤 Role

기획 · UX/IA · 정책 설계 · 프로토타입 구현 · QA · 배포를 직접 수행했습니다.

## 📌 Project Scope

실제 상용 서비스가 아닌 **서비스 기획 검증용 인터랙티브 프로토타입**입니다.  
추천과 ELO는 규칙 기반 로직 및 샘플 데이터를 사용하며,  
실제 결제 · 외부 AI 모델 · DB · 실시간 알림은 연동하지 않았습니다.


## 검증

Node.js 20 이상에서 별도 패키지 설치 없이 실행합니다.

```sh
node --test tests/regression.test.cjs
```

테스트는 HTML 내부 JavaScript와 이벤트 핸들러의 문법, Deep Link, 퀴즈·타이머·지역·결제 상태, 한글 입력 및 키보드 이벤트 로직을 확인합니다. DOM 대역을 사용하므로 실제 브라우저의 렌더링·접근성·모바일 QA를 대체하지 않습니다.

검토 범위와 남은 개선 사항은 [2026-09-09 검토 기록](docs/QA-2026-09-09.md)을 참고하세요.
