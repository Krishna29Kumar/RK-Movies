import type { PortfolioItem } from "@/lib/portfolio-data";

const CATEGORY_ACCENT: Record<PortfolioItem["category"], string> = {
  weddings: "text-orange",
  conferences: "text-teal",
  school: "text-orange",
  college: "text-teal",
};

export default function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <article className="group relative overflow-hidden rounded-sm border border-line bg-bg-raised transition-colors hover:border-line-strong">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-bg-raised-2">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, var(--bg-raised-2) 0 2px, transparent 2px 26px)",
          }}
        />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-bg/70 text-cream">
          <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
            <path d="M0 0l14 8-14 8V0z" />
          </svg>
        </span>
        <span className="absolute bottom-2 right-2 rounded-sm bg-bg/80 px-2 py-1 font-mono text-[10px] text-cream">
          {item.duration}
        </span>
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
