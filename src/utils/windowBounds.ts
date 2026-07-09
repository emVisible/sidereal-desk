import {
  currentMonitor,
  getCurrentWindow,
  LogicalPosition,
} from "@tauri-apps/api/window";

const MARGIN = 16;
let cornerIndex = 0;

export interface SavedWindowBounds {
  x: number;
  y: number;
}

export async function restoreWindowBounds(bounds: SavedWindowBounds | null) {
  if (!bounds) return;
  try {
    const win = getCurrentWindow();
    await win.setPosition(new LogicalPosition(bounds.x, bounds.y));
  } catch {
    /* web preview */
  }
}

export async function readWindowBounds(): Promise<SavedWindowBounds | null> {
  try {
    const win = getCurrentWindow();
    const pos = await win.outerPosition();
    const scale = (await win.scaleFactor()) ?? 1;
    const logical = pos.toLogical(scale);
    return { x: logical.x, y: logical.y };
  } catch {
    return null;
  }
}

export async function snapToNextCorner() {
  try {
    const win = getCurrentWindow();
    const monitor = await currentMonitor();
    if (!monitor) return;

    const scale = monitor.scaleFactor;
    const size = await win.outerSize();
    const logicalW = size.width / scale;
    const logicalH = size.height / scale;

    const wa = monitor.workArea;
    const waX = wa.position.x / scale;
    const waY = wa.position.y / scale;
    const waW = wa.size.width / scale;
    const waH = wa.size.height / scale;

    const corners = [
      { x: waX + waW - logicalW - MARGIN, y: waY + waH - logicalH - MARGIN },
      { x: waX + MARGIN, y: waY + waH - logicalH - MARGIN },
      { x: waX + MARGIN, y: waY + MARGIN },
      { x: waX + waW - logicalW - MARGIN, y: waY + MARGIN },
    ];

    cornerIndex = (cornerIndex + 1) % corners.length;
    const c = corners[cornerIndex]!;
    await win.setPosition(new LogicalPosition(c.x, c.y));
  } catch {
    /* web preview */
  }
}
