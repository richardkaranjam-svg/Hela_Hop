import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isAdminEmail } from "@/lib/admin";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Add x-pathname to request headers so Server Components / Layouts can inspect it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /dashboard and /dashboard/* routes — redirect to /login if no session
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin and /admin/* (Task 1.9): must be logged in AND on the
  // ADMIN_EMAILS allow-list. Non-admins get a plain 404 so the page's
  // existence is not advertised.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdminEmail(user.email)) {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
