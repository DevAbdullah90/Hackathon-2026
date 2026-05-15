# BloodLink Error Types

## Network Errors
| Code | Description | When it occurs | Handler | User Message (EN) | User Message (UR) |
|------|-------------|----------------|---------|-------------------|-------------------|
| NETWORK_OFFLINE | No internet connectivity | Device is offline or Wi‑Fi disabled | `NetworkError.offline()` shown via `ErrorScreen`/`ErrorToast` | No internet connection. Please check your network. | انٹرنیٹ کنکشن نہیں ہے۔ براہ کرم نیٹ ورک چیک کریں۔ |
| NETWORK_TIMEOUT | Request exceeded timeout | Server did not respond in time | `NetworkError.timeout()` | Request timed out. Please try again. | درخواست کا وقت ختم ہوگیا۔ دوبارہ کوشش کریں۔ |
| NETWORK_SERVER_DOWN | Backend service unavailable (5xx) | Server returns 500/503 | `NetworkError.serverDown()` | Service is temporarily unavailable. | سروس عارضی طور پر دستیاب نہیں ہے۔ |

## Auth Errors
| Code | Description | When it occurs | Handler | User Message (EN) | User Message (UR) |
|------|-------------|----------------|---------|-------------------|-------------------|
| AUTH_TOKEN_EXPIRED | JWT expired | Access token expiration detected | `AuthError.tokenExpired()` → `authErrorHandler.handleUnauthorized()` | Your session has expired. Please login again. | آپ کا سیشن ختم ہو گیا ہے۔ براہ کرم دوبارہ لاگ ان کریں۔ |
| AUTH_UNAUTHORIZED | Insufficient permissions | API returns 401 for protected resource | `AuthError.unauthorized()` | You are not authorized to perform this action. | آپ اس عمل کو انجام دینے کے لیے authorized نہیں ہیں۔ |
| AUTH_INVALID_TOKEN | Malformed token supplied | Token fails validation on server | `AuthError.invalidToken()` | Authentication token is invalid. | توثیقی ٹوکن غلط ہے۔ |

## API Errors
| Code | Description | When it occurs | Handler | User Message (EN) | User Message (UR) |
|------|-------------|----------------|---------|-------------------|-------------------|
| API_NOT_FOUND | Resource missing | 404 response | `ApiError.notFound()` | The requested information was not found. | درخواست کردہ معلومات نہیں ملی۔ |
| API_VALIDATION_FAILED | Input validation errors | 422 response with FastAPI error shape | `ApiError.validationFailed()` | Please fill all required fields correctly. | براہ کرم تمام مطلوبہ فیلڈز صحیح طور پر مکمل کریں۔ |
| API_SERVER_ERROR | Server error (5xx) | 500/503 responses | `ApiError.serverError()` | Something went wrong. Please try again. | کچھ خرابی ہوئی۔ براہ کرم دوبارہ کوشش کریں۔ |
| API_RATE_LIMITED | Too many requests | 429 response | Custom handling (not implemented) | Too many requests. Please wait and try again. | بہت زیادہ درخواستیں۔ براہ کرم انتظار کریں اور دوبارہ کوشش کریں۔ |

## UI Errors
| Code | Description | When it occurs | Handler | User Message (EN) | User Message (UR) |
|------|-------------|----------------|---------|-------------------|-------------------|
| UI_RENDER_ERROR | Component threw during render | React component crash | `ErrorBoundary` catches and shows `ErrorScreen` | An unexpected error occurred. | ایک غیر متوقع خرابی پیش آگئی۔ |
| UI_NAVIGATION_ERROR | Navigation to unknown screen | Navigation library error | Global handler logs and shows toast | Navigation error. | نیویگیشن کی خرابی۔ |

## Location Errors
| Code | Description | When it occurs | Handler | User Message (EN) | User Message (UR) |
|------|-------------|----------------|---------|-------------------|-------------------|
| LOCATION_DENIED | User denied GPS permission | Permission request rejected | Show friendly prompt to enable location | Location permission is required. Please enable it in settings. | مقام کی اجازت ضروری ہے۔ براہ کرم سیٹنگز میں اسے فعال کریں۔ |
