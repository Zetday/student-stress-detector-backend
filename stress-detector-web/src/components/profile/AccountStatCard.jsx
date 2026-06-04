import { TrendingUp, Zap } from "lucide-react";

function AccountStatCard({
  title,
  value,
  suffix,
  description,
  trend,
  progress,
  icon,
  showIcon = false,
}) {
  return (
    <div className="theme-card border rounded-2xl p-6 relative overflow-hidden">
      {/* Optional Icon in top-right corner */}
      {showIcon && icon && (
        <div className="absolute top-4 right-4 text-yellow-400 opacity-30">
          {icon === "lightning" ? <Zap size={32} /> : null}
        </div>
      )}

      <div className="relative z-10">
        {/* Title */}
        <p className="theme-subtle text-xs uppercase mb-4">
          {title}
        </p>

        {/* Value Section */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1">
            <h3 className="theme-text text-4xl font-bold">
              {value}
            </h3>
            {suffix && (
              <span className="theme-muted text-sm">
                {suffix}
              </span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                {trend}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-green-400">
            {description}
          </p>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mt-4">
            <div className="theme-card-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="theme-subtle text-xs mt-2">
              {progress}% progress
            </p>
          </div>
        )}

        {/* Streak Indicator */}
        {progress !== undefined && !description && (
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < 5 ? "bg-blue-400" : "theme-card-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountStatCard;
