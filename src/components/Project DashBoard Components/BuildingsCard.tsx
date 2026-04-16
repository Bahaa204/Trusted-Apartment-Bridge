import { useState } from "react";
import type {
  Building,
  BuildingInput,
  Image,
  Project,
} from "../../types/types";
import { DeleteImages, UploadImage } from "../../services/imageServices";
import Modal from "./Modal";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

type BuildingsCardProps = {
  Building: Building;
  Projects: Project[];
  IsHouseOpen: boolean;
  ToggleHouseShow: (buildingId: Building["id"]) => void;
  UpdateBuilding: (
    updated_building: Building,
    buildingId: Building["id"],
  ) => Promise<boolean>;
  RemoveBuilding: (buildingId: Building["id"]) => Promise<boolean>;
};

export default function BuildingsCard({
  Building,
  Projects,
  IsHouseOpen,
  ToggleHouseShow,
  RemoveBuilding,
  UpdateBuilding,
}: BuildingsCardProps) {
  const BUILDING_PLACEHOLDER_IMAGE =
    "https://placehold.co/820x360/1f2937/e5e7eb?text=No+Building+Image";

  const InitialValue: BuildingInput = {
    name: Building.name || "",
    block: Building.block || "",
    project_id: Building.project_id || NaN,
    images: null,
  };

  const [BuildingsInput, setBuildingsInput] =
    useState<BuildingInput>(InitialValue);
  const [EditMode, setEditMode] = useState<boolean>(false);
  const [IsOpen, setIsOpen] = useState<boolean>(false);

  const buildingImageSrc =
    Building.images[0]?.url || BUILDING_PLACEHOLDER_IMAGE;

  async function handleEdit() {
    const images = BuildingsInput.images;
    const building_images: Image[] = [];

    if (images) {
      for (const image of images) {
        const imageObj = await UploadImage(image, "buildings_images");
        if (imageObj) building_images.push(imageObj);
      }
    }

    const updatedBuilding: Building = {
      name: BuildingsInput.name,
      block: BuildingsInput.block,
      images: building_images || Building.images,
      project_id: BuildingsInput.project_id || Building.project_id,
    };

    const ok = await UpdateBuilding(updatedBuilding, Building.id);

    if (ok) setEditMode(false);
  }

  async function handleDelete() {
    const paths: string[] = [];

    Building.images.forEach((image) => paths.push(image.path));

    const ImagesOk = await DeleteImages(paths, "buildings_images");

    if (!ImagesOk)
      return alert(
        `Something went wrong while deleting images of ${Building.name}.`,
      );

    const ok = await RemoveBuilding(Building.id);

    if (ok) return alert("Building has been deleted");
  }

  return (
    <>
      <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg">
        <img
          src={buildingImageSrc}
          alt={`${Building.name} image`}
          className="w-full h-62.5 object-center bg-no-repeat bg-cover italic"
          onError={(event) => {
            event.currentTarget.src = BUILDING_PLACEHOLDER_IMAGE;
          }}
        />

        <CardHeader>
          <CardTitle>
            {EditMode ? (
              <Input
                type="text"
                className="border-slate-300 bg-white text-slate-900"
                value={BuildingsInput.name}
                onChange={(event) => {
                  setBuildingsInput((prev) => ({
                    ...prev,
                    name: event.target.value.trim(),
                  }));
                }}
              />
            ) : (
              Building.name
            )}
          </CardTitle>

          <CardDescription>
            {EditMode ? (
              <Input
                type="text"
                className="border-slate-300 bg-white text-slate-900"
                value={BuildingsInput.block}
                onChange={(event) => {
                  setBuildingsInput((prev) => ({
                    ...prev,
                    block: event.target.value.trim(),
                  }));
                }}
              />
            ) : (
              Building.block
            )}
          </CardDescription>

          <CardAction className="flex flex-col justify-center items-center gap-2.5">
            <Button
              variant="destructive"
              size="lg"
              className="cursor-pointer bg-red-600 text-white hover:bg-red-500"
              onClick={() => setIsOpen(true)}
            >
              Delete Building
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
              {EditMode ? "Submit Edits" : "Edit Building"}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <p>
            {EditMode ? (
              <>
                <strong>Select a Project: </strong>
                <Select
                  value={String(BuildingsInput.project_id ?? "")}
                  onValueChange={(value) => {
                    setBuildingsInput((prev) => ({
                      ...prev,
                      project_id: parseInt(value),
                    }));
                  }}
                >
                  <SelectTrigger className="w-full border-slate-300 bg-white text-slate-900">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {Projects.map((project) => (
                      <SelectItem value={String(project.id)} key={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <strong>Project Name: </strong>
                {
                  Projects.find((project) => project.id === Building.project_id)
                    ?.name
                }
              </>
            )}
          </p>

          <p>
            {EditMode ? (
              <>
                <strong>Building Images:</strong>
                <Input
                  type="file"
                  multiple
                  accept="images/*"
                  className="mt-1 cursor-pointer border-slate-300 bg-white text-slate-900 file:text-slate-700"
                  onChange={(event) => {
                    setBuildingsInput((prev) => ({
                      ...prev,
                      images: event.target.files,
                    }));
                  }}
                />
              </>
            ) : (
              <>
                <strong>Building added at:</strong>
                {Building.added_at?.split("T")[0]}
              </>
            )}
          </p>
        </CardContent>

        <CardFooter>
          <Button
            variant="default"
            size="lg"
            className="w-full cursor-pointer bg-[#173b67] font-semibold text-white hover:bg-[#24507f]"
            onClick={() => ToggleHouseShow(Building.id)}
          >
            {IsHouseOpen ? "Hide Houses" : "See Houses"}
          </Button>
        </CardFooter>
      </Card>

      <Modal
        Open={IsOpen}
        setOpen={setIsOpen}
        handleDelete={handleDelete}
        text={Building.name}
      />
    </>
  );
}
