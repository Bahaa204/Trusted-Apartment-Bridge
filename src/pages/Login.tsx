import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, type SubmitEvent } from "react";
import type { Provider } from "@supabase/supabase-js";
import type { LoginMode } from "@/types/types";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function Login() {
  const {
    Session,
    Error: AuthError,
    Loading: AuthLoading,
    SignInWithPassword,
    SignInWithOAuth,
    SignUp,
    ResetPassword,
  } = useAuth();

  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [DisplayName, setDisplayName] = useState<string>("");
  const [Mode, setMode] = useState<LoginMode>("SignIn");
  const [EmailSent, setEmailSent] = useState<boolean>(false);
  const navigate = useNavigate();

  function SwitchModes(mode: LoginMode) {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setEmailSent(false);
    setMode(mode);
  }

  if (AuthLoading) {
    return <div>Checking Authentication...</div>;
  }

  // If there is already a session, redirect them to the home page.
  if (Session) {
    return <Navigate to="/" />;
  }

  async function handleOAuth(provider: Provider) {
    const ok = await SignInWithOAuth(provider);
    if (ok) navigate("/");
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (Mode === "ResetPassword") {
      setEmailSent(true);
      return await ResetPassword(Email);
    }

    if (Mode === "SignIn") {
      const ok = await SignInWithPassword(Email, Password);
      if (ok) navigate("/");
    } else {
      const ok = await SignUp(Email, Password, DisplayName);
      if (ok) navigate("/");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      {/* Header Section */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* Abstract Logo (This will Change) */}
        <svg
          className="h-10 w-10 text-indigo-500"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-black tracking-tight">
          {Mode === "ResetPassword"
            ? "Reset Your Password"
            : Mode === "SignIn"
              ? "Sign in"
              : "Sign Up"}
          {Mode !== "ResetPassword" && " to your account"}
        </h2>

        {AuthError && (
          <div
            role="alert"
            className="bg-red-700 p-5 rounded-lg text-white text-lg m-2.5"
          >
            {AuthError}
          </div>
        )}
        {EmailSent && (
          <div
            className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4"
            role="alert"
          >
            <p className="font-bold">Email Sent</p>
            <p className="text-sm">
              We've sent a password reset link to your email address.
            </p>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {Mode === "SignUp" && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-black"
                >
                  Display Name
                </label>
                <div className="mt-2">
                  <Input
                    required
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    onChange={(event) => {
                      setDisplayName(event.target.value);
                    }}
                    disabled={AuthLoading}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black"
              >
                Email address
              </label>
              <div className="mt-2">
                <Input
                  required
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="test@gmail.com"
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                  disabled={AuthLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            {Mode !== "ResetPassword" && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black"
                >
                  Password
                </label>
                <div className="mt-2">
                  <Input
                    required
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="********"
                    onChange={(event) => {
                      setPassword(event.target.value);
                    }}
                    disabled={AuthLoading}
                  />
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            {Mode !== "ResetPassword" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded cursor-pointer disabled:cursor-not-allowed"
                    disabled={AuthLoading}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-black cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Button
                    type="button"
                    variant="link"
                    className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    onClick={() => SwitchModes("ResetPassword")}
                    disabled={AuthLoading}
                  >
                    Forgot password?
                  </Button>
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6366f1] hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#1e293b] transition-colors cursor-pointer disabled:cursor-not-allowed"
                disabled={AuthLoading}
              >
                {Mode === "ResetPassword"
                  ? "Reset Password"
                  : Mode === "SignIn"
                    ? "Sign In"
                    : "Sign Up"}
              </Button>
            </div>
          </form>

          {Mode !== "ResetPassword" && (
            <div className="mt-8">
              <Separator decorative />
              <div className="mt-6 flex justify-center items-center gap-6">
                <Button
                  variant="link"
                  className="w-full inline-flex justify-center py-2 px-4 border border-slate-600 rounded-md shadow-sm bg-[#334155] text-sm font-medium text-white hover:bg-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  onClick={() => {
                    handleOAuth("google");
                  }}
                  disabled={AuthLoading}
                >
                  <GoogleIcon />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Link */}

        <p className="mt-8 text-center text-sm text-slate-400">
          {Mode === "ResetPassword"
            ? "Remembered your password?"
            : Mode === "SignIn"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
          <Button
            variant="link"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            onClick={() => {
              SwitchModes(Mode === "SignIn" ? "SignUp" : "SignIn");
            }}
            disabled={AuthLoading}
          >
            {Mode === "SignIn" ? "Sign Up" : "Sign In"}
          </Button>
        </p>
      </div>
    </div>
  );
}
