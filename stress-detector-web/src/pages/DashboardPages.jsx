import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";
import Datas from "../components/DiagnosticBox/Datas";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import StressChart from "../components/StresChart/StressChart";
import calender from  "../assets/icons/calendar.svg"
import TodayDiagnose from "../components/DiagnosticBox/TodayDiagnose";
// import staricon from "../assets/icons/star.png" // Tidak digunakan
import api from "../services/api"; // Import service API

function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useUser();
  const { activityId: paramActivityId } = useParams(); // Ambil activityId dari URL jika ada
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [incompleteYesterdayActivity, setIncompleteYesterdayActivity] = useState(null);
  const [stressTrendData, setStressTrendData] = useState([]);

  const sekarang = new Date();
  const formatActivityDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(t.DashboardDateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format tanggal hari ini untuk greeting default
  const todayFormattedDate = sekarang.toLocaleDateString(t.DashboardDateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No access token found. Please log in.");
        }

        // 1. Ambil aktivitas spesifik jika paramActivityId ada, jika tidak ambil yang terbaru
        let activityToDisplay = null;
        if (paramActivityId) {
          const response = await api.get(`/activities/${paramActivityId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const rawData = response.data.data;
          // Jika data dibungkus dalam properti 'activity', gabungkan dengan 'prediction'
          activityToDisplay = rawData.activity 
            ? { ...rawData.activity, ...rawData.prediction } 
            : rawData;
        } else {
          try {
            const response = await api.get("/activities/latest", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const rawData = response.data.data;
            // Lakukan normalisasi yang sama untuk data terbaru
            activityToDisplay = rawData.activity 
              ? { ...rawData.activity, ...rawData.prediction } 
              : rawData;
          } catch (err) {
            // Jika 404 (tidak ditemukan), biarkan activityToDisplay tetap null
            if (err.response?.status !== 404) {
              throw err;
            }
          }
        }
        setCurrentActivity(activityToDisplay);

        // 2. Periksa aktivitas kemarin yang belum lengkap
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        // Reset jam agar perbandingan tanggal akurat
        yesterday.setHours(0, 0, 0, 0);
        
        const yesterdayDateString = yesterday.toISOString().split('T')[0]; // Format YYYY-MM-DD

        const yesterdayActivityResponse = await api.get(`/activities?date=${yesterdayDateString}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const yesterdayActivity = yesterdayActivityResponse.data.data?.[0]; // Asumsi API mengembalikan array untuk query tanggal
        
        // Munculkan jika tidak ada data kemarin ATAU ada tapi belum selesai
        if (!yesterdayActivity || yesterdayActivity.status !== "Selesai") {
            setIncompleteYesterdayActivity(yesterdayActivity);
        } else {
            setIncompleteYesterdayActivity(null);
        }

        // 3. Ambil data tren stres 7 hari
        const trendResponse = await api.get("/dashboard/trend", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStressTrendData(trendResponse.data.data);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.response?.data?.message || err.message || "Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [paramActivityId, user.fullname, t.DashboardDateLocale]); // Tambahkan t.DashboardDateLocale ke dependencies

  const handleViewIncompleteDetail = () => {
    if (incompleteYesterdayActivity?.id) {
      navigate(`/LogActivity/${incompleteYesterdayActivity.id}`);
    } else {
      navigate("/LogActivity");
    }
  };

  const currentActivityFormattedDate = currentActivity ? formatActivityDate(currentActivity.activity_date) : "";

  if (loading) {
    return (
      <Layout title="Dashboard" name={user.fullname} role={user.role}>
        <div className="text-center py-10 theme-muted">Memuat data dashboard...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard" name={user.fullname} role={user.role}>
        <div className="text-center py-10 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  return (
  <Layout title="Dashboard" name={user.fullname} role={user.role}>
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

    {/* Greeting */}
    <div className="col-span-1 lg:col-span-4">
      <h1 className="theme-text text-2xl md:text-4xl font-bold">
        {t.DashboardGreeting} {user.fullname || "User"}
      </h1>

    {/* Date Display: Menampilkan tanggal hari ini, atau tanggal aktivitas jika sedang melihat detail */}
      <p className="theme-muted mt-1 text-sm md:text-sm">
        {paramActivityId && currentActivity ? currentActivityFormattedDate : todayFormattedDate}
      </p>
    </div>

    {/* Cards */}
      <div className="col-span-1 lg:col-span-4">
        <div className="theme-card rounded-2xl p-5 border">
          <div className="flex items-center gap-4">
            
            {/* Icon */}
            <div className="flex-shrink-0">
              <img
                src={calender}
                alt="calendar"
                className="w-8 h-8 dark:invert"
              />
            </div>

            {/* Text */}
            <div>
              <h2 className="theme-text text-sm md:text-lg font-bold">
                {t.LastJournalSummaryTitle}
              </h2>

              <p className="theme-muted text-sm mt-1">
                {currentActivityFormattedDate || "Belum ada aktivitas tercatat"}
              </p>
            </div>

          </div>
        </div>
      </div>

    {/* Lengkapi catatan */}
    {incompleteYesterdayActivity && (
      <div className="col-span-1 lg:col-span-4">
        <div className="theme-card border border-orange-500/40 rounded-xl px-6 py-5">
          <div className="flex items-center justify-between">
            
            {/* Left Content */}
            <div className="flex items-center gap-4">
              
              {/* Icon Box */}
              <div className="w-10 h-10 rounded-md bg-orange-400 flex items-center justify-center">
                <img
                  src={calender}
                  alt="calendar"
                  className="w-5 h-5 opacity-80"
                />
              </div>

              {/* Text */}
              <div>
                <h2 className="text-orange-400 font-semibold text-lg">
                  {incompleteYesterdayActivity?.status === "Draft" ? "Catatan Kemarin Belum Lengkap" : "Catatan Kemarin Belum Terisi"}
                </h2>

                <p className="theme-muted text-sm mt-1">
                  Lengkapi catatan aktivitas agar data diperbarui.
                </p>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleViewIncompleteDetail}
              className="
                bg-orange-400
                hover:bg-orange-500
                text-black
                font-medium
                px-6
                py-3
                rounded-md
                transition-colors
              "
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Data Cards */}
      <Datas
        metric="Mood"
        title={t.MoodScoreTitle}
        value={currentActivity?.mood_score?.toString() || "0"}
      />
      <Datas
        metric="Fatigue"
        title={t.FatigueLevelTitle}
        value={currentActivity?.fatigue_level?.toString() || "0"}
      />
      <Datas
        metric="SocialMedia"
        title={t.SocialMediaTitle}
        value={currentActivity?.social_media_hours?.toString() || "0"}
      />
      <Datas
        metric="Stress"
        title={t.StressScoreTitle}
        value={currentActivity?.stress_score?.toString() || "0"}
      />


    {/* Chart */}
    <div className="col-span-1 lg:col-span-3">
      <StressChart data={stressTrendData} />
    </div>

    {/* Side Panel */}
    <div className="theme-card rounded-2xl p-5 md:p-6">
      <h2 className="theme-text text-lg md:text-sm font-semibold mb-6">
        Kondisi
      </h2>

      <TodayDiagnose
        studyTime={currentActivity?.study_hours || 0}
        taskLoad={currentActivity?.assignment_load || 0}
        deadlinePressure={currentActivity?.deadline_pressure || 0}
        physicalActivity={currentActivity?.physical_activity_minutes || 0}
        sleep={currentActivity?.sleep_hours || 0}
      />
    </div>

  </div>
</Layout>
  );
}

export default DashboardPage;
