# API Endpoints (summary)

Base URL: `http://localhost:${PORT}` (default `3000`)

Authentication: cookie-based (`auth` JWT). Protected endpoints require a valid `auth` cookie.

## Auth
| Method | Path | Body | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | `{ "usertag": string (3-32, lowercase/digit/_), "password": string (8-32, lower+upper+digit+special), "passwordconfirm": string, "email": string, "fullname": string, "mobile": string, "gender": string<=10, "birthdate": YYYY-MM-DD }` | 201 `{ message }` | 400 validation/field count/password mismatch, 409 usertag/email/mobile taken, 429 rate limit, 500 server |
| POST | `/auth/login` | `{ "identifier": string (usertag/email/mobile), "password": string, "keeplogin"?: boolean }` | 200 `{ message }` + cookies (`auth` HTTP-only, `usertag`, `language`, `darkmode`, `currency`) | 203 `{ message, temp_token }` if 2FA required (no cookies set); 400 already logged in/invalid fields; 401 wrong password; 404 not found; 429 limit |
| POST | `/auth/logout` | (none) | 200 `{ message }` | 400 not logged in |
| POST | `/auth/verify-2fa` | `{ "code": string (6 digits) }` (only field) | 200 `{ message }` + cookies (`auth`, `language`, `darkmode`, `currency`) | 400 missing/invalid code or 2FA disabled; 401 invalid/expired temp token or code; 403 token not `tfa_required`; 404 not found; 429 limit; 500 server |

Note: Rate limits – `/auth/register` 5/15m, `/auth/login` 10/15m, `/auth/verify-2fa` 10/15m, `/auction/addcar` 10/15m → 429 `{ error }`.

## User (requires auth)
| Method | Path | Body / Params | Success | Errors |
| --- | --- | --- | --- | --- |
| PUT | `/user/changedata` | `{ usertag?, fullname?, mobile?, gender? }` (at least 1) | 200 `{ message }` | 400 missing/too many fields or format error; 401 no/invalid token; 409 usertag/mobile taken; 500 |
| PUT | `/user/settings` | `{ language?, darkmode?, currency? }` (at least 1; language: EN/HU; darkmode: bool; currency: USD/EUR/HUF) | 200 `{ message }` + locale cookies refreshed | 400 invalid/missing setting; 401 invalid/expired token |
| POST | `/user/tfa/toggle` | `{ enable: boolean }` | 200 `{ message, otpauthURL? }` | 400 missing/extra/invalid field; 401 no/invalid token |
| GET | `/user/profile/:usertag` | `:usertag` path (fallback to `usertag` cookie) | 200 profile JSON (depends on publicContacts) | 400 missing usertag; 404 not found |

Profile responses:
- `publicContacts = false`: `{ fullname, usertag, gender, birthdate (year), type, email: hidden, mobile: hidden }`
- `publicContacts = true`: `{ fullname, usertag, email, mobile, gender, birthdate (ISO date), type, auctionCount, bidCount }`

## Auction
> The auction router exists but is not mounted in `server.js`. If mounted under `/auction`, the following applies:

| Method | Path | Body | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/auction/addcar` | Required: `manufacturer` (<=100), `model` (<=150), `color` (<=50), `odometerKM` >=0, `modelyear` 1886..next year, `efficiency` 0–99.99, `efficiencyunit` HP/kW, `enginecapacity` >0, `fueltype` (gasoline/diesel/electric/hybrid/other), `transmission` (manual/automatic/semi-automatic/CVT/dual-clutch/other), `bodytype` (sedan/hatchback/SUV/coupe/convertible/wagon/van/truck/other), `doors` int>0, `seats` int>0, `vin` 17 chars (no I/O/Q); Optional: `emissionsGKM` >=0, `maxspeedKMH` >=0, `zeroToHundredSec` >=0, `weightKG` >=0, `factoryExtras` string, `features` object/JSON | 201 `{ success: true, message, carId }` | 400 validation/field count; 401 no auth; 409 VIN exists; 429 limit; 500 |

## Notes
- Dates: prefer `YYYY-MM-DD`.
- Auth cookie: returned by `/auth/login` or `/auth/verify-2fa` as `auth` (JWT). Required for protected routes.
- 2FA: if `/auth/login` returns 203 with `temp_token`, place it into the `auth` cookie, then call `/auth/verify-2fa`.
- Unknown route: 404 `{ message: "Nem található" }`.
