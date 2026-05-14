import type { PreventionMode, ProcessInfo } from '../types'
import { invoke as tauriInvoke } from '@tauri-apps/api/core'

/**
 * Tauri Command wrappers — communicate with Rust backend
 */

const COMMAND_START_PREVENTION = 'start_prevention'
const COMMAND_STOP_PREVENTION = 'stop_prevention'
const COMMAND_GET_PREVENTION_STATUS = 'get_prevention_status'
const COMMAND_LIST_PROCESSES = 'list_processes'
const COMMAND_LIST_PROCESSES_DETAILED = 'list_processes_detailed'
const COMMAND_IS_CHARGING = 'is_charging'
const COMMAND_PREPARE_SCREENSAVER_WINDOW = 'prepare_screensaver_window'
const COMMAND_CLOSE_SCREENSAVER_WINDOWS = 'close_screensaver_windows'

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    return tauriInvoke<T>(command, args)
  }
  // Dev fallback — mock responses
  console.log(`[Tauri Mock] invoke: ${command}`, args)
  return '' as unknown as T
}

/** Start sleep prevention, returns assertion ID (macOS) or 0 (Windows) */
export async function startPrevention(mode: PreventionMode): Promise<number> {
  return invoke<number>(COMMAND_START_PREVENTION, { mode })
}

/** Stop sleep prevention by assertion ID */
export async function stopPrevention(assertionId: number): Promise<void> {
  return invoke<void>(COMMAND_STOP_PREVENTION, { assertionId })
}

export interface PreventionStatus {
  active: boolean
  assertionId: number | null
}

/** Read current prevention runtime state from the backend */
export async function getPreventionStatus(): Promise<PreventionStatus> {
  if (typeof window !== 'undefined' && !window.__TAURI__) {
    return { active: false, assertionId: null }
  }
  return invoke<PreventionStatus>(COMMAND_GET_PREVENTION_STATUS)
}

/** List running process names */
export async function listProcesses(): Promise<string[]> {
  return invoke<string[]>(COMMAND_LIST_PROCESSES)
}

/** List running processes with details (PID, name, CPU, memory) */
export async function listProcessesDetailed(): Promise<ProcessInfo[]> {
  return invoke<ProcessInfo[]>(COMMAND_LIST_PROCESSES_DETAILED)
}

/** Check if device is charging */
export async function isCharging(): Promise<boolean> {
  return invoke<boolean>(COMMAND_IS_CHARGING)
}

/** Apply platform-specific screensaver window behavior. */
export async function prepareScreensaverWindow(label: string): Promise<void> {
  return invoke<void>(COMMAND_PREPARE_SCREENSAVER_WINDOW, { label })
}

/** Force-close all screensaver windows after restoring platform-specific window behavior. */
export async function closeScreensaverWindows(): Promise<void> {
  return invoke<void>(COMMAND_CLOSE_SCREENSAVER_WINDOWS)
}
