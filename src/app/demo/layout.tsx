import { notFound } from "next/navigation";

/** The STK push demo only exists in sandbox; hide it in production. */
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.DARAJA_ENV === "production") notFound();
  return <>{children}</>;
}
