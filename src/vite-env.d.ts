/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Set to '1' in production to enable cloud mode (passcode gate + /api backend).
  readonly VITE_USE_CLOUD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
