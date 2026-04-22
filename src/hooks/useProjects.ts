import { useEffect, useState } from "react";
import type { Data } from "../types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";
import type { Project } from "@/types/projects";

/**
 * Custom hook to manage projects data and operations.
 * @returns An object containing the list of projects, loading state, error message, and functions to manage projects.
 * @example
 * const { Projects, Loading, Error, AddProject, UpdateProject, RemoveProject } = useProjects();
 */
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
    /**
     * Fetches the list of projects from the database
     * and updates the state accordingly. If an error occurs during fetching, it sets the error message and updates the loading state.
     */
    async function fetchProjects() {
      resetStates();

      const { data, error: FetchError } = (await supabaseClient
        .from("projects")
        .select("*")) as Data<Project[]>;

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setProjects(data || []);
      setLoading(false);
    }

    fetchProjects();

    const channel = supabaseClient.channel("Projects-Channel");

    /**
     * Sets up real-time listeners for changes in the "projects" table.
     */
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

  /**
   * Adds a new project to the database.
   * @param new_project - The new project to be added to the database. It should be an object of type Project containing the necessary fields.
   * @returns A promise resolving to a boolean.
   */
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

  /**
   * Updates an existing project in the database.
   * @param updated_project - The updated project data to be saved in the database. It should be an object of type Project containing the necessary fields, including the id of the project to be updated.
   * @param projectId - The id of the project to be updated.
   * @returns A promise resolving to a boolean.
   */
  async function UpdateProject(
    updated_project: Partial<Project>,
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

  /**
   * Removes a project from the database.
   * @param projectId - The id of the project to be removed from the database.
   * @returns A promise resolving to a boolean.
   */
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
