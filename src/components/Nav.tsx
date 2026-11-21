"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string }>({
    name: "Rajeev Kumar",
    email: "admin@rkmovies.com",
  });

  const isAdminRoute = pathname?.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isAdminRoute && !isAdminLogin) {
      fetch("/api/admin/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.email) {
            setAdminUser({
              name: "Rajeev Kumar",
              email: data.email,
            });
          }
        })
        .catch(() => {});
    }
  }, [isAdminRoute, isAdminLogin]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setProfileOpen(false);
    router.push("/admin/login");
  }

  async function handleSwitchUser() {
    await fetch("/api/admin/logout", { method: "POST" });
    setProfileOpen(false);
    router.push("/admin/login");
  }

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

        {/* If in Admin Portal */}
        {isAdminRoute ? (
          !isAdminLogin && (
            <nav className="flex items-center">
              {/* Profile Dropdown in place of Book now */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-sm border border-line bg-bg-raised px-3 py-1.5 transition-all hover:border-line-strong hover:bg-bg"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange/20 border border-orange/40 font-mono text-[10px] font-bold text-orange">
                    RK
                  </div>
                  <span className="font-mono text-xs text-cream">Profile</span>
                  <svg
                    className={`h-3 w-3 text-muted transition-transform duration-150 ${
                      profileOpen ? "rotate-180 text-orange" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-sm border border-line-strong bg-bg-raised p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-line">
                      <p className="font-display text-sm tracking-wide text-cream">
                        Rajeev Kumar
                      </p>
                      <p className="font-mono text-[10px] text-muted truncate">
                        {adminUser.email}
                      </p>
                    </div>

                    <div className="pt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={handleSwitchUser}
                        className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left font-mono text-xs text-cream hover:bg-bg hover:text-orange transition-colors"
                      >
                        <svg
                          className="h-3.5 w-3.5 text-muted"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                        <span>Switch User</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left font-mono text-xs text-orange hover:bg-orange/10 transition-colors"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          )
        ) : (
          /* Normal Public / Client Header */
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className="font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-cream"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/book"
              className="rounded-sm bg-orange px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
            >
              Book now
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
