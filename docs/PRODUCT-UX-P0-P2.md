# FootMate Product UX P0–P2 · 2026-10-10

## Scope and feature boundaries

This change preserves the v6 Find → Decide → Join → Play → Return lifecycle, the deterministic recommendation engine, the three-tab Real App IA, and existing Supabase Closed Beta authority. No PG integration, new revenue claim, backend schema mutation, or sample-to-live data cross-wiring is included.

### P0 — Trust and measurement foundation

- Real App /app Decision Detail explicitly distinguishes **sample price, capacity and prototype refund policy** from **zero charge for the free join demonstration**, before the primary action.
- Closed Beta footer no longer falsely labels notifications disconnected: actual email and opt-in Push availability is qualified by operating setup and user consent; PG remains unavailable.
- An explicitly mismatched recommendation gets a human-readable caution even if it is ranked highly.
- Connected Beta emits a strictly allowlisted browser `footmate:beta:measurement` CustomEvent for: `match_list_available`, `join_attempt`, `join_succeeded`, `join_failed`, `directions_opened`, and `calendar_opened`. Attempt and outcome share a flow ID; these events exclude login credentials, email addresses and auth tokens.
- **This is not a production analytics ingestion pipeline:** events are browser-local, nonpersistent, and cohort is `unclassified`. There is no automatic collection into Supabase. Baseline and conversion claims are prohibited until verified pilot cohort classification, consent/privacy review, secure RLS-backed ingestion, deduplication and numerator/denominator QA are implemented.
- Browser zoom up to 200% (as opposed to existing CSS/text simulation) remains a **manual QA item** until exact browser zoom instrumentation and visual sign-off are recorded. Automated geometry and axe tests are not substitutes for that review.

### P1 — UI decisions and information hierarchy

- The current basic region, position, and intensity profile can be edited directly in Discover, without replaying all three onboarding steps. These select options are sourced from the existing validated setup step definitions; active advanced filters, sort and URL state are owned by Discovery and preserved.
- Detail keeps the essential decision reasons, capacity and refund policy visible while moving secondary facilities/gear details to a native keyboard-accessible `details` section (collapsed by default below 700px, open on desktop).
- The existing save/compare flow, Join primary CTA, desktop context canvas and mobile bottom nav are preserved. Screenshot baseline approvals are not auto-updated.

### P2 — Connected Beta matchday utility links

- Real Supabase-backed matches only (`source: connected-beta`) expose a user-initiated maps search link.
- The Google Calendar **draft** link is exposed only for confirmed participation. It uses the connected match's ISO start time, declared duration, title and stored venue. It cannot make a calendar event or booking without user action in the external service.
- These are searches/drafts: verify the operator-provided address, latest match time and policy. Sample /app dates do not produce these links.
- Cross-surface /app–/beta data merging, payments, team chat and realtime geolocation remain outside the scope.

## 2026-10-10 · Release App flow P0–P2 implementation closure

이 절은 위 Connected Beta 중심 P0–P2 항목과 별개의 **Release App `/app` 고도화**입니다. 기존 Beta 측정·지도/캘린더 정책과 기능 소유권을 변경하지 않습니다.

- **P0 / returning user:** 직접 `/app` 진입의 신규 → Welcome/Setup, 설정 완료 → Home, 참가 이력 또는 legacy Schedule → MY로 이어집니다. 이미 저장된 참가 상태를 손상시키지 않습니다. 실제 PG·환불 처리 없이 `0원 무료 체험`과 샘플 취소·환불 정책을 정확하게 안내합니다.
- **P1 / AI result repair:** AI 추출 조건의 레벨을 Discover에서 직접 수정하고, AI 결과가 없으면 시간 → 가격 → 거리 → 포지션 → 지역의 존재하는 조건을 하나씩 완화합니다. 사용자 설정과 Discovery 추가 필터를 임의 초기화하지 않고 실제 후보·순위를 AI가 생성하지 않습니다.
- **P2 / MY-to-Return:** 중복 진행 단계 안내를 native `details`에 접습니다. 로컬 계정은 체험 계정으로 표시합니다. Return history 완료 기록이 있는 postgame 참가 경기는 후속 Home/Discover 추천에서 제외하고 다음 경기 찾기 CTA를 유지합니다.
- **증거:** [PR #577](https://github.com/dohyunkimmm/footmate/pull/577) · [병합 전 QA SUCCESS](https://github.com/dohyunkimmm/footmate/actions/runs/38050395821) · [병합 후 QA/Production Smoke SUCCESS](https://github.com/dohyunkimmm/footmate/actions/runs/38050777170) · main SHA `ddccd383d045ec5aee1340e339a486aff256c9b3` · Vercel `dpl_4zT1HeEfDv5jiwdTWckKvm1rbNQo` READY / 운영 alias 일치. Browser E2E·axe·타이포그래피·모바일 WebKit과 Production Smoke(Chromium 15 + 추가 8) 통과. 320/375/390/430/1440 화면의 별도 브라우저 표본 검사 기록도 보존했습니다.
- **주의:** PNG baseline 일괄 갱신 없음. 변경된 무료 참가·MY 안내·완료 경기 대체 추천 화면에 한해 diff 검토 및 bounded tolerance를 적용했습니다. 이번 변경 이후 물리 기기 수동 QA·실제 브라우저 200% 확대·실사용 KPI 측정은 완료 범위 밖입니다.

## Gate and review protocol

1. Run `node --test tests/contracts/footmate-product-ux.contract.cjs`, current Regression 36, Browser E2E + axe, typography contracts, mobile WebKit.
2. Validate mobile widths 320/375/390/430 and desktop 1366/1440/1920 across Home, Discover direct edits, Detail expand/collapse, free-Join continuity, and the canonical MY flow.
3. Inspect changed visual snapshots without blanket baseline updates. Verify real 200% browser zoom and text spacing manually (P0 follow-up).
4. On Closed Beta with a disposable QA match, check anonymous maps search and signed-in joined-only calendar draft, no event creation, authenticated cancellation flow unchanged, and invalid/no-address fallback.
5. Review pilot measurement cohort, anti-abuse and privacy requirements separately before enabling persisted analytics. Never claim measured conversion from these browser events.

## Success criteria

- Trust copy visible and true on the free prototype; no real payment claim.
- Basic conditions can be edited in Discover without losing the current advanced filters or using a full account/login step.
- Facility details keyboard accessible, while policy and join CTA remain reachable.
- External links only source actual Connected Beta match objects; calendar link only for confirmed joined match.
- Existing regression/visual/security gates remain enforced; any failure blocks merge.
