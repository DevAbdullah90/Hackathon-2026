import { useState, useCallback } from 'react'
import { ApiError } from '../errors/ApiError'
import { handleUnknownError } from '../handlers/globalErrorHandler'

type UseApiErrorReturn = {
  error: ApiError | null
  validationErrors: Record<string, string> | null
  setApiError: (error: unknown) => void
  clearApiError: () => void
  getFieldError: (field: string) => string | undefined
}

export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<ApiError | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null)

  const setApiError = useCallback((err: unknown) => {
    const appErr = handleUnknownError(err)
    if (appErr instanceof ApiError) {
      setError(appErr)
      setValidationErrors(appErr.validationErrors ?? null)
    } else {
      // Non‑API errors are still stored for generic handling
      setError(null)
      setValidationErrors(null)
    }
  }, [])

  const clearApiError = useCallback(() => {
    setError(null)
    setValidationErrors(null)
  }, [])

  const getFieldError = useCallback(
    (field: string) => {
      if (!validationErrors) return undefined
      const msgs = validationErrors[field]
      return msgs ? msgs.join(', ') : undefined
    },
    [validationErrors]
  )

  return { error, validationErrors, setApiError, clearApiError, getFieldError }
}
