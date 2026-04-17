import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBuildings } from "../hooks/useBuildings";
import { useHouses } from "../hooks/useHouses";
import { useProjects } from "../hooks/useProjects";
import ProjectsDashBoardForm from "../components/Project DashBoard Components/ProjectsDashBoardForm";
import ProjectsDashBoardDisplay from "../components/Project DashBoard Components/ProjectsDashBoardDisplay";
import useCountries from "../hooks/useCountries";
import type { Session } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";

export default function ProjectsDashboard() {
  const navigate = useNavigate();

  const {
    Session,
    Loading: AuthLoading,
    Error: AuthError,
    GetRoleFromEmail,
  } = useAuth();

  const {
    Countries,
    Loading: CountriesLoading,
    Error: CountriesError,
  } = useCountries();

  const {
    Projects,
    Loading: ProjectsLoading,
    Error: ProjectsError,
    AddProject,
    RemoveProject,
    UpdateProject,
  } = useProjects();

  const {
    Buildings,
    Loading: BuildingsLoading,
    Error: BuildingsError,
    AddBuilding,
    RemoveBuilding,
    UpdateBuilding,
  } = useBuildings();

  const {
    Houses,
    Loading: HousesLoading,
    Error: HousesError,
    AddHouse,
    RemoveHouse,
    UpdateHouse,
  } = useHouses();

  // combining all the loading and error states into 1 variable
  const loading =
    AuthLoading ||
    CountriesLoading ||
    ProjectsLoading ||
    BuildingsLoading ||
    HousesLoading;

  const error =
    AuthError ||
    CountriesError ||
    ProjectsError ||
    BuildingsError ||
    HousesError;

  // Checking for any errors
  if (error) {
    return (
      <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0f2f4f]">Error</CardTitle>
            <CardDescription className="text-[#24507f]">
              We could not load the support chat. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-[#173b67]">{error}</CardContent>
          <CardFooter>{new Date().toLocaleString()}</CardFooter>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardContent className="flex items-center justify-center gap-3 py-8 text-center text-[#173b67]">
            <Spinner className="size-5 text-[#173b67]" />
            <span>
              {AuthLoading ? "Checking Authentication" : "Loading Data"}...
            </span>
          </CardContent>
        </Card>
      </main>
    );
  }

  function checkAccess(Session: Session) {
    const role = GetRoleFromEmail(Session.user.email);
    return role === "admin" || role === "employee";
  }

  // Preventing unauthenticated or non-admin users from accessing the page
  if (!Session || !checkAccess(Session)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-[#10243e]">
          You must be logged in as an admin to access this page.
        </p>
        <Button
          variant="link"
          className="cursor-pointer text-lg"
          onClick={() => navigate("/login")}
        >
          Navigate to Login
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#e6e0d8] px-4 py-6 md:px-8 md:py-10">
      <Breadcrumbs />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ProjectsDashBoardForm
          AddBuilding={AddBuilding}
          AddHouse={AddHouse}
          AddProject={AddProject}
          Projects={Projects}
          Buildings={Buildings}
          loading={loading}
          Countries={Countries}
        />

        <ProjectsDashBoardDisplay
          Buildings={Buildings}
          Projects={Projects}
          Countries={Countries}
          Houses={Houses}
          UpdateProject={UpdateProject}
          RemoveProject={RemoveProject}
          UpdateBuilding={UpdateBuilding}
          RemoveBuilding={RemoveBuilding}
          RemoveHouse={RemoveHouse}
          UpdateHouse={UpdateHouse}
        />
      </section>
    </main>
  );
}
