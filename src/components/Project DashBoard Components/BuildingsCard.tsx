import { useState } from "react";
import type {
  Building,
  BuildingInput,
  Image,
  Project,
  UpdaterFunction,
} from "../../types/types";
import { DeleteImages, UploadImage } from "../../services/imageServices";
import Modal from "./Modal";

type BuildingsCardProps = {
  Building: Building;
  Projects: Project[];
  setHouseBuildingID: UpdaterFunction<Building["id"]>;
  UpdateBuilding: (
    updated_building: Building,
    buildingId: Building["id"],
  ) => Promise<boolean>;
  RemoveBuilding: (buildingId: Building["id"]) => Promise<boolean>;
};

export default function BuildingsCard({
  Building,
  Projects,
  setHouseBuildingID,
  RemoveBuilding,
  UpdateBuilding,
}: BuildingsCardProps) {
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
      <div
        className="bg-white text-black flex flex-col justify-center items-center gap-2.5 text-center p-4 rounded-2xl"
        key={Building.id}
      >
        <div className="size-full flex flex-wrap justify-center items-center italic">
          <img
            src={Building.images[0].url || undefined}
            alt="building Image"
            className="size-9/12 rounded-lg"
          />
        </div>
        <div className="flex flex-col flex-wrap justify-center items-center gap-2.5">
          <p>
            <strong>Building Name: </strong>
            {EditMode ? (
              <input
                type="text"
                className="border border-black rounded disabled:cursor-not-allowed size-full"
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
          </p>
          <p>
            <strong>Building Block: </strong>{" "}
            {EditMode ? (
              <input
                type="text"
                className="border border-black rounded disabled:cursor-not-allowed size-full"
                value={BuildingsInput.name}
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
          </p>
          <p>
            {EditMode ? (
              <>
                <strong>Select a Project: </strong>
                <select
                  value={BuildingsInput.project_id}
                  className="border border-black rounded cursor-pointer disabled:cursor-not-allowed size-full"
                  onChange={(event) => {
                    setBuildingsInput((prev) => ({
                      ...prev,
                      project_id: parseInt(event.target.value),
                    }));
                  }}
                >
                  {Projects.map((project) => (
                    <option value={project.id} key={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
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
                <strong>Building Images: </strong>
                <input
                  type="file"
                  accept="images/*"
                  className="border border-black rounded cursor-pointer disabled:cursor-not-allowed size-full"
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
                <strong>Building Added At: </strong>
                {Building.added_at?.split("T")[0]}
              </>
            )}
          </p>
          <button
            type="button"
            className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={() =>
              setHouseBuildingID((prev) => (prev ? undefined : Building.id))
            }
          >
            See Houses
          </button>
          <button
            type="button"
            className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={() => {
              if (EditMode) return handleEdit();
              return setEditMode((prev) => !prev);
            }}
          >
            {EditMode ? "Submit Edits" : "Edit Building"}
          </button>
          <button
            type="button"
            className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Delete Building
          </button>
        </div>
      </div>

      <Modal
        Open={IsOpen}
        setopen={setIsOpen}
        id={Building.id}
        handleDelete={handleDelete}
        text={Building.name}
      />
    </>
  );
}
