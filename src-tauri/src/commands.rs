use crate::sleep_prevention;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use sysinfo::System;
use tauri::{AppHandle, Manager};

#[cfg(target_os = "macos")]
use objc2_app_kit::{
    NSNormalWindowLevel,
    NSScreenSaverWindowLevel,
    NSWindow,
    NSWindowCollectionBehavior,
};

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PreventionModeDto {
    Display,
    System,
}

impl From<PreventionModeDto> for sleep_prevention::PreventionMode {
    fn from(val: PreventionModeDto) -> Self {
        match val {
            PreventionModeDto::Display => sleep_prevention::PreventionMode::Display,
            PreventionModeDto::System => sleep_prevention::PreventionMode::System,
        }
    }
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_bytes: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PreventionStatus {
    pub active: bool,
    pub assertion_id: Option<u32>,
}

#[tauri::command]
pub async fn get_prevention_status() -> Result<PreventionStatus, String> {
    let assertion_id = sleep_prevention::active_assertion_id();
    Ok(PreventionStatus {
        active: assertion_id.is_some(),
        assertion_id,
    })
}

#[tauri::command]
pub async fn start_prevention(
    mode: PreventionModeDto,
) -> Result<u32, String> {
    sleep_prevention::start(mode.into(), None)
}

#[tauri::command]
pub async fn stop_prevention(assertion_id: u32) -> Result<(), String> {
    sleep_prevention::stop(assertion_id)
}

#[tauri::command]
pub async fn list_processes() -> Result<Vec<String>, String> {
    let mut sys = System::new();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let mut names: HashSet<String> = HashSet::new();
    for (_pid, proc_) in sys.processes() {
        let raw = proc_.name().to_string_lossy().to_string();
        if raw.is_empty() {
            continue;
        }
        // Normalize: strip path and extension so users can match "python" instead of "/usr/bin/python3.exe"
        let base = raw
            .rsplit(['/', '\\'])
            .next()
            .unwrap_or(&raw)
            .to_string();
        let stem = base.rsplit_once('.').map(|(s, _)| s.to_string()).unwrap_or_else(|| base.clone());
        
        // Also add the full base name (with extension) as an option
        names.insert(stem.clone());
        names.insert(base);
    }
    let mut list: Vec<String> = names.into_iter().collect();
    list.sort();
    Ok(list)
}

/// Returns detailed process list with PID, name, CPU usage, and memory.
/// Processes are sorted by CPU usage (descending), then by name.
///
/// Note: CPU usage requires two refresh calls with a small delay between them
/// to calculate meaningful values (sysinfo measures delta over time).
#[tauri::command]
pub async fn list_processes_detailed() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = System::new();

    // First refresh: establish baseline
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    // Wait for minimum CPU update interval so sysinfo can measure delta
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);

    // Second refresh: now cpu_usage() returns valid values
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let mut procs: Vec<ProcessInfo> = Vec::new();
    for (pid, proc_) in sys.processes() {
        let raw = proc_.name().to_string_lossy().to_string();
        if raw.is_empty() {
            continue;
        }
        let base = raw
            .rsplit(['/', '\\'])
            .next()
            .unwrap_or(&raw)
            .to_string();
        let stem = base.rsplit_once('.').map(|(s, _)| s.to_string()).unwrap_or(base);

        procs.push(ProcessInfo {
            pid: pid.as_u32(),
            name: stem,
            cpu_usage: proc_.cpu_usage(),
            memory_bytes: proc_.memory(),
        });
    }

    // Sort: by CPU usage descending, then by name ascending
    procs.sort_by(|a, b| {
        b.cpu_usage
            .partial_cmp(&a.cpu_usage)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| a.name.cmp(&b.name))
    });

    Ok(procs)
}

#[tauri::command]
pub async fn is_charging() -> Result<bool, String> {
    let manager = battery::Manager::new().map_err(|e| e.to_string())?;
    for battery in manager.batteries().map_err(|e| e.to_string())? {
        let bat = battery.map_err(|e| e.to_string())?;
        match bat.state() {
            battery::State::Charging | battery::State::Full => return Ok(true),
            _ => {}
        }
    }
    // No battery detected → treat as desktop / always-on-power
    Ok(true)
}

#[tauri::command]
pub async fn prepare_screensaver_window(app: AppHandle, label: String) -> Result<(), String> {
    let Some(window) = app.get_webview_window(&label) else {
        return Ok(());
    };

    #[cfg(target_os = "macos")]
    {
        let ns_window = window.ns_window().map_err(|e| e.to_string())? as usize;
        let (tx, rx) = std::sync::mpsc::channel();

        app.run_on_main_thread(move || {
            let result = configure_macos_screensaver_window(ns_window);
            let _ = tx.send(result);
        })
        .map_err(|e| e.to_string())?;

        rx.recv().map_err(|e| e.to_string())??;
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = window;
    }

    Ok(())
}

#[tauri::command]
pub async fn close_screensaver_windows(app: AppHandle) -> Result<(), String> {
    let windows: Vec<_> = app
        .webview_windows()
        .into_iter()
        .filter(|(label, _)| is_screensaver_label(label))
        .map(|(_, window)| window)
        .collect();

    #[cfg(target_os = "macos")]
    {
        let ns_windows: Vec<usize> = windows
            .iter()
            .filter_map(|window| window.ns_window().ok().map(|ptr| ptr as usize))
            .collect();
        let (tx, rx) = std::sync::mpsc::channel();

        app.run_on_main_thread(move || {
            for ns_window in ns_windows {
                let _ = restore_macos_screensaver_window(ns_window);
            }
            let _ = tx.send(());
        })
        .map_err(|e| e.to_string())?;

        rx.recv().map_err(|e| e.to_string())?;
    }

    for window in windows {
        let _ = window.destroy().or_else(|_| window.close());
    }

    Ok(())
}

fn is_screensaver_label(label: &str) -> bool {
    label == "screensaver" || label.starts_with("screensaver-")
}

#[cfg(target_os = "macos")]
fn configure_macos_screensaver_window(ns_window: usize) -> Result<(), String> {
    if ns_window == 0 {
        return Err("NSWindow pointer is null".to_string());
    }

    unsafe {
        let ns_window = &*(ns_window as *mut NSWindow);
        let mut behavior = ns_window.collectionBehavior();
        behavior |= NSWindowCollectionBehavior::CanJoinAllSpaces;
        behavior |= NSWindowCollectionBehavior::FullScreenAuxiliary;
        behavior |= NSWindowCollectionBehavior::Stationary;
        behavior |= NSWindowCollectionBehavior::IgnoresCycle;
        behavior &= !NSWindowCollectionBehavior::FullScreenPrimary;
        behavior &= !NSWindowCollectionBehavior::FullScreenNone;

        ns_window.setCollectionBehavior(behavior);
        ns_window.setLevel(NSScreenSaverWindowLevel);
        ns_window.setHidesOnDeactivate(false);
        ns_window.setCanHide(false);
        ns_window.orderFrontRegardless();
    }

    Ok(())
}

#[cfg(target_os = "macos")]
fn restore_macos_screensaver_window(ns_window: usize) -> Result<(), String> {
    if ns_window == 0 {
        return Ok(());
    }

    unsafe {
        let ns_window = &*(ns_window as *mut NSWindow);
        let mut behavior = ns_window.collectionBehavior();
        behavior &= !NSWindowCollectionBehavior::CanJoinAllSpaces;
        behavior &= !NSWindowCollectionBehavior::FullScreenAuxiliary;
        behavior &= !NSWindowCollectionBehavior::Stationary;
        behavior &= !NSWindowCollectionBehavior::IgnoresCycle;
        behavior &= !NSWindowCollectionBehavior::FullScreenPrimary;
        behavior &= !NSWindowCollectionBehavior::FullScreenNone;

        ns_window.setCollectionBehavior(behavior);
        ns_window.setLevel(NSNormalWindowLevel);
        ns_window.setCanHide(true);
        ns_window.setHidesOnDeactivate(false);
    }

    Ok(())
}
