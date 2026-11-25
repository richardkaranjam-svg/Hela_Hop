/**
 * The public base URL of the app, without a trailing slash, e.g.
 * "https://helahop.co.ke". Used to build shareable /pay, /i and /r links.
 * Falls back to localhost for local development.
 */
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
}

/** The app's host for display, e.g. "helahop.co.ke" (no protocol). */
export function getAppHost(): string {
  return getAppUrl().replace(/^https?:\/\//, "");
}
