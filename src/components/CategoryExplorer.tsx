"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CATEGORIES, PORTFOLIO_ITEMS, CategorySlug } from "@/lib/portfolio-data";
import PortfolioCard from "@/components/PortfolioCard";
import SectionLabel from "@/components/SectionLabel";

export default function CategoryExplorer() {
    const { status } = useSession();
    const isSignedIn = status === "authenticated";
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

                        {isSignedIn ? (
                            <Link
                                href="/dashboard/work"
                                className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-sm border border-line bg-bg-raised-2 transition-colors hover:border-orange"
                            >
                                <div
                                    aria-hidden
                                    className="absolute inset-0 opacity-50 blur-sm transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        backgroundImage:
                                            "repeating-linear-gradient(115deg, var(--bg-raised-2) 0 2px, transparent 2px 26px)",
                                    }}
                                />
                                <div className="absolute inset-0 bg-bg/60" />
                                <div className="relative flex flex-col items-center gap-1 px-4 text-center">
                                    <p className="font-display text-sm tracking-wide text-cream sm:text-base">
                                        VIEW FULL PORTFOLIO
                                    </p>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-orange">
                                        See more &amp; book a date &rarr;
                                    </p>
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href="/signup"
                                className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-sm border border-line bg-bg-raised-2 transition-colors hover:border-orange"
                            >
                                <div
                                    aria-hidden
                                    className="absolute inset-0 opacity-50 blur-sm transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        backgroundImage:
                                            "repeating-linear-gradient(115deg, var(--bg-raised-2) 0 2px, transparent 2px 26px)",
                                    }}
                                />
                                <div className="absolute inset-0 bg-bg/60" />
                                <div className="relative flex flex-col items-center gap-1 px-4 text-center">
                                    <p className="font-display text-sm tracking-wide text-cream sm:text-base">
                                        SEE MORE
                                    </p>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-orange">
                                        Sign up to view &amp; book &rarr;
                                    </p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}