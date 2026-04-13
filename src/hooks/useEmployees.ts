import { useEffect, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";
import type { Employee } from "../types/types";

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

      const { data, error: FetchError } = await supabaseClient
        .from("employees")
        .select("*");

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

  return { Employees, Loading, Error, getSalaries };
}
