# FootMate 제품 저장소 `main`·브랜치 점검 — 2026-11-20

## 후속 검증 결과 · 2026-11-20

- [문서 PR #963](https://github.com/dohyunkimmm/footmate/pull/963)은 전체 QA·읽기 전용 Git 감사 성공 후 `main` [`382bbcd`](https://github.com/dohyunkimmm/footmate/commit/382bbcd19dd163cd3b05953da492ac13ea5d1f3c)로 병합됐습니다. [원본 태그 PR #964](https://github.com/dohyunkimmm/footmate/pull/964)도 최신 `main` 기준 [전체 QA #44696140505](https://github.com/dohyunkimmm/footmate/actions/runs/44696140505) 성공 후 [`439e865`](https://github.com/dohyunkimmm/footmate/commit/439e865c05dd321f90bbea16c90f66428caf9747)로 병합됐습니다.
- [최신 읽기 전용 Git 감사 #44694618167](https://github.com/dohyunkimmm/footmate/actions/runs/44694618167)는 **SUCCESS**였습니다. 실행 중 임시 PR 브랜치를 포함한 총 원격 133개(비기본 132개) 중 **패치 동등 8개(과거 병합 PR 6개·미병합 종료 2개), 고유 패치 124개, ancestry-contained 0개, `main`과 동일한 tip tree 0개**였습니다. 별도 브랜치 삭제 판단은 이 수치만으로 하지 않습니다.
- [태그 보존 실행 #44697137487](https://github.com/dohyunkimmm/footmate/actions/runs/44697137487)이 **SUCCESS**: 원본 Git SHA를 아래 태그들로 만들고 **각 태그·원본 브랜치의 SHA 동일성 6/6을 재검증**했습니다. 이력, 운영 서버·SQL·보고서 산출물 변경은 없습니다.

| 과거 병합 PR | 기존 브랜치 | 보존한 정확한 HEAD SHA |
| --- | --- | --- |
| [#5](https://github.com/dohyunkimmm/footmate/pull/5) | `docs/sync-final-qa` | `e051486c6c2fc5b2826bdd1eee3e08331a443e29` |
| [#7](https://github.com/dohyunkimmm/footmate/pull/7) | `docs/sync-qa-record` | `56c716e36fcc30d6cab9fbe2a7cc157bc08d3e1e` |
| [#8](https://github.com/dohyunkimmm/footmate/pull/8) | `docs/add-verification-matrix` | `afd0e049a010f4128ba05f2ef6cbe4cae1615f60` |
| [#9](https://github.com/dohyunkimmm/footmate/pull/9) | `docs/add-evidence-index` | `2b3ff9efece25c66c8b5bb0959a24091a1739bd8` |
| [#12](https://github.com/dohyunkimmm/footmate/pull/12) | `chore/retry-vercel-deploy` | `75c390b648542780ca0515e7637a0fbb0d28c99c` |
| [#13](https://github.com/dohyunkimmm/footmate/pull/13) | `docs/footmate-closeout` | `febb351d477950971365a708caa6b3aeca073bcf` |

태그명 규칙: `archive/merged/20261120/pr-<PR 번호>/<원본 브랜치>`. **GitHub 태그는 오프-GitHub 소유자 영구 백업을 대신하지 않습니다.** 기존 6개 브랜치, 미병합 종료 2개 브랜치, 고유 패치가 있는 모든 브랜치를 보존했으며, **브랜치 삭제 0건**입니다. 영구 외부 bundle 백업·외부 브랜치 참조 검증이 끝나기 전에는 삭제하지 않습니다. 완료된 일회성 `archive-merged-six-once.yml`은 후속 클렌징 PR에서 제거합니다.

## 기준과 변경 범위

- GitHub 기본 브랜치: [`main` `720ffc4`](https://github.com/dohyunkimmm/footmate/commit/720ffc45948b0b2d8e95f658f65b4883e8af246a). 2026-11-20 GitHub API 재귀 트리는 `truncated=false`였습니다.
- **점검 시점 파일 280개, 디렉터리 37개, 최상위 폴더 8개, 루트 파일 13개**. 점검 문서 1개가 병합되면 파일 **281개**(디렉터리 37개)가 됩니다.
- 병합 후 상위 경로별 파일: `.github/` 5, `api/` 2, `docs/` 36, `scripts/` 11, `src/` 87, `supabase/` 36, `tests/` 89, `worker/` 2, 루트 13.
- 정확히 동일한 Git blob SHA는 Supabase 마이그레이션 **두 쌍**뿐입니다: `20260922012426_beta_push_media.sql` / `20260922013306_beta_push_media.sql`, `20260922012607_beta_push_worker_schedule.sql` / `20260922013447_beta_push_worker_schedule.sql`. 적용·의존 이력 때문에 둘 다 보존합니다. `.bak/.old/.tmp/.log/.zip` 같은 명백한 임시 파일은 확인되지 않았습니다.
- 보고서 전용 `src/case-study/`·`qa/`는 본 제품 저장소에 없습니다. 정본인 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study) `main` [`53d7e64`](https://github.com/dohyunkimmm/footmate-case-study/commit/53d7e64c24bc828caf8e6949aa877cd932fc5f7a)에 **파일 117개·디렉터리 15개**로 분리돼 있습니다. 보고서 파일을 제품 저장소로 재복사하지 않습니다.

## PR·원격 브랜치 상태

- 점검 시 GitHub branches API 페이지 1–2에서 **원격 브랜치 132개**(`main` 1개, 비기본 131개)를 확인했고 열린 PR은 **0건**입니다. 2026-10-28의 121개·120개 숫자는 그 당시의 기록이며 지금의 개수가 아닙니다.
- `main` 최근 반영: [#959](https://github.com/dohyunkimmm/footmate/pull/959) 데모 탐색·일정, [#960](https://github.com/dohyunkimmm/footmate/pull/960) 배포 상세 레이블 QA, [#961](https://github.com/dohyunkimmm/footmate/pull/961) 참가 흐름, [#962](https://github.com/dohyunkimmm/footmate/pull/962) 메뉴 간격. 최신 `main`은 #962 병합 후 상태입니다.
- [2026-10-28 패치 전수 감사](BRANCH-PATCH-AUDIT-2026-10-28.md)에서는 당시 120개 비기본 브랜치 중 패치 등가 후보 8개, 고유 패치 112개, 동일 트리 0개였습니다. **현재 131개에 관한 새 패치 등가 판정이 아니며**, 오래된 `ahead/behind` 숫자만으로 현재의 브랜치를 삭제하지 않습니다.
- 해당 역사적 후보 중 과거 PR 병합이 확인된 여섯 브랜치(원본 HEAD SHA 변동 없음): `chore/retry-vercel-deploy` (#12), `docs/add-evidence-index` (#9), `docs/add-verification-matrix` (#8), `docs/footmate-closeout` (#13), `docs/sync-final-qa` (#5), `docs/sync-qa-record` (#7). 현행 `main`에 대해 모두 `ahead=1`이지만 2026-10-28 당시 `git cherry`에서는 패치 등가로 분류됐습니다. 삭제 가능 여부를 주장하려면 최신 전체 Git 감사·원본 SHA 보존·외부 참조 확인이 필요합니다.
- 이 외 `chore/retry-cardcopy-production` (#469)과 `qa/webkit-my-selector-20260928` (#375)은 과거 **미병합 종료** 상태여서 보존합니다. 여러 다른 브랜치 역시 독자적인 변경을 갖고 있으므로 보존합니다. `chore/product-hardening-11-20`처럼 이름은 새로워도 실제 HEAD 커밋 날짜가 2026-09-24인 예가 있어 이름만 보고 현행 반영 대상이라 판단하지 않습니다.
- 기존 [브랜치 감사](BRANCH-HYGIENE-2026-10-27.md)·[이력 객체 감사](BRANCH-PATCH-AUDIT-2026-10-28.md)는 **소유자 관리 오프-GitHub 영구 백업과 외부 사용 참조 최종 확인 전 대량 ref 삭제를 금지**합니다. 과거에 임시 생성한 bundle artifact는 영구 보관 증빙이 아닙니다. 이번 문서 작업에서는 추가 브랜치를 삭제·재작성하지 않습니다.

## QA·운영 배포와 미검증 범위

- `main` `720ffc4`의 [FootMate QA #44263406614](https://github.com/dohyunkimmm/footmate/actions/runs/44263406614)는 **SUCCESS**였습니다. Change Impact, Regression 36, Browser E2E + axe, Deploy Cloudflare, Production Smoke 모두 성공했습니다.
- Cloudflare `footmate` Worker 최신 조회 배포는 `85dd335f-79ad-4342-8d35-c371a24f1ad5`(2026-11-18 08:10 UTC), 버전 `930addaf-849d-4785-93d0-b8408e9f4903`, 트래픽 100%였습니다. GitHub QA는 배포 성공을 확인하지만, Cloudflare 배포 객체가 별도 `commit_hash` 값을 제공하지 않아 배포 버전-SHA의 독립 일치 검증까지 끝났다고 표시하지 않습니다.
- [실서명 JWT·운영자 TOTP MFA 검증 이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)은 **OPEN**입니다. 보유하지 않은 승인 테스트 계정·세션을 사용하지 않으며 실제 인증 E2E, 권한, RLS, Cron, DB, 결제 및 유료 요금제는 이번 저장소 정리에서 변경하거나 완료로 주장하지 않습니다.
- 이 기록의 새 PR QA 성공·병합 및 후속 운영 배포 여부는 **별도의 커밋 단위 결과**로 판단합니다. 현행 서비스 경로·자산·환경·보고서 원본, SQL 실행 이력, 과거 증빙은 보존합니다.
