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
  emailInput: { email: string; setEmail: UpdaterFunction<string> };
  passwordInput: { password: string; setPassword: UpdaterFunction<string> };
  emailDescription: string;
  passwordDescription: string;
  error?: string;
  onsubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

export default function LoginForm({
  legend,
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
      <FieldSet>
        {legend && <FieldLegend>{legend}</FieldLegend>}
        {error && <FieldError>{error}</FieldError>}
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              value={emailInput.email}
              onChange={(event) => emailInput.setEmail(event.target.value)}
              id="email"
              autoComplete="email"
              type="email"
              placeholder="omar@tab-admin.com"
              required
            />
            <FieldDescription>{emailDescription}</FieldDescription>
          </Field>
          <FieldSeparator />
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              value={passwordInput.password}
              onChange={(event) => passwordInput.setPassword(event.target.value)}
              id="password"
              autoComplete="current-password"
              type="password"
              placeholder="******"
              required
            />
            <FieldDescription>{passwordDescription}</FieldDescription>
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <Button type="submit" className="cursor-pointer">
              Login
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
