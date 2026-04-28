use serde::Deserialize;
use std::sync::Mutex;
use std::time::Instant;

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "lowercase")]
pub enum PreventionMode {
    Display,
    System,
}

// Global state for active prevention
static PREVENTION_STATE: Mutex<Option<ActivePrevention>> = Mutex::new(None);

struct ActivePrevention {
    assertion_id: u32,
    duration_minutes: Option<u64>, // None = infinite
    started_at: Instant,
}

/// Start sleep prevention — dispatches to platform-specific implementation
pub fn start(mode: PreventionMode, duration_minutes: Option<u64>) -> Result<u32, String> {
    let assertion_id = start_platform(&mode)?;

    let mut state = PREVENTION_STATE.lock().map_err(|e| e.to_string())?;
    *state = Some(ActivePrevention {
        assertion_id,
        duration_minutes,
        started_at: Instant::now(),
    });

    Ok(assertion_id)
}

/// Stop sleep prevention by assertion ID
pub fn stop(assertion_id: u32) -> Result<(), String> {
    stop_platform(assertion_id)?;

    let mut state = PREVENTION_STATE.lock().map_err(|e| e.to_string())?;
    *state = None;

    Ok(())
}

/// Stop all active prevention (used on app exit)
pub fn stop_all() -> Result<(), String> {
    let mut state = PREVENTION_STATE.lock().map_err(|e| e.to_string())?;
    if let Some(active) = state.take() {
        stop_platform(active.assertion_id)?;
    }
    Ok(())
}

/// Get remaining time in seconds (None = infinite)
pub fn get_remaining_seconds() -> Result<Option<u64>, String> {
    let state = PREVENTION_STATE.lock().map_err(|e| e.to_string())?;
    match &*state {
        None => Ok(None),
        Some(active) => {
            let elapsed = active.started_at.elapsed().as_secs();
            match active.duration_minutes {
                None => Ok(None), // infinite
                Some(minutes) => {
                    let total_secs = minutes * 60;
                    let remaining = total_secs.saturating_sub(elapsed);
                    Ok(Some(remaining))
                }
            }
        }
    }
}

/// Check if prevention is currently active
pub fn is_active() -> bool {
    PREVENTION_STATE
        .lock()
        .map(|s| s.is_some())
        .unwrap_or(false)
}

// Platform-specific dispatch

#[cfg(target_os = "macos")]
fn start_platform(mode: &PreventionMode) -> Result<u32, String> {
    crate::platform_macos::start_prevention(mode)
}

#[cfg(target_os = "macos")]
fn stop_platform(assertion_id: u32) -> Result<(), String> {
    crate::platform_macos::stop_prevention(assertion_id)
}

#[cfg(target_os = "windows")]
fn start_platform(mode: &PreventionMode) -> Result<u32, String> {
    crate::platform_windows::start_prevention(mode)
}

#[cfg(target_os = "windows")]
fn stop_platform(assertion_id: u32) -> Result<(), String> {
    let _ = assertion_id;
    crate::platform_windows::stop_prevention()
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn start_platform(_mode: &PreventionMode) -> Result<u32, String> {
    Err("Unsupported platform".to_string())
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn stop_platform(_assertion_id: u32) -> Result<(), String> {
    Err("Unsupported platform".to_string())
}
