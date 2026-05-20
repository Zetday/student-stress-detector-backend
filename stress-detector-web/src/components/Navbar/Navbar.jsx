import PropTypes from "prop-types";
import Buttons from "./Buttons";
import FotoProfile from "./FotoProfile";
import NameDisplay from "./NameDisplay";

function Navbar({ title, name, role, profilePhoto}) {
  return (
    <header
      className="
        flex h-24 w-full items-center justify-between
        border-b border-white/5
        bg-[#141414]
        px-12
        text-white
      "
    >
      <h1 className="text-2xl font-bold tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-6">
        <Buttons />

        <div className="h-12 w-px bg-white/10" />

        <div className="flex items-center gap-4">
          <NameDisplay name={name} role={role} />
          <FotoProfile src={profilePhoto} name={name} />
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  title: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
  profilePhoto: PropTypes.string,
};

export default Navbar;
