# FootMate Beta 측정 준비 기준

이 문서는 FootMate의 **Validation Metric을 실제 Measured Result로 전환하기 위한 계측·표본·판정 기준**을 정리합니다. 숫자를 채우기 위한 문서가 아니라, 어떤 데이터만 사용자 성과로 인정할지 먼저 고정하는 문서입니다.

현재 Case Study의 KPI는 모두 **Validation Metric**이며 아직 **Measured Result가 아닙니다**. 운영·테스트 계정, 자동 QA, `/app` sample/simulation을 실제 Beta 성과에 섞지 않습니다.

## 1. Measured Result 인정 조건

Measured Result는 아래 조건을 모두 만족할 때만 공개합니다.

- **대상 구분** — 실제 무료 Beta 이용자와 운영·테스트 계정을 구분할 수 있어야 합니다.
- **관찰 기간** — 시작일·종료일과 지표별 관찰 완료 조건을 함께 기록합니다.
- **표본 크기** — 분자·분모와 유효 표본 수를 함께 기록합니다.
- **중복 제거** — 동일 사용자·경기·탐색·참가 흐름의 재시도를 정의된 단위로 중복 제거합니다.
- **누락 확인** — 이벤트 누락이나 관찰 미완료 표본을 별도로 기록합니다.
- **정의 고정** — 비교 전후에 같은 분자·분모·제외 기준을 사용합니다.

첫 측정값은 **개선 성과가 아니라 Baseline**으로 기록합니다. 이후 한 번에 하나의 가설을 변경하고 같은 정의로 재측정한 뒤에만 변화량을 비교합니다.

## 2. 현재 계측 준비 상태

현재 Supabase에는 인증, 경기, 참가, 체크인, 운영 이벤트 등 서비스 상태 데이터가 연결되어 있습니다. 다만 실제 Beta 이용자와 운영·테스트 계정을 측정용 cohort로 명시적으로 구분하는 계측 기준이 아직 고정되어 있지 않아, 저장된 활동 기록을 그대로 사용자 성과로 집계하지 않습니다.

| Validation Metric | 현재 활용 가능한 근거 | Measured Result 전 필요한 조건 | 현재 상태 |
| --- | --- | --- | --- |
| Match Search → Detail CTR | 경기·참가 상태와 별도로 탐색 UI 존재 | 검색 결과 노출·상세 진입 이벤트, 탐색 세션 ID, cohort 구분 | **미측정** |
| Detail → Join Conversion | `participations`의 참가 완료 상태 | 상세 조회 이벤트, 사용자·경기 기준 24시간 관찰, cohort 구분 | **미측정** |
| Zero Result Rate | 실제 경기 데이터와 AI/rules 탐색 경로 | 검색 요청·정상 처리·결과 수 이벤트, 중복 요청 기준 | **미측정** |
| Join Failure Rate | 참가 상태·운영 이벤트 | 참가 시도 flow ID, 실패·취소·timeout 후 최종 상태 구분 | **미측정** |
| Recovery Success Rate | 참가·취소·체크인 복구 경로 | 실패 flow와 복구 완료를 같은 flow ID로 연결 | **미측정** |
| Check-in Completion Rate | `participations.checked_in_at`, 경기 상태 | 종료 경기·확정 참가자 cohort 구분, 취소 제외 규칙 적용 | **Baseline 준비** |
| Repeat Match Search Rate | 참가·경기 완료 상태 | 경기 후 탐색 이벤트, 사용자별 7일 관찰 완료 여부 | **미측정** |
| AI Search Adoption Rate | AI connected / rules-fallback 탐색 경로 | 탐색 세션별 AI 진입점 노출·요청 이벤트, fallback 분리 | **미측정** |

`Baseline 준비`는 계산 가능한 상태 데이터가 있다는 뜻이며, 실제 사용자 cohort가 검증되기 전에는 결과값을 공개하지 않습니다.

## 3. 측정 기록 형식

실제 Beta 측정을 시작하면 지표마다 아래 항목을 함께 남깁니다.

| 항목 | 기록 내용 |
| --- | --- |
| 기간 | YYYY-MM-DD ~ YYYY-MM-DD |
| 대상 | 실제 무료 Beta 이용자 |
| 제외 | 운영자·테스트·자동 QA·sample/simulation |
| 분자 / 분모 | 정의된 집계 단위의 실제 건수 |
| 결과 | 비율 또는 N/A |
| 유효 표본 | 관찰 조건을 완료한 사용자·세션·흐름 수 |
| 데이터 누락 | 누락·관찰 미완료 건수와 이유 |
| 해석 | 공급 부족·정책·인증·추천 등 다른 원인과 분리한 해석 |
| 다음 변경 | 한 번에 하나의 가설만 변경 |

분모가 0이면 `0%`가 아니라 `N/A`로 기록합니다. 낮은 표본에서 나온 변화는 사용자 가치가 입증된 성과처럼 표현하지 않습니다.

## 4. 첫 Beta 측정 순서

1. 실제 Beta 이용자를 측정 가능한 cohort로 구분합니다.
2. 검색 결과 노출·상세 진입·검색 결과 수·AI 검색 요청에 최소 이벤트 계약을 정의합니다.
3. 참가·복구 이벤트에 동일 flow ID를 연결해 재시도 중복을 제거합니다.
4. 관찰 기간과 표본 수를 먼저 기록하고 8개 지표의 Baseline을 계산합니다.
5. 이탈이 가장 큰 한 구간을 선택해 원인을 분류합니다.
6. 한 가지 요구사항·정책·UI만 변경하고 같은 정의로 재측정합니다.
7. `가설 → 관찰 → 변경 → 재검증`을 Case Study의 Measured Result로 반영합니다.

## 5. 포트폴리오 표기 원칙

- 실제 측정 전: **Validation Metric / Baseline 미측정**
- 첫 유효 측정 후: **Measured Baseline** + 기간·표본·분자·분모
- 동일 정의의 재측정 후: **Observed Change** + 변경 내용과 한계
- 충분한 표본·비교 설계가 없으면 인과적 표현인 “개선했다”, “증가시켰다”를 사용하지 않습니다.

세부 KPI의 분자·분모·관찰 기준은 [`SERVICE-PLANNING-EVIDENCE.md`](./SERVICE-PLANNING-EVIDENCE.md)를 기준으로 유지합니다.
