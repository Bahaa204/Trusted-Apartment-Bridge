import type { Dispatch, SetStateAction } from "react";

// Updater Function Type of the useState hook
export type UpdaterFunction<T> = Dispatch<SetStateAction<T>>;

// Supabase automatically generates them
// so no need to put place when submitting the form
export type Common = {
  id?: number;
  added_at?: string;
};

export type Project = Common & {
  name: string;
  description: string;
  location: string;
  images_url: string[];
  starting_price: number;
  nb_visits?: number; // Supabase defaults the value to 0 so it is optional
};

export type Building = Common & {
  name: string;
  block: string;
  images_url: string[];
  project_id: Project["id"]; // Same Type as the project id
};

export type House = Common & {
  floor: number;
  nb_bedrooms: number;
  nb_bathrooms: number;
  building_id: Building["id"]; // Same Type as the building id
};

export type FormData = {
  project_name: string;
  project_description: string;
  project_location: string;
  project_images: FileList | null;
  project_starting_price: number;
  buildings_name: string;
  buildings_block: string;
  buildings_images: FileList | null;
  buildings_project_id: Project["id"]; // Same Type as the project id
  house_floor: number;
  house_nb_bedrooms: number;
  house_nb_bathrooms: number;
  house_building_id: Building["id"]; // Same Type as the building id
};

export type ProjectsInput = Omit<Project, "images_url"> & {
  images: FileList | null;
};

export type BuildingInput = Omit<Building, "images_url"> & {
  images: FileList | null;
};
