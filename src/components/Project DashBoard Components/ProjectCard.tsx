import { useState } from "react";
import type { Project, ProjectsInput } from "../../types/types";
import { useProjects } from "../../hooks/useProjects";
import { UploadImage } from "../../services/imageServices";

type ProjectCardsProps = {
  project: Project;
  ToggleBuildingShow: (projectId: Project["id"]) => void;
};

export default function ProjectCard({
  ToggleBuildingShow,
  project,
}: ProjectCardsProps) {
  const InitialValue: ProjectsInput = {
    name: project.name || "",
    description: project.description || "",
    location: project.location || "",
    images: null,
    starting_price: project.starting_price || NaN,
  };

  const [EditMode, setEditMode] = useState<boolean>(false);
  const [ProjectsInput, setProjectsInput] =
    useState<ProjectsInput>(InitialValue);

  const { UpdateProject } = useProjects();

  async function handleEdit(projectId: Project["id"]) {
    const images = ProjectsInput.images;
    const images_url: string[] = [];

    if (!images) return;

    for (const image of images) {
      const imageUrl = await UploadImage(image);
      if (imageUrl) images_url.push(imageUrl);
    }

    const updatedProject: Project = {
      name: ProjectsInput.name,
      description: ProjectsInput.description,
      location: ProjectsInput.location,
      images_url: images_url || project.images_url,
      starting_price: ProjectsInput.starting_price,
    };

    const ok = await UpdateProject(updatedProject, projectId);

    if (ok) alert("Edited Successful");
  }

  return (
    <div
      key={project.id}
      className="bg-white text-black flex flex-col justify-center items-center gap-2.5 text-center p-4 rounded-2xl"
    >
      <div className="size-full flex flex-wrap justify-center items-center italic">
        <img
          src={project.images_url[0]}
          alt="Project Image"
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
        <p>
          <strong>Project Starting Price:</strong>
          {EditMode ? (
            <input
              type="number"
              className="border border-black rounded disabled:cursor-not-allowed size-full"
              value={ProjectsInput.starting_price}
              onChange={(event) => {
                setProjectsInput((prev) => ({
                  ...prev,
                  starting_price: parseInt(event.target.value.trim()) || NaN,
                }));
              }}
            />
          ) : (
            project.starting_price
          )}
        </p>
        {!EditMode && (
          <p>
            <strong>Project added at:</strong> {project.added_at?.split("T")[0]}
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
        {EditMode ? (
          <button
            type="button"
            className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={() => handleEdit(project.id)}
          >
            Submit Edits
          </button>
        ) : (
          <button
            type="button"
            className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={() => {
              setEditMode((prev) => !prev);
            }}
          >
            Edit Project
          </button>
        )}
      </div>
    </div>
  );
}
