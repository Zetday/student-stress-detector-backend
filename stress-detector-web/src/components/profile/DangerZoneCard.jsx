function DangerZoneCard({ onDeactivate }) {
  return (
    <div className="bg-red-950/20 border border-red-600/30 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Danger Zone
          </h3>
          <p className="theme-muted text-sm">
            Deactivating your account will permanently delete all clinical stress
            history and data insights.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onDeactivate}
          className="px-6 py-2 border border-red-600/50 rounded-lg text-red-400 hover:bg-red-600/10 hover:border-red-600 transition-all duration-300 text-sm font-medium whitespace-nowrap"
        >
          Deactivate Account
        </button>
      </div>
    </div>
  );
}

export default DangerZoneCard;
