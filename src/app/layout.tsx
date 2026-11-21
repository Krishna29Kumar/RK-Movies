import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import ViewfinderCursor from "@/components/ViewfinderCursor";

export const metadata: Metadata = {
  title: "RK-Movies — Wedding, Event & Campus Videography",
  description:
    "Cinematic videography for weddings, conferences, school events, and college events by RK-Movies. Sign in to view the full portfolio and book a date.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col bg-bg text-cream antialiased">
        <ViewfinderCursor />
        <div className="grain" />
        <AuthProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
