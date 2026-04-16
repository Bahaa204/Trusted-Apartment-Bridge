import { useEffect, useState } from "react";
import type { Employee, EmployeeFormValues } from "../types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Helper Function to reset the states
  function resetStates() {
    setLoading(true);
    setError("");
  }

  // Helper function to set the error message
  function setHookError(error: PostgrestError) {
    const msg = `An Error has occurred. Error Message: ${error.message}`;
    console.error(error);
    setError(msg);
    setLoading(false);
  }

  // Fetching the data from the database + real time listeners to update the data
  useEffect(() => {
    async function fetchEmployees() {
      resetStates();

      const { data, error: fetchError } = await supabaseClient
        .from("employees")
        .select("*")
        .order("id", { ascending: true });

      if (fetchError) {
        setHookError(fetchError);
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
      void supabaseClient.removeChannel(channel);
    };
  }, []);

  async function addEmployee(newEmployee: EmployeeFormValues) {
    resetStates();

    const { error: insertError } = await supabaseClient
      .from("employees")
      .insert(newEmployee)
      .single();

    if (insertError) {
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

    const { error: updateError } = await supabaseClient
      .from("employees")
      .update(updatedEmployee)
      .eq("id", employeeId);

    if (updateError) {
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

    const { error: deleteError } = await supabaseClient
      .from("employees")
      .delete()
      .eq("id", employeeId);

    if (deleteError) {
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
    addEmployee,
    updateEmployee,
    removeEmployee,
  };
}
