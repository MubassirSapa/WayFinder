import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QrCodeDialog } from "@/features/qr-codes/components/QrCodeDialog";

const toDataURLMock = vi.hoisted(() => vi.fn().mockResolvedValue("data:image/png;base64,mockqrdata"));

vi.mock("qrcode", () => ({
  toDataURL: toDataURLMock,
}));

// jsdom has no real <canvas> 2D context, so composeQrSticker (which relies
// on one to composite the logo/QR/room name) is mocked here rather than
// exercised for real - it has no test of its own for the same reason.
const composeQrStickerMock = vi.hoisted(() => vi.fn().mockResolvedValue("data:image/png;base64,mockstickerdata"));

vi.mock("@/features/qr-codes/lib/composeQrSticker", () => ({
  composeQrSticker: composeQrStickerMock,
}));

const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
}));

const writeTextMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("QrCodeDialog", () => {
  it("generates a QR code encoding /qr/{objectId} once opened, and offers copy/download actions", async () => {
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

    render(<QrCodeDialog objectId="object-1" objectName="Emergency Room" />);

    expect(toDataURLMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Generate QR code" }));

    await waitFor(() => {
      expect(toDataURLMock).toHaveBeenCalledWith(
        "http://localhost:3000/qr/object-1",
        expect.objectContaining({ width: 320 }),
      );
    });

    await waitFor(() => {
      expect(composeQrStickerMock).toHaveBeenCalledWith({
        qrDataUrl: "data:image/png;base64,mockqrdata",
        roomName: "Emergency Room",
      });
    });

    const image = await screen.findByAltText("QR code for Emergency Room");
    expect(image.getAttribute("src")).toBe("data:image/png;base64,mockstickerdata");

    // base-ui's Button sets an explicit role="button" even when rendered as
    // an <a> (via render={<a .../>}), so this is queried as a button, not a
    // link, despite being an anchor under the hood.
    const downloadLink = screen.getByRole("button", { name: "Download" });
    expect(downloadLink.getAttribute("href")).toBe("data:image/png;base64,mockstickerdata");
    expect(downloadLink.getAttribute("download")).toBe("Emergency Room-qr.png");

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith("http://localhost:3000/qr/object-1");
    });
    expect(toastSuccess).toHaveBeenCalledTimes(1);
  });

  it("toasts an error if QR generation fails, without crashing", async () => {
    toDataURLMock.mockRejectedValueOnce(new Error("boom"));

    render(<QrCodeDialog objectId="object-2" objectName="Exam Room" />);

    fireEvent.click(screen.getByRole("button", { name: "Generate QR code" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByAltText("QR code for Exam Room")).toBeNull();
  });

  // jsdom has no real layout engine, so this can't assert the dialog stays
  // narrow on screen - it asserts the two classes that actually cause that:
  // `min-w-0` on the row (without it, this <p>'s unbroken text would set the
  // shared grid column's min-content width, stretching the image/footer
  // rows above and below it too) and `truncate` on the <p> itself (the
  // ellipsis/nowrap clipping, which only takes effect once min-w-0 lets the
  // row actually shrink to the dialog's real width).
  it("keeps the long generated url from stretching the dialog's shared grid column", async () => {
    const longObjectId = "x".repeat(300);

    render(<QrCodeDialog objectId={longObjectId} objectName="Long Hallway" />);

    fireEvent.click(screen.getByRole("button", { name: "Generate QR code" }));

    const longUrl = `http://localhost:3000/qr/${longObjectId}`;
    const urlText = await screen.findByText(longUrl);

    expect(urlText.className).toContain("truncate");
    expect(urlText.parentElement?.className).toContain("min-w-0");
  });
});
