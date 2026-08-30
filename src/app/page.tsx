import Link from "next/link";
import { CATEGORIES, PORTFOLIO_ITEMS } from "@/lib/portfolio-data";
import PortfolioCard from "@/components/PortfolioCard";
import TimecodeLabel from "@/components/TimecodeLabel";

const PROCESS = [
  { title: "Enquire", copy: "Tell us the event, date, and city. We reply within a day." },
  { title: "Confirm", copy: "Pick your open date on the calendar and lock the booking." },
  { title: "We shoot", copy: "Multi-camera coverage, on time, without getting in the way." },
  { title: "You watch it back", copy: "Edited film delivered in 2–4 weeks, raw footage on request." },
];

const FEATURED = CATEGORIES.map(
  (cat) => PORTFOLIO_ITEMS.find((item) => item.category === cat.slug)!
);

// Public teaser: only show a couple of pieces, the rest is behind sign-in.
const PUBLIC_PREVIEW = FEATURED.slice(0, 2);

export default function Home() {
  return (
    <div>
      {/* HERO — framed like a video player */}
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
            Wedding films, conference recaps, and campus event coverage &mdash;
            shot and edited by one studio, one point of contact.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-sm border border-line-strong bg-bg-raised">
          <div className="relative flex aspect-[16/8] items-center justify-center overflow-hidden bg-bg-raised-2 sm:aspect-[16/7]">
            <div
              aria-hidden
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, var(--teal-soft), transparent 55%), radial-gradient(circle at 75% 70%, var(--orange-soft), transparent 55%)",
              }}
            />
            <Link
              href="/signup"
              className="group relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-line-strong bg-bg/70 text-cream transition-transform hover:scale-105 sm:h-20 sm:w-20"
              aria-label="Sign up to watch the full reel"
            >
              <svg width="20" height="24" viewBox="0 0 14 16" fill="currentColor" className="ml-1">
                <path d="M0 0l14 8-14 8V0z" />
              </svg>
            </Link>
            <span className="absolute left-4 top-4 rounded-sm bg-bg/70 px-2 py-1 font-mono text-[11px] text-cream">
              REEL_2026_MASTER.MOV
            </span>
            <span className="absolute right-4 top-4 rounded-sm bg-bg/70 px-2 py-1 font-mono text-[11px] text-orange">
              REC
            </span>
          </div>

          {/* scrubber / chapter markers = the four kinds of work */}
          <div className="border-t border-line bg-bg-raised px-4 py-4 sm:px-6">
            <div className="sprocket-rule mb-4" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((cat, i) => (
                <div key={cat.slug} className="min-w-0">
                  <p className="font-mono text-[10px] text-muted">
                    CH.{String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="truncate font-display text-sm tracking-wide text-cream sm:text-base">
                    {cat.label.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED WORK — teaser only, full gallery is behind sign-in */}
      <section className="mx-auto max-w-6xl px-6 pt-20">
        <TimecodeLabel index={1}>A glimpse of the work</TimecodeLabel>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PUBLIC_PREVIEW.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
          <Link
            href="/signup"
            className="group flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-line-strong bg-bg-raised p-4 text-center transition-colors hover:border-orange sm:aspect-auto"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted transition-colors group-hover:text-orange">
              <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <p className="font-display text-sm tracking-wide text-cream">
              +{PORTFOLIO_ITEMS.length - PUBLIC_PREVIEW.length} MORE PROJECTS
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-orange">
              Sign up to view &amp; book &rarr;
            </p>
          </Link>
        </div>
      </section>

      {/* WHAT WE COVER */}
      <section className="mx-auto max-w-6xl px-6 pt-20">
        <TimecodeLabel index={2}>What we cover</TimecodeLabel>
        <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.slug} className="bg-bg p-6">
              <h3 className="font-display text-xl tracking-wide text-cream">
                {cat.label}
              </h3>
              <p className="mt-2 text-sm text-muted">{cat.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-6xl px-6 pt-20">
        <TimecodeLabel index={3}>How booking works</TimecodeLabel>
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
