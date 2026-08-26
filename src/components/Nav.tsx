import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Work" },
  { href: "/booking", label: "Book a date" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-wide text-cream">
          LENSREEL
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="rounded-sm bg-orange px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
          >
            Check dates
          </Link>
        </nav>
      </div>
    </header>
  );
}
