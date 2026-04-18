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

export type BuildingsCardProps = {
  Building: Building;
  Projects: Project[];
  IsHouseOpen: boolean;
  ToggleHouseShow: (buildingId: Building["id"]) => void;
  UpdateBuilding: (
    updated_building: Building,
    buildingId: Building["id"],
  ) => Promise<boolean>;
  RemoveBuilding: (buildingId: Building["id"]) => Promise<boolean>;
};

export type BuildingData = {
  buildings_name: string;
  buildings_block: string;
  buildings_images: FileList | null;
  buildings_project_id: Project["id"];
};
