import { inject } from "vue"
import { dummyAuth } from "./authDummy"
import type { VueAuthModule } from "./auth.types"
import { setAuth } from "@/core/auth"
import { once } from "lodash"
import { injectionKeys } from "@/injection"

const setAuthOnce = once(setAuth)

export function useAuth() {
  // Inject configured auth module or fall back to dummy implementation
  const auth = inject<VueAuthModule>(injectionKeys.auth, dummyAuth)

  // At first usage, set the auth service for core code.
  setAuthOnce(auth)

  return auth
}
