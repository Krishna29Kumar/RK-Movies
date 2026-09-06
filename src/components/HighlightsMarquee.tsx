const HIGHLIGHTS = [
    "24 years of hands-on shoot experience",
    "Weddings, corporate events, campus fests & religious ceremonies",
    "Multi-camera coverage on every booking",
    "DSLR, Camcorder, Mirrorless & Drone options",
    "Edited film delivered in 2–4 weeks",
];

// Duplicated once so the CSS animation can loop seamlessly (see
// .marquee-track in globals.css — it scrolls exactly -50%).
const LOOPED = [...HIGHLIGHTS, ...HIGHLIGHTS];

export default function HighlightsMarquee() {
    return (
        <div className="overflow-hidden border-y border-line bg-bg-raised py-3">
            <div className="marquee-track">
                {LOOPED.map((text, i) => (
                    <div key={i} className="flex items-center gap-8 pr-8">
                        <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-cream">
                            {text}
                        </span>
                        <span className="text-line-strong">&bull;</span>
                    </div>
                ))}
            </div>
        </div>
    );
}