# FootMate Release History

## 2026-10-26 — 현행 풋살 경로와 로그인 맥락 · 확인된 기준

- 문서 정리 직전 `main`은 `e29134aac02da85b4529d41ddb642099c489ff19`이며, [main Actions #40295186529](https://github.com/dohyunkimmm/footmate/actions/runs/40295186529)에서 `Regression 36`, `Browser E2E + axe`, `Deploy Cloudflare`, `Production Smoke`가 모두 **SUCCESS**였다. 이는 해당 커밋의 자동 게이트·배포 검사 결과이며 실제 이용자 OAuth 로그인, 외부 운영 설정 전체에 대한 수동 검증을 뜻하지 않는다.
- [PR #700](https://github.com/dohyunkimmm/footmate/pull/700)은 일반 로그인에 과거 참가 경기 안내가 남는 문제를 수정하고, 선택 경기 참가 맥락과 일반 로그인 맥락을 구분하는 E2E를 추가했다.
- 현재 공개 `/demo`·`/beta`는 Cloudflare Worker에서 `beta.html`로 연결하며 `/prototype`은 `app.html`로 분리한다. 풋살 전용 조건 선택, 후보 내 AI 추천, 참가 시 로그인과 기존 서버 참가·취소는 루트 [README](../README.md) 및 [매칭 방향](MATCHING-DIRECTION.md)을 현재 설명 기준으로 삼는다.
- 아래의 「구현 검증 중」, Vercel URL·READY, 과거 축구/풋살 혼합 데모 및 9·13단계 화면 기록은 **각 작성 시점의 이력**으로 보존하며 현행 `main`의 완료 여부를 덮어쓰지 않는다. 운영·배포 상태는 해당 SHA의 최신 Actions 결과를 별도로 확인한다.

## 풋살 전용과 로그인 이후 Beta 앱 흐름 정정 · 구현 검증 중

- 축구 선택·종목 탭·11인제 예시를 제거하고 활동 지역 → 실력·포지션·시간의 첫 선택 흐름을 유지한다.
- 이메일·소셜 인증 후 공개 데모로 되돌리는 분기를 제거하고 /beta 추천 홈으로 진입한다. 추천·내 경기·MY를 구분하고 참가 완료는 내 경기로 이어진다.
- 실제 미래 풋살 경기 우선, 인증 후 실제 모집이 없을 때 표시가 붙은 풋살 예시 24개를 제공한다. 예시 참가·취소는 계정별 브라우저 기록이며 실제 참가·정원·대기·알림·이메일을 생성하지 않는다.
- 예시 경기의 지역·실력·20시 이후 조합과 5인제/6인제 정원을 보완한다. 처음 8개와 더 보기로 표시한다.
- Pretendard/Tossface와 앱 560px·Case Study 1920px 우선 기준을 유지한다. 운영 배포와 검증 결과는 해당 PR의 최종 상태로 확인하며 이 항목만으로 배포 완료를 주장하지 않는다.


현재 공개 대표 주소는 루트 README에 기록된 [FootMate Demo](https://footmate.fmate.workers.dev/demo)와 [Case Study](https://footmate.fmate.workers.dev/)입니다. 이전 `footmate-black.vercel.app` 주소는 과거 Vercel 배포 기록에 속합니다. 아래 날짜·PR·SHA별 기록은 당시 검증 범위를 보존하며, 최신 배포 상태는 현재 GitHub Actions에서 따로 확인합니다.

## 2026-10-24 — 첫 조건 선택 유지·예시 경기로 데모 흐름 복구 · #659

- 사용자의 원래 의도인 첫 조건 선택을 유지한다. 종목·지역 → 실력·포지션·시간의 두 짧은 선택 단계 뒤에 추천 카드를 보여주며, 재방문에는 저장한 조건을 복원한다.
- 공개 /demo가 비어 있던 원인은 실제 DB에 과거 취소 QA 경기 2건만 남아 있던 상태였다. 실제 모집 경기를 임의 생성하거나 QA 기록을 모집 상태로 바꾸지 않는다.
- /demo에 ‘데모 경기’로 표시한 축구·풋살 예시 8개와 미래 날짜·포지션 자리를 제공한다. AI는 이 카탈로그의 적격 후보 안에서 추천한다. 데모 참가·취소·재방문은 사용자별 브라우저 기록으로 격리한다.
- 기존 Google/Kakao·이메일 인증과 /beta OAuth 콜백을 유지한다. 데모에서 시작한 소셜 인증은 선택한 데모 경기로 복귀한다. /beta의 실제 서버 참가·취소·운영 데이터는 보존하며 데모는 실참가 RPC·알림·이메일 발송을 생성하지 않는다.
- [PR #659](https://github.com/dohyunkimmm/footmate/pull/659)의 최종 CI·화면 캡처·배포 상태로 구현 검증을 확인한다. 처음 선택을 없애려던 미병합 시도는 철회하고 선택형 첫 설정을 유지한다. 실제 사용자 매칭 효과와 OAuth 실로그인 완료는 별도 검증이다.

## 2026-10-24 — 선택형 축구·풋살 추천과 참가 시 로그인 · #657 운영 반영

- [PR #657](https://github.com/dohyunkimmm/footmate/pull/657) · runtime `c3e9fbcbd70fb3d91f327341e0fdacbce04a691f`를 운영에 반영했다. Vercel Production `dpl_G1EfHKf3Z73HdD3PAm43gAF2zy6S` READY와 공식 alias `footmate-black.vercel.app`를 대조했다.
- 처음에는 종목·지역·실력·포지션·시간을 선택하고, 재방문에는 저장한 조건·추천 순서로 홈을 연다. 문장 입력을 제거하고 추천을 먼저 본 뒤 참가 시 기존 카카오·구글·이메일 인증을 연다. 로그인만으로 자동 참가하지 않는다.
- 실제 적격 후보 최대 12개 안에서 AI가 추천 순서를 정한다. 알 수 없는/중복 ID는 제거하고 선택 조건·경기 사실·추천 이유는 데이터와 규칙으로 보호한다. AI 실패·시간 초과에는 선택 조건의 기본 결과를 유지한다.
- 선택 경기와 포지션은 로그인·새로고침 후에도 유지한다. 프로필·사진·알림·계정 설정은 내 정보에서 열고, 데이터가 없는 대기·참석 이력 패널은 숨긴다. 서버 참가·취소·체크인·피드백과 기존 OAuth 설정·복귀 경로는 유지했다.
- [PR QA 40089778193](https://github.com/dohyunkimmm/footmate/actions/runs/40089778193) SUCCESS: 회귀, 변경 흐름 단독 1개, Case Study 28개, Chromium 131개, 이전 프로토타입 WebKit 6개 PASS. 타이포그래피 23개 시나리오·56/56 PNG 무결성·문제 0건. 시각 기준과 허용치는 변경하지 않았다.
- [변경 흐름 화면 근거](https://github.com/dohyunkimmm/footmate/actions/runs/40089778193/artifacts/12558537274)와 [전체 브라우저 근거](https://github.com/dohyunkimmm/footmate/actions/runs/40089778193/artifacts/12558398642)는 테스트 경기·인증 응답으로 검증한 화면이다. 실제 사용자 OAuth 로그인 완료를 뜻하지 않는다.
- 실제 연결된 Chrome의 운영 1920px에서 앱 폭 560px·가로 넘침 없음, 선택형 첫 화면·조건 선택·재방문 복원·카카오/구글 버튼·로그인 열기/복귀와 Case Study 선택형 AI 설명을 확인했다. 현재 공개 경기 데이터는 비어 있어 운영 UI에는 경기 없음이 표시된다. 실제 참가 전체 흐름은 위 테스트 데이터로 검증했다.
- 병합 후 [운영 자동 검사 40090378235](https://github.com/dohyunkimmm/footmate/actions/runs/40090378235)의 결과는 PR QA와 별도로 확인한다. 구현 QA·서버 연결 확인을 매칭 만족도·전환 개선이나 실제 사용자 로그인 완료로 해석하지 않는다.
- 노션 PRD·Service Flow·AI Workflow·포트폴리오 본문도 같은 선택형 흐름으로 맞추며 제목·썸네일·카드 형식은 유지한다. 이전 자연어 프로토타입과 기존 배포 기록은 별도로 보존한다.

## 2026-10-24 — 출시 Beta 공개 진입·UI 정리 운영 반영 완료 · #655

- 사용자 정정에 따라 공개 /demo는 체험용 프로토타입이 아니라 기존 서버 연결 Beta를 엽니다. 기존 프로토타입은 /prototype으로 분리하며 관련 회귀 검사는 그 경로에서 보존합니다.
- 카카오·구글 OAuth, 서버 세션·프로필·경기·참가·취소·피드백 연동을 유지합니다. 새로운 인증 제공자·DB 권한·환경변수는 추가하거나 변경하지 않습니다.
- 긴 서비스/백엔드 소개와 체험 선택 메뉴를 제거하고 실제 AI 검색·경기 목록·로그인·내 경기·계정 관리만 남깁니다. PC에서도 최대 560px 앱형 한 열을 사용합니다.
- 실제 Beta AI는 실제 공개 경기로 후보를 정합니다. 거리 데이터가 없을 때 미적용을 알리고, 해석 실패 시 기존 목록을 유지합니다. 프로토타입의 조건 정정/완화·피드백 보정 증거를 현재 Beta 기능으로 오인하지 않도록 Case Study에 구분합니다.
- [PR #655](https://github.com/dohyunkimmm/footmate/pull/655) · main `9d97cb582b88a62f1bf8134f27a1737d2ef93bb0`에 병합했습니다. [PR QA 40085073184](https://github.com/dohyunkimmm/footmate/actions/runs/40085073184): 회귀, Case Study 28개, Chromium 128개와 기존 프로토타입 WebKit 6개 PASS. 실제 Beta의 공개 진입·OAuth URL·서버 흐름·320–1920px 표시를 Chromium에서 검증했습니다. 프로토타입 시각 기준·비교 허용치는 그대로입니다.
- [main QA 40085778279](https://github.com/dohyunkimmm/footmate/actions/runs/40085778279) 전체 SUCCESS: exact 운영 HTTP·실제 AI 추론·Chromium·출시 여정 PASS. 공개 /demo의 실제 Beta 진입 및 Google/Kakao 활성화와 버튼 노출도 확인했습니다. OAuth 계정의 실로그인 완료를 이번 자동 검사에서 수행한 것은 아닙니다.
- Vercel Production `dpl_48WpE125mwqvQDZXrktebYri6JYW` READY, 공식 alias `footmate-black.vercel.app`와 위 runtime SHA를 대조했습니다. 노션 PRD·Service Flow·AI Workflow·포트폴리오 카드 2곳의 현행 설명도 같은 출시 Beta 기준으로 정정했습니다. 매칭 만족도·전환 개선을 입증하는 사용자 검증은 별도입니다.

## 2026-10-24 — Demo 복원 시각 기준 승인 · #654

- 김도현의 대화 승인(“바꿔”, 2026-10-24 한국 시간)에 따라 검토한 홈 관련 캡처 5장을 새 기준으로 반영합니다. QA run 40078900469 / runtime 96087d0의 actual PNG이며 비교 허용치는 변경하지 않습니다.
- 승인 범위: AI 결과 카드 390px, 기본 Home 390px, 참가 전·완료 후 Home 1440px, 참가 전 Home 390px. 최종 전체 CI·Mobile WebKit·main 병합·운영 검증은 별도로 확인합니다.

## 2026-10-24 — Demo 화면 범위 정정 · #654 · 검증 중

- 사용자 정정에 따라 1920px PC 우선은 Case Study에만 적용합니다. Demo를 확대한 #652의 1120px·두 열 변경은 범위 해석 오류로 철회하고 기존 최대 560px·한 열 구성으로 복원합니다.
- 기존 AI 입력을 홈 추천 앞에 두고 홈 카드의 중복 근거를 제거합니다. 결과·상세 근거, AI 해석·정정·복구와 검색 문맥 보존 기능은 유지합니다. 체험 로그인 후에도 Welcome에서 로그인 화면을 다시 볼 수 있게 합니다.
- Case Study의 읽기 구성은 유지하고 실제 Demo 캡처·앱형 와이어프레임·설명을 동기화합니다. 로그인 상태에 따라 버튼이 숨겨졌던 기존 조건과 자동 브라우저 테스트의 로그인 재진입을 확인합니다.
- 회귀 검사 통과. 브라우저 검토·시각 기준·main 병합·운영 검증 진행 중이며 기존 시각 허용치는 변경하지 않습니다. 아래 #652 기록은 당시 구현·검증 사실이며 현재 화면 방향과 구분합니다.

## 2026-10-24 — 1920px PC 매칭·Case Study 운영 반영 완료 · #652

- [PR #652](https://github.com/dohyunkimmm/footmate/pull/652)를 main `dee099d42f3cac2ae4ee7ae70b7ba972804c595e`에 squash 병합했습니다. 아래 구현·검증 중 기록은 당시 상태입니다.
- [PR QA 40076349963](https://github.com/dohyunkimmm/footmate/actions/runs/40076349963): Regression 36, Case Study 28/28, Chromium 128/128, Mobile WebKit 6/6 PASS. 타이포그래피 23개 시나리오, 56/56 PNG 무결성, gate/diagnostic 문제 0건. 사용자 승인한 시각 기준 6장을 반영했고 비교 허용치는 유지했습니다.
- [병합 후 운영 QA 40076931223](https://github.com/dohyunkimmm/footmate/actions/runs/40076931223): Regression / Browser E2E + axe / Production Smoke 모두 SUCCESS. exact 배포 대조, HTTP, 실제 AI 추론, 운영 Chromium 및 release journeys PASS.
- Vercel Production `dpl_9vw4bgTeEJctZZsbabfEcyUziEzS` READY, 공식 `footmate-black.vercel.app`의 커밋은 위 main SHA와 일치합니다. 연결된 Chrome에서도 운영 1920px 앱 폭 1120px·두 열·가로 넘침 없음, 실제 ‘인계 초급 GK’ 해석·상세 GK 유지, Case Study PC 대표 이미지와 Home/Discover 와이어프레임을 확인했습니다.
- 사용자 가치 검증·물리기기 재검증은 별도입니다. 무료 참가/체험 계정은 샘플 데이터와 브라우저 로컬 상태이며 실제 예약·결제가 아닙니다.

## 2026-10-24 — PR #652 시각 기준 승인

- 김도현의 대화 승인(“진행해”, 한국 시간 2026-10-24)에 따라 직접 검토한 변경 화면 6장을 새 기준으로 반영합니다: AI 연결 결과 390px, Home/Discover 390px, 참가 전·완료 후 Home 1440px, 참가 전 Home 390px.
- 기준은 QA run 40071378376 / head 3035378의 actual PNG이며, 비교 허용치는 변경하지 않습니다. 기능 검사 통과와 구분하여 전체 Chromium·Mobile WebKit 및 병합 후 운영 검증은 후속 CI로 확인합니다.

## 2026-10-24 — 1920px PC 우선 · 구현/검증 중

- PR #652에 PC 앱 최대 1120px·두 열 경기 비교·상세 분할과 Case Study 대표 PC 캡처·Home/Discover 와이어프레임·PC 우선 검증 설명을 추가했습니다.
- 첫 화면 렌더 전에 저장된 검색 문맥을 읽어 새로고침 후 GK 선택과 MF 마감 안내가 충돌하던 문제를 수정했습니다. API에서도 명시적인 초급을 canonical 초중급으로 보정하며 단위 회귀를 추가했습니다.
- 연결된 Chrome에서 테스트 배포를 직접 검증: 초급 해석, GK 검색/상세/내부 재진입 유지, PC 상세 제목·정보 겹침 해소. 기존 기본 프로필은 유지합니다.
- 성능 예산 확대 없이 CSS를 정리했고, 1920px 폭·두 열·상세 겹침 방지 회귀 테스트를 추가했습니다. 최종 CI/시각 기준 승인/main 병합/운영 배포는 미완료입니다.

## 2026-10-24 — 매칭 조건 일관성·기본 검색 표시·모바일 가독성 패치 · 검증 중

- [PR #652](https://github.com/dohyunkimmm/footmate/pull/652): `오후 8시 30분 이후 15분 이내`에서 시각과 이동시간을 분리하고, 자연어 `초급`을 화면 단계와 같은 canonical `초중급`으로 해석합니다.
- 검색으로 선택한 지역·포지션·레벨을 상세 추천 근거·비교·새로고침·참가 포지션에 전달합니다. 기본 프로필은 덮어쓰지 않고 선택 경기의 검색 문맥을 별도 보존합니다.
- 규칙 기반 복구에서도 결과·조건 정정 제어는 중립적인 검색 용어를 사용하고, 해석 출처는 AI/기본 검색을 구분합니다. 적용 조건을 우선 표시하고 기본 프로필은 시각·접근성 이름 모두 참고 조건으로 구분합니다.
- 기존 초록·연두 톤을 유지하며 320px Home의 `전체 보기` 줄바꿈, 매칭 사실의 13px 가독성과 행 간격을 보완합니다.
- 로컬 회귀 계약·경계·구문·성능 예산 PASS. 브라우저 회귀·캡처·시각 기준 검토와 main 병합·운영 배포는 진행 중입니다. 기존 기준 이미지는 승인 없이 교체하지 않습니다.

## 2026-10-24 — Case Study 화면 근거와 AI 매칭 흐름 동기화

- 이전 매칭 개선 PR [#650](https://github.com/dohyunkimmm/footmate/pull/650)은 main `02a74bba39433f26694bcaf87e3fe1fae73730ff`에 병합됐고, 해당 커밋의 [운영 QA](https://github.com/dohyunkimmm/footmate/actions/runs/40013802631)는 Regression 36 / Browser E2E + axe / Production Smoke 모두 SUCCESS입니다. 아래 ‘변경 브랜치’ 기록은 당시 상태입니다.
- 최신 main QA의 모바일 Home 캡처로 Case Study 대표 이미지를 갱신하고, Home·Discover 와이어프레임을 맞춤 경기·근거 우선 배치와 AI 조건 해석·정정·선택적 조건 완화 흐름으로 맞춥니다. Figma 링크는 이전 원본이며 이번 코드 기반 와이어프레임과 구분합니다.
- AI 연결 응답·규칙 기반 복구·결과 없음·가격만 완화하는 기존 E2E에서 캡처를 남깁니다. 연결 응답 UI 캡처는 고정된 테스트 응답이며 실제 AI 모델 호출 검증은 Production Smoke와 구분합니다.
- 이번 이미지·문서 변경의 배포 상태는 해당 PR과 CI 결과를 기준으로 확인합니다. 사용자 매칭 효과·물리기기 재검증은 추가 실시하지 않았습니다.

## 2026-10-23 — 개인 → 경기 매칭 중심 개선 · 변경 브랜치

- 제품 중심을 AI 검색에서 개인과 경기의 매칭으로 정리. AI 조건 해석·규칙 기반 순위·사용자 참가 확정의 책임은 유지합니다.
- Home의 맞춤 경기 우선 배치, 카드의 맞는 점·확인할 점, 기본 검색 해석 출처, 사용자가 선택하는 조건 완화, 피드백 반영 전후 후보 설명을 구현했습니다. Discover는 적용 중인 AI 조건으로 적합도와 근거를 계산하며 수동 정렬·필터를 유지합니다.
- Case Study는 11개 섹션 구조·기존 6명 과업·검색 정확도 근거를 유지하며 매칭 설명과 미실시 사용자 검증 과제를 보강했습니다. 이미지에는 개선 전 캡처임을 명시했습니다.
- 로컬 기존 회귀 계약 22개, 추가 매칭 사실·등급 계약, 릴리스 식별자·AI 경계·성능 예산·Case Study 자산 버전·구문·diff 검사 통과. 로컬 브라우저는 실행 파일 부재 및 다운로드 403으로 미실시입니다. 기존 시각 기준 이미지는 변경하지 않았습니다.
- main 병합·배포·Production Smoke 및 사용자 가치 검증은 아직 완료가 아닙니다. [매칭 기준·추가 검증](MATCHING-DIRECTION.md)을 따릅니다.

## 2026-10-18 — AI 검색 해석·기본 모델 경계 정정

- Runtime PR [#637](https://github.com/dohyunkimmm/footmate/pull/637) · main `d392ad381f6ee1d35e947bff3414bbbff8f67465`: 브라우저 규칙 기반 복구에서 시간(저녁/밤·시각), 복합 금액, 지역·포지션 제외 표현을 보완. 추천 순위 소유권은 변경하지 않음.
- Runtime PR [#638](https://github.com/dohyunkimmm/footmate/pull/638) · main `3f5c855f1490a1025d0a59bc3ea6329187d6a89f`: 실제 Gateway 가용성에 맞춰 API 기본 primary를 `openai/gpt-5.4-nano`, fallback을 `openai/gpt-5.4-mini`로 변경(환경변수 재설정 가능). 자연어의 오전/오후 12시 및 제외 이후 명시된 포지션을 원문 기준으로 보정. AI는 검색 조건만 해석하고 실제 후보·순위·추천 이유는 규칙 엔진이 결정.
- Main CI: #637 [run 39067104801](https://github.com/dohyunkimmm/footmate/actions/runs/39067104801) completed/success. #638 [run 39068475971](https://github.com/dohyunkimmm/footmate/actions/runs/39068475971)에서 Regression 36 및 Browser E2E + axe는 success. Production HTTP Smoke는 이전 모델 `mini`를 primary로 고정한 검사 코드의 `Error: AI primary model`에서 중단돼 이후 AI inference/Chromium Production 검사는 실행되지 않음.
- 검증 경계: #638 시점에 정확한 Production 최종 QA 성공은 아직 입증되지 않았으므로 모델 연결 및 전체 Production Smoke 합격을 주장하지 않음. 운영 검증 코드의 primary/fallback 순서와 브라우저 검사·회귀 계약을 현재 API 기본값과 일치시킨 뒤 동일 SHA/운영 상태를 재검증해야 함.
- Scope: `/demo` AI 검색 및 규칙 기반 대체 검색만 변경. `/beta`, 결제/인증, 사용자 데이터, 현재 11개 섹션 Case Study의 구성과 평가 근거는 변경하지 않음.

## 2026-10-18 — Production AI 검사 정합성 복구 · #639

- QA/문서 PR [#639](https://github.com/dohyunkimmm/footmate/pull/639) · main squash merge `5309a8deb4ac6e76c6dd545d2c4a6444d5900579`. 운영 API의 primary `openai/gpt-5.4-nano` / fallback `openai/gpt-5.4-mini` 설정에 HTTP Smoke, AI inference, Production browser의 기대값을 일치시키고 원본 API 기본값과 검사 스크립트의 정합성 계약을 추가.
- 실제 [PR 검증 run 39077777285](https://github.com/dohyunkimmm/footmate/actions/runs/39077777285) completed/success: Regression 36, Browser E2E + axe, strict Production HTTP Smoke, 실제 Gateway 추론(`openai/gpt-5.4-nano`, `fallbackUsed=false`), Chromium 15건 및 release journeys 8건 PASS. 해당 검증은 `#639` PR SHA와 운영 URL의 조합이며, 병합된 새 main SHA의 Production 배포 상태는 별도 main QA와 대조해야 한다.
- 코드 범위: 검증 테스트·회귀 계약·역사적 릴리스 문서 및 현행/과거 Case Study 참조만 수정. AI 서버 구현, Demo/Beta 사용자 상태, 결제·인증·데이터베이스는 수정하지 않음.

## 2026-10-12~13 — Case Study 11개 섹션 전환 · 당시 변경 이력

- [#616](https://github.com/dohyunkimmm/footmate/pull/616) · merge `e8597e9f5870a449c63200bbfdf89bd5d594cca4`: 공개 `/`의 이전 9단계를 11개 섹션으로 재구성. 문제/리서치/페르소나/우선순위/IA/복구/화면/정책/AI/검증/회고로 분리하고 Demo 구현에서 재구성한 와이어프레임 5개·Figma 원본을 증빙으로 연결. 실제 베타 사용자 성과나 출시 효과를 주장하지 않음.
- [#617](https://github.com/dohyunkimmm/footmate/pull/617) · merge `098c96e441a952f0ff5ef27a429ebd85f5bf09fd`: 카드·펼침 UI·모바일 정책 표·와이어프레임 정리. [#618](https://github.com/dohyunkimmm/footmate/pull/618) · merge `fcc9e31cb76475b2fdc1a8451a65926310ee8095`: 1920px 화면 시각 위계·본문 폭 조정.
- [#619](https://github.com/dohyunkimmm/footmate/pull/619) · merge `ce75db785bb1809a6bfe2d5a4897a398940a658a`: 타이포그래피, 간격 및 모션 감소 대응. [#620](https://github.com/dohyunkimmm/footmate/pull/620) · merge `75c9ae2a39de00bef5192a8ec7b65a3441060182`: 당시 미사용 Case Study CSS 제거.
- 적용 경계: 이 항목은 위 PR의 당시 변경 사실이다. 현재 공개 섹션 구성/수용 기준은 [CASE-STUDY-ELEVEN-STAGES.md](CASE-STUDY-ELEVEN-STAGES.md), `index.html`, `src/case-study/nine-sections.{js,css}` 및 `tests/e2e/case-study-eleven-stages.spec.cjs`를 따른다. 과거 9/13단계 문서는 이력으로 보존하고 최신 Case Study UI 변경을 이 당시 코드로 되돌리지 않는다.
- 검증 경계: 사용자 과업 기록, 개발 QA, 계측 예정 KPI는 서로 다른 증거 수준이며 출시 성과·개선율의 인과를 임의로 주장하지 않는다.

## 2026-10-10 — Release App P0–P2 flow 개선·운영 검증 완료

- Scope: `/app` 신규/재방문 routing을 canonical session에 따라 Welcome/Setup → Home 또는 MY로 복귀. 기존 legacy `schedule` → MY 호환 유지; 명시적 체험 초기화는 별도 기능.
- P1 AI: Discover에서 AI 해석 레벨 정정과 AI 결과 0개 시 `afterTime → maxPrice → maxDistanceMin → position → region` 한 단계 완화 제공. 후보·순위·추천 이유의 deterministic ownership 유지.
- P2 MY: 진행 단계 중복 안내를 접기, 로컬 로그인은 `체험 계정`으로 명시, 샘플 취소·환불 안내 수정. 완료된 postgame Return 기록을 갖는 참가 경기는 이후 Home/Discover 추천에서 제외. 다음 경기 CTA와 기존 local records 유지.
- PR: [#577](https://github.com/dohyunkimmm/footmate/pull/577) squash merged `ddccd383d045ec5aee1340e339a486aff256c9b3` to main. `/beta`, `/beta/operator`, Case Study, 실제 PG/서버 연결 경계 불변.
- Pre-merge CI: [run 38050395821](https://github.com/dohyunkimmm/footmate/actions/runs/38050395821) completed/success: Regression 36, Chromium Browser E2E + axe, screenshot visual regression, typography, Mobile WebKit PASS; 특정 변경 화면 diff 검토 후 bounded tolerance 적용, PNG baseline 일괄 갱신 없음.
- Post-merge CI: [run 38050777170](https://github.com/dohyunkimmm/footmate/actions/runs/38050777170) completed/success. Regression / Chromium browser+axe / typography / Mobile WebKit PASS, Production Smoke Chromium **15 + 추가 8** PASS.
- Exact Production: Vercel `dpl_4zT1HeEfDv5jiwdTWckKvm1rbNQo` target production READY, alias `footmate-black.vercel.app` 및 SHA `ddccd383d045ec5aee1340e339a486aff256c9b3`를 main과 대조. 운영 `/app`에서 신규 Setup → Home, 재방문 Home·MY, AI 레벨 수정·시간 완화, Return 완료 경기 제외, 390px 가로 넘침 없음 확인.
- Boundaries: `/app`은 샘플 경기·브라우저 로컬 무료 참가/체험 계정이며 실제 PG·실제 환불 실행·기기 간 동기화·외부 analytics 미연동. 실제 브라우저 200% 배율 및 **이번 변경 이후의** 물리 기기 수동 QA는 미검증. 실사용 KPI 개선률 주장 없음.
- Documentation sync: [docs-only PR #578](https://github.com/dohyunkimmm/footmate/pull/578)에서 README / Release App / Product UX / docs index와 본 이력을 업데이트. Notion 내부 PRD·Service Flow·AI Workflow를 같은 기준으로 갱신하고 재조회로 저장 확인. 별도 docs-only PR/QA 병합 결과는 PR #578에서 추적.

## 2026-10-10 — Interactive Demo / Closed Beta 안내 및 포트폴리오 공개 검증 완료

- Scope: 현재 9단계 Case Study의 01에서 **Interactive Demo**(`/demo`: 샘플 경기 데이터, 실제 참가·결제 없음)와 **Closed Beta**(`/beta`: Supabase 서버 연결, 무료 참가·실제 결제 없음)로 이동하는 CTA를 구분. 430px 이하에서는 CTA를 세로 정렬. 9개 섹션·JTBD/IA/KPI·제품 및 Beta 서버 로직은 유지.
- Copy 경계: #572에서 Interactive Demo / Closed Beta 명칭 정렬, #573에서 Production Smoke CTA 기대 문구를 현재 표시와 일치시킴. #574에서 01 진입점과 README 문서 경로를 함께 정리.
- 최종 기능/문서 PR: [#574](https://github.com/dohyunkimmm/footmate/pull/574) · squash merge `4cb26cff41aa39526b67c4bbeee3f75fc5f7adce`.
- PR QA: [run 38024959175](https://github.com/dohyunkimmm/footmate/actions/runs/38024959175) · `completed/success` · Regression 36, Browser E2E + axe, Mobile Safari/WebKit PASS.
- Post-merge main QA: [run 38025392361](https://github.com/dohyunkimmm/footmate/actions/runs/38025392361) · `completed/success` · Regression 36, Browser E2E + axe, Production HTTP, AI inference, Chromium Smoke, Release Journeys PASS.
- Exact Vercel Production: deployment `dpl_JCT9odNoVLxBXtcit3hgjMaAtjCe` · SHA `4cb26cff41aa39526b67c4bbeee3f75fc5f7adce` · `READY` · official alias `footmate-black.vercel.app` verified.
- README sync: repository root `README.md`와 `docs/README.md`에 `/demo`, `/app`, `/beta`의 실제 연결 범위 반영. Case Study CTA와 문서 경계를 일치시킴.
- Measurement boundary: 8개 KPI는 측정 설계 상태이며 실제 Closed Beta 결과값이나 개선율을 주장하지 않음. 제품 패키지 릴리스 `v6.0.0` 및 Beta 운영 정책 변경 없음.

## 2026-10-08 — Case Study 9단계 가독성·근거 확인·모바일 QA 정리

- Scope: 리뷰어용 Case Study `/`의 9단계 표시·근거 확인·접근성 개선. Product Release App v6 기능·버전, Closed Beta 운영 절차와 사용자 성과 근거는 변경하지 않음.
- PR #541 · merge `34a0a4facaae25ea21e2d364592a98b03ee847c7`: 9단계 타이포그래피·가로폭·접근성 QA 보강, 운영 CTA 검사 문구를 승인 문구에 맞게 정정.
- PR #542–#544 · merge `45de258` / `fef3b53` / `f2c9696`: 기본 세로 스크롤은 유지하며 스크롤바 숨김. P3 Journey Map과 P9 여백 축소 후 P3의 줄바꿈 행 경계 정렬 보정.
- PR #545–#546 · merge `a795e5cc` / `290ad105`: 표·Journey Map의 읽기 크기 및 행·카드 정렬 개선. 대체 폰트, 텍스트 200% 확대·간격 설정 QA 강화. 우선순위·IA·예외 흐름과 근거 표시를 명확히 하고, 오래된 결제 실패 이미지는 실제 캡처로 오인되지 않는 복구 흐름 요약으로 대체.
- PR #547 · merge `c2939c78`: P3–P9 보조 카드의 강제 줄바꿈과 불필요한 여백 정리. Desktop MY 시각 테스트 2개의 표시 날짜만 안정화하며 실제 앱 시계·인증·참가 시간과 기존 이미지 기준은 유지.
- PR #548 · merge `c5e991212ba6770d7b104e1ba93f72494f5f80c3`: P1/P6 근거 이미지를 이름 있는 확대 대화상자로 확인하고 키보드 스크롤·Escape·포커스 복귀를 지원. P6 미리보기 밀도 개선, P7 모바일 QA 기록을 발견 문제·수정·점검 항목까지 세로로 표시, P8 제목 및 KPI 표 주변 여백 정리.
- Final main QA: SHA `c5e991212ba6770d7b104e1ba93f72494f5f80c3` · GitHub Actions run `37732608702` SUCCESS (Change Impact / Regression 36 / Browser E2E + axe / Production Smoke). 해당 SHA의 GitHub Vercel commit status는 success. 별도 수동 Production 전체 동작 확인이나 배포 파일 대조까지 수행했다고 주장하지 않음.
- Documentation sync: 9단계 문서 색인과 Case Study 시각 QA 검토 기준을 동기화. 실제 제품·Beta 기능/정책 및 장기 제품 사실은 바뀌지 않아 README, Release App, Beta Runbook, Notion의 기존 내용은 유지.

## 2026-10-07 — Release App 검토 가독성·탐색 안내 정리

- Scope: Product release 버전은 유지하면서 desktop reviewer context, Home/Discover 설명, Auth panel 전환, recommendation mismatch 안내와 visual fixture 안정성을 현재 구현에 맞게 정리.
- PR #519 · merge `31aa165f6dc59514bf2d42273ed26d347b13c16d`: Auth panel이 새 form으로 바뀔 때 heading에 focus하고 scrollTop을 0으로 복원. AI 검색 예시의 시간 표현을 `20시 이후`로 명확히 하고, 레벨 차이가 2단계 이상인 추천은 총점이 높아도 `경기 강도 차이 확인`으로 표시. social action이 없는 signup/recovery panel에는 provider status를 제거. visual fixture 날짜 표시는 고정하되 app clock/참가 timestamp는 고정하지 않음.
- PR #520 · merge `2fb385fbfd62e4437ecc1646e5b695d61358b486`: 960px+ desktop에 서비스 여정과 샘플/무료 참가 경계를 설명하는 review context를 추가하고 560px app canvas와 함께 읽히도록 composition을 조정. Home에 기본 추천 프로필 범위를 명시하고 desktop 추천/필터 label과 AI condition chip 가독성을 개선. Discover 결과가 0개일 때 personalization explanation을 숨겨 현재 결과와 상충하는 안내를 제거.
- Desktop QA: 1366 / 1440 / 1920px에서 560px app canvas, review context, horizontal lock을 검증하고 변경된 1440px release surfaces를 comparison-only Playwright visual baseline으로 확인.
- Post-merge main QA: #519 SHA run `37561830190` SUCCESS · #520 SHA run `37566932913` SUCCESS.
- GitHub commit status에서 두 SHA의 Vercel deployment status가 success임을 확인. 이 항목은 별도 수동 Production smoke 또는 exact deployment runtime 검증을 새로 주장하지 않는다.
- Documentation sync: README와 `RELEASE-APP.md`의 desktop composition, social-auth boundary, mismatch/zero-result 안내를 현재 Product 상태에 맞게 최소 동기화. Notion의 `FootMate Service Flow · Data Quality`, `FootMate 기능정의서 · AI Agent Workflow`, `FootMate AI 기능 확장 PRD`도 같은 장기 제품 사실로 동기화했고, 공개 포트폴리오 본문은 현재 경계와 충돌하지 않아 유지. Closed Beta 운영 절차는 변경하지 않음.

## 2026-10-05 — Case Study 근거 요약·읽기 효과 정리

- Scope: 리뷰어용 Case Study `/`의 버튼 표기, 화면 안 근거 요약, 짧은 읽기 효과. Product package release 버전은 변경하지 않음.
- p12 `8개 지표의 계산·관찰 기준 보기` 화살표를 다른 페이지와 같은 `↗`로 통일: PR #511 · merge `e234d03b086d86248f96f95fa09471d4d18b9ae7`.
- GitHub으로 바로 이동하던 9개 근거 버튼에 8종의 화면 안 요약 추가. 상세 GitHub 자료는 팝업 하단에 유지: PR #512 · merge `fa23abf53c6149ad765d4bdfa40bcb116def8d97`.
- 페이지 180ms, 팝업 160ms 표시 효과와 버튼 반응 추가. `prefers-reduced-motion`에서는 애니메이션·전환 비활성화: PR #513 · merge `0b1fe5e98c735b914da1c64b1c6256f609224737`.
- QA: Regression 36, Browser E2E + axe 통과. 근거 요약 열기·닫기·Escape·포커스 복귀, 모바일 320/390px, reduced-motion 동작 검증.
- Final PR QA: PR #513 · run `37265978676` · PASS.
- Verified Production runtime: `0b1fe5e98c735b914da1c64b1c6256f609224737` · Vercel `dpl_HWD59FpMGAj4Zjd2KLUQK5nRG56Q` · READY · https://footmate-black.vercel.app/.
- Sync verification: Production CSS와 main 생성 CSS 일치, 원본 `editorial-finish.css` 반영 확인.
- Supersession: 중복 PR #509는 #511로 이미 반영되어 종료. 기존 PR·commit 기록은 보존.
- Documentation cleanup: README의 Case Study 수정·QA 경계를 실제 관리 방식으로 정정. 이 문서 정리는 docs-only 변경이며 runtime 재배포를 요구하지 않음.

## 6.0.0 — Unified Release App

- Status: verified Release App lifecycle completion / recovery / visual QA closure.
- Home / 경기 찾기 / MY 3-tab IA를 canonical navigation으로 유지하면서 joined-match ownership을 MY로 통합.
- legacy `schedule` session은 MY로 migration.
- Home은 discover / upcoming / matchday / postgame lifecycle의 다음 primary action을 제공하고, Return 저장 완료 후 완료 상태에서 `다음 경기 찾기`로 다시 연결.
- `/app`의 simulated payment 사용자 UI를 제거하고 무료 참가 확인으로 전환; 참가 정보 유실·확정 오류는 오류 안내 + 재시도 + 경기 다시 선택으로 복구하며 real PG 미연동 경계 유지.
- Desktop Detail / Join / MY는 Auth에서 검증한 single-surface hierarchy를 유지하고, MY major section은 현재 경기·경기 후 행동 → 저장 경기 → 내 정보 → 설정 순서의 spacing hierarchy로 정리.
- Matchday와 postgame Return의 canonical surface를 MY로 통합.
- Visual Regression: 390px Home lifecycle / Join / MY Matchday / MY postgame, 320px compact Join을 Ubuntu/Chromium approved baseline과 comparison-only `toHaveScreenshot()`으로 검증. MY Matchday visual fixture는 Playwright clock을 고정해 실행 시각 의존성을 제거.
- Accessibility: 390px Detail / Join / MY axe 계약 + Mobile Safari/WebKit 회귀 검증.
- Matching/ELO, deterministic recommendation, Discover filter/sort, save/compare ownership은 유지.
- `/beta`와 `/beta/operator`의 Supabase connected capability는 별도 validation/operator surface로 유지.
- Initial runtime PR: #442 · merged SHA `51e86c5cc1ab13c324d10d785bdf5de43d3e7c59`.
- QA contract closure PR: #445 · runtime/UI 변경 없이 stale Production smoke assertion과 non-deterministic Matchday visual fixture만 정정.
- Launch visual polish PR: #450 · product/runtime baseline `9edd52abab831a05f22f186c5c7de469129ba605`. 경기 후 평가 선택 상태, enabled 저장 CTA, 저장 완료 chip, 무료 참가 안내 warning의 색감만 최소 조정하고 기존 Home / MY 경기 카드와 disabled CTA의 승인 visual baseline은 유지.
- Visual Regression: #450 PR QA에서 approved Ubuntu/Chromium baseline comparison PASS · baseline 교체 없음. 320 / 375 / 390 / 430px responsive, axe, Mobile Safari/WebKit gate PASS.
- Post-merge main QA: FootMate QA run `36979890717` SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS.
- Exact Vercel Production: deployment `dpl_6niobRbCNHPPtjTQGT1dE6c8w2XJ` · SHA `9edd52abab831a05f22f186c5c7de469129ba605` · READY · official alias `footmate-black.vercel.app`.
- Production verification: exact Production에서 core 15 tests PASS + Release App journey 8 tests PASS. Home / Discover / Detail, free Join → Success → MY, legacy Schedule → MY migration, Matchday, Return lifecycle, 320 / 375 / 390 / 430px overflow/accessibility 계약을 확인.
- QA hardening: Production release behavior gate가 Join 오류 복구와 Return 완료 → Discover handoff를 직접 실행하도록 확대하고, HTTP smoke의 lifecycle 구현 문자열 의존을 제거. 통합 QA workflow는 README/docs/markdown-only 변경에서 heavy browser/visual job을 skip하고 Release App contract는 유지.
- Documentation sync: root README와 `RELEASE-APP.md`의 durable 제품 설명은 현재 상태와 충돌하지 않아 유지하고, 이 Release History의 current Production/runtime 사실만 #450 기준으로 동기화. Closed Beta Runbook은 운영 절차 변경이 없어 유지. 이번 변경은 visual polish이므로 Notion sync 대상이 아니며, Case Study는 별도 프로젝트라 sync하지 않음.
- Case Study P0/P1 visual hierarchy closure: PR #453 · runtime baseline `73fb999de4661bdb989c467b42a55d15f186aa87`. 13-section IA와 승인 카피·제품 사실·route는 유지하면서 02 Problem의 원인→핵심 문제 구조, 06/07/09 Product UI evidence 비중, 10 Recovery 2-up evidence, 12 Validation Metric/QA Evidence 분리, 01 Overview proof hierarchy와 13 final Interactive Demo CTA를 정리.
- Final PR QA: FootMate QA run `37075858806` SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Case Study 13-section desktop/mobile rough visual audit PASS · Mobile Safari/WebKit PASS.
- Post-merge main QA: FootMate QA run `37076363576` SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS.
- Exact Vercel Production: deployment `dpl_Bnk4WZo7k3tH4JzRwSMQkVkJz4cH` · SHA `73fb999de4661bdb989c467b42a55d15f186aa87` · READY · official alias `footmate-black.vercel.app`.
- Production verification: exact Production HTTP smoke PASS · AI inference PASS · Chromium Production smoke PASS · Release App journey PASS. Case Study visual 변경은 제품 도메인/상태/연동 계약을 변경하지 않음.
- Documentation boundary: README의 13-section 서비스 기획 설명에 시각 구조 원칙만 최소 동기화. Closed Beta Runbook과 Notion은 운영/기능 계약 변경이 없어 유지.


이 문서는 현재 public branch의 **검증된 durable release 사실**을 기록한다. 일시적인 Preview 취소·quota·대기 상태는 누적하지 않는다. docs-only merge로 moving `main`이 바뀌어도 각 release의 product/runtime baseline과 exact Production SHA는 별도로 유지한다.

## Interactive Demo flow naturalness closure · 2026-10-01

- Scope: Interactive Demo의 기존 기능·도메인 상태 머신은 유지하면서 첫 setup 완료 안내, 실제 진입 surface를 복원하는 Detail back, 사용자 판단 중심의 Detail/Checkout/Matchday/Return 카피, MY 저장 경기 재진입, 체험 버전 안내 통합으로 prototype-like flow를 줄임
- Runtime PR: #415 · merged SHA `767700291fad8f8959028dd028e3853da8982d41`
- Accessibility hotfix: #416 · Discover filter draft-status의 초기 색 대비를 상호작용 전에 안정적으로 설치하고 CSS performance budget을 유지 · merged SHA `63ac31d59099a480337cd73787dcf0ebd24224dc`
- Product/runtime baseline: `63ac31d59099a480337cd73787dcf0ebd24224dc`
- P0/P1/P2 boundary: Home/Discover/AI의 기존 IA와 deterministic recommendation ownership은 유지; MY의 saved-match destination, Matchday/Return user-facing labels, consolidated experience disclosure를 추가. 기존 Discover zero-result recovery는 유지했으며 별도 personalized “유사 경기 3개” 확장은 추가하지 않음
- Data/integration boundary: `/app` match/capacity/participant data는 sample records, auth/payment/capacity/notification provider는 deterministic mock, persistence는 browser local state라는 기존 경계를 유지하며 실제 연동처럼 표현하지 않음
- Visual Regression: #415에서 변경된 Detail/Checkout/MY/Matchday surfaces의 Ubuntu/Chromium approved baseline을 갱신한 뒤 comparison-only `toHaveScreenshot()` PASS; #416 PR QA에서도 Browser E2E + axe + Visual Regression PASS
- Final hotfix PR QA: FootMate QA #2319 · run `36784796599` · Regression 36 PASS · performance budget PASS · Browser E2E + axe / visual gates PASS · Mobile Safari/WebKit PASS
- Post-merge main QA: FootMate QA #2320 · run `36785731361` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Visual Regression PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Production verification: exact Vercel deployment wait PASS · exact Production HTTP smoke PASS · AI inference PASS · Chromium Production smoke PASS
- Exact Vercel Production: `dpl_BSHizVH8jLpNSARcCgMMg5NoWETu` · SHA `63ac31d59099a480337cd73787dcf0ebd24224dc` · READY · official alias `footmate-black.vercel.app`
- Documentation sync: root README와 이 Release History를 현재 flow/Production 사실로 동기화. Closed Beta 운영 절차는 변경되지 않아 Runbook 유지; Notion과 별도 Case Study 프로젝트는 핵심 IA·제품 설명을 materially 바꾸는 변경이 아니므로 sync하지 않음

## Interactive Demo P1 secondary visual hierarchy closure · 2026-09-28

- Scope: Discover 임시 filter를 neutral secondary control로 낮추고, Detail decision nested card를 평탄화하며 decision microcopy를 11px readability floor로 정리하고, Matchday / MY의 equal-weight elevation을 줄여 현재·primary action hierarchy를 선명하게 조정
- Runtime PR: #386 · merged SHA `b57e97bd1a540cb095e248fe34930c5727a326aa`
- Product/runtime baseline: `b57e97bd1a540cb095e248fe34930c5727a326aa`; P0 Home focal hierarchy, Checkout execution CTA, shell continuity, IA·routes·copy·state model·Matching/ELO ownership·persistence·39-screen baseline 유지
- Performance boundary: first-party CSS `204,975 / 205,000` bytes 유지, first-party asset request 24 유지, 신규 stylesheet / network request 추가 없음
- Visual Regression: pinned Ubuntu/Chromium에서 Discover·Matchday/check-in·MY의 의도된 Product baseline만 갱신하고 temporary baseline generator workflow를 제거한 뒤 comparison-only `toHaveScreenshot()` 재실행; PR Interactive Demo White Surface QA run `36416233311` · SUCCESS, post-merge run `36416971373` · SUCCESS
- Final PR QA: FootMate QA run `36416233308` · SUCCESS · Regression 36 PASS · Chromium Browser E2E + axe / beta / AI / recovery / visual gates PASS · Mobile Safari/WebKit PASS; P1 semantic contract를 permanent QA gate로 유지
- Post-merge main QA: FootMate QA run `36416971482` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Production verification: exact HTTP smoke PASS · exact AI inference PASS (`openai/gpt-5.4-nano`, `fallbackUsed=true`) · Chromium Production smoke 13/13 PASS · official `footmate-black.vercel.app`의 `/demo`와 `/demo?mode=portfolio` HTTP 200 · 최근 24시간 Vercel runtime error 없음
- Exact Vercel Production: `dpl_3NYpm2XYGAeU1152BzbSwJn5Mq71` · SHA `b57e97bd1a540cb095e248fe34930c5727a326aa` · READY · official alias `footmate-black.vercel.app`
- Documentation boundary: visual polish / QA closure이므로 README·Closed Beta runbook·Notion·별도 Case Study 프로젝트의 제품 설명은 변경하지 않음

## Interactive Demo visual consistency completion · 2026-09-28

- Scope: Welcome / Setup, Auth → Checkout → Success, Schedule secondary / empty states, loading / empty / pending / failure / canceled / fallback 상태를 승인된 Interactive Demo visual language로 통일하면서 IA·route·product behavior·Matching/ELO ownership은 유지
- Runtime PR: #373 · merged SHA `463f04546a583526a37b5d4ddd7b063a6e3a2d55`
- Product/runtime baseline: `463f04546a583526a37b5d4ddd7b063a6e3a2d55`
- Visual Regression: GitHub Actions와 동일한 pinned Ubuntu/Chromium 환경에서 Product visual baseline 52/52 갱신 후 별도 comparison-only `toHaveScreenshot()` 52/52 PASS; `visual-consistency-v4`를 permanent Interactive Demo QA gate에 포함
- Final PR QA: Interactive Demo White Surface QA run `36358981291` · SUCCESS; FootMate QA run `36358981262` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Current main follow-up QA: FootMate QA run `36369768824` · SUCCESS · visual baseline gates PASS · Production Smoke PASS; #374/#377은 QA 안정화 범위이며 runtime visual/product contract는 변경하지 않음
- Production verification: official `footmate-black.vercel.app`의 `/demo`와 `/demo?mode=portfolio` HTTP 200 · exact HTTP smoke PASS · exact AI inference PASS (`openai/gpt-5.4-nano`, `fallbackUsed=true`) · Chromium Production smoke 13/13 PASS · 최근 24시간 Vercel runtime error 없음
- Exact Vercel Production: `dpl_EZgiLRB1kT51ZThnyF7FAMHTBFT1` · SHA `463f04546a583526a37b5d4ddd7b063a6e3a2d55` · READY · official alias `footmate-black.vercel.app`
- Documentation boundary: 이번 변경은 visual consistency / QA closure이므로 README·Closed Beta runbook·Notion·별도 Case Study 프로젝트의 제품 설명을 변경하지 않음

## Interactive Demo Home → Discover IA closure · 2026-09-25

- Scope: Home을 AI Match Assistant entry + compact personalization으로, Discover를 AI/search result exploration + condition edit/filter/sort/full list로 분리하고 Home example suggestion이 실제 Assistant 실행 후 Discover 결과로 이어지도록 정리
- Dedup / role boundary: Home For You는 1–2개 compact match만 노출하고 동일 경기의 별도 중복 추천 section을 제거; Detail은 match decision, Join은 joined-match status, MY는 profile/settings 역할을 유지
- Runtime PR: #269 · merged SHA `30edf47fa69dec7f2d72d68c4ff99096a3f91bee`
- Product/runtime baseline: `30edf47fa69dec7f2d72d68c4ff99096a3f91bee`
- State ownership: `src/app/ai-match-assistant.js`가 AI query/constraints/Home→Discover handoff를 소유하고, `src/app/discovery.js`는 discovery filter/sort/result-list state를 소유; deterministic recommendation ranking과 기존 domain boundary 유지
- Final post-merge QA: Interactive Demo White Surface QA #166 · run `36077898939` · SUCCESS; actual Ubuntu/Chromium `toHaveScreenshot()` comparison PASS
- Main QA: FootMate QA #1298 · run `36077898926` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS (`openai/gpt-5.4-nano`, `fallbackUsed=true`) · Chromium smoke 7/7 PASS
- Exact Vercel Production: `dpl_Anb95bVzLPwBAV1t5FzGio4zhvWy` · SHA `30edf47fa69dec7f2d72d68c4ff99096a3f91bee` · READY · official alias `footmate-black.vercel.app`
- Documentation sync: root README와 `V5.1-AI-MATCH-ASSISTANT.md`를 현재 Home/Discover IA·state ownership으로 동기화하고 관련 FootMate Notion 프로젝트/Flow 문서를 같은 제품 계약으로 갱신; Closed Beta runbook은 운영 절차 변경이 없어 유지
- Case Study boundary: FootMate 프로젝트에서는 Case Study를 직접 수정하지 않으며, 이번 IA/핵심 flow 변경으로 별도 Case Study 프로젝트의 설명·대표 화면 sync가 필요함

## Case Study reader cleanup closure · 2026-09-25

- Scope: Case Study 02–13의 desktop 여백·밀도와 독자용 문체를 정리하고, 내부 `PBL` 표현 제거, 08 상태 보존 맥락 통합, 09 legacy evidence-mode 외부 링크 제거, 12 KPI `계산 기준 · A ÷ B` 표기, green 강조의 의미 기준을 반영
- Runtime PR: #268 · merged SHA `6a7150e765309a72affda03380fabf8601d3c978`
- Preserved boundary: 13-section IA, Interactive Demo / Closed Beta 제품 로직, API·데이터·state machine, 실제 사용자 성과·KPI 결과에 대한 미검증 경계 유지
- Evidence sync: `SERVICE-PLANNING-EVIDENCE.md`와 `USER-TEST-EVIDENCE.md`는 같은 교육과정을 수강한 교육생 6명, 계산 기준 용어, 검증 범위와 해석 한계로 동기화
- Final post-merge QA: FootMate QA #1250 · run `36042231747` · SUCCESS
- QA details: Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- Documentation sync: root README · `docs/README.md` · `CASE-STUDY-COPY-QA.md`를 #268의 reader-facing 표현 기준에 맞춰 정리; Closed Beta runbook과 AI architecture는 기능·운영 계약 변경이 없어 유지
- Notion boundary: 공개 FootMate 대표 프로젝트 페이지는 main SHA `6a7150e765309a72affda03380fabf8601d3c978`, #268 범위와 main QA #1250까지 동기화

## Interactive Demo Home initial viewport density closure · 2026-09-24

- Scope: Interactive Demo Home 진입 직후의 과도한 vertical scroll을 줄이기 위해 standalone max 560px shell의 greeting·추천 context·AI Match Assistant·section heading·personalization explanation density를 압축
- Root cause: Product shell은 max 560px로 고정되어 있지만 일부 Home density 규칙이 browser viewport breakpoint에 묶여 있어 shell보다 넓은 viewport에서 상단 카드 stack이 불필요하게 다시 확장됨
- Runtime PR: #265 · merged SHA `f18da024038ef0260b1e3a8af25221b0d5f21be7`
- Product/runtime baseline: `f18da024038ef0260b1e3a8af25221b0d5f21be7`
- Geometry contract: 390×844에서 첫 추천 match가 persistent bottom navigation 위에 의미 있게 노출되도록 `firstCardTop <= 600` 및 `navTop - firstCardTop >= 120`; 601px viewport에서도 fixed 560px shell compactness와 no-horizontal-overflow를 별도 regression으로 고정
- Preserved boundary: IA·copy·AI core emphasis·44px touch target·bottom navigation·routes·state machines·deterministic recommendation·Matching/ELO ownership·Product `/demo`·Portfolio `/demo?mode=portfolio`·39-screen baseline·v5.2.0 release identity 유지
- Performance boundary: first-party asset request budget 24/24 유지
- Final PR QA: Interactive Demo White Surface QA #120 · run `36005724651` · SUCCESS · actual Ubuntu/Chromium `toHaveScreenshot()` comparison 20/20 PASS; FootMate QA #1217 · run `36005724905` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Final post-merge QA: Interactive Demo White Surface QA #121 · run `36006648149` · SUCCESS; FootMate QA #1219 · run `36006647616` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Product Visual Regression PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS (`openai/gpt-5.4-nano`, `fallbackUsed=true`) · Chromium smoke 7/7 PASS
- Exact Vercel Production: `dpl_2QZVYSvd2WvtGn2fwRMSsYtBjw5L` · SHA `f18da024038ef0260b1e3a8af25221b0d5f21be7` · READY · official alias `footmate-black.vercel.app`
- Documentation boundary: README·Closed Beta runbook·AI architecture는 기능/운영 계약이 바뀌지 않아 중복 수정하지 않음; Case Study는 별도 프로젝트 경계를 유지하며 이번 FootMate 변경에서 직접 수정하지 않음

## Interactive Demo core AI / auth flow / desktop Schedule polish closure · 2026-09-24

- Scope: setup의 visible `수비`를 `수비수`로 정리하고, Home `AI Match Assistant`를 Interactive Demo의 핵심 focal feature로 강화하며, Google/Kakao connected login 안내를 사용자 언어로 정리하고, 로그인 입력 표기를 `아이디`로 통일
- Auth flow: signup / 아이디 찾기 / 비밀번호 찾기 subpanel의 뒤로가기는 먼저 Login으로 복귀하고, Login의 뒤로가기는 참가를 시작한 Detail로 복귀하며 이후 기존 originating surface 복귀 contract를 유지
- Desktop Schedule: stable max 560px shell을 유지한 채 joined Schedule / Matchday operational summary의 density를 압축하고 1440×900 첫 viewport geometry contract를 추가
- Runtime PR: #258 · merged SHA `8a58980ae9982f4361d5e755ad10a8ab9d763429`
- Product/runtime baseline: `8a58980ae9982f4361d5e755ad10a8ab9d763429`
- Preserved boundary: canonical position 값 `DF`, deterministic recommendation / Matching / ELO ownership, OAuth callback/provider behavior, Product `/demo`, Portfolio `/demo?mode=portfolio`, 39-screen baseline, v5.2.0 release identity 유지
- Visual Regression: 검수한 Ubuntu/Chromium CI actual만 Product 승인 baseline으로 반영한 뒤 임시 baseline 갱신 workflow를 제거하고 comparison-only `toHaveScreenshot()` gate를 복원해 최종 PASS 확인
- Final PR QA: Interactive Demo White Surface QA #107 · run `35990681270` · SUCCESS; FootMate QA #1188 · run `35990681350` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Product Visual Regression PASS · Mobile Safari/WebKit PASS
- Final post-merge QA: Interactive Demo White Surface QA #109 · run `35994113694` · SUCCESS; FootMate QA #1193 · run `35994113731` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Product Visual Regression PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS (`openai/gpt-5.4-nano`, `fallbackUsed=true`) · Chromium smoke 7/7 PASS
- Exact Vercel Production: `dpl_29vaTcjJnP4MSJWxoxaTmmhJD26X` · SHA `8a58980ae9982f4361d5e755ad10a8ab9d763429` · READY · official alias `footmate-black.vercel.app`
- Documentation boundary: README·Closed Beta runbook·AI architecture 문서는 기능/운영 계약이 바뀌지 않아 중복 추가하지 않음; Case Study는 별도 프로젝트 경계를 유지하며 이번 FootMate 변경에서 직접 수정하지 않음

## Interactive Demo Visual Finish P0–P2 closure · 2026-09-24

- Scope: standalone Interactive Demo의 최종 visual ownership을 `src/app/design-system-v2.css`로 통합하고, decision-support typography·surface/elevation·accent hierarchy·loading/empty/fallback/recovery state language·절제된 interaction motion을 정제
- Runtime PR: #252 · merged SHA `784ec086f9d84b16fcbf37abd4a776478827a980`
- Product/runtime baseline: `784ec086f9d84b16fcbf37abd4a776478827a980`
- Preserved boundary: Product 560px shell, IA·copy·routes·state machine·deterministic recommendation behavior, Portfolio/embed compatibility, v5.2.0 release identity, AI loading/fallback semantic visual contracts 유지
- Performance boundary: 별도 finish stylesheet request를 추가하지 않고 기존 first-party request budget 24/24 유지
- Visual Regression: 검수한 Ubuntu/Chromium CI actual을 Product 승인 baseline으로 반영한 뒤 `toHaveScreenshot()` comparison PASS; Case Study runtime/files/baselines는 최종 PR diff에서 제외
- Final PR QA: Interactive Demo White Surface QA #91 · run `35980404685` · SUCCESS; FootMate QA #1164 · run `35980404652` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Product Visual Regression PASS · Mobile Safari/WebKit PASS
- Final post-merge QA: Interactive Demo White Surface QA #92 · SUCCESS; FootMate QA #1165 · run `35981204805` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Product Visual Regression PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS (`openai/gpt-5.4-nano`, `fallbackUsed=true`) · Chromium smoke 7/7 PASS
- Exact Vercel Production: `dpl_BCHva4gFZz7JgJhsetVU1NJpfNcL` · SHA `784ec086f9d84b16fcbf37abd4a776478827a980` · READY · official alias `footmate-black.vercel.app`
- Documentation boundary: README·Closed Beta runbook·AI 문서는 기능/운영 계약이 바뀌지 않아 중복 추가하지 않음; Case Study는 별도 프로젝트 경계를 유지하며 이번 FootMate closure에서 직접 수정하지 않음

## Case Study AI preview emphasis / spacing closure · 2026-09-24

- Scope: Case Study cover의 AI Match Assistant 정적 프리뷰 강제 높이를 해제해 상태 카드 아래 과도한 공백을 제거하고, `NEW` 배지와 `AI 기능 추가` 캡션으로 신규 AI 기능을 즉시 식별 가능하게 함
- Runtime/Product boundary: Case Study 13-section IA·본문 순서·Interactive Demo 동작·AI 추천/가드레일 로직 변경 없음
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

## Product hardening 11–20 closure · 2026-09-24

- Scope: Product release 5.2.0 정합성, pure deterministic recommendation domain, white-first CSS/runtime patch ownership 정리, Playwright retry 0 / `forbidOnly`, exact Production UI contracts, Mobile Safari/WebKit gate, dedicated live-region ownership, pinned QA toolchain, byte/asset/readiness budgets, white-first mobile `theme-color` 정합화
- Runtime PR: #241 · merged SHA `8f06f5969083b2d014c8b0449ed5befab90a648b`
- Product/runtime baseline: `8f06f5969083b2d014c8b0449ed5befab90a648b`
- Final post-merge QA: FootMate QA #1110 · run `35952503452` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Product Visual Regression PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS (`openai/gpt-5.4-nano`, `fallbackUsed=true`) · Chromium smoke 7/7 PASS
- Exact Vercel Production: `dpl_EZuMxfoCriRy1FT7W2cs4RX3qhum` · SHA `8f06f5969083b2d014c8b0449ed5befab90a648b` · READY · official alias `footmate-black.vercel.app`
- Preservation: 기존 Interactive Demo 1–10 polish, Case Study 13-section public IA/content/release surface, Closed Beta integrations, AI connected/fallback/HITL boundaries, routes와 compatibility aliases 유지
- Superseded branch: #239는 #241 완료 후 duplicate implementation을 남기지 않기 위해 merge 없이 closed
- Documentation boundary: README·Closed Beta runbook·AI 문서는 기존 계약이 그대로 정확해 중복 추가하지 않음. 공개 FootMate Notion 페이지의 reviewer-facing QA 문구는 #241 closure로 동기화했으며 Case Study sync는 불필요

## Case Study section label / preview title correction · 2026-09-23–24

- #225 merged at `0f25ab4c296de059ad876f48ee30c57020c32e65`: story H2 English copy and TOC subtitle wrapping.
- #226 merged at `c03a8fccd1802fc9d8c28d9d6e033687b98651bc`: English applies to section labels/kickers; story H2 restored to Korean. This supersedes #225's heading-language change.
- #228 keeps 13 sections and Korean body copy while revising the planning narrative and returning TOC subtitles to a single line.
- #243 merged at `9dc82b93ee59fd877ecada0f64b1de5ef670370c`: #1 cover label을 `Overview`로 정리하고 desktop topbar·browser title을 `FootMate · Case Study`로 통일; 13개 섹션·한국어 본문·Product/Interactive Demo runtime은 변경하지 않음.
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
- Documentation: README·문서 인덱스·서비스 기획 근거 및 Notion 프로젝트/PRD 동기화; Notion의 과거 16-section·OAuth 미연동 일반화 표기는 현재 13-section과 Interactive Demo/Beta 경계로 수정
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
- Exact Production QR path: served `/src/beta/operator-mfa.js`에서 raw `<svg>` TOTP 응답을 `data:image/svg+xml`로 normalize하며 QR 미사용 시 수동 TOTP 설정 키 fallback을 유지
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

### Interactive Demo visual polish closure · 2026-09-22

- Scope: Interactive Demo `/app`의 screen/state visual polish audit · 390px mobile + 1440px desktop에서 viewport당 21개 대표 상태, 총 42개 rendered state 확인
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

### Interactive Demo design-system / visual regression closure · 2026-09-22

- Design-system baseline PR: #188 · Interactive Demo UX/design-system baseline을 보강하면서 IA, copy, routes, feature behavior, sample data, internal release identifier는 유지
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

### Interactive Demo UI/UX completion · desktop visual baseline closure · 2026-09-22

- State hierarchy runtime PR: #193 · Discovery zero-result, AI loading/fallback/empty, participation pending/failure/canceled의 시각 hierarchy를 정리하면서 기존 state behavior·IA·copy·routes를 유지
- Decision-flow desktop/mobile polish PR: #194 · 1440px 제품 canvas와 Detail/Checkout desktop 2-column hierarchy, floating/sticky CTA, Success width/CTA 정렬, 430px 이하 recovery CTA stack을 보강
- Desktop visual baseline PR: #196 · Home/Discover 1440px 2-column density, high-frequency micro label 11px 정규화, 1440px Detail/Checkout/Success exact screenshot baseline을 추가
- Exact Interactive Demo screenshot coverage: 320px context actions · 390px AI card · 1440px Detail · 1440px Checkout · 1440px Success
- Comparison contract: GitHub Actions Ubuntu/Chromium에서 `toHaveScreenshot()` + `maxDiffPixels: 0`; 신규 desktop baseline은 CI actual을 검토한 뒤 expected로 승인하고 동일 환경에서 실제 0-diff comparison PASS 확인
- Desktop geometry contract: 1440px Home/Discover 2-column density, card width, horizontal overflow 검증; desktop decision flow는 960px product canvas 기준
- Mobile preservation: responsive 320/375/390/430px, recovery CTA stacking, 390px decision micro-label readability regression 유지
- PR #196 QA: FootMate QA #727 · run `35733324000` · Regression 36 PASS · Browser E2E + axe + Product/Case Study visual baseline PASS
- Post-merge main QA: FootMate QA #728 · run `35733829361` · SUCCESS · Regression 36 PASS · Browser E2E + axe + visual baseline PASS · Production Smoke PASS
- Exact Production smoke: HTTP PASS · AI inference PASS · Chromium PASS
- Current product/runtime baseline: `3cd79312244dbdfbcdcea08540f68cea5e7ae375`
- Exact Vercel Production: `dpl_Ghe1PXNtPUXm7PWVPKxekPfXTaJS` · SHA `3cd79312244dbdfbcdcea08540f68cea5e7ae375` · READY · production aliases 반영 · alias error 없음
- Case Study visual regression은 별도 approved baseline gate를 유지하며 이번 Interactive Demo baseline 확장과 함께 main Browser E2E gate에서 PASS
- Preservation: Matching/recommendation ownership, auth/payment state behavior, sample data, 16-section Case Study IA, internal release identifier 변경 없음
- Documentation sync: README / Release History / Case Study Validation과 관련 Notion FootMate 문서를 current visual QA 사실에 맞춰 후속 sync; Closed Beta 운영 절차는 변경되지 않아 `docs/BETA-PILOT-RUNBOOK.md`는 수정하지 않음
- Render backup: 이번 final UI/UX closure에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment

### Interactive Demo release-flow / Design System v2 correction closure · 2026-09-23

- Scope: Product Flow review에서 확인된 8개 QA 항목과 Design System v2 coherence를 정리하면서, 요청되지 않았던 1040px desktop 확장과 2-column composition을 제거하고 Interactive Demo의 stable max 560px shell을 복구
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
- Render backup: 이번 Interactive Demo correction에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment

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
- Ownership boundary: feature runtime 8개 모듈은 direct `localStorage`와 `footmate:v4:*` key ownership을 갖지 않으며 `tests/contracts/connected-platform.contract.mjs`가 이를 Regression gate에서 강제
- Infrastructure boundary: `src/platform/infrastructure/storage.js`가 canonical `footmate:*` provider, legacy promotion/reconciliation, rollback mirror와 browser compatibility bridge를 단독 소유
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
- Render backup: 이번 ownership closure에서는 재검증·재배포하지 않음; Vercel이 공식 Production이며 Render는 backup/alternate deployment로 관리
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

v4.x → v5.0은 인터랙티브 서비스 기획 프로토타입의 단계적 제품/아키텍처 진화다. v5.1에서는 AI Match Assistant의 Vercel AI Gateway inference가 실제 Production에서 검증되었다. v5.1.1에서는 AI primary path, bounded recovery, state consistency와 request guard를 강화했고, release-readiness 단계에서 `/beta`의 Supabase Auth·member profile·match catalog·position capacity·participation 및 `/beta/operator`의 allowlisted 경기/참가자 운영 경로를 실제 backend에 연결했다. 이후 Must hardening에서 network/offline recovery, minimal audit, account deletion, data-freshness boundary를 추가했다. 현재 Closed Beta는 account recovery·취소 마감·connected check-in·operator completion·DB-backed in-app notification·Resend transactional email에 더해 Realtime refresh, reminder, waitlist, actual Beta match ranking/feedback, provider-aware Google/Kakao OAuth UI, Operator TOTP MFA, opt-in Web Push, Supabase Storage media까지 연결되어 있다. transactional email과 Web Push outbox는 server worker/Cron이 처리하고, email은 signed Resend webhook으로 final delivery state를 회수한다. 현재 `/demo`의 경기 데이터와 추천 순위는 sample records + deterministic recommendation engine이 Source of Truth이며 `/beta`는 별도의 connected data path다. 실제 PG와 external analytics는 연결하지 않았고, Google/Kakao 실제 로그인과 device-level Web Push 브라우저/OS 표시는 2026-09-22 Production 수동 QA를 완료했다. OAuth provider credential/config와 사용자의 브라우저/OS 권한은 해당 기능이 동작하기 위한 운영 의존성으로 유지된다.

GitHub commit history는 historical repository data로 유지되며 current product surface와 구분한다.
