import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type PasswordInput = {
  password: string;
  confirm_password: string;
};

export default function ResetPassword() {
  const InitialValue: PasswordInput = { password: "", confirm_password: "" };

  const [FormInput, setFormInput] = useState<PasswordInput>(InitialValue);
  const [ClientError, setClientError] = useState<string>("");

  const { UpdatePassword, Error: AuthError, Loading: AuthLoading } = useAuth();

  const navigate = useNavigate();

  function updateFields(fields: Partial<PasswordInput>) {
    setFormInput((prev) => ({ ...prev, ...fields }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError("");

    if (FormInput.password !== FormInput.confirm_password) {
      setClientError("Confirm password does not match new password.");
      return;
    }

    const ok = await UpdatePassword(FormInput.password);

    if (ok) {
      navigate("/");
      return;
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e6e0d8] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.15),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.36),rgba(255,255,255,0.12))]" />
      <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-slate-950/10 blur-3xl" />
      <div className="absolute -bottom-12 -right-16 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 md:px-8">
        <Card className="w-full max-w-lg overflow-hidden border border-white/60 bg-white/90 text-slate-900 shadow-[0_30px_100px_rgba(15,23,42,0.2)] backdrop-blur p-0!">
          <CardHeader className="rounded-none! gap-3 border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white md:px-8">
            <FieldLegend className="inline-flex w-fit rounded-full border border-orange-300/40 bg-orange-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-100">
              Security
            </FieldLegend>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Change password
            </CardTitle>
            <CardDescription className="text-sm text-slate-300 md:text-base">
              Enter a new password for your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <FieldSet className="gap-5">
                <FieldGroup className="gap-4">
                  <Field className="gap-2">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-900"
                    >
                      New Password
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={FormInput.password}
                      onChange={(event) =>
                        updateFields({ password: event.target.value })
                      }
                      disabled={AuthLoading}
                      className="h-11 rounded-xl border-slate-300 bg-white/95 px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-950 focus-visible:ring-slate-950/20"
                    />
                    <FieldDescription className="text-slate-600">
                      Use at least 8 characters for a stronger password.
                    </FieldDescription>
                  </Field>

                  <Field className="gap-2">
                    <FieldLabel
                      htmlFor="confirm-password"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={FormInput.confirm_password}
                      onChange={(event) =>
                        updateFields({ confirm_password: event.target.value })
                      }
                      disabled={AuthLoading}
                      className="h-11 rounded-xl border-slate-300 bg-white/95 px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-950 focus-visible:ring-slate-950/20"
                    />
                  </Field>
                </FieldGroup>

                {ClientError && (
                  <FieldError className="rounded-xl border border-orange-200 bg-orange-50/90 px-4 py-3 text-slate-900">
                    {ClientError}
                  </FieldError>
                )}

                {AuthError && (
                  <FieldError className="rounded-xl border border-orange-200 bg-orange-50/90 px-4 py-3 text-slate-900">
                    {AuthError}
                  </FieldError>
                )}

                <FieldGroup>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={AuthLoading}
                    className="w-full justify-center gap-2 rounded-xl border border-orange-300 bg-slate-950 px-4 py-3 text-white shadow-lg shadow-slate-950/15 transition-colors hover:bg-slate-800"
                  >
                    {AuthLoading && <Spinner className="size-4 text-white" />}
                    <span>
                      {AuthLoading ? "Updating password..." : "Reset password"}
                    </span>
                  </Button>
                </FieldGroup>
              </FieldSet>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
