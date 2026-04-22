/**
 * This file defines the types for the country data used in the application.
 */

import type { Common } from "./types";

export type Country = Omit<Common, "added_at"> & {
  name: string;
};

export type CountryInfo = Record<
  string,
  { flagCode: string; lat: number; lng: number }
>;

export type CountryDisplay = Country & {
  flagCode: string;
  lat: number;
  lng: number;
};