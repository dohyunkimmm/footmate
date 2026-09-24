# FootMate Release History

이 문서는 현재 public branch의 **검증된 durable release 사실**을 기록한다. 일시적인 Preview 취소·quota·대기 상태는 누적하지 않는다. docs-only merge로 moving `main`이 바뀌어도 각 release의 product/runtime baseline과 exact Production SHA는 별도로 유지한다.

## Case Study AI preview emphasis / spacing closure · 2026-09-24

- Scope: Case Study cover의 AI Match Assistant 정적 프리뷰 강제 높이를 해제해 상태 카드 아래 과도한 공백을 제거하고, `NEW` 배지와 `AI 기능 추가` 캡션으로 신규 AI 기능을 즉시 식별 가능하게 함
- Runtime/Product boundary: Case Study 13-section IA·본문 순서·Real App 동작·AI 추천/가드레일 로직 변경 없음
- Runtime PR: #247 · merged SHA `fa4a1fd9c023cef647a6d1114ed052b75b36f358`
- Visual baseline: 의도된 cover 변화에 맞춰 Case Study screenshot baseline 갱신; 임시 baseline 갱신 workflow는 merge 전 제거
- Final post-merge QA: FootMate QA #1120 · run `35953801099` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Vercel Production: `dpl_E5Qm3WqkySWv7TtPdqH2CAH93GRQ` · SHA `fa4a1fd9c023cef647a6d1114ed052b75b36f358` · READY · official alias `footmate-black.vercel.app`
- Production verification: exact HTTP smoke PASS · exact AI inference PASS · exact Chromium smoke PASS; served Case Study CSS에서 spacing / `NEW` / `AI 기능 추가` 반영 확인
- Documentation boundary: durable release evidence는 Release History에만 추가하고 root README·Case Study copy QA·AI docs·Closed Beta runbook은 내용 계약이 바뀌지 않아 중복 추가하지 않음. `docs/README.md`의 stale 16-section 표기만 13-section으로 정정
- Notion boundary: 공개 FootMate 프로젝트 페이지의 reviewer-facing 결과 문구만 최소 동기화하고 AI PRD/Workflow에는 동일 release 사실을 중복 추가하지 않음

## AI Gateway model availability recovery · 2026-09-24

- Root cause: Production AI inference에서 기존 기본 모델 `inclusionai/ling-3.0-flash-vl-free`가 Vercel AI Gateway `404 model_not_found`를 반환해 `/api/ai-match-assistant`가 502로 실패
- Runtime recovery PR: #242 · primary model을 `openai/gpt-5.4-mini`, bounded provider fallback을 `openai/gpt-5.4-nano`로 갱신하고 `model_not_found`도 fallback retry 조건에 포함
- Runtime boundary preserved: AI는 자연어 검색 조건만 구조화하며 경기 후보·순위·추천 이유는 deterministic recommendation engine이 계속 소유; join/payment HITL 및 `/app` Product UI 변경 없음
- Runtime Production SHA: `344296c6db7d01571493d340ab41816bd1bfcbdd`
- Exact Vercel Production: `dpl_14DvqZ2TxB9WKXdknFjsDDyHEa2T` · SHA `344296c6db7d01571493d340ab41816bd1bfcbdd` · READY · official alias `footmate-black.vercel.app`
- Runtime Production verification: exact HTTP smoke PASS · exact AI inference PASS (`openai/gpt-5.4-nano`, `fallbackUsed=true`)
- Test alignment PR: #244 · stale Production Chromium assertion의 과거 InclusionAI model 기대값만 현재 primary model로 동기화; runtime behavior 변경 없음
- Main after test-only sync: `25c135c411def8d90e8333cdf2d676f96880f7b9`; moving `main`과 runtime Production SHA가 다른 것은 #244가 test-only이기 때문
- Final post-merge QA: FootMate QA #1083 · run `35949609753` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Production Smoke PASS
- Exact Production Chromium smoke: 6/6 PASS; AI Match Assistant resilience boundary와 Production aliases 포함
- Visual Regression: UI/UX surface 변경 없음; baseline refresh 불필요. 기존 Browser E2E visual baseline gate는 PASS
- Documentation boundary: README의 provider-independent connected/fallback 설명은 그대로 정확해 변경하지 않음; Case Study와 Closed Beta runbook의 사용자/운영 계약도 변경 없음
- Notion boundary: 관련 FootMate PRD/AI Agent Workflow는 provider-independent contract와 GitHub Release History ownership을 이미 사용해 model/deployment 식별자 추가 sync 불필요
- Render backup: 이번 AI Gateway recovery closure에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment


## Case Study section label / preview title correction · 2026-09-23–24

- #225 merged at `0f25ab4c296de059ad876f48ee30c57020c32e65`: story H2 English copy and TOC subtitle wrapping.
- #226 merged at `c03a8fccd1802fc9d8c28d9d6e033687b98651bc`: English applies to section labels/kickers; story H2 restored to Korean. This supersedes #225's heading-language change.
- #228 keeps 13 sections and Korean body copy while revising the planning narrative and returning TOC subtitles to a single line.
- #243 merged at `9dc82b93ee59fd877ecada0f64b1de5ef670370c`: #1 cover label을 `Overview`로 정리하고 desktop topbar·browser title을 `FootMate · Case Study`로 통일; 13개 섹션·한국어 본문·Product/Real App runtime은 변경하지 않음.
- PR final required checks: Regression 36 PASS · Browser E2E + axe PASS · approved Case Study screenshot baseline actual comparison PASS.
- Post-merge QA: FootMate QA run `35951414230` · Regression 36 PASS · Browser E2E + axe PASS · Production Smoke PASS; exact HTTP · AI inference · Chromium smoke 모두 PASS.
- Exact verified Vercel Production: `dpl_ERrv77AntHrxkEwK9Xx866SNsaSZ` · SHA `9dc82b93ee59fd877ecada0f64b1de5ef670370c` · READY · official alias `footmate-black.vercel.app`; served Case Study asset에서 `Overview` / `FootMate · Case Study` 반영 확인.
- Documentation boundary: 이 표시명 정정의 durable evidence는 Release History가 소유한다. README의 13-section 현재 제품 설명, 서비스 기획 근거, AI/Closed Beta 문서·runbook, 관련 Notion PRD/Workflow는 내용 계약이 바뀌지 않아 동일 사실을 중복 추가하지 않음.

## Case Study 서비스 기획 서사 보강 · 2026-09-23

- Scope: 기존 13개 섹션 안에 Role / Scope / Responsibility, 문제→서비스 목표, 우선순위, Decision / Reason / Trade-off, 대안 가설, 운영 정책, 협의 기준, KPI, 회고 보강
- TOC: main/sub title 정리, 13개 부제목 한 줄 및 잘림 없음 검증
- Content boundary: Persona·대안 비교는 설계 가설; 8개 KPI는 Validation Metric이며 실제 사용자 성과·기준값·목표 달성으로 표현하지 않음
- Detailed evidence: [서비스 기획 근거](SERVICE-PLANNING-EVIDENCE.md) — 분모·관찰 기간·제외 기준·의사결정 근거
- Preserved: Product/Beta 기능, 추천·참가·운영 정책, 실제 연동과 시뮬레이션 경계
- Necessary layout adjustment: 모바일 역할 카드와 앱 미리보기 라벨 간격; 320/375/390/430px에서 겹침 방지 geometry contract
- Runtime PR: #228
- Case Study 전용 QA: run `35858360019` · 43 PASS
- Visual Regression: Ubuntu/Chromium에서 baseline 생성 후 별도 `toHaveScreenshot()` 실제 비교 PASS · `maxDiffPixels: 0`
- Automated visual scope: 1440×900 전체 13개 섹션, 1728×900 cover, 390×844 전체 13개 섹션의 viewport 비교; 320/375/390/430px 포함 wrap·overflow·spacing·TOC·키보드·axe 검증
- 검수 범위 정정: 당시 직접 이미지 검토는 일부 화면에 한정되었으며, 모든 페이지의 본문 줄바꿈과 모바일 하단까지 편집 검수한 것은 아니었다. 이 자동 검사 결과를 전체 본문 편집 검수 완료로 해석하지 않는다.
- Baseline 저장: `tests/e2e/v5.1-case-study-visual.spec.cjs-snapshots/`; 일회성 baseline workflow는 제거하고 기존 PR QA gate 유지
- 후속 Product audit (#229): 이 과거 screenshot PASS에는 Welcome 대비 결함이 포함돼 있었다. 당시 실행 사실은 보존하되 headline 가독성의 승인 근거로 사용하지 않는다. 수정 후 직접 color 검사와 새 이미지 검토·정상 비교가 필요하다.
- Final PR QA: run `35858717623` · Regression 36 PASS · Browser E2E + axe 142 PASS
- Product/runtime baseline SHA: `20f3eef4845a9787fe64dfefb88f5b6748146016`
- Post-merge QA: run `35859386720` · Regression 36 / Browser E2E + axe / Production Smoke PASS
- Exact verified Vercel Production: `dpl_eMzzjfTZTUaeESYSnHH3EyceVtUu` · SHA `20f3eef4845a9787fe64dfefb88f5b6748146016` · READY · official alias `footmate-black.vercel.app`
- Production HTTP: PASS; Case Study HTML·현재 narrative·section label 파일이 checkout SHA의 파일 내용과 정확히 일치하는 검사 추가
- Production AI inference / Chromium smoke: PASS
- Documentation: README·문서 인덱스·서비스 기획 근거 및 Notion 프로젝트/PRD 동기화; Notion의 과거 16-section·OAuth 미연동 일반화 표기는 현재 13-section과 Real App/Beta 경계로 수정
- Runbook: 운영 절차 변경 없음
- Render backup: 이번 Case Study 변경은 재검증하지 않음
- Remaining validation: 실제 사용자 조사, 전환·체크인·재탐색 기준값과 사업 성과는 별도 Beta 관찰 대상이며 이번 QA PASS로 대체하지 않음

## v5.2.0 — Real Beta Readiness · 2026-09-21

**Status:** Verified minor release · real-user Closed Beta operations ready for pilot activation.

- Scope: account recovery, signup verification resend, 경기별 취소 마감, connected self/operator check-in, operator match completion, DB-backed in-app operation notification, check-in/completion audit 확장
- Runtime PR: #159
- PR QA: FootMate QA #562 · run `35564585265` · PASS
- Regression 36: PASS · 기존 required check 이름을 유지하면서 v5.2 contract를 추가 실행
- Browser E2E + axe: PASS · account recovery / resend / cancellation policy / check-in / notification / operator Matchday 포함
- Supabase migration: `v5_2_real_beta_readiness` · version `20260921051924` · Production DB 적용 및 schema/RLS/RPC contract 확인
- Supabase connected boundary: `matches.cancel_cutoff_at`, `matches.check_in_opens_at`, `participations.checked_in_at`, `beta_notifications`, self/operator check-in, match completion, notification read, policy-aware operator save
- Security boundary: readiness RPC는 `SECURITY DEFINER` transaction entrypoint를 유지하되 `anon EXECUTE=false`, `authenticated EXECUTE=true`; operator RPC는 함수 내부에서 `auth.uid()`와 `public.operators` allowlist를 재검증
- Product/runtime baseline: `30edb2a956b9be1371021f2d28e76d2021111c6e`
- Post-merge QA: FootMate QA #563 · run `35564784647` · PASS
- Exact Vercel Production: `dpl_BgvwN2RQhZufUpGwWVamyd1mCVzB` · SHA `30edb2a956b9be1371021f2d28e76d2021111c6e` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS · v5.2 Beta Production surface 포함
- Pilot boundary: release 검증 중 실제 경기 장소·시간을 임의 생성하지 않았으며 Production DB의 future public match는 0건; 실제 Pilot 활성화는 운영자가 `/beta/operator`에서 실제 경기 정보를 입력하고 `open`으로 공개한 뒤 시작
- Integration boundary: Closed Beta는 free-only; DB-backed in-app notification과 Resend transactional email은 connected; 실제 PG·push notification delivery·external analytics는 미연동
- Remaining security hardening: Supabase Leaked Password Protection은 현재 플랜에서 Pro 이상 기능이라 unavailable; Beta release blocker로 취급하지 않고 추후 plan 전환 시 활성화 후보로 관리
- Render backup: 이번 v5.2 release에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment로 관리

### Closed Beta transactional email reliability closure · 2026-09-21

- Scope: transactional email outbox reliability, server-driven worker, atomic claim/lease, bounded retry/backoff, Resend final-delivery webhook, operator email health/7-day funnel observability, check-in RPC blocker fix
- Connection PRs: #164 · #165
- Reliability runtime PR: #167 · PR QA FootMate QA #584 · run `35599581594` · PASS
- Post-merge QA: FootMate QA #585 · run `35600051421` · PASS
- Regression 36 / Browser E2E + axe / Production Smoke: PASS
- Reliability DB migrations: `beta_email_reliability` · `beta_email_worker_schedule`
- Production worker: `pg_cron + pg_net + Supabase Vault` 1-minute schedule; outbox는 atomic claim/lease, stale-claim recovery, max 5 attempts와 bounded retry/backoff를 사용
- Edge Functions: `process-beta-email-outbox`, `resend-beta-email-webhook`, updated `send-beta-notification-email` ACTIVE
- Delivery state: `email_status`와 `email_delivery_status`를 분리하고 Resend signed webhook으로 `sent / delivered / delivery_delayed / bounced / complained / suppressed / failed` 상태를 DB에 반영
- Privacy boundary: webhook raw payload와 recipient email은 delivery observability DB에 저장하지 않음
- Operator observability: `/beta/operator`에서 최근 email health, retry eligibility, 7-day join/check-in/delivery/failure KPI 제공
- Production E2E: join, user cancel, operator cancel, check-in transactional email이 실제 Resend `delivered`; webhook endpoint HTTP 200 / `matched:true`
- Server-worker independence: browser dispatch 없이 생성된 outbox를 Cron이 `processed:1 / sent:1 / failed:0`으로 처리하고 `delivered`까지 반영한 경로 PASS
- Check-in blocker closure: PR #168 · PR QA FootMate QA #586 · run `35603949442` · PASS; Production migration `operator_check_in_ambiguity_fix` version `20260921131551` 적용
- Check-in post-merge QA: FootMate QA #587 · run `35604424675` · PASS
- Exact Vercel Production: `dpl_Cfp28eB41XA7FCuM1ipjSx47FCnG` · SHA `3a2b560a29d4ce6248551225e8df221a9ff2f80b` · READY
- Production QA fixture cleanup: `[QA] Transactional Email Test`는 정상 `operator_cancel_match` 경로로 canceled, `joined_count=0 / remaining_spots=8`; cleanup email도 Cron worker에서 `processed:1 / sent:1 / failed:0` 후 `delivered`
- Current product/runtime baseline: `3a2b560a29d4ce6248551225e8df221a9ff2f80b`
- Render backup: 이번 reliability closure에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment로 관리

### Closed Beta free-tier feature closure · 2026-09-22

- Scope: Realtime 갱신, 24h/2h 경기 reminder, position-aware waitlist/FIFO 자동 승급, 실제 Beta 경기 기반 AI 조건 해석 + deterministic ranking, Google/Kakao provider-aware OAuth UI, 경기 후 feedback/attendance history, Operator TOTP MFA, browser Web Push, Supabase Storage media
- Growth runtime PR: #170 · Realtime / reminder / waitlist / actual Beta match recommendation / feedback·attendance
- Auth/security runtime PR: #171 · Google/Kakao provider-aware OAuth UI / Operator TOTP MFA; MFA migration hardening #172 · newline patch fix #173
- Push/media runtime PR: #174 · Web Push subscription/service worker/server outbox + `beta-media` profile/match image upload
- Production smoke alignment: #175 · current MFA/push/media loading structure를 exact Production smoke에 반영
- Final product-boundary sync: #176 · README와 user/operator runtime copy를 connected Web Push/media 상태에 동기화
- Production migrations: `beta_free_growth`, `beta_operator_mfa`, `beta_push_media`, `beta_push_worker_schedule` 적용
- Realtime boundary: database change는 refresh signal로 사용하고 authoritative match/capacity/participation/notification/waitlist/feedback row는 REST에서 다시 읽음
- Waitlist boundary: 포지션별 FIFO + 취소 transaction 내부 자동 승급; 기존 capacity transaction ownership을 유지
- Recommendation boundary: AI는 실제 Beta 경기 검색 조건만 해석하고 후보·순위·추천 이유는 deterministic ranking이 소유; 실제 데이터가 없는 조건은 생성하지 않음
- Operator security: allowlist + TOTP MFA; operator-only RLS와 SECURITY DEFINER RPC는 Production DB에서 `aal2`를 요구
- Web Push: `process-beta-push-outbox` ACTIVE, Vault 기반 VAPID private material, `footmate-beta-push-outbox` 1-minute Cron active; stale subscription 제거와 bounded retry/backoff 적용
- Push delivery boundary: DB `push_status=sent`는 push service acceptance를 의미하며 OS/browser device-level 표시 receipt는 아님; 실제 표시 여부는 사용자 권한과 기기에 의존
- Media: Supabase Storage `beta-media` public-read, 5MB JPG/PNG/WebP; profile avatar는 own-folder RLS, match/venue image write는 operator `aal2` RLS
- Outbox health at closure: email/push `pending / processing / failed` 0
- PR #176 QA: FootMate QA #615 · run `35677537682` · Regression 36 PASS · Browser E2E + axe PASS
- Post-merge QA: FootMate QA #616 · run `35677789340` · Regression 36 PASS · Browser E2E + axe PASS · Production Smoke PASS
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Product/runtime baseline: `afb404e94b9b606bc12518e63e8b44b3feb15141`
- Exact Vercel Production: `dpl_EX4295ceYpG56WUUYAiQtUSRWYfP` · SHA `afb404e94b9b606bc12518e63e8b44b3feb15141` · READY
- Manual Production QA follow-up (2026-09-22): Google/Kakao provider credential/config 활성화 후 두 provider 실제 로그인 PASS; Web Push는 실제 사용자 기기에서 권한 승인 → subscription → server worker → 브라우저/OS 알림 표시 PASS. 서버 `push_status=sent`와 device-level 표시 결과는 구분해 기록
- Remaining free-plan boundary: Supabase Leaked Password Protection은 현재 플랜에서 Pro 이상 기능이라 unavailable; 실제 PG와 external analytics는 이번 free-only Beta scope 밖
- Render backup: 이번 free-tier feature closure에서는 재검증·재배포하지 않음; Vercel이 공식 Production이고 Render는 backup/alternate deployment

### Beta push/cancel hotfix closure · 2026-09-22

- Runtime hotfix PR: #178 · authenticated/service-role `beta_push_subscriptions` DML grant 복구 + `operator_cancel_match()`의 `beta_waitlist.match_id` qualification으로 PL/pgSQL ambiguity 제거
- Security preservation: 기존 operator TOTP MFA / AAL2 enforcement 유지
- PR QA: FootMate QA #619 · run `35684861486` · PASS
- Post-merge QA: FootMate QA #620 · run `35685145234` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Production Smoke: PASS · exact Production HTTP / AI inference / Chromium smoke 모두 PASS
- Runtime hotfix merge SHA: `24b78952c35acaa670cdeb6300125727ab394a4e`
- 이후 #179 polish runtime이 이 hotfix 위에서 진행되어 현재 product/runtime baseline은 아래 Operator MFA QR closure의 `fc94c375a4e0ebc2cf428df1f5a450a8ad630e97`로 대체됨

### Operator MFA QR / Beta UX polish closure · 2026-09-22

- Scope: Supabase TOTP raw SVG QR normalization, 수동 설정 키 fallback, operator 경기 정책 기본값·picker bounds, 모바일 44px action target, helper text와 focus-visible polish
- Runtime PR: #179
- Runtime PR QA: FootMate QA #639 · run `35689461649` · PASS
- Runtime post-merge QA: FootMate QA #640 · run `35689816248` · PASS
- Product/runtime baseline: `fc94c375a4e0ebc2cf428df1f5a450a8ad630e97`
- Runtime preservation: 기존 AAL2 enforcement, MFA flow, match/participation/email/push/media behavior, IA/routes/screen count 유지; DB migration 없음
- Docs / Case Study sync: PR #180 · connected Beta capability, provider/manual QA boundary, README, Closed Beta pilot runbook을 현재 제품 상태에 동기화하면서 Case Study 16-section IA / TOC / routes / headings 유지
- Docs PR QA: FootMate QA #642 · run `35690365954` · PASS
- Docs post-merge QA: FootMate QA #643 · run `35690669684` · PASS
- Docs / Production closure SHA: `73b5192983e9728379fa68f85a89b3a65de3f2aa` · #180 docs-only sync on top of runtime baseline; 이후 docs-only history update로 moving `main`이 바뀌어도 이 verified Production SHA는 별도로 유지
- Exact Vercel Production: `dpl_GdJUrxmqmCyskwMWNeA1aPyFZ76S` · SHA `73b5192983e9728379fa68f85a89b3a65de3f2aa` · READY
- Exact Production HTTP smoke: `/` 200 · `/beta/operator` 200 · PASS
- Exact Production QR path: served `/src/v5/beta-operator-mfa.js`에서 raw `<svg>` TOTP 응답을 `data:image/svg+xml`로 normalize하며 QR 미사용 시 수동 TOTP 설정 키 fallback을 유지
- Render backup: 이번 closure에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment

### Impact-aware CI closure · 2026-09-22

- CI optimization PR: #183 · shared `Change Impact` job으로 runtime/non-runtime 영향을 먼저 판정
- Docs/workflow-only path: `Docs-only QA`에서 `git diff --check` + documentation-facing connected-platform contract를 실행하고 Regression 36 / Browser E2E + axe / Production Smoke는 skip
- Runtime path: 기존 Regression 36 / Browser E2E + axe / main Production Smoke 범위를 유지
- PR QA: FootMate QA #648 · `Change Impact` + `Docs-only QA` PASS, heavy runtime jobs intentionally skipped
- Post-merge main QA: FootMate QA #649 · run `35695125666` · SUCCESS; docs-only path가 실제 main push에서도 동작함
- CI closure main SHA: `f11a36399cb2752e5b88f7790010694ce0faa774`
- Runtime/deployment boundary: workflow-only 변경이므로 product/runtime baseline과 exact verified Vercel Production 사실은 변경하지 않음

### Final Beta sync-up closure · 2026-09-22

- Final sync PR: #184 · README / Release History / Case Study / Closed Beta runbook / connected-platform contract와 관련 Notion 상태를 오늘 최종 runtime·수동 QA 사실에 맞게 동기화
- Manual Production QA closure: Google/Kakao 실제 provider credential/config 활성화 후 두 provider 실로그인 PASS; 실제 사용자 기기에서 Web Push 권한 승인 → subscription → server worker → 브라우저/OS 알림 표시 PASS
- PR QA: FootMate QA #652 · run `35697093780` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS
- Merge / current closure SHA: `ac474f32c5324368250e3a8fc9db57973a087686`
- Post-merge main QA: FootMate QA #653 · run `35697469512` · SUCCESS
- Main QA details: Regression 36 PASS · Browser E2E + axe PASS · Production Smoke PASS
- Exact Production smoke: HTTP PASS · AI inference PASS · Chromium PASS
- Exact Vercel Production: `dpl_7RiCmWaCMVYoe5ZyVKfHgFverjrD` · SHA `ac474f32c5324368250e3a8fc9db57973a087686` · READY · production alias `footmate-black.vercel.app` 반영 확인
- Product/runtime boundary: Case Study narrative/runtime copy는 #184에서 최신 수동 QA 사실로 동기화됐고, `/app`·`/beta` 제품 로직 자체는 #179 이후 변경하지 않음
- Render backup: 이번 최종 sync-up에서는 재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment
- Final sync rule: `최종 runtime/수동 QA 확정 → README → Release History → Case Study → Runbook(절차 변경 시) → Notion 관련 페이지 → 서로 상충하는 pending/미검증 문구 검색 → QA/merge`

### Real App visual polish closure · 2026-09-22

- Scope: Real App `/app`의 screen/state visual polish audit · 390px mobile + 1440px desktop에서 viewport당 21개 대표 상태, 총 42개 rendered state 확인
- Audit coverage: onboarding, home/AI, discovery/filter/empty, detail/compare, auth, checkout/pending/failure/success, schedule/matchday/postgame, profile
- Layout result: 두 audit viewport 모두 horizontal overflow 0
- Confirmed fixes: setup primary CTA를 full-width + screen bottom hierarchy로 정리; checkout primary CTA full-width; checkout failure에서 중복 원본 submit CTA를 숨기고 명시적 `다시 결제하기` recovery action만 유지
- Runtime PR: #186
- PR QA: FootMate QA #661 · run `35704803515` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS
- Post-merge main QA: FootMate QA #662 · run `35705251608` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Production Smoke PASS
- Exact Production smoke: HTTP PASS · AI inference PASS · Chromium PASS
- Product/runtime baseline: `f663b40adf270546557717c8eab6a47b32c79d05`
- Exact Vercel Production: `dpl_B4Z821xPGAR487Zh3tMEnBHLcz2p` · SHA `f663b40adf270546557717c8eab6a47b32c79d05` · READY
- Regression ownership: temporary visual capture spec/workflow는 audit 후 제거했고 `tests/e2e/v5.1-product-integrity.spec.cjs`에 setup/checkout primary-action hierarchy 검증을 permanent regression으로 유지
- Preservation: IA, copy, routes, feature behavior, sample data, internal release identifier 변경 없음; Case Study 16-section IA와 Closed Beta 운영 절차도 변경 없음
- Render backup: 이번 patch에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment

### Real App design-system / visual regression closure · 2026-09-22

- Design-system baseline PR: #188 · Real App UX/design-system baseline을 보강하면서 IA, copy, routes, feature behavior, sample data, internal release identifier는 유지
- Visual regression PR: #190 · Playwright screenshot baseline gate를 기존 `Browser E2E + axe`에 통합
- Interaction consistency runtime PR: #189 · secondary/navigation/discovery/decision/AI controls의 hover/pressed feedback을 정규화하고 visual baseline capture의 accidental hover 영향을 안정화; IA/copy/routes/feature behavior는 유지
- Current product/runtime baseline: `f1c2d19d418e6cbe93cc2fa70209895ed391bd9e`
- Baseline coverage: 320px context actions + 390px AI card · GitHub Actions와 동일한 Ubuntu / Chromium 환경에서 기준 이미지 생성
- Comparison contract: `toHaveScreenshot()` + `maxDiffPixels: 0`; baseline 생성만으로 완료 처리하지 않고 실제 rendered screenshot comparison PASS를 검증 기준으로 사용
- Visual regression introduction QA: PR #190 · FootMate QA #677 · run `35714250012` · Regression 36 PASS · Browser E2E + axe + visual baseline PASS
- Visual regression introduction Production verification: FootMate QA #679 · run `35714746096` · Regression 36 PASS · Browser E2E + axe + visual baseline PASS · Production Smoke PASS · exact verified Vercel Production SHA `0964f6f96366a6baee405e83a7d7b7300b8c9a90`
- Interaction consistency PR QA: PR #189 · FootMate QA #682 · run `35715996386` · SUCCESS
- Current runtime post-merge QA: FootMate QA #684 · run `35716339959` · Regression 36 PASS · Browser E2E + axe + visual baseline PASS · Production Smoke PASS
- Current exact Production verification: HTTP PASS · AI inference PASS · Chromium PASS · exact verified Vercel Production SHA `f1c2d19d418e6cbe93cc2fa70209895ed391bd9e`
- Render backup: 이번 visual regression / interaction QA closure에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment
- Documentation / Case Study sync PR: #191 · README, Release History, Case Study Validation과 관련 Notion QA 문서를 visual regression gate 사실에 맞춰 동기화
- Documentation / Case Study sync merge SHA: `8189fdf8f07aea9c8d97fd9f15af19b70883cd70` · PR QA #688 / run `35717133196` · Regression 36 PASS · Browser E2E + axe + visual baseline PASS
- Exact Vercel Production for the Case Study sync: deployment `dpl_FgQUCuBhhMtNDgLRrwK1SLT3Yz6F` · SHA `8189fdf8f07aea9c8d97fd9f15af19b70883cd70` · READY · Production alias 반영 확인 · `/` 및 `/app` HTTP 200 · Production `case-study-connected.js`의 visual regression 문구 반영 확인
- Product app runtime behavior는 #191에서 변경하지 않았으므로 full exact Production AI inference / Chromium smoke 기준은 #684의 `f1c2d19d418e6cbe93cc2fa70209895ed391bd9e` 검증을 유지; #191에는 해당 두 smoke를 재실행했다고 기록하지 않음

### Real App UI/UX completion · desktop visual baseline closure · 2026-09-22

- State hierarchy runtime PR: #193 · Discovery zero-result, AI loading/fallback/empty, participation pending/failure/canceled의 시각 hierarchy를 정리하면서 기존 state behavior·IA·copy·routes를 유지
- Decision-flow desktop/mobile polish PR: #194 · 1440px 제품 canvas와 Detail/Checkout desktop 2-column hierarchy, floating/sticky CTA, Success width/CTA 정렬, 430px 이하 recovery CTA stack을 보강
- Desktop visual baseline PR: #196 · Home/Discover 1440px 2-column density, high-frequency micro label 11px 정규화, 1440px Detail/Checkout/Success exact screenshot baseline을 추가
- Exact Real App screenshot coverage: 320px context actions · 390px AI card · 1440px Detail · 1440px Checkout · 1440px Success
- Comparison contract: GitHub Actions Ubuntu/Chromium에서 `toHaveScreenshot()` + `maxDiffPixels: 0`; 신규 desktop baseline은 CI actual을 검토한 뒤 expected로 승인하고 동일 환경에서 실제 0-diff comparison PASS 확인
- Desktop geometry contract: 1440px Home/Discover 2-column density, card width, horizontal overflow 검증; desktop decision flow는 960px product canvas 기준
- Mobile preservation: responsive 320/375/390/430px, recovery CTA stacking, 390px decision micro-label readability regression 유지
- PR #196 QA: FootMate QA #727 · run `35733324000` · Regression 36 PASS · Browser E2E + axe + Product/Case Study visual baseline PASS
- Post-merge main QA: FootMate QA #728 · run `35733829361` · SUCCESS · Regression 36 PASS · Browser E2E + axe + visual baseline PASS · Production Smoke PASS
- Exact Production smoke: HTTP PASS · AI inference PASS · Chromium PASS
- Current product/runtime baseline: `3cd79312244dbdfbcdcea08540f68cea5e7ae375`
- Exact Vercel Production: `dpl_Ghe1PXNtPUXm7PWVPKxekPfXTaJS` · SHA `3cd79312244dbdfbcdcea08540f68cea5e7ae375` · READY · production aliases 반영 · alias error 없음
- Case Study visual regression은 별도 approved baseline gate를 유지하며 이번 Real App baseline 확장과 함께 main Browser E2E gate에서 PASS
- Preservation: Matching/recommendation ownership, auth/payment state behavior, sample data, 16-section Case Study IA, internal release identifier 변경 없음
- Documentation sync: README / Release History / Case Study Validation과 관련 Notion FootMate 문서를 current visual QA 사실에 맞춰 후속 sync; Closed Beta 운영 절차는 변경되지 않아 `docs/BETA-PILOT-RUNBOOK.md`는 수정하지 않음
- Render backup: 이번 final UI/UX closure에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment

### Real App release-flow / Design System v2 correction closure · 2026-09-23

- Scope: Product Flow review에서 확인된 8개 QA 항목과 Design System v2 coherence를 정리하면서, 요청되지 않았던 1040px desktop 확장과 2-column composition을 제거하고 Real App의 stable max 560px shell을 복구
- Display terminology: setup UI는 `공격수` / `초급` / `고급`을 표시하고 canonical compatibility 값은 내부에 유지
- Auth / continuity: active Auth v3는 Google/Kakao만 노출하고 Naver/Apple은 제거; 실제 previous-route back, readable team-message simulation boundary, checked-in → postgame → next-match continuation을 release-flow contract로 유지
- Entry / recovery: fresh external `/app` entry는 첫 화면에서 시작하고, active same-tab reload recovery는 explicit `?resume=1` 경계로 유지
- Visual correction: intro dark topbar를 복구해 unintended white band를 제거하고, 1440px desktop에서 Home/Discover/Detail/Checkout/Auth/Schedule/Profile을 stable narrow 1-column composition으로 유지
- Runtime PR: #218
- PR QA: FootMate QA #925 · run `35840288562` · Change Impact PASS · Regression 36 PASS · Browser E2E + axe PASS · changed Product / affected Case Study Visual Regression PASS
- Product/runtime baseline: `6765a6a884806c44b597d0e9ff5b22025a12096e`
- Post-merge main QA: FootMate QA #926 · run `35843020245` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Visual Regression PASS · Production Smoke PASS
- Exact Vercel Production: `dpl_5p3zBDpTfJaHF5Fe9eK4EpkiFZSR` · SHA `6765a6a884806c44b597d0e9ff5b22025a12096e` · READY · production aliases 반영
- Exact Production verification: `/app` HTTP 200 · served desktop contract에서 max 560px shell과 intro dark topbar 반영 확인 · Production Smoke PASS
- Case Study boundary: current 13-section IA / narrative를 유지하고 affected Case Study screenshot baseline comparison PASS; 이번 correction에서 별도 Case Study copy 재작성은 필요하지 않음
- Documentation sync: README와 Design System v2 QA/changelog는 stable max 560px shell과 current release-flow contract로 동기화; 관련 Notion FootMate 문서의 stale 2-column / Naver·Apple 표현도 current contract로 정리
- Runbook boundary: Closed Beta 운영 절차 변경이 없어 `docs/BETA-PILOT-RUNBOOK.md`는 수정하지 않음
- Render backup: 이번 Real App correction에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment

## v5.1.1 — AI Match Assistant Resilience Patch · 2026-09-20

**Status:** Verified patch release · release-readiness surface freeze complete.

- Scope: AI primary provider 안정화, bounded server/browser timeout, provider/rules fallback recovery, reload state consistency, request/cost guard, 제품 사실 문구 정정, release-facing surface 정리
- User-facing release surface: 제품명·Case Study·README는 버전 독립적인 현재 제품 설명을 사용하고 내부 release/QA/deployment 식별자는 `v5.1.1`로 유지
- AI Agent Workflow: `Context → Plan → Tools → Guardrail → Observe`
- Ranking boundary: AI는 자연어 검색 조건만 해석하며 실제 경기 후보·순위·추천 이유는 기존 deterministic recommendation engine이 소유
- Primary AI model: `inclusionai/ling-3.0-flash-vl-free`
- Provider fallback model: `inclusionai/ling-3.0-flash-fin-free`
- Reasoning boundary: constraint extraction은 `reasoning.effort = none`
- Timeout boundary: provider request 3s / browser request 7s / Vercel Function maxDuration 10s
- Request guard: same-origin, Fetch Metadata, JSON content-type, 16KB body limit, instance-local per-IP/global rate window
- Persistence: 기존 `footmate:v5.1:ai` key 유지; reload 후 UI mode와 `window.__FOOTMATE_AI__.mode` 복원
- HITL: join/payment 자동 실행 없음
- Data boundary: `/app` 경기·가격·잔여 자리·주소·참가자 구성은 sample records 기준이며 AI가 생성하지 않음; `/beta`는 별도 Supabase connected 경로
- Hotfix implementation PRs: #123 · #124
- Version sync PR: #125
- Release-readiness surface cleanup PR: #128 · PR QA #448 · run `35510271305` · PASS
- Product/runtime baseline at surface freeze: `ed6b084719738a70bdc93f3bcca78f5f1ecf1e48`
- Post-merge QA: FootMate QA #449 · run `35510438544` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Exact Vercel Production at surface freeze: `dpl_F9SKqKt2his5v7K1PogXH2HSwMzz` · SHA `ed6b084719738a70bdc93f3bcca78f5f1ecf1e48` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS · `inclusionai/ling-3.0-flash-vl-free` · `fallbackUsed=false`
- Exact Production Chromium smoke: PASS · 2/2
- Render backup at surface freeze: `dep-dant04ss728c73b4g6t0` · SHA `ed6b084719738a70bdc93f3bcca78f5f1ecf1e48` · LIVE at verification time

### Closed Beta release-readiness closure · 2026-09-20

- Scope: Supabase backend foundation, position-aware capacity, RLS/security hardening, connected user Beta, allowlisted operator match/participant operations
- Backend foundation / capacity / security PRs: #130 · #131 · #132
- Connected user runtime: PR #133
- Production Chromium smoke selector fix: PR #134
- Operator blocker closure: PR #135 · PR QA #471 · run `35543950160` · PASS
- Product/runtime baseline at blocker closure: `b84b571c4d62070109089cf515fa9eb63f338f53`
- Post-merge QA: FootMate QA #472 · run `35544089076` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Supabase: `beta_operator_console` migration applied; Auth/profile/match/position capacity/participation/user join-cancel/operator match-participant operations connected
- Security boundary: RLS + authenticated RPC; operator RPC는 추가로 `public.operators` allowlist를 검증하며 browser service-role credentials 없음
- Operator provisioning boundary: normal Beta account를 만든 뒤 `public.operators`에 명시적으로 allowlist; self-service admin bootstrap 없음
- Exact Vercel Production at blocker closure: `dpl_AA4AbahVZK65imQ1Tb12TMFBs6Zm` · SHA `b84b571c4d62070109089cf515fa9eb63f338f53` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Render backup at blocker closure: `dep-dao6hvbtqb8s73b3ms7g` · SHA `b84b571c4d62070109089cf515fa9eb63f338f53` · LIVE at verification time
- Integration boundary: Closed Beta participation은 free-only; 실제 PG·notification delivery·external analytics는 미연동

### Closed Beta Must hardening · 2026-09-21

- Scope: network timeout/offline recovery, real DB cancellation hotfix, operation audit trail, freshness recovery, 8-character signup minimum, authenticated account deletion, audit FK indexing, Case Study/product fact sync preparation, Case Study keyboard/Korean wrapping hardening
- Must runtime PRs: #141 · #142 · #144 · #146
- Must hardening runtime baseline: `fc45f2a00a463a0275fcbff4c2b7994ed743f497`
- Post-merge QA at Must closure: FootMate QA #520 · run `35549728962` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Case Study wrap/layout audit: 1440 / 1180 / 900 / 430 / 390 / 375 / 320px × 16 sections PASS
- Exact Vercel Production at Must closure: `dpl_HFZz3uYcfWzXh6ZZXxpB3573fwNa` · SHA `fc45f2a00a463a0275fcbff4c2b7994ed743f497` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Supabase migration: `beta_operation_audit_indexes` applied; audit foreign-key coverage warnings cleared
- Supabase Edge Function: `delete-account` ACTIVE with JWT verification enabled; browser에 privileged Auth key를 노출하지 않음
- Privacy boundary: Beta UI는 저장 데이터 범위를 명시하고, 계정 삭제는 사용자의 명시적 확인 뒤 server-side Auth deletion으로 처리하며 성공 시 local session을 제거
- Observability boundary: `beta_operation_events`는 event type / actor·subject UUID / match·participation UUID / position / time 중심의 최소 audit를 저장하고 email/name을 payload에 저장하지 않음
- Security advisor remaining warnings: authenticated SECURITY DEFINER RPC 5개는 의도된 user/operator transaction entrypoint이며 각 함수 내부 auth/operator 검증을 유지; leaked-password protection은 현재 Supabase 프로젝트에서 비활성
- Automated responsive coverage: 320 / 375 / 390 / 430px PASS
- Manual gates: 2026-09-21 사용자 수동 검증 기준 실제 iPhone / Android 물리기기 QA, 수동 접근성 QA, disposable 실제 Beta 계정 UI E2E 모두 PASS; 추적 issue #147 closed. 자동 QA 결과와 사용자 수동 검증 결과는 구분해 기록함
- Integration boundary: `/app`는 sample/mock 경계를 유지하고 `/beta`는 Supabase connected; 실제 PG·notification delivery·external analytics는 미연동

### Architecture / QA ownership cleanup · 2026-09-21

- Storage ownership cleanup: PR #150에서 v5 bootstrap의 direct `localStorage` / `footmate:v4:*` read를 제거하고 기존 platform session/repositories를 통해 읽도록 통일
- Historical QA parity cleanup: PR #151에서 current gate와 release marker가 맞지 않는 v4.5~v5.0 versioned E2E 18개 + standalone Production smoke 6개를 제거하고 auth→checkout continuity, Case Study accessibility coverage를 current gate에 이관
- Accessibility fix: current Case Study axe gate가 P15 Validation의 `scrollable-region-focusable` serious 위반을 검출했고 active `.fm-next-story`를 keyboard-focusable하게 수정; 동일 axe rule로 재검증 PASS
- Current product/runtime baseline: `1ad98c2cd69f002443d75d92e2d8ef1889ce11e1`
- Post-merge QA: FootMate QA #529 · run `35554278219` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Current Case Study accessibility: 16 sections × 390 / 1440px axe serious/critical 0, console/pageerror 0 · PASS
- Exact Vercel Production: `dpl_FqPyi5b6nYfmmZrtYTJi2SGRrGzr` · SHA `1ad98c2cd69f002443d75d92e2d8ef1889ce11e1` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Render backup: #150/#151 범위에서는 재검증하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment로 관리

### Version-neutral storage migration · 2026-09-21

- Scope: `/app` browser persistence namespace를 제품 release marker와 분리하고 기존 사용자 상태와 rollback compatibility를 보존
- Runtime PR: #153 · PR QA #537 · run `35557100418` · PASS
- Canonical keys: `footmate:session`, `footmate:discovery`, `footmate:decision`, `footmate:participation`, `footmate:matchday`, `footmate:return`, `footmate:personalization`, `footmate:events`, `footmate:interaction`
- Legacy compatibility: 기존 `footmate:v4:*` 9개 key를 alias/mirror로 유지하며 삭제하지 않음
- Migration behavior: legacy-only state는 canonical key로 승격; canonical/legacy가 다르면 canonical을 우선해 legacy mirror를 reconciliation; 이후 write/remove는 canonical과 legacy에 동기화
- Compatibility bridge: browser compatibility bridge는 canonical/legacy interop·rollback safeguard로 infrastructure에 유지하되 current feature runtime은 direct `localStorage`를 사용하지 않음
- Product behavior boundary: route / IA / copy / session schema v2 / discovery·decision·participation·matchday·return·personalization state shape 변경 없음
- Current product/runtime baseline: `8c60c35b508366c49693326fffd7ab998f88c14a`
- Post-merge QA: FootMate QA #538 · run `35557352406` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Legacy-only browser state → canonical promotion: PASS
- Canonical/legacy rollback mirror parity and divergent-state reconciliation: PASS
- Exact Vercel Production: `dpl_GRR1WmD1Mp53u26VBRrTVZEfze2g` · SHA `8c60c35b508366c49693326fffd7ab998f88c14a` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Render backup: 이번 migration 범위에서는 재검증하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment로 관리
- Follow-up closure: PR #155 · #156 · #157에서 direct module `localStorage` ownership을 platform session/repositories로 전환했으며 상세 검증은 아래 Repository storage ownership closure에 기록

### Repository storage ownership closure · 2026-09-21

- Scope: `/app` feature runtime의 browser persistence read/write ownership을 `footmatePlatform.session`과 `footmatePlatform.repositories.*`로 통일
- Runtime PRs: #155 · #156 · #157
- Module coverage: root `app.js`, discovery, decision, participation, matchday, return, personalization, interaction
- Ownership boundary: feature runtime 8개 모듈은 direct `localStorage`와 `footmate:v4:*` key ownership을 갖지 않으며 `tests/contracts/v5.1-connected-platform.contract.mjs`가 이를 Regression gate에서 강제
- Infrastructure boundary: `src/v4/platform/infrastructure/storage.js`가 canonical `footmate:*` provider, legacy promotion/reconciliation, rollback mirror와 browser compatibility bridge를 단독 소유
- Legacy compatibility: 기존 `footmate:v4:*` 9개 alias/mirror는 기존 사용자 상태 및 rollback 보호를 위해 유지; 이번 closure에서 삭제하지 않음
- Product behavior boundary: route / IA / copy / session schema v2 / recommendation·discovery·decision·participation·matchday·return·personalization behavior 변경 없음
- Final PR QA: PR #157 · FootMate QA #545 · run `35560477667` · PASS
- Final product/runtime baseline: `bce1f9c507f4777f83c09c2015ff3940e7f26bd7`
- Post-merge QA: FootMate QA #546 · run `35560904642` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Exact Vercel Production: `dpl_GiL7Pa9YT2fEK9e1BSGFGm5Qu4n4` · SHA `bce1f9c507f4777f83c09c2015ff3940e7f26bd7` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Render backup: 이번 ownership closure 범위에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment로 관리
- Next candidate: compatibility bridge / legacy mirror 제거는 기존 사용자 migration·rollback 필요성을 별도 검증한 뒤 별도 변경으로 판단

## v5.1.0 — AI Match Assistant · 2026-09-20

**Status:** Verified AI feature release.

- Scope: 자연어 경기 탐색, Vercel AI Gateway inference, structured constraint extraction, provider fallback, browser rules fallback, HITL join/payment boundary
- AI Agent Workflow: `Context → Plan → Tools → Guardrail → Observe`
- Ranking boundary: AI는 검색 조건만 해석하며 실제 경기 후보·순위·추천 이유는 기존 deterministic recommendation engine이 소유
- Primary AI model: `openai/gpt-5.4-mini`
- Provider fallback model: `inclusionai/ling-3.0-flash-vl-free`
- Authentication: configured AI Gateway credential 또는 Vercel deployment OIDC
- Compatibility boundary: v5.0 recommendation / participation / matchday / return domain ownership, browser persistence, v4.9 compatibility runtime 유지
- HITL: join/payment 자동 실행 없음
- Data boundary: 경기·가격·잔여 자리·주소·참가자 구성은 current runtime sample records 기준; AI가 생성하지 않음
- Feature PR: #118
- Production fixes: #119 · #120 · #121
- Product/runtime baseline: `7d0ee9307ba952e386c97b14c185fa24ebb38ed1`
- Post-merge QA: FootMate QA #435 · run `35504620675` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Exact Vercel Production: `dpl_4FChZeQLWWgPdcUBdG6uSZVExQrV` · SHA `7d0ee9307ba952e386c97b14c185fa24ebb38ed1` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danr55p7lnhs73edu80g` · SHA `7d0ee9307ba952e386c97b14c185fa24ebb38ed1` · LIVE at verification time

## v5.0.0 — Connected Matchday Platform · 2026-09-20

**Status:** Verified major architecture release.

- Scope: recommendation / participation / matchday / return domain separation, injectable provider registry, provider connection disclosure, cross-domain state consistency guardrail, v5 Case Study/QA/Production gates
- Journey contract: `Find → Decide → Join → Play → Return`
- Compatibility boundary: v4.9 product UX, session schema v2, local persistence/event contract, recovery and accessibility behavior retained
- Domain boundary: recommendation / participation / matchday / return ownership and normalization are explicit
- Consistency guardrail: selected match → participation success → matchday check-in → Return의 match identity/state 순서 검증
- Provider boundary: auth/payment/capacity/notification은 injectable registry로 분리되었으나 current Production mode는 `mock-only`; connected providers 없음
- Integration boundary: 실제 OAuth·회원 DB·PG·realtime capacity/participant backend·notification delivery·external AI inference·external analytics 미연동
- Performance measurement: app HTML `2,422B` · CSS `56,112B` · JS `144,952B` · first-party CSS/JS requests `21` · frozen budget PASS
- Accessibility / responsive: full decision flow serious/critical axe violations 0, 320/375/390/430 coverage and existing recovery regression PASS
- Case Study: 16-section IA 유지; Domain Architecture / Provider Registry / v5 Validation / Production Boundary evidence로 v5 구현과 한계를 동기화
- Feature PR: #115
- Final PR QA: FootMate QA #411 · run `35497512505` · PASS
- Product/runtime baseline: `031873c2d6e83a0b531ee1503bd6845aa95b7618`
- Post-merge QA: FootMate QA #412 · run `35497619885` · PASS
- Exact Vercel Production: `dpl_EhsahEM5UAD85BbytAjiWcge3enU` · SHA `031873c2d6e83a0b531ee1503bd6845aa95b7618` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danot26q1p3s73ckn19g` · SHA `031873c2d6e83a0b531ee1503bd6845aa95b7618` · LIVE at verification time

## v4.9.0 — v5 Release Candidate · 2026-09-20

**Status:** Verified release candidate.

- Scope: final IA, semantic design-system contract, performance budget, full-flow accessibility, stable event naming, auth/payment/capacity/notification provider mocks, session migration/rollback rehearsal, v5 Case Study narrative
- Frozen IA: `welcome → setup → home → discover → detail → auth → checkout → success → schedule → profile`
- Design-system boundary: 기존 v4 visual token을 semantic alias로 묶고 44px control baseline과 reduced-motion 기준을 공통 contract로 고정
- Observability boundary: recommendation.selected / join.started / join.completed / checkin.completed / postgame.submitted event names와 schema를 유지하며 delivery는 `local-only`; external analytics 미연동
- Provider boundary: auth/payment/capacity/notification은 deterministic mock이며 `external: false`; 실제 OAuth·회원 DB·PG·realtime capacity·notification backend 미연동
- Migration boundary: session schema v2 유지; migration 전 checkpoint와 원본 rollback rehearsal을 deterministic contract로 검증
- Performance budget: app HTML ≤ 16KB · first-party CSS ≤ 180KB · JS ≤ 320KB · first-party CSS/JS requests ≤ 24
- Verified performance measurement: app HTML `2,337B` · CSS `56,044B` · JS `142,101B` · first-party CSS/JS requests `20`
- Accessibility: welcome → setup → home → detail → auth → checkout full-flow serious/critical axe violations 0; 320/375/390/430 responsive coverage
- Feature PR: #113
- Final PR QA: FootMate QA #405 · run `35495751133` · PASS
- Product/runtime baseline: `702ed926f47749802e323a67c92e2552ceadd271`
- Post-merge QA: FootMate QA #406 · run `35495900622` · PASS
- Exact Vercel Production: `dpl_Ar2C7xD2NopX1YN85RpXaQN4ShG6` · SHA `702ed926f47749802e323a67c92e2552ceadd271` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danob1navr4c73ajij90` · SHA `702ed926f47749802e323a67c92e2552ceadd271` · LIVE at verification time

## v4.8.0 — Platform Architecture · 2026-09-20

**Status:** Verified staged architecture release.

- Scope: domain → application → infrastructure → presentation bridge 경계, session schema migration, browser/memory storage provider, JSON repository, local event contract
- Session boundary: 기존 `footmate:v4:session`의 unversioned/legacy 상태를 schema v2로 정규화하면서 v4.7 runtime UX를 compatibility layer로 보존
- Provider boundary: runtime persistence는 browser `localStorage`; memory provider는 deterministic contract test용이며 회원 DB·원격 저장소는 미연동
- Event boundary: `footmate:v4:events`에 recommendation.selected / join.started / join.completed / checkin.completed / postgame.submitted를 sequence·dedupe 계약으로 기록; external analytics 미연동
- Compatibility fix: 취소된 participation snapshot을 checkout observer가 덮어쓰지 않도록 `canceled` 상태 ownership 보강
- Feature PR: #111
- Final PR QA: FootMate QA #400 · run `35494541917` · PASS
- Product/runtime baseline: `076950f257fce3c5e445d0801c998fc935265dd8`
- Post-merge QA: FootMate QA #401 · run `35494664726` · PASS
- Exact Vercel Production: `dpl_Av3cxidUfJ2vj5hHowCtFg3zAfHq` · SHA `076950f257fce3c5e445d0801c998fc935265dd8` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danntpgjo6nc739md83g` · SHA `076950f257fce3c5e445d0801c998fc935265dd8` · LIVE at verification time

## v4.7.0 — Personalization & Memory · 2026-09-20

**Status:** Verified staged feature release.

- Scope: saved local preference profile, returning-user quick resume, recent-match behavior, favorite area/time/format signals, personalized recommendation reasons, explicit reset/edit controls
- Persistence: `footmate:v4:personalization`
- Ranking boundary: verified Recommendation + Return contract 위에 deterministic personalization adjustment를 보조 신호로 추가
- Privacy boundary: 회원 DB·server memory·cross-device sync 미연동; 개인화 상태는 현재 브라우저 로컬 저장소에만 유지
- Accessibility hardening: personalization controls 44px+, 320/375/390/430px responsive coverage, inactive navigation contrast 보강
- Feature PR: #108
- Final PR QA: FootMate QA #380 · run `35487691154` · PASS
- Product/runtime baseline: `117c6ee36e91344355644811410a88898c279f21`
- Post-merge QA: FootMate QA #381 · run `35487802885` · PASS
- Exact Vercel Production: `dpl_6TFsiiKXNzkrbxD6V1xdMQEhoJHF` · SHA `117c6ee36e91344355644811410a88898c279f21` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danli4btqb8s73alhnp0` · SHA `117c6ee36e91344355644811410a88898c279f21` · LIVE at verification time

## v4.6.0 — Return Loop & Reputation · 2026-09-20

**Status:** Verified staged feature release.

- Scope: postgame perceived-difficulty feedback, attendance/completion history, repeat intent, feedback-aware next recommendation, personal-history disclosure
- Persistence: `footmate:v4:return`
- Reputation boundary: 개인 히스토리와 추천 보조 신호만 저장하며 공개 신뢰도·스포츠맨십 점수는 만들지 않음
- Integration boundary: external reputation backend 미연동
- Feature PR: #106
- Final PR QA: FootMate QA #373 · run `35486637299` · PASS
- Product/runtime baseline: `409adefd40698a7c30202ad6e570445bde8dea8c`
- Post-merge QA: FootMate QA #374 · run `35486719124` · PASS
- Exact Vercel Production: `dpl_Cz6RLRiM9DgSTod8QrNGCxEDQghA` · SHA `409adefd40698a7c30202ad6e570445bde8dea8c` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danl6cp7lnhs73ea5cp0` · SHA `409adefd40698a7c30202ad6e570445bde8dea8c` · LIVE at verification time

## v4.5.0 — Matchday Operations · 2026-09-20

**Status:** Verified staged feature release.

- Scope: separate Matchday Operations persistence, `upcoming → matchday → checked-in`, arrival/late recovery, operational update acknowledgement, cancellation recovery, venue/check-in/team-notice UX
- Persistence: `footmate:v4:matchday`
- Integration boundary: realtime location, map routing, team chat and notification backend 미연동
- Feature PR: #103 · final PR QA #364 · run `35484349288` · PASS
- Production locator fix PR: #104 · QA #366 · run `35485163542` · PASS
- Product/runtime baseline: `072eff6e597c98bb370ece61cba4e74d5975c4a3`
- Post-merge QA: FootMate QA #367 · run `35485268368` · PASS
- Exact Vercel Production: `dpl_DQWXcq8BHG5ZHsudN2YWaEZz8xUY` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-dankmf2jnfac738vj0u0` · exact SHA · LIVE at verification time

## v4.4.0 — Join & Payment State Machine · 2026-09-20

**Status:** Verified staged feature release.

- Scope: `checkout → pending → success | failure | canceled`, payment-method simulation, duplicate-submit guard, reload-safe pending restoration, failure retry, cancel recovery, immutable attempt snapshot
- Persistence: `footmate:v4:participation`
- Integration boundary: 실제 PG 미연동; payment states/methods는 deterministic simulation
- Feature PR: #101 · final PR QA #356 · run `35483267720` · PASS
- Product/runtime baseline: `27f78394c32475e818afd97bf590d6448403f938`
- Post-merge QA: FootMate QA #357 · run `35483442042` · PASS
- Exact Vercel Production: `dpl_GS2Cotyf5UFdDA4gyoCfMFqfa5Pq` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-dank2n8jo6nc739k8egg` · exact SHA · LIVE at verification time

## v4.3.0 — Decision Detail · 2026-09-20

**Status:** Verified staged feature release.

- Scope: recommendation reason breakdown, disclosed sample participant/position composition, facility/operation information, refund timing, save intent, max-two comparison
- Persistence: `footmate:v4:decision`
- Data boundary: capacity/participant/facility data는 prototype sample이며 realtime inventory가 아님
- Feature PR: #99 · final PR QA #350 · run `35475947701` · PASS
- Product/runtime baseline: `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746`
- Post-merge QA: FootMate QA #351 · run `35476071931` · PASS
- Exact Vercel Production: `dpl_G2Bg6oTEq4LJDWetzwoXYQtXMz6K` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-danhjl7lk1mc73fd27u0` · exact SHA · LIVE at verification time

## v4.2.0 — Discovery & Search · 2026-09-20

**Status:** Verified staged feature release.

- Scope: date/time/distance/price/position filters, fit/distance/closing-soon sort, zero-result recovery, URL/session persistence, accessible mobile filter sheet
- Persistence: `footmate:v4:discovery` + `d_*` URL query parameters
- Feature PR: #97 · final PR QA #343 · run `35473512165` · PASS
- Product/runtime baseline: `896be56a2e2438fd383c46152ad8f1d5f11e89b0`
- Post-merge QA: FootMate QA #344 · run `35473666410` · PASS
- Exact Vercel Production: `dpl_oiHYN6EaeNumD3GsmQKDQyjt6xpg` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-dangrd17lnhs73e7cr40` · exact SHA · LIVE at verification time

## v4.1.0 — Recommendation Core · 2026-09-20

**Status:** Verified staged feature release.

- Scope: region/position/level-aware deterministic ranking, human-readable recommendation reasons, Home/Discover/Detail shared recommendation contract
- Ranking boundary: external AI inference가 아닌 sample records + deterministic rules
- Feature PR: #95 · final PR QA #338 · run `35456601863` · PASS
- Product/runtime baseline: `352ffe08a72e145311e043f1292950d8a3041859`
- Post-merge QA: FootMate QA #339 · run `35456762270` · PASS
- Exact Vercel Production: `dpl_HyZn9wb5boHQ3wZTUNMFsuMSRkVC` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-danbvlvavr4c73aab5s0` · exact SHA · LIVE at verification time

## v4.0.1 — Matchday Companion hardening · 2026-09-19

**Status:** Verified patch release.

- Scope: Guided/Evidence return path, date-safe sample schedules, match-specific check-in persistence, SPA focus, validation/detail continuity, repository/runtime consolidation, Case Study layout hardening
- Runtime/repository hardening PR: #92
- Case Study/Production smoke closure PR: #93 · PR QA #332 · run `35454879661` · PASS
- Product/runtime baseline: `b2509f5759194ab0db46a8c5429f3b422e9c59d8`
- Post-merge QA: FootMate QA #333 · run `35455137726` · PASS
- Exact Vercel Production: `dpl_AEtpPnZpPQqTXA4DhUuRB7yJgzE8` · exact SHA · READY at verification time
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-danbgvbtqb8s73adkk00` · exact SHA · LIVE at verification time

## v4.0.0 — Matchday Companion · 2026-09-19

**Status:** Official Major release.

- Scope: official `/app`, Case Study `/`, `/demo` and `/next` compatibility aliases, guest-first Value → Preferences → Recommendation → Detail → Sign in → Checkout → Matchday flow, Real/Guided/Evidence separation, product-first 16-section Case Study
- PR #90 editorial/release closeout QA: FootMate QA #326 · run `35449028478` · PASS
- Product/runtime baseline: `130231c935958651e9e2e50e1dbda3df3df978f3`
- Post-merge QA: FootMate QA #327 · run `35449553358` · PASS
- Exact Vercel Production: `dpl_69iQCJKfXtC3i8ZwWqKvLjJcfdEh` · exact SHA · READY at verification time
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-dan9ujrtqb8s73abvdjg` · exact SHA · LIVE at verification time

## Shared prototype boundary

v4.x → v5.0은 인터랙티브 서비스 기획 프로토타입의 단계적 제품/아키텍처 진화다. v5.1에서는 AI Match Assistant의 Vercel AI Gateway inference가 실제 Production에서 검증되었다. v5.1.1에서는 AI primary path, bounded recovery, state consistency와 request guard를 강화했고, release-readiness 단계에서 `/beta`의 Supabase Auth·member profile·match catalog·position capacity·participation 및 `/beta/operator`의 allowlisted 경기/참가자 운영 경로를 실제 backend에 연결했다. 이후 Must hardening에서 network/offline recovery, minimal audit, account deletion, data-freshness boundary를 추가했다. 현재 Closed Beta는 account recovery·취소 마감·connected check-in·operator completion·DB-backed in-app notification·Resend transactional email에 더해 Realtime refresh, reminder, waitlist, actual Beta match ranking/feedback, provider-aware Google/Kakao OAuth UI, Operator TOTP MFA, opt-in Web Push, Supabase Storage media까지 연결되어 있다. transactional email과 Web Push outbox는 server worker/Cron이 처리하고, email은 signed Resend webhook으로 final delivery state를 회수한다. 현재 `/app`의 경기 데이터와 추천 순위는 sample records + deterministic recommendation engine이 Source of Truth이며 `/beta`는 별도의 connected data path다. 실제 PG와 external analytics는 연결하지 않았고, Google/Kakao 실제 로그인과 device-level Web Push 브라우저/OS 표시는 2026-09-22 Production 수동 QA를 완료했다. OAuth provider credential/config와 사용자의 브라우저/OS 권한은 해당 기능이 동작하기 위한 운영 의존성으로 유지된다.

GitHub commit history는 historical repository data로 유지되며 current product surface와 구분한다.
