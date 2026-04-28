import type { PreventionMode, ProcessInfo } from '../types'

/**
 * Tauri Command wrappers — communicate with Rust backend
 */

const COMMAND_START_PREVENTION = 'start_prevention'
const COMMAND_STOP_PREVENTION = 'stop_prevention'
const COMMAND_GET_REMAINING_TIME = 'get_remaining_time'
const COMMAND_LIST_PROCESSES = 'list_processes'
const COMMAND_LIST_PROCESSES_DETAILED = 'list_processes_detailed'
const COMMAND_IS_CHARGING = 'is_charging'

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    return window.__TAURI__.core.invoke<T>(command, args)
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

/** Get remaining time in seconds */
export async function getRemainingTime(): Promise<number> {
  return invoke<number>(COMMAND_GET_REMAINING_TIME)
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
