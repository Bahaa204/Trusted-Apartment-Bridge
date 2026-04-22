import { useEffect, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";
import type { Data } from "../types/types";
import type { Building } from "@/types/building";

const LOCAL_STORAGE_KEY = "building";

/**
 * Custom hook to manage buildings data and operations.
 * @returns An object containing the list of buildings, loading state, error message, and functions to manage buildings
 */
export function useBuildings() {
  const [Buildings, setBuildings] = useState<Building[]>([]);
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
    const localBuildings = localStorage.getItem(LOCAL_STORAGE_KEY);

    async function fetchBuildings() {
      resetStates();

      if (localBuildings) {
        console.log("Loading Local Buildings...");

        setBuildings(JSON.parse(localBuildings) as Building[]);
        setLoading(false);
        const end = performance.now();
        console.log(`Loaded buildings in ${end - start} ms`);
        return;
      }

      const { data, error: FetchError } = (await supabaseClient
        .from("buildings")
        .select("*")) as Data<Building[]>;

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setBuildings(data || []);
      setLoading(false);

      if (!localBuildings)
        return localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(data || []),
        );
    }

    fetchBuildings();

    const channel = supabaseClient.channel("Buildings-Channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "buildings" },
        (payload) => {
          const newBuilding = payload.new as Building;

          setBuildings((prev) => [...prev, newBuilding]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "buildings" },
        (payload) => {
          const updatedBuilding = payload.new as Building;

          setBuildings((prev) =>
            prev.map((building) =>
              building.id === updatedBuilding.id ? updatedBuilding : building,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "buildings" },
        (payload) => {
          const deletedBuilding = payload.old as Building;

          setBuildings((prev) =>
            prev.filter((building) => building.id !== deletedBuilding.id),
          );
        },
      )
      .subscribe((status) => {
        console.log("Buildings Channel:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  /**
   * Adds a new building to the database.
   * @param new_building - The new building to be added to the database.
   * @returns A promise resolving to a boolean.
   */
  async function AddBuilding(new_building: Building) {
    resetStates();

    const { error: InsertError } = await supabaseClient
      .from("buildings")
      .insert(new_building)
      .single();

    if (InsertError) {
      SetError(InsertError);
      return false;
    }

    setLoading(false);
    return true;
  }

  /**
   * Updates an existing building in the database.
   * @param updated_building - The updated building data to be saved in the database.
   * @param buildingId - The ID of the building to be updated.
   * @returns A promise resolving to a boolean.
   */
  async function UpdateBuilding(
    updated_building: Building,
    buildingId: Building["id"],
  ) {
    resetStates();

    const { error: UpdateError } = await supabaseClient
      .from("buildings")
      .update(updated_building)
      .eq("id", buildingId);

    if (UpdateError) {
      SetError(UpdateError);
      return false;
    }

    setLoading(false);
    return true;
  }

  /**
   * Removes a building from the database.
   * @param buildingId - The ID of the building to be removed from the database.
   * @returns A promise resolving to a boolean.
   */
  async function RemoveBuilding(buildingId: Building["id"]) {
    resetStates();

    const { error: DeleteError } = await supabaseClient
      .from("buildings")
      .delete()
      .eq("id", buildingId);

    if (DeleteError) {
      SetError(DeleteError);
      return false;
    }

    setLoading(false);
    return true;
  }

  return {
    Buildings,
    Loading,
    Error,
    AddBuilding,
    UpdateBuilding,
    RemoveBuilding,
  };
}
