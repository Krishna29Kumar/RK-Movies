import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import CategoryExplorer from "@/components/CategoryExplorer";
import SectionLabel from "@/components/SectionLabel";

const PROCESS = [
  { title: "Enquire", copy: "Tell us the event, date, and city. We reply within a day." },
  { title: "Confirm", copy: "Pick your open date on the calendar and lock the booking." },
  { title: "We shoot", copy: "Multi-camera coverage, on time, without getting in the way." },
  { title: "You watch it back", copy: "Edited film delivered in 2–4 weeks, raw footage on request." },
];

export default function Home() {
  return (
    <div>
      {/* HERO — auto-sliding across every kind of shoot */}
      <section className="mx-auto max-w-6xl px-6 pt-14 sm:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
              Now booking 2026 &mdash; 2027 dates
            </p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-wide text-cream sm:text-7xl">
              EVERY EVENT
              <br />
              HAS A CUT.
            </h1>
          </div>
          <p className="max-w-xs text-sm text-muted">
            Wedding films, corporate recaps, campus events, and religious
            ceremonies &mdash; shot and edited by one studio, one point of
            contact.
          </p>
        </div>

        <HeroSlider />
      </section>

      {/* EXPERIENCE HEADLINE */}
      <section className="mx-auto max-w-6xl px-6 pt-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
          The craft
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight tracking-wide text-cream sm:text-5xl">
          OVER 24 YEARS OF EXPERIENCE
          <br className="hidden sm:block" /> IN EVERY KIND OF SHOOT
        </h2>
      </section>

      {/* CATEGORY EXPLORER — click a category to preview, then sign in/up */}
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <CategoryExplorer />
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-6xl px-6 pt-20">
        <SectionLabel>How booking works</SectionLabel>
        <ol className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step, i) => (
            <li key={step.title} className="border-l border-line pl-4">
              <span className="font-mono text-xs text-teal">
                0{i + 1}
              </span>
              <h3 className="mt-1 font-display text-lg tracking-wide text-cream">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-sm border border-line-strong bg-bg-raised p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-cream">
              CHECK IF YOUR DATE IS OPEN
            </h2>
            <p className="mt-2 text-sm text-muted">
              Create a free account for live calendar access &mdash; no
              back-and-forth emails.
            </p>
          </div>
          <Link
            href="/signup"
            className="rounded-sm bg-orange px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
          >
            Create free account
          </Link>
        </div>
      </section>
    </div>
  );
}