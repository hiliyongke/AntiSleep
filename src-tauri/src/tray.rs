use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    window::Color,
    App, Manager,
    Emitter,
};

const TRAY_ICON_BYTES: &[u8] = include_bytes!("tray-icon.png");

const EVENT_PREVENTION_TOGGLED: &str = "antisleep://prevention-toggled";

pub fn setup_tray(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let toggle = MenuItemBuilder::with_id("toggle", "防止休眠").build(app)?;
    let screensaver = MenuItemBuilder::with_id("screensaver", "打开屏保").build(app)?;
    let settings = MenuItemBuilder::with_id("settings", "设置").build(app)?;
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
                    let now_active = if crate::sleep_prevention::is_active() {
                        let _ = crate::sleep_prevention::stop_all();
                        false
                    } else {
                        let result = crate::sleep_prevention::start(
                            crate::sleep_prevention::PreventionMode::System,
                            None,
                        );
                        result.is_ok()
                    };

                    // Update menu text to reflect new state
                    if let Some(item) = app.menu().and_then(|m| m.get("toggle")) {
                        let text = if now_active { "允许休眠" } else { "防止休眠" };
                        let _ = item.as_menuitem().map(|mi| mi.set_text(text));
                    }

                    // Notify all frontend windows to sync state
                    let _ = app.emit(EVENT_PREVENTION_TOGGLED, now_active);
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
        .content_protected(true)
        .build();
    }
}

fn open_settings_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        // Get primary monitor to calculate 80% screen size
        let (win_width, win_height, min_width) = app
            .primary_monitor()
            .ok()
            .flatten()
            .map(|m| {
                let w = m.size().width as f64 / m.scale_factor() as f64;
                let h = m.size().height as f64 / m.scale_factor() as f64;
                (w * 0.8, h * 0.8, w * 0.56)
            })
            .unwrap_or((1536.0, 864.0, 1075.0));

        let _ = tauri::WebviewWindowBuilder::new(
            app,
            "settings",
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("AntiSleep Settings")
        .inner_size(win_width, win_height)
        .min_inner_size(min_width, 600.0)
        .decorations(true)
        .center()
        .resizable(true)
        .background_color(Color(0x20, 0x20, 0x20, 0xFF))
        .build();
    }
}
