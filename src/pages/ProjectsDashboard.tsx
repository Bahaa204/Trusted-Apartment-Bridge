import { useState, type SubmitEvent } from "react";
import { useProjects } from "../hooks/useProjects";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import type { FormData } from "../types/types";
import { useMultistepForm } from "../hooks/useMultistepForm";
import ProjectForm from "../components/ProjectForm";
import BuildingForm from "../components/BuildingForm";
import HouseForm from "../components/HouseForm";
import { useBuildings } from "../hooks/useBuildings";
import { useHouses } from "../hooks/useHouses";

const InitialData: FormData = {
  project_name: "",
  project_description: "",
  project_location: "",
  project_images_url: [],
  project_starting_price: NaN,
  buildings_name: "",
  buildings_block: "",
  buildings_images_url: [],
  buildings_project_id: NaN,
  house_floor: NaN,
  house_nb_bedrooms: NaN,
  house_nb_bathrooms: NaN,
  house_building_id: NaN,
};

export default function ProjectsDashboard() {
  const [FormData, setFormData] = useState<FormData>(InitialData);

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const {
    Projects,
    Loading: ProjectsLoading,
    Error: ProjectsError,
  } = useProjects();

  const {
    Buildings,
    Loading: BuildingsLoading,
    Error: BuildingsError,
  } = useBuildings();

  const {
    // Houses,
    Loading: HousesLoading,
    Error: HousesError,
  } = useHouses();

  // combining all the loading and error states into 1 variable
  const loading =
    AuthLoading || ProjectsLoading || BuildingsLoading || HousesLoading;

  const error = AuthError || ProjectsError || BuildingsError || HousesError;

  const { CurrentStepIndex, steps, step, goTo, isLastStep, next } =
    useMultistepForm([
      <ProjectForm
        {...FormData}
        loading={loading}
        updateFields={updateFields}
      />,
      <BuildingForm
        {...FormData}
        loading={loading}
        updateFields={updateFields}
        Options={Projects}
      />,
      <HouseForm
        {...FormData}
        loading={loading}
        updateFields={updateFields}
        Options={Buildings}
      />,
    ]);

  function updateFields(fields: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...fields }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) return next();
    alert("Form Submitted");
  }

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
      <h1>Projects Dashboard</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap flex-col justify-center items-center gap-2.5"
      >
        <div>
          {CurrentStepIndex + 1} / {steps.length}
        </div>

        {step}

        {/* <div className="flex flex-wrap justify-center items-center gap-2.5">
          {!isFirstStep && (
            <button
              type="button"
              onClick={back}
              className="border-2 border-black py-1 px-2 rounded cursor-pointer disabled:cursor-not-allowed"
              disabled={loading}
            >
              Back
            </button>
          )}
          {!isLastStep && (
            <button
              type="button"
              onClick={next}
              className="border-2 border-black py-1 px-2 rounded cursor-pointer disabled:cursor-not-allowed"
              disabled={loading}
            >
              Next
            </button>
          )}
        </div> */}
      </form>

      <div className="mt-2 flex flex-wrap justify-center items-center gap-1">
        <p>Already existing Projects or Buildings? </p>
        <button
          type="button"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
          onClick={() => {
            goTo(0);
          }}
          disabled={loading}
        >
          Add a Project
        </button>
        <p className="font-medium text-indigo-400">or</p>
        <button
          type="button"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
          onClick={() => {
            goTo(1);
          }}
          disabled={loading}
        >
          Add a Building
        </button>
        <p className="font-medium text-indigo-400">or</p>
        <button
          type="button"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
          onClick={() => {
            goTo(2);
          }}
          disabled={loading}
        >
          Add a House
        </button>
      </div>
    </>
  );
}
