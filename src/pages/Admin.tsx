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
    return <div>{Error}</div>;
  }

  if (Loading) {
    return <div>Checking Authentication...</div>;
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
    <>
      <Card className="flex flex-col gap-5 justify-center min-h-screen rounded-none!">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to the Admin Page</CardTitle>
          <CardDescription className="text-xl">
            {`See Your options below to ${GetRoleFromEmail(Session.user.email) === "admin" ? "manage employees, finances, and" : "manage"} projects.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {GetRoleFromEmail(Session.user.email) === "admin" && (
            <>
              <Card
                onClick={() => navigate("/admin/employees")}
                className="cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-xl">Manage Employees</CardTitle>
                  <CardDescription>
                    Add, edit, and delete employee records
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <CardAction>
                    <Button variant="link" className="cursor-pointer text-lg">
                      Go
                    </Button>
                  </CardAction>
                </CardFooter>
              </Card>
              <Card
                onClick={() => navigate("/admin/finances")}
                className="cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-xl">Manage Finances</CardTitle>
                  <CardDescription>
                    View financial reports and analytics
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <CardAction>
                    <Button variant="link" className="cursor-pointer text-lg">
                      Go
                    </Button>
                  </CardAction>
                </CardFooter>
              </Card>
            </>
          )}

          <Card
            onClick={() => navigate("/admin/projects")}
            className="cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-xl">Manage Projects</CardTitle>
              <CardDescription>
                Add, edit, and delete project records
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <CardAction>
                <Button variant="link" className="cursor-pointer text-lg">
                  Go
                </Button>
              </CardAction>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Support Chat</CardTitle>
              <CardDescription>
                Interact with customers and provide support
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <StaffChatDashboard />
            </CardContent>
          </Card>

          {GetRoleFromEmail(Session.user.email) === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Invite an Admin</CardTitle>
                <CardDescription>
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
                  emailDescription='The email must end with "@tab-admin.com" to be recognized as an admin.'
                  passwordDescription="Password must be at least 6 characters long."
                  error={FormError}
                  onsubmit={handleSubmit}
                />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </>
  );
}
