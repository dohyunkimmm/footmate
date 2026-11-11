# FootMate `main` 파일·폴더 정합성 및 안전 클렌징 — 2026-11-05

> **조회 기준:** `main` HEAD [`577dcef`](https://github.com/dohyunkimmm/footmate/commit/577dcef913d27be502bc809bf4929a8c77c0b233), GitHub 재귀 트리(잘림 없음). 이 수치는 본 점검 PR이 병합되기 **전**의 스냅샷이며, 외부 저장소·로컬 작업 폴더·실제 서비스 데이터까지 조사했다는 뜻은 아닙니다.

## 1. 누락 점검과 반영

- **확인한 사항:** 공개 진입 HTML 및 보존된 Case Study HTML 8개(`index.html`, `app.html`, `beta.html`, `beta-operator.html`, `beta-data-notice.html`, `materials.html`, `forecast.html`, `decision-memos.html`)의 정적 `href`/`src` 참조를 GitHub `main` 파일 트리와 대조했습니다. 확인한 정적 참조에서 없는 로컬 파일은 발견하지 않았습니다.
- **확인된 QA 공백:** 기존 `scripts/check-local-doc-links.cjs`는 Markdown의 상대 경로만 검사하고 공개 HTML의 정적 파일 링크는 검사하지 않았습니다.
- **반영한 개선:** 기존 링크 검사에 위 8개 HTML의 `a`/`link`/`script`/`img`/`source` 정적 `href`/`src`/`poster` 확인을 추가합니다. Worker가 제공하는 `/demo`·`/beta`·`/beta/operator`·`/prototype` 및 기존 리디렉션 별칭을 파일과 구분합니다. 따라서 기존 Docs-only QA와 일반 회귀 QA 모두에서 누락된 로컬 정적 경로를 감지할 수 있습니다.
- **검증 한계:** 브라우저 실행 중에 생성하는 동적 주소, JS 내부 `fetch()`/동적 `import()`, 외부 링크의 실제 접속 및 운영 배포 상태는 이 정적 검사만으로 검증되지 않습니다.

## 2. `main` 최상위 목록

총 **322개 파일·41개 디렉터리**(재귀 트리 363개 항목). 루트에는 **14개 파일과 9개 디렉터리**가 있습니다.

| 최상위 폴더 | 역할 및 보존 판단 |
| --- | --- |
| [`.github/`](../.github/) | 보호된 `main`, CI, 의존성 자동화 구성. 유지 |
| [`api/`](../api/) | 서버 연동 API. 유지 |
| [`docs/`](./) | 현행/과거 전략·운영·보안·QA 기록. 이력 구분 유지 |
| [`qa/`]( https://github.com/dohyunkimmm/footmate-case-study/tree/main/qa/) | 발표자료·차트·시각 자산 보정 도구. 유지 |
| [`scripts/`](../scripts/) | 배포 준비, 자동 검사, 미리보기 동기화. 유지 |
| [`src/`](../src/) | 앱, Beta, 공통 코드, 플랫폼 및 Case Study 원본. 유지 |
| [`supabase/`](../supabase/) | Edge Functions와 순차 적용 SQL 마이그레이션. 유지 |
| [`tests/`](../tests/) | 계약·브라우저·DB 감사 및 시각 스냅샷. 유지 |
| [`worker/`](../worker/) | API와 공개 진입 경로 라우팅. 유지 |

**루트 진입/웹 자산(9개):** `index.html`, `app.html`, `beta.html`, `beta-operator.html`, `beta-data-notice.html`, `beta-sw.js`, `favicon.svg`, `og-footmate.png`, `README.md`.

**루트 설정/의존성(5개):** `.gitignore`, `package.json`, `package-lock.json`, `playwright.config.cjs`, `wrangler.jsonc`.

`/`는 `index.html`, `/demo`·`/beta`는 `beta.html`, `/beta/operator`는 `beta-operator.html`, `/prototype`은 `app.html`로 연결됩니다. 단순한 중복 파일처럼 보여도 공개 URL 호환을 위해 파일명을 유지합니다.

## 3. 중복·삭제 검토

- Git blob SHA가 완전히 일치하는 파일은 **SQL 마이그레이션 2쌍**입니다: `20260922012426_beta_push_media.sql` / `20260922013306_beta_push_media.sql`, `20260922012607_beta_push_worker_schedule.sql` / `20260922013447_beta_push_worker_schedule.sql`. **DB 적용 이력이 얽힌 파일이므로 삭제·합치기·이름 변경을 하지 않습니다.**
- `src/case-study/report-previews.js`, PPTX/XLSX 원본, `evidence/` 이미지, `tests/e2e/` 스냅샷은 발표 자료·증빙·회귀 검증에 쓰이므로 단순히 용량이나 유사 파일명만 보고 제거하지 않습니다.
- 과거 파일명 `docs/CASE-STUDY-ELEVEN-STAGES.md`는 현재 9개 섹션의 문서와 연결된 호환 이름이므로 유지합니다.
- **이번 클렌징의 실제 반영은 점검 범위 확대와 최신 루트 폴더 색인 정리**입니다. 코드·자료를 근거 없이 삭제하거나 위치 변경하지 않습니다.

## 4. 미완료 항목과 보존 경계

| 항목 | 2026-11-05 GitHub 조회 결과 | 처리 |
| --- | --- | --- |
| [#829 실기기 접근성 QA](https://github.com/dohyunkimmm/footmate/issues/829) | 열림. iPhone/Android 실제 기기 및 200% 확대 수동 증빙 필요 | 실제 기기 증빙 전 완료 처리하지 않음 |
| [#611 무료 환경의 보안 검증](https://github.com/dohyunkimmm/footmate/issues/611) | 열림. 서명 JWT·MFA·RPC/RLS 등의 실계정 점검이 남음 | 무료 요금제 유지, 실서비스 권한·DB 무단 변경 없음 |
| [#525 브랜치/이력 클렌징](https://github.com/dohyunkimmm/footmate/issues/525) | 열림. 오프-GitHub 영구 백업과 외부 참조·삭제 승인 확인되지 않음 | 브랜치·태그 삭제, force push, Git 이력 재작성 금지 |
| [#799 Wrangler](https://github.com/dohyunkimmm/footmate/pull/799) · [#800 OIDC](https://github.com/dohyunkimmm/footmate/pull/800) | 의존성 PR 두 건 열림 | 최신 `main` 기반 CI 확인 전 임의 병합/종료하지 않음 |

## 5. QA 및 병합 기준

- 점검 시작 시 `main` HEAD `577dcef`의 [FootMate QA 실행 #42023668914](https://github.com/dohyunkimmm/footmate/actions/runs/42023668914)은 **success**입니다. 신규 변경의 CI 성공 여부를 뜻하지는 않습니다.
- 새 링크 검사 스크립트는 기존 `.github/workflows/qa.yml`의 **Docs-only QA**와 **Regression 36**에서 호출됩니다. 변경 브랜치의 결과는 별도 확인해야 합니다.
- 이번 변경은 제품 런타임 코드·Supabase 마이그레이션·원본 PPTX/XLSX·배포 변수 및 원격 Git 참조를 수정하지 않습니다. 기존 변경 영향 분류상 `scripts/` 수정 PR은 강화된 QA·배포 조건을 적용할 수 있으며 실제 반영은 보호된 `main` 병합 기준을 따릅니다.
- [2026-11-03 이전 스냅샷](REPO-CLEANUP-2026-11-03.md)의 수치와 이력은 그 날짜 기준으로 보존합니다.
