import QRCode from "qrcode";

/** Shared look for every QR code in the app (dark slate on white). */
export const QR_OPTIONS = {
  margin: 2,
  color: { dark: "#0f172a", light: "#ffffff" },
} as const;

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { ...QR_OPTIONS, width: 360 });
}
