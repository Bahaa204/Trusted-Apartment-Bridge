/**
 * This file defines the types for the project data used in the application.
 */

import type { Building } from "./building";
import type { Country } from "./country";
import type { House } from "./house";
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

export type Functions = {
  UpdateProject: (
    updated_project: Project,
    projectId: Project["id"],
  ) => Promise<boolean>;
  RemoveProject: (projectId: Project["id"]) => Promise<boolean>;
  UpdateBuilding: (
    updated_building: Building,
    buildingId: Building["id"],
  ) => Promise<boolean>;
  RemoveBuilding: (buildingId: Building["id"]) => Promise<boolean>;
  UpdateHouse: (updated_house: House, houseId: House["id"]) => Promise<boolean>;
  RemoveHouse: (houseId: House["id"]) => Promise<boolean>;
};

export type ProjectsDashBoardDisplayProps = {
  Countries: Country[];
  Projects: Project[];
  Buildings: Building[];
  Houses: House[];
} & Functions;

export type ImageGalleryProps = {
  images: string[];
};

export type UnitCardProps = {
  house: House;
  isHovered: boolean;
  LoginNotice: boolean
  onHover: () => void;
  onLeave: () => void;
  onBuy: () => void;
};

export type ProjectsData = {
  project_name: string;
  project_description: string;
  project_location: string;
  project_images: FileList | null;
  project_country_id: Country["id"];
};

export type ProjectCardsProps = {
  project: Project;
  Countries: Country[];
  IsBuildingOpen: boolean;
  ToggleBuildingShow: (projectId: Project["id"]) => void;
  UpdateProject: (
    updated_project: Project,
    projectId: Project["id"],
  ) => Promise<boolean>;
  RemoveProject: (projectId: Project["id"]) => Promise<boolean>;
};
