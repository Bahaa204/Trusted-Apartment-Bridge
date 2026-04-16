import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SignUpFormData = {
  display_name: string;
  email: string;
  password: string;
};

type SignUpFormProps = SignUpFormData & {
  loading: boolean;
  UpdateFields: (fields: Partial<SignUpFormData>) => void;
};

export function SignUpForm({
  display_name,
  email,
  password,
  loading,
  UpdateFields,
}: SignUpFormProps) {
  return (
    <FieldSet className="w-full max-w-md gap-5">
      <FieldGroup className="gap-4">
        <Field className="gap-2">
          <FieldLabel
            htmlFor="display_name"
            className="text-sm font-semibold text-slate-900"
          >
            Display Name
          </FieldLabel>
          <Input
            id="display_name"
            type="text"
            placeholder="John Doe"
            value={display_name}
            onChange={(e) => UpdateFields({ display_name: e.target.value })}
            disabled={loading}
            className="h-11 rounded-xl border-slate-300 bg-white/95 px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-950 focus-visible:ring-slate-950/20"
          />
        </Field>
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
            Choose a unique email for your account.
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
          <FieldDescription className="text-slate-600">
            Must be at least 8 characters long.
          </FieldDescription>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => UpdateFields({ password: e.target.value })}
            disabled={loading}
            className="h-11 rounded-xl border-slate-300 bg-white/95 px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-950 focus-visible:ring-slate-950/20"
          />
        </Field>
      </FieldGroup>
      <FieldGroup>
        <Button type="submit" variant="default" disabled={loading} className="cursor-pointer">
          {loading ? "Signing up..." : "Sign up"}
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}
