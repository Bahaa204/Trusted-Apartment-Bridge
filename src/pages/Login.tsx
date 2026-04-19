import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, type ReactNode, type SubmitEvent } from "react";
import type { Provider } from "@supabase/supabase-js";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { Button } from "@/components/ui/button";
import Logo from "/images/Logo.png";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import { LoginForm } from "@/components/Login page Components/LoginForm";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { SignUpForm } from "@/components/Login page Components/SignUpForm";
import ResetPasswordForm from "@/components/Login page Components/ResetPasswordForm";
import type { LoginFormData } from "@/types/form";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import FacebookIcon from "@/components/icons/FacebookIcon";

export default function Login() {
  const {
    Session,
    Error: AuthError,
    Loading: AuthLoading,
    SignInWithOAuth,
    SignInWithPassword,
    ResetPassword,
    SignUp,
  } = useAuth();

  const LoginFormData: LoginFormData = {
    email: "",
    password: "",
    display_name: "",
    email_sent: false,
  };

  const [FormData, setFormData] = useState<LoginFormData>(LoginFormData);
  const navigate = useNavigate();

  const { CurrentStepIndex, goTo, step } = useMultistepForm([
    <LoginForm
      {...FormData}
      loading={AuthLoading}
      UpdateFields={UpdateFields}
    />,
    <SignUpForm
      {...FormData}
      loading={AuthLoading}
      UpdateFields={UpdateFields}
    />,
    <ResetPasswordForm
      {...FormData}
      loading={AuthLoading}
      UpdateFields={UpdateFields}
    />,
  ]);

  const title =
    CurrentStepIndex == 0
      ? "Login"
      : CurrentStepIndex == 1
        ? "Sign Up"
        : "Forgot Password";

  useDocumentTitle(title);

  function UpdateFields(fields: Partial<LoginFormData>) {
    setFormData((prev) => {
      return { ...prev, ...fields };
    });
  }

  if (AuthError) {
    return (
      <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
        <Card className=" p-0! mx-auto max-w-3xl border border-slate-200 bg-white/90 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur">
          <CardHeader className="p-5 border-b border-slate-200 bg-slate-950 text-white">
            <CardTitle className="text-2xl text-white">Error</CardTitle>
            <CardDescription className="text-slate-300">
              There has been an error while checking authentication. Please try
              again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="border-b border-slate-200 bg-orange-50/70 text-slate-700">
            {AuthError}
          </CardContent>
          <CardFooter className="bg-white/80 text-sm text-slate-600">
            {new Date().toLocaleString()}
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (AuthLoading) {
    return (
      <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-slate-200 bg-white/90 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur">
          <CardContent className="flex items-center justify-center gap-3 py-8 text-center text-slate-700">
            <Spinner className="size-5 text-slate-950" />
            <span>Checking Authentication...</span>
          </CardContent>
        </Card>
      </main>
    );
  }

  // If there is already a session, redirect them to the home page.
  if (Session) {
    return <Navigate to={"/"} />;
  }

  async function handleOAuth(provider: Provider) {
    const ok = await SignInWithOAuth(provider);
    if (ok) navigate(-1);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    switch (CurrentStepIndex) {
      case 0: {
        // Handle login form submission

        const ok = await SignInWithPassword(FormData.email, FormData.password);

        if (ok) return navigate(-1);

        break;
      }
      case 1: {
        // Handle sign-up form submission

        const ok = await SignUp(
          FormData.email,
          FormData.password,
          FormData.display_name,
        );

        if (ok) return navigate(-1);

        break;
      }
      case 2: {
        // Handle reset password form submission

        const ok = await ResetPassword(FormData.email);

        if (ok) {
          UpdateFields({ email_sent: true });
        }

        break;
      }
      default:
        break;
    }
  }

  const providers: { provider: Provider; icon: ReactNode }[] = [
    {
      provider: "google",
      icon: <GoogleIcon />,
    },
    {
      provider: "facebook",
      icon: <FacebookIcon />,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e6e0d8] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.15),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.36),rgba(255,255,255,0.12))]" />
      <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-slate-950/10 blur-3xl" />
      <div className="absolute -bottom-12 -right-16 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 md:px-8">
        <Card className="w-full max-w-4xl overflow-hidden border border-white/60 bg-white/85 text-slate-900 shadow-[0_30px_100px_rgba(15,23,42,0.2)] backdrop-blur p-0!">
          <CardHeader className="rounded-none! gap-6 border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white md:px-10">
            <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
              <div className="flex size-28 items-center justify-center rounded-full border border-orange-300/40 bg-white shadow-inner shadow-black/20">
                <img
                  src={Logo}
                  alt="TAB Logo"
                  className="size-20 object-contain"
                />
              </div>

              <div className="space-y-3">
                <span className="inline-flex rounded-full border border-orange-300/40 bg-orange-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-100">
                  TAB portal
                </span>
                <CardTitle className="text-3xl font-bold tracking-tight md:text-4xl">
                  {CurrentStepIndex === 0
                    ? "Log in to your account"
                    : CurrentStepIndex === 1
                      ? "Create a new account"
                      : "Reset your password"}
                </CardTitle>
                <CardDescription className="max-w-xl text-sm text-slate-300 md:text-base">
                  {CurrentStepIndex === 0
                    ? "Welcome back! Please enter your details to access your account."
                    : CurrentStepIndex === 1
                      ? "Sign up for a new account"
                      : "Reset your password"}
                </CardDescription>
              </div>
            </div>

            {AuthError && (
              <FieldError className="rounded-xl border border-orange-200 bg-orange-50/90 px-4 py-3 text-slate-900">
                {AuthError}
              </FieldError>
            )}
          </CardHeader>

          <CardContent className="flex flex-col justify-center p-5">
            <div className="space-y-5">
              <FieldSet className="gap-5">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col justify-center items-center gap-5"
                >
                  {step}
                </form>

                <FieldSeparator className="my-1 **:data-[slot=separator]:bg-linear-to-r **:data-[slot=separator]:from-transparent **:data-[slot=separator]:via-orange-300 **:data-[slot=separator]:to-transparent" />

                {CurrentStepIndex !== 2 && (
                  <FieldGroup className="flex-row">
                    {providers.map((provider) => (
                      <Field>
                        <Button
                          type="button"
                          variant="link"
                          className="cursor-pointer w-full justify-center gap-3 rounded-xl border border-orange-300 bg-slate-950 text-white shadow-lg shadow-slate-950/15 transition-colors hover:bg-slate-800 p-5 text-lg"
                          onClick={() => {
                            handleOAuth(provider.provider);
                          }}
                          disabled={AuthLoading}
                        >
                          {provider.icon}
                        </Button>
                      </Field>
                    ))}
                  </FieldGroup>
                )}

                <FieldGroup className="flex flex-row flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-[#f7f3ec] p-4 whitespace-nowrap">
                  {CurrentStepIndex === 0 && (
                    <>
                      <p className="text-sm text-slate-700">Not a member?</p>
                      <Button
                        type="button"
                        variant="link"
                        className=" cursor-pointer h-auto p-0 text-slate-950 underline-offset-4 hover:text-orange-700 hover:underline"
                        onClick={() => {
                          goTo(1);
                        }}
                        disabled={AuthLoading}
                      >
                        Sign up
                      </Button>
                    </>
                  )}
                  {CurrentStepIndex === 1 && (
                    <>
                      <p className="text-sm text-slate-700">
                        Already have an account?
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        className="cursor-pointer h-auto p-0 text-slate-950 underline-offset-4 hover:text-orange-700 hover:underline"
                        onClick={() => {
                          goTo(0);
                        }}
                        disabled={AuthLoading}
                      >
                        Log in
                      </Button>
                    </>
                  )}
                  {CurrentStepIndex === 2 && (
                    <>
                      <p className="text-sm text-slate-700">
                        Remembered your password?
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        className="cursor-pointer h-auto p-0 text-slate-950 underline-offset-4 hover:text-orange-700 hover:underline"
                        onClick={() => {
                          goTo(0);
                        }}
                        disabled={AuthLoading}
                      >
                        Log in
                      </Button>
                    </>
                  )}
                  {CurrentStepIndex !== 2 && (
                    <>
                      <p className="text-sm text-slate-700">
                        Forgot your password?
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        className="cursor-pointer h-auto p-0 text-orange-700 underline-offset-4 hover:text-orange-800 hover:underline"
                        onClick={() => {
                          goTo(2);
                        }}
                        disabled={AuthLoading}
                      >
                        Reset password
                      </Button>
                    </>
                  )}
                </FieldGroup>
              </FieldSet>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
