declare module "@fontsource-variable/jost" {}

interface Window {
  // Matomo queue
  _paq?: unknown[][]

  // Stuff exposed in dev
  settings: import("@/core/config")
  corpusListing: import("@/core/corpora/CorpusSet").CorpusSet
  corpusSelection: import("@/core/corpora/CorpusSet").CorpusSet
  auth: import("@/core/auth").AuthModule
}
declare const window: Window

declare module "*.peggy" {
  export const parse: <T = unknown>(input: string) => T
}

declare module "*.yaml" {
  const value: Record<string, unknown>
  export default value
}

// Specify type of locale files as strings
declare module "@/locale/*.yaml" {
  const value: Record<string, string>
  export default value
}

import "chart.js"
import type { InteractionModeFunction } from "chart.js"
declare module "chart.js" {
  export interface InteractionModeMap {
    xnearest: InteractionModeFunction
  }
}
