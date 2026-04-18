/**
 *  This file defines the types for the authentication-related data used in the application.

 */

export type SignUpOptions =
  | { role: "admin" | "employee"; bypassRoleCheck: true }
  | { role: "customer"; bypassRoleCheck?: never };

export type UserRole = "admin" | "employee" | "customer";
