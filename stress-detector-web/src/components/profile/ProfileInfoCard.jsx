import { Mail, User, ChevronRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

function ProfileInfoCard({ fullName, email, onUpdate}) {
  const { t } = useLanguage();
  
  return (
    <div className="theme-card rounded-3xl border backdrop-blur-xl overflow-hidden">

      {/* Header */}
      <div className="theme-border-soft p-6 border-b">

        <h3 className="theme-text text-2xl font-bold">
          {t.AccountInformationTitle}
        </h3>

        <p className="theme-muted text-sm mt-1">
          {t.AccountInformationDescription}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">

        {/* Full Name */}
        <div className="theme-card-muted group flex items-center justify-between rounded-2xl border px-5 py-4 hover:border-blue-500/20 transition-all">

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <User size={18} className="text-blue-400" />
            </div>

            <div>
              <p className="theme-subtle text-xs uppercase tracking-wider">
                {t.FullNameLabel}
              </p>

              <p className="theme-text font-medium mt-1">
                {fullName}
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="theme-card-muted group flex items-center justify-between rounded-2xl border px-5 py-4 hover:border-blue-500/20 transition-all">

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Mail size={18} className="text-green-400" />
            </div>

            <div>
              <p className="theme-subtle text-xs uppercase tracking-wider">
                {t.EmailAddressLabel}
              </p>

              <p className="theme-text font-medium mt-1">
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <button
          onClick={onUpdate}
          className="
            w-full sm:w-auto
            inline-flex items-center justify-center gap-2
            px-6 py-3
            rounded-xl
            bg-blue-500
            hover:bg-blue-600
            transition-all
            text-white
            font-medium
            shadow-lg shadow-blue-500/20
          "
        >
          {t.UpdateInformationButton}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default ProfileInfoCard;
