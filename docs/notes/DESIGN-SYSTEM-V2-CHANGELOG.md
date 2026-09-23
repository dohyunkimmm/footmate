# Product Flow QA + Design System v2 change boundary

This branch combines the Product visual-system refinement with release-flow fixes required by Product review. It is built on the current `main`; current Case Study structure, copy, and visual baselines are preserved unless a Product preview causes an explicit visual dependency.

Preserved:

- Product route set and IA
- 39-screen Product scope
- recommendation / participation domain ownership and Matching/ELO ownership
- release identifiers
- deterministic recommendation ranking ownership
- canonical compatibility values used by existing domain/storage contracts

Changed by Product Flow QA:

- display terminology: `포워드` → `공격수`, `초중급` → `초급`, `중급+` → `고급`
- AI Match Assistant promoted to the core visual feature
- explicit fallback copy: `AI 장애나 지연 시 기존 rules-based 검색으로 자동 전환합니다.`
- active Auth v3 Google/Kakao controls route to enabled connected providers; Naver/Apple controls are removed
- auth / checkout / detail back actions follow the actual previous-route stack
- team-message surface is readable without hover and declares the deterministic simulation boundary
- checked-in → postgame feedback → next match discovery is connected
- external/fresh `/app` entry starts at the first screen; intentional internal recovery uses `?resume=1`

Changed by Design System v2:

- semantic Product visual tokens and surface hierarchy
- control and input grammar
- card / panel elevation and border grammar
- status / recovery visual language
- persistent navigation and sticky action consistency
- desktop shell remains at the stable max 560px composition; the unrequested 1040px expansion is removed, and Detail / Checkout / Auth / Schedule / Profile keep the narrow-stack contract on wide viewports
- 320 / 375 / 390 / 430 responsive geometry contracts
- Product Visual Regression baselines for changed surfaces

Temporary baseline-generation workflows are not part of the final branch state. Baseline generation alone is not accepted as Visual Regression PASS.