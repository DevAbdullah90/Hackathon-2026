import { AppError } from './AppError'

type NetworkErrorCode = 'NETWORK_OFFLINE' | 'NETWORK_TIMEOUT' | 'NETWORK_SERVER_DOWN'

export class NetworkError extends AppError {
  isTimeout: boolean
  statusCode?: number

  private constructor(
    code: NetworkErrorCode,
    message: string,
    userMessage: string,
    urduMessage: string,
    isTimeout: boolean = false,
    statusCode?: number
  ) {
    super(code, message, userMessage, urduMessage, 'medium')
    this.isTimeout = isTimeout
    this.statusCode = statusCode
  }

  static offline(): NetworkError {
    return new NetworkError(
      'NETWORK_OFFLINE',
      'No internet connection.',
      'No internet connection. Please check your network.',
      'انٹرنیٹ کنکشن نہیں ہے۔ براہ کرم نیٹ ورک چیک کریں۔',
      false
    )
  }

  static timeout(): NetworkError {
    return new NetworkError(
      'NETWORK_TIMEOUT',
      'Request timed out.',
      'Request timed out. Please try again.',
      'درخواست کا وقت ختم ہوگیا۔ دوبارہ کوشش کریں۔',
      true
    )
  }

  static serverDown(): NetworkError {
    return new NetworkError(
      'NETWORK_SERVER_DOWN',
      'Server is down.',
      'Service is temporarily unavailable.',
      'سروس عارضی طور پر دستیاب نہیں ہے۔',
      false,
      500
    )
  }
}
