import {
  AuthError,
  PostgrestError,
  type Provider,
  type Session,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import type { SignUpOptions, UserRole } from "@/types/auth";

const ADMIN_EMAIL_DOMAIN = "@tab-admin.com";
const EMPLOYEE_EMAIL_DOMAIN = "@tab-employee.com";

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
        if (session?.access_token) {
          supabaseClient.realtime.setAuth(session.access_token);
        }

        setSession(session);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Gets the currently authenticated user.
   * @returns The currently authenticated user or null if no user is authenticated.
   */
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

  /**
   * Signs in a user with email and password.
   * @param email The user's email.
   * @param password The user's password.
   * @returns A promise resolving to a boolean.
   */
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

  /**
   * Signs up a new user with email and password.
   * @param email The user's email.
   * @param password The user's password.
   * @param displayname The user's display name.
   * @param options Additional sign-up options.
   * @returns A promise resolving to a boolean.
   */
  async function SignUp(
    email: string,
    password: string,
    displayname: string,
    options: SignUpOptions = { role: "customer" },
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

  /**
   * Signs in a user with an OAuth provider.
   * @param provider The OAuth provider to sign in with (e.g., "google", "github").
   * @returns A promise resolving to a boolean.
   */
  async function SignInWithOAuth(provider: Provider) {
    resetSates();

    const { data, error: OAuthError } =
      await supabaseClient.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

    // console.log(data.url);

    if (data.url) return window.location.replace(data.url);

    if (OAuthError) {
      SetError(OAuthError);
      return false;
    }

    return true;
  }

  /**
   * Signs out the currently authenticated user.
   * @returns A promise resolving to a boolean
   */
  async function SignOut() {
    resetSates();

    const { error: SignOutError } = await supabaseClient.auth.signOut();

    if (SignOutError) {
      SetError(SignOutError);
      return false;
    }
    return true;
  }

  /**
   * Resets the password for a user with the given email.
   * @param email The user's email.
   * @returns A promise resolving to a boolean.
   */
  async function ResetPassword(email: string) {
    resetSates();

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      SetError(error);
      return false;
    }

    setLoading(false);
    return true;
  }

  /**
   * Updates the password for the currently authenticated user.
   * @param new_password The new password to be set for the currently authenticated user.
   * @returns A promise resolving to a boolean indicating whether the password update was successful.
   */
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

  /**
   *
   * @param prevSession The previous session to restore.
   * @returns A promise resolving to a boolean.
   */
  async function RestoreSession(prevSession: Session) {
    const { error } = await supabaseClient.auth.setSession(prevSession);
    if (error) {
      SetError(error);
      return false;
    }
    return true;
  }

  /**
   * Extracts the role from a user's email address.
   * @param email The user's email address.
   * @returns The user's role.
   */
  function GetRoleFromEmail(email?: string | null): UserRole {
    if (!email) return "customer";

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail.endsWith(ADMIN_EMAIL_DOMAIN)) return "admin";
    if (normalizedEmail.endsWith(EMPLOYEE_EMAIL_DOMAIN)) return "employee";

    return "customer";
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
