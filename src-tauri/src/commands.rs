use crate::sleep_prevention;
use serde::Deserialize;

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
    // TODO: Implement process listing per platform
    Ok(vec![])
}

#[tauri::command]
pub async fn is_charging() -> Result<bool, String> {
    // TODO: Implement charging detection per platform
    Ok(false)
}
