import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AcademicCondition from "../components/Insights/AcademicCondition";
import AINarrativeCard from "../components/Insights/AINarrativeCard";
import PriorityCard from "../components/Insights/PriorityCard";
import StatsCard from "../components/Insights/StatsCard";
import StressIntensityChart from "../components/Insights/StressIntensityChart";
import WeeklyActivityChart from "../components/Insights/WeeklyActivityChart";
import Layout from "../../layouts/Layout";
import api from "../services/api";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

const getAverage = (items, selector) => {
  const values = items.map(selector).filter((v) => Number.isFinite(v));
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

const getTrendPercentage = (items, selector) => {
  if (items.length < 2) return 0;
  const sorted = [...items].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const mid = Math.ceil(sorted.length / 2);
  const firstAvg = getAverage(sorted.slice(0, mid), selector);
  const lastAvg = getAverage(sorted.slice(mid), selector);
  if (!firstAvg || !lastAvg) return 0;
  return Math.round(((lastAvg - firstAvg) / firstAvg) * 100);
};

const formatDateRange = (startStr, endStr, locale) => {
  if (!startStr || !endStr) return "";
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
  const opts = { day: "numeric", month: "short", year: "numeric" };
  return `${start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, opts)}`;
};

// ─── Data fetchers (all fire in parallel) ────────────────────────────────────

/** Fetch the latest weekly summary — no auto-generation side-effects */
const fetchLatestSummary = async () => {
  try {
    const res = await api.get("/weekly-summaries/latest");
    return res.data?.data?.summary ?? res.data?.summary ?? null;
  } catch {
    return null;
  }
};

/** Fetch the latest AI-generated insight text */
const fetchLatestInsight = async () => {
  try {
    const res = await api.get("/insights/latest");
    const raw = res.data?.data?.insight ?? res.data?.insight ?? null;
    if (!raw) return null;
    const text = raw.insight_text ?? raw.insightText ?? raw.description ?? "";
    return { id: raw.id, insight_text: String(text).trim(), created_at: raw.created_at };
  } catch {
    return null;
  }
};

/** Fetch latest batch of recommendations — no trigger call */
const fetchLatestRecommendations = async () => {
  try {
    const res = await api.get("/recommendations", { params: { limit: 10, offset: 0 } });
    const recs = res.data?.data?.recommendations ?? res.data?.recommendations ?? [];
    if (recs.length === 0) return [];
    const latestSummaryId = recs[0].summary_id;
    if (latestSummaryId) return recs.filter((r) => r.summary_id === latestSummaryId);
    const latestCreatedAt = recs[0].created_at;
    return recs.filter((r) => r.created_at === latestCreatedAt);
  } catch {
    return [];
  }
};

/** Fetch paginated predictions for chart building */
const fetchPredictions = async () => {
  try {
    const res = await api.get("/predictions", { params: { limit: 7, offset: 0 } });
    return res.data?.data?.predictions ?? [];
  } catch {
    return [];
  }
};

// ─── Component ───────────────────────────────────────────────────────────────

function InsightPage() {
  const { user } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("");
  const [insightData, setInsightData] = useState(null);         // { weeklySummary, dataCount }
  const [narrativeInsight, setNarrativeInsight] = useState(null);
  const [todayRecommendations, setTodayRecommendations] = useState([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState([]);
  const [academicConditionData, setAcademicConditionData] = useState([]);
  const [stressIntensityData, setStressIntensityData] = useState([]);
  const [currentWeekCount, setCurrentWeekCount] = useState(0);

  const fetchSummaryData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      // 🚀 All requests fire in parallel — no blocking sequential calls
      const [summary, insight, recommendations, predictions] = await Promise.all([
        fetchLatestSummary(),
        fetchLatestInsight(),
        fetchLatestRecommendations(),
        fetchPredictions(),
      ]);

      // Calculate current week prediction count (Monday - Sunday)
      const todayObj = new Date();
      const dayOfWeek = todayObj.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(todayObj);
      weekStart.setDate(todayObj.getDate() + diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekStartKey = getLocalDateKey(weekStart);
      const weekEndKey = getLocalDateKey(weekEnd);

      const currentWeekPreds = predictions.filter((p) => {
        const pDate = p.created_at || p.prediction_date;
        if (!pDate) return false;
        const pKey = getLocalDateKey(pDate);
        return pKey >= weekStartKey && pKey <= weekEndKey;
      });

      setCurrentWeekCount(currentWeekPreds.length);

      // ── Date range ────────────────────────────────────────────────────
      if (summary) {
        setDateRange(formatDateRange(summary.period_start, summary.period_end, t.DashboardDateLocale));
      }

      // ── Weekly summary stats ──────────────────────────────────────────
      // Sort predictions oldest → newest for trend calculations
      const sortedPreds = [...predictions].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      const weeklySummary = summary
        ? {
            avgStressScore: Math.round(Number(summary.avg_stress_score) || 0),
            avgSleepHours: Number(summary.avg_sleep_hours) || 0,
            avgAssignmentLoad: Number(summary.avg_assignment_load) || 0,
            avgDeadlinePressure: Number(summary.avg_deadline_pressure) || 0,
            avgPhysicalActivity: Number(summary.avg_physical_activity) || 0,
            avgStudyHours: Number(summary.avg_study_hours) || 0,
            avgSocialMediaHours: Number(summary.avg_social_media_hours) || 0,
            // Trends from prediction history
            stressTrend: getTrendPercentage(sortedPreds, (p) =>
              Number(p.stress_score) <= 1 ? Number(p.stress_score) * 100 : Number(p.stress_score)
            ),
            sleepTrend: 0,
            taskLoadTrend: 0,
            physicalActivityTrend: 0,
          }
        : null;

      // ── Chart data ────────────────────────────────────────────────────
      const chartData = sortedPreds.map((p) => {
        const rawScore = Number(p.stress_score);
        const score = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);
        const date = new Date(p.created_at || p.prediction_date);
        return {
          day: date.toLocaleDateString(t.DashboardDateLocale, { day: "numeric", month: "short" }),
          value: score,
          hasData: true,
        };
      });

      // ── Stress intensity distribution ─────────────────────────────────
      const intensityCounts = sortedPreds.reduce(
        (acc, p) => {
          const score = Number(p.stress_score) <= 1
            ? Number(p.stress_score) * 100
            : Number(p.stress_score);
          if (score >= 70) acc.high += 1;
          else if (score >= 40) acc.medium += 1;
          else acc.low += 1;
          return acc;
        },
        { high: 0, medium: 0, low: 0 }
      );
      const total = sortedPreds.length || 1;

      // ── Academic condition bar data ───────────────────────────────────
      const academicBars = weeklySummary
        ? [
            {
              label: t.InsightsStudyTimeLabel,
              value: `${weeklySummary.avgStudyHours.toFixed(1)} ${t.HourText}`,
              width: `${Math.min((weeklySummary.avgStudyHours / 8) * 100, 100)}%`,
              color: "bg-blue-300",
            },
            {
              label: t.InsightsTaskLoadLabel,
              value: `${weeklySummary.avgAssignmentLoad.toFixed(0)}%`,
              width: `${Math.min(weeklySummary.avgAssignmentLoad, 100)}%`,
              color:
                weeklySummary.avgAssignmentLoad >= 70
                  ? "bg-red-300"
                  : weeklySummary.avgAssignmentLoad >= 40
                  ? "bg-yellow-300"
                  : "bg-green-400",
            },
            {
              label: t.InsightsDeadlinePressureLabel,
              value: `${weeklySummary.avgDeadlinePressure.toFixed(0)}%`,
              width: `${Math.min(weeklySummary.avgDeadlinePressure, 100)}%`,
              color:
                weeklySummary.avgDeadlinePressure >= 70
                  ? "bg-red-300"
                  : weeklySummary.avgDeadlinePressure >= 40
                  ? "bg-yellow-300"
                  : "bg-green-400",
            },
            {
              label: t.InsightsPhysicalActivityLabel,
              value: `${weeklySummary.avgPhysicalActivity.toFixed(0)} ${t.MinuteText}`,
              width: `${Math.min((weeklySummary.avgPhysicalActivity / 60) * 100, 100)}%`,
              color:
                weeklySummary.avgPhysicalActivity >= 30
                  ? "bg-green-400"
                  : weeklySummary.avgPhysicalActivity >= 15
                  ? "bg-yellow-300"
                  : "bg-red-300",
            },
            {
              label: t.InsightsAverageSleepLabel,
              value: `${weeklySummary.avgSleepHours.toFixed(1)} ${t.HourText}`,
              width: `${Math.min((weeklySummary.avgSleepHours / 8) * 100, 100)}%`,
              color:
                weeklySummary.avgSleepHours >= 7
                  ? "bg-green-400"
                  : weeklySummary.avgSleepHours >= 5
                  ? "bg-yellow-300"
                  : "bg-red-300",
            },
          ]
        : [];

      // ── Commit state ──────────────────────────────────────────────────
      setInsightData({ weeklySummary, dataCount: sortedPreds.length });
      setNarrativeInsight(insight);
      setWeeklyActivityData(chartData);
      setStressIntensityData(
        weeklySummary
          ? [
              { name: t.HighText, value: Math.round((intensityCounts.high / total) * 100) },
              { name: t.MediumText, value: Math.round((intensityCounts.medium / total) * 100) },
              { name: t.LowText, value: Math.round((intensityCounts.low / total) * 100) },
            ]
          : []
      );
      setAcademicConditionData(academicBars);
      setTodayRecommendations(recommendations);
    } catch (err) {
      console.error("Failed to fetch summary data:", err);
      setError(err.response?.data?.message || err.message || t.InsightsFetchError);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSummaryData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSummaryData]);

  // ── Score color helpers ───────────────────────────────────────────────────
  const getScoreColor = (score, type = "stress") => {
    if (type === "stress") {
      if (score >= 70) return "text-red-400";
      if (score >= 40) return "text-orange-400";
      return "text-emerald-400";
    }
    if (type === "sleep") {
      if (score >= 7) return "text-emerald-400";
      if (score >= 5) return "text-orange-400";
      return "text-red-400";
    }
    if (type === "activity") {
      if (score >= 45) return "text-emerald-400";
      if (score >= 20) return "text-orange-400";
      return "text-red-400";
    }
    if (type === "load") {
      if (score >= 70) return "text-red-400";
      if (score >= 40) return "text-orange-400";
      return "text-emerald-400";
    }
    return "text-gray-400";
  };

  const getTrendIndicator = useCallback(
    (trendValue) => {
      if (trendValue > 0) return t.InsightsTrendUp;
      if (trendValue < 0) return t.InsightsTrendDown;
      return t.InsightsTrendStable;
    },
    [t]
  );

  // ── Metrics cards data ───────────────────────────────────────────────────
  const metricsData = useMemo(() => {
    if (!insightData || !insightData.weeklySummary) return [];
    const { weeklySummary } = insightData;
    return [
      {
        title: t.StressScoreTitle,
        value: weeklySummary.avgStressScore,
        maxScore: 100,
        color: getScoreColor(weeklySummary.avgStressScore, "stress"),
        subtitle: t.AverageText,
        trend: weeklySummary.stressTrend,
      },
      {
        title: t.LastNightSleepTitle,
        value: Number(weeklySummary.avgSleepHours.toFixed(1)),
        maxScore: 10,
        color: getScoreColor(weeklySummary.avgSleepHours, "sleep"),
        subtitle: `${weeklySummary.avgSleepHours.toFixed(1)} ${t.HourText} ${getTrendIndicator(weeklySummary.sleepTrend)}`,
        trend: weeklySummary.sleepTrend,
      },
      {
        title: t.TaskLoadTitle,
        value: Math.round(weeklySummary.avgAssignmentLoad),
        maxScore: 100,
        color: getScoreColor(weeklySummary.avgAssignmentLoad, "load"),
        subtitle: `${weeklySummary.avgAssignmentLoad.toFixed(0)}% ${getTrendIndicator(weeklySummary.taskLoadTrend)}`,
        trend: weeklySummary.taskLoadTrend,
      },
      {
        title: t.PhysicalActivityTitle,
        value: Math.round(weeklySummary.avgPhysicalActivity),
        maxScore: 60,
        color: getScoreColor(weeklySummary.avgPhysicalActivity, "activity"),
        subtitle: `${weeklySummary.avgPhysicalActivity.toFixed(0)} ${t.MinuteText} ${getTrendIndicator(weeklySummary.physicalActivityTrend)}`,
        trend: weeklySummary.physicalActivityTrend,
      },
    ];
  }, [insightData, t, getTrendIndicator]);

  // ── Loading / Error ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout title={t.InsightsPageTitle} name={user.fullname} role={user.role}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="theme-muted text-sm">{t.InsightsLoading}</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={t.InsightsPageTitle} name={user.fullname} role={user.role}>
        <div className="text-center py-10 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  const latestInsightDescription = narrativeInsight?.insight_text || "Data summary belum tersedia.";
  const narrativeSubtitle = narrativeInsight?.created_at
    ? `${t.InsightsLatestFromDatabase} – ${new Date(narrativeInsight.created_at).toLocaleDateString(
        t.DashboardDateLocale,
        { day: "numeric", month: "long", year: "numeric" }
      )}`
    : "Belum ada insight AI yang tersimpan.";

  return (
    <Layout title={t.InsightsPageTitle} name={user.fullname} role={user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="theme-subtle text-xs uppercase mb-2">{t.InsightsEyebrow}</p>
            <h1 className="theme-text text-3xl md:text-4xl font-bold">{t.InsightsHeroTitle}</h1>
          </div>
          {dateRange && (
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-300 text-sm font-semibold self-start md:self-auto">
              {dateRange}
            </div>
          )}
        </div>

        {!insightData?.weeklySummary ? (
          <div className="py-8">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="theme-text text-2xl md:text-3xl font-extrabold">
                  {t.DashboardDateLocale === "id-ID" ? "Analisis Mingguan Belum Tersedia" : "Weekly Analysis Not Available"}
                </h2>
                <p className="theme-muted text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                  {t.DashboardDateLocale === "id-ID"
                    ? "Dibutuhkan data aktivitas lengkap selama minimal 7 hari (dalam rentang Senin - Minggu) untuk dapat menghasilkan ringkasan naratif AI, visualisasi kondisi akademik, dan rekomendasi personal."
                    : "Complete activity logs for at least 7 days (within a Monday - Sunday range) are required to generate the AI weekly narrative summary, academic condition metrics, and personalized recommendations."}
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="bg-slate-500/5 border border-(--border-soft) rounded-2xl p-5 max-w-md mx-auto space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="theme-muted">
                    {t.DashboardDateLocale === "id-ID" ? "Progres Jurnal Minggu Ini" : "This Week's Journal Progress"}
                  </span>
                  <span className="text-blue-400 font-bold">
                    {currentWeekCount} / 7 {t.DashboardDateLocale === "id-ID" ? "Hari" : "Days"}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((currentWeekCount / 7) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] theme-subtle text-left italic">
                  {t.DashboardDateLocale === "id-ID" 
                    ? `* Anda perlu mengisi ${Math.max(0, 7 - currentWeekCount)} hari jurnal lagi di minggu ini untuk memperbarui Ringkasan.` 
                    : `* You need to fill ${Math.max(0, 7 - currentWeekCount)} more days of journals this week to update the Summary.`}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate("/LogActivity")}
                  className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-bold text-sm transition hover:bg-blue-600 shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  {t.DashboardDateLocale === "id-ID" ? "+ Isi Jurnal Hari Ini" : "+ Fill Today's Journal"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
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
              title={t.AINarrativeInsightTitle}
              subtitle={narrativeSubtitle}
              description={latestInsightDescription}
              isEmpty={!narrativeInsight}
              onActionClick={() => navigate("/LogActivity")}
            />

            {/* Section 3: Academic Condition Metrics */}
            <AcademicCondition items={academicConditionData} title={t.InsightsAcademicAverageTitle} />

            {/* Section 4: Weekly Analytics */}
            <div className="grid lg:grid-cols-2 gap-6">
              <WeeklyActivityChart data={weeklyActivityData} title={t.InsightsWeeklyActivityTitle} />
              <StressIntensityChart
                avgScore={insightData?.weeklySummary?.avgStressScore || 0}
                data={stressIntensityData}
                title={t.InsightsStressIntensityTitle}
              />
            </div>

            {/* Section 5: Rekomendasi */}
            <div>
              <h2 className="theme-text text-2xl font-bold mb-4">{t.PriorityTodayTitle}</h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {todayRecommendations.length > 0 ? (
                  todayRecommendations.map((task, index) => (
                    <PriorityCard
                      key={index}
                      title={task.title}
                      description={task.recommendation_text}
                      level={task.priority_level}
                      duration=""
                      stressImpact={
                        task.category
                          ? task.category.charAt(0).toUpperCase() + task.category.slice(1)
                          : ""
                      }
                    />
                  ))
                ) : (
                  <div className="col-span-full theme-card border rounded-2xl p-6 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-blue-400 animate-pulse"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h4 className="theme-text font-bold text-lg">
                        {t.DashboardDateLocale === "id-ID" ? "Belum Ada Rekomendasi" : "No Recommendations Yet"}
                      </h4>
                      <p className="theme-muted text-sm leading-relaxed">
                        {t.DashboardDateLocale === "id-ID"
                          ? "Rekomendasi personal dari AI akan muncul di sini setelah Anda mengisi jurnal harian dan sistem mendeteksi pola aktivitas Anda."
                          : "Personalized AI recommendations will appear here once you fill out your daily journal and the system analyzes your activity patterns."}
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => navigate("/LogActivity")}
                        className="px-5 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-xs transition hover:bg-blue-600 shadow-md shadow-blue-500/20 cursor-pointer"
                      >
                        {t.DashboardDateLocale === "id-ID" ? "+ Mulai Isi Jurnal" : "+ Start Journaling"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default InsightPage;
