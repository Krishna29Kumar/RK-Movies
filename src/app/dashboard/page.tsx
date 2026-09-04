import Link from "next/link";
import { auth } from "@/lib/auth";
import SectionLabel from "@/components/SectionLabel";

export default async function DashboardHome() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
        Dashboard
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-wide text-cream sm:text-4xl">
        WELCOME{firstName ? `, ${firstName.toUpperCase()}` : ""}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Browse the full portfolio, check which dates are open, or send a
        booking request straight from here.
      </p>

      <div className="mt-8">
        <SectionLabel>Quick links</SectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard/work"
            className="rounded-sm border border-line bg-bg-raised p-5 transition-colors hover:border-line-strong"
          >
            <h2 className="font-display text-lg tracking-wide text-cream">
              View work
            </h2>
            <p className="mt-1 text-sm text-muted">
              Full portfolio across weddings, conferences, and campus events.
            </p>
          </Link>
          <Link
            href="/dashboard/check-date"
            className="rounded-sm border border-line bg-bg-raised p-5 transition-colors hover:border-line-strong"
          >
            <h2 className="font-display text-lg tracking-wide text-cream">
              Check a date
            </h2>
            <p className="mt-1 text-sm text-muted">
              See what&apos;s already booked before you commit.
            </p>
          </Link>
          <Link
            href="/dashboard/book"
            className="rounded-sm border border-line bg-bg-raised p-5 transition-colors hover:border-line-strong"
          >
            <h2 className="font-display text-lg tracking-wide text-cream">
              Book a date
            </h2>
            <p className="mt-1 text-sm text-muted">
              Send a booking request for your event.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
