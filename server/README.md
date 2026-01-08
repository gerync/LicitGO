# API Endpoints Documentation

Base URL: `http://localhost:${PORT}` (default `3000`)

Authentication: cookie-based (`auth` JWT). Protected endpoints require a valid `auth` cookie.

---

## Auth Endpoints

### POST `/auth/register`
Register a new user account.

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "usertag": "string (3-32 chars, lowercase/digits/_)",
  "password": "string (8-32 chars, must contain lowercase, uppercase, digit, special char)",
  "passwordconfirm": "string (must match password)",
  "email": "string (valid email)",
  "fullname": "string",
  "mobile": "string (e.g., +3612345678)",
  "gender": "string (max 10 chars)",
  "birthdate": "YYYY-MM-DD",
  "pfp": "file (optional, profile picture)"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "string"
}
```

**Error Responses:**
- `400`: Validation error, field count mismatch, or password mismatch
- `409`: usertag, email, or mobile already taken
- `429`: Rate limit exceeded
- `500`: Server error

---

### POST `/auth/login`
Login with credentials.

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**
```json
{
  "identifier": "string (email, usertag, or mobile)",
  "password": "string",
  "keeplogin": "boolean (optional, default false)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "string"
}
```

**Cookies Set:**
- `auth`: HTTP-only JWT token *(not readable on frontend)*
- `usertag`: User's tag
- `language`: User's language preference
- `darkmode`: User's theme preference
- `currency`: User's currency preference

*Every other cookie than the* `auth` *are readable by the frontend*


**Special Response (2FA Required):** `203 Non-Authoritative Information`
```json
{
  "message": "string",
  "temp_token": "string (short-lived token for 2FA completion)"
}
```

**Error Responses:**
- `203`: 2FA required (see above)
- `400`: Already logged in or invalid fields
- `401`: Wrong password
- `404`: User not found
- `429`: Rate limit exceeded

---

### POST `/auth/verify-2fa`
Verify 2FA code after login. Use the `temp_token` from login response if 2FA is required.

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "code": "string (6-digit TOTP code)",
  "keeplogin": "boolean (optional, default false)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "string"
}
```

**Cookies Set:** Same as `/auth/login` success response

**Error Responses:**
- `401`: Invalid or expired code/temp token
- `404`: 2FA not enabled for user
- `429`: Rate limit exceeded

---

### POST `/auth/logout`
Clear auth cookies and logout.

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "string"
}
```

**Error Responses:**
- `400`: Not logged in

---

## User Endpoints

### PUT `/user/changedata`
Update user profile data. Requires authentication.

**Rate Limit:** 10 requests per 5 minutes

**Request Body (at least one field required):**
```json
{
  "usertag": "string (optional)",
  "fullname": "string (optional)",
  "mobile": "string (optional)",
  "gender": "string (optional)",
  "pfp": "file (optional, profile picture)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "string"
}
```

**Error Responses:**
- `400`: Missing/too many fields or format error
- `401`: No/invalid auth token
- `409`: usertag or mobile already taken
- `429`: Rate limit exceeded
- `500`: Server error

---

### PUT `/user/settings`
Update UI settings and cookies. Requires authentication.

**Rate Limit:** 10 requests per 5 minutes

**Request Body (at least one field required):**
```json
{
  "language": "string (EN or HU, optional)",
  "darkmode": "boolean (optional)",
  "currency": "string (USD/EUR/HUF, optional)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "string"
}
```

**Cookies Updated:** language, darkmode, currency cookies refreshed

**Error Responses:**
- `400`: Invalid or missing setting
- `401`: Invalid/expired auth token
- `429`: Rate limit exceeded

---

### GET `/user/profile/{usertag}`
Get public profile information by usertag.

**Rate Limit:** 30 requests per 1 minute

**Path Parameters:**
- `usertag` (string, required): User's tag

**Success Response:** `200 OK`
```json
{
  "usertag": "string",
  "fullname": "string",
  "gender": "string",
  "birthdate": "string",
  "type": "string",
  "email": "string (if publicContacts=true)",
  "mobile": "string (if publicContacts=true)",
  "auctionCount": "number (if publicContacts=true)",
  "bidCount": "number (if publicContacts=true)"
}
```

**Error Responses:**
- `400`: Missing usertag
- `404`: User not found
- `429`: Rate limit exceeded

---

## Password Reset Endpoints

### POST `/user/password/reset/request`
Request a password reset code.

**Rate Limit:** 5 requests per 5 minutes

**Request Body:**
```json
{
  "email": "string (valid email)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "string"
}
```

*Note: Always returns 200, even if user not found (for security)*

**Error Responses:**
- `400`: Invalid or missing field
- `429`: Rate limit exceeded
- `500`: Server error

---

### POST `/user/password/reset`
Reset password using verification code.

**Rate Limit:** 5 requests per 5 minutes

**Query Parameters (optional):**
- `code` (string): 6-digit verification code (can also be in body)

**Request Body:**
```json
{
  "code": "string (6-digit code, optional if provided in query)",
  "newPassword": "string (must meet password requirements)",
  "passwordconfirm": "string (must match newPassword)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "string"
}
```

**Error Responses:**
- `400`: Invalid code, invalid fields, or password mismatch
- `401`: Invalid or expired token
- `429`: Rate limit exceeded
- `500`: Server error

---

## Two-Factor Authentication (2FA) Endpoints

### POST `/user/tfa/enable`
Enable 2FA for the account. Requires authentication.

**Rate Limit:** 10 requests per 5 minutes

**Request Body:**
- Empty for initial QR code generation
- `{ "code": "123456" }` to verify and enable

**Initial Request Response:** `200 OK`
```json
{
  "message": "string",
  "qrCode": "string (base64 data URL)",
  "secret": "string (TOTP secret for manual entry)"
}
```

**Verification Response:** `200 OK`
```json
{
  "message": "string"
}
```

**2FA Enable Flow:**
1. POST to `/user/tfa/enable` with empty body → get QR code and secret
2. Scan QR code with authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
3. POST to `/user/tfa/enable` with verified 6-digit code → 2FA enabled

**Error Responses:**
- `400`: Already enabled or invalid code format
- `401`: Invalid verification code
- `429`: Rate limit exceeded

---

### POST `/user/tfa/disable`
Disable 2FA for the account. Requires authentication.

**Rate Limit:** 5 requests per 5 minutes

**Request Body (choose ONE method):**

**Method 1: Current TOTP Code**
```json
{
  "tfaCode": "string (6-digit code from authenticator app)"
}
```

**Method 2: Backup Code**
```json
{
  "backupCode": "string (8-16 character backup code)"
}
```

**Method 3a: Email Verification (Step 1)**
```json
{
  "requestEmail": true
}
```

**Method 3b: Email Verification (Step 2)**
```json
{
  "emailCode": "string (6-digit code sent to email)"
}
```

**Success Responses:** `200 OK`
```json
{
  "message": "string (2FA disabled OR email code sent)"
}
```

**Error Responses:**
- `400`: Not enabled, invalid format, or other validation error
- `401`: Invalid code
- `404`: No active email code (for step 2 of email method)
- `429`: Rate limit exceeded

---

## Auction Endpoints

### POST `/auction/addcar`
Add a new car to the system. Requires authentication.

**Rate Limit:** 5 requests per 5 minutes

**Request Body:**

**Required Fields:**
```json
{
  "manufacturer": "string (max 100 chars)",
  "model": "string (max 150 chars)",
  "color": "string (max 50 chars)",
  "odometerKM": "number (>= 0)",
  "modelyear": "number (1886 to current year + 1)",
  "efficiency": "number (0-99.99)",
  "efficiencyunit": "string (HP or kW)",
  "enginecapacity": "number (> 0, in cc)",
  "fueltype": "string (gasoline, diesel, electric, hybrid, other)",
  "transmission": "string (manual, automatic, semi-automatic, CVT, dual-clutch, other)",
  "bodytype": "string (sedan, hatchback, SUV, coupe, convertible, wagon, van, truck, other)",
  "doors": "number (> 0)",
  "seats": "number (> 0)",
  "vin": "string (exactly 17 chars, no I/O/Q)"
}
```

**Optional Fields:**
```json
{
  "description": "string",
  "emissionsGKM": "number (>= 0)",
  "maxspeedKMH": "number (>= 0)",
  "zeroToHundredSec": "number (>= 0)",
  "weightKG": "number (>= 0)",
  "factoryExtras": "string",
  "features": "object (JSON format)",
  "carImages": "files (multiple image uploads)"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "string",
  "carId": "number"
}
```

**Error Responses:**
- `400`: Validation error or field count issue
- `401`: No authentication
- `409`: VIN already exists
- `429`: Rate limit exceeded
- `500`: Server error

---

### POST `/auction/addauction`
Create an auction for a car. Requires authentication.

**Rate Limit:** 10 requests per 5 minutes

**Request Body:**
```json
{
  "carid": "number",
  "startingBid": "number",
  "reservePrice": "number",
  "starttime": "string (ISO 8601 datetime)",
  "endtime": "string (ISO 8601 datetime)",
  "description": "string (optional)"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "string",
  "auctionId": "number"
}
```

**Error Responses:**
- `400`: Validation error or invalid fields
- `401`: No authentication
- `403`: Not the owner of the car
- `404`: Car not found
- `409`: Active auction already exists for this car
- `429`: Rate limit exceeded
- `500`: Server error

---

### GET `/auction/list`
List all auctions with comprehensive filtering and sorting options.

**Rate Limit:** 60 requests per 1 minute

**Query Parameters:**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Results per page (max 100) |
| `manufacturer` | string | - | Filter by car manufacturer |
| `model` | string | - | Filter by car model |
| `minYear` | number | - | Minimum model year |
| `maxYear` | number | - | Maximum model year |
| `fueltype` | string | - | Filter by fuel type (gasoline, diesel, electric, hybrid, other) |
| `bodytype` | string | - | Filter by body type (sedan, hatchback, SUV, coupe, convertible, wagon, van, truck, other) |
| `color` | string | - | Filter by color |
| `minOdometer` | number | - | Minimum odometer reading in KM |
| `maxOdometer` | number | - | Maximum odometer reading in KM |
| `status` | string | - | Filter by auction status (upcoming, ongoing, ended) |
| `minPrice` | number | - | Minimum current price in USD |
| `maxPrice` | number | - | Maximum current price in USD |
| `minReservePrice` | number | - | Minimum reserve price in USD |
| `maxReservePrice` | number | - | Maximum reserve price in USD |
| `sortBy` | string | date | Sort field (price, bidcount, manufacturer, model, date) |
| `sortOrder` | string | DESC | Sort direction (ASC or DESC) |

**Example Requests:**
```
/auction/list?page=1&limit=20
/auction/list?manufacturer=Toyota&minYear=2015&maxYear=2023&sortBy=price&sortOrder=ASC
/auction/list?status=ongoing&fueltype=electric&limit=50
/auction/list?minPrice=5000&maxPrice=50000&bodytype=SUV
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "auctions": [
    {
      "auctionId": "number",
      "carId": "number",
      "currentPrice": "number (in requested currency)",
      "reservePriceUSD": "number",
      "reserveMet": "boolean",
      "bidCount": "number",
      "starttime": "string (ISO datetime)",
      "endtime": "string (ISO datetime)",
      "status": "string (upcoming, ongoing, ended)",
      "timeRemaining": "number (seconds)",
      "car": {
        "manufacturer": "string",
        "model": "string",
        "modelyear": "number",
        "odometerKM": "number",
        "efficiency": "number",
        "efficiencyunit": "string",
        "enginecapacityCC": "number",
        "fueltype": "string",
        "transmission": "string",
        "bodytype": "string",
        "mainImagepath": "string (full URL, nullable)"
      }
    }
  ],
  "pagination": {
    "currentPage": "number",
    "totalPages": "number",
    "totalResults": "number",
    "resultsPerPage": "number",
    "hasNextPage": "boolean",
    "hasPreviousPage": "boolean"
  }
}
```

**Error Responses:**
- `400`: Invalid query parameters
- `429`: Rate limit exceeded

---

### GET `/auction/{auctionId}`
Get detailed information about a specific auction.

**Rate Limit:** 60 requests per 1 minute

**Path Parameters:**
- `auctionId` (number, required): Auction ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "auction": {
    "auctionId": "number",
    "carId": "number",
    "currentPrice": "number (in requested currency)",
    "reserveMet": "boolean",
    "currency": "string",
    "starttime": "string (ISO datetime)",
    "endtime": "string (ISO datetime)",
    "status": "string (upcoming, ongoing, ended)",
    "timeRemaining": "number (seconds)",
    "bidCount": "number",
    "bidHistory": [
      {
        "amount": "number (in requested currency)",
        "bidtime": "string (ISO datetime)",
        "bidder": "string (usertag)"
      }
    ],
    "car": {
      "manufacturer": "string",
      "model": "string",
      "odometerKM": "number",
      "modelyear": "number",
      "efficiency": "number",
      "efficiencyunit": "string",
      "enginecapacityCC": "number",
      "fueltype": "string",
      "emissionsGKM": "number (nullable)",
      "transmission": "string",
      "bodytype": "string",
      "color": "string",
      "doors": "number",
      "seats": "number",
      "vin": "string",
      "maxspeedKMH": "number (nullable)",
      "zeroToHundredSec": "number (nullable)",
      "weightKG": "number (nullable)",
      "features": "object (nullable)",
      "factoryExtras": "string (nullable)",
      "owner": {
        "usertag": "string",
        "fullname": "string"
      },
      "images": [
        "string (full URL to image)"
      ]
    }
  }
}
```

**Error Responses:**
- `404`: Auction not found
- `429`: Rate limit exceeded

---

### POST `/auction/{auctionID}/bid`
Place a bid on an active auction. Requires authentication.

**Rate Limit:** 20 requests per 5 minutes

**Path Parameters:**
- `auctionID` (number, required): Auction ID

**Request Body:**
```json
{
  "bidamount": "number (bid amount in user's currency)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "string",
  "auctionID": "number",
  "bidAmount": "number",
  "bidCurrency": "string"
}
```

**Error Responses:**
- `400`: Invalid bid amount or auction timing issue
- `401`: No authentication
- `403`: Cannot bid on own auction
- `404`: Auction not found
- `429`: Rate limit exceeded
- `500`: Server error

---

## General Notes

### Authentication & Cookies
- The `auth` cookie is **HTTP-only** (not accessible to JavaScript) and contains the JWT for server-side authentication
- Frontend-readable cookies: `usertag`, `language`, `darkmode`, `currency` (set alongside `auth` on login)
- **Frontend usage**: Check `usertag` cookie to show logged-in UI, but always rely on API responses for actual authorization
- A fake `usertag` cookie cannot bypass the HTTP-only `auth` validation on protected endpoints

### Date & Time Formats
- Birthdate: Use `YYYY-MM-DD` format
- Auction times: Use ISO 8601 datetime format (e.g., `2026-01-08T14:30:00Z`)

### File Uploads
- `/auth/register` and `/user/changedata` support `pfp` (profile picture)
- `/auction/addcar` supports multiple car images

### Currency Conversion
- Prices are shown in the user's preferred currency (set via cookies/settings)
- Internal storage is in USD
- Exchange rates are applied automatically

### Status Localization
- Auction status (`upcoming`, `ongoing`, `ended`) is localized based on `language` cookie preference (EN or HU)

### Error Response Format
Standard error response:
```json
{
  "error": "string (error message)"
}
```

### Unknown Route
Returns: `404 Not Found`
```json
{
  "message": "Nem található"
}
