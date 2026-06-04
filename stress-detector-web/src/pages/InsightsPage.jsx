import { useEffect, useState, useMemo } from "react";
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

function InsightPage() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [todayRecommendations, setTodayRecommendations] = useState([]);
  const [longTermRecommendations, setLongTermRecommendations] = useState([]);
  const [stressTrendData, setStressTrendData] = useState([]);

  useEffect(() => {
    const fetchInsightsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No access token found. Please log in.");
        }

        // Fetch aggregated dashboard data
        const dashboardResponse = await api.get("/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(dashboardResponse.data.data);

        // Fetch all recommendations and filter them
        const recommendationsResponse = await api.get("/recommendations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allRecommendations = recommendationsResponse.data.data.recommendations || [];

        // Filter for today's priorities (assuming 'URGENT' or 'HIGH' priority_level)
        const todayPrios = allRecommendations.filter(rec =>
          rec.priority_level === 'URGENT' || rec.priority_level === 'HIGH'
        );
        setTodayRecommendations(todayPrios);

        // Filter for long-term suggestions (assuming 'LONG_TERM' category or similar)
        const longTermSugs = allRecommendations.filter(rec =>
          rec.category === 'Long-term' || rec.category === 'Productivity' || rec.category === 'Mental' || rec.category === 'Health'
        );
        setLongTermRecommendations(longTermSugs);

        // Fetch stress trend data for chart
        const trendResponse = await api.get("/dashboard/trend?days=7", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStressTrendData(trendResponse.data.data.trend || []);

      } catch (err) {
        console.error("Failed to fetch insights data:", err);
        setError(err.response?.data?.message || err.message || "Gagal memuat data insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsightsData();
  }, [user.fullname, t]);

  // Helper to determine color based on score/level
  const getScoreColor = (score, type = 'stress') => {
    if (type === 'stress') {
      if (score >= 70) return "text-red-400";
      if (score >= 40) return "text-orange-400";
      return "text-emerald-400";
    }
    if (type === 'sleep') {
      if (score >= 7) return "text-emerald-400"; // Good sleep
      if (score >= 5) return "text-orange-400"; // Moderate sleep
      return "text-red-400"; // Low sleep
    }
    if (type === 'activity') {
      if (score >= 45) return "text-emerald-400"; // Good activity (e.g., 45 mins)
      if (score >= 20) return "text-orange-400";
      return "text-red-400";
    }
    if (type === 'load') { // For assignment load, higher is worse
      if (score >= 70) return "text-red-400";
      if (score >= 40) return "text-orange-400";
      return "text-emerald-400";
    }
    return "text-gray-400";
  };

  // Helper to determine trend indicator
  const getTrendIndicator = (trendString) => {
    if (trendString === 'increasing') return '↑';
    if (trendString === 'decreasing') return '↓';
    return '—';
  };

  // Map dashboardData to metricsData for StatsCard
  const metricsData = useMemo(() => {
    if (!dashboardData) return [];

    const latestPrediction = dashboardData.latestPrediction;
    const latestWeeklySummary = dashboardData.latestWeeklySummary;

    return [
      {
        title: t.StressScoreTitle,
        value: latestPrediction?.stress_score || 0,
        maxScore: 100,
        color: getScoreColor(latestPrediction?.stress_score, 'stress'),
        subtitle: latestPrediction?.stress_level ? t[latestPrediction.stress_level.charAt(0).toUpperCase() + latestPrediction.stress_level.slice(1) + 'Text'] || latestPrediction.stress_level : 'N/A',
        trend: 0, // Placeholder, actual trend calculation is complex
      },
      {
        title: t.LastNightSleepTitle,
        value: latestWeeklySummary?.avg_sleep_hours || 0,
        maxScore: 10,
        color: getScoreColor(latestWeeklySummary?.avg_sleep_hours, 'sleep'),
        subtitle: `${(latestWeeklySummary?.avg_sleep_hours || 0).toFixed(1)} ${t.HourText} ${getTrendIndicator(latestWeeklySummary?.stress_trend)}`,
        trend: 0, // Placeholder
      },
      {
        title: t.TaskLoadTitle,
        value: latestWeeklySummary?.avg_assignment_load || 0,
        maxScore: 100,
        color: getScoreColor(latestWeeklySummary?.avg_assignment_load, 'load'),
        subtitle: `${(latestWeeklySummary?.avg_assignment_load || 0).toFixed(0)}% ${getTrendIndicator(latestWeeklySummary?.stress_trend)}`,
        trend: 0, // Placeholder
      },
      {
        title: t.PhysicalActivityTitle,
        value: latestWeeklySummary?.avg_physical_activity || 0,
        maxScore: 60,
        color: getScoreColor(latestWeeklySummary?.avg_physical_activity, 'activity'),
        subtitle: `${(latestWeeklySummary?.avg_physical_activity || 0).toFixed(0)} ${t.MinuteText} ${getTrendIndicator(latestWeeklySummary?.stress_trend)}`,
        trend: 0, // Placeholder
      },
    ];
  }, [dashboardData, t]);

  if (loading) {
    return (
      <Layout title="Insights" name={user.fullname} role={user.role}>
        <div className="text-center py-10 theme-muted">Memuat data insights...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Insights" name={user.fullname} role={user.role}>
        <div className="text-center py-10 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  const latestInsight = dashboardData?.latestInsight;

  return (
    <Layout title="Insights" name={user.fullname} role={user.role}>
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
        {latestInsight && (
          <AINarrativeCard
            title={t.AINarrativeInsightTitle || "AI Narrative Insight"}
            subtitle={t.AINarrativeInsightSubtitle || "Berikut insight untuk minggu ini"}
            description={latestInsight.insight_text}
          />
        )}

        {/* Section 3: Academic Condition Metrics */}
        <AcademicCondition />

        {/* Section 4: Weekly Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WeeklyActivityChart />
          <StressIntensityChart avgScore={dashboardData?.latestPrediction?.stress_score || 0} data={stressTrendData} />
        </div>

        {/* Section 5: Prioritas Hari Ini */}
        <div>
          <h2 className="theme-text text-2xl font-bold mb-4">
            {t.PriorityTodayTitle || "Prioritas Hari Ini"}
          </h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {todayRecommendations.length > 0 ? (
              todayRecommendations.map((task, index) => (
                <PriorityCard
                  key={index}
                  title={task.title}
                  description={task.recommendation_text}
                  level={task.priority_level}
                />
              ))
            ) : (
              <div className="col-span-full theme-muted">Tidak ada prioritas hari ini.</div>
            )}
          </div>
        </div>

        {/* Section 6: Long-term Suggestions */}
        <div>
          <h2 className="theme-text text-2xl font-bold mb-4 mt-8">
            {t.LongTermTitle || "Saran Jangka Panjang"}
          </h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {longTermRecommendations.length > 0 ? (
              longTermRecommendations.map((suggestion, index) => (
                <PriorityCard
                  key={index}
                  title={suggestion.title}
                  description={suggestion.recommendation_text}
                  level={suggestion.priority_level}
                />
              ))
            ) : (
              <div className="col-span-full theme-muted">Tidak ada saran jangka panjang.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default InsightPage;
