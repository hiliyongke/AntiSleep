use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::Emitter;
use serde::{Serialize, Deserialize};
use std::time::Duration;
use sysinfo::System;

#[derive(Clone, Serialize, Deserialize)]
pub struct SmartSceneConfig {
    pub poll_interval_seconds: u64,
    pub auto_on_charge: bool,
    pub process_names: Vec<String>,
}

#[derive(Clone, Serialize)]
struct SmartSceneEvent {
    action: String,  // "start" or "stop"
    reason: String,  // "charge" or "process"
}

struct SmartSceneState {
    monitoring: bool,
    should_stop: bool,
    config: SmartSceneConfig,
}

pub struct SmartSceneManager {
    state: Arc<Mutex<SmartSceneState>>,
    app_handle: tauri::AppHandle,
}

impl SmartSceneManager {
    pub fn new(app_handle: tauri::AppHandle) -> Self {
        Self {
            state: Arc::new(Mutex::new(SmartSceneState {
                monitoring: false,
                should_stop: false,
                config: SmartSceneConfig {
                    poll_interval_seconds: 10,
                    auto_on_charge: false,
                    process_names: vec![],
                },
            })),
            app_handle,
        }
    }
    
    pub async fn start_monitoring(&self) {
        let mut state = self.state.lock().await;
        
        if state.monitoring {
            return;
        }
        
        state.monitoring = true;
        state.should_stop = false;
        let config = state.config.clone();
        drop(state);
        
        let state_clone = self.state.clone();
        let app_handle_clone = self.app_handle.clone();
        
        tauri::async_runtime::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(config.poll_interval_seconds));
            
            let mut last_charge_state: Option<bool> = None;
            let mut last_process_state: Option<bool> = None;
            
            loop {
                interval.tick().await;
                
                let mut state = state_clone.lock().await;
                
                if state.should_stop {
                    state.monitoring = false;
                    break;
                }
                
                let config = state.config.clone();
                drop(state);
                
                // Check charging
                if config.auto_on_charge {
                    let charging = Self::check_charging().await;
                    
                    if let Some(last) = last_charge_state {
                        if charging && !last {
                            // Started charging
                            let _ = app_handle_clone.emit("smart-scene-status-change", 
                                SmartSceneEvent { action: "start".to_string(), reason: "charge".to_string() });
                        } else if !charging && last {
                            // Stopped charging
                            let _ = app_handle_clone.emit("smart-scene-status-change",
                                SmartSceneEvent { action: "stop".to_string(), reason: "charge".to_string() });
                        }
                    }
                    last_charge_state = Some(charging);
                }
                
                // Check processes
                if !config.process_names.is_empty() {
                    let any_running = Self::check_processes(&config.process_names).await;
                    
                    if let Some(last) = last_process_state {
                        if any_running && !last {
                            let _ = app_handle_clone.emit("smart-scene-status-change",
                                SmartSceneEvent { action: "start".to_string(), reason: "process".to_string() });
                        } else if !any_running && last {
                            let _ = app_handle_clone.emit("smart-scene-status-change",
                                SmartSceneEvent { action: "stop".to_string(), reason: "process".to_string() });
                        }
                    }
                    last_process_state = Some(any_running);
                }
            }
        });
    }
    
    pub async fn stop_monitoring(&self) {
        let mut state = self.state.lock().await;
        state.should_stop = true;
    }
    
    pub async fn update_config(&self, config: SmartSceneConfig) {
        let mut state = self.state.lock().await;
        state.config = config;
    }
    
    #[allow(dead_code)]
    pub async fn get_config(&self) -> SmartSceneConfig {
        let state = self.state.lock().await;
        state.config.clone()
    }
    
    async fn check_charging() -> bool {
        let manager = match battery::Manager::new() {
            Ok(m) => m,
            Err(_) => return true, // No battery detected → treat as desktop / always-on-power
        };
        let batteries = match manager.batteries() {
            Ok(b) => b,
            Err(_) => return false,
        };
        for battery in batteries {
            if let Ok(bat) = battery {
                match bat.state() {
                    battery::State::Charging | battery::State::Full => return true,
                    _ => {}
                }
            }
        }
        false
    }
    
    async fn check_processes(process_names: &[String]) -> bool {
        let mut sys = System::new();
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
        
        let running: Vec<String> = sys.processes()
            .iter()
            .map(|(_, p)| {
                let raw = p.name().to_string_lossy().to_string();
                let base = raw
                    .rsplit(['/', '\\'])
                    .next()
                    .unwrap_or(&raw)
                    .to_string();
                let stem = base.rsplit_once('.').map(|(s, _)| s.to_string()).unwrap_or_else(|| base.clone());
                stem
            })
            .collect();
        
        let lowered_running: Vec<String> = running.iter().map(|s| s.to_lowercase()).collect();
        let wanted: Vec<String> = process_names.iter().map(|s| s.to_lowercase()).collect();
        
        wanted.iter().any(|w| lowered_running.iter().any(|r| r == w || r.contains(w)))
    }
}
