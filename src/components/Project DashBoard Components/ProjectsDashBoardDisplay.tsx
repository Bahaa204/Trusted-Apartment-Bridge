import { useState } from "react";
import type { Building, House, Project } from "../../types/types";
import ProjectCard from "./ProjectCard";
import BuildingsCard from "./BuildingsCard";
import HouseCard from "./HouseCard";
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
