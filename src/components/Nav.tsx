"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-wide text-cream">
          LENSREEL
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          {status === "authenticated" ? (
            <>
              <span className="hidden font-mono text-xs uppercase tracking-[0.14em] text-muted sm:inline">
                Hi, {session.user?.name?.split(" ")[0]}
              </span>
              <Link
                href="/dashboard"
                className="font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-cream"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-sm bg-orange px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-cream"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-sm bg-orange px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
