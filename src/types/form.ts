/**
 * This file defines the types for the form data used in the application.
 */

import type { Building } from "./building";
import type { Country } from "./country";
import type { Project } from "./projects";

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

export type PaymentFormData = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  email: string;
};

export type LoginFormData = {
  email: string;
  password: string;
  display_name: string;
  email_sent: boolean;
};
