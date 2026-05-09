import { AuthError } from '../errors/AuthError'
import { SecureStore } from 'expo-secure-store'
import { useLogoutAllStores } from '../../state/logout' // assume this exists
import * as NavigationService from '../../navigation/NavigationService' // assume navigation helper
import { showToast } from '../../ui/toast' // generic toast helper

/** Handle 401/unauthorized scenarios */
export const authErrorHandler = {
  async handleUnauthorized(): Promise<void> {
    // Clear stored tokens
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    // Reset Zustand stores – placeholder implementation
    if (typeof useLogoutAllStores === 'function') {
      useLogoutAllStores()
    }
    // Navigate to login screen
    NavigationService.navigate('Login')
    // Inform user
    showToast('Session expired. Please login again.')
  },

  async handleTokenRefreshFailed(): Promise<void> {
    // Same flow as unauthorized – could log differently
    await this.handleUnauthorized()
  },

  isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError
  },
}

// Comments:
// - Clearing all stores prevents stale user state after token expiry.
// - Navigation occurs after stores are cleared to avoid race conditions.
