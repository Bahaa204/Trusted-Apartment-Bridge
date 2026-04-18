/**
 * This file defines the types for the house data used in the application.
 */

import type { Building } from "./building";
import type { Common } from "./types";

export type House = Common & {
  floor: number;
  nb_bedrooms: number;
  nb_bathrooms: number;
  building_id: Building["id"]; // Same Type as the building id
  price: number;
  is_sold?: boolean; // Defaults to False
};
