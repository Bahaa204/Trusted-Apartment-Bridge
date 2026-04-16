import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardFooter,
  CardDescription,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";

import LoginForm from "@/components/Custom/LoginForm";
import { useState, type SubmitEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import StaffChatDashboard from "@/components/StaffChatDashboard";
import { Spinner } from "@/components/ui/spinner";

export default function Admin() {
  const navigate = useNavigate();

  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [FormError, setFormError] = useState<string>("");

  const { Session, Error, Loading, GetRoleFromEmail, SignUp, RestoreSession } =
    useAuth();

  function checkAccess(Session: Session) {
    const role = GetRoleFromEmail(Session.user.email);
    return role === "admin" || role === "employee";
  }

  if (Error) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Error</CardTitle>
            <CardDescription className="text-slate-600">
              We could not load the admin dashboard. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-700">{Error}</CardContent>
          <CardFooter>{new Date().toLocaleString()}</CardFooter>
        </Card>
      </main>
    );
  }

  if (Loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardContent className="flex items-center justify-center gap-3 py-8 text-center text-slate-700">
            <Spinner className="size-5 text-slate-700" />
            <span>Checking Authentication...</span>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!Session || !checkAccess(Session)) {
    alert("You must be logged in as an admin or employee to access this page.");
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const role = GetRoleFromEmail(Email);
    const prevSession = Session;

    if (role !== "admin") {
      setFormError(
        "Only emails ending with '@tab-admin.com' can be used to create admin accounts.",
      );
      return;
    }

    const ok = await SignUp(Email, Password, "", {
      role: "admin",
      bypassRoleCheck: true,
    });

    if (ok && prevSession) {
      await RestoreSession(prevSession);
      setEmail("");
      setPassword("");
      setFormError("");
      return alert(`Admin account has been created successfully!`);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-8 md:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-slate-900">
              Welcome to the Admin Page
            </CardTitle>
            <CardDescription className="text-base text-slate-600 md:text-lg">
              {`See Your options below to ${GetRoleFromEmail(Session.user.email) === "admin" ? "manage employees, finances, and" : "manage"} projects.`}
            </CardDescription>
          </CardHeader>
        </Card>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GetRoleFromEmail(Session.user.email) === "admin" && (
            <>
              <Card
                onClick={() => navigate("/admin/employees")}
                className="cursor-pointer border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-[#f3a342] hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">
                    Manage Employees
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Add, edit, and delete employee records
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <CardAction>
                    <Button
                      variant="default"
                      className="cursor-pointer bg-[#173b67] text-white hover:bg-[#24507f]"
                    >
                      Go
                    </Button>
                  </CardAction>
                </CardFooter>
              </Card>

              <Card
                onClick={() => navigate("/admin/finances")}
                className="cursor-pointer border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-[#f3a342] hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">
                    Manage Finances
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    View financial reports and analytics
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <CardAction>
                    <Button
                      variant="default"
                      className="cursor-pointer bg-[#173b67] text-white hover:bg-[#24507f]"
                    >
                      Go
                    </Button>
                  </CardAction>
                </CardFooter>
              </Card>
            </>
          )}

          <Card
            onClick={() => navigate("/admin/projects")}
            className="cursor-pointer border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-[#f3a342] hover:shadow-md"
          >
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Manage Projects
              </CardTitle>
              <CardDescription className="text-slate-600">
                Add, edit, and delete project records
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <CardAction>
                <Button
                  variant="default"
                  className="cursor-pointer bg-[#173b67] text-white hover:bg-[#24507f]"
                >
                  Go
                </Button>
              </CardAction>
            </CardFooter>
          </Card>
        </section>

        <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">
              Support Chat
            </CardTitle>
            <CardDescription className="text-slate-600">
              Interact with customers and provide support
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <StaffChatDashboard />
          </CardContent>
        </Card>

        {GetRoleFromEmail(Session.user.email) === "admin" && (
          <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Invite an Admin
              </CardTitle>
              <CardDescription className="text-slate-600">
                Use the form below to invite a new admin user. Please enter
                their email and password. The email must end with
                "@tab-admin.com" to be recognized as an admin.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <LoginForm
                emailInput={{ email: Email, setEmail: setEmail }}
                passwordInput={{
                  password: Password,
                  setPassword: setPassword,
                }}
                submitLabel="Invite Admin"
                emailDescription='The email must end with "@tab-admin.com" to be recognized as an admin.'
                passwordDescription="Password must be at least 6 characters long."
                error={FormError}
                onsubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
