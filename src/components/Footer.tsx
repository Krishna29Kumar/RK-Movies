export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-lg tracking-wide text-cream">LENSREEL</p>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Weddings &middot; Conferences &amp; Events &middot; School Events &middot; College Events
        </p>
        <p className="font-mono text-xs text-muted">
          &copy; {new Date().getFullYear()} Lensreel Films
        </p>
      </div>
    </footer>
  );
}
