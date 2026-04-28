/**
 * System-level services: autostart, global shortcuts.
 * All functions are no-op friendly (safe to call in browser dev).
 */

import {
  enable as enableAutostart,
  disable as disableAutostart,
  isEnabled as isAutostartEnabled,
} from '@tauri-apps/plugin-autostart'
import {
  register,
  unregister,
  isRegistered,
} from '@tauri-apps/plugin-global-shortcut'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

/* ----------------------------- Autostart ----------------------------- */

export async function applyAutostart(enabled: boolean): Promise<void> {
  if (!isTauri()) return
  try {
    const current = await isAutostartEnabled()
    if (enabled && !current) await enableAutostart()
    else if (!enabled && current) await disableAutostart()
  } catch (e) {
    console.warn('[autostart]', e)
  }
}

export async function checkAutostart(): Promise<boolean> {
  if (!isTauri()) return false
  try {
    return await isAutostartEnabled()
  } catch {
    return false
  }
}

/* --------------------------- Global shortcut ------------------------- */

export type ShortcutAction = 'enable' | 'disable' | 'screensaver'

const activeHandlers = new Map<string, ShortcutAction>()

function normalize(combo: string): string {
  // Tauri v2 expects "CommandOrControl+Shift+S" etc. — already compatible.
  return combo.trim()
}

export async function registerShortcut(
  combo: string,
  handler: () => void,
  action: ShortcutAction,
): Promise<boolean> {
  if (!isTauri()) return false
  const accelerator = normalize(combo)
  if (!accelerator) return false
  try {
    if (await isRegistered(accelerator)) {
      await unregister(accelerator)
    }
    await register(accelerator, (event) => {
      // v2 fires on both Pressed and Released — only act on Pressed.
      if (event.state === 'Pressed') handler()
    })
    activeHandlers.set(accelerator, action)
    return true
  } catch (e) {
    console.warn(`[shortcut] register ${accelerator} failed`, e)
    return false
  }
}

export async function unregisterShortcut(combo: string): Promise<void> {
  if (!isTauri()) return
  const accelerator = normalize(combo)
  if (!accelerator) return
  try {
    if (await isRegistered(accelerator)) {
      await unregister(accelerator)
    }
    activeHandlers.delete(accelerator)
  } catch (e) {
    console.warn('[shortcut] unregister failed', e)
  }
}

export async function unregisterAllShortcuts(): Promise<void> {
  if (!isTauri()) return
  for (const combo of Array.from(activeHandlers.keys())) {
    await unregisterShortcut(combo)
  }
}
