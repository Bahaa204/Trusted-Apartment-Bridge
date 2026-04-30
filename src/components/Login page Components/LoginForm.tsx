import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import PasswordInput from "../PasswordInput";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginFormProps = LoginFormData & {
  loading: boolean;
  UpdateFields: (fields: Partial<LoginFormData>) => void;
};

export function LoginForm({
  email,
  password,
  loading,
  UpdateFields,
}: LoginFormProps) {
  return (
    <FieldSet className="w-full max-w-md gap-5">
      <FieldGroup className="gap-4">
        <Field className="gap-2">
          <FieldLabel
            htmlFor="email"
            className="text-sm font-semibold text-slate-900"
          >
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="test@test.com"
            value={email}
            onChange={(e) => UpdateFields({ email: e.target.value })}
            disabled={loading}
            className="h-11 rounded-xl border-slate-300 bg-white/95 px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-950 focus-visible:ring-slate-950/20"
          />
          <FieldDescription className="text-slate-600">
            the email associated with your account.
          </FieldDescription>
        </Field>
      </FieldGroup>
      <FieldGroup>
        <Field className="gap-2">
          <FieldLabel
            htmlFor="password"
            className="text-sm font-semibold text-slate-900"
          >
            Password
          </FieldLabel>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => UpdateFields({ password: e.target.value })}
            disabled={loading}
            className="h-11 rounded-xl border-slate-300 bg-white/95 px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-950 focus-visible:ring-slate-950/20"
          />
          <FieldDescription className="text-slate-600">
            Type in your password.
          </FieldDescription>
        </Field>
      </FieldGroup>
      <FieldGroup>
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}
