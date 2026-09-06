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
        }, 3800);
        return () => clearInterval(timer);
    }, [paused]);

    const slide = SLIDES[index];

    return (
        <div
            className="relative overflow-hidden rounded-sm border border-line-strong bg-bg-raised"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-bg-raised-2 sm:aspect-[16/6]">
                <div
                    key={slide.slug}
                    aria-hidden
                    className="hero-slide absolute inset-0 opacity-70"
                    style={{ background: slide.gradient }}
                />
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(115deg, var(--bg-raised-2) 0 2px, transparent 2px 26px)",
                    }}
                />

                <div key={`${slide.slug}-text`} className="hero-slide relative z-10 flex flex-col items-center gap-2 px-6 text-center">
                    <span className="rounded-sm bg-bg/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-orange glow-orange">
                        Now shooting
                    </span>
                    <h2 className="font-display text-3xl tracking-wide text-cream sm:text-5xl">
                        {slide.label.toUpperCase()}
                    </h2>
                    <p className="max-w-md text-sm text-cream/80 sm:text-base">{slide.blurb}</p>
                </div>

                <span className="absolute left-4 top-4 rounded-sm bg-bg/70 px-2 py-1 font-mono text-[11px] text-cream">
                    REEL_{String(index + 1).padStart(2, "0")}.MOV
                </span>
                <span className="absolute right-4 top-4 rounded-sm bg-bg/70 px-2 py-1 font-mono text-[11px] text-orange glow-orange">
                    REC
                </span>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-line bg-bg-raised px-4 py-3">
                {SLIDES.map((s, i) => (
                    <button
                        key={s.slug}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Show ${s.label} slide`}
                        className={[
                            "h-1.5 rounded-full transition-all",
                            i === index ? "w-6 bg-orange" : "w-1.5 bg-line-strong",
                        ].join(" ")}
                    />
                ))}
            </div>
        </div>
    );
}