"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, PORTFOLIO_ITEMS, CategorySlug } from "@/lib/portfolio-data";
import PortfolioCard from "@/components/PortfolioCard";
import SectionLabel from "./SectionLabel";

export default function CategoryExplorer() {
    const [active, setActive] = useState<CategorySlug | null>(null);

    const activeCategory = CATEGORIES.find((cat) => cat.slug === active);
    const previewItems = active
        ? PORTFOLIO_ITEMS.filter((item) => item.category === active).slice(0, 4)
        : [];

    return (
        <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.slug}
                        type="button"
                        onClick={() => setActive((current) => (current === cat.slug ? null : cat.slug))}
                        className={[
                            "rounded-sm border p-4 text-left transition-colors",
                            active === cat.slug
                                ? "border-orange bg-orange-soft"
                                : "border-line bg-bg-raised hover:border-line-strong",
                        ].join(" ")}
                    >
                        <p className="font-display text-base tracking-wide text-cream sm:text-lg">
                            {cat.label.toUpperCase()}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">{cat.blurb}</p>
                    </button>
                ))}
            </div>

            {activeCategory && (
                <div className="mt-6 rounded-sm border border-line-strong bg-bg-raised p-5 sm:p-6">
                    <SectionLabel>
                        {activeCategory.label} &mdash; a glimpse
                    </SectionLabel>

                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {previewItems.map((item) => (
                            <PortfolioCard key={item.id} item={item} />
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col items-start gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted">
                            Sign in to watch full films and check {activeCategory.label.toLowerCase()} dates.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                href="/signin"
                                className="rounded-sm border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-cream transition-colors hover:border-line-strong"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/signup"
                                className="rounded-sm bg-orange px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-bg transition-opacity hover:opacity-90"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}