export type BackgroundImageFit = 'fill' | 'cover' | 'contain';

export interface BackgroundImageFitResult {
  x: number;
  y: number;
  width: number;
  height: number;
  /** True for "cover" — the scaled image can overflow the floor bounds and needs a clip. */
  needsClip: boolean;
}

export const BACKGROUND_IMAGE_CLIP_PATH_ID = 'background-image-floor-clip';

interface ComputeBackgroundImageFitParams {
  floorWidth: number;
  floorHeight: number;
  naturalWidth?: number | null;
  naturalHeight?: number | null;
  fit: BackgroundImageFit;
  offsetX?: number;
  offsetY?: number;
}

// Mirrors CSS object-fit semantics for the SVG <image> background layer.
// "fill" stretches to the floor's exact size (ignores aspect ratio) and is
// the default/legacy behavior. "cover"/"contain" need the image's natural
// pixel size (from the uploaded media doc) to preserve its aspect ratio.
export function computeBackgroundImageFit({
  floorWidth,
  floorHeight,
  naturalWidth,
  naturalHeight,
  fit,
  offsetX = 0,
  offsetY = 0,
}: ComputeBackgroundImageFitParams): BackgroundImageFitResult {
  if (fit === 'fill' || !naturalWidth || !naturalHeight) {
    return { x: offsetX, y: offsetY, width: floorWidth, height: floorHeight, needsClip: false };
  }

  const floorRatio = floorWidth / floorHeight;
  const naturalRatio = naturalWidth / naturalHeight;
  const imageIsWiderThanFloor = naturalRatio > floorRatio;
  // "cover" matches the dimension the image is proportionally larger on
  // (so the other dimension overflows); "contain" matches the opposite one.
  const matchesHeight = fit === 'cover' ? imageIsWiderThanFloor : !imageIsWiderThanFloor;

  const width = matchesHeight ? floorHeight * naturalRatio : floorWidth;
  const height = matchesHeight ? floorHeight : floorWidth / naturalRatio;

  return {
    x: (floorWidth - width) / 2 + offsetX,
    y: (floorHeight - height) / 2 + offsetY,
    width,
    height,
    needsClip: fit === 'cover',
  };
}
