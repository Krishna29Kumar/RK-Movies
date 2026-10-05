import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-md border border-line/60 bg-bg-raised">
            <Image
              src="/logo.jpg"
              alt="RK-MOVIES Logo"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="font-display text-lg tracking-wider text-cream">RK-MOVIES</p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Weddings &middot; Conferences &amp; Events &middot; School Events &middot; College Events
        </p>
        <p className="font-mono text-xs text-muted">
          &copy; {new Date().getFullYear()} RK-Movies
        </p>
      </div>
    </footer>
  );
}
