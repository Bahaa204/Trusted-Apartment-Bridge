import { useEffect, useState } from "react";
import type { Data } from "../types/types";
import { supabaseClient } from "../lib/supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Country } from "@/types/country";

const LOCAL_STORAGE_KEY = "countries";

/**
 * Custom hook to manage countries data and operations.
 * @returns An object containing the list of countries, loading state, error message, and functions to manage countries
 */
export function useCountries() {
  const [Countries, setCountries] = useState<Country[]>([]);
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
    const start = performance.now();
    const localCountries = localStorage.getItem(LOCAL_STORAGE_KEY);

    async function fetchCountries() {
      resetStates();

      if (localCountries) {
        console.log("Loading Local Countries...");

        setCountries(JSON.parse(localCountries) as Country[]);
        setLoading(false);
        const end = performance.now();
        console.log(`Loaded countries in ${end - start} ms`);
        return;
      }

      const { data, error: FetchError } = (await supabaseClient
        .from("countries")
        .select("*")) as Data<Country[]>;

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setCountries(data || []);
      setLoading(false);

      if (!localCountries)
        return localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(data || []),
        );
    }

    fetchCountries();
  }, []);

  return { Countries, Loading, Error };
}
