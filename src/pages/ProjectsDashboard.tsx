import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBuildings } from "../hooks/useBuildings";
import { useHouses } from "../hooks/useHouses";
import { useProjects } from "../hooks/useProjects";
import ProjectsDashBoardForm from "../components/Project DashBoard Components/ProjectsDashBoardForm";
import ProjectsDashBoardDisplay from "../components/Project DashBoard Components/ProjectsDashBoardDisplay";
import useCountries from "../hooks/useCountries";

export default function ProjectsDashboard() {
  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

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
    return <div>{error}</div>;
  }

  // Waiting till everything loads
  if (loading) {
    return (
      <div>
        {AuthLoading ? "Checking Authentication " : "Loading Data"}. Please
        Wait...
      </div>
    );
  }

  // Preventing unauthenticated users from accessing the page
  if (!Session) {
    return <Navigate to="/login" />;
  }

  return (
    <>
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
    </>
  );
}
