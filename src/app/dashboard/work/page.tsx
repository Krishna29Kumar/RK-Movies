"use client";

import { useState } from "react";
import { CATEGORIES, PORTFOLIO_ITEMS, CategorySlug } from "@/lib/portfolio-data";
import PortfolioCard from "@/components/PortfolioCard";
import TimecodeLabel from "@/components/TimecodeLabel";

export default function DashboardWorkPage() {
  const [active, setActive] = useState<CategorySlug | "all">("all");

  const items =
    active === "all"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === active);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
        The reel, in chapters
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-wide text-cream sm:text-4xl">
        SELECTED WORK
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          className={`rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
            active === "all"
              ? "border-orange bg-orange-soft text-orange"
              : "border-line text-muted hover:text-cream"
          }`}
        >
          All work
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActive(cat.slug)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              active === cat.slug
                ? "border-orange bg-orange-soft text-orange"
                : "border-line text-muted hover:text-cream"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <TimecodeLabel index={items.length}>
          {items.length} {items.length === 1 ? "project" : "projects"}
        </TimecodeLabel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <PortfolioCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
