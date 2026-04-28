use crate::sleep_prevention::PreventionMode;

/// Start sleep prevention on macOS using IOKit IOPMAssertionCreateWithName
pub fn start_prevention(mode: &PreventionMode) -> Result<u32, String> {
    let _assertion_type_str = match mode {
        PreventionMode::Display => "PreventUserIdleDisplaySleep",
        PreventionMode::System => "PreventUserIdleSystemSleep",
    };

    // Use caffeinate as a reliable fallback approach
    // This avoids the complexity of FFI bindings for IOKit
    let mut cmd = std::process::Command::new("caffeinate");
    cmd.arg("-w").arg(std::process::id().to_string());

    match mode {
        PreventionMode::Display => {
            cmd.arg("-d"); // Prevent display from sleeping
        }
        PreventionMode::System => {
            cmd.arg("-d").arg("-i").arg("-s"); // Prevent display, system, and disk sleep
        }
    }

    match cmd.spawn() {
        Ok(child) => {
            // Use child PID as "assertion ID" for tracking
            Ok(child.id())
        }
        Err(e) => Err(format!("Failed to start caffeinate: {}", e)),
    }
}

/// Stop sleep prevention on macOS by killing the caffeinate process
pub fn stop_prevention(assertion_id: u32) -> Result<(), String> {
    // Kill the caffeinate process by PID
    let result = std::process::Command::new("kill")
        .arg(assertion_id.to_string())
        .output();

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to stop caffeinate (pid {}): {}", assertion_id, e)),
    }
}
