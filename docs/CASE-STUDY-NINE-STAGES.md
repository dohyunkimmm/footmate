# FootMate Case Study · 9단계 재편

현재 Case Study는 5.5.0이며 제품 앱의 6.0.0과 별도로 관리합니다.

| 단계 | 내용 | 주요 원본 근거 |
| --- | --- | --- |
| 01 Overview & Problem | 역할·기간·문제 가설·대표 결정·데모 | Notion FootMate 프로젝트, SERVICE-PLANNING-EVIDENCE |
| 02 Persona & JTBD | 설계용 Persona, 행동 과업 | USER-TEST-EVIDENCE |
| 03 Journey Map | 탐색→판단→참가→경기→재탐색, 막힘과 대응 | 현재 구현 흐름, SERVICE-PLANNING-EVIDENCE |
| 04 Scope & Priorities | MVP·MoSCoW·Trade-off·실제 연결 범위 | SERVICE-PLANNING-EVIDENCE, README |
| 05 IA & UX Flow | 홈·경기 찾기·MY, 참가와 복구 분기 | Notion User Flow, 현재 앱 |
| 06 Design Decisions & Demo | Guest First, 추천 이유, 선택 보존 복구 | 기존 Case Study, 구현 화면, RELEASE-HISTORY |
| 07 Validation & Metrics | 사용자 과업·개발 QA·8개 KPI 분리 | USER-TEST-EVIDENCE, RELEASE-HISTORY, BETA-MEASUREMENT-READINESS |
| 08 Reflection | 책임 분리·과업 지정·상태 설계·한계 | USER-TEST-EVIDENCE, SERVICE-PLANNING-EVIDENCE |
| 09 Next Steps | 과업 기록·Beta 기준값·후속 IA 개선·확장 판단 | BETA-MEASUREMENT-READINESS |

Journey Map과 MoSCoW는 현재 제품과 문서를 바탕으로 재구성한 산출물입니다. 과거 사용자 조사·회의 기록으로 표현하지 않습니다. 감정 점수, 과거 Lo-Fi 화면, 태스크 성공률·시간 단축·만족도 개선 수치를 새로 만들지 않습니다. 6명 과업 검증과 후속 개발 QA의 인과 관계도 단정하지 않습니다.

런타임은 `nine-sections.js`와 `nine-sections.css` 두 파일이 담당합니다. 기존 13단계 보정·번들 파일은 현재 페이지에서 로드하지 않습니다. 과거 레이아웃 스냅샷 테스트는 역사적 fixture로 남기고 현재 acceptance는 `case-study-nine-stages.spec.cjs`로 대체합니다. 앱·Beta·인증·서버 참가·결제의 동작은 이 변경 범위에 포함하지 않습니다.

검증: 9개 섹션 이동·직접 링크·브라우저 이력·키보드·접힌 근거·이미지 로딩·320/390/800/1440px 가로 넘침·axe 접근성. 섹션 이동 시 제목으로 초점을 옮기고 비활성 섹션은 `hidden`으로 읽기·탭 순서에서 제외합니다.
