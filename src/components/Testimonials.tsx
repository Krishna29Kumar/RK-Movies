import SectionLabel from "@/components/SectionLabel";

// Placeholder quotes — swap these for real client feedback once you've
// collected some. Kept the attribution generic (role + rough location)
// rather than inventing named people.
const QUOTES = [
    {
        quote:
            "Every shot felt intentional, not just documented. Watching the film back a week later still gave us goosebumps.",
        attribution: "Wedding client, South Delhi",
    },
    {
        quote:
            "Multi-camera coverage on a tight conference schedule, and the recap video was ready well before our next event.",
        attribution: "Corporate event organizer",
    },
    {
        quote:
            "The team was quiet and respectful throughout the whole ceremony — you'd barely notice a camera was there.",
        attribution: "Havan booking, private residence",
    },
];

export default function Testimonials() {
    return (
        <div>
            <SectionLabel>What clients say</SectionLabel>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                {QUOTES.map((q) => (
                    <div
                        key={q.attribution}
                        className="flex flex-col justify-between gap-6 rounded-sm border border-line bg-bg-raised p-6"
                    >
                        <p className="font-editorial text-lg italic leading-relaxed text-cream">
                            &ldquo;{q.quote}&rdquo;
                        </p>
                        <p className="border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                            {q.attribution}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}