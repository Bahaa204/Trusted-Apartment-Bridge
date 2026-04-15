import {
  AuthError,
  PostgrestError,
  type Provider,
  type Session,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import type { UserRole } from "@/types/types";

const ADMIN_EMAIL_DOMAIN = "@tab-admin.com";
const EMPLOYEE_EMAIL_DOMAIN = "@tab-employee.com";

export function GetRoleFromEmail(email?: string | null): UserRole {
  if (!email) return "customer";

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.endsWith(ADMIN_EMAIL_DOMAIN)) return "admin";
  if (normalizedEmail.endsWith(EMPLOYEE_EMAIL_DOMAIN)) return "employee";

  return "customer";
}

export function useAuth() {
  const [Session, setSession] = useState<Session | null>(null);
  const [Loading, setLoading] = useState<boolean>(true);
  const [Error, setError] = useState<string>("");

  //Helper reset some states
  function resetSates() {
    setLoading(true);
    setError("");
  }

  // Helper function to set the error
  function SetError(error: PostgrestError | AuthError) {
    const msg = `An Error has occurred. Error code: ${error.code} Error message: ${error.message}`;
    console.error(error);
    setError(msg);
    setLoading(false);

    setTimeout(() => {
      setError("");
    }, 10000);
  }

  useEffect(() => {
    async function getSession() {
      resetSates();

      const { data, error: SessionError } =
        await supabaseClient.auth.getSession();

      if (SessionError) {
        SetError(SessionError);
        return;
      }
      setSession(data.session);
      setLoading(false);
    }

    getSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function GetUser() {
    resetSates();
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) {
      SetError(error);
      return null;
    }
    setLoading(false);
    return data.user;
  }

  async function SignInWithPassword(email: string, password: string) {
    setLoading(true);

    const { error: SignInError } = await supabaseClient.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (SignInError) {
      SetError(SignInError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function SignUp(
    email: string,
    password: string,
    displayname: string,
    options:
      | { role: "admin" | "employee"; bypassRoleCheck: true }
      | { role: "customer"; bypassRoleCheck?: never } = { role: "customer" },
  ) {
    resetSates();

    const Role = GetRoleFromEmail(email);

    if (Role !== "customer" && !options.bypassRoleCheck) {
      const error = new AuthError(
        "Only customers can sign up with email and password. Please login with your credentials instead.",
        401,
        "TAB-AUTH-001",
      );
      SetError(error);
      return false;
    }

    const { error: SignUpError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayname,
          role: options.bypassRoleCheck ? options.role : Role,
        },
      },
    });

    if (SignUpError) {
      SetError(SignUpError);
      return false;
    }

    return true;
  }

  async function SignInWithOAuth(provider: Provider) {
    resetSates();

    const { error: OAuthError } = await supabaseClient.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (OAuthError) {
      SetError(OAuthError);
      return false;
    }

    return true;
  }

  async function SignOut() {
    resetSates();

    const { error: SignOutError } = await supabaseClient.auth.signOut();

    if (SignOutError) {
      SetError(SignOutError);
      return false;
    }
    return true;
  }

  async function ResetPassword(email: string) {
    resetSates();

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      SetError(error);
      return false;
    }

    return true;
  }

  async function UpdatePassword(new_password: string) {
    resetSates();

    const { error } = await supabaseClient.auth.updateUser({
      password: new_password,
    });

    if (error) {
      SetError(error);
      return false;
    }

    return true;
  }

  async function RestoreSession(Session: Session) {
    const { error } = await supabaseClient.auth.setSession(Session);
    if (error) {
      SetError(error);
      return false;
    }
    return true;
  }

  return {
    Session,
    Error,
    Loading,
    SignInWithPassword,
    SignInWithOAuth,
    SignUp,
    SignOut,
    ResetPassword,
    UpdatePassword,
    GetUser,
    GetRoleFromEmail,
    RestoreSession,
  };
}
