# FootMate 실제 서명 JWT · 운영자 MFA QA 실행 안내

> 상태: **실제 계정 실행 전 준비 완료**. 이 문서는 자동 브라우저 모의 JWT 통과 기록이 아닌 **Supabase Auth에서 직접 발급한 서명 JWT**를 검증하는 절차입니다. 이 문서/PR/CI는 실계정 실행 완료를 뜻하지 않습니다. [보안 QA 이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)을 실행 증빙 전에는 닫지 않습니다.

## 사전 조건

- 별도로 승인된 **테스트 전용 일반 사용자**와 **테스트 전용 운영자** 2개. 기존 고객/운영자의 비밀번호, 인증 앱, 개인 계정 사용 금지. 테스트 운영자는 사전에 정식 `public.operators` 멤버로 등록되어야 하며, TOTP 요소 1개가 `verified` 상태여야 합니다. 이 스크립트는 계정을 만들거나 권한을 부여하지 않습니다.
- FootMate 운영 Supabase 프로젝트 `iihitfjphowjplxzfxtn`. 연결 URL은 호스트가 정확히 일치해야 하며 TLS 필수. 서비스 역할 키/비밀키를 사용하지 않고 공개 publishable key만 사용합니다.
- Node.js 24 이상. 인증정보는 관리되는 **비공개 로컬 세션/비밀 저장소**의 환경변수로만 전달합니다. 채팅·커밋·GitHub Actions 로그/아티팩트·이슈·터미널 명령 기록에 JWT/비밀번호/TOTP를 기록하지 마세요.
- 테스트 전용 계정의 **현재** 6자리 TOTP를 입력하고 즉시 실행해야 합니다. 인증 코드는 사용 후 폐기됩니다. 계정 소유자 동의 및 검증 가능 상태가 필수입니다.

## 실행

로컬의 비밀 저장소에서 다음 환경변수를 보안 채널로 주입하고 `node scripts/qa-real-signed-auth.mjs`를 실행합니다.

| 환경변수 | 용도 |
| --- | --- |
| `FOOTMATE_QA_URL` | `https://iihitfjphowjplxzfxtn.supabase.co` |
| `FOOTMATE_QA_PUBLIC_KEY` | 해당 프로젝트 공개 publishable API 키 |
| `FOOTMATE_QA_USER_EMAIL`, `FOOTMATE_QA_USER_PASSWORD` | 승인된 테스트 전용 일반 사용자 로그인 |
| `FOOTMATE_QA_OPERATOR_EMAIL`, `FOOTMATE_QA_OPERATOR_PASSWORD` | 승인된 테스트 전용 운영자 로그인 |
| `FOOTMATE_QA_OPERATOR_TOTP` | 해당 운영자 인증 앱에서 받은 당회차 6자리 코드 |
| `FOOTMATE_QA_DEDICATED_ACCOUNT_ACK` | `I_HAVE_AUTHORIZED_BOTH_TEST_ACCOUNTS` |

`FOOTMATE_QA_DEDICATED_ACCOUNT_ACK`가 없거나 실제 Supabase 호스트가 다르면 네트워크 호출 전에 중단합니다. 모든 요청은 `no-store`와 리다이렉트 차단을 사용하며, 모든 Auth/REST 요청에서 JWT는 서버로만 전송합니다. 도구는 **응답 상태 및 합격 단계 이름만** 출력하고 응답 본문·사용자 식별자·토큰·비밀정보는 출력하지 않습니다.

## 검증 범위

1. 테스트 일반 사용자/운영자 각각 Password Auth 로그인에서 실제 서명 JWT 생성 및 `GET /auth/v1/user`로 서버 검증. 두 주체가 서로 달라야 하고 최초 JWT `aal1` 필수.
2. `operators` 읽기 전용 RLS: 비운영자에는 운영자 레코드가 없어야 하고, 지정 운영자는 자신의 멤버십을 볼 수 있어야 함. 사용자 추천 조건 조회는 자신의 `user_id`만 반환해야 함.
3. 같은 KPI RPC `operator_discovery_kpi_baseline`: 비운영자 AAL1, 운영자 AAL1은 각각 HTTP 401/403; 모의 값이 아닌 TOTP challenge/verify 후 운영자 AAL2는 HTTP 200.
4. 실제 MFA 인증 세션 refresh 뒤에도 `aal2` 및 읽기 전용 운영자 KPI 접근 유지.
5. 전용 테스트 세션을 `scope=local` 로그아웃한 뒤 해당 refresh token 재사용 불가. 다른 기기/기존 세션의 글로벌 로그아웃은 호출하지 않습니다. **Supabase는 로그아웃 직후 기존 access JWT가 만료 전까지 유효할 수 있으므로 즉시 JWT 폐기 검사와 혼동하면 안 됩니다.**

실패 시 상태 코드만 남기고, 로컬 테스트 세션을 가능한 범위에서 정리합니다. 인증이 끝나도 테스트 사용자 데이터나 운영 기록을 변경하지 않으며, 응답 KPI 수치/원본 사용자 이벤트를 증빙으로 보관하지 않습니다.

## 자동화/완료 판정의 경계

- CI의 `tests/contracts/real-signed-auth-qa.contract.mjs`는 **실제 서명 JWT가 아닌 모의 Auth 응답**으로 실행 경로·안전 경계를 확인합니다. **실계정 E2E 증빙이 아닙니다.**
- 운영 계정의 비밀번호 재설정 이메일 발송/복구는 이 스크립트가 수행하지 않습니다. 복구 QA가 필요하면 전용 테스트 주소와 승인된 별도 체크리스트로 사람의 메일 수신 검증을 진행해야 합니다.
- **PASS 기록 조건**: 모든 호출 단계의 PASS + 각 HTTP 응답 코드 + 전체 실행 일시 + 검증된 계정의 역할만 기록(사용자 아이디/이메일/토큰/요소 ID/실제 KPI 값 제외). 완료 기록 전까지 #611의 실계정 MFA/회복 체크박스는 미완료 유지합니다.
- Supabase Security Advisor에 SECURITY DEFINER 권한 WARN이 남을 수 있습니다. 이러한 WARN 해소와 실계정 JWT QA 완료는 별개의 사항입니다.
