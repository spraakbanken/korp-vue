/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnvCustom
}

// Declares vars available in `process.env`
interface ImportMetaEnvCustom extends ImportMetaEnv {
  readonly KORP_HOST: string
}
