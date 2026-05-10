import { useState, useCallback } from 'react'
import { handleUnknownError, logError } from '../handlers/globalErrorHandler'
import type { AppError } from '../errors/AppError'

type UseErrorHandlerReturn = {
  error: AppError | null
  setError: (error: unknown) => void
  clearError: () => void
  hasError: boolean
}

/**
 * Hook to manage a single AppError instance.
 * Converts any thrown value to AppError, logs it, and provides state helpers.
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<AppError | null>(null)

  const setError = useCallback((err: unknown) => {
    const appError = handleUnknownError(err)
    setErrorState(appError)
    logError(appError, 'hook')
  }, [])

  const clearError = useCallback(() => setErrorState(null), [])

  return {
    error,
    setError,
    clearError,
    hasError: !!error,
  }
}
