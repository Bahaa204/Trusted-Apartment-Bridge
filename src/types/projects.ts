/**
 * This file defines the types for the project data used in the application.
 */

import type { Country } from "./country";
import type { Common, Image } from "./types";

export type Project = Common & {
  name: string;
  description: string;
  location: string;
  nb_visits?: number; // Supabase defaults the value to 0 so it is optional
  country_id: Country["id"]; // Same Type as the Country id
  images: Image[];
};

// Same type as the Projects but changing the images type from Image[] to FileList or null
export type ProjectsInput = Omit<Project, "images"> & {
  images: FileList | null;
};
