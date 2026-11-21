"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/portfolio-data";

const GRADIENTS = [
    "radial-gradient(circle at 25% 30%, var(--teal-soft), transparent 55%), radial-gradient(circle at 80% 70%, var(--orange-soft), transparent 55%)",
    "radial-gradient(circle at 75% 25%, var(--orange-soft), transparent 55%), radial-gradient(circle at 20% 75%, var(--violet-soft), transparent 55%)",
    "radial-gradient(circle at 50% 20%, var(--violet-soft), transparent 60%), radial-gradient(circle at 50% 85%, var(--teal-soft), transparent 55%)",
];

const SLIDES = CATEGORIES.map((cat, i) => ({
    slug: cat.slug,
    label: cat.label,
    blurb: cat.blurb,
    gradient: GRADIENTS[i % GRADIENTS.length],
}));

export default function HeroSlider() {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % SLIDES.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [paused]);

    const slide = SLIDES[index];

    return (
        <div
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Full-bleed ambient gradient for active slide */}
            <div
                key={slide.slug}
                aria-hidden
                className="hero-slide absolute inset-0 opacity-60"
                style={{ background: slide.gradient }}
            />
            {/* Film diagonal texture */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-25"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(115deg, var(--bg-raised-2) 0 2px, transparent 2px 26px)",
                }}
            />

            {/* Slide content full-screen centered */}
            <div
                key={`${slide.slug}-text`}
                className="hero-slide relative z-10 flex flex-col items-center gap-3 px-4 text-center"
            >
                <span className="rounded-sm bg-bg/70 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-orange glow-orange">
                    Now shooting
                </span>
                <h1 className="font-display text-4xl tracking-wide text-cream sm:text-6xl md:text-7xl lg:text-8xl">
                    {slide.label.toUpperCase()}
                </h1>
                <p className="max-w-xl text-sm text-cream/80 sm:text-base md:text-lg">
                    {slide.blurb}
                </p>
            </div>

            {/* Slide progress indicators */}
            <div className="relative z-10 mt-8 flex items-center justify-center gap-2">
                {SLIDES.map((s, i) => (
                    <button
                        key={s.slug}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Show ${s.label} slide`}
                        className={[
                            "relative h-1.5 overflow-hidden rounded-full bg-line-strong transition-all",
                            i === index ? "w-8" : "w-1.5",
                        ].join(" ")}
                    >
                        {i === index && (
                            <span
                                key={`${s.slug}-${index}`}
                                className={[
                                    "progress-fill absolute inset-y-0 left-0 rounded-full bg-orange",
                                    paused ? "[animation-play-state:paused]" : "",
                                ].join(" ")}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
