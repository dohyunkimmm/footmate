# FootMate v4.0 Release Checklist

## Product
- [x] `/app` boots v4.0 release metadata and Real App
- [x] Guest-first setup reaches recommendations without account creation
- [x] Detail → sign-in → checkout preserves selected match
- [x] Account and sign-up validation blocks invalid input
- [x] Detail back returns to the actual entry surface
- [x] Check-in completion is visible and persists across reload
- [x] Real App hides reviewer/prototype language
- [x] Guided / Evidence context stays outside Real App

## Case Study
- [x] `/` renders 16 product-first sections
- [x] Cover and CTAs link to `/app`
- [x] Current narrative is v4.0-only
- [x] Mobile Case Study is horizontally safe

## QA / Production baseline
- [x] FootMate QA #316 · run `35445575340` PASS
- [x] v4 static release boundary
- [x] Browser E2E + axe
- [x] 320 / 375 / 390 / 430 responsive gate
- [x] persistence / reload / compatibility alias / console-error gates
- [x] exact Vercel Production SHA `fcb01400ecc6ee34bd70bf2da9c1ee8b114375f9`
- [x] Vercel deployment `dpl_AAvMY6CCkf8GpsFTVoir38TNxELh` READY
- [x] exact Production HTTP + Chromium smoke
- [x] Render `dep-dan8p7e8bjmc73ab4os0` LIVE at the same SHA

## Public-surface cleanup
- [ ] Current public branch contains v4 runtime ownership only
- [ ] Pre-v4 source/test/checker files removed from current public tree
- [ ] README / Release History / Architecture synchronized
- [ ] Notion representative project and Portfolio synchronized to v4
- [ ] Supporting Notion PRD / Flowchart / Workflow moved to private workspace area
- [ ] Cleanup merge exact Production and Render re-verified
