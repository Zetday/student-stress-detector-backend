import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

const data = [
  { day: "SEN", value: 58 },
  { day: "SEL", value: 55 },
  { day: "RAB", value: 60 },
  { day: "KAM", value: 74 },
  { day: "JUM", value: 57 },
  { day: "SAB", value: 54 },
  { day: "MIN", value: 62 },
];

function WeeklyActivityChart() {
  const { theme } = useTheme();
  const rootStyle = typeof window !== "undefined"
    ? getComputedStyle(document.documentElement)
    : null;
  const themeColors = {
    textMuted: rootStyle?.getPropertyValue("--text-muted").trim() || "#71717a",
    tooltipBg: rootStyle?.getPropertyValue("--chart-tooltip-bg").trim() || "#1f2937",
    tooltipBorder: rootStyle?.getPropertyValue("--chart-tooltip-border").trim() || "#3f3f46",
  };
  void theme;

  return (
    <div className="theme-card border rounded-2xl p-6">
      <h3 className="theme-text font-semibold text-xl mb-5">
        Metrik Aktivitas Mingguan
      </h3>

      <div className="h-[250px]">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis
              dataKey="day"
              stroke={themeColors.textMuted}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke={themeColors.textMuted}
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: themeColors.tooltipBg,
                border: `1px solid ${themeColors.tooltipBorder}`,
                borderRadius: "8px",
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#c4d3ff"
              strokeWidth={3}
              dot={{ fill: "#c4d3ff", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default WeeklyActivityChart;
