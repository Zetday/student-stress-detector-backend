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
import { getActivityHistory } from "../services/activityService";
import { useTheme } from "../contexts/ThemeContext";

const parseDateOnly = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const stringValue = String(dateValue);
  const dateStr = stringValue.includes("T") ? stringValue.split("T")[0] : stringValue;
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const getLocalDateKey = (date) => {
  const parsedDate = date instanceof Date ? date : parseDateOnly(date) || new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date, amount) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const getActivityDateKey = (item) =>
  getLocalDateKey(
    item?.prediction?.prediction_date ||
    item?.activity?.activity_date ||
    item?.datetime,
  );

const getNumberField = (data, snakeCaseName, camelCaseName) => {
  const value = data?.[snakeCaseName] ?? data?.[camelCaseName];
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizePercent = (value) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.min(numberValue <= 10 ? numberValue * 10 : numberValue, 100);
};

const mergeHistoryItem = (item) => {
  if (!item) {
    return null;
  }

  return {
    ...item.activity,
    ...item.prediction,
    id: item.id,
    activity_date: item.prediction?.prediction_date || item.activity?.activity_date,
    activity_status: item.activity?.activity_status,
    status: item.status,
    stress_score: item.stressScore,
    stressScore: item.stressScore,
  };
};

const buildStressTrendData = (history, endDate, locale) => {
  const completedItemsByDate = new Map();

  history
    .filter((item) => item.status !== "Draft")
    .forEach((item) => {
      const activityDateKey = getActivityDateKey(item);

      if (activityDateKey && !completedItemsByDate.has(activityDateKey)) {
        completedItemsByDate.set(activityDateKey, item);
      }
    });

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(endDate, index - 6);
    const dateKey = getLocalDateKey(date);
    const item = completedItemsByDate.get(dateKey);

    return {
      label: date.toLocaleDateString(locale || "id-ID", {
        day: "numeric",
        month: "short",
      }),
      stress_score: item ? item.stressScore : null,
      hasStressData: Boolean(item),
      prediction_date: dateKey,
    };
  });
};

function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useUser();
  const { theme } = useTheme();
  const { activityId: paramActivityId } = useParams(); // Ambil activityId dari URL jika ada
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [draftActivity, setDraftActivity] = useState(null);
  const [stressTrendData, setStressTrendData] = useState([]);

  const currentDate = new Date();
  const formatActivityDate = (dateString) => {
    if (!dateString) return "";
    const date = parseDateOnly(dateString) || new Date(dateString);
    return date.toLocaleDateString(t.DashboardDateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format tanggal hari ini untuk greeting default
  const todayFormattedDate = currentDate.toLocaleDateString(t.DashboardDateLocale, {
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
        const today = new Date();
        const historyResponse = await getActivityHistory();

        if (historyResponse.error) {
          throw new Error(historyResponse.message);
        }

        const history = historyResponse.data || [];
        const sortedHistory = [...history].sort((a, b) => {
          const dateA = a.predictionDate || "";
          const dateB = b.predictionDate || "";
          if (dateA !== dateB) {
            return dateB.localeCompare(dateA);
          }
          return b.datetime - a.datetime;
        });
        const todayStartDate = addDays(today, -6);
        const todayStartDateKey = getLocalDateKey(todayStartDate);
        const todayDateKey = getLocalDateKey(today);
        const currentSevenDayItems = sortedHistory.filter((item) => {
          const activityDateKey = getActivityDateKey(item);

          return (
            activityDateKey &&
            activityDateKey >= todayStartDateKey &&
            activityDateKey <= todayDateKey
          );
        });

        setDraftActivity(
          paramActivityId
            ? null
            : currentSevenDayItems.find((item) => item.status === "Draft") || null,
        );

        // 1. Ambil aktivitas spesifik jika paramActivityId ada, jika tidak ambil data selesai terbaru.
        let activityToDisplay = null;
        if (paramActivityId) {
          const selectedHistoryItem = sortedHistory.find(
            (item) => String(item.id) === String(paramActivityId),
          );

          if (selectedHistoryItem) {
            activityToDisplay = mergeHistoryItem(selectedHistoryItem);
          } else {
            const response = await api.get(`/activities/${paramActivityId}`);
            const rawData = response.data.data;
            // Jika data dibungkus dalam properti 'activity', gabungkan dengan 'prediction'
            activityToDisplay = rawData.activity 
              ? { ...rawData.activity, ...rawData.prediction } 
              : rawData;
          }
        } else {
          const latestCompletedItem = sortedHistory.find((item) => item.status !== "Draft");
          activityToDisplay = mergeHistoryItem(latestCompletedItem);
        }

        setCurrentActivity(activityToDisplay);

        const detailDate =
          parseDateOnly(activityToDisplay?.activity_date) ||
          parseDateOnly(activityToDisplay?.prediction_date) ||
          today;

        setStressTrendData(buildStressTrendData(sortedHistory, detailDate, t.DashboardDateLocale));

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.response?.data?.message || err.message || "Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [paramActivityId, user.fullname, t.DashboardDateLocale]); // Tambahkan t.DashboardDateLocale ke dependencies

  const handleViewDraftDetail = () => {
    navigate("/activity-history?status=draft");
  };

  const currentActivityFormattedDate = currentActivity ? formatActivityDate(currentActivity.activity_date) : "";
  const stressScore = getNumberField(currentActivity, "stress_score", "stressScore");
  const studyHours = getNumberField(currentActivity, "study_hours", "studyHours");
  const deadlinePressure = getNumberField(currentActivity, "deadline_pressure", "deadlinePressure");
  const taskLoad = getNumberField(currentActivity, "assignment_load", "assignmentLoad");
  const moodScore = getNumberField(currentActivity, "mood_score", "moodScore");
  const fatigueLevel = getNumberField(currentActivity, "fatigue_level", "fatigueLevel");
  const screenTime = getNumberField(currentActivity, "screen_time_hours", "screenTimeHours");
  const socialMedia = getNumberField(currentActivity, "social_media_hours", "socialMediaHours");
  const physicalActivity = getNumberField(currentActivity, "physical_activity_minutes", "physicalActivityMinutes");
  const sleepHours = getNumberField(currentActivity, "sleep_hours", "sleepHours");
  const conditionItems = [
    {
      label: t.MoodScoreTitle,
      metric: {
        display: moodScore.toString(),
        width: Math.min(moodScore, 100),
        color:
          moodScore <= 25
            ? "bg-green-500"
            : moodScore <= 65
            ? "bg-yellow-500"
            : "bg-red-500",
      },
    },
    {
      label: t.FatigueLevelTitle,
      metric: {
        display: fatigueLevel.toString(),
        width: Math.min(fatigueLevel, 100),
        color:
          fatigueLevel < 40
            ? "bg-green-500"
            : fatigueLevel < 70
            ? "bg-yellow-500"
            : "bg-red-500",
      },
    },
    {
      label: t.ActivityScreenTimeTitle || "Screen Time",
      metric: {
        display: `${screenTime} ${t.HourText}`,
        width: Math.min((screenTime / 24) * 100, 100),
        color:
          screenTime < 4
            ? "bg-green-500"
            : screenTime < 8
            ? "bg-yellow-500"
            : "bg-red-500",
      },
    },
    {
      label: t.SocialMediaTitle,
      metric: {
        display: `${socialMedia} ${t.HourText}`,
        width: Math.min((socialMedia / 24) * 100, 100),
        color:
          socialMedia < 2
            ? "bg-green-500"
            : socialMedia < 4
            ? "bg-yellow-500"
            : "bg-red-500",
      },
    },
    {
      label: t.PhysicalActivityTitle || "Aktivitas Fisik",
      metric: {
        display: `${physicalActivity} ${t.MinuteText}`,
        width: Math.min((physicalActivity / 60) * 100, 100),
        color:
          physicalActivity >= 30
            ? "bg-green-500"
            : physicalActivity >= 15
            ? "bg-yellow-500"
            : "bg-red-500",
      },
    },
    {
      label: t.ActivitySleepHoursTitle || t.LastNightSleepTitle || "Jam Tidur",
      metric: {
        display: `${sleepHours} ${t.HourText}`,
        width: Math.min((sleepHours / 8) * 100, 100),
        color:
          sleepHours >= 7
            ? "bg-green-500"
            : sleepHours >= 5
            ? "bg-yellow-500"
            : "bg-red-500",
      },
    },
  ];

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

    {!currentActivity ? (
      <div className="col-span-1 lg:col-span-4 py-8">
        <div className="theme-card border rounded-3xl p-8 md:p-12 text-center space-y-6 max-w-3xl mx-auto shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-400 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="theme-text text-2xl md:text-3xl font-extrabold">
              {t.DashboardDateLocale === "id-ID" ? "Mulai Pantau Stres Anda!" : "Start Tracking Your Stress!"}
            </h2>
            <p className="theme-muted text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              {t.DashboardDateLocale === "id-ID"
                ? "Dapatkan analisis tingkat stres akademik, produktivitas belajar, kualitas tidur, dan rekomendasi personal berbasis AI dengan mengisi jurnal harian Anda."
                : "Get insights into your academic stress levels, study productivity, sleep quality, and personalized AI-driven recommendations by filling out your daily journal."}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate("/LogActivity")}
              className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-bold text-sm transition hover:bg-blue-600 shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              {t.DashboardDateLocale === "id-ID" ? "+ Mulai Isi Jurnal Hari Ini" : "+ Start Journaling Today"}
            </button>
          </div>

          <div className="pt-6 border-t border-(--border-soft) grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-2xl mx-auto">
            <div className="space-y-1">
              <p className="text-xs font-semibold theme-muted uppercase tracking-wider">📊 Pantau Stres</p>
              <p className="text-[11px] theme-subtle">Kalkulasi skor stres berkala.</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold theme-muted uppercase tracking-wider">📚 Beban Belajar</p>
              <p className="text-[11px] theme-subtle">Monitor waktu belajar & deadline.</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold theme-muted uppercase tracking-wider">🛌 Kualitas Tidur</p>
              <p className="text-[11px] theme-subtle">Analisis hubungan tidur & produktivitas.</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold theme-muted uppercase tracking-wider">💡 Rekomendasi AI</p>
              <p className="text-[11px] theme-subtle">Tips personal kelola keseimbangan hidup.</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <>
        {/* Cards */}
        <div className="col-span-1 lg:col-span-4">
          <div className="theme-card rounded-2xl p-5 border">
            <div className="flex items-center gap-4">
              
              {/* Icon */}
              <div className="shrink-0">
                <img
                  src={calender}
                  alt="calendar"
                  className={`w-8 h-8 ${theme === "dark" ? "invert" : ""}`}
                />
              </div>
  
              {/* Text */}
              <div>
                <h2 className="theme-text text-sm md:text-lg font-bold">
                  {paramActivityId ? t.DetailJournalSummaryTitle : t.LastJournalSummaryTitle}
                </h2>
  
                <p className="theme-muted text-sm mt-1">
                  {currentActivityFormattedDate || t.DashboardNoActivityRecorded}
                </p>
              </div>
  
            </div>
          </div>
        </div>

        {/* Lengkapi catatan */}
        {draftActivity && (
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
                      Catatan Aktivitas Belum Lengkap
                    </h2>
  
                    <p className="theme-muted text-sm mt-1">
                      Lengkapi catatan aktivitas agar data diperbarui.
                    </p>
                  </div>
                </div>
  
                {/* Button */}
                <button
                  onClick={handleViewDraftDetail}
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
          metric="Stress"
          title={t.StressScoreTitle}
          value={stressScore.toString()}
        />
        <Datas
          metric="StudyTime"
          title={t.StudyTimeTitle}
          value={studyHours.toString()}
        />
        <Datas
          metric="DeadlinePressure"
          title={t.DeadlinePressureTitle}
          value={Math.round(normalizePercent(deadlinePressure)).toString()}
        />
        <Datas
          metric="TaskLoad"
          title={t.TaskLoadTitle}
          value={Math.round(normalizePercent(taskLoad)).toString()}
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
            items={conditionItems}
          />
        </div>

        <div className="col-span-1 lg:col-span-4">
          <div className="theme-card-muted rounded-2xl border p-5">
            <div className="mb-4">
              <p className="theme-text text-lg font-semibold">{t.DashboardDailyNoteTitle}</p>
              <p className="theme-muted mt-2 text-sm leading-relaxed">
                {t.DashboardDailyNoteDescription}
              </p>
            </div>
  
            <textarea
              readOnly
              value={currentActivity?.note || ""}
              placeholder={t.DashboardDailyNotePlaceholder}
              className="theme-input min-h-45 w-full resize-none rounded-2xl border p-4 text-sm outline-none"
            />
  
            <div className="theme-subtle mt-3 text-right text-xs">
              {(currentActivity?.note || "").length}/1000
            </div>
          </div>
        </div>
      </>
    )}

  </div>
</Layout>
  );
}

export default DashboardPage;
