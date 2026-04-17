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
import { useNavigate } from "react-router-dom";

import { useState, type SubmitEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import StaffChatDashboard from "@/components/StaffChatDashboard";
import { Spinner } from "@/components/ui/spinner";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Field, Input } from "@headlessui/react";

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
      <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0f2f4f]">Error</CardTitle>
            <CardDescription className="text-[#24507f]">
              We could not load the admin dashboard. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-[#173b67]">{Error}</CardContent>
          <CardFooter>{new Date().toLocaleString()}</CardFooter>
        </Card>
      </main>
    );
  }

  if (Loading) {
    return (
      <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardContent className="flex items-center justify-center gap-3 py-8 text-center text-[#173b67]">
            <Spinner className="size-5 text-[#173b67]" />
            <span>Checking Authentication...</span>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!Session || !checkAccess(Session)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <p className="text-lg text-[#10243e]">
          You must be logged in as an admin or an employee to access this page.
        </p>
        <Button variant="link" className="cursor-pointer text-lg" onClick={() => navigate("/login")}>
          Navigate to Login
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const role = GetRoleFromEmail(Email);
    const prevSession = Session;

    if (role !== "admin") {
      setFormError(
        "Only emails ending with '@tab-admin.com' can be used to invite admins.",
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
      return alert("Admin has been invited successfully.");
    }
  }

  return (
    <main className="min-h-screen bg-[#e6e0d8] px-4 py-6 md:px-8 md:py-10">
      <Breadcrumbs />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#0f2f4f]">
              Welcome to the Admin Page
            </CardTitle>
            <CardDescription className="text-base text-[#24507f] md:text-lg">
              {`See Your options below to ${GetRoleFromEmail(Session.user.email) === "admin" ? "manage employees, finances, and" : "manage"} projects.`}
            </CardDescription>
          </CardHeader>
        </Card>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GetRoleFromEmail(Session.user.email) === "admin" && (
            <>
              <Card
                onClick={() => navigate("/admin/employees")}
                className="cursor-pointer border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-sm transition hover:border-[#f3a342] hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-[#0f2f4f]">
                    Manage Employees
                  </CardTitle>
                  <CardDescription className="text-[#24507f]">
                    Add, edit, and delete employee records
                  </CardDescription>
                </CardHeader>
                <CardFooter className="bg-transparent">
                  <CardAction>
                    <Button
                      variant="default"
                      className="cursor-pointer bg-[#0f2f4f] text-white hover:bg-[#173b67]"
                    >
                      Go
                    </Button>
                  </CardAction>
                </CardFooter>
              </Card>

              <Card
                onClick={() => navigate("/admin/finances")}
                className="cursor-pointer border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-sm transition hover:border-[#f3a342] hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-[#0f2f4f]">
                    Manage Finances
                  </CardTitle>
                  <CardDescription className="text-[#24507f]">
                    View financial reports and analytics
                  </CardDescription>
                </CardHeader>
                <CardFooter className="bg-transparent">
                  <CardAction>
                    <Button
                      variant="default"
                      className="cursor-pointer bg-[#0f2f4f] text-white hover:bg-[#173b67]"
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
            className="cursor-pointer border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-sm transition hover:border-[#f3a342] hover:shadow-md"
          >
            <CardHeader>
              <CardTitle className="text-xl text-[#0f2f4f]">
                Manage Projects
              </CardTitle>
              <CardDescription className="text-[#24507f]">
                Add, edit, and delete project records
              </CardDescription>
            </CardHeader>
            <CardFooter className="bg-transparent">
              <CardAction>
                <Button
                  variant="default"
                  className="cursor-pointer bg-[#0f2f4f] text-white hover:bg-[#173b67]"
                >
                  Go
                </Button>
              </CardAction>
            </CardFooter>
          </Card>
        </section>

        <Card className="border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-[#0f2f4f]">
              Support Chat
            </CardTitle>
            <CardDescription className="text-[#24507f]">
              Interact with customers and provide support
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <StaffChatDashboard />
          </CardContent>
        </Card>

        {GetRoleFromEmail(Session.user.email) === "admin" && (
          <Card className="border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-[#0f2f4f]">
                Invite an Admin
              </CardTitle>
              <CardDescription className="text-[#24507f]">
                Use the form below to invite a new admin user. Please enter
                their email and password. The email must end with
                "@tab-admin.com" to be recognized as an admin.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldSet className="rounded-xl border border-[#d2c5b7] bg-[#fff9f2] p-4 md:p-5">
                  {FormError && (
                    <FieldError className="rounded-md border border-[#f3a342] bg-[#fff4e5] px-3 py-2 text-[#8a3f00]">
                      {FormError}
                    </FieldError>
                  )}
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email" className="text-[#0f2f4f]">
                        Email
                      </FieldLabel>
                      <Input
                        value={Email}
                        onChange={(event) => setEmail(event.target.value)}
                        id="email"
                        autoComplete="email"
                        type="email"
                        placeholder="omar@tab-admin.com"
                        className="border-[#c8b9a7] bg-transparent text-[#0f2f4f] placeholder:text-[#6b7f95] w-full text-[15px] p-3 rounded-lg"
                        required
                      />
                      <FieldDescription className="text-[#24507f]">
                        The email must end with "@tab-admin.com" to be
                        recognized as an admin.
                      </FieldDescription>
                    </Field>
                    <FieldSeparator className="text-[#d2c5b7]" />
                    <Field>
                      <FieldLabel htmlFor="password" className="text-[#0f2f4f]">
                        Password
                      </FieldLabel>
                      <Input
                        value={Password}
                        onChange={(event) => setPassword(event.target.value)}
                        id="password"
                        autoComplete="current-password"
                        type="password"
                        placeholder="******"
                        className="border-[#c8b9a7] bg-transparent text-[#0f2f4f] placeholder:text-[#6b7f95] w-full text-[15px] p-3 rounded-lg"
                        required
                      />
                      <FieldDescription className="text-[#24507f]">
                        Password must be at least 6 characters long.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <Button
                        type="submit"
                        className="cursor-pointer bg-[#0f2f4f] text-white hover:bg-[#173b67]"
                      >
                        Invite Admin
                      </Button>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </form>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
