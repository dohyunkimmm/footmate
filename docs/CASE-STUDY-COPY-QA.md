# FootMate Case Study Copy QA

이 문서는 Case Study 본문 카피와 레이아웃 검수 기준을 정리한다.

- 왼쪽 목차의 **section title과 subcopy는 영어**로 표기한다.
- 본문 설명은 한국어를 우선하고 Persona/JTBD, HITL, QA, Visual Regression, Production, OAuth, Supabase, Web Push처럼 제품·기술 의미가 분명한 용어만 필요한 범위에서 유지한다.
- 사용자에게 경로 문자열 `/app`, `/beta`를 설명 이름처럼 노출하지 않는다. 화면에서는 **Real App**, **Closed Beta**로 표현하고 실제 route는 링크 속성에서 유지한다.
- 도메인 내부 식별자 `recommendation`, `participation`, `matchday`, `return`은 코드 소유권을 설명할 때만 사용하고 독자용 설명을 함께 둔다.
- Case Study는 13개 section으로 유지하며 각 section은 하나의 역할을 갖는다. 중복된 Core Journey, Join/Payment, Provider/AI 설명은 각각 Product Thesis, Sign in·Join, Domain·AI Boundary에 통합한다.
- desktop의 story section은 현재 승인된 visual center 배치를 유지하고, 본문과 구조화된 정보 블록의 좌측 기준선을 일관되게 맞춘다.
- 표·카드형 정보는 동일한 cell padding, gap, line-height, Korean word-break 규칙을 사용한다.
- 1440×900 기준 각 section의 핵심 콘텐츠가 한 화면 안에서 읽히도록 구성하고, mobile은 자연스러운 세로 스크롤을 허용한다.
- 자동 QA는 반복 가능한 contract/E2E/axe/Visual Regression/Production smoke를 담당한다.
- 사람 검수(Human QA)는 실제 로그인, 실제 전달, OS·브라우저 표시처럼 사람이 결과를 확인해야 하는 항목을 담당한다.
- AI 보조 검수(AI-assisted QA)는 중복, 용어 혼용, section 역할 충돌, Source of Truth와 카피 불일치를 찾는 보조 수단이며 PASS 판정을 대신하지 않는다.


## 본문·줄바꿈·표 여백 검수 기준

- `word-break: keep-all`과 overflow 통과는 편집 검수 완료를 뜻하지 않는다. 모든 페이지의 실제 렌더를 별도로 확인한다.
- 제목은 의미가 연결되는 두 구절, 설명은 문장, 정책 판단은 이름이 붙은 행으로 나눈다. 화면 폭에 따른 자연 줄바꿈을 허용하며 글자를 줄이거나 잘라서 맞추지 않는다.
- 표·카드는 안쪽 여백, 행·열 간격, 제목과 설명 간격, 텍스트의 좌측 정렬을 함께 확인한다. 모바일의 결정 근거 행은 라벨 위·본문 아래로 바꾼다.
- KPI 분자와 분모는 별도 줄로 표시한다. 분모나 관찰 기간이 카드 경계에서 잘리지 않는지 확인한다.
- 데스크톱 1440×900의 13개 페이지와 모바일 320·390px의 **전체 본문**을 검수한다. 모바일 viewport 캡처만 보고 하단까지 확인했다고 기록하지 않는다.
- 후보 이미지 생성, 이미지 내용의 시각 검토, 승인한 이미지와의 재비교를 구분한다. 새 이미지를 만들었다는 이유만으로 Visual Regression PASS를 주장하지 않는다.
- 이 검수는 Case Study 13개 페이지의 설명·정보 표를 대상으로 한다. 첫 페이지에 포함된 앱 iframe의 제품 화면은 별도 제품 검수 대상이다.
