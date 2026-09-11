import { auth } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="flex flex-col gap-8 sm:flex-row">
        <DashboardNav userName={session?.user?.name ?? ""} />
        <div className="min-w-0 max-w-5xl flex-1">{children}</div>
      </div>
    </div>
  );
}