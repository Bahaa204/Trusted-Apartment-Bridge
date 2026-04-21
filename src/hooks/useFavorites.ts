import { useEffect, useMemo, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import type { FavoriteProject, Project } from "@/types/projects";
import type { Data } from "@/types/types";

export function useFavorites() {
  const [Favorites, setFavorites] = useState<FavoriteProject[]>([]);
  const [Loading, setLoading] = useState<boolean>(true);
  const [Error, setError] = useState<string>("");

  const { Session } = useAuth();

  function resetStates() {
    setLoading(true);
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `An Error has occurred. Error code: ${error.code} Error message: ${error.message}`;
    console.error(error);
    setError(msg);
    setLoading(false);
  }

  const FavoriteProjectIds = useMemo(() => {
    return Favorites.map((item) => item.project_id).filter(
      (value): value is number => typeof value === "number",
    );
  }, [Favorites]);

  function IsFavorited(projectId: Project["id"]) {
    return FavoriteProjectIds.includes(projectId as number);
  }

  useEffect(() => {
    async function fetchFavorites() {
      if (!Session?.user.id) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      resetStates();

      const { data, error: FetchError } = (await supabaseClient
        .from("project_favorites")
        .select("*")
        .eq("user_id", Session.user.id)
        .order("added_at", { ascending: false })) as Data<FavoriteProject[]>;

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setFavorites(data ?? []);
      setLoading(false);
    }

    fetchFavorites();

    if (!Session?.user.id) return;

    const channel = supabaseClient
      .channel("project-favorites-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_favorites",
          filter: `user_id=eq.${Session.user.id}`,
        },
        fetchFavorites,
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [Session?.user.id]);

  async function AddFavorite(projectId: Project["id"]) {
    if (!Session?.user.id || typeof projectId !== "number") return false;

    if (IsFavorited(projectId)) return true;

    resetStates();

    const optimisticFavorite: FavoriteProject = {
      user_id: Session.user.id,
      project_id: projectId,
      added_at: new Date().toISOString(),
    };

    setFavorites((prev) => [optimisticFavorite, ...prev]);

    const { error: InsertError } = await supabaseClient
      .from("project_favorites")
      .insert({ user_id: Session.user.id, project_id: projectId });

    if (InsertError) {
      setFavorites((prev) =>
        prev.filter((item) => item.project_id !== projectId),
      );
      SetError(InsertError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function RemoveFavorite(projectId: Project["id"]) {
    if (!Session?.user.id || typeof projectId !== "number") return false;

    resetStates();

    const previous = Favorites;
    setFavorites((prev) => prev.filter((item) => item.project_id !== projectId));

    const { error: DeleteError } = await supabaseClient
      .from("project_favorites")
      .delete()
      .eq("user_id", Session.user.id)
      .eq("project_id", projectId);

    if (DeleteError) {
      setFavorites(previous);
      SetError(DeleteError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function ToggleFavorite(projectId: Project["id"]) {
    if (IsFavorited(projectId)) return RemoveFavorite(projectId);
    return AddFavorite(projectId);
  }

  return {
    Favorites,
    FavoriteProjectIds,
    IsFavorited,
    Loading,
    Error,
    AddFavorite,
    RemoveFavorite,
    ToggleFavorite,
  };
}
