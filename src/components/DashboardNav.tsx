"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Home", exact: true },
  { href: "/dashboard/work", label: "Work" },
  { href: "/dashboard/book", label: "Book a date" },
  { href: "/dashboard/check-date", label: "Check a date" },
];

export default function DashboardNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="lg:w-56 lg:shrink-0">
      {userName && (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Signed in as {userName.split(" ")[0]}
        </p>
      )}
      <nav className="flex gap-2 overflow-x-auto border-b border-line pb-3 lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "whitespace-nowrap rounded-sm px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
                active
                  ? "bg-orange-soft text-orange"
                  : "text-muted hover:text-cream",
              ].join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
