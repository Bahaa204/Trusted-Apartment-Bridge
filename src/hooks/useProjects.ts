import { useEffect, useState } from "react";
import type { Project } from "../types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";

export function useProjects() {
  const [Projects, setProjects] = useState<Project[]>([]);
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
    async function fetchProjects() {
      resetStates();

      const { data, error: FetchError } = await supabaseClient
        .from("projects")
        .select("*");

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setProjects(data || []);
      setLoading(false);
    }

    fetchProjects();

    const channel = supabaseClient.channel("Projects-Channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "projects" },
        (payload) => {
          const newProject = payload.new as Project;

          setProjects((prev) => [...prev, newProject]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects" },
        (payload) => {
          const updatedProject = payload.new as Project;

          setProjects((prev) =>
            prev.map((project) =>
              project.id === updatedProject.id ? updatedProject : project,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "projects" },
        (payload) => {
          const deletedProject = payload.old as Project;

          setProjects((prev) =>
            prev.filter((project) => project.id !== deletedProject.id),
          );
        },
      )
      .subscribe((status) => {
        console.log("Projects Channel:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  async function AddProject(new_project: Project) {
    resetStates();

    const { error: InsertError } = await supabaseClient
      .from("projects")
      .insert(new_project)
      .single();

    if (InsertError) {
      SetError(InsertError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function UpdateProject(
    updated_project: Project,
    projectId: Project["id"],
  ) {
    resetStates();

    const { error: UpdateError } = await supabaseClient
      .from("projects")
      .update(updated_project)
      .eq("id", projectId);

    if (UpdateError) {
      SetError(UpdateError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function RemoveProject(projectId: Project["id"]) {
    resetStates();

    const { error: DeleteError } = await supabaseClient
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (DeleteError) {
      SetError(DeleteError);
      return false;
    }

    setLoading(false);
    return true;
  }

  return { Projects, Loading, Error, AddProject, UpdateProject, RemoveProject };
}
