import { useAuth } from "@/hooks/useAuth";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import Logo from "/images/NavBarLogo.png";
import type { MouseEvent } from "react";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [showLogoutNotice, setShowLogoutNotice] = useState(false);

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

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const ok = await SignOut();
    if (ok) {
      setShowLogoutNotice(true);
      setTimeout(() => setShowLogoutNotice(false), 2500);
    }
  }

  return (
    <>
      {showLogoutNotice && (
        <div className="fixed top-4 right-4 z-9999 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg">
          Logged out successfully
        </div>
      )}

      <header className="sticky top-0 z-5000 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="size-18" />
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
                    `text-[14px] font-medium transition ${
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
              className="cursor-pointer text-[14px]"
              onClick={() => navigate("/login")}
              disabled={AuthLoading}
            >
              Login
            </Button>
          ) : (
            <Button
              variant="link"
              className="cursor-pointer text-[14px]"
              onClick={handleClick}
              disabled={AuthLoading}
            >
              Logout
            </Button>
          )}
        </div>
      </header>
    </>
  );
}
