/**
 * Persistent storage backed by tauri-plugin-store.
 * Falls back to localStorage in browser dev environment.
 *
 * syncedSet additionally emits a Tauri event so **all other windows**
 * reload that key — solving the multi-webview state isolation problem.
 */

import { Store } from '@tauri-apps/plugin-store'
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event'

const STORE_FILE = 'antisleep-settings.json'
const SYNC_EVENT = 'antisleep://state-changed'

let storePromise: Promise<Store> | null = null

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

async function getStore(): Promise<Store | null> {
  if (!isTauri()) return null
  if (!storePromise) {
    storePromise = Store.load(STORE_FILE, { defaults: {}, autoSave: 500 })
  }
  try {
    return await storePromise
  } catch (e) {
    console.warn('[persist] failed to load store', e)
    return null
  }
}

export async function persistGet<T>(key: string): Promise<T | null> {
  const store = await getStore()
  if (store) {
    const v = await store.get<T>(key)
    return v ?? null
  }
  try {
    const raw = localStorage.getItem(`antisleep:${key}`)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function persistSet<T>(key: string, value: T): Promise<void> {
  const store = await getStore()
  if (store) {
    await store.set(key, value as unknown)
    await store.save()
    return
  }
  try {
    localStorage.setItem(`antisleep:${key}`, JSON.stringify(value))
  } catch (e) {
    console.warn('[persist] localStorage set failed', e)
  }
}

/**
 * Persist a value AND broadcast to every other webview window so they
 * can refresh their in-memory store. Pass a `sourceId` unique to this
 * webview to avoid echoes on the originating window.
 */
export async function syncedSet<T>(
  key: string,
  value: T,
  sourceId: string,
): Promise<void> {
  await persistSet(key, value)
  if (!isTauri()) return
  try {
    await emit(SYNC_EVENT, { key, sourceId })
  } catch (e) {
    console.warn('[persist] emit failed', e)
  }
}

/**
 * Subscribe to cross-window state-change events.
 * Handler is invoked with the changed key when it originates from
 * another webview (self-emits are filtered via sourceId).
 */
export async function subscribeStateChanges(
  selfId: string,
  handler: (key: string) => void,
): Promise<UnlistenFn | null> {
  if (!isTauri()) return null
  try {
    return await listen<{ key: string; sourceId: string }>(SYNC_EVENT, (e) => {
      if (e.payload?.sourceId === selfId) return
      if (e.payload?.key) handler(e.payload.key)
    })
  } catch (e) {
    console.warn('[persist] listen failed', e)
    return null
  }
}

/** Stable per-webview id — regenerated each tab reload, which is fine. */
export const selfWebviewId = (() => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `win-${Date.now()}-${Math.random().toString(36).slice(2)}`
})()
