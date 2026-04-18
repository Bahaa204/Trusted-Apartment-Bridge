/**
 * This file defines the types for the building data used in the application.
 */

import type { Project } from "./projects";
import type { Common, Image } from "./types";

export type Building = Common & {
  name: string;
  block: string;
  images: Image[];
  project_id: Project["id"]; // Same Type as the project id
};

// Same type as the Building but changing the images type from Image[] to FileList or null
export type BuildingInput = Omit<Building, "images"> & {
  images: FileList | null;
};
