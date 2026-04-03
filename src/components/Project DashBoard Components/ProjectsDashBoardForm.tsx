import { useState, type SubmitEvent } from "react";
import type { Building, FormData, House, Project } from "../../types/types";
import { useMultistepForm } from "../../hooks/useMultistepForm";
import ProjectForm from "../ProjectForm";
import BuildingForm from "../BuildingForm";
import HouseForm from "../HouseForm";
import { supabaseClient } from "../../lib/supabaseClient";

const InitialData: FormData = {
  project_name: "",
  project_description: "",
  project_location: "",
  project_images: null,
  project_starting_price: NaN,
  buildings_name: "",
  buildings_block: "",
  buildings_images: null,
  buildings_project_id: NaN,
  house_floor: NaN,
  house_nb_bedrooms: NaN,
  house_nb_bathrooms: NaN,
  house_building_id: NaN,
};

type ProjectsDashBoardFormProps = {
  Projects: Project[];
  Buildings: Building[];
  loading: boolean;
  AddProject: (new_project: Project) => Promise<boolean>;
  AddBuilding: (new_building: Building) => Promise<boolean>;
  AddHouse: (new_house: House) => Promise<boolean>;
};

export default function ProjectsDashBoardForm({
  loading,
  AddBuilding,
  AddHouse,
  AddProject,
  Buildings,
  Projects,
}: ProjectsDashBoardFormProps) {
  const [FormData, setFormData] = useState<FormData>(InitialData);

  const { CurrentStepIndex, steps, step, goTo, next } = useMultistepForm([
    <ProjectForm {...FormData} loading={loading} updateFields={updateFields} />,
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

  async function UploadImage(file: File): Promise<string | null> {
    const path = `${file.name} - ${crypto.randomUUID()}`;

    const { error: UploadError } = await supabaseClient.storage
      .from("projects_images")
      .upload(path, file);

    if (UploadError) {
      console.error("Error Uploading Image: ", UploadError.message);
      return null;
    }

    const { data } = supabaseClient.storage
      .from("projects_images")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const images_url: string[] = [];
    // 0 id for Projects, 1 is for buildings, 2 is for Houses
    switch (CurrentStepIndex) {
      // Projects
      case 0: {
        const images = FormData.project_images;
        if (images) {
          for (const file of images) {
            const url = await UploadImage(file);

            if (url) images_url.push(url);
          }
          const newProject: Project = {
            name: FormData.project_name,
            description: FormData.project_description,
            location: FormData.project_location,
            images_url: images_url,
            starting_price: FormData.project_starting_price,
            nb_visits: 0,
          };

          const ok = await AddProject(newProject);
          if (ok) return next();
        }

        break;
      }
      // Buildings
      case 1: {
        const images = FormData.project_images;
        if (images) {
          for (const file of images) {
            const url = await UploadImage(file);

            if (url) images_url.push(url);
          }
          const newBuilding: Building = {
            name: FormData.buildings_name,
            block: FormData.buildings_block,
            images_url: images_url,
            project_id: FormData.buildings_project_id,
          };

          const ok = await AddBuilding(newBuilding);
          if (ok) return next();
        }

        break;
      }

      // Houses
      case 2: {
        const newHouse: House = {
          floor: FormData.house_floor,
          nb_bedrooms: FormData.house_nb_bedrooms,
          nb_bathrooms: FormData.house_nb_bathrooms,
          building_id: FormData.house_building_id,
        };

        const ok = await AddHouse(newHouse);

        if (ok) return goTo(0);

        break;
      }

      default:
        break;
    }
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
