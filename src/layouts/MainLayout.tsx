import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#e6e0d8]!">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
