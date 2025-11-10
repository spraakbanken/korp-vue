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
