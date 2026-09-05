/** Shortest side >= 600dp — typical 7"+ tablet threshold (Galaxy Tab, iPad). */
export const TABLET_MIN_SHORTEST_SIDE = 600;

/** Left radio panel width in landscape tablet layout. */
export const LANDSCAPE_PANEL_WIDTH = 480;

/** Cap so decor panel keeps at least ~55% on wide tablets. */
export const LANDSCAPE_PANEL_MAX_WIDTH_RATIO = 0.42;

export function isTabletDevice(width: number, height: number): boolean {
  return Math.min(width, height) >= TABLET_MIN_SHORTEST_SIDE;
}

export function isLandscapeOrientation(width: number, height: number): boolean {
  return width > height;
}
