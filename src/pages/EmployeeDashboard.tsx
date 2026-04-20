import Breadcrumbs from "@/components/Breadcrumbs";
import EmployeeTable from "../components/EmployeeTable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Action } from "@/types/employee";

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

  const actions: Action[] = [
    {
      title: "Core Actions",
      description: "Create, update, and delete employees",
    },
    {
      title: "Data Source",
      description: "Synced with Supabase employees table",
    },
    {
      title: "Editing Style",
      description: "Realtime updates and edits",
    },
  ];

  return (
    <main className="bg-[#e6e0d8] px-4 py-6 md:px-8 md:py-10">
      <Breadcrumbs />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl text-[#0f2f4f] text-center">
              Manage Employees
            </CardTitle>
            <CardDescription className="text-[#24507f] text-center text-lg">
              Add team members, keep employee records up to date, and fire
              inactive employees
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 pb-8 md:grid-cols-3">
              {actions.map((action) => (
                <Card className="rounded-3xl border border-[#ffd2ad] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f2_100%)] p-5 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#5f7490]">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm font-semibold text-[#10243e]">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <EmployeeTable />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
