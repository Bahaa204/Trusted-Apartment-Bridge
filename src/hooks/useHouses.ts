import { useEffect, useState } from "react";
import type { House } from "../types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";

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
    async function fetchHouses() {
      resetStates();

      const { data, error: FetchError } = await supabaseClient
        .from("houses")
        .select("*");

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setHouses(data || []);
      setLoading(false);
    }

    fetchHouses();

    const channel = supabaseClient.channel("Houses-Channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "projects" },
        (payload) => {
          const newHouse = payload.new as House;

          setHouses((prev) => [...prev, newHouse]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects" },
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
        { event: "DELETE", schema: "public", table: "projects" },
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

  async function UpdateHouse(updated_house: House, houseId: House["id"]) {
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

  return { Houses, Loading, Error, AddHouse, UpdateHouse, RemoveHouse };
}
