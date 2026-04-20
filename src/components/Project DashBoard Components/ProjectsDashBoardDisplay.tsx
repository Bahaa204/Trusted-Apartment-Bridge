import { useState } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import BuildingsCard from "./BuildingsCard";
import HouseCard from "./HouseCard";
import ProjectCard from "./ProjectCard";
import type { Project, ProjectsDashBoardDisplayProps } from "@/types/projects";
import type { Building } from "@/types/building";

// Temp Styling
export default function ProjectsDashBoardDisplay({
  Buildings,
  Houses,
  Projects,
  Countries,
  RemoveBuilding,
  RemoveHouse,
  RemoveProject,
  UpdateBuilding,
  UpdateHouse,
  UpdateProject,
}: ProjectsDashBoardDisplayProps) {
  const [OpenProjectIDs, setOpenProjectIDs] = useState<
    NonNullable<Project["id"]>[]
  >([]);
  const [OpenBuildingIDs, setOpenBuildingIDs] = useState<
    NonNullable<Building["id"]>[]
  >([]);

  function ToggleBuildingShow(projectId: Project["id"]) {
    if (typeof projectId !== "number") return;

    const projectBuildingIDs = Buildings.filter(
      (building) => building.project_id === projectId,
    )
      .map((building) => building.id)
      .filter((id): id is number => typeof id === "number");

    setOpenProjectIDs((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );

    setOpenBuildingIDs((prev) =>
      prev.filter((id) => !projectBuildingIDs.includes(id)),
    );
  }

  function ToggleHouseShow(buildingId: Building["id"]) {
    if (typeof buildingId !== "number") return;

    setOpenBuildingIDs((prev) =>
      prev.includes(buildingId)
        ? prev.filter((id) => id !== buildingId)
        : [...prev, buildingId],
    );
  }

  return (
    <>
      <Card className="flex flex-col flex-wrap justify-center items-center gap-4 border border-slate-200 bg-white text-slate-900 shadow-lg">
        <CardTitle className="pt-2 text-center text-2xl text-slate-900 md:text-3xl">
          Projects Display
        </CardTitle>
        <CardDescription className="text-center text-base text-slate-600 md:text-lg">
          Here you can view, edit, and delete all projects, buildings, and
          houses.
        </CardDescription>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center items-start gap-4 w-full">
          {Projects.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
              We currently have no projects.
            </div>
          ) : (
            <>
              {Projects.map((project) =>
                (() => {
                  if (typeof project.id !== "number") return null;

                  return (
                    <div
                      key={project.id}
                      className={
                        OpenProjectIDs.includes(project.id)
                          ? "md:col-span-2 xl:col-span-3"
                          : ""
                      }
                    >
                      {OpenProjectIDs.includes(project.id) ? (
                        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-3 items-start">
                          <ProjectCard
                            IsBuildingOpen={true}
                            ToggleBuildingShow={ToggleBuildingShow}
                            project={project}
                            Countries={Countries}
                            RemoveProject={RemoveProject}
                            UpdateProject={UpdateProject}
                          />

                          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              Buildings
                            </h3>
                            <p className="text-sm text-slate-600">
                              {project.name}
                            </p>

                            {Buildings.filter(
                              (building) => building.project_id === project.id,
                            ).length === 0 ? (
                              <p className="text-sm text-slate-600">
                                No buildings found for this project.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-3">
                                {Buildings.filter(
                                  (building) =>
                                    building.project_id === project.id,
                                ).map((building) => {
                                  if (typeof building.id !== "number")
                                    return null;

                                  const buildingHouses = Houses.filter(
                                    (house) =>
                                      house.building_id === building.id,
                                  );

                                  return (
                                    <div
                                      key={building.id}
                                      className={
                                        OpenBuildingIDs.includes(building.id)
                                          ? "grid grid-cols-1 2xl:grid-cols-[360px_1fr] gap-3 items-start"
                                          : ""
                                      }
                                    >
                                      <BuildingsCard
                                        Building={building}
                                        Projects={Projects}
                                        IsHouseOpen={OpenBuildingIDs.includes(
                                          building.id,
                                        )}
                                        ToggleHouseShow={ToggleHouseShow}
                                        UpdateBuilding={UpdateBuilding}
                                        RemoveBuilding={RemoveBuilding}
                                      />

                                      {OpenBuildingIDs.includes(
                                        building.id,
                                      ) && (
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
                                          <h4 className="font-semibold text-slate-900">
                                            Houses
                                          </h4>
                                          <p className="text-sm text-slate-600">
                                            {building.name}
                                          </p>

                                          {buildingHouses.length === 0 ? (
                                            <p className="text-sm text-slate-600">
                                              No houses found for this building.
                                            </p>
                                          ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {buildingHouses.map((house) => (
                                                <HouseCard
                                                  key={house.id}
                                                  house={house}
                                                  Buildings={Buildings.filter(
                                                    (item) =>
                                                      item.project_id ===
                                                      project.id,
                                                  )}
                                                  UpdateHouse={UpdateHouse}
                                                  RemoveHouse={RemoveHouse}
                                                />
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <ProjectCard
                          IsBuildingOpen={false}
                          ToggleBuildingShow={ToggleBuildingShow}
                          project={project}
                          Countries={Countries}
                          RemoveProject={RemoveProject}
                          UpdateProject={UpdateProject}
                        />
                      )}
                    </div>
                  );
                })(),
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
