import type { House } from "./house";
import type { Project } from "./projects";
import type { Common } from "./types";

export type TourBookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type TourBooking = Common & {
  user_id: string;
  project_id: Project["id"];
  house_id: House["id"] | null;
  preferred_date: string;
  preferred_time: string;
  contact_phone?: string | null;
  notes?: string | null;
  status: TourBookingStatus;
  updated_at?: string;
};

export type TourBookingInput = {
  project_id: Project["id"];
  house_id: House["id"] | null;
  preferred_date: string;
  preferred_time: string;
  contact_phone?: string;
  notes?: string;
};
