import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Supabase Keep-Alive / Wake-Up Endpoint.
 *
 * Free-tier Supabase projects automatically pause after 7 days of inactivity.
 * This endpoint executes a lightweight query against Supabase to register
 * active traffic, preventing the database from pausing.
 *
 * Can be called automatically via Vercel Cron (configured in vercel.json)
 * or by any external uptime monitor / cron trigger.
 */
export async function GET(request: Request) {
  // If CRON_SECRET is configured in Vercel environment variables, verify it.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    let supabase;
    // Prefer service-role admin client if available, otherwise fall back to anon key
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createAdminClient();
    } else {
      const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const anonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY;

      if (!url || !anonKey) {
        return NextResponse.json(
          { error: "Supabase credentials are not configured" },
          { status: 500 }
        );
      }
      supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }

    // Touch the database via PostgREST to register activity on Supabase
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[supabase-keep-alive] Query error:", error.message);
      return NextResponse.json(
        {
          status: "error",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "Supabase heartbeat pulse successful",
        count: data ? data.length : 0,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[supabase-keep-alive] Unexpected error:", message);
    return NextResponse.json(
      {
        status: "error",
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
