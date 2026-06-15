import type { AuthModule } from "@/core/auth"
import type { Component } from "vue"

/** Authentication service extended for interactive behaviour */
export type VueAuthModule = AuthModule & {
  /** Check if logged in before app is initialized */
  init: () => boolean | Promise<boolean>

  /** A small Vue component providing login/logout controls and showing current authentication status. */
  statusComponent: Component

  /** Submit credentials */
  login: (...args: unknown[]) => Promise<void>

  /** Trigger logout */
  logout: () => void

  /** Trigger interactive authentication workflow */
  attemptLogin: () => Promise<void>
}
