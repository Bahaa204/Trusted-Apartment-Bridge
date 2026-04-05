import { useEffect, useState } from "react";
import type { Country } from "../types/types";
import { supabaseClient } from "../lib/supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";

export default function useCountries() {
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
    async function fetchCountries() {
      resetStates();

      const { data, error: FetchError } = await supabaseClient
        .from("countries")
        .select("*");

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setCountries(data || []);
      setLoading(false);
    }

    fetchCountries();
  }, []);

  return { Countries, Loading, Error };
}
