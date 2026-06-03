import AcademicCondition from "../components/Insights/AcademicCondition";
import AINarrativeCard from "../components/Insights/AINarrativeCard";
import PriorityCard from "../components/Insights/PriorityCard";
import StatsCard from "../components/Insights/StatsCard";
import StressIntensityChart from "../components/Insights/StressIntensityChart";
import WeeklyActivityChart from "../components/Insights/WeeklyActivityChart";
import Layout from "../../layouts/Layout";

// Dummy data untuk metrics
const metricsData = [
  {
    title: "Skor Stres",
    value: 82,
    maxScore: 100,
    color: "text-red-400",
    subtitle: "Meninggi (Intensif)",
    trend: 7,
  },
  {
    title: "Rata-Rata Tidur",
    value: 64,
    maxScore: 100,
    color: "text-blue-400",
    subtitle: "7% minggu lalu ↑",
    trend: 7,
  },
  {
    title: "Sukses Tugas",
    value: 42,
    maxScore: 100,
    color: "text-green-400",
    subtitle: "Selesai: 10 hari",
    trend: -5,
  },
  {
    title: "Skor Kebugaran",
    value: 89,
    maxScore: 100,
    color: "text-orange-400",
    subtitle: "Konsisten: 18 hari",
    trend: 12,
  },
];

// Dummy data untuk prioritas hari ini
const priorityTasks = [
  {
    priority: "SANGAT URGENT",
    title: "Cicil Tugas Kalkulus",
    description:
      "Data menunjukkan partisipasi level stress saat mengerjakan tugas ini sangat tinggi & bisa berdampak pada durasi tidur hari ini.",
    duration: "90 Menit",
    stressImpact: "90 Menit",
    level: "URGENT",
  },
  {
    priority: "SANGAT URGENT",
    title: "Cicil Tugas Kalkulus",
    description:
      "Data menunjukkan partisipasi level stress saat mengerjakan tugas ini sangat tinggi & bisa berdampak pada durasi tidur hari ini.",
    duration: "90 Menit",
    stressImpact: "90 Menit",
    level: "URGENT",
  },
  {
    priority: "SEDANG",
    title: "Sesi Belajar Pagi",
    description:
      "Waktu 20-30 pagi untuk belajar sebelum pemulihan. Hasil riset menunjukkan OORD) dalam gangguan untuk kemampuan fokus CWD.",
    duration: "90 Menit",
    stressImpact: "90 Menit",
    level: "SEDANG",
  },
  {
    priority: "SEDANG",
    title: "Sesi Belajar Pagi",
    description:
      "Waktu 20-30 pagi untuk belajar sebelum pemulihan. Hasil riset menunjukkan OORD) dalam gangguan untuk kemampuan fokus CWD.",
    duration: "90 Menit",
    stressImpact: "90 Menit",
    level: "SEDANG",
  },
];

function InsightPage() {
  return (
    <Layout title="Dashboard" name="User" role="User">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <p className="theme-subtle text-xs uppercase mb-2">
            Insights & Academic Analytics
          </p>
          <h1 className="theme-text text-3xl md:text-4xl font-bold">
            Insights Akademik & Lifestyle
          </h1>
        </div>

        {/* Section 1: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsData.map((metric, index) => (
            <StatsCard
              key={index}
              title={metric.title}
              value={metric.value}
              maxScore={metric.maxScore}
              color={metric.color}
              subtitle={metric.subtitle}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Section 2: AI Narrative Insight */}
        <AINarrativeCard
          title="AI Narrative Insight"
          subtitle="Berikut insight untuk minggu ini"
          description="Analisis AI menunjukkan korelasi kuat antara Assignment Late pada hari Kamis dan penurunan Sleep Quality. Dari data minggu ini, terdeteksi pola stress yang meningkat seiring dengan workload akademik yang naik 15% sejak Rabu. Disarankan untuk membedakan hidup dengan pekerjaan dan juga kesehatan harus prioritas utama. Waktu tidur berkualitas menjadi kunci dalam mengelola stress yang ada. Karir memang penting, namun kesehatan adalah investasi jangka panjang untuk produktivitas & juga kesehatan mental. Hal tersebut direkomendasikan untuk membedakan waktu belajar menjadi sesi yang lebih kecil mulai dari jam 22:00 untuk pemulihan lebih maksimal."
        />

        {/* Section 3: Academic Condition Metrics */}
        <AcademicCondition />

        {/* Section 4: Weekly Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WeeklyActivityChart />
          <StressIntensityChart avgScore={74} />
        </div>

        {/* Section 5: Prioritas Hari Ini */}
        <div>
          <h2 className="theme-text text-2xl font-bold mb-4">
            Prioritas Hari Ini
          </h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {priorityTasks.map((task, index) => (
              <PriorityCard
                key={index}
                title={task.title}
                description={task.description}
                level={task.level}
                duration={task.duration}
                stressImpact={task.stressImpact}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default InsightPage;
