## 2026-11-13 · 최신 `main` 목록·정리 판정

- GitHub [`main` `fc023a3`](https://github.com/dohyunkimmm/footmate/commit/fc023a33c235b6f7a422e6708544716ae2d48e48) 재귀 트리(`truncated=false`): **파일 279개·디렉터리 37개**(루트 파일 13개·최상위 폴더 8개). `.github/` 5, `api/` 2, `docs/` 34, `scripts/` 11, `src/` 87, `supabase/` 36, `tests/` 89, `worker/` 2, 루트 13개입니다. [루트 파일 목록](../README.md#저장소-파일폴더-안내) 및 [운영 판정](REPO-OPERATIONS.md)을 참조합니다.
- [PR #911~#917](https://github.com/dohyunkimmm/footmate/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc) 반영 및 최신 `main` [FootMate QA 성공](https://github.com/dohyunkimmm/footmate/actions/runs/43240267898). 열린 PR 0건, 열린 이슈 [#611](https://github.com/dohyunkimmm/footmate/issues/611) 1건. 오래된 비기본 브랜치는 125개이며 [기존 감사와 보존 결정](REMAINING-AUDIT-2026-11-08.md)에 따라 임의 이식·삭제하지 않습니다.
- `qa/`, `src/case-study/`는 [별도 보고서 저장소](https://github.com/dohyunkimmm/footmate-case-study)로 이관된 경로입니다. SQL 적용 이력 2쌍·증빙·회귀 자산은 보존하고 **추가 삭제 확정 0건**으로 판정했습니다. 아래 11월 11일 이하 수량은 해당 시점의 기록입니다. 운영 배포·DB/실계정 보안 검증을 새로 수행했다는 의미는 아닙니다.

> **2026-11-11 저장소 분리:** 보고서 원본·PPTX·XLSX·QA는 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)에서 관리합니다. 아래 과거 파일·배포 기록은 작성 당시 기준의 이력입니다.

## 2026-11-11 · 현행 `main` 파일·폴더 목록 및 동기화

- 기준: [`main` `caadcb6`](https://github.com/dohyunkimmm/footmate/commit/caadcb6e200241286607219a830a22bab5b4edeb)의 GitHub 재귀 트리(`truncated=false`) **파일 278개·디렉터리 37개**, 루트 파일 **13개**·최상위 폴더 **8개**. 아래 11월 9일 이하의 '최신'은 기록 당시 스냅샷입니다.
- 현행 최상위 폴더: `.github/`, `api/`, `docs/`, `scripts/`, `src/`, `supabase/`, `tests/`, `worker/`. 보고서 전용 `qa/`, `src/case-study/`와 이전 루트 `index.html`은 이 저장소의 현재 경로가 아닙니다. [상세 점검](REPO-CLEANUP-2026-11-11.md).
- [PR #909](https://github.com/dohyunkimmm/footmate/pull/909)로 이관한 보고서 원본·PPTX·XLSX·전용 QA는 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)에 있습니다. 이 저장소에 남은 `docs/CASE-STUDY-*.md`는 당시의 안내·근거 기록이며 **현행 구현 원본이 아닙니다**.
- 조회 시 열린 PR **0건**, 열린 이슈 [#611](https://github.com/dohyunkimmm/footmate/issues/611) **1건**. 동일 blob의 SQL 마이그레이션 두 쌍과 제품 자산·테스트는 보존합니다. 새 빌드/배포 또는 DB 보안 검증을 수행했다는 의미가 아닙니다.

## 2026-11-09 최종 · 의존성 반영·운영 감사 종료 기준

- 최신 [`main` `895eae6`](https://github.com/dohyunkimmm/footmate/commit/895eae676ed252481640f98fb5af06714c71f833)에서 **345개 파일·43개 디렉터리**(루트 파일 14개·최상위 폴더 9개), 열린 PR **0건**, 열린 이슈 [#611](https://github.com/dohyunkimmm/footmate/issues/611) **1건**입니다. SQL 이력 중 동일 blob 2쌍은 의도적으로 보존하고, 사용 중이거나 참조가 불확실한 파일·브랜치는 삭제하지 않습니다.
- [#898](https://github.com/dohyunkimmm/footmate/pull/898) setup-python v7 및 [#904](https://github.com/dohyunkimmm/footmate/pull/904) Wrangler 4.158.0·`@vercel/oidc` 4.0.7은 최신 `main` 기반으로 Change Impact·Regression 36·Browser E2E + axe 검사에 모두 통과 후 병합했습니다. #894·#895는 동일 패치가 통합 반영돼 미병합 종료했으며, 이는 변경 누락이 아닙니다. `package-lock.json` 설치 버전도 확인했습니다.
- 운영 `footmate-beta` 읽기 전용 재점검: 공개 테이블 **16/16 RLS 활성**, SECURITY DEFINER **38개**, `anon` 실행 가능 **0개**, `authenticated` 실행 가능 **21개**, 정책에서 `raw_user_meta_data` 참조 **0개**. Security Advisor는 21+1+1 WARN, 2 INFO, Performance Advisor `unused_index` 8 INFO, Health 0건을 보고했습니다. [#611 실서명 JWT·TOTP MFA E2E](https://github.com/dohyunkimmm/footmate/issues/611)는 실제 승인된 계정/세션 증빙이 없어 미실시·OPEN입니다. 무료 요금제의 유출 암호 보호 경고는 기존 수용 예외로 유지합니다.
- 이 기록은 GitHub/Supabase 메타데이터 및 CI의 재검증 결과입니다. 운영 DB·인증정보·권한·요금제·데이터·Cloudflare 배포 설정을 변경한 증거가 아니며, 11월 8일 이하 문단은 당시의 스냅샷입니다.

## 2026-11-09 · 현재 `main` 파일 목록 및 미반영 상태

- [`main` `39bc56a`](https://github.com/dohyunkimmm/footmate/commit/39bc56a58e17c0f30e5408073b926f5e4a77652d) 재귀 트리(`truncated=false`)는 **345개 파일·43개 디렉터리**(루트 파일 14개·최상위 폴더 9개)입니다. 전날의 339개 파일은 당시 스냅샷이며, 최근 화면·발표자료 수정과 마이그레이션 파일 복구 뒤 수치가 달라졌습니다. 기존 공개 진입점·배포 경로·QA 파일·원본 자산은 보존합니다. 동일 blob SHA인 SQL 마이그레이션 2쌍은 실행 이력 보호를 위해 이동/삭제하지 않습니다.
- 미병합 PR **3건**: [#894 `@vercel/oidc`](https://github.com/dohyunkimmm/footmate/pull/894), [#895 Wrangler](https://github.com/dohyunkimmm/footmate/pull/895), [#898 `actions/setup-python`](https://github.com/dohyunkimmm/footmate/pull/898). 기존 Change Impact·Regression 36·Browser E2E 검사 성공 기록은 있지만 세 PR 모두 이 스냅샷의 최신 `main`보다 뒤처져 있습니다. 최신 기준 테스트 없이 완료·병합으로 기록하지 않습니다.
- 열린 이슈는 [#611 실서명 JWT·TOTP MFA 및 권한 검증](https://github.com/dohyunkimmm/footmate/issues/611) **1건**입니다. 11월 8일 브랜치 감사의 런타임 경로 접점 43개는 기능 누락 확정이 아니며, 현재 UI에서 재현되는 결함 또는 명시적 요구 비교 전까지 과거 패치를 일괄 이식하지 않습니다. 기존 9개 본문 섹션·본편 9장·전략 6장 기준을 유지합니다.
- 이번 확인은 GitHub 트리·PR·CI 기록 대조이며, 운영 Supabase·실사용자 MFA·Vercel/Cloudflare 배포를 새로 실행하거나 승인한 결과가 아닙니다. 미사용이 입증되지 않은 파일, 브랜치, 실데이터, SQL, 증빙 자산은 삭제하지 않습니다. 이전 날짜 기록은 이력으로 둡니다.

## 2026-11-08 최종 · `main` 미반영 패치 전수 분류표

- [PR #891](https://github.com/dohyunkimmm/footmate/pull/891) 병합 후 [`main` 감사 #42493941874](https://github.com/dohyunkimmm/footmate/actions/runs/42493941874) **SUCCESS**: 비기본 브랜치 124개 중 현행 런타임 파일 접점 **43**, 현행 QA 접점 **18**, 문서·생성물 **15**, 사라진 과거 경로만 수정 **40**, 패치 동등 후보 **8**. 구체적 예외·이식 기준은 [후속 보고서](REMAINING-AUDIT-2026-11-08.md)를 참조합니다. **고유 패치 보유 116개는 116개 기능 누락이 아닙니다.** 오래된 화면/자동 PPT/소스코드는 검증 없이 되살리지 않으며 remote ref 삭제·force push·이력 재작성도 하지 않았습니다.

## 2026-11-08 추가 · 미반영 고유 패치의 적용 가능성 분류

- [브랜치 고유 패치 후속 검토](REMAINING-AUDIT-2026-11-08.md): 단순 `ahead`나 고유 패치 117개를 신규 구현 요청으로 보지 않고, 기존 전수 감사에 **현재 `main` 파일과 겹치는 변경 경로의 분류표(`applicability.tsv`)**를 추가합니다. 과거 코드·테스트·미리보기 산출물의 현행 적용 여부를 분리해 검토하며 자동 병합·삭제는 하지 않습니다.

## 2026-11-08 추가 · #611 운영 권한·성능 점검

- [실운영 보안 후속 증빙](SUPABASE-SECURITY-ADVISOR-REVIEW-2026-10-28.md): 인증 사용자 실행 가능 SECURITY DEFINER **21개**의 권한·가드 참조를 확인하고, `operator_*` **11/11개** 함수의 AAL2 가드가 실행 본문 첫 문장임을 검증했습니다. `anon`·`authenticated`의 `public` 스키마 CREATE 권한도 없습니다. **실서명 JWT E2E 통과와는 별개**입니다.
- 미사용 경고 인덱스 8개에 대한 비실행 `EXPLAIN`에서 **6개 사용 계획**, 이메일/푸시 due 인덱스 2개는 작은 테이블에서 순차 스캔 계획이었습니다. 인덱스 삭제는 하지 않았습니다. Cron 3종은 직전 24시간 총 **3,168회 성공, 실패 0**(DB 스케줄 실행 기준). 실제 Auth 세션·TOTP를 통한 [#611](https://github.com/dohyunkimmm/footmate/issues/611) 테스트는 계속 미완료로 유지합니다.

## 2026-11-08 후속 · 미반영 패치·보안 실운영 점검

- [미반영 패치·잔여 보안 실점검](REMAINING-AUDIT-2026-11-08.md): GitHub Compare에서 기존 비기본 브랜치 124개의 분기 상태를 확인했고, [읽기 전용 전체 `git cherry` 감사 #42485591883](https://github.com/dohyunkimmm/footmate/actions/runs/42485591883)는 신규 감사용 브랜치 포함 125개를 검사해 동등 패치 후보 8개·고유 패치 보유 117개·동일 트리 0개를 확인했습니다. 이 결과는 **자동 병합·삭제 허가가 아닙니다.**
- [PR #888](https://github.com/dohyunkimmm/footmate/pull/888) 병합 뒤 [`main` 전수 감사 #42486341433](https://github.com/dohyunkimmm/footmate/actions/runs/42486341433)도 **성공**했습니다. 감사 시점 원격 비기본 브랜치 125개(이번 문서 브랜치 포함)에서 동등 패치 8개·고유 패치 브랜치 117개·동일 트리 0개를 다시 확인했습니다. 이력 삭제·일괄 병합은 실시하지 않았습니다.
- 연결된 `footmate-beta`의 운영 카탈로그와 Advisor를 재조회했습니다. `public` 16개 테이블 RLS 활성, 익명 실행 가능 SECURITY DEFINER 0, 인증 사용자 실행 가능 21, Cron 3개 활성, Advisor WARN/INFO는 미해결로 구분했습니다. [#611](https://github.com/dohyunkimmm/footmate/issues/611)은 실제 JWT·MFA E2E 전까지 열린 상태입니다. 인증정보·권한·SQL·실데이터는 변경하지 않았습니다.

## 2026-11-08 · 현재 `main` 목록 및 발표자료 동기화

- **점검 기준:** [`dcc98b0`](https://github.com/dohyunkimmm/footmate/commit/dcc98b0af61474265c13fad8492fa1aa6d836d8e) 재귀 트리(`truncated=false`)에서 **파일 339개·디렉터리 43개**(루트 14개 파일·9개 폴더), 원격 브랜치 **125개**를 확인했습니다. 모두 이번 점검용 브랜치·PR 생성 **전**의 숫자입니다. 세부 분류 및 보존 기준은 [11월 8일 파일·폴더 점검](REPO-CLEANUP-2026-11-08.md)을 참조합니다.
- **미반영 확인:** 점검 시 열린 PR **0건**, 열린 이슈는 [#611](https://github.com/dohyunkimmm/footmate/issues/611) **1건**입니다. [#886](https://github.com/dohyunkimmm/footmate/pull/886)은 최신 `main`에 병합됐습니다. 기존 브랜치의 고유 패치 전체가 반영됐다고 판단하지 않으며 [#525](https://github.com/dohyunkimmm/footmate/issues/525)의 `closed/not_planned` 보존 결정을 유지합니다.
- **발표자료 현행 구성:** Case Study 본문 **9개 섹션**, 본편 PPT **9장**, 5개년 전략 PPT **6장**. [#876](https://github.com/dohyunkimmm/footmate/pull/876)에서 Rolling Forecast 및 본편 1장을 제거했고, [#878](https://github.com/dohyunkimmm/footmate/pull/878)의 교차검증, [#880](https://github.com/dohyunkimmm/footmate/pull/880)의 썸네일 미리보기, [#881](https://github.com/dohyunkimmm/footmate/pull/881)의 공개 Excel 버튼 제거(원본 XLSX 보존), [#884](https://github.com/dohyunkimmm/footmate/pull/884)의 글꼴 정리, [#886](https://github.com/dohyunkimmm/footmate/pull/886)의 중복 문구 정리가 반영돼 있습니다.
- **검증:** 같은 SHA의 [Case Study QA·Cloudflare 배포·스모크 #42482120022](https://github.com/dohyunkimmm/footmate/actions/runs/42482120022)와 [PPT 미리보기 #42482119997](https://github.com/dohyunkimmm/footmate/actions/runs/42482119997)는 성공. 이 QA 실행에서 Docs-only·Regression 36·Browser E2E는 생략됐으며, 이번 문서 변경의 새 CI 결과는 별개입니다.
- **중복·보존:** 동일 SHA SQL 마이그레이션 **2쌍**은 적용 이력으로 보존. 증빙 이미지·시각 회귀 스냅샷·원본 PPTX/XLSX·기존 브랜치 삭제나 DB 변경은 하지 않습니다. 아래 과거 날짜 섹션의 '현재 10장' 등은 **그 날짜 당시 기록**이며 현행 발표자료 수는 이 항목이 우선합니다.

## 2026-11-07 · 저장소 클렌징 최신 확인

- **기준:** GitHub `main` [`bbe60e5`](https://github.com/dohyunkimmm/footmate/commit/bbe60e54322e03d772354f523f5d2af0518b233d)의 잘리지 않은 재귀 트리에서 **파일 325개·디렉터리 41개**를 확인했습니다. 이 수치는 이번 문서 PR 병합 전 스냅샷입니다.
- **병합·검사:** 열린 PR **0건**, 최신 `main`의 [FootMate QA #42361412100](https://github.com/dohyunkimmm/footmate/actions/runs/42361412100) 전체 성공. [#860](https://github.com/dohyunkimmm/footmate/pull/860)의 데모 선택값 점검과 [#861](https://github.com/dohyunkimmm/footmate/pull/861)의 4개 지역 × 4개 실력 **16조합·새로고침 운영 테스트**는 모두 병합됐습니다. 두 변경은 테스트 코드만 수정했으므로 Cloudflare 재배포는 생략됐고 운영 환경 Smoke는 성공했습니다.
- **미완료:** 열린 이슈는 [#611](https://github.com/dohyunkimmm/footmate/issues/611) 실서명 JWT·MFA 등 허가된 실계정 보안 검증 **1건**입니다. 실제 테스트 계정·세션 증빙 전 해결 처리하지 않습니다. 홈 개편 [#858](https://github.com/dohyunkimmm/footmate/pull/858)은 [#859](https://github.com/dohyunkimmm/footmate/pull/859)에서 의도적으로 되돌린 상태이므로 새 홈/저장 탭을 반영된 기능으로 적지 않습니다.
- **중복·보존:** 재귀 트리상 동일 blob SHA 파일은 **Supabase SQL 마이그레이션 2쌍**뿐이며, 적용 이력 보존을 위해 삭제·합치지 않습니다. E2E 스냅샷·Case Study 증빙·PPTX/XLSX도 현행 검증 자산으로 유지합니다.
- **브랜치·이력:** 원격 브랜치 **123개(보호된 `main` 포함)**, 열린 PR 0건을 확인했습니다. [#525](https://github.com/dohyunkimmm/footmate/issues/525)는 2026-11-06에 고유 이력 보존·삭제 실익 부족으로 `closed/not_planned` 처리됐습니다. 오프-GitHub 영구 백업·외부 참조·소유자 승인 없는 일괄 ref 삭제, force push, Git 이력 재작성은 하지 않습니다. 브랜치 존재만으로 미병합 기능이나 정리 대상이라고 단정하지 않습니다.
- **이번 변경 범위:** 문서의 현재 상태 색인만 업데이트합니다. 앱·Worker·DB·권한·데이터·배포 구성·원격 refs를 변경하지 않으며, 기존 날짜별 기록은 당시 스냅샷으로 보존합니다.

## 2026-11-06 · `main` 파일 목록·이슈·의존성 상태 재동기화

- **재확인 기준:** `main` HEAD [`070dabe`](https://github.com/dohyunkimmm/footmate/commit/070dabe8a5a48ee7c5f3a23d9ca546056c22ff4e)에서 **파일 323개·디렉터리 41개**, 루트 파일 14개·최상위 폴더 9개. 11월 5일 문서의 322개는 당시 스냅샷입니다.
- **링크·보존:** README·문서 및 PR 템플릿 등 Markdown **33개**의 상대 링크 **181개**를 현재 GitHub 트리와 대조해 누락 경로 **0개**를 확인했습니다. 이는 정적 Markdown 경로 검증이며 동적 URL·실서비스·파일 내부 기능의 정상 동작을 보장하지 않습니다. 동일 blob의 SQL 마이그레이션 2쌍은 적용 이력 보존을 위해 유지합니다.
- **의존성 상태 정정:** [#799 Wrangler](https://github.com/dohyunkimmm/footmate/pull/799)와 [#800 OIDC](https://github.com/dohyunkimmm/footmate/pull/800)는 **2026-11-05 미병합 종료**되어 더 이상 열린 PR이 아닙니다. 현재 `package.json`은 `wrangler ^4.156.0`, `@vercel/oidc 4.0.5`를 명시하지만, 두 PR이 병합된 것으로 해석하지 않습니다.
- **2026-11-06 재점검:** [#525 브랜치/용량 정리](https://github.com/dohyunkimmm/footmate/issues/525)는 원격 원본 SHA 8/8 재검증 및 삭제 실익 부재(6개 병합 후보의 고유 blob 0개)를 근거로 **삭제하지 않고 보존**하는 결정으로 `closed/not_planned` 종결했습니다. 실제 브랜치·이력 삭제 및 용량 회수는 **없습니다**. [#829 실기기 접근성](https://github.com/dohyunkimmm/footmate/issues/829)은 **사용자가 실제 iPhone·Android 테스트 전 항목 통과를 확인해 2026-11-06 `closed/completed` 종결**했습니다(모델/OS·캡처·통신 로그 미제출, 독립 검증 아님). 열린 이슈는 [#611 실계정 보안 검증](https://github.com/dohyunkimmm/footmate/issues/611) **1건**입니다. 운영 DB·권한, 증빙 자산 및 SQL 삭제 없음.
- **기존 기준선 QA:** [FootMate QA #42216666549](https://github.com/dohyunkimmm/footmate/actions/runs/42216666549) 및 [PPT 미리보기 #42216666308](https://github.com/dohyunkimmm/footmate/actions/runs/42216666308)은 위 HEAD 기준 성공. 이 문서 변경분의 새 CI와 실제 단말 검증은 별도로 판단합니다.

## 2026-11-05 · `main` 목록·정적 링크·안전 클렌징 점검

- [최신 `main` 폴더와 보존 기준](REPO-CLEANUP-2026-11-05.md): HEAD `577dcef` 기준 322개 파일·41개 디렉터리(루트 14개 파일·9개 폴더). `qa/`·`scripts/`·`worker/` 등 최상위 목록과 진입 URL의 실제 파일 연결을 확인했습니다.
- **검증 보강:** 기존 Markdown 링크 검사에 메인/이전 Case Study HTML 8개 정적 참조 검사를 추가했습니다. 파일이 없는 로컬 링크를 Docs-only QA와 회귀 검사에서 감지합니다. 운영 중 동적/외부 URL이나 실기기 상태를 검증하는 검사는 아닙니다.
- **미완료 유지:** [#829](https://github.com/dohyunkimmm/footmate/issues/829) 실기기 QA, [#611](https://github.com/dohyunkimmm/footmate/issues/611) 실계정 보안, [#525](https://github.com/dohyunkimmm/footmate/issues/525) 백업·브랜치 삭제 승인. [#799](https://github.com/dohyunkimmm/footmate/pull/799)·[#800](https://github.com/dohyunkimmm/footmate/pull/800) 의존성 PR은 별도 검토합니다.
- 이전 11월 3일·4일의 파일 수와 QA 결과는 **당시 스냅샷**으로 보존하며, 현행 수치가 아닙니다.

## 2026-11-03 · 저장소 구성과 클렌징 점검 (당시 기록)

- [현행 파일·폴더·PR·브랜치 정합성 점검](REPO-CLEANUP-2026-11-03.md): `main` 309개 파일·40개 폴더, 정적 경로 존재 여부, 적용 이력 보존 대상인 SQL 마이그레이션, 원격 브랜치 123개의 독립 패치·보존 조건과 의존성 PR 2건의 미반영 상태를 구분합니다. **제품·DB·배포 설정이나 미검증 브랜치를 삭제하지 않았습니다.**
- 이전 [Git branch 감사](BRANCH-PATCH-AUDIT-2026-10-28.md)와 [Issue #525](https://github.com/dohyunkimmm/footmate/issues/525)의 영구 백업·삭제 승인 조건은 계속 유효합니다.

## 2026-11-02 · Case Study ROI·최종 결론 문서 동기화

- **현재 공개 구조:** Case Study 본문은 **9개 섹션**으로, **05번 「수익성·손익분기점」 안에 12개월 예상 ROI**, **09번 「종합 판단·근거」에 단계적 투자 결론**을 배치한다. 발표자료는 **10장**이며 **9장 ROI → 10장 「최종 판단 · 단계적 투자」** 순서다.
- **ROI 가정:** 12개월 현금비용 기준 보수 **−89.7%**, 기준 **−47.5%**, 확장 **−11.4%**, 확장·관리비 반영 **−14.6%**. 신규 사업계획 수치로서 월 운영손익과 계산 기간 및 초기비용 포함 범위를 구분한다. 비용·매출 산출표와 가정은 [현행 기획 문서](https://github.com/dohyunkimmm/footmate-case-study/blob/main/docs/IT-STRATEGY-CASE-STUDY.md)의 05번 참조.
- **의사결정:** 운영자 제휴형 우선 및 수수료·결제비 복합 협상 → 건당 공헌이익·플랫폼 예약 비중·재참가 확인 → 취소·고객지원비 반영 손익·예상 ROI 재산정 → 공급 계약·수익성 기준 충족 시 단계적 투자 확대.
- **운영 반영 근거:** [PR #803–#809](https://github.com/dohyunkimmm/footmate/pull/809)에 걸친 ROI·발표자료·본문 문구 개선의 마지막 본문/PPT 동기화는 [PR #809](https://github.com/dohyunkimmm/footmate/pull/809) 병합 SHA `5d5f62d4e70077ca4c37873481377cd97ddd9ed9`. 최종 [FootMate QA #41414549101](https://github.com/dohyunkimmm/footmate/actions/runs/41414549101)의 Case Study QA·Cloudflare Deploy·Case Study Production Smoke **SUCCESS**.
- **현재 문서 위치:** [전체 기획 근거](https://github.com/dohyunkimmm/footmate-case-study/blob/main/docs/IT-STRATEGY-CASE-STUDY.md) · [9개 섹션 목차](CASE-STUDY-ELEVEN-STAGES.md) · [공개 본문](https://footmate-case-study.fmate.workers.dev/) · [발표자료 미리보기](https://footmate-case-study.fmate.workers.dev/src/case-study/materials.html?preview=1). 10월에 작성된 QA·구성 문서는 당시 기록으로 보존.

## 2026-11-01 · 무료 운영 기준 확정

- **운영 범위:** Supabase `footmate-beta`는 무료 요금제로 유지한다. 무료 범위 밖의 기능·요금제 변경은 이 저장소의 작업·검증 완료 조건에 포함하지 않는다.
- **Supabase Advisor 예외:** `auth_leaked_password_protection` 1 WARN은 무료 환경 기능 제약으로 **예외 수용**한다. 경고 자체는 계속 존재하며 해결 또는 안전 보증으로 표시하지 않는다. `SECURITY DEFINER` 21 WARN과 실제 계정·서명 JWT MFA E2E는 무료 범위의 검증 과제로 유지한다. 자세한 기준은 [보안 감사/예외 분류](SUPABASE-SECURITY-ADVISOR-REVIEW-2026-10-28.md)와 [#611](https://github.com/dohyunkimmm/footmate/issues/611)에 기록한다.
- **운영 변경 없음:** 요금·DB/RPC 권한·인증 계정·운영 Cron·데이터를 바꾸지 않고, 기존 보안 경고는 개별 증거에 따라 검토한다.

## 2026-10-30 · 현행 문서 동기화 기준

- **현재 공개 Case Study:** [PR #728](https://github.com/dohyunkimmm/footmate/pull/728)에서 IT기획·전략기획 **9개 섹션**으로 재구성됐습니다. 런타임 `index.html`의 `data-case-study-stages="9"` 및 `scripts/sync-case-study-assets.cjs` 검사도 9개를 요구합니다. `CASE-STUDY-ELEVEN-STAGES.md`는 과거 링크 호환을 위해 유지된 **파일명**으로, 본문은 현행 9개를 설명합니다. 현재 내용은 [전략 Case Study 근거](https://github.com/dohyunkimmm/footmate-case-study/blob/main/docs/IT-STRATEGY-CASE-STUDY.md)를 우선합니다.
- **Beta P2·P3:** [PR #727](https://github.com/dohyunkimmm/footmate/pull/727)의 실제 로그인 계정별 추천 조건 동기화와 파일럿 4종 KPI 기반이 운영 반영됐습니다. Supabase migration `20261030032856_beta_preferences_pilot_metrics` 적용·RLS 확인. 기존 7일 이벤트 통계와 21일 파일럿 KPI 기준선은 [측정 문서](BETA-MEASUREMENT-READINESS.md)에서 구분합니다. 파일럿 사용자 0명으로 실사용 개선률은 **N/A**입니다. 데모/게스트 추천 조건 및 추천 반응 전반을 기기 간 동기화하지 않습니다.
- **운영 배포 근거:** P2·P3 병합 SHA `89dc541`의 [QA/Cloudflare/Production Smoke #40999197361](https://github.com/dohyunkimmm/footmate/actions/runs/40999197361) 및 전략 Case Study 병합 SHA `aae8f105`의 [QA/Cloudflare/Production Smoke #41001440621](https://github.com/dohyunkimmm/footmate/actions/runs/41001440621)은 모두 SUCCESS. 이 결과가 실제 인증된 테스트 계정 MFA 또는 실사용 KPI를 입증하지는 않습니다.
- **보안 미완료:** [#611](https://github.com/dohyunkimmm/footmate/issues/611)의 실제 Supabase Auth 서명 JWT·AAL1/AAL2/TOTP·복구 실계정 E2E는 아직 검증되지 않았습니다. [PR #729](https://github.com/dohyunkimmm/footmate/pull/729)의 도구/모의 계약 QA와 실계정 수행은 구분합니다. Security Advisor의 authenticated SECURITY DEFINER 경고는 신규 KPI 함수 포함 **21건**이며 미해결입니다. 과거 20건 검토는 [2026-10-28 당시 스냅샷](SUPABASE-SECURITY-ADVISOR-REVIEW-2026-10-28.md)으로 보존합니다.

## 2026-10-28 · Git branch full-clone patch audit

- [BRANCH-PATCH-AUDIT-2026-10-28.md](BRANCH-PATCH-AUDIT-2026-10-28.md): 실제 `git cherry` 및 작업 트리 비교로 남은 120개 브랜치 검사 완료. 중복 패치 후보 8개(병합 PR 6, 미병합 종료 PR 2), 독립 패치 112개, 현재 main 동일 트리 0개. 추가 브랜치 삭제 없음. [감사 Actions](https://github.com/dohyunkimmm/footmate/actions/runs/40604043505) 및 제한 기간 TSV artifact 참조.

## 2026-10-28 · 최종 후속 검증과 잔여 승인 항목

- 최신 `main` [`5f015f7`](https://github.com/dohyunkimmm/footmate/commit/5f015f7d3260c8165ffb22122ca5973d46f5e227)의 [FootMate QA #40616598843](https://github.com/dohyunkimmm/footmate/actions/runs/40616598843)은 **Change Impact, Regression 36, Browser E2E + axe SUCCESS**입니다. Docs-only QA, Deploy Cloudflare, Production Smoke는 **SKIPPED**였으며, 새 운영 배포나 Production Smoke 성공을 뜻하지 않습니다.
- 2026-10-28 감사 직전 검증된 `main` `435585341a9aa748ccb96883b39589862cba0ea3`의 [FootMate QA #40610280350](https://github.com/dohyunkimmm/footmate/actions/runs/40610280350)은 **Regression 36, Browser E2E + axe SUCCESS**. 이번 워크플로 전용 변경은 런타임 무영향이므로 Deploy Cloudflare / Production Smoke가 skipped. 이전 프로덕션 스모크 성공 기록을 이 실행의 성과로 오인하지 않습니다.
- [Supabase 20 SECURITY DEFINER / 8 미사용 인덱스 개별 검토와 실제 API 응답](SUPABASE-SECURITY-ADVISOR-REVIEW-2026-10-28.md): `net`·`extensions` 스키마 REST 비노출(406/PGRST106), 읽기 전용 운영자 RPC 익명 요청 거부(401/42501). 이것은 확장 이동·RPC WARN 해결이나 실계정 JWT MFA/복구 E2E 완료를 뜻하지 않습니다. 실제 서명 JWT 실계정 QA는 [#611](https://github.com/dohyunkimmm/footmate/issues/611)에 미완료로 유지하고, 무료 환경 기능 제약은 별도 예외로 분류합니다.
- [Git 120개 브랜치 패치 감사 / 전체 참조 검증 백업 / 복원 및 삭제 효과 분석](BRANCH-PATCH-AUDIT-2026-10-28.md): [Actions #40610280210](https://github.com/dohyunkimmm/footmate/actions/runs/40610280210)의 ZIP 보관 만료는 **2026-11-04 UTC**. 별도 ChatGPT 파일 라이브러리 복사와 독립 복원·8개 tip SHA 검사를 완료했으나, **소유자 관리 영구 오프-GitHub 보관·외부 참조 검토·삭제 승인은 미완료**. 6개 병합 과거 후보를 가상 제거해도 대형 blob은 0개 해제되므로 크기 절감 명목의 브랜치 삭제는 권장하지 않습니다. [#525](https://github.com/dohyunkimmm/footmate/issues/525) 참고.
- 1회성 대형 백업에 사용한 `[one-time-bundle]` push 마커 자동 실행은 CI 설정에서 제거했으며, 이후에는 명시적 수동 `workflow_dispatch` 요청만 7일 임시 bundle을 만듭니다. 실운영 데이터/권한/인증/요금제/원격 Git ref 및 `main` 이력을 변경하지 않습니다.

# FootMate Documentation

현행 제품 안내는 저장소 루트 [README](../README.md), [매칭 방향](MATCHING-DIRECTION.md), 현재 `main` 코드와 검증 결과를 우선합니다. 위 2026-11-11 요약과 아래 경로 목록이 현재 탐색 기준이며, 그 이전 날짜의 배포·점검 기록은 당시 스냅샷입니다.

## 저장소 폴더 안내 (`main` 기준)

| 경로 | 역할 |
| --- | --- |
| `src/app/`, `src/platform/`, `src/domain/`, `src/shared/` | 보관 중인 프로토타입·공유 도메인·플랫폼 코드 |
| `src/beta/` | 현재 공개 `/demo`·`/beta` 앱과 인증·서버 연동 |
| 보고서 전용 소스(별도 저장소) | 현행 HTML·JS·CSS·증빙·PPTX·XLSX는 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)에서 관리. 이 저장소에 `src/case-study/`는 없음 |
| `api/`, `worker/` | AI/API 구현과 Cloudflare Workers 진입점 |
| `supabase/` | Edge Function·적용 이력이 있는 SQL 마이그레이션 (임의 삭제·이름 변경 금지) |
| `tests/`, `scripts/`, `.github/` | 계약·브라우저 QA, 빌드/검증 스크립트, CI 워크플로 |
| 보고서 전용 QA(별도 저장소) | 발표자료·차트·시각 QA는 [footmate-case-study/qa](https://github.com/dohyunkimmm/footmate-case-study/tree/main/qa)로 이전. 이 저장소에 `qa/`는 없음 |
| `docs/` | 현행 안내·운영 기록·과거 검증 근거 (아래 목록으로 상태 구분) |

실행 코드와 기존 링크·스냅샷·SQL 이력을 유지하기 위해 추가 파일을 임의 삭제하지 않습니다. 위 보고서 전용 경로는 별도 저장소로 분리된 현재 위치이며, 이 저장소의 과거 `docs/` 기록을 현행 보고서 소스로 취급하지 않습니다.

## 현재 제품·운영 기준

- [루트 README](../README.md) — 제품 가치, `Find → Decide → Join → Play → Return`, 공개 화면·데이터·AI 책임 경계
- [MATCHING-DIRECTION.md](MATCHING-DIRECTION.md) — **현행 풋살 매칭 방향**: 활동 지역 → 실력·포지션·시간 → 추천 미리보기 → 참가 시 로그인 → `/beta`
- [Case Study `/`](https://footmate-case-study.fmate.workers.dev/) — IT기획·전략기획 9개 섹션. 현행 구현은 [별도 저장소의 `src/case-study/`](https://github.com/dohyunkimmm/footmate-case-study/tree/main/src/case-study)에서 관리
- [FootMate Demo `/demo`](https://footmate.fmate.workers.dev/demo) — 로그인 전 풋살 조건 선택·예시 경기/추천 미리보기. 인증 후 `/beta`로 진입
- `/beta` — 인증 후 추천·내 경기·MY. 실제 서버 경기·참가를 우선하고, 실제 모집이 없을 때는 명시된 예시 경기/브라우저 기록과 분리
- `/beta/operator` — 허용된 운영자 전용 TOTP MFA 경로
- `/prototype` — 이전 로컬 프로토타입 보관용. Guided/Evidence 등 과거 실험 흐름은 현행 공개 앱 기준으로 사용하지 않음

## 2026-10-27 동기화 점검

- 이번 제품 코드 변경 점검 당시 확인한 `main`은 [`bf3aa123`](https://github.com/dohyunkimmm/footmate/commit/bf3aa1238589e70e1ab046256f273824aba8c980)입니다. [FootMate QA #40490413086](https://github.com/dohyunkimmm/footmate/actions/runs/40490413086)에서 Change Impact·Regression 36·Browser E2E + axe·Deploy Cloudflare·Production Smoke가 모두 성공했습니다. CI 결과는 실제 이용자 OAuth·통계 표본·외부 서비스 설정의 수동 검증을 뜻하지 않습니다.
- PR [#703](https://github.com/dohyunkimmm/footmate/pull/703)–[#709](https://github.com/dohyunkimmm/footmate/pull/709)의 날짜·시간 선택, 추천 갱신, 중복 없는 다시 추천, 동의형 탐색 계측, 추천 반응 및 필터 조작 후속 변경을 현재 코드와 비교했습니다. 기능·데이터 수집 범위는 [매칭 방향](MATCHING-DIRECTION.md) 및 [Beta 측정 기준](BETA-MEASUREMENT-READINESS.md)을 우선합니다. 실제 전환 성과는 미측정입니다.
- 후속 확인에서 [Vercel 프로젝트 영구 삭제 #685](https://github.com/dohyunkimmm/footmate/issues/685)는 Vercel 감사 이벤트와 삭제 후 API 조회로 검증한 뒤 **종료**했습니다. 현재 남은 두 이슈는 [Supabase 보안·RLS 검토 #611](https://github.com/dohyunkimmm/footmate/issues/611)과 [브랜치/이력 위생 #525](https://github.com/dohyunkimmm/footmate/issues/525)입니다. DB 권한 변경·브랜치 삭제·이력 강제 변경은 진행하지 않았습니다. 과거 운영 지침의 현재 해석은 [저장소 운영 기록](REPO-OPERATIONS.md) 상단을 참조합니다.
- 2026-10-27 후속 점검에서 비공개 Notion [AI 기능 확장 PRD](https://app.notion.com/p/3cf21460c9348184bfbad953b0a1b305), [Service Flow · Data Quality](https://app.notion.com/p/3cf21460c934815c89bed8f7ee337092), [AI Agent Workflow](https://app.notion.com/p/3cf21460c934815799a4fd44af094cee)를 직접 비교·수정·재조회했습니다. 현재 `/demo`와 과거 `/prototype`을 구분하고 날짜·시간 필터/추천 반응/동의형 탐색 계측 기준을 반영했습니다. 이 세 문서 외의 전체 Notion·외부 OAuth·실제 이용자 성과는 일괄 검증한 것이 아닙니다.

## 2026-10-27 보안·브랜치 후속 현행 상태

- [PR #713](https://github.com/dohyunkimmm/footmate/pull/713)과 [#714](https://github.com/dohyunkimmm/footmate/pull/714)에서 운영 RLS 정책 11개의 JWT InitPlan 최적화 및 실제 Supabase migration version `20261027122602` 동기화를 완료했습니다. 이후 `auth_rls_initplan` 경고 0건, Cloudflare Production Smoke [#40505456839](https://github.com/dohyunkimmm/footmate/actions/runs/40505456839) SUCCESS입니다. 위의 “DB 권한 변경 없음” 문장은 **당시 문서 동기화 시점**을 설명하며 현행 정책 변경 여부가 아닙니다.
- [Supabase Security Advisor 판정](SUPABASE-SECURITY-ADVISOR-2026-10-27.md): authenticated SECURITY DEFINER RPC 권한 경계 검증, 남은 `pg_net` 경고 및 Free 플랜으로 제한된 유출 비밀번호 보호 안내. 경고를 억지로 없애려고 사용자 RPC/알림 Cron을 깨는 변경은 하지 않습니다.
- [Git 브랜치 위생 감사](BRANCH-HYGIENE-2026-10-27.md): `ahead=0` 단일 후보 확인, 이력 차이가 있는 브랜치는 별도 patch-equivalence 감사로 보존. 브랜치 삭제나 `main` 이력 재작성은 완료되지 않았습니다.

## 2026-10-28 · 브랜치 실제 정리 현황

- [PR #718](https://github.com/dohyunkimmm/footmate/pull/718)로 [일회성 GitHub Actions](https://github.com/dohyunkimmm/footmate/actions/runs/40597913047) **SUCCESS** 후 `docs/compact-demo-release-654` 브랜치 1개 삭제를 API로 재확인했습니다. 안전 점검 증거는 [브랜치 위생 기록](BRANCH-HYGIENE-2026-10-27.md)에 반영했고, 남은 diverged 브랜치와 Git 용량 정리는 #525에서 계속합니다. pre-cleanup CSV는 당시 ref를 보존한 **기록**이지 실시간 브랜치 목록이 아닙니다.

## 2026-10-28 · 운영 안전성 후속

- Supabase [pg_net 권한·Cron 읽기 전용 감사](../tests/database/pgnet-boundary-readonly.sql): 실행 중인 알림 Cron 3개와 `postgres` 실행 계정 검증. 비이동 확장과 기본 grant의 위험 때문에 임의의 `REVOKE`/재설치를 실행하지 않았으며, 이후 **실제 REST Data API**에서 공개 anon JWT로 `public` 200 / `net`·`extensions` **406(PGRST106, 스키마 비노출)**을 확인했습니다. [2026-10-28 개별 검토](SUPABASE-SECURITY-ADVISOR-REVIEW-2026-10-28.md)를 우선합니다. 확장 설치 위치 경고는 여전히 잔존합니다.
- GitHub [전체 브랜치 tip-SHA 스냅샷](BRANCH-REFS-2026-10-28.csv): 총 122개 ref·보호 여부를 보존했습니다. Git 객체 자체 백업/브랜치 삭제는 아닙니다.

## 운영·릴리스 핵심 문서

- [SUPABASE-SECURITY-ADVISOR-2026-10-27.md](SUPABASE-SECURITY-ADVISOR-2026-10-27.md) — 남은 Auth·RPC·pg_net 보안 경고와 운영별 제약·검증 범위
- [BRANCH-HYGIENE-2026-10-27.md](BRANCH-HYGIENE-2026-10-27.md) — 121개 비기본 브랜치 전수 비교, 미삭제 안전 후보 및 용량 조사 한계
- [REPO-OPERATIONS.md](REPO-OPERATIONS.md) — **2026-10-22~23 당시** GitHub Ruleset·Vercel 배포·WAF·마이그레이션 보존 기록. **현행 Cloudflare 운영 상태의 최신 보고서가 아님**
- [RELEASE-HISTORY.md](RELEASE-HISTORY.md) — 날짜·PR·SHA별 구현·검증·배포 기록. 이전 Vercel/Render 및 이후 변경 기록을 각각의 시점 기준으로 해석
- [RELEASE-HISTORY-CORRECTIONS.md](RELEASE-HISTORY-CORRECTIONS.md) — 당시 기록을 보존하며 이후 바뀐 승인·해석 기준 구분
- [BETA-PILOT-RUNBOOK.md](BETA-PILOT-RUNBOOK.md) — 연결된 Beta 운영·알림 복구·QA 데이터 정리
- [BETA-MEASUREMENT-READINESS.md](BETA-MEASUREMENT-READINESS.md) — 실제 이용자 지표의 표본·코호트·측정 인정 기준
- [PRODUCT-UX-P0-P2.md](PRODUCT-UX-P0-P2.md) — 2026-10-10 P0–P2 개선·검증 기록. 과거 Demo IA의 현재 적용 여부는 루트 README와 최근 구현을 우선
- [RELEASE-APP.md](RELEASE-APP.md) — **이전 로컬 프로토타입 Release App v6의 구현·QA 이력**. 현재 `/demo` 내비게이션·인증 기준으로 오인하지 않음

현재 배포 워크플로는 [`.github/workflows/qa.yml`](../.github/workflows/qa.yml)의 **Deploy Cloudflare / Production Smoke**를 확인합니다. 문서 인덱스를 갱신했다는 이유만으로 운영 배포·실사용 성과를 새로 검증했다고 표기하지 않습니다.

## 2026-10-10 Release App 내부 Notion 동기화 이력

- [FootMate AI 기능 확장 PRD](https://app.notion.com/p/3cf21460c9348184bfbad953b0a1b305) — 당시 Release App P0–P2 수용 기준과 운영 검증 상태. 이전 배포 실패 기록은 당시의 이력으로 보존
- [FootMate Service Flow · Data Quality](https://app.notion.com/p/3cf21460c934815c89bed8f7ee337092) — 신규/재방문 분기, 상태·데이터 소유권, AI 조건 수정·제로결과 완화, MY/Return 일관성
- [FootMate 기능정의서 · AI Agent Workflow](https://app.notion.com/p/3cf21460c934815799a4fd44af094cee) — AI inference의 조건 소유권과 deterministic search 경계

위 3개 비공개 내부 문서는 PR #577 운영 반영 결과를 기준으로 2026-10-10 동기화했으며, GitHub의 [문서 동기화 PR #578](https://github.com/dohyunkimmm/footmate/pull/578)에서 변경 검증을 추적합니다. 이는 2026-10-10 당시 동기화 기록입니다. 이번 GitHub 문서 색인 정리는 비공개 Notion의 최신 내용을 재검증하거나 수정한 작업이 아닙니다. 릴리스 커밋·QA·배포 이력은 GitHub [RELEASE-HISTORY.md](RELEASE-HISTORY.md)를 기준으로 확인합니다.

## 현재 근거·품질 문서

- [SERVICE-PLANNING-EVIDENCE.md](SERVICE-PLANNING-EVIDENCE.md) — 역할·우선순위·설계 가정 및 KPI 8개 측정 설계·한계
- [USER-TEST-EVIDENCE.md](USER-TEST-EVIDENCE.md) — 교육생 6명·가입/탐색 과업 8회의 관찰 범위와 해석 한계
- [CASE-STUDY-ELEVEN-STAGES.md](CASE-STUDY-ELEVEN-STAGES.md) — 이전 파일명을 유지한 9개 섹션 목차 기록. 현재 보고서 원본과 QA는 [별도 저장소](https://github.com/dohyunkimmm/footmate-case-study) 기준
- [CASE-STUDY-SCREEN-EVIDENCE.md](CASE-STUDY-SCREEN-EVIDENCE.md) — 2026-10-25 Demo·Case Study 원본 캡처의 출처와 가독성 검증 범위
- [TYPOGRAPHY-QA-V2.md](TYPOGRAPHY-QA-V2.md) — 타이포그래피 QA 시나리오·증거 무결성·수동 검토 경계

## 과거 구성·개선 기록 (보존, 현재 승인 기준 아님)

- [CASE-STUDY-NINE-STAGES.md](CASE-STUDY-NINE-STAGES.md) — 과거 9단계 구성
- [CASE-STUDY-PORTFOLIO-P0-P2.md](CASE-STUDY-PORTFOLIO-P0-P2.md) — 과거 9단계 포트폴리오 개선 근거
- [CASE-STUDY-TYPOGRAPHY-QA.md](CASE-STUDY-TYPOGRAPHY-QA.md) — 과거 9단계 타이포그래피 검사
- [CASE-STUDY-VISUAL-QA.md](CASE-STUDY-VISUAL-QA.md) — 과거 9단계 이미지·시각 위계 검사
- [CASE-STUDY-COPY-QA-CORRECTIONS.md](CASE-STUDY-COPY-QA-CORRECTIONS.md) — 과거 13단계 문구 정정
- [CASE-STUDY-5.2-COMPOSITION.md](CASE-STUDY-5.2-COMPOSITION.md) — 과거 13단계 구성 기록

Case Study의 현행 구조와 캡처는 [별도 보고서 저장소](https://github.com/dohyunkimmm/footmate-case-study)의 구현·검증 자료를 우선합니다. 이 저장소의 `CASE-STUDY-ELEVEN-STAGES.md`와 `CASE-STUDY-SCREEN-EVIDENCE.md`는 작성 당시 근거 기록입니다. 이미 적용된 SQL 마이그레이션 및 릴리스 이력은 이름·내용 유사성만으로 삭제하거나 이동하지 않습니다.

## Impact-aware QA

GitHub Actions QA는 변경 영향에 맞게 실행한다.

- runtime/product 변경: `Regression 36` + `Browser E2E + axe`를 실행하고, `main` push에서 필요한 `Production Smoke`까지 수행한다.
- UI/UX/layout 변경: 제품 화면은 기존 Playwright 시각 회귀·E2E·접근성 검증 기준을 따릅니다. Case Study 전용 E2E·시각 QA는 [보고서 저장소의 워크플로](https://github.com/dohyunkimmm/footmate-case-study/blob/main/.github/workflows/report-qa.yml)에서 별도 관리합니다. 보고서 QA를 제품 저장소에서 실행한다고 기록하지 않습니다.
- docs-only 변경: `README.md`·`docs/` 등의 변경은 `Change Impact`에서 non-runtime으로 분류되며, `Docs-only QA`가 `git diff --check`, README·문서의 저장소 내 링크 검사, connected-platform·release-app 문서 계약을 실행한다. 이때 Regression/Browser E2E/Production Smoke는 skip한다.
- workflow-only 변경: `.github/workflows/qa.yml`은 현행 `classify-cloudflare-impact.cjs`에서 runtime 영향으로 분류된다. 회귀·브라우저 검사를 실행하고, 새 Cloudflare 배포 없이 기존 운영 대상 `Production Smoke`를 실행할 수 있다. 따라서 문서 전용과 동일한 경량 QA라고 표현하지 않는다.
- `queued` / `in_progress`는 실패나 stuck을 의미하지 않으며, 실제 failure/cancel/timeout 또는 progress 정지 근거가 있을 때만 이상 상태로 판단한다.

## Final sync-up rule

중요 runtime 변경이나 Production 수동 QA가 최종 확정된 뒤에는 아래 순서로 durable 상태를 닫는다.

`최종 runtime/수동 QA 확정 → README → Release History/Correction → Runbook(절차 변경 시) → Notion 관련 페이지(장기 제품 사실이 바뀐 경우) → Case Study 설명·대표 화면 점검(material change인 경우) → 서로 상충하는 pending/미검증 문구 검색 → QA/merge`

완료 사실이 새로 확정되면 과거 문서의 `별도 확인 대상`, `미검증`, `pending` 같은 표현과 충돌하지 않는지 반드시 다시 검색한다. 제품/배포 사실과 절차 문서가 모두 일치하기 전에는 최종 sync-up 완료로 표현하지 않는다. 과거 Release History 자체를 보존해야 하는 경우에는 `RELEASE-HISTORY-CORRECTIONS.md`에 supersession을 명시해 현재 해석을 분리한다.

Case Study는 Product package release와 버전을 묶지 않습니다. 작은 시각적 수정만으로 보고서 동기화를 요구하지 않습니다. 제품의 핵심 기능·사용자 흐름·대표 화면·근거가 실제로 바뀌었을 때 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)의 해당 원본과 전용 QA를 별도 검토합니다. 이 저장소의 과거 `src/case-study/`와 13단계 생성 번들을 현행 수정 대상으로 보지 않습니다.

제품 사실을 업데이트할 때는 사용자-facing 현재 상태와 release engineering 기록을 분리합니다. 일시적인 quota, pending, canceled 같은 운영 상태는 durable 문서에 누적하지 않습니다. QA 파일도 현재 gate에서 사용하는 suite와 필요한 compatibility regression만 유지하고, 과거 release marker에 고정된 snapshot은 current parity를 이관한 뒤 제거합니다.

