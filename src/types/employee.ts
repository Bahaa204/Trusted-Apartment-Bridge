/**
 * This file defines the types for the employee data used in the application.
 */

import type { Common } from "./types";

export type Employee = Common & {
  name: string;
  email: string;
  salary: number;
};

export type EmployeeFormValues = Omit<Employee, "id">;
