import { NavLink } from "react-router-dom";

function SidebarItem({ to, icon, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `
        flex items-center gap-4 py-3 text-sm font-medium transition-colors
        ${isActive ? "text-blue-500" : "text-zinc-500 hover:text-zinc-200"}
        `
      }
    >
      <span className="text-2xl place-items-center flex items-center justify-center">
        {icon}
      </span>
      
      <span className="truncate text-xl leading-normal">
        {children}
      </span>

    </NavLink>
  );
}

export default SidebarItem;