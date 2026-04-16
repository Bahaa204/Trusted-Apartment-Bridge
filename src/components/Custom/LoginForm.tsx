import {
  Field,
  FieldLegend,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSeparator,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { HTMLAttributes, SubmitEvent } from "react";
import type { UpdaterFunction } from "@/types/types";

type LoginFormProps = HTMLAttributes<HTMLFormElement> & {
  legend?: string;
  submitLabel?: string;
  emailInput: { email: string; setEmail: UpdaterFunction<string> };
  passwordInput: { password: string; setPassword: UpdaterFunction<string> };
  emailDescription: string;
  passwordDescription: string;
  error?: string;
  onsubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

export default function LoginForm({
  legend,
  submitLabel = "Login",
  emailDescription,
  passwordDescription,
  error,
  emailInput,
  passwordInput,
  onsubmit,
  ...props
}: LoginFormProps) {
  return (
    <form onSubmit={onsubmit} {...props}>
      <FieldSet className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
        {legend && (
          <FieldLegend className="text-slate-900">{legend}</FieldLegend>
        )}
        {error && (
          <FieldError className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
            {error}
          </FieldError>
        )}
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email" className="text-slate-800">
              Email
            </FieldLabel>
            <Input
              value={emailInput.email}
              onChange={(event) => emailInput.setEmail(event.target.value)}
              id="email"
              autoComplete="email"
              type="email"
              placeholder="omar@tab-admin.com"
              className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              required
            />
            <FieldDescription className="text-slate-600">
              {emailDescription}
            </FieldDescription>
          </Field>
          <FieldSeparator className="text-slate-300" />
          <Field>
            <FieldLabel htmlFor="password" className="text-slate-800">
              Password
            </FieldLabel>
            <Input
              value={passwordInput.password}
              onChange={(event) =>
                passwordInput.setPassword(event.target.value)
              }
              id="password"
              autoComplete="current-password"
              type="password"
              placeholder="******"
              className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              required
            />
            <FieldDescription className="text-slate-600">
              {passwordDescription}
            </FieldDescription>
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <Button
              type="submit"
              className="cursor-pointer bg-[#173b67] text-white hover:bg-[#24507f]"
            >
              {submitLabel}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
