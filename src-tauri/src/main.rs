#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod sleep_prevention;
mod tray;

#[cfg(target_os = "macos")]
mod platform_macos;
#[cfg(target_os = "windows")]
mod platform_windows;

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
            commands::start_prevention,
            commands::stop_prevention,
            commands::get_remaining_time,
            commands::list_processes,
            commands::is_charging,
        ])
        .build(tauri::generate_context!())
        .expect("error while building AntiSleep")
        .run(|_app_handle, event| {
            // Ensure prevention is stopped on app exit
            if let tauri::RunEvent::ExitRequested { .. } = event {
                let _ = sleep_prevention::stop_all();
            }
        });
}
