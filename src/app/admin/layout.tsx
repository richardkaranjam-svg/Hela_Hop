import { notFound, redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Second check for /admin/* (Task 1.9). Middleware already blocks
 * non-admins; this repeats the check on the server so the pages stay
 * protected even if the middleware matcher changes later.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/admin/interviews");
  }
  if (!isAdminEmail(user.email)) {
    notFound();
  }

  return <>{children}</>;
}
