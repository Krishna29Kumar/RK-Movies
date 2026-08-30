"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import BookingCalendar from "@/components/BookingCalendar";
import {
  EVENT_TYPES,
  CAMERA_TYPES,
  SHOOT_TYPES,
  ADVANCE_AMOUNTS,
} from "@/lib/booking-constants";

type Status = "idle" | "submitting" | "success" | "error";
type LocationStatus = "idle" | "locating" | "error";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingForm({ initialDate }: { initialDate?: string }) {
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === "loading") {
    return (
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        Loading…
      </p>
    );
  }

  return (
    <BookingFormInner
      key={sessionStatus}
      session={session}
      initialDate={initialDate}
    />
  );
}

function BookingFormInner({
  session,
  initialDate,
}: {
  session: Session | null;
  initialDate?: string;
}) {
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(`${initialDate}T00:00:00`) : null
  );
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  const [form, setForm] = useState(() => ({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: (session?.user as (Session["user"] & { mobile?: string }) | undefined)?.mobile ?? "",
    eventType: EVENT_TYPES[0],
    startTime: "",
    endTime: "",
    address: "",
    cameraCount: "2",
    cameraType: CAMERA_TYPES[0],
    shootType: SHOOT_TYPES[2],
    message: "",
  }));

  // Check availability the moment the form (and its calendar) mounts.
  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => {
        if (data.bookedDates) {
          setBookedDates(new Set(data.bookedDates as string[]));
        }
      })
      .catch(() => { })
      .finally(() => setLoadingAvailability(false));
  }, []);

  const durationHours = useMemo(() => {
    if (!form.startTime || !form.endTime) return null;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    let diffMinutes = eh * 60 + em - (sh * 60 + sm);
    if (diffMinutes <= 0) diffMinutes += 24 * 60; // crosses midnight
    return Math.round((diffMinutes / 60) * 10) / 10;
  }, [form.startTime, form.endTime]);

  const advanceAmount = ADVANCE_AMOUNTS[form.eventType];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedDate) {
      setStatus("error");
      setErrorMessage("Pick a date on the calendar first.");
      return;
    }
    if (!form.startTime || !form.endTime || durationHours === null) {
      setStatus("error");
      setErrorMessage("Please select a start and end time.");
      return;
    }

    setStatus("submitting");

    try {
      // 1. Create a Razorpay order for the advance amount (also re-checks
      //    availability server-side before charging anyone).
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: form.eventType,
          eventDate: format(selectedDate, "yyyy-MM-dd"),
        }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setStatus("error");
        setErrorMessage(orderData.error || "Could not start payment.");
        return;
      }

      // 2. Load the Razorpay checkout script and open the payment modal.
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setStatus("error");
        setErrorMessage("Could not load the payment gateway. Check your connection.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Lensreel Films",
        description: `Advance payment — ${form.eventType}`,
        order_id: orderData.orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#e8752c" },
        handler: async (response: RazorpaySuccessResponse) => {
          // 3. Payment succeeded — finalize the booking with the signed proof.
          try {
            const bookingRes = await fetch("/api/bookings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...form,
                eventDate: format(selectedDate, "yyyy-MM-dd"),
                durationHours,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const bookingData = await bookingRes.json();

            if (!bookingRes.ok) {
              setStatus("error");
              setErrorMessage(bookingData.error || "Payment succeeded but booking failed.");
              return;
            }

            setStatus("success");
          } catch {
            setStatus("error");
            setErrorMessage(
              "Payment succeeded but we couldn't reach our server. Please contact us with payment ID " +
              response.razorpay_payment_id
            );
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      });

      razorpay.open();
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the server. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-line-strong bg-bg-raised p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-teal">
          Request received &amp; advance paid
        </p>
        <h2 className="mt-3 font-display text-2xl tracking-wide text-cream">
          {selectedDate ? format(selectedDate, "d MMMM yyyy") : "Your date"} is on hold
        </h2>
        <p className="mt-2 text-sm text-muted">
          We&apos;ll confirm by email within 24 hours. A couple of other
          bookings can still be made for the same date.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
      <BookingCalendar
        bookedDates={bookedDates}
        selected={selectedDate}
        onSelect={setSelectedDate}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Selected date
          </p>
          <p className="font-display text-xl tracking-wide text-cream">
            {loadingAvailability
              ? "Loading calendar…"
              : selectedDate
                ? format(selectedDate, "EEEE, d MMMM yyyy")
                : "Pick a date on the calendar"}
          </p>
        </div>

        <Field label="Full name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Phone">
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Event type">
          <select
            required
            value={form.eventType}
            onChange={(e) =>
              setForm({ ...form, eventType: e.target.value as typeof form.eventType })
            }
            className="input"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start time">
            <input
              required
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="End time">
            <input
              required
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="input"
            />
          </Field>
        </div>
        {durationHours !== null && (
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-teal">
            Estimated duration: {durationHours} hour{durationHours === 1 ? "" : "s"}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Number of cameras">
            <input
              required
              type="number"
              min={1}
              max={20}
              value={form.cameraCount}
              onChange={(e) => setForm({ ...form, cameraCount: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Camera type">
            <select
              required
              value={form.cameraType}
              onChange={(e) =>
                setForm({ ...form, cameraType: e.target.value as typeof form.cameraType })
              }
              className="input"
            >
              {CAMERA_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Coverage">
          <select
            required
            value={form.shootType}
            onChange={(e) =>
              setForm({ ...form, shootType: e.target.value as typeof form.shootType })
            }
            className="input"
          >
            {SHOOT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Address">
          <div className="space-y-2">
            <textarea
              required
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input resize-none"
              placeholder="e.g. Taj Palace, Sardar Patel Marg, New Delhi"
            />
            <button
              type="button"
              onClick={() => {
                if (!("geolocation" in navigator)) {
                  setLocationStatus("error");
                  return;
                }
                setLocationStatus("locating");
                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                      );
                      const data = await res.json();
                      setForm((prev) => ({
                        ...prev,
                        address:
                          data?.display_name ||
                          `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                      }));
                    } catch {
                      setForm((prev) => ({
                        ...prev,
                        address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                      }));
                    } finally {
                      setLocationStatus("idle");
                    }
                  },
                  () => setLocationStatus("error"),
                  { timeout: 10000 }
                );
              }}
              disabled={locationStatus === "locating"}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-orange hover:underline disabled:opacity-50"
            >
              {locationStatus === "locating" ? "Locating…" : "📍 Use current location"}
            </button>
            {locationStatus === "error" && (
              <p className="font-mono text-[10px] text-orange">
                Couldn&apos;t get your location. Please type the address instead.
              </p>
            )}
          </div>
        </Field>

        <Field label="Anything we should know? (optional)">
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input resize-none"
            placeholder="Expected guest count, schedule, specific shots you want…"
          />
        </Field>

        <div className="rounded-sm border border-line-strong bg-bg-raised p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Advance payment required
          </p>
          <p className="mt-1 font-display text-2xl tracking-wide text-orange">
            ₹{advanceAmount.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-muted">
            Paid securely via Razorpay. Confirms your slot request instantly.
          </p>
        </div>

        {status === "error" && (
          <p className="rounded-sm border border-orange/40 bg-orange-soft px-3 py-2 font-mono text-xs text-orange">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-sm bg-orange px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "submitting"
            ? "Processing…"
            : `Pay ₹${advanceAmount.toLocaleString("en-IN")} & request this date`}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}