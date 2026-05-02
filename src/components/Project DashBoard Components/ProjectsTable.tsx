import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Project,
  ProjectFormValues,
  ProjectsTableProps,
} from "@/types/projects";
import { Button } from "../ui/button";
import { useState } from "react";
import Modal from "./Modal";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import type { Image } from "@/types/types";
import { DeleteImages, UploadImage } from "@/services/imageServices";

export default function ProjectsTable({
  projects,
  countries,
  RemoveProject,
  EditProject,
}: ProjectsTableProps) {
  const InitialValue: ProjectFormValues = {
    name: "",
    description: "",
    location: "",
    country_id: NaN,
    expected_roi_note: null,
    handover_date: null,
    map_url: null,
    images: null,
  };

  const [EditId, setEditId] = useState<Project["id"] | null>(null);
  const [EditValues, setEditValues] = useState<ProjectFormValues>(InitialValue);
  const [DeleteProject, setDeleteProject] = useState<Project | null>(null);
  const [IsOpen, setIsOpen] = useState<boolean>(false);
  const [ErrorNotice, setErrorNotice] = useState<string>("");

  function startEditing(project: Project) {
    setEditId(project.id);
    setEditValues({
      name: project.name,
      description: project.description,
      location: project.location,
      country_id: project.country_id,
      expected_roi_note: project.expected_roi_note,
      handover_date: project.handover_date,
      map_url: project.map_url,
      images: null,
    });
  }

  function cancelEditing() {
    setEditId(null);
    setEditValues(InitialValue);
  }

  function UpdateFields(fields: Partial<ProjectFormValues>) {
    setEditValues((prev) => ({ ...prev, ...fields }));
  }

  async function handleEdit(project: Project) {
    const images = EditValues.images;
    const project_images: Image[] = [];

    if (images) {
      for (const image of images) {
        const imageObj = await UploadImage(image, "projects_images");
        if (imageObj) project_images.push(imageObj);
      }
    }
    const updatedProject: Project = {
      name: EditValues.name,
      description: EditValues.description,
      location: EditValues.location,
      country_id: EditValues.country_id,
      images: project_images.length > 0 ? project_images : project.images,
      handover_date: EditValues.handover_date || null,
      expected_roi_note: EditValues.expected_roi_note || null,
      map_url: EditValues.map_url || null,
    };

    const ok = await EditProject(updatedProject, project.id);

    if (ok) cancelEditing();
  }

  async function handleDelete(project: Project) {
    const paths: string[] = [];

    project.images.forEach((image) => paths.push(image.path));

    const ImagesOk = await DeleteImages(paths, "projects_images");

    if (!ImagesOk)
      return setErrorNotice(
        `Something went wrong while deleting images of ${project.name}.`,
      );

    const ok = await RemoveProject(project.id);

    if (ok) return alert("Project has been deleted");
  }

  return (
    <>
      <Table className="no-scrollbar">
        <TableCaption>
          Showing {projects.length} projects that TAB offer
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Description</TableHead>
            <TableHead className="text-center">Location</TableHead>
            <TableHead className="text-center">Country</TableHead>
            <TableHead className="text-center">{EditId ? "Upload Images":"Number of Visits"}</TableHead>
            <TableHead className="text-center">Handover Date</TableHead>
            <TableHead className="text-center">ROI/Yield Note</TableHead>
            <TableHead className="text-center">Map Url</TableHead>
            <TableHead className="text-center">Added At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="no-scrollbar">
          {projects.map((project, index) => {
            const isEditing = EditId === project.id;
            return (
              <TableRow
                className="hover:bg-[#24507f] hover:text-white"
                key={project.id}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="text"
                      className="border-slate-300 bg-white text-slate-900"
                      placeholder="Project Name"
                      value={EditValues.name}
                      onChange={(event) => {
                        UpdateFields({ name: event.target.value });
                      }}
                    />
                  ) : (
                    project.name
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Textarea
                      className="border-slate-300 bg-white text-slate-900"
                      value={EditValues.description}
                      placeholder="Project Description"
                      onChange={(event) => {
                        UpdateFields({ description: event.target.value });
                      }}
                    />
                  ) : (
                    project.description
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="text"
                      className="mt-1 border-slate-300 bg-white text-slate-900"
                      value={EditValues.location}
                      placeholder="Project Location"
                      onChange={(event) => {
                        UpdateFields({ location: event.target.value });
                      }}
                    />
                  ) : (
                    project.location
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={String(EditValues.country_id ?? "")}
                      onValueChange={(value) => {
                        UpdateFields({ country_id: parseInt(value) });
                      }}
                    >
                      <SelectTrigger className="w-full border-slate-300 bg-white text-slate-900">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select a Country</SelectLabel>
                          {countries.map((country) => (
                            <SelectItem
                              value={String(country.id)}
                              key={country.id}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    countries.find(
                      (country) => country.id === project.country_id,
                    )?.name
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      className="mt-1 cursor-pointer border-slate-300 bg-white text-slate-900 file:text-slate-700 w-55"
                      onChange={(event) => {
                        UpdateFields({ images: event.target.files });
                      }}
                    />
                  ) : (
                    project.nb_visits
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="date"
                      className="mt-1 border-slate-300 bg-white text-slate-900"
                      value={EditValues.handover_date || ""}
                      min={new Date().toLocaleDateString("en-CA")}
                      onChange={(event) => {
                        UpdateFields({ handover_date: event.target.value });
                      }}
                    />
                  ) : project.handover_date ? (
                    new Date(project.handover_date).toLocaleDateString()
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Textarea
                      className="mt-1 border-slate-300 bg-white text-slate-900"
                      value={EditValues.expected_roi_note || ""}
                      onChange={(event) => {
                        UpdateFields({ expected_roi_note: event.target.value });
                      }}
                    />
                  ) : (
                    project.expected_roi_note || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Textarea
                      className="mt-1 border-slate-300 bg-white text-slate-900"
                      value={EditValues.map_url || ""}
                      onChange={(event) => {
                        UpdateFields({ map_url: event.target.value });
                      }}
                    />
                  ) : project.map_url ? (
                    <Button variant="secondary">
                      <a
                        href={project.map_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Map
                      </a>
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {project.added_at?.split("T")[0] || "N/A"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="cursor-pointer">
                      <Button variant="secondary">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="focus:bg-none"
                    >
                      {!isEditing && (
                        <>
                          <DropdownMenuItem>
                            <Button
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => startEditing(project)}
                            >
                              Edit
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {isEditing && (
                        <>
                          <DropdownMenuItem>
                            <Button
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => handleEdit(project)}
                            >
                              Submit Edits
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {isEditing && (
                        <DropdownMenuItem>
                          <Button
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={cancelEditing}
                          >
                            Cancel Edits
                          </Button>
                        </DropdownMenuItem>
                      )}
                      {!isEditing && (
                        <DropdownMenuItem variant="destructive">
                          <Button
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => {
                              setIsOpen(true);
                              setDeleteProject(project);
                            }}
                          >
                            Delete
                          </Button>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow>
            <TableCell colSpan={11} align="center">
              {ErrorNotice}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Modal
        Open={IsOpen}
        setOpen={setIsOpen}
        handleDelete={async () => await handleDelete(DeleteProject!)}
        text={DeleteProject?.name || "Project"}
      />
    </>
  );
}
