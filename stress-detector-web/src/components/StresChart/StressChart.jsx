import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from "recharts";
import { useLanguage } from "../../contexts/LanguageContext";

function StressChart() {
  const { t } = useLanguage();
  const data = [
  { day: `${t.Senin}`, value: 70 },
  { day: `${t.Selasa}`, value: 1 },
  { day: `${t.Rabu}`, value: 50 },
  { day: `${t.Kamis}`, value: 70 },
  { day: `${t.Jumat}`, value: 65 },
  { day: `${t.Sabtu}`, value: 72 },
  { day: `${t.Minggu}`, value: 55 },
  ];

  const average = Math.round(
    data.reduce((sum, item) => sum + item.value, 0) / data.length
  );


  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 w-full h-full">

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
          {t.StressTrendTitle}
        </p>

        <p className="text-blue-400 font-medium">
          Average {average}
        </p>
      </div>

      <div className="h-[260px] md:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                color: "#fff",
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{
                fill: "#3b82f6",
                strokeWidth: 0,
                r: 5,
              }}
              activeDot={{
                r: 7,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StressChart;