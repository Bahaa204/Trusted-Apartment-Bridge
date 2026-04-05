import { useState } from "react";
import type { Image, Project, ProjectsInput } from "../../types/types";
import { UploadImage } from "../../services/imageServices";
import Modal from "./Modal";

type ProjectCardsProps = {
  project: Project;
  ToggleBuildingShow: (projectId: Project["id"]) => void;
  UpdateProject: (
    updated_project: Project,
    projectId: Project["id"],
  ) => Promise<boolean>;
  RemoveProject: (projectId: Project["id"]) => Promise<boolean>;
};

export default function ProjectCard({
  ToggleBuildingShow,
  project,
  RemoveProject,
  UpdateProject,
}: ProjectCardsProps) {
  const InitialValue: ProjectsInput = {
    name: project.name || "",
    description: project.description || "",
    location: project.location || "",
    country_id: project.country_id || NaN,
    images: null,
  };

  const [EditMode, setEditMode] = useState<boolean>(false);
  const [ProjectsInput, setProjectsInput] =
    useState<ProjectsInput>(InitialValue);
  const [IsOpen, setIsOpen] = useState<boolean>(false);

  async function handleEdit(projectId: Project["id"]) {
    const images = ProjectsInput.images;
    const project_images: Image[] = [];

    if (images) {
      for (const image of images) {
        const imageObj = await UploadImage(image, "projects_images");
        if (imageObj) project_images.push(imageObj);
      }
    }
    const updatedProject: Project = {
      name: ProjectsInput.name,
      description: ProjectsInput.description,
      location: ProjectsInput.location,
      country_id: ProjectsInput.country_id,
      images: project_images || project.images,
    };

    const ok = await UpdateProject(updatedProject, projectId);

    if (ok) setEditMode(false);
  }

  async function handleDelete(projectId: Project["id"]) {
    const ok = await RemoveProject(projectId);

    if (ok) return alert("Project has been deleted");
  }

  return (
    <>
      <div
        key={project.id}
        className="bg-white text-black flex flex-col justify-center items-center gap-2.5 text-center p-4 rounded-2xl"
      >
        <div className="size-full flex flex-wrap justify-center items-center italic">
          <img
            src={project.images[0].url || undefined}
            alt={`${project.name} image`}
            className="size-9/12 rounded-lg"
          />
        </div>
        <div className="flex flex-col flex-wrap justify-center items-center gap-2.5">
          <p>
            <strong>Project Name:</strong>
            {EditMode ? (
              <input
                type="text"
                className="border border-black rounded disabled:cursor-not-allowed size-full"
                value={ProjectsInput.name}
                onChange={(event) => {
                  setProjectsInput((prev) => ({
                    ...prev,
                    name: event.target.value.trim(),
                  }));
                }}
              />
            ) : (
              project.name
            )}
          </p>
          <p>
            <strong>Project Description:</strong>
            {EditMode ? (
              <input
                type="text"
                className="border border-black rounded disabled:cursor-not-allowed size-full"
                value={ProjectsInput.description}
                onChange={(event) => {
                  setProjectsInput((prev) => ({
                    ...prev,
                    description: event.target.value.trim(),
                  }));
                }}
              />
            ) : (
              project.description
            )}
          </p>
          <p>
            <strong>Project Location:</strong>
            {EditMode ? (
              <input
                type="text"
                className="border border-black rounded disabled:cursor-not-allowed size-full"
                value={ProjectsInput.location}
                onChange={(event) => {
                  setProjectsInput((prev) => ({
                    ...prev,
                    location: event.target.value.trim(),
                  }));
                }}
              />
            ) : (
              project.location
            )}
          </p>
          <p>
            {EditMode ? (
              <>
                <strong>Project Images:</strong>
                <input
                  type="file"
                  multiple
                  accept="images/*"
                  className="border border-black rounded cursor-pointer disabled:cursor-not-allowed size-full"
                  onChange={(event) => {
                    setProjectsInput((prev) => ({
                      ...prev,
                      images: event.target.files,
                    }));
                  }}
                />
              </>
            ) : (
              <>
                <strong>Project Visits:</strong> {project.nb_visits}
              </>
            )}
          </p>
          {!EditMode && (
            <p>
              <strong>Project added at:</strong>
              {project.added_at?.split("T")[0]}
            </p>
          )}
          <button
            type="button"
            className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={() => {
              ToggleBuildingShow(project.id);
            }}
          >
            See Buildings
          </button>
          <button
            type="button"
            className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={() => {
              if (EditMode) return handleEdit(project.id);
              return setEditMode((prev) => !prev);
            }}
          >
            {EditMode ? "Submit Edits" : "Edit Project"}
          </button>
          <button
            type="button"
            className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Delete Project
          </button>
        </div>
      </div>

      <Modal
        Open={IsOpen}
        setopen={setIsOpen}
        id={project.id}
        handleDelete={handleDelete}
        text={project.name}
      />
    </>
  );
}
