# FootMate Product Hardening · 2026-09-11

## 목적

기존 39개 화면을 늘리는 대신, 프로토타입의 정책 폐쇄성·추천 설명력·측정 가능성·포트폴리오 전달력을 강화한다. 승인 원본 `demo.html` / `demo-source.html`은 변경하지 않고 runtime 계층에서 확장한다.

## P0 · 운영 현실성

- `payment`, `participation`, `match`를 분리한 상태 머신을 추가했다.
- 결제 실패 → 재시도, 중복 신청 차단, 참가 취소 → 환불, 노쇼 무환불, 대기 등록 → 빈자리 제안 → 수락·결제, 경기 취소 → 환불 흐름을 시뮬레이션한다.
- 허용되지 않은 상태 전이는 실행하지 않고 `operation_transition_blocked` 이벤트로 기록한다.
- 기존 크레딧·참가 persistence와 연결해 환불 시 크레딧과 `paidMatchKeys`를 함께 복구한다.

## P0 · 추천 설명력

- 기존 추천 점수를 ELO·거리·시간대·포지션·경기 방식·날짜·지역 요인으로 분해해 표시한다.
- 하드 필터 불일치 후보에는 제외 이유와 필터 완화 fallback을 표시한다.
- 현재 추천을 기준으로 저장한 뒤 조건 변경 전/후의 전체 점수와 요인별 delta를 비교할 수 있다.
- 추천 설명은 기존 추천 순위를 임의로 바꾸지 않고 현재 계산 결과를 해석하는 계층으로 동작한다.

## P1 · PM / 데이터

- 추가 이벤트는 `name`, `timestamp`, `sessionId`, `version`, `metadata` 계약으로 기록한다.
- 기존 핵심 퍼널 `quiz_complete → recommendation_results_view → match_detail_open → payment_complete → result_submit`의 현재 세션 도달 상태와 다음 미관측 이벤트를 표시한다.
- 추천 클릭률, 신청 전환율, 노쇼율, 재참여 의향을 KPI 정의로 연결한다.
- 프로토타입 1세션 관측값을 실제 사용자 성과나 목표 KPI로 표현하지 않는다.

## P1 · 상태 모델

- Payment: `idle → pending → paid/failed`, `failed → pending`, `paid → refunded`
- Participation: `available → waitlisted/confirmed → checked_in/completed`, 대기 `waitlisted → offered → confirmed`, 취소·만료·노쇼 예외 포함
- Match: `open ↔ full`, `open/full → cancelled`, `open → completed`

## P2 · 포트폴리오 / 품질

- Case Study 커버에 `Problem → Hypothesis → Design → Validation → Result` 의사결정 요약을 runtime patch로 추가한다.
- Validation 슬라이드는 자동 QA 완료와 사용자 테스트 미실행을 분리하고, 실제 구현 이벤트 이름과 QA proof strip을 표시한다.
- Demo에는 접근 가능한 `제품 검증` dialog를 추가하고 운영 정책·추천 설명·PM/데이터 세 범주를 제공한다.
- dialog는 키보드 탭 전환, Escape 닫기, focus-visible, aria-live, reduced-motion을 지원한다.

## 검증 계약

- 기존 Node 테스트 수 36개는 유지하고 기존 테스트 내부에 상태 머신·추천 설명·이벤트 계약·KPI·runtime asset 검증을 추가한다.
- 기존 Chromium E2E 5개는 유지하고 첫 runtime 테스트에서 Product Inspector 로드·탭·axe serious/critical 0을 검증한다.
- Production HTTP smoke는 product core/hardening asset과 loader를 확인한다.
- Production Chromium smoke는 실제 Case Study 의사결정 요약과 Demo `제품 검증` runtime을 확인한다.

## 범위 밖

실제 결제사, DB, 실시간 알림, 외부 AI 모델, 운영자 백엔드는 연결하지 않는다. 이번 상태 전이와 KPI 값은 기획 검증용 runtime simulation이며 실제 운영 데이터로 오인하지 않는다.
