import { listInterviews } from "@/features/interviews/actions";
import InterviewsClient from "@/features/interviews/InterviewsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Interview tracker · Hela Hop admin",
  robots: { index: false, follow: false },
};

/**
 * Internal interview tracker (Task 0.4, updated for Master Plan v1.5).
 * Access is limited to ADMIN_EMAILS by middleware, admin/layout.tsx and the
 * server actions themselves.
 */
export default async function UserInterviewsPage() {
  const interviews = await listInterviews();
  return <InterviewsClient initialInterviews={interviews} />;
}
