import AccountStatCard from "./AccountStatCard";

function AccountStatsSection({ stats = [] }) {
  return (
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <AccountStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          suffix={stat.suffix}
          description={stat.description}
          trend={stat.trend}
          progress={stat.progress}
          icon={stat.icon}
          showIcon={stat.showIcon}
        />
      ))}
    </div>
  );
}

export default AccountStatsSection;
