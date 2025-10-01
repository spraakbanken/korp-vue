interface Window {
  // Matomo queue
  _paq?: unknown[][]

  // Stuff exposed in dev
  settings: import('@/core/config')
  corpusListing: import('@/core/corpora/CorpusSet.ts').CorpusSet
  corpusSelection: import('@/core/corpora/CorpusSet.ts').CorpusSet
}
declare const window: Window
