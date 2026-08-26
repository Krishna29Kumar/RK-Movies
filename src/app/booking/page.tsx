import BookingForm from "@/components/BookingForm";

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-14 pb-20 sm:pt-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
        Availability
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-wide text-cream sm:text-6xl">
        BOOK A DATE
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Pick an open date, tell us about the event, and we&apos;ll confirm
        within 24 hours. Booked dates are greyed out automatically.
      </p>

      <div className="mt-10">
        <BookingForm />
      </div>
    </div>
  );
}
