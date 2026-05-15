import { AppError } from './AppError'
import type { AxiosError } from 'axios'

type ApiErrorCode =
  | 'API_NOT_FOUND'
  | 'API_VALIDATION_FAILED'
  | 'API_SERVER_ERROR'
  | 'API_RATE_LIMITED'
  | 'API_UNKNOWN'

export class ApiError extends AppError {
  statusCode: number
  endpoint: string
  validationErrors?: Record<string, string[]>

  private constructor(
    code: ApiErrorCode,
    message: string,
    userMessage: string,
    urduMessage: string,
    statusCode: number,
    endpoint: string,
    validationErrors?: Record<string, string[]>
  ) {
    super(code, message, userMessage, urduMessage, 'high')
    this.statusCode = statusCode
    this.endpoint = endpoint
    this.validationErrors = validationErrors
  }

  static notFound(endpoint: string): ApiError {
    return new ApiError(
      'API_NOT_FOUND',
      `Endpoint ${endpoint} not found.`,
      'The requested information was not found.',
      'درخواست کردہ معلومات نہیں ملی۔',
      404,
      endpoint
    )
  }

  static validationFailed(errors: Record<string, string[]> , endpoint: string): ApiError {
    return new ApiError(
      'API_VALIDATION_FAILED',
      'Validation failed.',
      'Please fill all required fields correctly.',
      'براہ کرم تمام مطلوبہ فیلڈز صحیح طور پر مکمل کریں۔',
      422,
      endpoint,
      errors
    )
  }

  static serverError(statusCode: number, endpoint: string): ApiError {
    return new ApiError(
      'API_SERVER_ERROR',
      `Server error ${statusCode}.`,
      'Something went wrong. Please try again.',
      'کچھ خرابی ہوئی۔ براہ کرم دوبارہ کوشش کریں۔',
      statusCode,
      endpoint
    )
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const endpoint = error.config?.url ?? 'unknown'
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any
      if (status === 404) return ApiError.notFound(endpoint)
      if (status === 422 && data?.errors) {
        const parsed = ApiError.parseValidationErrors(data.errors)
        return ApiError.validationFailed(parsed, endpoint)
      }
      if (status >= 500) return ApiError.serverError(status, endpoint)
      // Fallback for other known statuses
      return new ApiError(
        'API_UNKNOWN',
        `HTTP ${status} error`,
        `Error ${status}. Please try again.`,
        `خرابی ${status}۔ براہ کرم دوبارہ کوشش کریں۔`,
        status,
        endpoint
      )
    }
    // Network or timeout errors handled elsewhere
    return new ApiError(
      'API_UNKNOWN',
      'Network or unknown error',
      'Network error. Please check your connection.',
      'نیٹ ورک کی خرابی۔ براہ کرم کنکشن چیک کریں۔',
      0,
      endpoint
    )
  }

  private static parseValidationErrors(raw: any): Record<string, string[]> {
    // Assuming FastAPI error shape: {detail: [{loc: [...], msg: string, type: string}]}
    const out: Record<string, string[]> = {}
    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        const field = (item.loc && item.loc[item.loc.length - 1]) ?? 'field'
        if (!out[field]) out[field] = []
        out[field].push(item.msg)
      })
    }
    return out
  }
}
