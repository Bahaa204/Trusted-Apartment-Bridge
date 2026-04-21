import Breadcrumbs from "@/components/Breadcrumbs";
import EmployeeTable from "../components/EmployeeTable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function EmployeeDashboard() {
  useDocumentTitle("Employee Dashboard");

  const { Session, GetRoleFromEmail } = useAuth();
  const navigate = useNavigate();

  if (!Session || GetRoleFromEmail(Session.user.email) !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <p className="text-lg text-[#10243e]">
          You must be logged in as an admin to access this page.
        </p>
        <Button
          variant="link"
          className="cursor-pointer text-lg"
          onClick={() => navigate("/login")}
        >
          Navigate to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6e0d8] px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs />
      <div className="mx-auto w-full">
        <div className="mb-8 rounded-[2rem] bg-[linear-gradient(135deg,#10243e,#17365d_65%,#bf530a)] px-8 py-10 text-white shadow-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#ffe0c2]">
            Admin workspace
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Manage Employees
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d9e4f0] sm:text-base">
            Add team members, keep employee records up to date, and fire
            inactive employees.
          </p>
        </div>

        <div className="grid gap-4 pb-8 md:grid-cols-3">
          <div className="rounded-3xl border border-[#ffd2ad] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f2_100%)] p-5 shadow-sm">
            <p className="text-sm text-[#5f7490]">Core actions</p>
            <p className="mt-2 text-lg font-semibold text-[#10243e]">
              Create, update, and delete employees
            </p>
          </div>
          <div className="rounded-3xl border border-[#ffd2ad] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f2_100%)] p-5 shadow-sm">
            <p className="text-sm text-[#5f7490]">Data source</p>
            <p className="mt-2 text-lg font-semibold text-[#10243e]">
              Synced with the Database
            </p>
          </div>
          <div className="rounded-3xl border border-[#ffd2ad] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f2_100%)] p-5 shadow-sm">
            <p className="text-sm text-[#5f7490]">Editing style</p>
            <p className="mt-2 text-lg font-semibold text-[#10243e]">
              Inline updates with instant refresh
            </p>
          </div>
        </div>

        <EmployeeTable />
      </div>
    </div>
  );
}
