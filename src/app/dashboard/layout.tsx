import { auth } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <DashboardNav userName={session?.user?.name ?? ""} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
