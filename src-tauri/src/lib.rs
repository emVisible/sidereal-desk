mod location;

use location::ObserverLocation;
use std::sync::Mutex;
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State, WebviewWindow,
};

struct AppState {
    location: Mutex<ObserverLocation>,
}

struct TrayState {
    settings_item: MenuItem<tauri::Wry>,
    always_on_top_item: CheckMenuItem<tauri::Wry>,
    fix_position_item: CheckMenuItem<tauri::Wry>,
    quit_item: MenuItem<tauri::Wry>,
}

fn validate_coords(latitude: f64, longitude: f64) -> Result<(), String> {
    if !(-90.0..=90.0).contains(&latitude) {
        return Err("latitude must be between -90 and 90".into());
    }
    if !(-180.0..=180.0).contains(&longitude) {
        return Err("longitude must be between -180 and 180".into());
    }
    Ok(())
}

#[tauri::command]
async fn fetch_location_from_ip() -> Result<ObserverLocation, String> {
    location::fetch_location_from_ip()
        .await
        .ok_or_else(|| "IP geolocation failed".into())
}

#[tauri::command]
fn get_location(state: State<AppState>) -> Result<ObserverLocation, String> {
    Ok(state.location.lock().map_err(|e| e.to_string())?.clone())
}

#[tauri::command]
fn set_location(
    latitude: f64,
    longitude: f64,
    elevation: f64,
    state: State<AppState>,
) -> Result<(), String> {
    validate_coords(latitude, longitude)?;
    let mut loc = state.location.lock().map_err(|e| e.to_string())?;
    loc.latitude = latitude;
    loc.longitude = longitude;
    loc.elevation = elevation;
    Ok(())
}

fn tray_labels(locale: &str) -> (&str, &str, &str, &str) {
    if locale == "zh" {
        ("设置", "置顶", "固定位置", "退出")
    } else {
        ("Settings", "Always on top", "Fix position", "Quit")
    }
}

#[tauri::command]
fn update_tray_menu(
    locale: String,
    always_on_top: bool,
    position_fixed: bool,
    tray: State<TrayState>,
) -> Result<(), String> {
    let (settings, always_on_top_label, fix_position, quit) = tray_labels(&locale);
    tray.settings_item
        .set_text(settings)
        .map_err(|e| e.to_string())?;
    tray.always_on_top_item
        .set_text(always_on_top_label)
        .map_err(|e| e.to_string())?;
    tray.always_on_top_item
        .set_checked(always_on_top)
        .map_err(|e| e.to_string())?;
    tray.fix_position_item
        .set_text(fix_position)
        .map_err(|e| e.to_string())?;
    tray.fix_position_item
        .set_checked(position_fixed)
        .map_err(|e| e.to_string())?;
    tray.quit_item.set_text(quit).map_err(|e| e.to_string())?;
    Ok(())
}

fn toggle_main_window(win: &WebviewWindow) {
    let visible = win.is_visible().unwrap_or(true);
    if visible {
        let _ = win.hide();
    } else {
        let _ = win.show();
        let _ = win.set_focus();
    }
}

fn setup_tray(app: &AppHandle) -> Result<TrayState, Box<dyn std::error::Error>> {
    let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let always_on_top =
        CheckMenuItem::with_id(app, "always_on_top", "Always on top", true, true, None::<&str>)?;
    let fix_position =
        CheckMenuItem::with_id(app, "fix_position", "Fix position", true, false, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[
            &settings,
            &always_on_top,
            &fix_position,
            &quit,
        ],
    )?;

    let icon = app
        .default_window_icon()
        .ok_or("missing default window icon")?
        .clone();

    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .tooltip("Sidereal Desk")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "settings" => {
                let _ = app.emit("open-settings", ());
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
            }
            "always_on_top" => {
                if let Some(tray) = app.try_state::<TrayState>() {
                    if let Ok(checked) = tray.always_on_top_item.is_checked() {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.set_always_on_top(checked);
                        }
                        let _ = app.emit("tray-always-on-top", checked);
                    }
                }
            }
            "fix_position" => {
                if let Some(tray) = app.try_state::<TrayState>() {
                    if let Ok(checked) = tray.fix_position_item.is_checked() {
                        let _ = app.emit("tray-fix-position", checked);
                    }
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(win) = app.get_webview_window("main") {
                    toggle_main_window(&win);
                }
            }
        })
        .build(app)?;

    Ok(TrayState {
        settings_item: settings,
        always_on_top_item: always_on_top,
        fix_position_item: fix_position,
        quit_item: quit,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let location = tauri::async_runtime::block_on(async {
                location::fetch_location_from_ip()
                    .await
                    .unwrap_or_else(location::get_default_location)
            });

            app.manage(AppState {
                location: Mutex::new(location),
            });

            let tray = setup_tray(app.handle())?;
            app.manage(tray);

            if let Some(win) = app.get_webview_window("main") {
                let _ = win.set_always_on_top(true);
                let win_clone = win.clone();
                win.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = win_clone.hide();
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_location,
            set_location,
            fetch_location_from_ip,
            update_tray_menu
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
