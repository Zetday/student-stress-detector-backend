import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

const chartData = [
  { name: "Tinggi", value: 33 },
  { name: "Sedang", value: 45 },
  { name: "Rendah", value: 22 },
];

const COLORS = [
  "#f8b4b4",
  "#c7d2fe",
  "#4ade80",
];

function StressIntensityChart({ avgScore = 74 }) {
  const { theme } = useTheme();
  void theme;

  const renderCustomLabel = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-[var(--text)]"
      style={{ fontSize: "24px", fontWeight: "bold" }}
    >
      {avgScore}
    </text>
  );

  return (
    <div className="theme-card border rounded-2xl p-6">
      <h3 className="theme-text font-semibold text-xl mb-4">
        Intensitas Stres
      </h3>

      <div className="h-[250px] flex justify-center items-center">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={65}
              outerRadius={90}
              dataKey="value"
              label={renderCustomLabel}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {chartData.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[i] }}
            />
            <span className="theme-muted text-sm">
              {item.name}
            </span>
            <span className="theme-subtle text-sm ml-auto">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StressIntensityChart;
