const STICKER_WIDTH = 360;
const STICKER_PADDING = 28;
const LOGO_SIZE = 40;
const LOGO_GAP = 10;
const QR_SIZE = 280;
const HEADER_GAP = 20;
const WORDMARK_FONT = "600 20px system-ui, -apple-system, sans-serif";

const NAME_BLOCK_TOP_GAP = 22;
const NAME_LINE_HEIGHT = 20;
const NAME_BLOCK_BOTTOM_GAP = 6;

// Kept well under the ~30% obstruction a "high" error-correction QR can
// absorb (see the errorCorrectionLevel: "H" passed alongside qrDataUrl's
// generation in QrCodeDialog.tsx) - the white backdrop box, not just the
// logo art itself, counts toward that budget.
const CENTER_LOGO_SIZE = Math.round(QR_SIZE * 0.2);
const CENTER_LOGO_PADDING = 8;
const CENTER_LOGO_RADIUS = 10;

interface ComposeQrStickerArgs {
  buildingName?: string | null;
  organizationName?: string | null;
  qrDataUrl: string;
  roomName: string;
}

interface StickerTextLine {
  color: string;
  font: string;
  text: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

// Manual path instead of ctx.roundRect - not universally available across
// this app's supported browser/canvas versions, and this is a handful of
// lines either way.
function traceRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + size, y, x + size, y + size, radius);
  ctx.arcTo(x + size, y + size, x, y + size, radius);
  ctx.arcTo(x, y + size, x, y, radius);
  ctx.arcTo(x, y, x + size, y, radius);
  ctx.closePath();
}

// Composites the raw QR module image into a branded, printable sticker: the
// Wayfinder wordmark above, the room/building/organization name stack
// below, and the Wayfinder mark again inset in the QR's own center (on a
// white backdrop, sized to stay inside the QR's error-correction budget) -
// so a scan still succeeds while the code itself is recognizably a
// Wayfinder one, and whoever's holding the printed sticker can tell which
// room, building, and organization it belongs to without scanning it.
export async function composeQrSticker({
  buildingName,
  organizationName,
  qrDataUrl,
  roomName,
}: ComposeQrStickerArgs): Promise<string> {
  const [qrImage, logoImage] = await Promise.all([
    loadImage(qrDataUrl),
    loadImage("/icon/wayfinder-no-bg.png"),
  ]);

  // Room name first and boldest (the thing this sticker is actually
  // "about"), building/organization progressively smaller and lighter as
  // context - both optional, since not every floor loader threads them
  // through (ViewerFloor.buildingName is optional for that reason).
  const textLines: StickerTextLine[] = [
    { color: "#111827", font: "600 15px system-ui, -apple-system, sans-serif", text: roomName },
  ];
  if (buildingName) {
    textLines.push({ color: "#374151", font: "500 13px system-ui, -apple-system, sans-serif", text: buildingName });
  }
  if (organizationName) {
    textLines.push({ color: "#6b7280", font: "400 11px system-ui, -apple-system, sans-serif", text: organizationName });
  }

  const canvas = document.createElement("canvas");
  const width = STICKER_WIDTH;
  const nameBlockHeight = NAME_BLOCK_TOP_GAP + textLines.length * NAME_LINE_HEIGHT + NAME_BLOCK_BOTTOM_GAP;
  const height = STICKER_PADDING + LOGO_SIZE + HEADER_GAP + QR_SIZE + nameBlockHeight + STICKER_PADDING;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Wordmark row: logo + "Wayfinder", centered as one unit.
  ctx.font = WORDMARK_FONT;
  ctx.textBaseline = "middle";
  const wordmark = "Wayfinder";
  const wordmarkWidth = ctx.measureText(wordmark).width;
  const headerContentWidth = LOGO_SIZE + LOGO_GAP + wordmarkWidth;
  const headerStartX = (width - headerContentWidth) / 2;
  const headerY = STICKER_PADDING;

  ctx.drawImage(logoImage, headerStartX, headerY, LOGO_SIZE, LOGO_SIZE);
  ctx.fillStyle = "#111827";
  ctx.textAlign = "left";
  ctx.fillText(wordmark, headerStartX + LOGO_SIZE + LOGO_GAP, headerY + LOGO_SIZE / 2);

  // QR code, centered.
  const qrX = (width - QR_SIZE) / 2;
  const qrY = headerY + LOGO_SIZE + HEADER_GAP;
  ctx.drawImage(qrImage, qrX, qrY, QR_SIZE, QR_SIZE);

  // Logo mark again, inset in the QR's own center on a white backdrop.
  const centerX = qrX + QR_SIZE / 2;
  const centerY = qrY + QR_SIZE / 2;
  const boxSize = CENTER_LOGO_SIZE + CENTER_LOGO_PADDING * 2;
  ctx.fillStyle = "#ffffff";
  traceRoundedRect(ctx, centerX - boxSize / 2, centerY - boxSize / 2, boxSize, CENTER_LOGO_RADIUS);
  ctx.fill();
  ctx.drawImage(
    logoImage,
    centerX - CENTER_LOGO_SIZE / 2,
    centerY - CENTER_LOGO_SIZE / 2,
    CENTER_LOGO_SIZE,
    CENTER_LOGO_SIZE,
  );

  // Room / building / organization name stack below.
  ctx.textAlign = "center";
  const maxTextWidth = width - STICKER_PADDING * 2;
  textLines.forEach((line, index) => {
    ctx.font = line.font;
    ctx.fillStyle = line.color;
    const lineY = qrY + QR_SIZE + NAME_BLOCK_TOP_GAP + index * NAME_LINE_HEIGHT + NAME_LINE_HEIGHT / 2;
    ctx.fillText(line.text, width / 2, lineY, maxTextWidth);
  });

  return canvas.toDataURL("image/png");
}
