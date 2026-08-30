import { redirect } from "next/navigation";

// Booking now happens inside the signed-in dashboard.
export default function BookingRedirect() {
  redirect("/dashboard/book");
}
