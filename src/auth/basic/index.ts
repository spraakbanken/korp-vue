import type { AuthModule } from "@/auth/auth.types"
import AuthStatusBasic from "./AuthBasicStatus.vue"
import { PromiseStarter, toBase64 } from "@/core/util"
import settings from "@/core/config"
import { ref } from "vue"
import { StorageSerializers, useLocalStorage } from "@vueuse/core"

export type Creds = {
  /** Username */
  name: string
  /** Uppercase ids of protected corpora which the user specifically has access to. */
  credentials: string[]
  /** Basic auth token */
  auth: string
}

/** In-memory storage of user data */
export const creds = ref<Creds>()

/** Persistent storage of user data, enabled by user */
export const storage = useLocalStorage<Creds | undefined>("korp.auth.basic", undefined, {
  serializer: StorageSerializers.object,
})

export const attemptLogin = new PromiseStarter()

export async function login(...args: unknown[]): Promise<void> {
  const [name, pass, saveLogin] = args as [string, string, boolean]
  if (name == null || pass == null) throw new Error("Missing name and password")
  const token = toBase64(name + ":" + pass)
  const url = `${settings.korp_backend_url}/authenticate`
  const headers = { Authorization: `Basic ${token}` }
  const response = await fetch(url, { headers })
  const data = await response.json()

  if (!data.corpora) throw new Error("No corpora in auth response")

  creds.value = { name, credentials: data.corpora, auth: token }
  if (saveLogin) storage.value = creds.value
}

const authBasic: AuthModule = {
  init: () => {
    creds.value = storage.value
    return !!creds.value
  },
  statusComponent: AuthStatusBasic,
  login,
  logout: () => {
    creds.value = undefined
    storage.value = undefined
  },
  attemptLogin: () => attemptLogin.start(),
  getAuthorizationHeader: (): Record<string, string> =>
    creds.value ? { Authorization: `Basic ${creds.value.auth}` } : {},
  hasCredential: (corpusId) => creds.value?.credentials?.includes(corpusId.toUpperCase()) || false,
  getCredentials: () => creds.value?.credentials || [],
  getUsername: () => creds.value!.name,
  isLoggedIn: () => !!creds.value,
}

export default authBasic
