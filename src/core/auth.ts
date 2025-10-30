export type AuthModule = {
  /** Get headers to include in API requests */
  getAuthorizationHeader: () => Record<string, string>

  /** Check if user has access to a given corpus */
  hasCredential: (corpusId: string) => boolean

  /** Get corpus ids the user has access to */
  getCredentials: () => string[]

  getUsername: () => string

  isLoggedIn: () => boolean
}

/** Authentication service */
export let auth: AuthModule

/** Set the authentication service. Must be used exactly once, before using the service. */
export function setAuth(service: AuthModule) {
  if (auth) throw new Error("Cannot reset global auth")
  auth = service

  if (import.meta.env.DEV) {
    window.auth = auth
  }
}
