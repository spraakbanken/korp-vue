import type { InstanceConfig } from '@/core/config/instanceConfig.types'
import type { Component } from 'vue'

export type AuthModule = {
  /** Check if logged in before app is initialized */
  init: (settings: InstanceConfig) => boolean | Promise<boolean>

  /** A small Vue component providing login/logout controls and showing current authentication status. */
  statusComponent: Component

  /** Submit credentials */
  login: (...args: unknown[]) => Promise<void>

  /** Trigger logout */
  logout: () => void

  /** Trigger interactive authentication workflow */
  attemptLogin: () => Promise<void>

  /** Get headers to include in API requests */
  getAuthorizationHeader: () => Record<string, string>

  /** Check if user has access to a given corpus */
  hasCredential: (corpusId: string) => boolean

  /** Get corpus ids the user has access to */
  getCredentials: () => string[]

  getUsername: () => string

  isLoggedIn: () => boolean
}
