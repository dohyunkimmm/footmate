# FootMate v4.0 Release Checklist

## Product
- [ ] `/app` boots v4.0 release metadata and Real App
- [ ] Guest-first setup reaches recommendations without account creation
- [ ] Detail → sign-in → checkout preserves selected match
- [ ] Account and sign-up validation blocks invalid input
- [ ] Detail back returns to Home / Discover / My Matches entry surface
- [ ] Check-in completion is visible and persists across reload
- [ ] Real App hides reviewer/prototype language
- [ ] Guided / Evidence context stays outside the Real App surface

## Case Study
- [ ] `/` renders 16 product-first sections
- [ ] Cover and CTAs link to `/app`
- [ ] No candidate / pre-v4 current-release wording remains
- [ ] Mobile Case Study scrolls vertically without horizontal overflow

## QA
- [ ] v4 static release boundary
- [ ] Browser E2E
- [ ] axe serious/critical gate
- [ ] 320 / 375 / 390 / 430 responsive gate
- [ ] persistence / reload restoration
- [ ] deep-link / compatibility alias gate
- [ ] console error gate

## Production
- [ ] exact merged `main` SHA deployed to Vercel Production
- [ ] Vercel state READY
- [ ] `/`, `/app`, `/demo`, `/next` HTTP smoke
- [ ] exact Production Chromium smoke
- [ ] required CSS/JS assets reachable
- [ ] Render backup exact main SHA LIVE

## Durable docs
- [ ] README current main + exact verified Production SHA/deployment
- [ ] Release History current main + verification state
- [ ] Notion current project page updated to v4.0
- [ ] Pre-v4 Notion project/supporting pages moved to private workspace area
