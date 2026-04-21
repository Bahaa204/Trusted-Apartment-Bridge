import { useState } from "react";
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
import type {
  Project,
  ProjectCardsProps,
  ProjectsInput,
} from "@/types/projects";
import type { Image } from "@/types/types";
import { DeleteImages, UploadImage } from "@/services/imageServices";

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
    handover_date: project.handover_date || null,
    expected_roi_note: project.expected_roi_note || null,
    map_url: project.map_url || null,
    map_embed_url: project.map_embed_url || null,
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
      images: project_images.length > 0 ? project_images : project.images,
      handover_date: ProjectsInput.handover_date || null,
      expected_roi_note: ProjectsInput.expected_roi_note || null,
      map_url: ProjectsInput.map_url || null,
      map_embed_url: ProjectsInput.map_embed_url || null,
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
      <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg h-150">
        <img
          src={projectImageSrc}
          alt={`${project.name} image`}
          className="size-full object-center bg-no-repeat bg-cover italic"
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
                placeholder="Project Name"
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
                placeholder="Project Description"
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
            {EditMode && (
              <Button
                variant="secondary"
                size="lg"
                className="cursor-pointer border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"
                onClick={() => setEditMode(false)}
              >
                Cancel Edits
              </Button>
            )}
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
                placeholder="Project Location"
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
                  accept="image/*"
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
          <p>
            <strong>Handover Date: </strong>
            {EditMode ? (
              <Input
                type="date"
                className="mt-1 border-slate-300 bg-white text-slate-900"
                value={ProjectsInput.handover_date || ""}
                onChange={(event) => {
                  setProjectsInput((prev) => ({
                    ...prev,
                    handover_date: event.target.value || null,
                  }));
                }}
              />
            ) : project.handover_date ? (
              new Date(project.handover_date).toLocaleDateString()
            ) : (
              "N/A"
            )}
          </p>
          <p>
            <strong>ROI/Yield Note: </strong>
            {EditMode ? (
              <Textarea
                className="mt-1 border-slate-300 bg-white text-slate-900"
                value={ProjectsInput.expected_roi_note || ""}
                onChange={(event) => {
                  setProjectsInput((prev) => ({
                    ...prev,
                    expected_roi_note: event.target.value,
                  }));
                }}
              />
            ) : (
              project.expected_roi_note || "N/A"
            )}
          </p>
          <p>
            <strong>Map URL: </strong>
            {EditMode ? (
              <Input
                type="url"
                className="mt-1 border-slate-300 bg-white text-slate-900"
                value={ProjectsInput.map_url || ""}
                onChange={(event) => {
                  setProjectsInput((prev) => ({
                    ...prev,
                    map_url: event.target.value,
                  }));
                }}
              />
            ) : project.map_url ? (
              <a
                href={project.map_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#173b67] underline"
              >
                Open Map
              </a>
            ) : (
              "N/A"
            )}
          </p>
          {!EditMode && (
            <p>
              <strong>Project added at:</strong>
              {project.added_at?.split("T")[0]}
            </p>
          )}
        </CardContent>
        {!EditMode && (
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
        )}
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
