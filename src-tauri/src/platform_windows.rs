use crate::sleep_prevention::PreventionMode;

/// Start sleep prevention on Windows using SetThreadExecutionState
pub fn start_prevention(mode: &PreventionMode) -> Result<u32, String> {
    use windows_sys::Win32::System::Power::{
        SetThreadExecutionState, ES_CONTINUOUS, ES_DISPLAY_REQUIRED, ES_SYSTEM_REQUIRED,
    };

    let flags = match mode {
        PreventionMode::Display => ES_CONTINUOUS | ES_DISPLAY_REQUIRED,
        PreventionMode::System => ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED,
    };

    let result = unsafe { SetThreadExecutionState(flags) };

    if result != 0 {
        // Windows doesn't use assertion IDs, return dummy value
        Ok(1)
    } else {
        Err("SetThreadExecutionState failed".to_string())
    }
}

/// Stop sleep prevention on Windows by resetting SetThreadExecutionState
pub fn stop_prevention() -> Result<(), String> {
    use windows_sys::Win32::System::Power::{SetThreadExecutionState, ES_CONTINUOUS};

    let result = unsafe { SetThreadExecutionState(ES_CONTINUOUS) };

    if result != 0 {
        Ok(())
    } else {
        Err("SetThreadExecutionState reset failed".to_string())
    }
}
