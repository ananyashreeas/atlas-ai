import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex bg-slate-950 text-white min-h-screen">
      <Sidebar />

      <section className="flex-1 p-12">
        {children}
      </section>
    </main>
  );
}