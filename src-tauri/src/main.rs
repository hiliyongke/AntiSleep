#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod sleep_prevention;
mod smart_scene;
mod tray;

#[cfg(target_os = "macos")]
mod platform_macos;
#[cfg(target_os = "windows")]
mod platform_windows;

use smart_scene::SmartSceneManager;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Setup system tray
            tray::setup_tray(app)?;
            
            // Initialize and manage SmartSceneManager
            let manager = SmartSceneManager::new(app.handle().clone());
            app.manage(manager);
            
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Don't close main window, just hide it
                if window.label() == "main" {
                    api.prevent_close();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_prevention_status,
            commands::start_prevention,
            commands::stop_prevention,
            commands::list_processes,
            commands::list_processes_detailed,
            commands::is_charging,
            commands::prepare_screensaver_window,
            commands::close_screensaver_windows,
            // Smart scene commands
            start_smart_scene_monitoring,
            stop_smart_scene_monitoring,
            update_smart_scene_config,
        ])
        .build(tauri::generate_context!())
        .expect("error while building AntiSleep")
        .run(|app_handle, event| {
            // Ensure prevention is stopped on app exit
            if let tauri::RunEvent::ExitRequested { .. } = event {
                let _ = sleep_prevention::stop_all();
                // Stop smart scene monitoring
                let manager = app_handle.state::<SmartSceneManager>();
                let _ = tauri::async_runtime::block_on(manager.stop_monitoring());
            }
        });
}

#[tauri::command]
async fn start_smart_scene_monitoring(app: tauri::AppHandle) {
    let manager = app.state::<SmartSceneManager>();
    manager.start_monitoring().await;
}

#[tauri::command]
async fn stop_smart_scene_monitoring(app: tauri::AppHandle) {
    let manager = app.state::<SmartSceneManager>();
    manager.stop_monitoring().await;
}

#[tauri::command]
async fn update_smart_scene_config(app: tauri::AppHandle, config: smart_scene::SmartSceneConfig) {
    let manager = app.state::<SmartSceneManager>();
    manager.update_config(config).await;
}
