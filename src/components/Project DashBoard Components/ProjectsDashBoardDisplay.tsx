import { useState } from "react";
import type { Building, House, Project } from "../../types/types";
import ProjectCard from "./ProjectCard";
import BuildingsCard from "./BuildingsCard";
import HouseCard from "./HouseCard";

type Functions = {
  UpdateProject: (
    updated_project: Project,
    projectId: Project["id"],
  ) => Promise<boolean>;
  RemoveProject: (projectId: Project["id"]) => Promise<boolean>;
  UpdateBuilding: (
    updated_building: Building,
    buildingId: Building["id"],
  ) => Promise<boolean>;
  RemoveBuilding: (buildingId: Building["id"]) => Promise<boolean>;
  UpdateHouse: (updated_house: House, houseId: House["id"]) => Promise<boolean>;
  RemoveHouse: (houseId: House["id"]) => Promise<boolean>;
};

type ProjectsDashBoardDisplayProps = {
  Projects: Project[];
  Buildings: Building[];
  Houses: House[];
} & Functions;

// Temp Styling
export default function ProjectsDashBoardDisplay({
  Buildings,
  Houses,
  Projects,
  RemoveBuilding,
  RemoveHouse,
  RemoveProject,
  UpdateBuilding,
  UpdateHouse,
  UpdateProject,
}: ProjectsDashBoardDisplayProps) {
  const [BuildingProjectID, setBuildingProjectID] =
    useState<Project["id"]>(undefined);
  const [HouseBuildingID, setHouseBuildingID] =
    useState<Building["id"]>(undefined);

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
          {Projects.length === 0 ? (
            <div>We currently have to no projects :(</div>
          ) : (
            <>
              {Projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  ToggleBuildingShow={ToggleBuildingShow}
                  project={project}
                  RemoveProject={RemoveProject}
                  UpdateProject={UpdateProject}
                />
              ))}
              {BuildingProjectID &&
                Buildings.map((building) => {
                  if (building.project_id !== BuildingProjectID) return;
                  return (
                    <BuildingsCard
                      key={building.id}
                      Building={building}
                      Projects={Projects}
                      setHouseBuildingID={setHouseBuildingID}
                      RemoveBuilding={RemoveBuilding}
                      UpdateBuilding={UpdateBuilding}
                    />
                  );
                })}
              {HouseBuildingID && (
                <>
                  {Houses.map((house) => {
                    if (house.building_id !== HouseBuildingID) return;
                    return (
                      <HouseCard
                        Buildings={Buildings}
                        house={house}
                        key={house.id}
                        RemoveHouse={RemoveHouse}
                        UpdateHouse={UpdateHouse}
                      />
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
