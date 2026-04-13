import type { Dispatch, SetStateAction } from "react";

// Updater Function Type of the useState hook
export type UpdaterFunction<T> = Dispatch<SetStateAction<T>>;

// Supabase automatically generates them
// so no need to put place when submitting the form
export type Common = {
  id?: number;
  added_at?: string;
};

export type Image = {
  url: string;
  path: string;
};

export type Country = Omit<Common, "added_at"> & {
  name: string;
};

export type Project = Common & {
  name: string;
  description: string;
  location: string;
  nb_visits?: number; // Supabase defaults the value to 0 so it is optional
  country_id: Country["id"]; // Same Type as the Country id
  images: Image[];
};

export type Building = Common & {
  name: string;
  block: string;
  images: Image[];
  project_id: Project["id"]; // Same Type as the project id
};

export type House = Common & {
  floor: number;
  nb_bedrooms: number;
  nb_bathrooms: number;
  building_id: Building["id"]; // Same Type as the building id
  price: number;
  is_sold?: boolean; // Defaults to False
};

export type FormData = {
  project_name: string;
  project_description: string;
  project_location: string;
  project_country_id: Country["id"]; // Same Type as the Country id
  project_images: FileList | null;
  buildings_name: string;
  buildings_block: string;
  buildings_images: FileList | null;
  buildings_project_id: Project["id"]; // Same Type as the project id
  house_floor: number;
  house_nb_bedrooms: number;
  house_nb_bathrooms: number;
  house_building_id: Building["id"]; // Same Type as the building id
  house_price: number;
};

// Same type as the Projects but changing the images type from Image[] to FileList or null
export type ProjectsInput = Omit<Project, "images"> & {
  images: FileList | null;
};

// Same type as the Building but changing the images type from Image[] to FileList or null
export type BuildingInput = Omit<Building, "images"> & {
  images: FileList | null;
};

export type LoginMode = "SignIn" | "SignUp" | "ResetPassword";

export type Employee = Common & {
  email: string;
  salary: number;
};
