import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || searchParams.get("url");
  const format = searchParams.get("format") || "png";
  const isDownload = searchParams.get("download") === "true";
  const filename = searchParams.get("filename") || "helahop-qr";

  if (!text) {
    return new NextResponse("Missing text or url parameter", { status: 400 });
  }

  try {
    if (format === "svg") {
      const svgString = await QRCode.toString(text, {
        type: "svg",
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      const headers: Record<string, string> = {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      };

      if (isDownload) {
        headers["Content-Disposition"] =
          `attachment; filename="${filename}.svg"`;
      }

      return new NextResponse(svgString, { headers });
    }

    // Default to PNG
    const pngBuffer = await QRCode.toBuffer(text, {
      type: "png",
      width: 480,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="${filename}.png"`;
    }

    return new NextResponse(new Uint8Array(pngBuffer), { headers });
  } catch (err: unknown) {
    console.error("QR Code generation error:", err);
    return new NextResponse("Failed to generate QR code", { status: 500 });
  }
}
