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

## QA / Production
- [x] FootMate QA #318 · run `35447147842` PASS
- [x] v4 static release boundary
- [x] Browser E2E + axe
- [x] 320 / 375 / 390 / 430 responsive gate
- [x] persistence / reload / compatibility alias / console-error gates
- [x] exact Vercel Production SHA `fa150f183f6a821edd04e49c3496559e5ebecc8e`
- [x] Vercel deployment `dpl_ALtasaHtBQZZthkEgMtxomN2p4GP` READY
- [x] exact Production HTTP + Chromium smoke
- [x] Render `dep-dan989e8bjmc73abijrg` LIVE at the same SHA

## Public-surface cleanup
- [x] Current public branch contains v4 runtime ownership only
- [x] Pre-v4 source/test/checker files removed from current public tree
- [x] README / Release History / Architecture synchronized
- [x] Notion representative project and Portfolio synchronized to v4
- [x] Supporting Notion PRD / Flowchart / Workflow moved to private workspace area
- [x] Cleanup merge exact Production and Render re-verified

GitHub repository visibility is still public. Historical commits therefore remain repository history even though pre-v4 material has been removed from the current branch and public product/documentation surfaces.
