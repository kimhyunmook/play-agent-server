# Auth 리소스

인증/인가 및 Google OAuth 회원가입을 담당하는 모듈입니다.

---

## 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/auth/register` | 회원가입 (이메일) |
| POST | `/auth/login` | 로그인 |
| POST | `/auth/refresh` | 토큰 갱신 (인증 필요) |
| GET | `/auth/oauth/google` | Google OAuth 회원가입 시작 |
| GET | `/auth/oauth/google/callback` | Google OAuth 콜백 (서버 내부 처리) |
| POST | `/auth/oauth/set-password` | OAuth 회원가입 후 비밀번호 설정 |

---

## 인증 흐름

### 1. 일반 회원가입 + 로그인

```
POST /auth/register { loginId, email, password, name, role? }
  → 회원가입 완료

POST /auth/login { loginId, password }
  → accessToken (응답 body) + refresh_token (HttpOnly 쿠키)
```

### 2. 토큰 갱신

```
POST /auth/refresh (Cookie: refresh_token)
  → 새 accessToken (응답 body) + refresh_token 재설정 (HttpOnly 쿠키)
```

---

## Google OAuth 회원가입 흐름

Google OAuth는 **회원가입만** 수행합니다. 로그인은 반드시 `POST /auth/login`으로 합니다.

### 웹 (브라우저)

```
1. GET /auth/oauth/google
   → Google 로그인 페이지로 리다이렉트

2. Google 로그인 완료
   → Google이 /auth/oauth/google/callback 으로 리다이렉트

3. 콜백 결과에 따른 리다이렉트
   - 신규: /set-password?token=xxx&email=xxx
   - 기존: /login?message=already_registered

4. 신규 사용자: POST /auth/oauth/set-password { token, password }
   → 비밀번호 설정 완료

5. POST /auth/login { loginId: "이메일", password }
   → 로그인 완료
```

### Android (앱)

```
1. Google Sign-In SDK로 로그인 → idToken 획득

2. POST /auth/oauth/google/android { idToken }
   - 신규: { setPasswordToken, email, loginId }
   - 기존: { alreadyRegistered: true, email, loginId }

3. 신규 사용자: POST /auth/oauth/set-password { token: setPasswordToken, password }

4. POST /auth/login { loginId: email, password }
```

> **참고**: Android 엔드포인트는 현재 컨트롤러에 미구현 상태입니다. 필요 시 `POST /auth/oauth/google/android` 추가 가능합니다.

---

## 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID (웹) | OAuth 사용 시 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 (웹) | OAuth 사용 시 |
| `GOOGLE_ANDROID_CLIENT_ID` | Google OAuth 클라이언트 ID (Android) | Android OAuth 사용 시 |
| `DOMAIN_URL` | 콜백 리다이렉트 기준 URL (예: `http://localhost:3000`) | OAuth 사용 시 |

### Google Cloud Console 설정

- **웹**: 승인된 리디렉션 URI에 `{DOMAIN_URL}/auth/oauth/google/callback` 추가
- **Android**: Android OAuth 클라이언트 생성 (패키지명, SHA-1)

---

## 디렉터리 구조

```
auth/
├── auth.controller.ts      # 인증/OAuth 엔드포인트
├── auth.service.ts         # 비즈니스 로직
├── auth.module.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── set-password.dto.ts
│   ├── google-android-login.dto.ts
│   └── response/
│       ├── login-response.dto.ts
│       └── google-register-response.dto.ts
├── strategies/
│   └── google.strategy.ts  # Passport Google OAuth20
├── exceptions/
└── README.md
```

---

## Response DTO

### Google OAuth 회원가입 응답

**신규 사용자**
```json
{
  "setPasswordToken": "eyJhbGc...",
  "email": "user@example.com",
  "loginId": "user@example.com"
}
```

**기존 사용자**
```json
{
  "alreadyRegistered": true,
  "email": "user@example.com",
  "loginId": "user@example.com"
}
```
