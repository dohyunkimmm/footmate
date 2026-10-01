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

## State ownership

- Matching / deterministic recommendation ownership은 기존 domain을 유지한다.
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
- `/app` Release join: free participation confirmation; real PG 없음
- `/beta`: Supabase Auth, match data, participation/cancel/check-in, Realtime, notification/email/Web Push/media 등 connected validation surface
- `/beta/operator`: allowlisted + TOTP MFA connected operator surface

`/beta`의 connected capability를 `/app`에 연결된 것처럼 표현하지 않는다. 향후 provider consolidation은 별도 integration release로 다룬다.

## Visual system

Auth PC 개선에서 검증한 원칙을 Release App 전체에 적용한다.

**한 화면 = 하나의 연속 canvas, 의미 있는 object만 card.**

- Desktop Detail, Join, MY는 section마다 카드가 반복되는 구조를 줄이고 divider/spacing 중심으로 hierarchy를 만든다.
- MY의 major hierarchy는 **현재 경기·경기 후 행동 → 저장 경기 → 내 정보 → 설정** 순서를 spacing으로 구분하고, 같은 레벨의 새 card를 추가하지 않는다.
- 경기 카드, lifecycle focal object처럼 실제 독립 object는 card를 유지한다.
- Home/Discover의 AI focal hierarchy는 유지한다.
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

v6 runtime 변경은 다음을 모두 통과해야 한다.

- Release App architecture contract
- Regression suite
- Browser E2E + axe
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
