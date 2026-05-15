import { ApiError } from '../errors/ApiError'
import { AuthError } from '../errors/AuthError'
import { NetworkError } from '../errors/NetworkError'
import { handleUnknownError } from './globalErrorHandler'
import type { AxiosInstance, AxiosError } from 'axios'
import { authErrorHandler } from './authErrorHandler'

/** Attach interceptor to convert all axios errors into typed AppError subclasses */
export function createApiErrorInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Network error (no response)
      if (!error.response) {
        // Distinguish timeout vs offline
        if (error.code === 'ECONNABORTED') {
          throw NetworkError.timeout()
        }
        throw NetworkError.offline()
      }

      const { status, config, data } = error.response
      const url = config?.url ?? 'unknown'

      switch (status) {
        case 401:
          // Trigger auth flow then rethrow AuthError
          void authErrorHandler.handleUnauthorized()
          throw AuthError.tokenExpired()
        case 404:
          throw ApiError.notFound(url)
        case 422:
          const validation = ApiError.parseValidationErrors(data?.errors ?? [])
          throw ApiError.validationFailed(validation, url)
        case 500:
          throw ApiError.serverError(500, url)
        default:
          // Fallback – wrap unknown status
          throw handleUnknownError(error)
      }
    }
  )
}
