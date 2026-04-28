use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    window::Color,
    App, Manager,
};

const TRAY_ICON_BYTES: &[u8] = include_bytes!("tray-icon.png");

pub fn setup_tray(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let toggle = MenuItemBuilder::with_id("toggle", "⏸ 暂停防锁屏").build(app)?;
    let screensaver = MenuItemBuilder::with_id("screensaver", "🖥 打开屏保").build(app)?;
    let settings = MenuItemBuilder::with_id("settings", "⚙ 设置").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "退出 AntiSleep").build(app)?;

    let menu = MenuBuilder::new(app)
        .item(&toggle)
        .separator()
        .item(&screensaver)
        .item(&settings)
        .separator()
        .item(&quit)
        .build()?;

    let tray_icon = tauri::image::Image::from_bytes(TRAY_ICON_BYTES)
        .expect("Failed to load tray icon");

    let _tray = TrayIconBuilder::new()
        .icon(tray_icon)
        .icon_as_template(true)
        .tooltip("AntiSleep - 防锁屏工具")
        .menu(&menu)
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "toggle" => {
                    if crate::sleep_prevention::is_active() {
                        let _ = crate::sleep_prevention::stop_all();
                    } else {
                        let _ = crate::sleep_prevention::start(
                            crate::sleep_prevention::PreventionMode::System,
                            None,
                        );
                    }
                }
                "screensaver" => {
                    open_screensaver_window(app);
                }
                "settings" => {
                    open_settings_window(app);
                }
                "quit" => {
                    let _ = crate::sleep_prevention::stop_all();
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                open_tray_panel(app);
            }
        })
        .build(app)?;

    Ok(())
}

fn open_tray_panel(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("tray-panel") {
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        let _ = tauri::WebviewWindowBuilder::new(
            app,
            "tray-panel",
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("AntiSleep")
        .inner_size(380.0, 480.0)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .background_color(Color(0x1C, 0x1C, 0x1E, 0xFF))
        .build();
    }
}

fn open_screensaver_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("screensaver") {
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        let _ = tauri::WebviewWindowBuilder::new(
            app,
            "screensaver",
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("AntiSleep Screensaver")
        .decorations(false)
        .fullscreen(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .background_color(Color(0x00, 0x00, 0x00, 0xFF))
        .build();
    }
}

fn open_settings_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        let _ = tauri::WebviewWindowBuilder::new(
            app,
            "settings",
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("AntiSleep Settings")
        .inner_size(600.0, 700.0)
        .decorations(true)
        .center()
        .resizable(true)
        .background_color(Color(0x20, 0x20, 0x20, 0xFF))
        .build();
    }
}
