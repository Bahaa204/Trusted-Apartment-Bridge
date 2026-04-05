import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import ProjectDetails from "./pages/ProjectDetails";
import Admin from "./pages/Admin";
import ErrorPage from "./pages/ErrorPage";
import NotFound from "./pages/NotFound";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Finances from "./pages/Finances";
import ProjectsDashboard from "./pages/ProjectsDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "contact", element: <Contact /> },
      { path: "projects", element: <Projects /> },
      {
        path: "projects/:projectID",
        element: <ProjectDetails />,
      },
      { path: "login", element: <Login /> },
      { path: "admin", element: <Admin /> },
      { path: "admin/employees", element: <EmployeeDashboard /> },
      { path: "admin/finances", element: <Finances /> },
      { path: "admin/projects", element: <ProjectsDashboard /> },
      { path: "*", element: <NotFound /> },
    ],
    errorElement: <ErrorPage />,
  },
  // About page is outside MainLayout so it renders full-screen (globe)
  { path: "about", element: <About /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
