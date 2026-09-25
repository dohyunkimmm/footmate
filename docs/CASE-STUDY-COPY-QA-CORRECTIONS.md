# FootMate Case Study Copy QA Corrections

이 문서는 `CASE-STUDY-COPY-QA.md`의 이후 Case Study 카피 변경을 기록한다. 기존 기록과 충돌하면 이 문서의 더 최신 항목을 현재 기준으로 사용한다.

## 2026-09-25 · 01/03 lead 축약 closure

PR #285에서 recruiter scan 흐름은 유지하면서 01 Overview와 03 Persona · JTBD의 opening lead만 추가로 축약했다. 제품 기능, 성과 근거, 08 상태 보존, 12 KPI 내부 열람 구조, page-level layout은 변경하지 않았다.

- 현재 Case Study runtime/Production baseline: PR #285 · SHA `f3d9d6a03bc25fa41dba5e2acfc6903752c435a2`
- 01 Cover lead: `나에게 맞는 이유를 확인하고, 안심하고 참가하는 풋살 서비스입니다.` 한 문장만 사용한다.
- 01 proof: `Role / Scope / Responsibility` 구조는 유지하며 기획·구현·검증 범위는 lead에 반복하지 않는다.
- 03 lead: `설계용 Persona는 가정으로 두고, 행동 과업으로 핵심 동선을 점검했습니다.`로 축약한다.
- 03 검증 근거: lead에서 빠진 표본 사실은 summary의 `검증` 항목에 `같은 교육과정을 수강한 교육생 6명 · iOS 4 · Android 2`로 보존한다.
- 02–13 recruiter hierarchy, 상태명·단계명·CTA·짧은 값의 명사형/무마침표 규칙, 12 KPI 내부 modal, 08 전용 spacing, 02–13 desktop center alignment는 PR #283/#273/#271의 승인 기준을 그대로 유지한다.
- Visual QA: 01 Cover는 카피 길이 변화 자체를 픽셀 baseline 재승인으로 처리하지 않고 lead/proof/preview/overflow 계약을 직접 검사한다. 03은 축약 lead와 6명 검증 근거를 E2E로 고정한다.
- PR QA: FootMate QA #1371 · run `36106376345` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Final main QA: FootMate QA #1373 · run `36109971376` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: Vercel exact deploy PASS · HTTP smoke PASS · AI inference PASS · Chromium smoke PASS

### Supersession

`CASE-STUDY-COPY-QA.md`의 `2026-09-25 recruiter scan · KPI 내부 열람 closure` 중 PR #283 / SHA `205c1049109be2feadaedbb5937e00b812cd736e`는 recruiter hierarchy 도입 이력으로 보존한다. 다만 현재 runtime/Production baseline과 01/03 lead 문구는 위 PR #285 기준이 우선한다.
