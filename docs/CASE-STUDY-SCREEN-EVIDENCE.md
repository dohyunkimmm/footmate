# Case Study 화면 근거 · 2026-10-24

공개 Case Study의 11개 섹션 구조와 사용자 조사 수치는 유지하고, 현재 Demo의 매칭 흐름과 화면 근거를 동기화합니다.

## 캡처의 범위와 출처

- 이전 모바일 Home 및 AI 흐름 4개: PR [#652](https://github.com/dohyunkimmm/footmate/pull/652)의 `fc3689f5f1b3f98fa7a35719e456dc0de93b2e54`, [QA run 40043365990](https://github.com/dohyunkimmm/footmate/actions/runs/40043365990), `browser-e2e-40043365990` 아티팩트에서 390px 원본을 복사했습니다. 매칭 근거 13px, 현재 적용 조건·기본 프로필 참고 위계, 중립적인 검색 제어를 반영합니다. 기존 시각 기준 이미지와 차이가 있어 이 런의 전체 Browser gate는 실패했으며 배포 완료 증거로 사용하지 않습니다.
- `matching-ai-results.png`: 고정된 성공 API 응답의 조건 해석·카탈로그 결과·매칭 근거 UI. 실모델이 이 문장을 해석했다는 증거가 아닙니다.
- `matching-rules-fallback.png`: API 503 응답 후 ‘기본 검색으로 해석한 조건’ 출처와 결과 복구를 확인한 화면입니다.
- `matching-zero-before.png`: GK·23:59 이후·5,000원 이하 조건에서 빈 결과와 선택 가능한 완화 버튼을 확인합니다.
- `matching-zero-after.png`: 가격만 해제하고 시간·GK를 유지합니다. 사용자가 입력한 원문은 그대로 보존하며 실제 적용 조건은 칩으로 구분합니다. 가격을 없애도 다른 제한 때문에 결과는 0개일 수 있습니다.
- 경기·정원·참가비·일정은 테스트용 샘플입니다. 날짜는 캡처 시나리오의 고정/예시 일정으로 실제 운영 경기의 최신 일정을 뜻하지 않습니다. 캡처는 원본 그대로 복사했고 별도 합성·문구 편집을 하지 않았습니다.

## 실제 AI와 UI 테스트의 구분

기존 운영 버전의 실제 Gateway 호출·HTTP·운영 브라우저 검증은 main run 40023733892의 Production Smoke SUCCESS에서 확인했습니다. 이번 추가 패치는 PR #652로 main `dee099d42f3cac2ae4ee7ae70b7ba972804c595e`에 병합됐고, main run 40076931223의 Production Smoke도 SUCCESS입니다. 고정 API 응답과 오류 주입은 UI 책임·복구의 재현을 위한 테스트입니다. AI는 조건 해석만 수행하며 경기 사실·순위·참가 확정은 생성하지 않습니다. 매칭 효과·실사용 전환율·물리기기 재검증은 이번 작업에서 측정하지 않았습니다.

## 와이어프레임과 표시 검토

Home·Discover SVG는 최신 화면의 정보 배치와 동작을 단순화한 구현 기록입니다. 실제 캡처 및 초기 Figma 설계 원본과 구분합니다. 상세·참가·MY의 기존 와이어프레임은 이번 매칭 변경과 충돌하지 않아 유지합니다. 대표 이미지는 원본 비율을 보존하고, AI 캡처는 펼침 영역에서 확대할 수 있게 제공합니다. 기준 회귀 스크린샷 6장은 2026-10-24 사용자 승인 후 반영했으며 비교 허용치는 유지합니다.

## 원본 무결성

| 파일 | SHA-256 |
| --- | --- |
| `recommendation-home.png` | `3ef46a2de44c17a1e0fc422784dbdc769a59e20e27b7996e8b106dd2748af3f0` |
| `matching-ai-results.png` | `5781929a59318686bb5493d0b96bf39792e66e5275b1e0a5e1a795c3bd68386d` |
| `matching-rules-fallback.png` | `0278362d225ddbd4966b724d4bf9610980619eb7c5c4f69e80c3fea684be1add` |
| `matching-zero-before.png` | `ebc2b668aa0833a781aa0f28f3cc2f04a0a47d3517dedbf3a58e40fd2350f8b9` |
| `matching-zero-after.png` | `f94067b3bfc156a6bdf6295c977657b66378dcdc1ab0ca2e21c9791bb9924983` |

## 1920px PC 우선 패치 · PR #652 · 운영 반영 완료

- 대표 이미지를 `pc-matching-home.jpg`로 전환했습니다. 커밋 `cc3056cf191280d92d951d10a6ab3d78984b9926`의 Vercel 테스트 배포 `dpl_13YHDaNuPzFpNREeMTrKX1TePLHy`를 연결된 Chrome에서 직접 조작하고 1920px 폭으로 캡처했습니다. 테스트 배포의 검토 도구 표시가 포함된 원본이며 합성·문구 편집은 하지 않았습니다.
- 1600px 이상에서 앱 최대 폭 1120px, 홈·경기 찾기의 두 열 비교를 우선합니다. 960–1599px와 모바일의 기존 흐름은 유지합니다. 홈·경기 찾기 SVG는 이 PC 구조를 단순화한 와이어프레임이며 실제 캡처와 구분합니다.
- 직접 확인: 기본 MF 프로필을 유지한 GK 검색, 초급 해석, 상세의 GK 근거·선택, 내부 재진입/새로고침 유지. PC 상세의 제목/정보 겹침은 후속 `55053d6` 테스트 배포에서 해소를 확인했습니다.
- PR QA 40076349963과 병합 후 main QA 40076931223 모두 SUCCESS입니다. 승인된 기준 이미지 6장과 전체 Chromium·Mobile WebKit 검사를 반영했고 Vercel Production의 정확한 main SHA 및 실제 AI·운영 흐름을 검증했습니다. 위 캡처 출처는 원래 테스트 배포이며 운영 캡처로 재분류하지 않습니다.

`pc-matching-home.jpg` SHA-256: `6ea4049c16c3ca0a1f8ef464af3fd73944c92380a2039b9c3d4cf8a79b8b1705`
