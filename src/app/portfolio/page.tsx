import { redirect } from "next/navigation";

// The full portfolio now lives behind sign-in.
export default function PortfolioRedirect() {
  redirect("/dashboard/work");
}
