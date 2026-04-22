import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import BuildingsTable from "./BuildingsTable";
import HousesTable from "./HousesTable";
import ProjectsTable from "./ProjectsTable";
import type {
  DisplayMode,
  ProjectsDashBoardDisplayProps,
} from "@/types/projects";
import { Button } from "../ui/button";

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
  const [Mode, setMode] = useState<DisplayMode>("projects");

  return (
    <Card className="flex w-full flex-col justify-center items-stretch gap-5 border border-slate-200 bg-white text-slate-900 shadow-lg">
      <CardHeader className="w-full! p-2.5">
        <CardTitle className="pt-2 text-center text-2xl text-slate-900 md:text-3xl">
          Projects Display
        </CardTitle>
        <CardDescription className="text-center text-base text-slate-600 md:text-lg">
          Here you can view, edit, and delete all projects, buildings, and
          houses.
        </CardDescription>
        <div className="flex flex-col justify-center items-center gap-2">
          <CardTitle>Switch Display</CardTitle>
          <div className="flex gap-2">
            <Button
              className="cursor-pointer bg-[#24507f] text-white"
              onClick={() => setMode("projects")}
            >
              Projects
            </Button>
            <Button
              className="cursor-pointer bg-[#24507f] text-white"
              onClick={() => setMode("buildings")}
            >
              Buildings
            </Button>
            <Button
              className="cursor-pointer bg-[#24507f] text-white"
              onClick={() => setMode("houses")}
            >
              Houses
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="w-full overflow-x-auto no-scrollbar">
        {Mode === "projects" && (
          <ProjectsTable
            projects={Projects}
            countries={Countries}
            RemoveProject={RemoveProject}
            EditProject={UpdateProject}
          />
        )}
        {Mode === "buildings" && (
          <BuildingsTable
            buildings={Buildings}
            projects={Projects}
            RemoveBuilding={RemoveBuilding}
            EditBuilding={UpdateBuilding}
          />
        )}
        {Mode === "houses" && (
          <HousesTable
            houses={Houses}
            buildings={Buildings}
            RemoveHouse={RemoveHouse}
            EditHouse={UpdateHouse}
          />
        )}
      </CardContent>
    </Card>
  );
}
