import type { PostgrestError } from "@supabase/supabase-js";
import type { Dispatch, SetStateAction } from "react";

/**
 * This file defines the common types used across the application. Types that are common between multiple files are defined here to avoid repetition and ensure consistency.
 */

/**
 * the Type of the Updater Function used in the useState hook.
 *
 * @example
 * type ChildProps = {
 *  State: string;
 *  setState: UpdaterFunction<string>;
 * }
 */
export type UpdaterFunction<T> = Dispatch<SetStateAction<T>>;

// Supabase automatically generates them, so they are optional in the types
export type Common = {
  id?: number;
  added_at?: string;
};

// The Image type as it is stored in Supabase
export type Image = {
  url: string;
  path: string;
};

/**
 * The Data type used in the API calls.
 *
 * @example
 * const { data, error }:= await supabaseClient.from("projects").select("*") as Data<Project[]>;
 */
export type Data<T> =
  | { data: T; error: null }
  | { error: PostgrestError; data: null };

export type NavLink = {
  to: string;
  label: string;
  requiresAuth?: true;
  requiresStaff?: true;
};

export type SummaryLabel = {
  num: `${number}+`;
  label: string;
};

export type FAQItem ={
  question: string,
  answer:string
}
