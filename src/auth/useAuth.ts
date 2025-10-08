import { inject } from 'vue'
import { dummyAuth } from './authDummy'
import type { AuthModule } from './auth.types'
import { baseHeaders } from '@/core/api/common'

let auth: AuthModule
let currentHeader: Record<string, string> = {}

export function useAuth() {
  // Only at the first usage
  if (!auth) {
    // Inject configured auth module or fall back to dummy implementation
    auth = inject<AuthModule>('korp.auth', dummyAuth)

    // Save original implementations before decorating
    const initOld = auth.init
    const logoutOld = auth.logout
    const loginOld = auth.login

    // Decorate init to enable auth in requests
    auth.init = async (settings) => {
      await initOld(settings)
      updateHeader()
      return auth.isLoggedIn()
    }

    // Decorate login to enable auth in requests
    auth.login = async (...args) => loginOld(...args).finally(updateHeader)

    // Decorate logout to disable auth in requests
    auth.logout = () => {
      logoutOld()
      updateHeader()
    }
  }

  // Add or remove auth header for backend requests
  function updateHeader() {
    if (auth.isLoggedIn()) {
      currentHeader = auth.getAuthorizationHeader()
      Object.assign(baseHeaders, currentHeader)
    } else {
      Object.keys(currentHeader).forEach((headerName) => delete baseHeaders[headerName])
    }
  }

  return auth
}
