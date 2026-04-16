import { useAuth } from "@/hooks/useAuth";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import type { MouseEvent } from "react";

export default function Header() {
  const navigate = useNavigate();

  const NAVLINKS = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/projects", label: "Projects" },
    { to: "/support", label: "Support" },
    { to: "/admin", label: "Admin" },
  ];

  const {
    Session,
    GetRoleFromEmail,
    SignOut,
    Loading: AuthLoading,
  } = useAuth();

  const condition =
    Session &&
    (GetRoleFromEmail(Session.user.email) === "admin" ||
      GetRoleFromEmail(Session.user.email) === "employee");

  console.log(condition, Session);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const ok = await SignOut();
    if (ok) return alert("Logged out successfully");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/images/IMG_5774.PNG" alt="Logo" className="h-12 w-auto" />
        </Link>

        <nav className="flex items-center gap-8">
          {NAVLINKS.map((link) => {
            if (link.label === "Admin" && !condition) return;

            return (
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
            );
          })}
        </nav>
        {!Session ? (
          <Button
            variant="link"
            className="cursor-pointer"
            onClick={() => navigate("/login")}
            disabled={AuthLoading}
          >
            Login
          </Button>
        ) : (
          <Button
            variant="link"
            className="cursor-pointer"
            onClick={handleClick}
            disabled={AuthLoading}
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
