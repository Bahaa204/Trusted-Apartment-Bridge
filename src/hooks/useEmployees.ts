import { useEffect, useState } from "react";
import type { Employee, EmployeeFormValues } from "../types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";

const LOCAL_STORAGE_KEY = "admin-employees";
const LOCAL_MODE_KEY = "admin-employees-local-mode";

function getLocalEmployees(): Employee[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    return JSON.parse(rawValue) as Employee[];
  } catch (error) {
    console.error("Failed to parse locally stored employees.", error);
    return [];
  }
}

function saveLocalEmployees(employees: Employee[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(employees));
}

function getStoredLocalMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(LOCAL_MODE_KEY) === "true";
}

function saveStoredLocalMode(isEnabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_MODE_KEY, String(isEnabled));
}

function createLocalEmployeeId(employees: Employee[]) {
  const maxId = employees.reduce((currentMax, employee) => {
    return employee.id > currentMax ? employee.id : currentMax;
  }, 0);

  return maxId + 1;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isUsingLocalMode, setIsUsingLocalMode] = useState<boolean>(false);

  // Helper Function to reset the states
  function resetStates() {
    setLoading(true);
    setError("");
  }

  // Helper function to set the error message
  function setHookError(error: PostgrestError) {
    const msg: string =
      error.code === "42501"
        ? "Supabase is read-only for this app right now, so employee changes are being saved locally in this browser instead."
        : `An Error has occurred. Error Message: ${error.message}`;
    console.error(error);
    setError(msg);
    setLoading(false);
  }

  function enableLocalMode(message?: string) {
    setIsUsingLocalMode(true);
    saveStoredLocalMode(true);
    setEmployees(getLocalEmployees());
    setLoading(false);

    if (message) {
      setError(message);
    }
  }

  // Fetching the data from the database + real time listeners to update the data
  useEffect(() => {
    
    async function fetchEmployees() {
      resetStates();

      if (getStoredLocalMode()) {
        setIsUsingLocalMode(true);
        setEmployees(getLocalEmployees());
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabaseClient
        .from("employees")
        .select("*")
        .order("id", { ascending: true });

      if (fetchError) {
        if (fetchError.code === "42501") {
          enableLocalMode(
            "Supabase access is restricted, so employees are loading from local browser storage instead.",
          );
          return;
        }

        setHookError(fetchError);
        return;
      }

      const remoteEmployees = data || [];
      const localEmployees = getLocalEmployees();

      setEmployees(remoteEmployees.length > 0 ? remoteEmployees : localEmployees);
      setLoading(false);
    }

    fetchEmployees();

    const channel = supabaseClient.channel("Employees-Channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "employees" },
        (payload) => {
          const newEmployee = payload.new as Employee;

          setEmployees((prev) => [...prev, newEmployee]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "employees" },
        (payload) => {
          const updatedEmployee = payload.new as Employee;

          setEmployees((prev) =>
            prev.map((employee) =>
              employee.id === updatedEmployee.id ? updatedEmployee : employee,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "employees" },
        (payload) => {
          const deletedEmployee = payload.old as Employee;

          setEmployees((prev) =>
            prev.filter((employee) => employee.id !== deletedEmployee.id),
          );
        },
      )
      .subscribe((status) => {
        console.log("Employees Channel:", status);
      });

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, []);

  async function addEmployee(newEmployee: EmployeeFormValues) {
    resetStates();

    if (isUsingLocalMode) {
      const currentEmployees = employees;
      const employeeToStore: Employee = {
        id: createLocalEmployeeId(currentEmployees),
        ...newEmployee,
      };
      const updatedEmployees = [...currentEmployees, employeeToStore];

      saveLocalEmployees(updatedEmployees);
      setEmployees(updatedEmployees);
      setLoading(false);
      return true;
    }

    const { error: insertError } = await supabaseClient
      .from("employees")
      .insert(newEmployee)
      .single();

    if (insertError) {
      if (insertError.code === "42501") {
        const currentEmployees = employees;
        const employeeToStore: Employee = {
          id: createLocalEmployeeId(currentEmployees),
          ...newEmployee,
        };
        const updatedEmployees = [...currentEmployees, employeeToStore];

        saveLocalEmployees(updatedEmployees);
        setEmployees(updatedEmployees);
        setIsUsingLocalMode(true);
        saveStoredLocalMode(true);
        setHookError(insertError);
        return true;
      }

      setHookError(insertError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function updateEmployee(
    updatedEmployee: Partial<EmployeeFormValues>,
    employeeId: Employee["id"],
  ) {
    resetStates();

    if (isUsingLocalMode) {
      const updatedEmployees = employees.map((employee) =>
        employee.id === employeeId ? { ...employee, ...updatedEmployee } : employee,
      );

      saveLocalEmployees(updatedEmployees);
      setEmployees(updatedEmployees);
      setLoading(false);
      return true;
    }

    const { error: updateError } = await supabaseClient
      .from("employees")
      .update(updatedEmployee)
      .eq("id", employeeId);

    if (updateError) {
      if (updateError.code === "42501") {
        const updatedEmployees = employees.map((employee) =>
          employee.id === employeeId ? { ...employee, ...updatedEmployee } : employee,
        );

        saveLocalEmployees(updatedEmployees);
        setEmployees(updatedEmployees);
        setIsUsingLocalMode(true);
        saveStoredLocalMode(true);
        setHookError(updateError);
        return true;
      }

      setHookError(updateError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function removeEmployee(employeeId: Employee["id"]) {
    resetStates();
    const previousEmployees = employees;
    const updatedEmployees = employees.filter(
      (employee) => employee.id !== employeeId,
    );

    setEmployees(updatedEmployees);

    if (isUsingLocalMode) {
      saveLocalEmployees(updatedEmployees);
      setEmployees(updatedEmployees);
      setLoading(false);
      return true;
    }

    const { error: deleteError } = await supabaseClient
      .from("employees")
      .delete()
      .eq("id", employeeId);

    if (deleteError) {
      if (deleteError.code === "42501") {
        saveLocalEmployees(updatedEmployees);
        setEmployees(updatedEmployees);
        setIsUsingLocalMode(true);
        saveStoredLocalMode(true);
        setHookError(deleteError);
        return true;
      }

      setEmployees(previousEmployees);
      setHookError(deleteError);
      return false;
    }

    setLoading(false);
    return true;
  }

  return {
    employees,
    loading,
    error,
    isUsingLocalMode,
    addEmployee,
    updateEmployee,
    removeEmployee,
  };
}
