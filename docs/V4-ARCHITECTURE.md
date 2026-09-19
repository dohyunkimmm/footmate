# FootMate v4.0 Architecture

## Product contract

FootMate v4.0은 화면 모음이 아니라 **Matchday Companion**으로 정의합니다.

`Find → Decide → Join → Play → Return`

사용자 경험과 리뷰어용 설명을 분리합니다.

- Real App: `/app`
- Guided: `/app?mode=guided`
- Evidence: `/app?mode=evidence`

## Runtime ownership

- `app.html` — official v4 entry + release metadata
- `src/v4/app.js` — route / state / render ownership
- `src/v4/data.js` — release metadata, sample match contract, persisted session defaults
- `src/v4/real-app-experience.js` — account / sign-up presentation
- `src/v4/release-hardening.js` — validation, detail-return navigation, check-in persistence, guest identity
- `src/v4/app.css` + `real-app-experience.css` — Deep Pitch / Off-white / Charcoal + Lime visual system
- `index.html` + `src/v4/case-study*` — product-first Case Study

## State model

- `setupComplete`
- `region`
- `position`
- `level`
- `selectedMatchId`
- `signedIn`
- `joinedMatchId`
- `matchStage: discover | upcoming | matchday | postgame`
- persisted check-in completion

Normal, empty, error, retry, recovery 상태는 UX 계약 수준에서 다루며 외부 서비스 연동을 가장하지 않습니다.

## Data / matching boundary

현재 v4 UI는 sample match records와 deterministic client-side state를 사용합니다. 추천 설명과 상태 전이는 실제 서비스 UX를 검증하기 위한 프로토타입 계약이며 외부 AI/ML inference로 표현하지 않습니다. 향후 backend/provider가 연결되더라도 user-facing state contract는 유지할 수 있도록 분리합니다.

## Integration boundary

v4.0에 연결되지 않은 항목:

- external AI/ML inference
- member database
- OAuth provider APIs
- payment gateway
- realtime match capacity
- notification backend
- operator console backend

## Public surface policy

현재 public branch의 제품/runtime ownership은 `src/v4/` 하나입니다. `/demo`와 `/next`는 호환 URL일 뿐 모두 v4 Real App을 제공합니다. pre-v4 source, regression suite, checker는 current public tree에서 제거합니다. 다만 public Git repository의 과거 commit history는 별도의 repository visibility/history rewrite 없이는 소급 비공개화되지 않습니다.
