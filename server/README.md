# API Endpoints (summary)

Base URL: `http://localhost:${PORT}` (default `3000`)

Authentication: cookie-based (`auth` JWT). Protected endpoints require a valid `auth` cookie.

## Auth
| Method | Path | Body | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | `{ "usertag": string (3-32, lowercase/digit/_), "password": string (8-32, lower+upper+digit+special), "passwordconfirm": string, "email": string, "fullname": string, "mobile": string, "gender": string<=10, "birthdate": YYYY-MM-DD }` + optional `pfp` file | 201 `{ message }` | 400 validation/field count/password mismatch, 409 usertag/email/mobile taken, 429 rate limit, 500 server |
| POST | `/auth/login` | `{ "identifier": string (usertag/email/mobile), "password": string, "keeplogin"?: boolean }` | 200 `{ message }` + cookies (`auth` HTTP-only, `usertag`, `language`, `darkmode`, `currency`) | 203 `{ message, temp_token }` if 2FA required (no cookies set); 400 already logged in/invalid fields; 401 wrong password; 404 not found; 429 limit |
| POST | `/auth/verify-2fa` | `{ "code": string (6-digit TOTP), "keeplogin"?: boolean }` | 200 `{ message }` + cookies (same as login) | 401 invalid/expired code or temp token; 404 2FA not enabled; 429 limit (5/15m) |
| POST | `/auth/logout` | (none) | 200 `{ message }` | 400 not logged in |

Note: Rate limits – `/auth/register` 5/15m, `/auth/login` 10/15m, `/auth/verify-2fa` 5/15m → 429 `{ error }`.

## User (requires auth)
| Method | Path | Body / Params | Success | Errors |
| --- | --- | --- | --- | --- |
| PUT | `/user/changedata` | `{ usertag?, fullname?, mobile?, gender? }` (at least 1) + optional `pfp` file | 200 `{ message }` | 400 missing/too many fields or format error; 401 no/invalid token; 409 usertag/mobile taken; 429 limit; 500 |
| PUT | `/user/settings` | `{ language?, darkmode?, currency? }` (at least 1; language: EN/HU; darkmode: bool; currency: USD/EUR/HUF) | 200 `{ message }` + locale cookies refreshed | 400 invalid/missing setting; 401 invalid/expired token; 429 limit |
| GET | `/user/profile/:usertag` | `:usertag` path (fallback to `usertag` cookie) | 200 profile JSON (depends on publicContacts) | 400 missing usertag; 404 not found; 429 limit |
| POST | `/user/password/reset/request` | `{ email: string }` or `{ mobile: string }` or `{ identifier: string }` | 200 `{ message }` (always returns 200 even if user not found) | 400 invalid/missing field; 429 limit; 500 server |
| POST | `/user/password/reset` | `{ token: string, password: string, passwordconfirm: string }` | 200 `{ message }` | 400 invalid fields/password mismatch; 401 invalid/expired token; 429 limit; 500 server |
| PUT | `/user/password/change` | `{ currentPassword: string, newPassword: string, confirmPassword: string }` | 200 `{ message }` | 400 invalid fields/password mismatch; 401 no/invalid token or wrong current password; 500 server |

Profile responses:
- `publicContacts = false`: `{ fullname, usertag, gender, birthdate (year), type, email: hidden, mobile: hidden }`
- `publicContacts = true`: `{ fullname, usertag, email, mobile, gender, birthdate (ISO date), type, auctionCount, bidCount }`

Rate limits: `/user/changedata` 10/5m, `/user/settings` 10/5m, `/user/profile` 30/1m, `/user/password/reset/request` 5/5m, `/user/password/reset` 5/5m, `/user/tfa/enable` 10/5m, `/user/tfa/disable` 5/5m

## Two-Factor Authentication (requires auth)
| Method | Path | Body | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/user/tfa/enable` | Empty body for QR code; `{ "code": "123456" }` to verify & enable | 200 with `{ message, qrCode, secret }` (no code) or `{ message }` (with code) | 400 already enabled/invalid code format; 401 invalid code; 429 limit |
| POST | `/user/tfa/disable` | Method 1: `{ "tfaCode": "123456" }`; Method 2: `{ "backupCode": "ABC123" }`; Method 3a: `{ "requestEmail": true }` then 3b: `{ "emailCode": "123456" }` | 200 `{ message }` (disabled or email sent) | 400 not enabled/invalid format; 401 invalid code; 404 no active email code; 429 limit |

**2FA Enable Flow:**
1. POST `/user/tfa/enable` (no body) → Returns QR code + secret
2. Scan QR with authenticator app (Google Authenticator, Authy, etc.)
3. POST `/user/tfa/enable` with `{ "code": "123456" }` → 2FA enabled

**2FA Disable Methods:**
- **Current TOTP code**: `{ "tfaCode": "123456" }` from authenticator app
- **Backup code**: `{ "backupCode": "ABC123DEF456" }` (if generated during setup)
- **Email verification**: First `{ "requestEmail": true }` to receive code, then `{ "emailCode": "123456" }` with the code

## Auction
| Method | Path | Body / Params | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/auction/addcar` (requires auth) | Required: `manufacturer` (<=100), `model` (<=150), `color` (<=50), `odometerKM` >=0, `modelyear` 1886..next year, `efficiency` 0–99.99, `efficiencyunit` HP/kW, `enginecapacity` >0, `fueltype` (gasoline/diesel/electric/hybrid/other), `transmission` (manual/automatic/semi-automatic/CVT/dual-clutch/other), `bodytype` (sedan/hatchback/SUV/coupe/convertible/wagon/van/truck/other), `doors` int>0, `seats` int>0, `vin` 17 chars (no I/O/Q); Optional: `emissionsGKM` >=0, `maxspeedKMH` >=0, `zeroToHundredSec` >=0, `weightKG` >=0, `factoryExtras` string, `features` object/JSON + multiple car image files | 201 `{ success: true, message, carId }` | 400 validation/field count; 401 no auth; 409 VIN exists; 429 limit (5/5m); 500 |
| POST | `/auction/addauction` (requires auth) | `{ carId: string, startingPrice: number, reservePrice?: number, startTime: ISO datetime, endTime: ISO datetime, description?: string }` | 201 `{ success: true, message, auctionId }` | 400 validation/invalid fields; 401 no auth; 404 car not found; 429 limit (10/5m); 500 |
| POST | `/auction/placebid` (requires auth) | `{ auctionId: string, amount: number }` | 200 `{ success: true, message }` | 400 validation/bid too low; 401 no auth; 403 cannot bid on own auction; 404 auction not found; 429 limit (20/5m); 500 |
| GET | `/auction/list` | Query params: `?page=1&limit=20&status=active&sort=endingSoon` etc. | 200 `{ auctions: [...], total, page, pages }` | 400 invalid query params; 429 limit (60/1m) |
| GET | `/auction/:auctionId` | `:auctionId` path param | 200 auction details JSON | 400 invalid ID; 404 not found; 429 limit (60/1m) |

## Notes
- Dates: prefer `YYYY-MM-DD` for birthdate; ISO datetime for auction times.
- Auth cookie: returned by `/auth/login` as `auth` (JWT). Required for protected routes.
  - The `auth` cookie is **httpOnly** (not accessible to JavaScript) and contains the JWT for server-side authentication.
  - Frontend-readable cookies: `usertag`, `language`, `darkmode`, `currency` (set alongside `auth` on login).
  - **Frontend usage**: Check `usertag` cookie to show logged-in UI, but always rely on API responses for actual authorization. A fake `usertag` cookie cannot bypass the httpOnly `auth` validation on protected endpoints.
- 2FA: if `/auth/login` returns 203 with `temp_token`, complete login via `/auth/verify-2fa` with the 6-digit code from your authenticator app. Users can enable/disable 2FA via `/user/tfa/enable` and `/user/tfa/disable`.
- File uploads: `/auth/register` and `/user/changedata` support `pfp` (profile picture); `/auction/addcar` supports multiple car images.
- Unknown route: 404 `{ message: "Nem található" }`.
