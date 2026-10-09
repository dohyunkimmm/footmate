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
