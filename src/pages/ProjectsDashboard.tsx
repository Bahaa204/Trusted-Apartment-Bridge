import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBuildings } from "../hooks/useBuildings";
import { useHouses } from "../hooks/useHouses";
import { useProjects } from "../hooks/useProjects";
import ProjectsDashBoardForm from "../components/Project DashBoard Components/ProjectsDashBoardForm";
import ProjectsDashBoardDisplay from "../components/Project DashBoard Components/ProjectsDashBoardDisplay";

export default function ProjectsDashboard() {
  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const {
    Projects,
    Loading: ProjectsLoading,
    Error: ProjectsError,
    AddProject,
  } = useProjects();

  const {
    Buildings,
    Loading: BuildingsLoading,
    Error: BuildingsError,
    AddBuilding,
  } = useBuildings();

  const {
    Houses,
    Loading: HousesLoading,
    Error: HousesError,
    AddHouse,
  } = useHouses();

  // combining all the loading and error states into 1 variable
  const loading =
    AuthLoading || ProjectsLoading || BuildingsLoading || HousesLoading;

  const error = AuthError || ProjectsError || BuildingsError || HousesError;

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
        Buildings={Buildings}
        Projects={Projects}
        loading={loading}
      />

      <ProjectsDashBoardDisplay
        Buildings={Buildings}
        Projects={Projects}
        Houses={Houses}
      />
    </>
  );
}
