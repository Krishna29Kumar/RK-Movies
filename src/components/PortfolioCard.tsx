import type { PortfolioItem } from "@/lib/portfolio-data";

const CATEGORY_ACCENT: Record<PortfolioItem["category"], string> = {
  weddings: "text-orange",
  events: "text-teal",
  conferences: "text-teal",
  school: "text-orange",
  college: "text-teal",
  havan: "text-orange",
  choki: "text-teal",
  jagran: "text-orange",
};

const CATEGORY_GLOW: Record<PortfolioItem["category"], string> = {
  weddings: "hover:shadow-[0_0_0_1px_var(--orange),0_0_24px_rgba(232,117,44,0.25)]",
  events: "hover:shadow-[0_0_0_1px_var(--teal),0_0_24px_rgba(63,145,136,0.25)]",
  conferences: "hover:shadow-[0_0_0_1px_var(--teal),0_0_24px_rgba(63,145,136,0.25)]",
  school: "hover:shadow-[0_0_0_1px_var(--orange),0_0_24px_rgba(232,117,44,0.25)]",
  college: "hover:shadow-[0_0_0_1px_var(--teal),0_0_24px_rgba(63,145,136,0.25)]",
  havan: "hover:shadow-[0_0_0_1px_var(--violet),0_0_24px_rgba(139,111,216,0.25)]",
  choki: "hover:shadow-[0_0_0_1px_var(--violet),0_0_24px_rgba(139,111,216,0.25)]",
  jagran: "hover:shadow-[0_0_0_1px_var(--violet),0_0_24px_rgba(139,111,216,0.25)]",
};

export default function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-sm border border-line bg-bg-raised transition-shadow duration-300 ${CATEGORY_GLOW[item.category]}`}
    >
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-bg-raised-2">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, var(--bg-raised-2) 0 2px, transparent 2px 26px)",
          }}
        />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-bg/70 text-cream transition-opacity duration-300 group-hover:opacity-0">
          <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
            <path d="M0 0l14 8-14 8V0z" />
          </svg>
        </span>
        <span className="absolute bottom-2 right-2 rounded-sm bg-bg/80 px-2 py-1 font-mono text-[10px] text-cream transition-opacity duration-300 group-hover:opacity-0">
          {item.duration}
        </span>

        {/* Hover-reveal shoot note — the "what it took" detail */}
        <div className="absolute inset-0 flex flex-col justify-end gap-1.5 bg-gradient-to-t from-bg via-bg/90 to-bg/40 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className={`font-mono text-[9px] uppercase tracking-[0.14em] ${CATEGORY_ACCENT[item.category]}`}>
            On this shoot
          </p>
          <p className="text-xs leading-snug text-cream">{item.note}</p>
        </div>
      </div>
      <div className="space-y-1 p-4">
        <p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${CATEGORY_ACCENT[item.category]}`}>
          {item.year}
        </p>
        <h3 className="font-display text-lg leading-tight tracking-wide text-cream">
          {item.title}
        </h3>
        <p className="text-sm text-muted">{item.client}</p>
      </div>
    </article>
  );
}