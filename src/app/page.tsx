import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import CategoryExplorer from "@/components/CategoryExplorer";
import SectionLabel from "@/components/SectionLabel";
import HighlightsMarquee from "@/components/HighlightsMarquee";
import Testimonials from "@/components/Testimonials";

const PROCESS = [
  { title: "Enquire", copy: "Tell us the event, date, and city. We reply within a day." },
  { title: "Confirm", copy: "Pick your open date on the calendar and lock the booking." },
  { title: "We shoot", copy: "Multi-camera coverage, on time, without getting in the way." },
  { title: "You watch it back", copy: "Edited film delivered in 2–4 weeks, raw footage on request." },
];

export default function Home() {
  return (
    <div>
      {/* FIRST FOLD: Full-page Hero + running ticker pinned at the bottom */}
      <div className="relative flex min-h-[calc(100dvh-65px)] flex-col justify-between overflow-hidden">
        <div
          aria-hidden
          className="ambient-orb -top-24 -left-24 h-72 w-72 bg-orange"
        />
        <div
          aria-hidden
          className="ambient-orb top-1/3 -right-24 h-72 w-72 bg-violet"
        />
        <div
          aria-hidden
          className="ambient-orb bottom-12 left-1/4 h-56 w-[420px] bg-teal"
        />

        {/* Full-bleed Hero Slider */}
        <HeroSlider />

        {/* HIGHLIGHTS TICKER — full-bleed scrolling strip at the bottom of the screen */}
        <HighlightsMarquee />
      </div>

      {/* EXPERIENCE HEADLINE */}
      <section className="mx-auto max-w-6xl px-6 pt-24 text-center">
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

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-6 pt-20">
        <Testimonials />
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-6xl px-6 pt-20">
        <SectionLabel>That&apos;s how we capture your life&apos;s precious moments</SectionLabel>
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
              Live calendar access &mdash; check availability and book your date directly.
            </p>
          </div>
          <Link
            href="/dashboard/check-date"
            className="rounded-sm bg-orange px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
          >
            Check open dates
          </Link>
        </div>
      </section>
    </div>
  );
}