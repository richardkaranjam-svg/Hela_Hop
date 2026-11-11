/**
 * Simple admin allow-list (Task 1.9) until the real admin roles in Task 2.5.
 *
 * ADMIN_EMAILS is a comma-separated list, e.g.
 *   ADMIN_EMAILS=founder@example.com,helper@example.com
 * If it is empty or missing, NOBODY is an admin.
 *
 * Pure function with no Node-only imports, so it also runs in middleware.
 */
export function isAdminEmail(
  email: string | null | undefined,
  adminEmails: string | undefined = process.env.ADMIN_EMAILS
): boolean {
  if (!email || !adminEmails) return false;
  const wanted = email.trim().toLowerCase();
  if (!wanted) return false;
  return adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(wanted);
}
