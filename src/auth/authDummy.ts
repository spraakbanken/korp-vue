import type { VueAuthModule } from "./auth.types"

export const dummyAuth: VueAuthModule = {
  init: () => false,
  statusComponent: () => {},
  login: async () => {},
  logout: () => {},
  attemptLogin: async () => {},
  getAuthorizationHeader: () => ({}),
  hasCredential: () => false,
  getCredentials: () => [],
  getUsername: () => "",
  isLoggedIn: () => false,
}
