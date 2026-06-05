import PropTypes from "prop-types";
import Buttons from "./Buttons";
import FotoProfile from "./FotoProfile";
import NameDisplay from "./NameDisplay";
import { useUser } from "../../contexts/UserContext";
import { getApiUrl } from "../../../api.config";

function Navbar({ title, isOpen, setIsOpen}) {
  const { user } = useUser();

  const profileSrc = user.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : getApiUrl(`/uploads/images/${encodeURIComponent(user.profileImage)}`)
    : null;

  return (
    <header
      className="
        fixed
        top-0
        right-0
        left-0 md:left-52
        z-30

        flex h-15 items-center justify-between

        theme-navbar
        border-b
        backdrop-blur

        px-4 md:px-6 lg:px-12
      "
    >
    {/* LEFT */}
    <div className="flex items-center gap-4">
      
      {/* Hamburger */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl
              border theme-border-soft
              theme-card-muted
              theme-muted
              backdrop-blur-sm

              transition-all duration-200

              theme-hover

              active:scale-95

              md:hidden
            "
          >
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
          </button>
        )}


      <h1
        className="
          text-sm font-medium tracking-tight
          sm:text-xl
          lg:text-2xl
        "
      >
        {title}
      </h1>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-3 md:gap-5">
      <Buttons />

      <div className="theme-divider hidden h-12 w-px md:block" />

      <div className="flex items-center gap-3">
        <div className="sm:block">
          <NameDisplay 
            name={user.fullname || "User"}
            role={user.role || "User"}
          />
        </div>

        <FotoProfile
          src={profileSrc}
          name={user.fullname}
          
        />
      </div>
    </div>
  </header>
  );
}

Navbar.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
};

export default Navbar;
