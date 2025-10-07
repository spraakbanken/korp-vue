import type { AuthModule } from './auth.types'

export const dummyAuth: AuthModule = {
  init: () => false,
  statusComponent: () => {},
  login: async () => {},
  logout: () => {},
  getAuthorizationHeader: () => ({}),
  hasCredential: () => false,
  getCredentials: () => [],
  getUsername: () => '',
  isLoggedIn: () => false,
}
