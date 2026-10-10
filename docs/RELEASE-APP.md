# FootMate Release App v6

## Goal

FootMate v6는 `/app`을 개별 기능 데모가 아니라 **Find → Decide → Join → Play → Return**이 한 제품 안에서 끝나는 Release App으로 정리한다.

## Canonical IA

주요 navigation은 **Home / 경기 찾기 / MY** 3개만 유지한다.

- **Home** — 사용자의 현재 lifecycle에서 가장 중요한 다음 행동을 보여준다. 미참가 상태에서는 AI 경기 탐색, 참가 후에는 다음 경기, 경기 당일에는 Matchday, 경기 후에는 Return 진입이 primary task다. Return 저장이 끝나면 완료 상태를 보여주고 다음 경기 찾기로 다시 연결한다.
- **경기 찾기 / Discover** — AI 조건 handoff, filter/sort, 결과 탐색, zero-result recovery를 전담한다.
- **Detail** — 경기 참가 판단에 필요한 추천 이유, 자리/포지션, 시설/운영, 취소 정책을 하나의 연속된 decision surface에서 보여준다.
- **Join** — 로그인 후 무료 참가를 명시적으로 확인한다. `/app`에서는 실제 PG가 연결되지 않았으므로 가짜 결제 UX를 노출하지 않는다. 참가 정보 유실·저장 실패 시 오류 상태에서 재시도하거나 경기 찾기로 복구할 수 있다.
- **MY** — 참가 경기, 저장 경기, Matchday, 경기 후 피드백, 내 정보와 설정의 canonical owner다.

기존 `schedule` route는 호환성 입력으로만 받아 `profile`/MY로 migration한다.

## Re-entry / AI recovery / MY continuation · 2026-10-10

- **P0 / 재방문:** 일반 `/app` direct entry는 기존 `footmate:session` 상태를 우선합니다. 신규(`setupComplete=false`, 참가 기록 없음)만 Welcome/Setup, 설정 완료(`setupComplete=true`, 참가 기록 없음)는 Home, `joinedMatchId`가 있거나 legacy `schedule` 상태면 MY(`profile`)에서 이어집니다. `?resume=1` 등 내부 복귀 요청은 저장 경로를 유지합니다. `처음부터 다시 보기`는 별도 명시적 초기화입니다.
- **P0 / 샘플 신뢰:** 참가 화면은 샘플 경기 가격·잔여 자리·정책 예시와 **무료 참가 체험의 실제 청구액 0원**을 구분합니다. MY의 취소·환불 안내는 실제 취소 실행이나 환불이 발생하는 연결 서비스로 표현하지 않습니다. 비밀번호 방식 로컬 체험 로그인은 `체험 계정 · 이 브라우저에만 저장`으로 표시하고 실제 Google/Kakao OAuth와 구분합니다.
- **P1 / AI 조건 정정:** Home 자연어 요청을 구조화해 Discover로 넘긴 뒤 사용자가 **해석된 경기 레벨**을 직접 수정할 수 있습니다. UI의 `초급` 표기는 내부 canonical `초중급`과 다를 수 있으므로 사용자 표시와 저장된 조건을 구분합니다. AI 결과 0개라면 시간(`afterTime`) → 가격(`maxPrice`) → 거리(`maxDistanceMin`) → 포지션(`position`) → 지역(`region`) 순서로 존재하는 조건을 하나씩 완화할 수 있습니다. 레벨은 별도 직접 정정합니다. 실제 경기 후보와 순위·추천 이유는 deterministic runtime이 계속 소유합니다.
- **P2 / MY·다음 경기:** MY의 현재 경기 상태는 유지하되 중복되는 `참가 확정 → 경기 당일 → 경기 후` 보조 설명은 펼침 영역으로 정리합니다. postgame 피드백이 기존 return history에 `completed: true`로 저장되고 `matchStage: postgame`이면 같은 `joinedMatchId`는 후속 Home 추천/Discover 결과에서 표시하지 않습니다. 저장된 경기 기록이나 기존 추천 로직 자체를 삭제·변경하지 않습니다.
- **상태·경계:** `footmate:session`, `footmate:v5.1:ai`, `footmate:v5.2:discover-ai-snapshot`, `footmate:return`과 기존 domain/repository ownership을 재사용합니다. `/beta`, `/beta/operator`, Case Study, 실제 PG, 서버 간 계정 동기화는 이번 변경 범위가 아닙니다.

## State ownership

- Matching / deterministic recommendation ownership은 기존 domain을 유지한다. 레벨 차이가 2단계 이상이면 높은 총점이 있어도 사용자-facing fit을 `경기 강도 차이 확인`으로 표시해 mismatch를 숨기지 않는다.
- Discovery filter/sort와 AI handoff ownership은 기존 모듈을 유지한다.
- 참가 확정은 `/app`의 browser-local participation state에 `amount: 0`, `paymentMethod: none`으로 저장한다.
- Matchday와 Return state는 기존 repositories를 재사용하되 사용자-facing canonical surface는 MY로 통합한다.
- Return 완료 여부는 기존 return-loop history의 completed record를 기준으로 읽고, Home은 완료 후 `다음 경기 찾기`를 primary action으로 전환한다.
- Home은 lifecycle summary와 MY/Discover 진입만 소유하며 Matchday/Return의 두 번째 독립 panel을 만들지 않는다.

## Provider boundary

v6는 UX와 IA를 통합하지만 연결 범위를 과장하지 않는다.

- `/app` AI inference: Vercel AI Gateway connected
- `/app` recommendation: deterministic runtime logic
- `/app` match/capacity/participant data: sample records
- `/app` participation persistence: browser local state
- `/app` Google/Kakao social auth entrypoint: 활성 provider가 있을 때 Supabase OAuth authorize/user 확인 경로를 사용하며 외부 로그인 화면으로 이동할 수 있음; signup/recovery panel에는 social-provider status를 노출하지 않음
- `/app` Release join: free participation confirmation; real PG 없음
- `/beta`: Supabase Auth, match data, participation/cancel/check-in, Realtime, notification/email/Web Push/media 등 connected validation surface
- `/beta/operator`: allowlisted + TOTP MFA connected operator surface

`/beta`의 connected capability를 `/app`에 연결된 것처럼 표현하지 않는다. 향후 provider consolidation은 별도 integration release로 다룬다.

## Visual system

Auth PC 개선에서 검증한 원칙을 Release App 전체에 적용한다.

**한 화면 = 하나의 연속 canvas, 의미 있는 object만 card.**

- Desktop 960px+ review surface는 560px app canvas를 유지한 채 왼쪽에 서비스 여정·샘플 데이터·무료 참가 경계를 설명하는 context panel을 추가한다. 1366/1440/1920px에서 결합된 composition의 가독성과 horizontal lock을 유지한다.
- Desktop Detail, Join, MY는 section마다 카드가 반복되는 구조를 줄이고 divider/spacing 중심으로 hierarchy를 만든다.
- MY의 major hierarchy는 **현재 경기·경기 후 행동 → 저장 경기 → 내 정보 → 설정** 순서를 spacing으로 구분하고, 같은 레벨의 새 card를 추가하지 않는다.
- 경기 카드, lifecycle focal object처럼 실제 독립 object는 card를 유지한다.
- Home/Discover의 AI focal hierarchy는 유지한다. Desktop Home은 기본 추천 프로필과 추천 범위를 명시하고, Discover zero-result에서는 현재 결과와 모순되는 personalization explanation을 숨긴다.
- 모바일의 기존 안정 layout은 불필요하게 평탄화하지 않는다.

## Recovery states

- Join 정상 상태: `무료로 참가 확정`.
- Join processing: 중복 실행을 막고 `참가 확정 중…` 상태를 표시한다.
- Join error: 버튼이 stuck 상태로 남지 않으며 오류 안내와 `다시 시도`, `경기 다시 선택` recovery를 제공한다.
- Return 완료: MY에는 저장 결과를 유지하고 Home은 완료 CTA를 `다음 경기 찾기`로 전환한다.

## Migration / compatibility

- 기존 `schedule` session → MY
- 기존 browser-local keys와 legacy compatibility mirror 유지
- 기존 Matching/ELO, AI ranking, Discover filtering, save/compare 기능 유지
- Guided/Evidence, `/beta`, `/beta/operator`는 별도 surface로 유지

## Release QA contract

2026-10-10 P0–P2 flow update verified: [PR #577](https://github.com/dohyunkimmm/footmate/pull/577), main squash `ddccd383d045ec5aee1340e339a486aff256c9b3`, [pre-merge QA](https://github.com/dohyunkimmm/footmate/actions/runs/38050395821) SUCCESS, [post-merge QA](https://github.com/dohyunkimmm/footmate/actions/runs/38050777170) SUCCESS, Production `dpl_4zT1HeEfDv5jiwdTWckKvm1rbNQo` READY. Post-merge Production Smoke Chromium 15 + 추가 8 cases PASS. 재방문 Home/MY, AI 조건 정정·완화, Return 완료 경기 제외를 실제 배포 브라우저에서 확인했고 모바일 390px 가로 넘침 없음.

기존 QA 조건에 **신규/재방문 분기, 레거시 Schedule 이관, AI 레벨 정정/제로결과 완화, MY 체험 계정 표시·단계 접기, postgame 완료 경기 재추천 제외**를 추가합니다. 실제 브라우저 200% 배율 및 신규 실물 기기 수동 QA는 이 PR의 검증 완료 주장에 포함하지 않습니다.

v6 runtime 변경은 다음을 모두 통과해야 한다.

- Release App architecture contract
- Regression suite
- Browser E2E + axe
- Desktop 1366 / 1440 / 1920px review context readability + 560px app canvas + horizontal lock contract
- Auth panel 전환 시 heading focus + scrollTop 0 contract
- recommendation level mismatch label + Discover zero-result explanation suppression contract
- changed surface Playwright `toHaveScreenshot()` comparison
- Desktop Detail / Join / MY visual contract
- Mobile 390px Home lifecycle / Join / MY Matchday / MY postgame visual contract
- Mobile 320px compact Join visual contract
- 390px Detail / Join / MY axe contract
- legacy Schedule → MY migration
- free Join → Success → MY flow + Join error/retry recovery
- lifecycle Home → MY flow + Return 완료 → Discover handoff
- postgame Return → recommendation state persistence
- responsive / WebKit regression
- exact Vercel Production deployment verification
- Production smoke / v6 behavior verification
