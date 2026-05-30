import PropTypes from "prop-types";
import { useLanguage } from "../../contexts/LanguageContext";

function Datas({ title, value, unit, text, metric }) {
    const { t } = useLanguage();

    const getStatus = (score) => {
      switch (metric) {
        case "Mood":
          if (score <= 25) {
            return {
              label: t.PositiveText,
              color: "text-green-500",
              bgcolor: "bg-green-500",
            };
          }

          if (score <= 65) {
            return {
              label: t.MediumText,
              color: "text-yellow-500",
              bgcolor: "bg-yellow-500",
            };
          }

          return {
            label: t.HighText,
            color: "text-red-500",
            bgcolor: "bg-red-500",
          };

        case "Fatigue":
          if (score < 40) {
            return {
              label: t.PositiveText,
              color: "text-green-500, ",
              bgcolor: "bg-green-500",
            };
          }

          if (score < 70) {
            return {
              label: t.MediumText,
              color: "text-yellow-500",
              bgcolor: "bg-yellow-500",
            };
          }

          return {
            label: t.HighText,
            color: "text-red-500",
            bgcolor: "bg-red-500",
          };

        case "SocialMedia":
          if (score < 2) {
            return {
              label: t.HourText,
              color: "text-green-500",
              bgcolor: "bg-green-500",
            };
          }

          if (score < 4) {
            return {
              label: t.HourText,
              color: "text-yellow-500",
              bgcolor: "bg-yellow-500",
            };
          }

          return {
            label: t.HourText,
            color: "text-red-500",
            bgcolor: "bg-red-500",
          };

        case "Stress":
          if (score < 40) {
            return {
              label: t.LowText,
              color: "text-green-500",
              bgcolor: "bg-green-500",
            };
          }

          if (score < 65) {
            return {
              label: t.MediumText,
              color: "text-yellow-500",
              bgcolor: "bg-yellow-500",
            };
          }

          return {
            label: t.HighText,
            color: "text-red-500",
            bgcolor: "bg-red-500",
          };

        default:
          return {
            label: "-",
            color: "text-gray-500",
            bgcolor: "bg-gray-500",
          };
      }
    };

    const stress = getStatus(Number(value));

  return (
    <div
      className="
        bg-zinc-800 rounded-2xl p-5
        flex flex-col gap-3
        min-h-(150px)
      "
    >
      <span className="text-zinc-400 text-xs md:text-sm uppercase tracking-wide">
        {title}
      </span>

      <div className="flex items-end gap-2">
        <span className={`text-3xl md:text-5xl font-bold ${stress.color}`}>
          {value}
        </span>

        <span className={`text-sm md:text-base mb-1 ${stress.color}`}>
          {stress.label}
        </span>
      </div>

      <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden mt-auto">
        <div
          className={`h-full ${stress.bgcolor}`}
          style={{
            width:
              metric === "SocialMedia"
                ? `${(value / 24) * 100}%`
                : `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

Datas.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  metric: PropTypes.string.isRequired,
};

export default Datas;