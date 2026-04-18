/**
 * This file defines the types for the country data used in the application.
 */

import type { Common } from "./types";

export type Country = Omit<Common, "added_at"> & {
  name: string;
};
