import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
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
