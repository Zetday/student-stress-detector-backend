import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import logo from "../../assets/img/logo.png";
import IconsSidebar from "./IconsSidebar";

// Contexts
import { useLanguage } from "../../contexts/LanguageContext";
import { useUser } from "../../contexts/UserContext";
import { logout as logoutApi } from "../../services/authService";

function Sidebar({ isOpen, setIsOpen }) {
  const { t } = useLanguage();
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch (err) {
      console.error("Logout API failed:", err);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser({ fullname: "", email: "", role: "", profileImage: null });
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40
          flex h-screen w-52 flex-col
          theme-sidebar
          px-6 py-8
          transition-transform duration-300

          ${isOpen ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0
        `}
      >
   
      <div className="mb-10 flex items-center justify-between gap-5">
        <img
          src={logo}
          alt="CekTenang"
          className="h-auto w-28 object-contain"
        />

        {/* Close Mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl  
            border theme-border-soft
            theme-card-muted
            theme-muted
            transition-all duration-200
            theme-hover
            md:hidden
          "
        >
          ✕
        </button>
      </div>

        <nav className="flex flex-1 flex-col">
          <div className="space-y-3">
            <SidebarItem
              to="/dashboard"
              icon={
                <IconsSidebar
                  paths={
                    <path
                      d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  }
                />
              }
              end
            >
              Dashboard
            </SidebarItem>

            <SidebarItem
              to="/activity-history"
              icon={
                <IconsSidebar
                  paths={
                    <>
                      <path
                        d="M4 6h8M4 10h6M4 14h5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="m14 16 2 2 4-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  }
                />
              }
            >
              {t.ActSdbr}
            </SidebarItem>

            <SidebarItem
              to="/Insight"
              icon={
                <IconsSidebar
                  paths={
                    <>
                      <path
                        d="M8 18v-1.5a4 4 0 0 1 8 0V18M7 10a5 5 0 1 1 10 0c0 2.2-1.2 3.5-2.3 4.3H9.3C8.2 13.5 7 12.2 7 10Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10 21h4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </>
                  }
                />
              }
            >
              {t.CekStresSdbr}
            </SidebarItem>

            <SidebarItem
              to="/profile"
              icon={
                <IconsSidebar
                  paths={
                    <>
                      <path
                        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </>
                  }
                />
              }
            >
              {t.ProfileSdbr}
            </SidebarItem>
          </div>

          <div className="mt-auto">
            <SidebarItem to="/LogActivity">
              <div className="bg-[#ADC7FF] text-[#002E68] text-center w-38 h-10 rounded justify-center">
                <span className="text-2xl ">+ </span> {t.StressCheck}
                </div>
            </SidebarItem>

             <button
              type="button"
              onClick={handleLogout}
              className="
                flex w-full items-center gap-2 py-3 text-sm font-medium transition-colors
                theme-muted hover:text-(--text)
              "
            >
              <span>
                <IconsSidebar
                  paths={
                    <>
                      <path
                        d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  }
                />
              </span>
              <span className="truncate text-[15px] leading-normal">
                {t.LogoutSdbr}
              </span>
            </button>
          </div>

        </nav>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
};

export default Sidebar;
