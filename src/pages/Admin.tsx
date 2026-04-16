import { Link } from "react-router-dom";
import EmployeeTable from "../components/EmployeeTable";

export default function Admin() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fffdfb_0%,_#f7f8fb_55%,_#edf2f7_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-[linear-gradient(135deg,_#10243e,_#17365d_65%,_#bf530a)] px-8 py-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[#ffe0c2]">
            Admin panel
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Manage employees
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d9e4f0] sm:text-base">
            Use this workspace to add, update, and remove employees. Other
            admin tools are still available below.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Link
            className="rounded-3xl border border-[#ffd2ad] bg-[linear-gradient(180deg,_#ffffff_0%,_#fff8f2_100%)] p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#bf530a] hover:shadow-lg"
            to="/admin/projects"
          >
            <p className="text-sm text-[#5f7490]">Projects dashboard</p>
            <p className="mt-2 text-lg font-semibold text-[#10243e]">
              Open project management
            </p>
          </Link>

          <Link
            className="rounded-3xl border border-[#ffd2ad] bg-[linear-gradient(180deg,_#ffffff_0%,_#fff8f2_100%)] p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#bf530a] hover:shadow-lg"
            to="/admin/finances"
          >
            <p className="text-sm text-[#5f7490]">Finances</p>
            <p className="mt-2 text-lg font-semibold text-[#10243e]">
              Open finance management
            </p>
          </Link>
        </div>

        <EmployeeTable />
      </div>
    </div>
  );
}
