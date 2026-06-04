import Layout from "../../layouts/Layout";
import ActivityAnalysisPanel from "../components/ActivityInput/ActivityAnalysisPanel";
import ActivityFormPanel from "../components/ActivityInput/ActivityFormPanel";
import useActivityForm from "../components/ActivityInput/useActivityForm";
import { useLanguage } from "../contexts/LanguageContext";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

function formatJournalDate(dateValue, locale) {
  if (!dateValue) {
    return "";
  }
  return new Date(dateValue).toLocaleDateString(locale || "id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function LogActivitiesPage() {
  const { t } = useLanguage();
  const { user } = useUser();
  const { id } = useParams();
  const activityId = id || null;
  const { error, form, handleChange, handleSubmit, handleSaveDraft, handleCloseAnalysis, isSubmitting, message, showAnalysis } = useActivityForm(t, null, activityId);
  const journalDate = formatJournalDate(form.activityDate, t.DashboardDateLocale);

  return (
    <Layout title="Catat Data Aktivitas" name={user.fullname} role={user.role}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <section className="theme-card rounded-2xl p-5 md:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
            <div>
              <h1 className="theme-text text-3xl font-extrabold md:text-4xl">
                {t.ActivityPageTitle}
              </h1>
              <p className="theme-muted mt-3 text-sm leading-relaxed md:text-base">
                {t.ActivityPageDescription}
              </p>
            </div>
          </div>
        </section>

      <div className="theme-card rounded-2xl border p-6">
        <div className="flex items-start gap-4">
          
          {/* Icon */}
          <div className="theme-card-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="theme-muted h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10m-13 9h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v11a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="min-w-0">
            <h3 className="theme-text text-xl font-semibold">
              {t.ActivityJournalHeader}
              <span className="ml-2 text-blue-300">
                {journalDate}
              </span>
            </h3>

            <p className="theme-muted mt-1 text-sm">
              {t.ActivityJournalDescription}
            </p>
          </div>
        </div>
      </div>

        <form
          onSubmit={handleSubmit}
          className="gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)]"
        >
          <ActivityFormPanel
            error={error}
            form={form}
            isSubmitting={isSubmitting}
            message={message}
            onChange={handleChange}
            onSaveDraft={handleSaveDraft}
            t={t}
          />
        </form>

        <ActivityAnalysisPanel
          form={form}
          t={t}
          visible={showAnalysis}
          onClose={handleCloseAnalysis}
        />
      </div>
    </Layout>
  );
}

export default LogActivitiesPage;