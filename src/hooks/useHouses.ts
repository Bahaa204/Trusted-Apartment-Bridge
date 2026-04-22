import { useEffect, useState } from "react";
import type { Data } from "../types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";
import { GetMinMaxDate } from "../helpers/Date";
import type { DateReturn, DateString } from "../types/date";
import type { House } from "@/types/house";

const LOCAL_STORAGE_KEY = "houses";

/**
 *
 * This hook manages the state and operations related to houses.
 * @returns An object containing the list of houses, loading state, error message, and functions to manage houses
 *
 */
export function useHouses() {
  const [Houses, setHouses] = useState<House[]>([]);
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
    const localHouses = localStorage.getItem(LOCAL_STORAGE_KEY);

    async function fetchHouses() {
      resetStates();

      if (localHouses) {
        console.log("Loading Local Houses...");

        setHouses(JSON.parse(localHouses) as House[]);
        setLoading(false);
        const end = performance.now();
        console.log(`Loaded houses in ${end - start} ms`);
        return;
      }

      const { data, error: FetchError } = (await supabaseClient
        .from("houses")
        .select("*")) as Data<House[]>;

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setHouses(data || []);
      setLoading(false);

      if (!localHouses)
        return localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(data || []),
        );
    }

    fetchHouses();

    const channel = supabaseClient.channel("Houses-Channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "houses" },
        (payload) => {
          const newHouse = payload.new as House;

          setHouses((prev) => [...prev, newHouse]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "houses" },
        (payload) => {
          const updatedHouses = payload.new as House;

          setHouses((prev) =>
            prev.map((house) =>
              house.id === updatedHouses.id ? updatedHouses : house,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "houses" },
        (payload) => {
          const deletedHouse = payload.old as House;

          setHouses((prev) =>
            prev.filter((house) => house.id !== deletedHouse.id),
          );
        },
      )
      .subscribe((status) => {
        console.log("House Channel:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  /**
   * Adds a new house to the database.
   * @param new_house - The new house to be added to the database. It should be an object of type House containing the necessary fields.
   * @returns A promise resolving to a boolean.
   */
  async function AddHouse(new_house: House) {
    resetStates();

    const { error: InsertError } = await supabaseClient
      .from("houses")
      .insert(new_house)
      .single();

    if (InsertError) {
      SetError(InsertError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function UpdateHouse(
    updated_house: Partial<House>,
    houseId: House["id"],
  ) {
    resetStates();

    const { error: UpdateError } = await supabaseClient
      .from("houses")
      .update(updated_house)
      .eq("id", houseId);

    if (UpdateError) {
      SetError(UpdateError);
      return false;
    }

    setLoading(false);
    return true;
  }

  /**
   * Removes a house from the database.
   * @param houseId - The id of the house to be removed from the database.
   * @returns A promise resolving to a boolean.
   */
  async function RemoveHouse(houseId: House["id"]) {
    resetStates();

    const { error: DeleteError } = await supabaseClient
      .from("houses")
      .delete()
      .eq("id", houseId);

    if (DeleteError) {
      SetError(DeleteError);
      return false;
    }

    setLoading(false);
    return true;
  }

  /**
   * Retrieves the minimum and maximum dates from the list of houses.
   * @returns An object containing the minimum and maximum dates from the list of houses.
   */
  function getDates(): DateReturn {
    // Extracting the timestamps from the houses and filtering out any null or undefined values
    const timestamps: string[] = Houses.map((house) => house.added_at).filter(
      (timestamp): timestamp is string => Boolean(timestamp),
    );

    const { minInputDate, maxInputDate } = GetMinMaxDate(timestamps);

    return { minInputDate, maxInputDate };
  }

  /**
   * Retrieves houses within a specified date range.
   * @param minDate - The minimum date to filter the houses.
   * @param maxDate - The maximum date to filter the houses.
   * @returns A promise resolving to an array of houses that were added between the specified dates.
   */
  async function getHousesBetweenDates(
    minDate: DateString,
    maxDate: DateString,
  ) {
    // Start of minDate (inclusive)
    const start = new Date(minDate);
    start.setUTCHours(0, 0, 0, 0);

    // Start of next day after maxDate (exclusive)
    const end = new Date(maxDate);
    end.setDate(end.getDate() + 1);
    end.setUTCHours(0, 0, 0, 0);

    const { data, error: FetchError } = (await supabaseClient
      .from("houses")
      .select("*")
      .gte("added_at", start.toISOString())
      .lt("added_at", end.toISOString())) as Data<House[]>;

    if (FetchError) {
      SetError(FetchError);
      return [];
    }

    return data;
  }

  return {
    Houses,
    Loading,
    Error,
    AddHouse,
    UpdateHouse,
    RemoveHouse,
    getDates,
    getHousesBetweenDates,
  };
}
