import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Layout from "../../layouts/Layout";
import Datas from "../components/DiagnosticBox/Datas";
import { useLanguage } from "../contexts/LanguageContext";
import StressChart from "../components/StresChart/StressChart";
import calender from  "../assets/icons/calendar.svg"

function DashboardPage() {
  const { t } = useLanguage();

  const sekarang = new Date();
  const formatTanggal = sekarang.toLocaleDateString(t.DashboardDateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  return (
  <Layout title="Dashboard" name="User" role="User">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

    {/* Greeting */}
    <div className="col-span-1 lg:col-span-4">
      <h1 className="text-2xl md:text-4xl font-bold text-white">
        {t.DashboardGreeting} Aryanda
      </h1>

    {/* Today Date */}
      <p className="text-zinc-400 mt-1 text-sm md:text-base">
        {formatTanggal}
      </p>
    </div>

    {/* Cards */}
    
      <div className="col-span-1 lg:col-span-4">
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center gap-4">
            
            {/* Icon */}
            <div className="flex-shrink-0">
              <img
                src={calender}
                alt="calendar"
                className="w-8 h-8 invert"
              />
            </div>

            {/* Text */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-zinc-200">
                {t.LastJournalSummaryTitle}
              </h2>

              <p className="text-zinc-400 text-lg mt-1">
                Jumat, 17 April 2026
              </p>
            </div>

          </div>
        </div>
      </div>

      <Datas
        metric="Mood"
        title={t.MoodScoreTitle}
        value="65"
      />
      <Datas
        metric="Fatigue"
        title={t.FatigueLevelTitle}
        value="60"
      />
      <Datas
        metric="SocialMedia"
        title={t.SocialMediaTitle}
        value="2"
      />
      <Datas
        metric="Stress"
        title={t.StressScoreTitle}
        value="72"
      />


    {/* Chart */}
    <div className="col-span-1 lg:col-span-3">

      <div className="col-span-1 lg:col-span-3">
        <StressChart />
      </div>

    </div>

    {/* Side Panel */}
    <div className="bg-zinc-800 rounded-2xl p-5 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-white mb-6">
        Kondisi hari ini
      </h2>

      <div className="space-y-5">
        {[
          { label: `${t.StudyTimeTitle}`, value: "8%", width: "8%", color: "bg-red-400" },
          { label: `${t.TaskLoadTitle}`, value: "88%", width: "88%", color: "bg-red-400" },
          { label: `${t.DeadlinePressureTitle}`, value: "92%", width: "92%", color: "bg-blue-400" },
          { label: `${t.PhysicalActivityTitle}`, value: "40%", width: "40%", color: "bg-emerald-400" },
          { label: `${t.LastNightSleepTitle}`, value: "40%", width: "40%", color: "bg-emerald-400" },
        ].map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-300 text-sm md:text-base">
                {item.label}
              </span>

              <span className="text-zinc-400 text-sm">
                {item.value}
              </span>
            </div>

            <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color}`}
                style={{ width: item.width }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Insight */}
    <div className="col-span-1 lg:col-span-4">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
        Insight terbaru
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="bg-zinc-800 rounded-2xl p-5 border-l-4 border-red-500">
          <h3 className="text-base md:text-lg font-semibold text-white mb-2">
            Kurang tidur terdeteksi
          </h3>

          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Tidur 5.5 jam semalam berkontribusi pada peningkatan level
            kortisol Anda pagi ini sebesar 14%.
          </p>
        </div>

        <div className="bg-zinc-800 rounded-2xl p-5 border-l-4 border-emerald-500">
          <h3 className="text-base md:text-lg font-semibold text-white mb-2">
            Dampak positif olahraga
          </h3>

          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Sesi olahraga 30 menit berhasil menurunkan detak jantung
            istirahat sebesar 4 bpm.
          </p>
        </div>

      </div>
    </div>

  </div>
</Layout>
  );
}

export default DashboardPage;
