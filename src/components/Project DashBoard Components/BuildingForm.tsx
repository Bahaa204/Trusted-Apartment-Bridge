import type { Project } from "../../types/types";

type BuildingData = {
  buildings_name: string;
  buildings_block: string;
  buildings_images: FileList | null;
  buildings_project_id: Project["id"];
};

type BuildingFormProps = BuildingData & {
  loading: boolean;
  updateFields: (fields: Partial<BuildingData>) => void;
  Options: Project[];
};

export default function BuildingForm({
  loading,
  buildings_name,
  buildings_block,
  buildings_project_id,
  updateFields,
  Options,
}: BuildingFormProps) {
  return (
    <div className="flex flex-wrap flex-col justify-center items-center gap-2.5">
      <div>
        <h2>Add a Building</h2>
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="name">Name: </label>
        <input
          type="text"
          id="name"
          className="border border-black rounded"
          required
          value={buildings_name}
          onChange={(event) =>
            updateFields({ buildings_name: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="block">Block</label>
        <input
          type="text"
          id="block"
          className="border border-black rounded disabled:cursor-not-allowed"
          required
          value={buildings_block}
          onChange={(event) =>
            updateFields({ buildings_block: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="images">Images</label>
        <input
          type="file"
          multiple
          id="images"
          className="border border-black rounded cursor-pointer disabled:cursor-not-allowed"
          required
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              updateFields({ buildings_images: event.target.files });
            }
          }}
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="select">Select a Project to add to the building</label>
        <select
          id="select"
          className="border border-black rounded cursor-pointer disabled:cursor-not-allowed"
          required
          value={buildings_project_id}
          onChange={(event) =>
            updateFields({ buildings_project_id: parseInt(event.target.value) })
          }
          disabled={loading}
        >
          {Options.map((options) => (
            <option value={options.id} key={options.id}>
              {options.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <button
          type="submit"
          className="border-2 border-black py-1 px-2 rounded cursor-pointer disabled:cursor-not-allowed"
          disabled={loading}
        >
          Add a Building
        </button>
      </div>
    </div>
  );
}
