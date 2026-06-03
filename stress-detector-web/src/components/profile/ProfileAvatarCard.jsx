import { Pencil, Save } from "lucide-react";

function ProfileAvatarCard({
  image = "/api/placeholder/120",
  name = "Aryanda",
  role = "Student",
  onEdit,
  onSavePhoto,
  hasNewPhoto = false,
}) {
  return (
    <div className="theme-card rounded-3xl border backdrop-blur-xl p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="theme-card-muted w-32 h-32 rounded-3xl overflow-hidden border border-blue-400/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Edit Button */}
          <button
            onClick={onEdit}
            className="
              absolute
              -bottom-2
              -right-2
              w-10
              h-10
              rounded-full
              theme-card-muted
              border
              theme-border
              theme-hover
              transition-all
              flex
              items-center
              justify-center
              shadow-lg
            "
            aria-label="Edit Photo"
          >
            <Pencil size={16} className="theme-text" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">

          <p className="uppercase tracking-[0.25em] text-[11px] text-blue-400 mb-2">
            Account Profile
          </p>

          <h1 className="theme-text text-3xl md:text-4xl font-bold">
            {name}
          </h1>

          <p className="theme-muted mt-1">
            {role}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">

            <button
              onClick={onEdit}
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                theme-card-muted
                theme-hover
                border
                theme-border
                text-sm
                font-medium
                transition-all
              "
            >
              <Pencil size={16} />
              Edit Photo
            </button>

            {hasNewPhoto && (
              <button
                onClick={onSavePhoto}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  bg-blue-500
                  hover:bg-blue-600
                  text-white
                  text-sm
                  font-medium
                  transition-all
                  shadow-lg
                  shadow-blue-500/20
                "
              >
                <Save size={16} />
                Save Photo
              </button>
            )}
          </div>

          {hasNewPhoto && (
            <p className="mt-3 text-xs text-amber-400">
              You have unsaved profile photo changes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileAvatarCard;
