import { useState } from "react";
import type { Country, Image, Project, ProjectsInput } from "../../types/types";
import { DeleteImages, UploadImage } from "../../services/imageServices";
import Modal from "./Modal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
  CardFooter,
} from "../ui/card";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

type ProjectCardsProps = {
  project: Project;
  Countries: Country[];
  IsBuildingOpen: boolean;
  ToggleBuildingShow: (projectId: Project["id"]) => void;
  UpdateProject: (
    updated_project: Project,
    projectId: Project["id"],
  ) => Promise<boolean>;
  RemoveProject: (projectId: Project["id"]) => Promise<boolean>;
};

export default function ProjectCard({
  project,
  Countries,
  IsBuildingOpen,
  ToggleBuildingShow,
  RemoveProject,
  UpdateProject,
}: ProjectCardsProps) {
  const PROJECT_PLACEHOLDER_IMAGE =
    "https://placehold.co/820x360/1f2937/e5e7eb?text=No+Project+Image";

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

  const projectImageSrc = project.images[0]?.url || PROJECT_PLACEHOLDER_IMAGE;

  async function handleEdit() {
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

    const ok = await UpdateProject(updatedProject, project.id);

    if (ok) setEditMode(false);
  }

  async function handleDelete() {
    const paths: string[] = [];

    project.images.forEach((image) => paths.push(image.path));

    const ImagesOk = await DeleteImages(paths, "projects_images");

    if (!ImagesOk)
      return alert(
        `Something went wrong while deleting images of ${project.name}.`,
      );

    const ok = await RemoveProject(project.id);

    if (ok) return alert("Project has been deleted");
  }

  return (
    <>
      <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg">
        <img
          src={projectImageSrc}
          alt={`${project.name} image`}
          className="w-full h-62.5 object-center bg-no-repeat bg-cover italic"
          onError={(event) => {
            event.currentTarget.src = PROJECT_PLACEHOLDER_IMAGE;
          }}
        />
        <CardHeader>
          <CardTitle>
            {EditMode ? (
              <Input
                type="text"
                className="border-slate-300 bg-white text-slate-900"
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
          </CardTitle>
          <CardDescription>
            {EditMode ? (
              <Textarea
                className="border-slate-300 bg-white text-slate-900"
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
          </CardDescription>
          <CardAction className="flex flex-col justify-center items-center gap-2.5">
            <Button
              variant="destructive"
              size="lg"
              className="cursor-pointer bg-red-600 text-white hover:bg-red-500"
              onClick={() => setIsOpen(true)}
            >
              Delete Project
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="cursor-pointer border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"
              onClick={() => {
                if (EditMode) return handleEdit();
                return setEditMode((prev) => !prev);
              }}
            >
              {EditMode ? "Submit Edits" : "Edit Project"}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <p>
            <strong>Project Location:</strong>
            {EditMode ? (
              <Input
                type="text"
                className="mt-1 border-slate-300 bg-white text-slate-900"
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
                <strong>Select a Country: </strong>
                <Select
                  value={String(ProjectsInput.country_id ?? "")}
                  onValueChange={(value) => {
                    setProjectsInput((prev) => ({
                      ...prev,
                      country_id: parseInt(value),
                    }));
                  }}
                >
                  <SelectTrigger className="w-full border-slate-300 bg-white text-slate-900">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Countries.map((country) => (
                      <SelectItem value={String(country.id)} key={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <strong>Country Name: </strong>
                {
                  Countries.find((country) => country.id === project.country_id)
                    ?.name
                }
              </>
            )}
          </p>
          <p>
            {EditMode ? (
              <>
                <strong>Project Images:</strong>
                <Input
                  type="file"
                  multiple
                  accept="images/*"
                  className="mt-1 cursor-pointer border-slate-300 bg-white text-slate-900 file:text-slate-700"
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
        </CardContent>
        <CardFooter>
          <Button
            variant="default"
            size="lg"
            className="w-full cursor-pointer bg-[#173b67] font-semibold text-white hover:bg-[#24507f]"
            onClick={() => ToggleBuildingShow(project.id)}
          >
            {IsBuildingOpen ? "Hide Buildings" : "See Buildings"}
          </Button>
        </CardFooter>
      </Card>

      <Modal
        Open={IsOpen}
        setOpen={setIsOpen}
        handleDelete={handleDelete}
        text={project.name}
      />
    </>
  );
}
