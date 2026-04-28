use crate::sleep_prevention;
use serde::Deserialize;
use std::collections::HashSet;
use sysinfo::System;

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
pub async fn get_remaining_time() -> Result<Option<u64>, String> {
    sleep_prevention::get_remaining_seconds()
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
        let stem = base.rsplit_once('.').map(|(s, _)| s.to_string()).unwrap_or(base);
        names.insert(stem);
    }
    let mut list: Vec<String> = names.into_iter().collect();
    list.sort();
    Ok(list)
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
