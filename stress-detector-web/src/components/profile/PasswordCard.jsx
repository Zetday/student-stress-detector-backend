import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordCard({ onSubmit, error, success }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        currentPassword,
        newPassword,
        confirmPassword,
      });
    }
  };

  return (
    <div className="theme-card border rounded-2xl p-6">
      <h3 className="theme-text text-xl font-semibold mb-6">
        Ubah Password
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="theme-subtle text-xs uppercase mb-2 block">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="theme-input w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => toggleVisibility("current")}
              className="theme-muted absolute right-3 top-1/2 -translate-y-1/2 hover:text-(--text) transition"
            >
              {showPasswords.current ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Grid for New Password and Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Password */}
          <div>
            <label className="theme-subtle text-xs uppercase mb-2 block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="theme-input w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("new")}
                className="theme-muted absolute right-3 top-1/2 -translate-y-1/2 hover:text-(--text) transition"
              >
                {showPasswords.new ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="theme-subtle text-xs uppercase mb-2 block">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                className="theme-input w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("confirm")}
                className="theme-muted absolute right-3 top-1/2 -translate-y-1/2 hover:text-(--text) transition"
              >
                {showPasswords.confirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            className="theme-card-muted px-8 py-2 border rounded-lg transition-all duration-300 text-sm font-medium theme-hover"
          >
            Reset Password
          </button>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-500">{success}</p>
          )}
        </div>
      </form>
    </div>
  );
}

export default PasswordCard;
