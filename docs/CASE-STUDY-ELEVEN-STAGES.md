# FootMate 11개 섹션

현재 Demo와 기존 Notion/GitHub 자료를 재구성한다. 실제 출시·전환 개선 성과를 주장하지 않는다. 와이어프레임은 현재 구현 기준 재구성이다.

1. Overview & Problem
2. User Research
3. Persona & Journey
4. Scope & Priorities
5. IA & Navigation
6. Flowchart & Recovery
7. Wireframe & Screens
8. Functions & Policies
9. AI & Prototype
10. Validation & UX
11. Reflection & Next

Figma: https://www.figma.com/design/rvhwFauZFBsSnvHYitohgC?node-id=3-2

사용자 과업 수행 기록과 개발 QA 개선의 인과를 임의로 연결하지 않는다. 기존 Demo와 Beta 코드는 변경하지 않는다. 화면 폭·셸·이미지 비율을 보존하고 섹션 수에 맞춰 내비게이션만 조정한다.

## 현재 소스·검증 기준

- 실제 진입점: `index.html` → `src/case-study/nine-sections.css`, `nine-sections.js` (파일명은 과거 호환성을 위해 유지)
- 전용 E2E: `tests/e2e/case-study-eleven-stages.spec.cjs` — 11개 섹션, 320/390/800/1440/1920px, 접근성·딥링크·키보드·이미지·펼침 상태
- 이전 9/13단계 기록은 역사적 증빙이며 현재 UI의 수용 기준이 아님
- 과거 생성 번들 및 연결되지 않은 보정 스크립트는 제거하고 현재 진입점·증빙 이미지·Demo/Beta 경계를 보존
