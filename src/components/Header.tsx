import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-orange-500">TAB</span>
          <span className="text-gray-800"> Developments</span>
        </Link>

        <nav className="flex items-center gap-8">
          {[
            { to: "/", label: "Home" },
            { to: "/projects", label: "Projects" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? "text-orange-500"
                    : "text-gray-600 hover:text-orange-500"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
