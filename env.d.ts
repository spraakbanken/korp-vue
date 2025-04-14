/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Declares vars available in `process.env`
interface ImportMetaEnv {
  readonly KORP_CONFIG_DIR: string
}
