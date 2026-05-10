import { AppError } from './AppError'

type AuthErrorReason = 'token_expired' | 'invalid_token' | 'unauthorized'

type AuthErrorCode = 'AUTH_TOKEN_EXPIRED' | 'AUTH_INVALID_TOKEN' | 'AUTH_UNAUTHORIZED'

export class AuthError extends AppError {
  reason: AuthErrorReason

  private constructor(
    code: AuthErrorCode,
    message: string,
    userMessage: string,
    urduMessage: string,
    reason: AuthErrorReason
  ) {
    super(code, message, userMessage, urduMessage, 'high')
    this.reason = reason
  }

  static tokenExpired(): AuthError {
    return new AuthError(
      'AUTH_TOKEN_EXPIRED',
      'Authentication token has expired.',
      'Your session has expired. Please login again.',
      'آپ کا سیشن ختم ہو گیا ہے۔ براہ کرم دوبارہ لاگ ان کریں۔',
      'token_expired'
    )
  }

  static unauthorized(): AuthError {
    return new AuthError(
      'AUTH_UNAUTHORIZED',
      'User is not authorized.',
      'You are not authorized to perform this action.',
      'آپ اس عمل کو انجام دینے کے لیے authorized نہیں ہیں۔',
      'unauthorized'
    )
  }

  static invalidToken(): AuthError {
    return new AuthError(
      'AUTH_INVALID_TOKEN',
      'Provided token is invalid.',
      'Authentication token is invalid.',
      'توثیقی ٹوکن غلط ہے۔',
      'invalid_token'
    )
  }
}
