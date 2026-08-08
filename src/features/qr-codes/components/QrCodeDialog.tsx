"use client";

import { useEffect, useState } from "react";
import { QrCodeIcon } from "lucide-react";
import { toDataURL } from "qrcode";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { QR_CODES_CLIENT } from "../constants/qrCodes.constants";
import { composeQrSticker } from "../lib/composeQrSticker";

interface QrCodeDialogProps {
  buildingName?: string | null;
  objectId: string;
  objectName: string;
  organizationName?: string | null;
}

// Renders into a hidden iframe and prints just that, rather than
// window.print() on the page itself (which would print the whole dashboard
// behind the dialog) - see docs/technical/QR_WAYFINDING.md. The sticker is
// given a fixed physical size (not width:100%, which stretches it to the
// full page width - since the sticker is roughly square, that made it
// taller than one printable page and split it across two/three pages) and
// print only fires once the image has actually finished decoding.
function printDataUrl(dataUrl: string, objectName: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    iframe.remove();
  };

  const doc = iframe.contentDocument;
  if (!doc) {
    cleanup();
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${objectName} QR code</title>
        <style>
          @page { margin: 0.5in; }
          html, body { margin: 0; padding: 0; }
          body { text-align: center; padding-top: 24px; }
          img { width: 3in; height: auto; }
        </style>
      </head>
      <body>
        <img alt="${objectName} QR code" src="${dataUrl}" />
      </body>
    </html>
  `);
  doc.close();

  const image = doc.querySelector("img");
  const triggerPrint = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  };

  if (image && !image.complete) {
    image.addEventListener("load", triggerPrint, { once: true });
  } else {
    triggerPrint();
  }

  iframe.contentWindow?.addEventListener("afterprint", cleanup, { once: true });
  // Fallback in case a browser never fires afterprint (e.g. the print
  // dialog is dismissed in a way that doesn't trigger it).
  window.setTimeout(cleanup, 60_000);
}

export function QrCodeDialog({ buildingName, objectId, objectName, organizationName }: QrCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [stickerUrl, setStickerUrl] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  const qrUrl = `${serverUrl}/qr/${objectId}`;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    // errorCorrectionLevel "H" (~30% recoverable) - composeQrSticker inset
    // a Wayfinder mark into the QR's own center, and that obstruction needs
    // this much correction budget to keep scanning reliably.
    toDataURL(qrUrl, { errorCorrectionLevel: "H", margin: 1, width: 320 })
      .then((qrDataUrl) => composeQrSticker({ buildingName, organizationName, qrDataUrl, roomName: objectName }))
      .then((sticker) => {
        if (!cancelled) {
          setStickerUrl(sticker);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(QR_CODES_CLIENT.ERROR_GENERATING);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [buildingName, objectName, open, organizationName, qrUrl]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(qrUrl);
    toast.success(QR_CODES_CLIENT.SUCCESS_LINK_COPIED);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="sm" type="button" />}>
        {QR_CODES_CLIENT.GENERATE_QR}
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-sm">
        <DialogHeader className="border-b border-border px-5 py-5 pe-14 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <QrCodeIcon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold">{QR_CODES_CLIENT.DIALOG_TITLE}</DialogTitle>
              <DialogDescription className="mt-1 text-sm">{objectName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-w-0 flex-col items-center gap-3 px-5 py-5 sm:px-6">
          {stickerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, not an optimizable remote image
            <img
              alt={`QR code for ${objectName}`}
              className="w-48 rounded-lg border border-border"
              src={stickerUrl}
            />
          ) : (
            <div className="flex h-56 w-48 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              {QR_CODES_CLIENT.GENERATING}
            </div>
          )}
          <p className="max-w-full truncate text-xs text-muted-foreground">{qrUrl}</p>
        </div>

        {/* [&_a]:h-11 alongside [&_button]:h-11 - Download renders as an <a>
            once stickerUrl is ready (see below), which the button-tag-only
            selector doesn't match, leaving it visibly shorter than Copy
            link/Print until this was added. */}
        <DialogFooter className="grid grid-cols-3 gap-2 border-t border-border bg-muted/30 px-5 py-4 sm:px-6 [&_a]:h-11 [&_button]:h-11">
          <Button onClick={handleCopyLink} type="button" variant="outline">
            {QR_CODES_CLIENT.COPY_LINK}
          </Button>
          <Button
            disabled={!stickerUrl}
            onClick={() => stickerUrl && printDataUrl(stickerUrl, objectName)}
            type="button"
            variant="outline"
          >
            {QR_CODES_CLIENT.PRINT}
          </Button>
          {stickerUrl ? (
            <Button
              nativeButton={false}
              render={<a download={`${objectName}-qr.png`} href={stickerUrl} />}
              variant="outline"
            >
              {QR_CODES_CLIENT.DOWNLOAD}
            </Button>
          ) : (
            <Button disabled type="button" variant="outline">
              {QR_CODES_CLIENT.DOWNLOAD}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
