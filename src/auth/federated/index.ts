/**
 * @file This is a login module that fetches a JWT from a source to see if the user is already logged in.
 *   If the JWT call fails, it will redirect the user to a login service, a service that will redirect
 *   the user back to Korp. After that the JWT call is expected to return a JWT.
 */

import type { AuthModule } from "../auth.types"
import AuthFedStatus from "./AuthFedStatus.vue"

type Options = {
  jwt_url: string
  login_service: string
  logout_service: string
}

type State = {
  credentials: string[]
  jwt: string
  username: string
}

type JwtPayload = {
  name?: string
  email: string
  scope: {
    corpora?: Record<string, number>
  }
  levels: Record<"READ" | "WRITE" | "ADMIN", number>
}

let options: Options

let state: State | undefined = undefined

const login = async () => {
  // TODO try to implement this again
  // if we already tried to login, don't redirect again, to avoid infinite loops
  // if (document.referrer == "") {
  // }
  window.location.href = `${options.login_service}?redirect=${window.location.href}`
}

const authFederated: AuthModule = {
  init: async (settings) => {
    if (typeof settings.auth_module != "object")
      throw new Error("federated_auth requires options (jwt_url, login_service, logout_service)")
    options = settings.auth_module.options as Options

    const response = await fetch(options.jwt_url, {
      headers: { accept: "text/plain" },
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status == 401) {
        console.log("User not logged in")
      } else {
        console.warn(`An error has occured: ${response.status}`)
      }
      return false
    }

    const jwt = await response.text()

    const jwtPayload: JwtPayload = JSON.parse(atob(jwt.split(".")[1]))
    const { name, email, scope, levels } = jwtPayload
    const username = name || email

    const credentials = Object.keys(scope.corpora || {})
      .filter((id) => (scope.corpora?.[id] || 0) >= levels["READ"])
      .map((id) => id.toUpperCase())

    state = { jwt, username, credentials }

    return true
  },
  statusComponent: AuthFedStatus,
  login,
  logout: () => (window.location.href = options.logout_service),
  attemptLogin: login,
  getAuthorizationHeader: (): Record<string, string> =>
    state ? { Authorization: `Bearer ${state.jwt}` } : {},
  hasCredential: (corpusId) => (state?.credentials || []).includes(corpusId),
  getCredentials: () => state?.credentials || [],
  getUsername: () => state!.username,
  isLoggedIn: () => !!state,
}

export default authFederated
