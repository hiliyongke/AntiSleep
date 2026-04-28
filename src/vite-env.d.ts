/// <reference types="vite/client" />

interface Window {
  __TAURI__?: {
    core: {
      invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>
    }
  }
  __TAURI_INTERNALS__?: {
    metadata?: {
      currentWebview?: { label?: string }
      currentWindow?: { label?: string }
    }
  }
}
