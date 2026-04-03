import { useState } from "react";
import type {
  Building,
  BuildingInput,
  House,
  Project,
} from "../../types/types";
import ProjectCard from "./ProjectCard";
// import Modal from "./Modal";

type ProjectsDashBoardDisplayProps = {
  Projects: Project[];
  Buildings: Building[];
  Houses: House[];
};

// Temp Styling
export default function ProjectsDashBoardDisplay({
  Buildings,
  Houses,
  Projects,
}: ProjectsDashBoardDisplayProps) {
  const [BuildingProjectID, setBuildingProjectID] =
    useState<Project["id"]>(undefined);
  const [HouseBuildingID, setHouseBuildingID] =
    useState<Building["id"]>(undefined);

  const [BuildingsInput, setBuildingsInput] = useState<BuildingInput>({
    name: "",
    block: "",
    project_id: NaN,
    images: null,
  });

  function ToggleBuildingShow(projectId: Project["id"]) {
    if (BuildingProjectID) {
      setHouseBuildingID(undefined);
      setBuildingProjectID(undefined);
      return;
    }
    setBuildingProjectID(projectId);
  }

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center items-center gap-4 bg-gray-900 text-white">
        <h3>View Current Projects:</h3>
        <div className="grid grid-cols-5 grid-rows-5 justify-center items-center gap-4">
          {Projects.map((project) => (
            <ProjectCard
              key={project.id}
              ToggleBuildingShow={ToggleBuildingShow}
              project={project}
            />
          ))}
          {BuildingProjectID && (
            <>
              {Buildings.map((building) => {
                if (building.project_id !== BuildingProjectID) return;
                return (
                  <div
                    className="bg-white text-black flex flex-col justify-center items-center gap-2.5 text-center p-4 rounded-2xl"
                    key={building.id}
                  >
                    <div className="size-full flex flex-wrap justify-center items-center italic">
                      <img
                        src={building.images_url[0]}
                        alt="building Image"
                        className="size-9/12 rounded-lg"
                      />
                    </div>
                    <div className="flex flex-col flex-wrap justify-center items-center gap-2.5">
                      <p>
                        <strong>Building Name: </strong> {building.name}
                      </p>
                      <p>
                        <strong>Building Block: </strong> {building.block}
                      </p>
                      <p>
                        <strong>Building Project Name: </strong>
                        {
                          Projects.find(
                            (project) => project.id === building.project_id,
                          )?.name
                        }
                      </p>
                      <p>
                        <strong>Building Added At: </strong>{" "}
                        {building.added_at?.split("T")[0]}
                      </p>
                      <button
                        type="button"
                        className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
                        onClick={() =>
                          setHouseBuildingID((prev) =>
                            prev ? undefined : building.id,
                          )
                        }
                      >
                        See Houses
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {HouseBuildingID && (
            <>
              {Houses.map((house) => {
                if (house.building_id !== HouseBuildingID) return;
                return (
                  <div
                    className="bg-white text-black flex flex-col justify-center items-center gap-2.5 text-center p-4 rounded-2xl"
                    key={house.id}
                  >
                    <div className="flex flex-col flex-wrap justify-center items-center gap-2.5">
                      <p>
                        <strong>House Floor: </strong> {house.floor}
                      </p>
                      <p>
                        <strong>Number of Bathrooms: </strong>
                        {house.nb_bathrooms}
                      </p>
                      <p>
                        <strong>Number of Bedrooms: </strong>
                        {house.nb_bedrooms}
                      </p>
                      <p>
                        <strong>Building Name: </strong>
                        {
                          Buildings.find(
                            (building) => building.id === house.building_id,
                          )?.name
                        }
                      </p>
                      <p>
                        <strong>House Added At: </strong>{" "}
                        {house.added_at?.split("T")[0]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
