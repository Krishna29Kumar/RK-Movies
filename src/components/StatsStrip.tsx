import SectionLabel from "@/components/SectionLabel";

const STATS = [
    {
        value: "24+",
        label: "Years of experience",
        copy: "Across weddings, corporate events, campus fests, and religious ceremonies.",
        accent: "text-orange",
    },
    {
        value: "4",
        label: "Camera formats offered",
        copy: "DSLR, Camcorder, Mirrorless, and Drone — matched to what the shoot needs.",
        accent: "text-teal",
    },
    {
        value: "1–3",
        label: "Bookings per date",
        copy: "Multiple smaller crews can run on the same day without a scheduling clash.",
        accent: "text-violet",
    },
    {
        value: "2–4 wk",
        label: "Delivery turnaround",
        copy: "Edited film delivered in this window, raw footage available on request.",
        accent: "text-orange",
    },
];

export default function StatsStrip() {
    return (
        <div>
            <SectionLabel>How we work</SectionLabel>
            <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => (
                    <div key={stat.label} className="bg-bg p-6">
                        <p className={`font-display text-4xl tracking-wide ${stat.accent}`}>{stat.value}</p>
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cream">
                            {stat.label}
                        </p>
                        <p className="mt-1 text-sm text-muted">{stat.copy}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}