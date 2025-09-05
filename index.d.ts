interface Window {
  // Matomo queue
  _paq?: unknown[][]

  // Stuff exposed in dev
  settings: import('@/core/config')
}
declare const window: Window
