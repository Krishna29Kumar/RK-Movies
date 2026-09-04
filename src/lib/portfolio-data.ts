export const CATEGORIES = [
  {
    slug: "weddings",
    label: "Wedding",
    blurb: "Full-day coverage, cinematic edits, and same-day highlight reels.",
  },
  {
    slug: "events",
    label: "Events",
    blurb: "Birthdays, anniversaries, engagements, and private celebrations.",
  },
  {
    slug: "conferences",
    label: "Conference",
    blurb: "Multi-cam keynote capture, panel coverage, and recap videos.",
  },
  {
    slug: "school",
    label: "School Events",
    blurb: "Annual days, sports meets, farewells, and cultural programs.",
  },
  {
    slug: "college",
    label: "College Events",
    blurb: "Fests, convocations, hackathons, and department showcases.",
  },
  {
    slug: "havan",
    label: "Havan",
    blurb: "Fire ritual ceremonies, shot with a quiet, respectful presence.",
  },
  {
    slug: "choki",
    label: "Choki",
    blurb: "Ramayan paath and choki ceremonies, full sitting to closing aarti.",
  },
  {
    slug: "jagran",
    label: "Jagran",
    blurb: "Night-long devotional jagrans, multi-cam coverage till sunrise.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export type PortfolioItem = {
  id: string;
  title: string;
  category: CategorySlug;
  client: string;
  duration: string;
  year: string;
};

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  { id: "p1", title: "Amara & Dev — Udaipur", category: "weddings", client: "Private client", duration: "3-day coverage", year: "2026" },
  { id: "p2", title: "Riverside Vows", category: "weddings", client: "Private client", duration: "2-day coverage", year: "2025" },
  { id: "p3", title: "Meera's 25th Birthday", category: "events", client: "Private client", duration: "Half-day", year: "2026" },
  { id: "p4", title: "Silver Jubilee Anniversary", category: "events", client: "Private client", duration: "Full-day", year: "2025" },
  { id: "p5", title: "NexCon Product Summit", category: "conferences", client: "NexCon Technologies", duration: "1-day, 3-camera", year: "2026" },
  { id: "p6", title: "FinEdge Leadership Offsite", category: "conferences", client: "FinEdge Capital", duration: "2-day recap", year: "2025" },
  { id: "p7", title: "Founders' Day Assembly", category: "school", client: "Greenwood Public School", duration: "Half-day", year: "2026" },
  { id: "p8", title: "Annual Sports Meet", category: "school", client: "St. Xavier's High", duration: "Full-day, multi-cam", year: "2025" },
  { id: "p9", title: "Spring Cultural Fest", category: "college", client: "KR Mangalam University", duration: "3-day coverage", year: "2026" },
  { id: "p10", title: "Convocation 2025", category: "college", client: "State College of Engineering", duration: "1-day ceremony", year: "2025" },
  { id: "p11", title: "Griha Pravesh Havan", category: "havan", client: "Private client", duration: "Half-day", year: "2026" },
  { id: "p12", title: "Navratri Havan", category: "havan", client: "Private client", duration: "Half-day", year: "2025" },
  { id: "p13", title: "Ramayan Choki — Sharma Family", category: "choki", client: "Private client", duration: "Full-day", year: "2026" },
  { id: "p14", title: "Choki & Bhajan Sandhya", category: "choki", client: "Private client", duration: "Full-day", year: "2025" },
  { id: "p15", title: "Mata Ki Jagran", category: "jagran", client: "Private client", duration: "Overnight, multi-cam", year: "2026" },
  { id: "p16", title: "Community Jagran", category: "jagran", client: "Private client", duration: "Overnight, multi-cam", year: "2025" },
];