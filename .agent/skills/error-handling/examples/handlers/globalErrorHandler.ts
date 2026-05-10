import { AppError } from '../errors/AppError'
import { ApiError } from '../errors/ApiError'
import type { AxiosError } from 'axios'

interface ErrorLog {
  error: AppError
  screen: string
  userId?: string
  timestamp: Date
}

/** Log the error – in dev console, otherwise send to remote tracker */
export function logError(error: AppError, screen: string): void {
  const logEntry: ErrorLog = {
    error,
    screen,
    timestamp: new Date(),
  }
  if (process.env.NODE_ENV === 'development') {
    console.error('[AppError]', logEntry)
  } else {
    // TODO: replace with actual error tracking service (e.g., Sentry, Bugsnag)
    // sendError(logEntry)
  }
}

/** Convert any thrown value into an AppError */
export function handleUnknownError(error: unknown): AppError {
  if (error instanceof AppError) return error
  if (error instanceof ApiError) return error
  // Axios error conversion
  if ((error as AxiosError).isAxiosError) {
    return ApiError.fromAxiosError(error as AxiosError)
  }
  if (error instanceof Error) {
    return new AppError(
      'UNKNOWN_ERROR',
      error.message,
      error.message,
      error.message,
      'low'
    )
  }
  // Primitive or string
  const msg = typeof error === 'string' ? error : JSON.stringify(error)
  return new AppError(
    'UNKNOWN_ERROR',
    msg,
    msg,
    msg,
    'low'
  )
}

/** Install React Native global error handler */
export function setupGlobalErrorHandler(): void {
  // React Native specific global handler – ErrorUtils is available on RN
  // @ts-ignore – may not exist in web env
  if (typeof ErrorUtils !== 'undefined' && ErrorUtils.setGlobalHandler) {
    ErrorUtils.setGlobalHandler((error: unknown, isFatal: boolean) => {
      const appError = handleUnknownError(error)
      logError(appError, 'global')
      // In production you might show a generic UI – omitted here
    })
  }
}

// Comments:
// - Always return an AppError so UI never sees raw errors.
// - ErrorUtils is the RN‑specific global error catcher; window.onerror is for web.
