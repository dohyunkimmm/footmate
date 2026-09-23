# FootMate Case Study Copy QA

이 문서는 Case Study 본문 카피와 레이아웃 검수 기준을 정리한다.

- 왼쪽 목차의 **section title과 subcopy는 영어**로 표기한다.
- 독자에게 보이는 **본문·라벨·구조화된 정보 카피는 영어를 기본 표시 언어**로 통일한다. Persona/JTBD, HITL, QA, Visual Regression, Production, OAuth, Supabase, Web Push처럼 제품·기술 의미가 분명한 용어는 원래 의미를 유지한다.
- 사용자에게 경로 문자열 `/app`, `/beta`를 설명 이름처럼 노출하지 않는다. 화면에서는 **Real App**, **Closed Beta**로 표현하고 실제 route는 링크 속성에서 유지한다.
- 도메인 내부 식별자 `recommendation`, `participation`, `matchday`, `return`은 코드 소유권을 설명할 때만 사용하고 독자용 설명을 함께 둔다.
- Case Study는 13개 section으로 유지하며 각 section은 하나의 역할을 갖는다. 중복된 Core Journey, Join/Payment, Provider/AI 설명은 각각 Product Thesis, Sign in·Join, Domain·AI Boundary에 통합한다.
- desktop의 story section은 본문과 구조화된 정보 블록을 같은 좌측 기준선에 맞추고, 임의의 중앙 정렬이나 우측 상단 단독 배치를 사용하지 않는다.
- 표·카드형 정보는 동일한 cell padding, gap, line-height 기준을 사용하고, 영문 단어와 제품·기술 고유 명칭이 임의로 분절되지 않도록 wrapping을 검수한다.
- 1440×900 기준 각 section의 핵심 콘텐츠가 한 화면 안에서 읽히도록 구성하고, mobile은 자연스러운 세로 스크롤을 허용한다.
- 자동 QA는 반복 가능한 contract/E2E/axe/Visual Regression/Production smoke를 담당한다.
- 사람 검수(Human QA)는 실제 로그인, 실제 전달, OS·브라우저 표시처럼 사람이 결과를 확인해야 하는 항목을 담당한다.
- AI 보조 검수(AI-assisted QA)는 중복, 용어 혼용, section 역할 충돌, Source of Truth와 카피 불일치를 찾는 보조 수단이며 PASS 판정을 대신하지 않는다.
