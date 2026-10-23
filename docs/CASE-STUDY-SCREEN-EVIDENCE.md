# Case Study 화면 근거 · 2026-10-24

공개 Case Study의 11개 섹션 구조와 사용자 조사 수치는 유지하고, 현재 Demo의 매칭 흐름과 화면 근거를 동기화합니다.

## 캡처의 범위와 출처

- 대표 Home: main `02a74bba39433f26694bcaf87e3fe1fae73730ff`의 [QA run 40013802631](https://github.com/dohyunkimmm/footmate/actions/runs/40013802631), `browser-e2e-40013802631` 아티팩트. 맞춤 경기·맞는 점/확인할 점이 먼저, AI 추가 입력이 뒤에 보이는 390px 모바일 원본입니다.
- AI 흐름 4개: PR #651의 `cea2c53d5d97063b54a8f9a51ea21ce7e31b2a8b`, [QA run 40020508166](https://github.com/dohyunkimmm/footmate/actions/runs/40020508166), `browser-e2e-40020508166` 아티팩트. 제품 런타임은 같은 main 기반이며 기존 AI E2E에서 390px 캡처를 저장했습니다.
- `matching-ai-results.png`: 고정된 성공 API 응답의 조건 해석·카탈로그 결과·매칭 근거 UI. 실모델이 이 문장을 해석했다는 증거가 아닙니다.
- `matching-rules-fallback.png`: API 503 응답 후 ‘기본 검색으로 해석한 조건’ 출처와 결과 복구를 확인한 화면입니다.
- `matching-zero-before.png`: GK·23:59 이후·5,000원 이하 조건에서 빈 결과와 선택 가능한 완화 버튼을 확인합니다.
- `matching-zero-after.png`: 가격만 해제하고 시간·GK를 유지합니다. 사용자가 입력한 원문은 그대로 보존하며 실제 적용 조건은 칩으로 구분합니다. 가격을 없애도 다른 제한 때문에 결과는 0개일 수 있습니다.
- 경기·정원·참가비·일정은 테스트용 샘플입니다. 날짜는 캡처 시나리오의 고정/예시 일정으로 실제 운영 경기의 최신 일정을 뜻하지 않습니다. 캡처는 원본 그대로 복사했고 별도 합성·문구 편집을 하지 않았습니다.

## 실제 AI와 UI 테스트의 구분

실제 Gateway 호출·HTTP·운영 브라우저 검증은 main run 40013802631의 Production Smoke SUCCESS에서 확인했습니다. 고정 API 응답과 오류 주입은 UI 책임·복구의 재현을 위한 테스트입니다. AI는 조건 해석만 수행하며 경기 사실·순위·참가 확정은 생성하지 않습니다. 매칭 효과·실사용 전환율·물리기기 재검증은 이번 작업에서 측정하지 않았습니다.

## 와이어프레임과 표시 검토

Home·Discover SVG는 최신 화면의 정보 배치와 동작을 단순화한 구현 기록입니다. 실제 캡처 및 초기 Figma 설계 원본과 구분합니다. 상세·참가·MY의 기존 와이어프레임은 이번 매칭 변경과 충돌하지 않아 유지합니다. 대표 이미지는 원본 비율을 보존하고, AI 캡처는 펼침 영역에서 확대할 수 있게 제공합니다. 기준 회귀 스크린샷은 변경하지 않습니다.

## 원본 무결성

| 파일 | SHA-256 |
| --- | --- |
| `recommendation-home.png` | `f870ba4752e88d8d346178e9b490b176b83bb291d7120648c416845504c208e4` |
| `matching-ai-results.png` | `9c0c22972e5ff2402f4674e1cbcec06ecc62068c29ac6d2f50b184ba59ee3e0d` |
| `matching-rules-fallback.png` | `44af2da642443e9ff6644ef40b32a5309b9060e36c81f1764fb4f1debb677665` |
| `matching-zero-before.png` | `95be4801035fe847324227b88c06c7649f25160847f983bd38644f41ff7a964c` |
| `matching-zero-after.png` | `bf61cccde36778307fa4493ba3e8a0955a382ce378cb8e81382c9048252cde24` |
