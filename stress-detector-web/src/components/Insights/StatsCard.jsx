import { TrendingUp, TrendingDown } from "lucide-react";

function StatsCard({ 
  title, 
  value, 
  maxScore = 100,
  color = "text-red-400", 
  subtitle,
  trend
}) {
  const isTrendUp = trend && trend > 0;
  
  return (
    <div className="theme-card border rounded-2xl p-5">
      <p className="theme-muted text-xs uppercase mb-3">
        {title}
      </p>

      <div className="flex items-end gap-1">
        <h2 className={`text-5xl font-bold ${color}`}>
          {value}
        </h2>

        <span className="theme-muted mb-2">
          /{maxScore}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="theme-subtle text-sm">
          {subtitle}
        </p>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isTrendUp ? "text-green-400" : "text-red-400"
          }`}>
            {isTrendUp ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
