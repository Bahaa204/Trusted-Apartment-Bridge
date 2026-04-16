import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/admin", label: "Manage Employees" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="border-b border-[#d7e0ea] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink
          className="text-xl font-semibold tracking-tight text-[#10243e]"
          to="/"
        >
          <span className="text-[#bf530a]">TAB</span> Developments
        </NavLink>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#bf530a] text-white"
                    : "text-[#31527d] hover:bg-[#fff0e2] hover:text-[#bf530a]"
                }`
              }
              end={item.end}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
