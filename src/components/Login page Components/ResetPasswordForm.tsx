import { Button } from "../ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";

type ResetPasswordFormData = {
  email: string;
  email_sent: boolean;
};

type ResetPasswordFormProps = ResetPasswordFormData & {
  loading: boolean;
  UpdateFields: (fields: Partial<ResetPasswordFormData>) => void;
};

export default function ResetPasswordForm({
  email,
  email_sent,
  loading,
  UpdateFields,
}: ResetPasswordFormProps) {
  return (
    <FieldSet className="w-full max-w-md gap-5">
      <FieldGroup className="gap-4">
        {email_sent && (
          <FieldLegend
            className="rounded-2xl border border-orange-200 bg-orange-50/90 px-4 py-3 text-slate-900 shadow-sm"
            role="alert"
          >
            <p className="font-semibold text-slate-950">Email Sent</p>
            <p className="text-sm text-slate-700">
              We've sent a password reset link to your email address.
            </p>
          </FieldLegend>
        )}
      </FieldGroup>

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
        <Button type="submit" disabled={loading}>
          {loading ? "Sending reset link..." : "Send reset link"}
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}
