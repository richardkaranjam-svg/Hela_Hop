import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";

const MAX_QR_TEXT_LENGTH = 500;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || searchParams.get("url");
  const format = searchParams.get("format") || "png";
  const isDownload = searchParams.get("download") === "true";
  // Only allow safe filename characters (prevents header injection).
  const filename =
    (searchParams.get("filename") || "")
      .replace(/[^A-Za-z0-9._-]/g, "")
      .slice(0, 64) || "helahop-qr";

  if (!text) {
    return new NextResponse("Missing text or url parameter", { status: 400 });
  }

  // Cap input size so nobody can burn CPU encoding huge payloads.
  if (text.length > MAX_QR_TEXT_LENGTH) {
    return new NextResponse("Text too long", { status: 413 });
  }

  // Only encode links that point at our own app (this is not a free,
  // general-purpose QR service).
  try {
    const target = new URL(text).origin;
    const allowed = new Set([request.nextUrl.origin]);
    if (process.env.NEXT_PUBLIC_APP_URL) {
      allowed.add(new URL(process.env.NEXT_PUBLIC_APP_URL).origin);
    }
    if (!allowed.has(target)) {
      return new NextResponse("Not allowed", { status: 403 });
    }
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
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
