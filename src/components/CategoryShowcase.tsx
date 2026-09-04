"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { SHOWCASE_CATEGORIES } from "@/lib/showcase-content";

export default function CategoryShowcase() {
    const [openId, setOpenId] = useState<string | null>(null);

    function toggle(id: string) {
        setOpenId((prev) => (prev === id ? null : id));
    }

    return (
        <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {SHOWCASE_CATEGORIES.map((cat) => {
                    const isOpen = openId === cat.id;
                    return (
                        <div key={cat.id} className={isOpen ? "col-span-2 sm:col-span-3 lg:col-span-4" : ""}>
                            <button
                                onClick={() => toggle(cat.id)}
                                className="group relative block h-40 w-full overflow-hidden rounded-sm border border-line-strong sm:h-48"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={cat.cover.src}
                                    alt={cat.label}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-bg/50 transition-colors group-hover:bg-bg/30" />
                                <span className="absolute bottom-3 left-3 font-mono text-xs uppercase tracking-[0.12em] text-cream">
                                    {cat.label}
                                </span>
                            </button>

                            {isOpen && (
                                <div className="mt-4 rounded-sm border border-line bg-bg-raised p-5">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                                        {cat.label} — a few highlights
                                    </p>

                                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {cat.media.map((item, i) => (
                                            <div
                                                key={i}
                                                className="aspect-[4/5] overflow-hidden rounded-sm border border-line"
                                            >
                                                {item.type === "image" ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.src}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <video
                                                        src={item.src}
                                                        className="h-full w-full object-cover"
                                                        muted
                                                        loop
                                                        playsInline
                                                        autoPlay
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => signIn()}
                                        className="mt-5 rounded-sm bg-orange px-6 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
                                    >
                                        See more — sign in / sign up
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}