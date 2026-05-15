# API Contracts for Authentication

## 1. Send OTP

- **Endpoint:** `POST /api/auth/send-otp`
- **Request Body:**
```json
{
  "phone": "923001234567"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent"
}
```
- **Error Response (400/422):**
```json
{
  "success": false,
  "error": "Invalid phone"
}
```

## 2. Verify OTP

- **Endpoint:** `POST /api/auth/verify-otp`
- **Request Body:**
```json
{
  "phone": "923001234567",
  "otp": "123456"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "token": "<jwt_here>",
  "user": {
    "id": "u123",
    "name": "Ali Khan",
    "bloodGroup": "A+",
    "city": "Karachi"
  }
}
```
- **Error Response (401/400):**
```json
{
  "success": false,
  "error": "Invalid OTP"
}
```

## JWT Details
- **Format:** Standard JWT signed with HS256 (or RS256 as per backend).
- **Expiry:** 24 hours.
- **Usage:** Include in Authorization header for subsequent API calls:
```
Authorization: Bearer <token>
```

## Phone Format (Pakistan)
- Must start with `+92` followed by exactly 10 digits.
- Example: `+923001234567`
- No spaces, hyphens, or parentheses.
