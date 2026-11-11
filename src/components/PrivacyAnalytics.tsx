"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

import { redactAnalyticsUrl } from "@/lib/analytics-url";

/**
 * Vercel Analytics, page views only (Task 1.9B). No cookies, no custom events.
 * Private link codes, slugs, ids and query strings are stripped before
 * anything is sent (see lib/analytics-url.ts).
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type !== "pageview") return null;
  const url = redactAnalyticsUrl(event.url);
  return url ? { ...event, url } : null;
}

export function PrivacyAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
