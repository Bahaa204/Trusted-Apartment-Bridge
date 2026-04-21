import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
  const [OpenProjectIDs, setOpenProjectIDs] = useState<Project["id"][]>([]);
  const [OpenBuildingIDs, setOpenBuildingIDs] = useState<Building["id"][]>([]);

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
      prev.filter((id) => !projectBuildingIDs.includes(id!)),
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
    <Card className="flex flex-col flex-wrap justify-center items-center gap-5 border border-slate-200 bg-white text-slate-900 shadow-lg">
      <CardHeader className="w-full! p-2.5">
        <CardTitle className="pt-2 text-center text-2xl text-slate-900 md:text-3xl">
          Projects Display
        </CardTitle>
        <CardDescription className="text-center text-base text-slate-600 md:text-lg">
          Here you can view, edit, and delete all projects, buildings, and
          houses.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center items-center gap-4 w-full pb-5">
        {Projects.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
            We currently have no projects.
          </div>
        ) : (
          <>
            {Projects.map((project) =>
              (() => {
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
                      <div className="grid grid-cols-1 xl:grid-cols-[repeat(3,360px)] gap-2 items-start">
                        <ProjectCard
                          IsBuildingOpen={true}
                          ToggleBuildingShow={ToggleBuildingShow}
                          project={project}
                          Countries={Countries}
                          RemoveProject={RemoveProject}
                          UpdateProject={UpdateProject}
                        />

                        <Card className="rounded-lg border border-slate-200 bg-white p-3 space-y-3 col-span-2">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-slate-900">
                              Buildings
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-600">
                              {project.name}
                            </CardDescription>
                          </CardHeader>

                          <CardContent>
                            <Card className="ring-0! bg-transparent">
                              {Buildings.filter(
                                (building) =>
                                  building.project_id === project.id,
                              ).length === 0 ? (
                                <CardContent>
                                  <p className="text-sm text-slate-600">
                                    No buildings found for this project.
                                  </p>
                                </CardContent>
                              ) : (
                                <CardContent className="flex gap-5 justify-center items-start pb-5">
                                  {Buildings.filter(
                                    (building) =>
                                      building.project_id === project.id,
                                  ).map((building) => {
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
                                          <Card
                                            className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3"
                                          >
                                            <CardHeader>
                                              <CardTitle className="font-semibold text-slate-900">
                                                Houses
                                              </CardTitle>
                                              <CardHeader className="text-sm text-slate-600">
                                                {building.name}
                                              </CardHeader>
                                            </CardHeader>
                                            <CardContent>
                                              {buildingHouses.length === 0 ? (
                                                <p className="text-sm text-slate-600">
                                                  No houses found for this
                                                  building.
                                                </p>
                                              ) : (
                                                <Card className="flex flex-wrap gap-5 bg-transparent ring-0!">
                                                  {buildingHouses.map(
                                                    (house) => (
                                                      <HouseCard
                                                        key={house.id}
                                                        house={house}
                                                        Buildings={Buildings.filter(
                                                          (item) =>
                                                            item.project_id ===
                                                            project.id,
                                                        )}
                                                        UpdateHouse={
                                                          UpdateHouse
                                                        }
                                                        RemoveHouse={
                                                          RemoveHouse
                                                        }
                                                      />
                                                    ),
                                                  )}
                                                </Card>
                                              )}
                                            </CardContent>
                                          </Card>
                                        )}
                                      </div>
                                    );
                                  })}
                                </CardContent>
                              )}
                            </Card>
                          </CardContent>
                        </Card>
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
  );
}
