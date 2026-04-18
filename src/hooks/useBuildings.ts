import { useEffect, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";
import type { Building, Data, Project } from "../types/types";

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
    async function fetchBuildings() {
      resetStates();

      const { data, error: FetchError } = await supabaseClient
        .from("buildings")
        .select("*");

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setBuildings(data || []);
      setLoading(false);
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

  async function GetBuildingsByProjectID(projectId: Project["id"]) {
    resetStates();

    const { data, error: FetchError } = (await supabaseClient
      .from("buildings")
      .select("*")
      .eq("project_id", projectId)) as Data<Building[]>;

    if (FetchError) {
      SetError(FetchError);
      return [];
    }

    setLoading(false);
    return data || [];
  }

  return {
    Buildings,
    Loading,
    Error,
    AddBuilding,
    UpdateBuilding,
    RemoveBuilding,
    GetBuildingsByProjectID,
  };
}
