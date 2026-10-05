"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-3.5 sm:px-10 lg:px-16">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-line/60 bg-bg-raised transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.jpg"
              alt="RK-MOVIES Logo"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <span className="font-display text-xl tracking-wider text-cream transition-colors group-hover:text-orange">
            RK-MOVIES
          </span>
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