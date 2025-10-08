import { inject } from 'vue'
import { dummyAuth } from './authDummy'
import type { AuthModule } from './auth.types'
import { setAuth } from '@/core/auth'
import { once } from 'lodash'

const setAuthOnce = once(setAuth)

export function useAuth() {
  // Inject configured auth module or fall back to dummy implementation
  const auth = inject<AuthModule>('korp.auth', dummyAuth)

  // At first usage, set the auth service for core code.
  setAuthOnce(auth)

  return auth
}
