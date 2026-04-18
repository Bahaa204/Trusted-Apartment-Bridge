import { useEffect, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";
import type { Data } from "../types/types";
import type { Employee, EmployeeFormValues } from "@/types/employee";

/**
 * Hook to manage employee data and operations.
 * @returns An object containing the list of employees, loading state, error message, and functions to manage employees.
 */
export function useEmployees() {
  const [Employees, setEmployees] = useState<Employee[]>([]);
  const [Loading, setLoading] = useState<boolean>(true);
  const [Error, setError] = useState<string>("");

  // Helper Function to reset the states
  function resetStates() {
    setLoading(true);
    setError("");
  }

  // Helper function to set the error message
  function SetError(error: PostgrestError) {
    const msg: string = `An Error has occurred. Error Message: ${error.message}`;
    console.error(error);
    setError(msg);
    setLoading(false);
  }

  // Fetching the data from the database + real time listeners to update the data
  useEffect(() => {
    async function fetchEmployees() {
      resetStates();

      const { data, error: FetchError } = (await supabaseClient
        .from("employees")
        .select("*")) as Data<Employee[]>;

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setEmployees(data || []);
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
      supabaseClient.removeChannel(channel);
    };
  }, []);

  function getSalaries() {
    return Employees.reduce((sum, employee) => (sum += employee.salary), 0);
  }

  async function addEmployee(newEmployee: EmployeeFormValues) {
    resetStates();

    const { error: insertError } = await supabaseClient
      .from("employees")
      .insert(newEmployee)
      .single();

    if (insertError) {
      SetError(insertError);
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

    const { error: updateError } = await supabaseClient
      .from("employees")
      .update(updatedEmployee)
      .eq("id", employeeId);

    if (updateError) {
      SetError(updateError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function removeEmployee(employeeId: Employee["id"]) {
    resetStates();

    const { error: DeleteError } = await supabaseClient
      .from("employees")
      .delete()
      .eq("id", employeeId);

    if (DeleteError) {
      SetError(DeleteError);
      return false;
    }

    setLoading(false);
    return true;
  }

  return {
    Employees,
    Loading,
    Error,
    addEmployee,
    updateEmployee,
    removeEmployee,
    getSalaries,
  };
}
