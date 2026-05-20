import { useState } from "react";
import SidebarItem from "./SidebarItem";
import logo from "../../assets/img/logo.png";
import IconsSidebar from "./IconsSidebar";

// Contexts
import { useLanguage } from "../../contexts/LanguageContext";

function Sidebar() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-lg bg-[#0B0B0C] text-white shadow-lg md:hidden"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

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
          fixed left-0 top-0 z-40 flex min-h-screen w-[248px] flex-col
          bg-[#0B0B0C] px-9 py-10 text-white
          shadow-[18px_0_40px_rgba(0,0,0,0.35)]
          transition-transform duration-300

          ${isOpen ? "translate-x-0" : "-translate-x-full"}

          md:relative md:translate-x-0
        `}
      >
        <img
          src={logo}
          alt="CekTenang"
          className="mb-12 h-auto w-36 object-contain"
        />

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
              to="/activities"
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
              to="/prediction"
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
              to="/recommendations"
              icon={
                <IconsSidebar
                  paths={
                    <>
                      <path
                        d="M12 3v3M12 18v3M3 12h3M18 12h3M6.8 6.8l2.1 2.1M15.1 15.1l2.1 2.1M17.2 6.8l-2.1 2.1M8.9 15.1l-2.1 2.1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </>
                  }
                />
              }
            >
              {t.ReqomendationSdbr}
            </SidebarItem>

            <SidebarItem
              to="/insights"
              icon={
                <IconsSidebar
                  paths={
                    <>
                      <path
                        d="m4 16 4-4 3 3 6-7 3 3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 20h16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </>
                  }
                />
              }
            >
              Insights
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
            <SidebarItem
              to="/login"
              icon={
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
              }
            >
              {t.LogoutSdbr}
            </SidebarItem>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;