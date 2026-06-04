import { useLanguage } from "../../contexts/LanguageContext";

function TodayDiagnose({studyTime, taskLoad, deadlinePressure, physicalActivity, sleep}) {
  const { t } = useLanguage();

  const getAcademicMetric = (type, value) => {
    switch (type) {
      case "studyTime":
        return {
          display: `${value} ${t.HourText}`,
          width: Math.min((value / 8) * 100, 100),
          color: "bg-blue-400",
        };

      case "taskLoad":
        if (value === "Low") {
          return {
            display: t.LowText,
            width: 33,
            color: "bg-green-500",
          };
        }

        if (value === "Medium") {
          return {
            display: t.MediumText,
            width: 66,
            color: "bg-yellow-500",
          };
        }

        return {
          display: t.HighText,
          width: 100,
          color: "bg-red-500",
        };

      case "deadlinePressure":
        return {
          display: `${value}%`,
          width: value,
          color:
            value < 40
              ? "bg-green-500"
              : value < 70
              ? "bg-yellow-500"
              : "bg-red-500",
        };

      case "physicalActivity":
        return {
          display: `${value} ${t.MinuteText}`,
          width: Math.min((value / 60) * 100, 100),
          color:
            value >= 30
              ? "bg-green-500"
              : value >= 15
              ? "bg-yellow-500"
              : "bg-red-500",
        };

      case "sleep":
        return {
          display: `${value} ${t.HourText}`,
          width: Math.min((value / 8) * 100, 100),
          color:
            value >= 7
              ? "bg-green-500"
              : value >= 5
              ? "bg-yellow-500"
              : "bg-red-500",
        };

      default:
        return {
          display: value,
          width: 0,
          color: "bg-zinc-500",
        };
    }
  };

    const academicData = [
    {
        type: "studyTime",
        label: t.StudyTimeTitle,
        value: studyTime,
    },
    {
        type: "taskLoad",
        label: t.TaskLoadTitle,
        value: taskLoad,
    },
    {
        type: "deadlinePressure",
        label: t.DeadlinePressureTitle,
        value: deadlinePressure,
    },
    {
        type: "physicalActivity",
        label: t.PhysicalActivityTitle,
        value: physicalActivity,
    },
    {
        type: "sleep",
        label: t.LastNightSleepTitle,
        value: sleep,
    },
    ];

  return (
    <div className="space-y-5">
      {academicData.map((item, index) => {
        const metric = getAcademicMetric(item.type, item.value);

        return (
          <div key={index}>
            <div className="flex items-center mb-2">
              <span className="theme-muted flex-1 text-sm uppercase tracking-wider">
                {item.label}
              </span>

              <span className="theme-text ml-auto text-sm font-medium">
                {metric.display}
              </span>
            </div>

            <div className="theme-card-muted w-full h-1 rounded-full overflow-hidden">
              <div
                className={`h-full ${metric.color}`}
                style={{ width: `${metric.width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TodayDiagnose;
