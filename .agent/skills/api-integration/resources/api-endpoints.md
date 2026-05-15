# API Endpoints Documentation for BloodLink

## AUTH
- **POST** `/api/auth/send-otp`
  - **Headers**: `Content-Type: application/json`
  - **Body**: `{ "phone": "string" }`
  - **Success**: `{ "success": true, "data": { "otpSent": true } }`
  - **Error**: Standard `ApiErrorResponse`
  - **Used by**: `authApi.sendOtp` (not part of this skill)

- **POST** `/api/auth/verify-otp`
  - **Headers**: `Content-Type: application/json`
  - **Body**: `{ "phone": "string", "code": "string" }`
  - **Success**: `{ "success": true, "data": { "token": "jwt" } }`
  - **Error**: `ApiErrorResponse`
  - **Used by**: `authApi.verifyOtp`

- **POST** `/api/auth/refresh`
  - **Headers**: `Authorization: Bearer <refreshToken>`
  - **Success**: `{ "success": true, "data": { "token": "newJwt" } }`
  - **Error**: `ApiErrorResponse`

- **POST** `/api/auth/logout`
  - **Headers**: `Authorization: Bearer <token>`
  - **Success**: `{ "success": true }`

## DONORS
- **GET** `/api/donors/nearby`
  - **Query Params**: `bloodGroup`, `city`, `radius`
  - **Success**: `{ "success": true, "data": { "donors": Donor[], "total": number } }`
  - **Error**: `ApiErrorResponse`
  - **Hook**: `useNearbyDonors`

- **GET** `/api/donors/:id`
  - **Success**: `{ "success": true, "data": Donor }`
  - **Hook**: `useDonorProfile`

- **PATCH** `/api/donors/:id/availability`
  - **Body**: `{ "isAvailable": boolean }`
  - **Success**: `{ "success": true }`
  - **Hook**: `updateDonorAvailability`

- **POST** `/api/donors/:id/respond`
  - **Body**: `{ "requestId": string, "response": "accept" | "decline" }`
  - **Success**: `{ "success": true }`
  - **Hook**: `respondToRequest`

- **GET** `/api/donors/:id/history`
  - **Success**: `{ "success": true, "data": BloodRequest[] }`
  - **Hook**: `getDonorHistory`

## BLOOD REQUESTS
- **POST** `/api/requests`
  - **Body**: `CreateBloodRequestPayload`
  - **Success**: `{ "success": true, "data": { "request": BloodRequest, "matchedDonors": Donor[] } }`
  - **Hook**: `useCreateBloodRequest`

- **GET** `/api/requests/:id`
  - **Success**: `{ "success": true, "data": BloodRequest }`
  - **Hook**: `useActiveRequest`

- **GET** `/api/requests/mine`
  - **Success**: `{ "success": true, "data": BloodRequest[] }`
  - **Hook**: `useUserRequests`

- **PATCH** `/api/requests/:id/status`
  - **Body**: `{ "status": "pending" | "matched" | "completed" | "cancelled" }`
  - **Success**: `{ "success": true, "data": BloodRequest }`
  - **Hook**: `updateRequestStatus`

- **DELETE** `/api/requests/:id`
  - **Success**: `{ "success": true }`
  - **Hook**: `cancelRequest`

### Stale Time Recommendations
- Donor list (`/donors/nearby`): **30 s** – donors move quickly.
- Single donor profile: **5 min** – profile changes rarely.
- Active request status: **10 s** – status may change fast.
- User request list: **1 min** – moderate freshness.
