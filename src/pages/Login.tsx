import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, type SubmitEvent } from "react";
import type { Provider } from "@supabase/supabase-js";

export default function Login() {
  const {
    Session,
    Error: AuthError,
    Loading: AuthLoading,
    SignInWithPassword,
    SignInWithOAuth,
    SignUp,
  } = useAuth();

  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [Mode, setMode] = useState<"SignIn" | "SignUp">("SignIn");
  const navigate = useNavigate();

  if (AuthLoading) {
    return <div>{AuthLoading}</div>;
  }

  // If there is already a session, redirect them to the home page.
  if (Session) {
    return <Navigate to="/" />;
  }

  async function handleOAuth(provider: Provider) {
    const ok = await SignInWithOAuth(provider);
    if (ok) navigate("/");
  }

  async function handleForgot() {
    alert("Not Implemented Yet");
    return;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (Mode == "SignIn") {
      const ok = await SignInWithPassword(Email, Password);
      if (ok) navigate("/");
    } else {
      const ok = await SignUp(Email, Password);
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
          {Mode === "SignIn" ? "Sign in" : "Sign Up"} to your account
        </h2>

        {AuthError && <div>{AuthError}</div>}
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  required
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="test@gmail.com"
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm text-black placeholder-slate-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors disabled:cursor-not-allowed"
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                  disabled={AuthLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  required
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="********"
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm text-black placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors disabled:cursor-not-allowed"
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  disabled={AuthLoading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
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
                <button
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  onClick={handleForgot}
                  disabled={AuthLoading}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6366f1] hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#1e293b] transition-colors cursor-pointer disabled:cursor-not-allowed"
                disabled={AuthLoading}
              >
                {Mode === "SignIn" ? "Sign in" : "Sign Up"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1e293b] text-white font-medium rounded">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  className="w-full inline-flex justify-center py-2 px-4 border border-slate-600 rounded-md shadow-sm bg-[#334155] text-sm font-medium text-white hover:bg-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  onClick={() => {
                    handleOAuth("google");
                  }}
                  disabled={AuthLoading}
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
              </div>

              <div>
                <button
                  className="w-full inline-flex justify-center py-2 px-4 border border-slate-600 rounded-md shadow-sm bg-[#334155] text-sm font-medium text-white hover:bg-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  onClick={() => {
                    handleOAuth("github");
                  }}
                  disabled={AuthLoading}
                >
                  <span className="sr-only">Sign in with GitHub</span>
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2">GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Not a member?{" "}
          <button
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            onClick={() => {
              setMode(Mode === "SignIn" ? "SignUp" : "SignIn");
            }}
            disabled={AuthLoading}
          >
            {Mode === "SignIn" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
