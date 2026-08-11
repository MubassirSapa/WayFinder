// Bounds for the reference image's own Zoom slider (backgroundImageScale,
// stored as a 0-1+ multiplier, edited here as a percentage) - distinct from
// EDITOR_VIEWPORT_MIN_ZOOM/MAX_ZOOM (canvasViewport.constants.ts), which
// zoom the whole canvas. Wider than the map viewer's own canvas zoom range
// (0.75x-2.1x desktop, see MAP_VIEWER_DESKTOP_MIN_ZOOM/MAX_ZOOM) since an
// admin lining up a reference image needs more headroom in both directions,
// especially zooming out to fit an oversized scan inside the floor bounds.
export const EDITOR_IMAGE_MIN_ZOOM_PERCENT = 10;
export const EDITOR_IMAGE_MAX_ZOOM_PERCENT = 400;
export const EDITOR_IMAGE_ZOOM_STEP_PERCENT = 5;
