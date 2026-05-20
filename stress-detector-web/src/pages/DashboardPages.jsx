import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <Navbar title="Dashboard" name="User" role="User Profile" />

          <section className="p-8">
            <div className="rounded-xl border border-white/5 bg-[#141414] p-6">
              <h2 className="text-xl font-semibold">Dashboard</h2>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
